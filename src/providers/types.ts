/**
 * Provider 抽象：把「从麦克风到文本」的整个过程交给各 provider 自己实现。
 *
 * 为什么这样抽象：不同 ASR 的输入形态根本不同——
 *  - 小米这类 HTTP ASR：需要先录一整段音频（WAV），再整体上传识别；
 *  - 浏览器 Web Speech：浏览器自己边听边识别，根本不产出音频文件。
 * 若把接口设计成「都接收 WAV」，Web Speech 无法适配。因此接口以「会话」为中心：
 * 插件只负责 start / stop，provider 负责在这两者之间完成识别并返回最终文本。
 *
 * 一期只覆盖「整段」语义（stop 时给最终文本）。流式（如火山 WebSocket，边说边出字）
 * 需要 onPartial 增量回调 + 思源 wsProxy，属于后续扩展，见下方 TODO。
 */

export type ProviderFieldType = "text" | "password" | "select"

/** 描述 provider 的一个配置项，供设置面板自动渲染。 */
export type ProviderField = {
  key: string
  /** i18n key，用于 title 文案 */
  labelKey: string
  /** i18n key，用于描述文案（可选） */
  descKey?: string
  type: ProviderFieldType
  placeholder?: string
  /** type 为 select 时的可选项，label 走 i18n key */
  options?: Array<{ value: string; labelKey: string }>
  default?: string
}

/** 一次识别会话：从 start() 后开始采集，stop() 返回最终文本。 */
export type RecognitionSession = {
  /** 停止采集并返回最终识别文本（可能为空字符串，表示没识别到内容）。 */
  stop: () => Promise<string>
  /** 放弃本次会话并释放资源（麦克风、连接等），不产出结果。 */
  abort: () => void
}

/** provider 运行时拿到的配置（来自设置面板存的值）。 */
export type ProviderConfig = Record<string, string>

export type VoiceProvider = {
  /** 唯一 id，用于注册表与配置存储。 */
  id: string
  /** 展示名的 i18n key。 */
  displayNameKey: string
  /** 该 provider 需要的配置项，供设置面板渲染与校验。 */
  fields: ProviderField[]
  /**
   * 校验配置是否可用。返回 i18n key 表示错误原因；返回 undefined 表示通过。
   */
  validate: (config: ProviderConfig) => string | undefined
  /**
   * 开启一次识别会话。这里应完成麦克风获取等准备工作；
   * 若失败（如无麦克风权限）应抛错。
   */
  createSession: (config: ProviderConfig) => Promise<RecognitionSession>
}

// TODO(streaming): 流式 provider（如火山引擎 WebSocket，边说边出字）需要：
//  1) 在 RecognitionSession 增加 onPartial 增量回调；
//  2) 通过思源 wsProxy 代理 wss 连接（forwardProxy 只代理一次性 HTTP）；
//  3) 处理其二进制分帧协议与 header 鉴权。
// 一期不实现，仅保留接口演进空间。
