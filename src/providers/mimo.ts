/**
 * 小米 MiMo ASR provider（HTTP 整段识别）。
 *
 * 会话流程：start() 开始录音 → stop() 把整段 WAV 通过思源 forwardProxy 上传识别。
 *
 * 关键坑（已对 kernel network.go 源码核实并真机验证）：
 *  - forwardProxy 的 headers 必须是「对象数组」[{ "api-key": key }]，传成普通对象会被静默丢弃 → 401。
 *  - payload 传对象走默认 json 路径；不要用 payloadEncoding:"text"（该分支不设 body）。
 *  - 代理本身成功返回 code:0，小米的 HTTP 错误在 data.status 里，必须单独校验。
 */

import { fetchSyncPost } from "siyuan"
import { startRecording } from "../recorder"
import type { ProviderConfig, RecognitionSession, VoiceProvider } from "./types"

const ENDPOINT = "https://api.xiaomimimo.com/v1/chat/completions"
const MODEL = "mimo-v2.5-asr"
const REQUEST_TIMEOUT_MS = 60000

function normalizeLanguage(value: string): "auto" | "zh" | "en" {
  const v = (value || "").trim().toLowerCase()
  if (v.startsWith("zh")) return "zh"
  if (v.startsWith("en")) return "en"
  return "auto"
}

function extractText(body: any): string {
  const content = body?.choices?.[0]?.message?.content
  if (typeof content === "string") return content.trim()
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : typeof item?.text === "string" ? item.text : ""))
      .join("")
      .trim()
  }
  if (typeof body?.text === "string") return body.text.trim()
  return ""
}

function extractError(body: any): string {
  const candidates = [body?.error?.message, body?.error, body?.message, body?.detail]
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim()
  }
  return ""
}

async function transcribe(wavBase64: string, apiKey: string, language: string): Promise<string> {
  const payload = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: [{ type: "input_audio", input_audio: { data: `data:audio/wav;base64,${wavBase64}` } }],
      },
    ],
    asr_options: { language: normalizeLanguage(language) },
  }

  const res = await fetchSyncPost("/api/network/forwardProxy", {
    url: ENDPOINT,
    method: "POST",
    timeout: REQUEST_TIMEOUT_MS,
    contentType: "application/json",
    headers: [{ "api-key": apiKey }],
    payload,
  })

  if (!res || res.code !== 0) {
    throw new Error(`转发代理失败：${res?.msg || "未知错误"}`)
  }

  const status = res.data?.status
  const rawBody = res.data?.body
  if (status !== 200) {
    let detail = ""
    try {
      detail = extractError(JSON.parse(rawBody))
    } catch {
      detail = typeof rawBody === "string" ? rawBody.slice(0, 200) : ""
    }
    throw new Error(`小米 ASR 返回 HTTP ${status}${detail ? "：" + detail : ""}`)
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    throw new Error(`无法解析小米 ASR 响应：${String(rawBody).slice(0, 200)}`)
  }

  return extractText(body)
}

export const mimoProvider: VoiceProvider = {
  id: "mimo",
  displayNameKey: "providerMimo",
  fields: [
    { key: "apiKey", labelKey: "mimoApiKey", descKey: "mimoApiKeyDesc", type: "password", placeholder: "api-key" },
    {
      key: "language",
      labelKey: "mimoLanguage",
      descKey: "mimoLanguageDesc",
      type: "select",
      default: "auto",
      options: [
        { value: "auto", labelKey: "langAuto" },
        { value: "zh", labelKey: "langZh" },
        { value: "en", labelKey: "langEn" },
      ],
    },
  ],
  validate(config: ProviderConfig) {
    if (!config.apiKey || !config.apiKey.trim()) return "errMimoNoApiKey"
    return undefined
  },
  async createSession(config: ProviderConfig): Promise<RecognitionSession> {
    const apiKey = (config.apiKey || "").trim()
    const language = config.language || "auto"
    const recorder = await startRecording()

    return {
      async stop() {
        const wavBase64 = await recorder.stop()
        if (!wavBase64) return ""
        return transcribe(wavBase64, apiKey, language)
      },
      abort() {
        recorder.abort()
      },
    }
  },
}
