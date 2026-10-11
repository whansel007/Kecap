# Chrome Web Store submission draft

This document is a ready-to-transfer listing and review checklist for Kécap. The extension has not been submitted or published.

## Listing

**Name:** Kécap

**Short description (132 characters max):** Read the web in Aksara Sunda. Rewrite page text, captions, and images, with an on-screen keyboard and Latin spelling help.

**Category:** Education

**Full description:**

Kécap helps you read and write Aksara Sunda as part of everyday browsing. It rewrites page text and YouTube captions into Aksara Sunda, with a hover popup that shows the Latin spelling and a right-click breakdown of the characters and rarangken. This is spelling-based transliteration, not translation of meaning.

The interface is available in English (the default), Bahasa Indonesia, and Basa Sunda. Choose the interface language in Settings.

Use the on-screen keyboard to type Aksara Sunda in websites and chats. With Latin-backed display enabled, you see Aksara while the website receives Latin text, so the other person can read and reply normally. Practice writing without asking your conversation partners to learn a new script.

You can also run OCR on visible images. Image text recognition and Aksara conversion run locally in your browser using the bundled Tesseract.js engine and language data; images and page text are not sent to Kécap or an AI service. OCR works best with clear, large, horizontal text and may misread stylized or complex layouts.

Automatic page rewriting is on by default and can be turned off in the popup. Kécap stores preferences in Chrome local extension storage.

**Permissions used:**

- `http://*/*` and `https://*/*` site access: needed to rewrite pages and captions, provide hover/right-click explanations, and insert keyboard text on sites the user visits.
- `storage`: saves user preferences and keyboard settings locally in Chrome.
- `contextMenus`: adds the user-invoked image action to the right-click menu.
- `offscreen`: runs the bundled OCR worker locally because the service worker cannot host that worker directly.

## Privacy and data handling disclosures

Suggested Chrome Web Store privacy declarations (confirm these against the final build before submission):

- **Website content and web browsing activity:** accessed and processed locally only to provide page/caption rewriting, hover/right-click explanations, keyboard input, and user-invoked image OCR. Do not claim this category is never handled: the extension reads website content to provide its core feature. No page URLs, text, captions, form contents, or keyboard input are sent to Kécap or analytics.
- **Personally identifiable, health, financial, authentication, and location information:** not collected by Kécap servers or intentionally stored by the extension.
- **Image OCR:** when invoked, the browser requests the selected image from its original website with browser credentials. OCR and transliteration run locally; the image is not uploaded to Kécap or an OCR/AI provider.
- **Storage:** preferences (including layout, shortcut, and display options) are stored in Chrome's local extension storage and are not synced by Kécap.
- **Sale, advertising, analytics, or human review:** none.

The Store privacy dashboard must match the behavior above. Declare website content/browsing activity as handled for the feature, even though it is processed locally and not sent to Kécap. Chrome's policy treats locally processed website content as user data that must be disclosed. Publish the accompanying privacy policy on a stable public HTTPS URL, then enter that URL in the dashboard. Do not use a local Markdown path as the policy URL.

## Permission review

The required host access is broad because automatic rewriting is intended to work across ordinary HTTP and HTTPS pages. This is user-facing and described above, but it is the likeliest review question. `contextMenus`, `storage`, and `offscreen` each have direct current features. The manifest does not request `tabs`, `activeTab`, or an external AI/API permission.

Pages that Chrome does not allow extensions to modify (for example, Chrome Web Store pages and some browser-internal pages) remain unavailable. The extension uses `minimum_chrome_version` 116 for the offscreen document and related APIs.

## Before submitting

- Publish [PRIVACY.md](PRIVACY.md) (or equivalent page) on the project website and put its HTTPS URL in the dashboard.
- Add at least one accurate screenshot of the working extension to the Store listing; capture the actual current UI, not a mockup. Consider screenshots for page rewriting/hover help, the keyboard in a chat field, and image OCR.
- Confirm the developer account's public support contact and complete the Store privacy/data-use declarations.
- Verify fresh install, automatic page rewriting, the popup, keyboard input on supported sites, context-menu image OCR, and YouTube captions in Chrome 116+.
- Review all third-party notices and preserve the bundled font/OCR license files in the upload.
- Confirm the final artifact's manifest and screenshots match the listing. Upload the ZIP to the dashboard for review; this repository preparation does not submit it.

## Package

The upload archive is generated as `kecap-extension-store.zip` in the repository root. It contains the extension runtime files and bundled OCR/font assets, excludes development dependencies and tests, and has `manifest.json` at its archive root.
