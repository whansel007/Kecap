# Kécap

**Bring Aksara Sunda into everyday browsing.**

Kécap is a Chrome extension that helps people read and write Aksara Sunda as part of the web they already use. It rewrites supported page text and YouTube captions into the script, explains how characters are formed, and provides an on-screen keyboard for writing in websites and chats.

Kécap is named after the Sundanese word for “word.” A writing system stays alive through use, so Kécap makes it easier to encounter and practice Aksara Sunda while reading and messaging—not only in a classroom.

## Features

- Automatically rewrite visible website text into Aksara Sunda, with controls to disable rewriting or toggle it for a page.
- Hover a word to see its Latin spelling; right-click for a character and rarangken breakdown.
- Rewrite changing YouTube captions when page rewriting is enabled.
- Use a movable, keyboard-navigable on-screen keyboard to enter Aksara Sunda in supported text fields.
- Optionally show Aksara while a website receives the Latin spelling, so people can practice in ordinary conversations without asking others to learn the script.
- Run OCR on a selected image and render recognized text in Aksara Sunda.
- Choose English, Bahasa Indonesia, or Basa Sunda for the extension interface.

This is spelling-based transliteration, not translation of meaning. The mapping is a practical approximation and may not cover every spelling or orthographic edge case.

## Install in Chrome

1. Clone or download this repository and extract it if needed.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the `kecap-extension/` folder in this repository.
4. Pin Kécap from Chrome's Extensions menu to reach its popup and settings quickly.

Automatic rewriting is enabled by default. Change it and other options in the extension popup. The on-screen keyboard can also be opened with its configurable shortcut.

## Image OCR and privacy

Image OCR uses the Tesseract.js engine and English and Indonesian language data bundled with the extension. Recognition and transliteration run locally in the browser; no API key or external OCR service is required. When you request OCR, Chrome fetches the selected image from the website that hosts it. Clear, large, horizontal text works best. Stylized lettering, vertical text, and complex layouts can be misread.

Page text, captions, and supported text fields are processed locally to provide Kécap's features. The extension does not send this content to a Kécap server, an AI provider, or analytics. When Latin-backed display is enabled, the website receives the Latin text you enter. See the [privacy policy](PRIVACY.md) for details.

## Development

The extension source is in [`kecap-extension/`](kecap-extension/). It uses Chrome Manifest V3, JavaScript, HTML, and CSS. Transliteration and interface localization are implemented locally; OCR dependencies and assets are bundled under `kecap-extension/ocr/`.

To run the transliteration checks, open a terminal in `kecap-extension/` and run:

```sh
node test/aksara.test.js
```

The Chrome Web Store upload archive is generated at the repository root:

```sh
python scripts/package_store_extension.py
```

That script packages the extension runtime and bundled assets into `kecap-extension-store.zip`, excluding development dependencies and tests. Store listing and privacy-form drafts are in [`CHROME_STORE_FORM.md`](CHROME_STORE_FORM.md) and [`STORE_SUBMISSION.md`](STORE_SUBMISSION.md); they are submission materials, not required to use Kécap.

## Known limitations

- Transliteration follows the project's supplied mappings. English spelling often does not indicate pronunciation, so the result may not represent spoken English accurately.
- OCR accuracy depends on image quality, orientation, lettering, and layout. Some images may not be accessible to the browser or may fail to load.
- Browser-protected pages and sites that restrict extension access cannot be modified. Website behavior and content security policies may also affect rendering and text-field support.
- The mappings have not yet been formally reviewed by a fluent Sundanese orthography specialist; corrections and feedback are welcome.

## Contributing and feedback

Issues and corrections are welcome, especially feedback from Sundanese readers on transliteration and Aksara Sunda orthography. Please include the example Latin text, the expected Aksara form, and the context where it appears.

- [Report an issue or suggest a correction](https://github.com/whansel007/Kecap/issues)
- [Browse the source code](https://github.com/whansel007/Kecap)

## Credits and licenses

- OCR is powered by [Tesseract.js](https://github.com/naptha/tesseract.js) and bundled Tesseract OCR assets; license notices are included in `kecap-extension/ocr/`.
- The bundled Noto Sans Sundanese font is from [Noto Fonts](https://github.com/notofonts/sundanese) and is licensed under the SIL Open Font License 1.1.
- Aksara Sunda reference charts supplied by the project creator informed the character, modifier, and digit reference.
