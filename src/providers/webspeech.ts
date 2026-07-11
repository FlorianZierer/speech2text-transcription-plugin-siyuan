/**
 * 浏览器 Web Speech API provider（免费、零后端）。
 *
 * 用浏览器自带的 webkitSpeechRecognition 识别，无需 api-key、不经思源代理。
 * 与小米不同：它不产出音频文件，而是浏览器边听边给出识别结果；本插件按「整段」
 * 语义使用——start() 起识别、累积最终结果，stop() 返回累积文本。
 *
 * 限制：Chrome 系底层走 Google 服务，需联网；中文准确率与稳定性一般；部分环境不可用。
 */

import type { ProviderConfig, RecognitionSession, VoiceProvider } from "./types"

function getRecognitionCtor(): any {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
}

function toBcp47(language: string): string {
  const v = (language || "").trim().toLowerCase()
  if (!v || v === "auto") return "zh-CN"
  if (v.startsWith("zh")) return "zh-CN"
  if (v.startsWith("en")) return "en-US"
  return language
}

export const webSpeechProvider: VoiceProvider = {
  id: "webspeech",
  displayNameKey: "providerWebSpeech",
  fields: [
    {
      key: "language",
      labelKey: "webspeechLanguage",
      descKey: "webspeechLanguageDesc",
      type: "select",
      default: "zh-CN",
      options: [
        { value: "zh-CN", labelKey: "langZh" },
        { value: "en-US", labelKey: "langEn" },
      ],
    },
  ],
  validate() {
    if (!getRecognitionCtor()) return "errWebSpeechUnsupported"
    return undefined
  },
  async createSession(config: ProviderConfig): Promise<RecognitionSession> {
    const Ctor = getRecognitionCtor()
    if (!Ctor) throw new Error("errWebSpeechUnsupported")

    const recognition = new Ctor()
    recognition.lang = toBcp47(config.language || "zh-CN")
    recognition.continuous = true
    recognition.interimResults = false

    let finalText = ""
    let fatalError: string | undefined

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        }
      }
    }
    recognition.onerror = (event: any) => {
      // no-speech / aborted 属于正常收尾，不当致命错误
      if (event.error && event.error !== "no-speech" && event.error !== "aborted") {
        fatalError = String(event.error)
      }
    }

    recognition.start()

    const waitForEnd = () =>
      new Promise<void>((resolve) => {
        recognition.onend = () => resolve()
      })

    return {
      async stop() {
        const ended = waitForEnd()
        try {
          recognition.stop()
        } catch {
          /* ignore */
        }
        await ended
        if (fatalError) throw new Error(`Web Speech 识别失败：${fatalError}`)
        return finalText.trim()
      },
      abort() {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        try {
          recognition.abort()
        } catch {
          /* ignore */
        }
      },
    }
  },
}
