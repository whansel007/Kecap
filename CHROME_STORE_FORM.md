# Chrome Web Store form answers

Copy-ready answers for the Store listing and Privacy sections shown in the supplied screenshots. This worksheet stays in the repository root and is **not included in `kecap-extension-store.zip`**.

## Store listing

**Title:** Kécap  
The title comes from the package name.

**Summary:** Read the web in Aksara Sunda. Rewrite page text, captions, and images, with an on-screen keyboard and Latin spelling help.

The summary is within the 132-character Store limit and matches `description` in `kecap-extension/manifest.json`.

**Description:**

> Kécap helps you read and write Aksara Sunda as part of everyday browsing. It rewrites page text and YouTube captions into Aksara Sunda, with a hover popup that shows the Latin spelling and a right-click breakdown of characters and rarangken. This is spelling-based transliteration, not translation of meaning.
>
> The interface is available in English (the default), Bahasa Indonesia, and Basa Sunda. Choose a language in Settings.
>
> Use the on-screen keyboard to type Aksara Sunda in websites and chats. With Latin-backed display enabled, you see Aksara while the website receives Latin text, so the other person can read and reply normally. Practice writing without asking conversation partners to learn a new script.
>
> You can also run OCR on visible images. Image text recognition and Aksara conversion run locally in your browser using the bundled Tesseract.js engine and language data. Page text and images are not sent to Kécap or an AI service. OCR works best with clear, large, horizontal text and may misread stylized or complex layouts.
>
> Automatic page rewriting is on by default and can be turned off in the popup. Kécap stores preferences in Chrome's local extension storage.

**Category:** Education  
**Language:** English

## Privacy: single purpose

> Help people read and write Aksara Sunda by rewriting website text into the script and providing an on-screen keyboard, spelling explanations, and local image OCR.

## Privacy: permission justifications

**`storage` justification:**

> Stores the user's Kécap preferences locally, including display and transliteration options, interface language, keyboard layout, shortcut, and keyboard size and position.

**`contextMenus` justification:**

> Adds a user-invoked right-click action on images so the user can run Kécap's local OCR and Aksara Sunda transliteration on that image.

**`offscreen` justification:**

> Creates an offscreen extension document to run the bundled Tesseract.js OCR worker and bundled language data locally. This is needed because the extension service worker cannot host the OCR worker directly. Images are not uploaded to an OCR provider.

**Host permission justification (`http://*/*`, `https://*/*`):**

> Kécap needs access to HTTP and HTTPS pages to provide its core feature: automatically rewriting visible page text and YouTube captions, showing hover and right-click explanations, displaying Aksara in supported text fields, and processing an image when the user requests OCR. Page content is processed locally and is not sent to Kécap. Kécap does not read browser history or use site access for advertising or analytics. Users can turn off automatic rewriting in Settings.

The dashboard warns that broad host permissions may trigger an in-depth review. They are requested because automatic rewriting is intended to work across ordinary websites. The code does not use the `history` API or persist page URLs.

## Remote code

**Are you using remote code?** No.

**Justification:**

> No remote code is used. All JavaScript, Tesseract.js worker code, OCR WebAssembly cores, fonts, and OCR language data are included in the extension package and loaded from the extension's own files. Kécap does not load scripts, modules, or WebAssembly from a remote server.

## Privacy: data usage

The extension processes page text and supported text fields locally, including chat text when the user browses or types in a chat service. Its event handlers also respond to hover, right-click, scrolling, the keyboard shortcut, and on-screen keyboard navigation to provide the stated features. It does not log these interactions, build a browsing history, or send page content to Kécap.

**Recommended checkboxes for the current all-sites behavior:**

- ☒ Personally identifiable information — visible page text and supported text/email fields may contain names, email addresses, or other identifiers.
- ☒ Health information — the general page-text feature can process visible text on health-related pages; it is processed locally for rewriting only.
- ☒ Financial and payment information — the general page-text feature can process visible text on financial pages; it is processed locally for rewriting only.
- ☒ Authentication information — supported text fields can contain account identifiers such as usernames. Password-type inputs are not supported or read.
- ☒ Personal communications — page text may include email, chat, or message content, including conversations on sites such as Telegram.
- ☐ Location — Kécap does not request device location, GPS, nearby-device, or IP-location data. An address written in ordinary page text is handled as page content.
- ☐ Web history — Kécap does not query or store the user's browsing history or maintain a list of visited URLs.
- ☒ User activity — pointer and keyboard events are handled transiently for hover explanations, right-click details, keyboard navigation, and shortcuts. They are not recorded or transmitted as activity logs.
- ☒ Website content — visible page text and captions are read and rewritten; selected images are fetched from their original host and OCRed locally when the user requests it.

These selections are intentionally conservative because Kécap operates on arbitrary HTTP/HTTPS pages and cannot infer the sensitivity of every visible string or text field. If the dashboard's definition of “collect” is applied only to data retained or transmitted, ask Chrome Web Store support before unchecking categories: Chrome's guidance says local processing of sensitive user data still requires disclosure. Keep these disclosures aligned with the published privacy policy and the actual release.

**Data-use certifications:** Certify all three, provided the implementation remains as described:

1. ☒ Kécap does not sell or transfer user data to third parties outside approved use cases. The browser makes the image request to its original host only when image OCR is invoked; the destination website receives text the user chooses to enter there.
2. ☒ Kécap does not use or transfer user data for purposes unrelated to its single purpose.
3. ☒ Kécap does not use or transfer user data to determine creditworthiness or for lending.

## Privacy policy URL

The dashboard requires a public, working HTTPS URL. After committing and pushing the root [PRIVACY.md](PRIVACY.md) to the public `main` branch, use:

`https://github.com/whansel007/Kecap/blob/main/PRIVACY.md`

Do not enter the local file path. Verify the link opens without signing in before submitting.

## Review notes

- This file is outside the upload ZIP. The ZIP builder packages only files under `kecap-extension/`.
- These are draft disclosures based on the current source. Recheck them against the exact ZIP you upload, especially if page access, form handling, OCR, or network behavior changes.
- Chrome's data categories and privacy policy guidance: [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy/), [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq/), and [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies/).
