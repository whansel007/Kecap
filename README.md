# Kécap — Project submission draft

## Project name

Kécap

## Award tracks

- [x] Design × Tech — primary track
- [x] Culture × Tech

## Project overview

This is ᮞᮥᮔ᮪ᮓ, Aksara Sunda. It is taught in school, but many learners have little reason to use it afterward. After six years studying Chinese, I still struggle with Hanzi because I rarely used it outside class; my Sundanese-fluent father cannot read Aksara either. Kécap (“word” in Sundanese) is a Chrome extension that brings Aksara into everyday browsing and chat. As someone types, they see Aksara while the website receives Latin, so friends can read and reply as usual. One person gets real writing practice without asking the whole conversation to learn a new script.

*Word count: 95 / 100*

## The build

Kécap is a Manifest V3 Chrome extension built with JavaScript, HTML/CSS, local transliteration logic, Tesseract.js OCR, Chrome storage, and Noto Sans Sundanese. It rewrites supported page text, including dynamically updated YouTube captions, explains spellings on hover and right-click, converts digits, and includes an on-screen keyboard. In chat, its Latin-backed input lets the writer see Aksara while the website receives Latin. Image text recognition and transliteration run on-device without an API key. Next, we want to verify Telegram and WhatsApp Web compatibility, review spellings with Sundanese readers, and record a short demo.

*Word count: 91 / 100*

## Team & collaboration

I brought my perspective as a learner who wants to read Aksara Sunda, along with the product idea and personal connection. I used OpenAI Codex as a coding assistant to prototype and iterate on the extension. Building it showed me that lowering friction matters: people need a reason to use the script in their normal reading, not another isolated lesson. I have not yet had a fluent Sundanese reader formally review the mappings; that community perspective is a priority next.

## AI & tool attribution

- **OpenAI Codex:** coding assistance and iterative implementation during development.
- **Local image OCR:** Tesseract.js v7 and its core run on-device with bundled English and Indonesian OCR models from Tesseract's trained data. Images are not sent to an AI provider. OCR model files and Tesseract components are Apache 2.0 licensed; local transliteration uses the project's spelling mappings.
- **Technology:** Chrome Manifest V3, JavaScript, HTML, CSS, Chrome extension storage, and the bundled Noto Sans Sundanese font.
- **Font:** Noto Sans Sundanese from Noto Fonts, licensed under the SIL Open Font License 1.1.
- **Reference material:** Aksara Sunda charts supplied by the project creator informed the character, modifier, and digit reference. No external text dataset is bundled.

## Load the extension in Chrome

1. Download or clone this repository, then extract it if it is a ZIP file.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repository's `kecap-extension/` folder.
4. Pin Kécap from Chrome's Extensions menu if you want quick access to its settings and keyboard.
5. Open a website. Automatic page rewriting is on by default; use the Kécap popup's Settings if you want to change it.

Text rewriting, keyboard input, YouTube caption rewriting, and image OCR work without an API key. Image OCR is local and works best with clear, large, horizontal text; it does not translate meaning.

## Project links & demo

- **Source code:** [github.com/whansel007/Kecap](https://github.com/whansel007/Kecap)
- **Local demo:** [`kecap-extension/demo/demo.html`](kecap-extension/demo/demo.html) includes a text-rewriting and mock-comic walkthrough. Load the extension as described above, then open the demo page in Chrome.
- **Planned demo video:** Show a Wikipedia page automatically rendered in Aksara, then compare two Telegram windows side by side: one displays ordinary Latin text, while the Kécap-enabled writer sees Aksara as they type and the site receives Latin. This demonstrates practice in a real conversation without requiring the other person to read Aksara. The submission video must be two minutes or less.
- **Figma / prototype:** Not applicable; the interactive prototype is the Chrome extension.
- **Try-it notes:** Page rewriting and local image OCR need no API key. The mock comic demo uses supplied sample text regions; real images are OCRed on-device. YouTube captions are rewritten when automatic page rewriting is enabled.

## Story for the presentation

> A writing system doesn't survive because it's recorded somewhere. It survives because people use it.

People often learn a spoken language by talking with its speakers. I want to bring that kind of everyday practice to a writing system. My Sundanese-fluent father cannot read Aksara Sunda, and I know from studying Chinese that lessons alone do not make me fluent in a script I rarely use. Kécap lets me write a Telegram message while seeing Aksara on my screen; the site sends Latin, so my friend can read and reply without changing how they chat. I can practice with any conversation partner, even one who has never learned Aksara. The point is not to make everyone learn at once—it is to make using the script part of something people already do.
