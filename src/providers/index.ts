import type { VoiceProvider } from "./types"
import { mimoProvider } from "./mimo"
import { webSpeechProvider } from "./webspeech"

/** 内置 provider 注册表。新增 HTTP 类 provider 只需在此登记一个实现。 */
const providers: VoiceProvider[] = [mimoProvider, webSpeechProvider]

/** 默认 provider（首个内置）。 */
export const DEFAULT_PROVIDER_ID = mimoProvider.id

export function listProviders(): VoiceProvider[] {
  return providers
}

export function getProvider(id: string): VoiceProvider | undefined {
  return providers.find((p) => p.id === id)
}
