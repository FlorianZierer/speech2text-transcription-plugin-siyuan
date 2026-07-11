# SiYuan 语音转文字插件（Voice to Text）

在思源笔记里用嘴说话，把语音识别成文字插入到当前光标处。**支持多种识别服务（Provider）**，可按需选择与扩展。

## 功能

- 顶栏一个麦克风图标：点一下开始录音，再点一下停止并识别。
- 识别结果自动插入到当前正在编辑的文档光标处。
- 多 provider 架构：在设置里选择识别服务，各自填写配置。

## 内置识别服务

| Provider | 说明 | 是否需要 key | 依赖 |
|---|---|---|---|
| 小米 MiMo | HTTP 整段识别（`mimo-v2.5-asr`），中文/方言效果好 | 需要 api-key（按量计费） | 经思源内核转发代理调用，绕过跨域 |
| 浏览器 Web Speech | 浏览器自带 `webkitSpeechRecognition`，零成本零后端 | 不需要 | 依赖浏览器/联网，中文准确率一般 |

> 小米走思源内核的转发代理（`/api/network/forwardProxy`），无需自建后端。

## 使用前提

- **必须是安全上下文**：通过 `https://` 或 `http://localhost` / `127.0.0.1` 访问思源，浏览器才允许使用麦克风。局域网 `http://192.168.x.x` 会被浏览器锁死麦克风。
- 插件在桌面端与桌面/移动浏览器上体验最佳；移动 App 端顶栏交互受限，图标可能不便点击。

## 配置

1. 启用插件后，打开插件设置。
2. 在「识别服务（Provider）」里选择要用的服务。
3. 填写对应服务的配置（如小米的 api-key、识别语言）。

配置仅保存在本地思源数据中（`saveData`）。

## 说明

- 一期为「整段录完再识别」：录音期间不出字，停止后整段识别、一次性插入。
- 小米单次录音音频（base64 后）需 ≤ 10MB，音频格式为 16kHz/16bit 单声道 WAV。

## 扩展新的 Provider

provider 接口在 `src/providers/types.ts`。新增一个 HTTP 类识别服务，只需在 `src/providers/` 下实现一个 `VoiceProvider`（提供 `fields` 配置项与 `createSession`），并在 `src/providers/index.ts` 注册即可。

> 流式（如火山引擎 WebSocket，边说边出字）需要额外的增量回调与思源 `wsProxy` 支持，接口已预留 TODO，一期未实现。

## 开发

```bash
npm install
npm run dev     # 开发模式，产物输出到仓库根（index.js/index.css）
npm run build   # 生产构建，产出 dist/ 与 package.zip
```

开发时把本仓库放到思源工作区的 `data/plugins/siyuan-plugin-voice2text/` 下，即可热编译调试。
