# Kécap

Kécap (“word” in Sundanese, and a nod to “catch up”) rewrites the text people already read into Aksara Sunda. It is spelling-based transliteration, not translation; hover a converted word to see its Latin original and syllable breakdown. Page text and image OCR are processed locally. Images are not sent to an AI provider.

## Install

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked** and select this `kecap-extension/` folder.
3. Open the extension popup and choose **Indonesian/Sundanese** or **English** as the image OCR language in Settings.

By default, Kécap automatically rewrites page text on each supported website as it loads, including YouTube captions as they change. Turn **Automatically rewrite pages** off in the popup to disable that default; the page-specific toggle still lets you turn it on for one page. Hover a converted word to see its Latin spelling and syllable chips. Right-click a converted word for a concise character breakdown. This explains the spelling conversion; it does not translate meaning.

Choose English (default), Bahasa Indonesia, or Basa Sunda for the extension interface in Settings.

The OCR engine and English/Indonesian language data are bundled with the extension and run on-device. Image text is recognized and then spelling-based transliteration converts it to Aksara Sunda. OCR does not translate meaning; English spelling may not match pronunciation.

## On-device image OCR

No API key or separate OCR service is needed. Kécap uses the bundled Tesseract.js OCR engine and English/Indonesian language models locally. It downloads the page image into the extension for processing, then recognizes its text on your device. Clear, large, horizontal text works best; stylized lettering, vertical manga text, and complex layouts may be missed or misread.

## Five-minute demo

1. Visit `chrome-extension://<extension-id>/demo/demo.html` (open the extension's service worker or inspect its ID on `chrome://extensions`).
2. Click **Rewrite page text**, then hover a Sundanese or Indonesian word to see its Latin tooltip and syllable chips.
3. Click **Translate mock comic**. The demo's known text regions run through the same Aksara rendering path without an API key.
4. Click **Original ↔ Aksara Sunda** on the comic to toggle the source artwork and translated panel.
5. Open a video with captions enabled to see dynamically updated YouTube subtitles rewritten into Aksara Sunda.

## Tests

From this folder, run `node test/aksara.test.js`.

## Assumptions and limitations

- The supplied mappings are used as written. Plain `e` always means pepet; `é` and `è` mean the é vowel. Add human corrections to `Aksara.OVERRIDES` in `lib/aksara.js`.
- Page text is a practical spelling approximation for Indonesian/Sundanese and is explicitly not linguistically reliable for English. Current tokenization handles the supplied consonants, ng/ny/kh/sy, vowels, and r/l/y medial clusters; other orthographic edge cases may differ from Aksara Sunda Baku.
- Image mode processes visible, sufficiently large `<img>` elements with a maximum of two concurrent jobs. Protected, authenticated, very large, unusual-format, or lazy images may fail to fetch or render. Canvas output retains the text box background color sampled near each detected region, so complex backgrounds can show seams.
- Strict host-page CSP and browser font loading behavior vary. The extension injects the bundled font from its web-accessible resource; a failed font load produces a toast and falls back to the system stack.
- Local OCR uses Tesseract.js with bundled English and Indonesian models. The first OCR run initializes the model on-device; later runs can reuse the browser cache. Accuracy depends on image quality, text orientation, and font style.
- Tesseract.js, its OCR core, and the bundled language data are Apache-2.0 licensed; license copies are in `ocr/`.
- English OCR reads English spelling, which is then transliterated by Kécap's orthographic mapping; it does not infer pronunciation or translate meaning.
- The bundled font is Noto Sans Sundanese from the official [Noto Sundanese repository](https://github.com/notofonts/sundanese), under SIL OFL 1.1. Missing font files trigger a visible toast.

## Verification status

Run the unit command above to verify transliteration. The unpacked Chrome UI, strict-CSP behavior, hover/restore behavior, YouTube caption updates, and local OCR require manual verification in Chrome. First test the demo page's text toggle and mock comic, then verify original text restoration and OCR on a clear image.
