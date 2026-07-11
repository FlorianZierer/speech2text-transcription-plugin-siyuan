/**
 * 浏览器录音 → 16kHz/16bit/单声道 WAV → base64。
 *
 * 为什么不用 MediaRecorder：它在 Chrome 上产出 webm/opus，无法强制 PCM/WAV，
 * 而小米 MiMo ASR 只接受 wav/mp3。所以走 Web Audio API 抓原始 Float32 PCM，自己封 WAV 头。
 */

const TARGET_SAMPLE_RATE = 16000
const MAX_BASE64_CHARS = 10 * 1024 * 1024 // 小米限制：base64 后 ≤ 10MB

export type RecorderHandle = {
  /** 停止录音，返回纯 base64 的 WAV（不含 data: 前缀）。空录音返回 ""。 */
  stop: () => Promise<string>
  /** 放弃录音并释放麦克风，不产出结果。 */
  abort: () => void
}

function flattenChunks(chunks: Float32Array[]): Float32Array {
  let length = 0
  for (const c of chunks) length += c.length
  const out = new Float32Array(length)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

/** 把采集到的 Float32 PCM 封装成 16bit 单声道 WAV。 */
function encodeWav(pcm: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + pcm.length * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + pcm.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byteRate = rate * channels * bytesPerSample
  view.setUint16(32, 2, true) // blockAlign = channels * bytesPerSample
  view.setUint16(34, 16, true) // bitsPerSample
  writeString(36, "data")
  view.setUint32(40, pcm.length * 2, true)

  let p = 44
  for (let i = 0; i < pcm.length; i++, p += 2) {
    const s = Math.max(-1, Math.min(1, pcm[i]))
    view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([view], { type: "audio/wav" })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result 形如 "data:audio/wav;base64,XXXX"，取逗号后的纯 base64
      const comma = result.indexOf(",")
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error || new Error("读取音频失败"))
    reader.readAsDataURL(blob)
  })
}

/**
 * 开始整段录音。返回一个句柄，调用 stop() 结束并拿到 base64 WAV。
 * 若浏览器不支持麦克风或用户拒绝授权，会 reject。
 */
export async function startRecording(): Promise<RecorderHandle> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("当前环境不支持麦克风（需要 HTTPS 或 localhost）。")
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
    },
  })

  // 用 16kHz 的 AudioContext，让浏览器直接重采样到目标采样率，省去手写重采样。
  const AudioCtx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext
  const audioCtx = new AudioCtx({ sampleRate: TARGET_SAMPLE_RATE })
  const source = audioCtx.createMediaStreamSource(stream)
  const processor = audioCtx.createScriptProcessor(4096, 1, 1)

  const chunks: Float32Array[] = []
  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0)
    // 必须拷贝：底层 buffer 会被复用。
    chunks.push(new Float32Array(input))
  }

  source.connect(processor)
  processor.connect(audioCtx.destination)

  let released = false
  const release = () => {
    if (released) return
    released = true
    try {
      processor.disconnect()
      source.disconnect()
    } catch {
      /* ignore */
    }
    stream.getTracks().forEach((t) => t.stop())
    void audioCtx.close().catch((): void => undefined)
  }

  return {
    async stop() {
      processor.onaudioprocess = null
      const sampleRate = audioCtx.sampleRate || TARGET_SAMPLE_RATE
      release()

      const pcm = flattenChunks(chunks)
      chunks.length = 0
      if (pcm.length === 0) return ""

      const wav = encodeWav(pcm, sampleRate)
      const base64 = await blobToBase64(wav)
      if (base64.length > MAX_BASE64_CHARS) {
        throw new Error("录音过长，小米 ASR 单次最多约 10MB（请缩短录音时长）。")
      }
      return base64
    },
    abort() {
      processor.onaudioprocess = null
      chunks.length = 0
      release()
    },
  }
}
