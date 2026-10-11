(function () {
  'use strict';

  let enabled = false;
  let digitsEnabled = true;
  let observer = null;
  let frame = 0;
  const overlays = new Map();
  const resizeObserver = new ResizeObserver(entries => entries.forEach(entry => updateField(entry.target)));
  const types = new Set(['text', 'search', 'url', 'tel', 'email']);

  function isSupportedField(element) {
    return element instanceof HTMLTextAreaElement ||
      element instanceof HTMLInputElement && types.has(element.type) ||
      element instanceof HTMLElement && element.hasAttribute('contenteditable') && element.isContentEditable;
  }

  function fieldText(field) {
    if ('value' in field) return field.value;
    return field.innerText || field.textContent || '';
  }

  function ensureStyles() {
    if (!document.getElementById('kecap-latin-display-style')) {
      const style = document.createElement('style');
      style.id = 'kecap-latin-display-style';
      style.textContent = '[data-kecap-latin-display],[data-kecap-latin-display] *{color:transparent!important;-webkit-text-fill-color:transparent!important;caret-color:var(--kecap-latin-caret-color,#2A1911)!important}[data-kecap-latin-display]::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}.kecap-latin-overlay{position:fixed;z-index:2147483646;overflow:hidden;pointer-events:none;background:transparent!important}.kecap-latin-overlay-input{display:flex;align-items:center;white-space:pre}.kecap-latin-overlay-area{display:block;white-space:pre-wrap}';
      (document.head || document.documentElement).append(style);
    }
    if (!document.getElementById('kecap-latin-font-style')) {
      const style = document.createElement('style');
      style.id = 'kecap-latin-font-style';
      style.textContent = '@font-face{font-family:"Kecap Sunda Latin View";src:url("' + chrome.runtime.getURL('fonts/NotoSansSundanese-Regular.ttf') + '")}';
      (document.head || document.documentElement).append(style);
    }
  }

  function createOverlay(field) {
    const computed = getComputedStyle(field);
    const overlay = document.createElement('div');
    overlay.className = 'kecap-latin-overlay ' + (field instanceof HTMLInputElement ? 'kecap-latin-overlay-input' : 'kecap-latin-overlay-area');
    overlay.dataset.kecapUi = '';
    overlay.setAttribute('aria-hidden', 'true');
    (document.documentElement || document.body).append(overlay);
    let placeholderColor = computed.color;
    try { placeholderColor = getComputedStyle(field, '::placeholder').color || computed.color; } catch (_) {}
    const record = {
      overlay,
      color: computed.color,
      caretColor: computed.caretColor === 'auto' ? computed.color : computed.caretColor,
      placeholderColor,
      marked: field.hasAttribute('data-kecap-latin-display'),
      priorCaretVariable: field.style.getPropertyValue('--kecap-latin-caret-color'),
      priorCaretPriority: field.style.getPropertyPriority('--kecap-latin-caret-color'),
      priorCaretColor: field.style.getPropertyValue('caret-color'),
      priorCaretColorPriority: field.style.getPropertyPriority('caret-color')
    };
    if (!record.marked) field.setAttribute('data-kecap-latin-display', '');
    field.style.setProperty('--kecap-latin-caret-color', record.caretColor);
    field.style.setProperty('caret-color', record.caretColor, 'important');
    overlays.set(field, record);
    resizeObserver.observe(field);
    return record;
  }

  function updateField(field) {
    if (!enabled || !isSupportedField(field) || !field.isConnected) return;
    const record = overlays.get(field) || createOverlay(field);
    const computed = getComputedStyle(field);
    const rect = field.getBoundingClientRect();
    const overlay = record.overlay;
    if (!rect.width || !rect.height || computed.display === 'none' || computed.visibility === 'hidden') {
      overlay.style.display = 'none';
      return;
    }
    Object.assign(overlay.style, {
      display: 'block', left: rect.left + 'px', top: rect.top + 'px',
      width: rect.width + 'px', height: rect.height + 'px', boxSizing: computed.boxSizing,
      padding: computed.padding, borderWidth: computed.borderWidth, borderStyle: 'solid',
      borderColor: 'transparent', borderRadius: computed.borderRadius, color: fieldText(field) || !field.placeholder ? record.color : record.placeholderColor,
      fontFamily: '"Kecap Sunda Latin View", "Noto Sans Sundanese", sans-serif',
      fontSize: computed.fontSize, fontWeight: computed.fontWeight, fontStyle: computed.fontStyle,
      lineHeight: computed.lineHeight, letterSpacing: computed.letterSpacing,
      wordSpacing: computed.wordSpacing, textAlign: computed.textAlign,
      textIndent: computed.textIndent, textTransform: computed.textTransform,
      direction: computed.direction, opacity: computed.opacity, zIndex: '2147483646'
    });
    overlay.style.overflowWrap = field instanceof HTMLTextAreaElement && field.wrap === 'off' ? 'normal' : 'break-word';
    const value = fieldText(field) || (!field.placeholder ? '' : field.placeholder);
    const displayText = Aksara.transliterate(value, { digits: digitsEnabled });
    if (overlay.textContent !== displayText) overlay.textContent = displayText;
    if (!(field instanceof HTMLInputElement)) overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.overflowWrap = 'break-word';
    const fieldMaxX = field.scrollWidth - field.clientWidth, overlayMaxX = overlay.scrollWidth - overlay.clientWidth;
    const fieldMaxY = field.scrollHeight - field.clientHeight, overlayMaxY = overlay.scrollHeight - overlay.clientHeight;
    overlay.scrollLeft = fieldMaxX > 0 ? field.scrollLeft / fieldMaxX * overlayMaxX : 0;
    overlay.scrollTop = fieldMaxY > 0 ? field.scrollTop / fieldMaxY * overlayMaxY : 0;
  }

  function sync(root = document) {
    if (!enabled) return;
    const fields = [];
    if (root instanceof Element && isSupportedField(root)) fields.push(root);
    root.querySelectorAll?.('textarea,input[type="text"],input[type="search"],input[type="url"],input[type="tel"],input[type="email"],[contenteditable]:not([contenteditable="false"])').forEach(field => {
      if (isSupportedField(field)) fields.push(field);
    });
    for (const field of fields) updateField(field);
    for (const [field, record] of overlays) {
      if (field.isConnected) continue;
      record.overlay.remove();
      resizeObserver.unobserve(field);
      restoreCaretVariable(field,record);
      if (!record.marked) field.removeAttribute('data-kecap-latin-display');
      overlays.delete(field);
    }
  }

  function restoreCaretVariable(field,record) {
    if(record.priorCaretVariable)field.style.setProperty('--kecap-latin-caret-color',record.priorCaretVariable,record.priorCaretPriority);
    else field.style.removeProperty('--kecap-latin-caret-color');
    if(record.priorCaretColor)field.style.setProperty('caret-color',record.priorCaretColor,record.priorCaretColorPriority);
    else field.style.removeProperty('caret-color');
  }

  function queueSync() {
    if (!enabled || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; sync(); });
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    ensureStyles();
    sync();
    observer = new MutationObserver(() => sync());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function disable() {
    enabled = false;
    observer?.disconnect();
    observer = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    for (const [field, record] of overlays) {
      record.overlay.remove();
      resizeObserver.unobserve(field);
      restoreCaretVariable(field,record);
      if (!record.marked) field.removeAttribute('data-kecap-latin-display');
    }
    overlays.clear();
  }

  document.addEventListener('input', event => { const field=event.target instanceof Element?event.target.closest('[data-kecap-latin-display]'):null;if(field&&overlays.has(field))updateField(field); }, true);
  document.addEventListener('scroll', queueSync, true);
  window.addEventListener('resize', queueSync);
  try {
    chrome.storage.local.get(['latinDisplay', 'digits'], data => {
      digitsEnabled = data.digits !== false;
      if (data.latinDisplay === true) enable();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.digits) { digitsEnabled = changes.digits.newValue !== false; queueSync(); }
      if (changes.latinDisplay) changes.latinDisplay.newValue === true ? enable() : disable();
    });
  } catch (_) {}
})();
