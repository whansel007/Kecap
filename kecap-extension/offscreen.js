'use strict';

let worker = null;
let workerLanguage = '';
let queue = Promise.resolve();

async function getWorker(language) {
  const options = {
    workerPath: chrome.runtime.getURL('ocr/worker.min.js'),
    corePath: chrome.runtime.getURL('ocr/core/'),
    langPath: chrome.runtime.getURL('ocr/lang/'),
    workerBlobURL: false,
    cacheMethod: 'write',
    gzip: true,
    logger: () => {},
  };
  if (!worker) {
    worker = await Tesseract.createWorker(language, Tesseract.OEM.LSTM_ONLY, options);
    workerLanguage = language;
  } else if (workerLanguage !== language) {
    await worker.reinitialize(language, Tesseract.OEM.LSTM_ONLY);
    workerLanguage = language;
  }
  return worker;
}

function regionsFromTSV(tsv) {
  const groups = new Map();
  for (const row of String(tsv || '').split(/\r?\n/).slice(1)) {
    const fields = row.split('\t');
    if (fields.length < 12 || fields[0] !== '5') continue;
    const text = fields.slice(11).join('\t').trim();
    const confidence = Number(fields[10]);
    if (!text || (Number.isFinite(confidence) && confidence < 20)) continue;
    const [, page, block, paragraph, line, , left, top, width, height] = fields;
    const x = Number(left), y = Number(top), w = Number(width), h = Number(height);
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) continue;
    const key = `${page}:${block}:${paragraph}`;
    let group = groups.get(key);
    if (!group) {
      group = { x, y, right: x + w, bottom: y + h, lines: new Map() };
      groups.set(key, group);
    }
    group.x = Math.min(group.x, x);
    group.y = Math.min(group.y, y);
    group.right = Math.max(group.right, x + w);
    group.bottom = Math.max(group.bottom, y + h);
    const lineKey = Number(line);
    group.lines.set(lineKey, [...(group.lines.get(lineKey) || []), text]);
  }
  return [...groups.values()].map(group => {
    const text = [...group.lines.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, words]) => words.join(' '))
      .join(' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
    return {
      bbox: [group.x, group.y, group.right - group.x, group.bottom - group.y],
      text,
      latin: text,
      kind: 'text',
    };
  }).filter(region => region.text);
}

async function recognize({ dataUrl, language }) {
  const ocr = await getWorker(language === 'eng' ? 'eng' : 'ind');
  const result = await ocr.recognize(dataUrl, {}, { tsv: true });
  return regionsFromTSV(result.data.tsv);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'KECAP_LOCAL_OCR') return false;
  const task = queue.then(() => recognize(message));
  queue = task.catch(() => {});
  task.then(
    regions => sendResponse({ ok: true, regions }),
    error => sendResponse({ ok: false, error: error?.message || 'Local OCR failed.' }),
  );
  return true;
});
