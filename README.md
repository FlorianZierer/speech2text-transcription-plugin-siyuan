# Transcription

<img src="icon.png" width="80" height="80" alt="Transcription icon">

A speech-to-text plugin for **SiYuan**, with your choice of transcription service, refined animations, and improved text insertion.

This project is a fork of [SiYuan Voice to Text](https://github.com/chenxuan520/siyuan-plugin-voice2text) by [chenxuan (chenxuan520)](https://github.com/chenxuan520). Credit for the original plugin goes to its author; this fork builds on that foundation with a more fluid dictation and editing workflow.

## Your API, your model

Connect a hosted service or your own server with a compatible `/audio/transcriptions` endpoint. Configure the API base URL, API key, model, and recognition language yourself—the plugin is not tied to a single provider.

The API must accept multipart audio transcription requests and return recognized text. Browser Web Speech is also available where supported, without a separate API key.

## What this fork adds

- **Refined animations:** a live audio waveform smoothly turns into an orange loading ring while your recording is processed.
- **Improved insertion logic:** the plugin remembers the original cursor position in a document or supported input field, even while you edit the preview. A small microphone marker shows where the text will go.
- **Editable previews:** review and change the recognized text before inserting it, or use the copy icon to take it elsewhere. A brief checkmark confirms copying.
- **Additional dictation:** place the cursor in the preview and click its microphone to add more speech. Selected text is replaced. A compact waveform appears beside the buttons while the preview keeps its size and position.
- **Keyboard workflow:** start dictation with a configurable shortcut, press Enter to stop recording, then Enter again to accept the edited text.
- **German localization:** interface labels follow SiYuan's language setting, with English, German, and Simplified Chinese translations included.

## Setup

1. Enable **Transcription** in SiYuan and open its settings. The plugin folder and the repository are both named `speech2text-transcription-plugin-siyuan`.
2. Choose **Transcription API** or **Browser Web Speech**.
3. For an API service, enter its base URL, API key, and model. The plugin appends `/audio/transcriptions` to the base URL if needed. If your server requires no API key, enter a placeholder.
4. Choose a recognition language or automatic detection. Optionally add vocabulary hints for names and technical terms.
5. Select your microphone. Enable **Confirm before inserting** if you want to review recordings started from the toolbar as well.

Service settings and credentials are saved in your local SiYuan data. When using a transcription API, recordings are sent to the service you configure.

## Dictation workflow

Click the toolbar microphone or press **Alt+Shift+M** (**Option+Shift+M** on macOS) to begin. You can change the shortcut in SiYuan's keyboard settings under **Start / stop dictation**.

| Action | Control |
| --- | --- |
| Finish recording | Enter, or the recording control |
| Accept the preview at the original insertion point | Enter, or the up-arrow button |
| Add a line break in the preview | Shift+Enter |
| Dictate at the preview cursor | Preview microphone, or the dictation shortcut |
| Copy the current draft | Copy icon |
| Cancel an additional recording and keep the draft | Esc during additional dictation |
| Discard the draft | Esc in the preview |

Dictation started with the shortcut always opens the preview. The preview receives keyboard focus automatically, and editing it does not change the original insertion target.

## Compatibility

- Supports the SiYuan desktop app and desktop browsers. Mobile frontends are not supported.
- Browser microphone access requires HTTPS or localhost.
- API transcription processes the complete recording after you stop. Browser Web Speech can also show interim results.
- System audio capture depends on the browser and operating system. A virtual audio device can be selected as an alternative input.
- Optional recording tail, silence padding, and start/stop sounds help avoid clipped words and make recording boundaries clearer.

## Development

This repository contains the plugin files directly: `index.js`, `index.css`, `plugin.json`, and `i18n/`.

Run the interaction regression tests with Node.js:

```sh
node --test tests/overlay.test.cjs
```

The editable marketplace icon is in `assets/icon.svg`. See `scripts/render-icon.c` for the macOS PNG export command.

These tests use a simulated DOM. Check visual layout, animations, and cursor positioning in SiYuan as well.

## License and attribution

The original plugin is by **chenxuan** and is licensed under the **MIT License**. Its copyright and license notices are preserved in the plugin files.
