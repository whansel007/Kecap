# Kécap — Project submission draft

## Project name

Kécap

## Award tracks

- [x] Culture × Tech — primary track
- [x] Design × Tech

## Project overview

This is ᮞᮥᮔ᮪ᮓ, Aksara Sunda. It is still taught, but many learners have little reason to use it after school. After six years studying Chinese, I still struggle with Hanzi because I rarely used it outside class; my Sundanese-fluent father cannot read the script either. Kécap (“word” in Sundanese) is a Chrome extension that transliterates supported web text into Aksara Sunda. Hover for the Latin spelling and character breakdown, or type in Aksara while websites receive Latin text. Kécap brings the script into everyday reading, giving people a reason to practice.

*Word count: 91 / 100*

## The build

Kécap is a Manifest V3 Chrome extension built with JavaScript, HTML/CSS, local transliteration logic, Chrome storage, and Noto Sans Sundanese. It transliterates page text, supports automatic rewriting, hover and right-click spelling explanations, digit conversion, keyboard layouts with rarangken, and Latin-backed Aksara entry. Optional image text extraction calls OpenAI or Anthropic only when requested. We explored using everyday browsing as a low-friction way to practice. Next, we want Sundanese readers to review spellings and explanations, improve site compatibility, and record a short demo.

*Word count: 82 / 100*

## Team & collaboration

I brought my perspective as a learner who wants to read Aksara Sunda, along with the product idea and personal connection. I used OpenAI Codex as a coding assistant to prototype and iterate on the extension. Building it showed me that lowering friction matters: people need a reason to use the script in their normal reading, not another isolated lesson. I have not yet had a fluent Sundanese reader formally review the mappings; that community perspective is a priority next.

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
