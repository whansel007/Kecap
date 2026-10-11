# Kécap

Kécap (“word” in Sundanese, and a nod to “catch up”) rewrites the text people already read into Aksara Sunda. It is spelling-based transliteration, not translation; hover a converted word to see its Latin original and syllable breakdown. Page text is processed locally. Image text uses your selected vision provider only when you request it.

## Install

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked** and select the `kecap-extension/` folder.
3. Open the extension popup, expand **Settings**, choose a provider, enter your API key, and set its model. The key is stored in `chrome.storage.local` and read by the service worker.

By default, Kécap automatically rewrites page text on each supported website as it loads. Turn **Automatically rewrite pages** off in the popup to disable that default; the page-specific toggle still lets you turn it on for one page. Hover a converted word to see its Latin spelling and syllable chips. Right-click a converted word for a concise base-consonant and vowel/final-mark breakdown. This explains the spelling conversion; it does not translate meaning.

The default models are `claude-sonnet-5-5` for Anthropic and `gpt-4o` for OpenAI. Model availability is controlled by each provider and may differ by account. Image translation also offers an English source mode, where the model phonetic-respells words before transliteration.

## API key for image translation

Use an **Anthropic API key** (the default provider) from the [Claude Console API keys page](https://console.anthropic.com/settings/keys), or select OpenAI and use an [OpenAI Platform API key](https://platform.openai.com/api-keys). In the extension popup, expand **Settings**, choose that same provider, and paste its API key into **API key**. Page text rewriting and the demo's mock comic do not need a key; a real image OCR request does. Kécap sends the selected image to the provider you chose.

## Five-minute demo

1. Visit `chrome-extension://<extension-id>/demo/demo.html` (open the extension's service worker or inspect its ID on `chrome://extensions`).
2. Click **Rewrite page text**, then hover a Sundanese or Indonesian word to see its Latin tooltip and syllable chips.
3. Click **Translate mock comic**. The three speech bubbles run through the image pipeline without an API key.
4. Click **Original ↔ Aksara Sunda** on the comic to toggle the source artwork and translated panel.
5. Open an Indonesian news page and enable page text from the extension popup.

## Tests

From this folder, run `node test/aksara.test.js`.

## Assumptions and limitations

- The supplied mappings are used as written. Plain `e` always means pepet; `é` and `è` mean the é vowel. Add human corrections to `Aksara.OVERRIDES` in `lib/aksara.js`.
- Page text is a practical spelling approximation for Indonesian/Sundanese and is explicitly not linguistically reliable for English. Current tokenization handles the supplied consonants, ng/ny/kh/sy, vowels, and r/l/y medial clusters; other orthographic edge cases may differ from Aksara Sunda Baku.
- Image mode processes visible, sufficiently large `<img>` elements with a maximum of two concurrent jobs. Protected, authenticated, very large, unusual-format, or lazy images may fail to fetch or render. Canvas output retains the text box background color sampled near each detected region, so complex backgrounds can show seams.
- Strict host-page CSP and browser font loading behavior vary. The extension injects the bundled font from its web-accessible resource; a failed font load produces a toast and falls back to the system stack.
- The demo comic is original and generated locally at runtime. Real image OCR and provider error messages require a valid provider key and network access; these were not exercised in the mock demo.
- The bundled font is Noto Sans Sundanese from the official [Noto Sundanese repository](https://github.com/notofonts/sundanese), under SIL OFL 1.1. Missing font files trigger a visible toast.

## Verification status

Run the unit command above to verify transliteration. The unpacked Chrome UI, strict-CSP behavior, hover/restore behavior, mutation batches, and real provider calls require manual verification in Chrome. First test the demo page's text toggle and mock comic, then verify original text restoration and a real Indonesian page.
