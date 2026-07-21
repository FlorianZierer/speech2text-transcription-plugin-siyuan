import { Plugin, Setting, showMessage, getAllEditor, fetchSyncPost, getFrontend } from "siyuan"
import { listProviders, getProvider, DEFAULT_PROVIDER_ID } from "./providers"
import type { ProviderConfig, RecognitionSession, VoiceProvider } from "./providers/types"
import "./index.scss"

const STORAGE_NAME = "config.json"
const LEGACY_PLUGIN_NAME = "plugin-voice2text"
const ICON_ID = "iconVoice2Text"
const DISABLED_FRONTENDS = new Set(["mobile", "browser-mobile"])

type PluginConfig = {
  /** 当前选用的 provider id */
  provider: string
  /** 各 provider 的配置：cfg[providerId][fieldKey] = value */
  cfg: Record<string, ProviderConfig>
}

type Phase = "idle" | "recording" | "transcribing"

type InsertTarget = {
  editor: any
  range?: Range
}

export default class Voice2TextPlugin extends Plugin {
  private config: PluginConfig = { provider: DEFAULT_PROVIDER_ID, cfg: {} }
  private phase: Phase = "idle"
  private session: RecognitionSession | undefined
  private topBarElement: HTMLElement | undefined
  private currentProtyle: any = null
  private insertTarget: InsertTarget | undefined
  private configReady: Promise<void> = Promise.resolve()
  private disabledOnFrontend = false

  private trackProtyle = ({ detail }: any) => {
    if (detail?.protyle) this.currentProtyle = detail.protyle
  }

  private rememberInsertTarget = () => {
    const target = this.captureInsertTarget()
    if (target?.range || !this.insertTarget) this.insertTarget = target
  }

  private isDisabledFrontend(): boolean {
    return DISABLED_FRONTENDS.has(getFrontend())
  }

  onload() {
    if (this.isDisabledFrontend()) {
      this.disabledOnFrontend = true
      showMessage(this.t("errMobileUnsupported"), 5000, "error")
      return
    }

    this.addIcons(`<symbol id="${ICON_ID}" viewBox="0 0 1024 1024">
<path d="M512 640c70.7 0 128-57.3 128-128V256c0-70.7-57.3-128-128-128s-128 57.3-128 128v256c0 70.7 57.3 128 128 128z m288-128c0 141.4-104.6 258.3-240 277.6V960h-96v-98.4C328.6 842.3 224 725.4 224 584h64c0 123.7 100.3 224 224 224s224-100.3 224-224h64z" fill="currentColor"/>
</symbol>`)

    this.setupSetting()

    this.eventBus.on("switch-protyle", this.trackProtyle)
    this.eventBus.on("loaded-protyle-static", this.trackProtyle)

    this.configReady = this.loadConfig()
  }

  onLayoutReady() {
    if (this.disabledOnFrontend) return
    this.topBarElement = this.addTopBar({
      icon: ICON_ID,
      title: this.i18n.topBarTitle,
      position: "right",
      callback: () => this.onToggle(),
    })
    this.topBarElement.classList.add("plugin-voice2text-topbar")
    this.topBarElement.addEventListener("pointerdown", this.rememberInsertTarget, true)
  }

  onunload() {
    this.topBarElement?.removeEventListener("pointerdown", this.rememberInsertTarget, true)
    if (this.disabledOnFrontend) return
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

  private normalizeConfig(data: unknown): PluginConfig | undefined {
    if (!data || typeof data !== "object") return undefined
    const raw = data as Record<string, unknown>
    return {
      provider: typeof raw.provider === "string" ? raw.provider : DEFAULT_PROVIDER_ID,
      cfg: raw.cfg && typeof raw.cfg === "object" ? raw.cfg as Record<string, ProviderConfig> : {},
    }
  }

  private hasUserConfig(config: PluginConfig | undefined): boolean {
    if (!config) return false
    if (config.provider && config.provider !== DEFAULT_PROVIDER_ID) return true
    return listProviders().some((provider) => {
      const providerCfg = config.cfg[provider.id] || {}
      return provider.fields.some((field) => {
        const value = providerCfg[field.key]
        return typeof value === "string" && value.trim() !== "" && value !== (field.default || "")
      })
    })
  }

  private hasUsableConfig(config: PluginConfig | undefined): boolean {
    if (!config) return false
    const provider = getProvider(config.provider)
    return !!provider && !provider.validate(config.cfg[provider.id] || {})
  }

  private async loadLegacyConfig(): Promise<PluginConfig | undefined> {
    if (this.name === LEGACY_PLUGIN_NAME) return undefined
    try {
      const data = await fetchSyncPost("/api/file/getFile", {
        path: `/data/storage/petal/${LEGACY_PLUGIN_NAME}/${STORAGE_NAME}`,
      })
      return this.normalizeConfig(data)
    } catch {
      return undefined
    }
  }

  private async loadConfig() {
    const currentConfig = this.normalizeConfig(await this.loadData(STORAGE_NAME))
    if (this.hasUserConfig(currentConfig)) {
      this.config = currentConfig
      return
    }

    const legacyConfig = await this.loadLegacyConfig()
    if (this.hasUserConfig(legacyConfig) && this.hasUsableConfig(legacyConfig)) {
      this.config = legacyConfig
      void this.saveData(STORAGE_NAME, legacyConfig).catch(() => undefined)
      return
    }

    if (currentConfig) this.config = currentConfig
  }

  openSetting() {
    if (this.disabledOnFrontend) {
      showMessage(this.t("errMobileUnsupported"), 5000, "error")
      return
    }
    void this.openSettingAfterConfigReady()
  }

  private async openSettingAfterConfigReady() {
    await this.configReady
    super.openSetting()
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
        fieldInputs.length = 0
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
      for (const field of provider.fields) {
        this.setting.addItem({
          title: `${this.t(provider.displayNameKey)} · ${this.t(field.labelKey)}`,
          description: field.descKey ? this.t(field.descKey) : "",
          direction: "row",
          createActionElement: () => {
            const saved = this.cfgOf(provider.id)
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
    if (this.disabledOnFrontend) {
      showMessage(this.t("errMobileUnsupported"), 5000, "error")
      return
    }
    if (this.phase === "transcribing") {
      showMessage(this.t("stillTranscribing"), 2000, "info")
      return
    }
    if (this.phase === "recording") {
      void this.stopAndTranscribe()
      return
    }
    this.rememberInsertTarget()
    void this.startRecording()
  }

  private async startRecording() {
    if (this.disabledOnFrontend) {
      showMessage(this.t("errMobileUnsupported"), 5000, "error")
      return
    }
    await this.configReady
    this.rememberInsertTarget()

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
    if (this.disabledOnFrontend) {
      showMessage(this.t("errMobileUnsupported"), 5000, "error")
      return
    }
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
        this.insertTarget = undefined
        return
      }
      this.insertText(text)
      this.setPhase("idle")
    } catch (error) {
      this.setPhase("idle")
      showMessage(this.providerError(provider, error), 6000, "error")
    } finally {
      this.insertTarget = undefined
    }
  }

  private normalizeEditor(candidate: any): any {
    if (!candidate) return null
    if (typeof candidate.insert === "function") return candidate
    if (typeof candidate.getInstance === "function") return candidate.getInstance()
    return null
  }

  private getCandidateEditors(): any[] {
    const editors: any[] = []
    const add = (candidate: any) => {
      const editor = this.normalizeEditor(candidate)
      if (editor && !editors.includes(editor)) editors.push(editor)
    }

    add(this.currentProtyle)
    const mobile = (window as any).siyuan?.mobile
    add(mobile?.popEditor)
    add(mobile?.editor)

    try {
      for (const editor of getAllEditor() || []) add(editor)
    } catch {
      /* ignore */
    }

    return editors
  }

  private getSelectionRange(): Range | undefined {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return undefined
    try {
      return selection.getRangeAt(0)
    } catch {
      return undefined
    }
  }

  private cloneRange(range: Range | undefined): Range | undefined {
    try {
      return range?.cloneRange()
    } catch {
      return undefined
    }
  }

  private editorContainsRange(editor: any, range: Range | undefined): boolean {
    const element = editor?.protyle?.wysiwyg?.element || editor?.protyle?.element
    if (!element || !range) return false
    try {
      return element.isSameNode(range.startContainer) || element.contains(range.startContainer)
    } catch {
      return false
    }
  }

  private captureInsertTarget(): InsertTarget | undefined {
    const editors = this.getCandidateEditors()
    if (editors.length === 0) return undefined

    const ranges = [
      this.getSelectionRange(),
      (window as any).siyuan?.mobile?.touchRange as Range | undefined,
    ]
    for (const range of ranges) {
      for (const editor of editors) {
        if (this.editorContainsRange(editor, range)) {
          return { editor, range: this.cloneRange(range) }
        }
      }
    }

    for (const editor of editors) {
      const toolbarRange = editor?.protyle?.toolbar?.range
      if (this.editorContainsRange(editor, toolbarRange)) {
        return { editor, range: this.cloneRange(toolbarRange) }
      }
    }

    return { editor: editors[0] }
  }

  private restoreInsertRange(target: InsertTarget): boolean {
    const range = this.cloneRange(target.range)
    if (!this.editorContainsRange(target.editor, range)) return false

    try {
      target.editor.protyle.toolbar.range = range
      const editable = target.editor.protyle?.wysiwyg?.element as HTMLElement | undefined
      editable?.focus?.({ preventScroll: true })
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      return true
    } catch {
      return false
    }
  }

  /** 把文字插入当前编辑器光标处。失败时抛错，由上层统一提示。 */
  private insertText(text: string): void {
    const target = this.insertTarget || this.captureInsertTarget()
    const editor = target?.editor
    if (!editor || typeof editor.insert !== "function") throw new Error("noEditor")

    const hasRange = !!target && this.restoreInsertRange(target)
    if (!hasRange) throw new Error("errNoCursor")
    try {
      editor.insert(text, false, true)
    } catch (error) {
      console.error("[voice2text] failed to insert recognized text", error)
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(`${this.t("errInsertFailed")}${msg ? "：" + msg : ""}`)
    }
  }

  /** provider 抛出的错误可能是 i18n key，也可能是已成句的错误消息。 */
  private providerError(provider: VoiceProvider | undefined, error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error)
    const translated = (this.i18n as any)[msg]
    return translated || msg
  }
}
