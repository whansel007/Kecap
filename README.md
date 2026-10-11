# Kécap — Project submission draft

## Project name

Kécap

## Award tracks

- [x] Culture × Tech — primary track
- [x] Design × Tech

## Project overview

ᮞᮥᮔ᮪ᮓ (Aksara Sunda) is still taught, but many learners have little reason to use it after school. I know that gap: after six years studying Chinese, I still struggle to read Hanzi because I rarely used it outside class. My father speaks Sundanese fluently but cannot read its script. Kécap (“word” in Sundanese) is a Chrome extension that transliterates supported web text into Aksara Sunda. Hover to see the Latin spelling and character breakdown, or type with its on-screen keyboard while websites continue receiving Latin text. Kécap brings the script into everyday reading so people have a reason to practice.

*Word count: 87 / 100*

## The build

Kécap is a Manifest V3 Chrome extension built with JavaScript, HTML/CSS, local transliteration logic, Chrome storage, and Noto Sans Sundanese. It transliterates page text, supports automatic rewriting, hover and right-click spelling explanations, digit conversion, keyboard layouts with rarangken, and Latin-backed Aksara entry. Optional image text extraction calls OpenAI or Anthropic only when requested. We explored using everyday browsing as a low-friction way to practice. Next, we want Sundanese readers to review spellings and explanations, improve site compatibility, and record a short demo.

*Word count: 77 / 100*

## Team & collaboration

This is currently a solo project. I brought the perspective of a learner who wants to read Aksara Sunda, along with my experience of studying a script without having a reason to use it in everyday life. I used OpenAI Codex as a coding assistant to build and iterate on the extension and its interface. The next important perspective to bring in is feedback from fluent Sundanese readers, especially to review the transliteration and character explanations.

## AI & tool attribution

- **OpenAI Codex:** coding assistance and iterative implementation during development.
- **Image text extraction:** optional, user-requested calls to either the OpenAI or Anthropic API. The user selects the provider and supplies their own API key; the configured model is used for OCR and, in English source mode, phonetic respelling. Page text transliteration runs locally.
- **Technology:** Chrome Manifest V3, JavaScript, HTML, CSS, Chrome extension storage, and the bundled Noto Sans Sundanese font.
- **Font:** Noto Sans Sundanese from Noto Fonts, licensed under the SIL Open Font License 1.1.
- **Reference material:** Aksara Sunda charts supplied by the project creator informed the character, modifier, and digit reference. No external text dataset is bundled.

## Project links & demo

- **Source code:** [github.com/whansel007/Kecap](https://github.com/whansel007/Kecap)
- **Live demo:** No public deployment yet. The extension includes a local demo at [`kecap-extension/demo/demo.html`](kecap-extension/demo/demo.html); load the `kecap-extension/` folder as an unpacked extension in Chrome, then open `chrome-extension://<extension-id>/demo/demo.html`.
- **Demo video:** Not recorded yet. The submission form accepts a video up to two minutes; recording one is a high-priority next step.
- **Figma / prototype:** Not applicable; the interactive prototype is the Chrome extension.
- **Try-it notes:** The local mock comic demo does not need an API key. Real image text extraction requires the judge to configure their own OpenAI or Anthropic API key in the extension settings. Page text transliteration is local and does not require a key.

## Story for the presentation

> A writing system doesn't survive because it's recorded somewhere. It survives because people use it.

Kécap is built around a simple idea: teaching a script is not enough if people have no reason to keep reading and writing it. Instead of asking users to find new material, Kécap brings Aksara Sunda to content they already choose to read.
