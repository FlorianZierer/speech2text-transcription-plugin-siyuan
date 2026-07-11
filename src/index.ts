import { Plugin, Setting, showMessage, getAllEditor } from "siyuan"
import { listProviders, getProvider, DEFAULT_PROVIDER_ID } from "./providers"
import type { ProviderConfig, RecognitionSession, VoiceProvider } from "./providers/types"
import "./index.scss"

const STORAGE_NAME = "config.json"
const ICON_ID = "iconVoice2Text"

type PluginConfig = {
  /** 当前选用的 provider id */
  provider: string
  /** 各 provider 的配置：cfg[providerId][fieldKey] = value */
  cfg: Record<string, ProviderConfig>
}

type Phase = "idle" | "recording" | "transcribing"

export default class Voice2TextPlugin extends Plugin {
  private config: PluginConfig = { provider: DEFAULT_PROVIDER_ID, cfg: {} }
  private phase: Phase = "idle"
  private session: RecognitionSession | undefined
  private topBarElement: HTMLElement | undefined
  private currentProtyle: any = null

  private trackProtyle = ({ detail }: any) => {
    if (detail?.protyle) this.currentProtyle = detail.protyle
  }

  onload() {
    this.addIcons(`<symbol id="${ICON_ID}" viewBox="0 0 1024 1024">
<path d="M512 640c70.7 0 128-57.3 128-128V256c0-70.7-57.3-128-128-128s-128 57.3-128 128v256c0 70.7 57.3 128 128 128z m288-128c0 141.4-104.6 258.3-240 277.6V960h-96v-98.4C328.6 842.3 224 725.4 224 584h64c0 123.7 100.3 224 224 224s224-100.3 224-224h64z" fill="currentColor"/>
</symbol>`)

    this.setupSetting()

    this.eventBus.on("switch-protyle", this.trackProtyle)
    this.eventBus.on("loaded-protyle-static", this.trackProtyle)

    void this.loadData(STORAGE_NAME).then((data) => {
      if (data && typeof data === "object") {
        this.config = {
          provider: typeof data.provider === "string" ? data.provider : DEFAULT_PROVIDER_ID,
          cfg: data.cfg && typeof data.cfg === "object" ? data.cfg : {},
        }
      }
    })
  }

  onLayoutReady() {
    this.topBarElement = this.addTopBar({
      icon: ICON_ID,
      title: this.i18n.topBarTitle,
      position: "right",
      callback: () => this.onToggle(),
    })
    this.topBarElement.classList.add("plugin-voice2text-topbar")
  }

  onunload() {
    this.eventBus.off("switch-protyle", this.trackProtyle)
    this.eventBus.off("loaded-protyle-static", this.trackProtyle)
    this.session?.abort()
    this.session = undefined
  }

  private t(key: string): string {
    return (this.i18n as any)[key] || key
  }

  private cfgOf(providerId: string): ProviderConfig {
    return this.config.cfg[providerId] || {}
  }

  private setupSetting() {
    // 记录所有输入控件，confirm 时统一回收。
    const providerSelect = document.createElement("select")
    const fieldInputs: Array<{ providerId: string; key: string; el: HTMLInputElement | HTMLSelectElement }> = []

    this.setting = new Setting({
      confirmCallback: () => {
        const nextCfg: Record<string, ProviderConfig> = {}
        for (const { providerId, key, el } of fieldInputs) {
          if (!nextCfg[providerId]) nextCfg[providerId] = {}
          nextCfg[providerId][key] = el.value.trim()
        }
        this.config = { provider: providerSelect.value || DEFAULT_PROVIDER_ID, cfg: nextCfg }
        void this.saveData(STORAGE_NAME, this.config)
      },
    })

    // 1) provider 选择器
    this.setting.addItem({
      title: this.t("settingProvider"),
      description: this.t("settingProviderDesc"),
      direction: "row",
      createActionElement: () => {
        providerSelect.className = "b3-select fn__flex-center fn__size200"
        providerSelect.innerHTML = ""
        for (const p of listProviders()) {
          const opt = document.createElement("option")
          opt.value = p.id
          opt.textContent = this.t(p.displayNameKey)
          providerSelect.appendChild(opt)
        }
        providerSelect.value = this.config.provider || DEFAULT_PROVIDER_ID
        return providerSelect
      },
    })

    // 2) 每个 provider 的配置项（标题带 provider 名前缀，清楚区分）
    for (const provider of listProviders()) {
      const saved = this.cfgOf(provider.id)
      for (const field of provider.fields) {
        this.setting.addItem({
          title: `${this.t(provider.displayNameKey)} · ${this.t(field.labelKey)}`,
          description: field.descKey ? this.t(field.descKey) : "",
          direction: "row",
          createActionElement: () => {
            const initial = saved[field.key] ?? field.default ?? ""
            if (field.type === "select") {
              const sel = document.createElement("select")
              sel.className = "b3-select fn__flex-center fn__size200"
              for (const opt of field.options || []) {
                const o = document.createElement("option")
                o.value = opt.value
                o.textContent = this.t(opt.labelKey)
                sel.appendChild(o)
              }
              sel.value = initial
              fieldInputs.push({ providerId: provider.id, key: field.key, el: sel })
              return sel
            }
            const input = document.createElement("input")
            input.type = field.type === "password" ? "password" : "text"
            input.className = "b3-text-field fn__flex-center fn__size200"
            if (field.placeholder) input.placeholder = field.placeholder
            input.value = initial
            fieldInputs.push({ providerId: provider.id, key: field.key, el: input })
            return input
          },
        })
      }
    }
  }

  private setPhase(phase: Phase) {
    this.phase = phase
    const el = this.topBarElement
    if (!el) return
    el.classList.toggle("is-recording", phase === "recording")
    el.classList.toggle("is-transcribing", phase === "transcribing")
  }

  private onToggle() {
    if (this.phase === "transcribing") {
      showMessage(this.t("stillTranscribing"), 2000, "info")
      return
    }
    if (this.phase === "recording") {
      void this.stopAndTranscribe()
      return
    }
    void this.startRecording()
  }

  private async startRecording() {
    const provider = getProvider(this.config.provider)
    if (!provider) {
      showMessage(this.t("errNoProvider"), 4000, "error")
      return
    }

    const configError = provider.validate(this.cfgOf(provider.id))
    if (configError) {
      showMessage(this.t(configError), 4000, "error")
      try {
        this.openSetting()
      } catch {
        /* ignore */
      }
      return
    }

    try {
      this.session = await provider.createSession(this.cfgOf(provider.id))
      this.setPhase("recording")
      showMessage(this.t("recording"), 3000, "info")
    } catch (error) {
      this.setPhase("idle")
      this.session = undefined
      showMessage(this.providerError(provider, error), 5000, "error")
    }
  }

  private async stopAndTranscribe() {
    const session = this.session
    this.session = undefined
    if (!session) {
      this.setPhase("idle")
      return
    }

    const provider = getProvider(this.config.provider)
    this.setPhase("transcribing")
    showMessage(this.t("transcribing"), 2000, "info")

    try {
      const text = await session.stop()
      if (!text) {
        showMessage(this.t("noAudio"), 3000, "info")
        this.setPhase("idle")
        return
      }
      const ok = this.insertText(text)
      this.setPhase("idle")
      if (!ok) showMessage(this.t("noEditor"), 4000, "error")
    } catch (error) {
      this.setPhase("idle")
      showMessage(this.providerError(provider, error), 6000, "error")
    }
  }

  /** 把文字插入当前编辑器光标处。返回是否成功。 */
  private insertText(text: string): boolean {
    let editor: any = null
    if (this.currentProtyle && typeof this.currentProtyle.getInstance === "function") {
      editor = this.currentProtyle.getInstance()
    }
    if (!editor) {
      const all = getAllEditor()
      if (all && all.length > 0) editor = all[0]
    }
    if (!editor || typeof editor.insert !== "function") return false
    editor.insert(text, false, true)
    return true
  }

  /** provider 抛出的错误可能是 i18n key，也可能是已成句的错误消息。 */
  private providerError(provider: VoiceProvider | undefined, error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error)
    const translated = (this.i18n as any)[msg]
    return translated || msg
  }
}
