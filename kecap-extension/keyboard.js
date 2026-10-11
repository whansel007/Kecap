(function () {
  'use strict';

  const CONSONANTS = [
    ['ᮊ','ka'],['ᮋ','qa'],['ᮌ','ga'],['ᮍ','nga'],['ᮎ','ca'],
    ['ᮏ','ja'],['ᮐ','za'],['ᮑ','nya'],['ᮒ','ta'],['ᮓ','da'],
    ['ᮔ','na'],['ᮕ','pa'],['ᮖ','fa'],['ᮗ','va'],['ᮘ','ba'],
    ['ᮙ','ma'],['ᮚ','ya'],['ᮛ','ra'],['ᮜ','la'],['ᮝ','wa'],
    ['ᮞ','sa'],['ᮟ','xa'],['ᮠ','ha'],['ᮮ','kha'],['ᮯ','sya']
  ];
  const VOWELS = [['ᮃ','a'],['ᮄ','i'],['ᮅ','u'],['ᮆ','é'],['ᮇ','o'],['ᮈ','e'],['ᮉ','eu']];
  const VARIANTS = [
    ['a',''],['i','ᮤ'],['u','ᮥ'],['é','ᮦ'],['o','ᮧ'],['e','ᮨ'],['eu','ᮩ'],['no vowel','᮪']
  ];
  const SIGNS = [
    ['ᮡ','medial y · Pamingkal'],['ᮢ','medial r · Panyakra'],['ᮣ','medial l · Panyiku'],
    ['ᮤ','vowel i · Panghulu'],['ᮥ','vowel u · Panyuku'],['ᮦ','vowel é · Panéléng'],
    ['ᮧ','vowel o · Panolong'],['ᮨ','vowel e · Pamepet'],['ᮩ','vowel eu · Paneuleung'],
    ['᮪','remove vowel · Pamaéh'],['ᮀ','final ng · Panyecek'],['ᮁ','final r · Panglayar'],['ᮂ','final h · Pangwisad']
  ];
  const SYLLABLE_MODIFIERS = [
    ['ᮢ','Panyakra','medial'],['ᮣ','Panyiku','medial'],['ᮡ','Pamingkal','medial'],
    ['ᮀ','Panyecek','final'],['ᮁ','Panglayar','final'],['ᮂ','Pangwisad','final']
  ].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'}));
  const DIGITS = Array.from({length:10},(_,i)=>[String.fromCodePoint(0x1BB0+i),String(i)]);
  const FONT_URL = chrome.runtime.getURL('fonts/NotoSansSundanese-Regular.ttf');

  const DEFAULT_TOGGLE_SHORTCUT={key:'k',alt:true,ctrl:false,meta:false,shift:true};
  let toggleShortcut=DEFAULT_TOGGLE_SHORTCUT;
  let host=null, shadow=null, panel=null, keyArea=null, variantArea=null, messageArea=null;
  let target=null, inputSelection=null, savedRange=null, pending=null, activeTab='Consonants', listenersInstalled=false, keyboardHasFocus=false, navIndex=0, baseNavIndex=0;

  function isTextControl(el) {
    if (el instanceof HTMLTextAreaElement) return !el.disabled&&!el.readOnly;
    if (!(el instanceof HTMLInputElement) || el.disabled || el.readOnly) return false;
    return ['text','search','url','tel'].includes(el.type);
  }
  function editableRoot(el) {
    if (!(el instanceof Element)) return null;
    const control=el.closest('textarea,input');
    if (control&&isTextControl(control)) return control;
    const ce=el.closest('[contenteditable]:not([contenteditable="false"])');
    return ce&&ce.isContentEditable?ce:null;
  }
  function isControl(el) { return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement; }
  function rangeBelongsTo(range,el) { return !!range&&!!el&&(range.commonAncestorContainer===el||el.contains(range.commonAncestorContainer)); }
  function capturePosition() {
    if (!target||!target.isConnected) return;
    if (isControl(target)) {
      if (document.activeElement===target) {
        inputSelection={start:target.selectionStart??target.value.length,end:target.selectionEnd??target.value.length};
      }
      return;
    }
    const selection=document.getSelection();
    if (selection?.rangeCount) {
      const range=selection.getRangeAt(0);
      if (rangeBelongsTo(range,target)) savedRange=range.cloneRange();
    }
  }
  function rememberEditor(el) {
    const root=editableRoot(el);
    if (!root) return;
    target=root;
    if (isControl(root)) inputSelection={start:root.selectionStart??root.value.length,end:root.selectionEnd??root.value.length};
    else capturePosition();
    if (messageArea) messageArea.textContent='';
  }
  function rememberFromSelection() {
    const selection=document.getSelection();
    if (!selection?.rangeCount) return;
    const range=selection.getRangeAt(0);
    const root=editableRoot(range.commonAncestorContainer.nodeType===Node.ELEMENT_NODE?range.commonAncestorContainer:range.commonAncestorContainer.parentElement);
    if (root) { target=root; savedRange=range.cloneRange(); }
  }
  document.addEventListener('focusin',e=>rememberEditor(e.target),true);
  document.addEventListener('selectionchange',()=>{if(!isControl(target))rememberFromSelection();else capturePosition();},true);
  document.addEventListener('select',capturePosition,true);
  document.addEventListener('keyup',capturePosition,true);
  document.addEventListener('mouseup',capturePosition,true);

  function notify(text) { if (messageArea) messageArea.textContent=text; }
  function dispatchInput(el,data,inputType) {
    let event;
    try { event=new InputEvent('input',{bubbles:true,inputType,data}); }
    catch (_) { event=new Event('input',{bubbles:true}); }
    el.dispatchEvent(event);
  }
  function prepareTarget() {
    if (target&&target.isConnected) return true;
    const active=editableRoot(document.activeElement);
    if (active) rememberEditor(active);
    else rememberFromSelection();
    if (target&&target.isConnected) return true;
    notify('Click inside a text field or editable page area, then choose a key.');
    return false;
  }
  function focusTarget() {
    try { target.focus({preventScroll:true}); } catch (_) { try { target.focus(); } catch (_) {} }
  }
  function endRange(el) {
    const range=document.createRange();
    range.selectNodeContents(el); range.collapse(false); return range;
  }
  function contentRange() {
    if (savedRange&&rangeBelongsTo(savedRange,target)) return savedRange.cloneRange();
    return endRange(target);
  }
  function insertAtRange(el,range,text) {
    range.deleteContents();
    const node=document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node); range.collapse(true);
    const selection=document.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    savedRange=range.cloneRange();
    dispatchInput(el,text,'insertText');
    return {node,range:range.cloneRange()};
  }
  function insertText(text) {
    if (!prepareTarget()) return null;
    focusTarget();
    if (isControl(target)) {
      const value=target.value;
      const start=Math.min(inputSelection?.start??target.selectionStart??value.length,value.length);
      const end=Math.min(inputSelection?.end??target.selectionEnd??start,value.length);
      target.setRangeText(text,start,end,'end');
      const caret=start+text.length;
      inputSelection={start:caret,end:caret};
      dispatchInput(target,text,'insertText');
      return {target,start,end:caret,glyph:text};
    }
    const range=contentRange();
    const result=insertAtRange(target,range,text);
    return {target,node:result.node,range:result.range,glyph:text};
  }
  function applyVariant(suffix) {
    if (!pending) return;
    const item=pending;
    if (!item.target?.isConnected) return;
    focusTarget();
    const addition=suffix+(item.finalMarks||[]).join('');
    if (isControl(item.target)) {
      const current=item.target.value.slice(item.start,item.end);
      if (!current.startsWith(item.glyph)) return;
      if(addition){item.target.setRangeText(addition,item.end,item.end,'end');item.end+=addition.length;item.currentText+=addition;inputSelection={start:item.end,end:item.end};dispatchInput(item.target,addition,'insertText');}
    } else {
      if (item.node?.isConnected&&item.target.contains(item.node)&&item.node.data.startsWith(item.glyph)) {
        if(addition){item.node.data+=addition;const range=document.createRange();range.setStart(item.node,item.node.data.length);range.collapse(true);const selection=document.getSelection();selection.removeAllRanges();selection.addRange(range);savedRange=range.cloneRange();dispatchInput(item.target,addition,'insertText');}
      } else if(addition) {
        const range=item.range?.cloneRange();
        if(range&&rangeBelongsTo(range,item.target))insertAtRange(item.target,range,addition);
      }
    }
    pending=null;
    renderVariants(null);
  }
  function addSyllableModifier(glyph,kind,button) {
    if(!pending)return;
    const item=pending;
    if(kind==='final'){
      if(!item.finalMarks.includes(glyph))item.finalMarks.push(glyph);
    } else {
      if(item.medialMarks.includes(glyph))return;
      focusTarget();
      if(isControl(item.target)){
        item.target.setRangeText(glyph,item.end,item.end,'end');item.end+=glyph.length;item.currentText+=glyph;inputSelection={start:item.end,end:item.end};dispatchInput(item.target,glyph,'insertText');
      } else if(item.node?.isConnected&&item.target.contains(item.node)&&item.node.data.startsWith(item.glyph)) {
        item.node.data+=glyph;item.currentText+=glyph;const range=document.createRange();range.setStart(item.node,item.node.data.length);range.collapse(true);const selection=document.getSelection();selection.removeAllRanges();selection.addRange(range);savedRange=range.cloneRange();dispatchInput(item.target,glyph,'insertText');
      } else if(item.range&&rangeBelongsTo(item.range,item.target)) {
        const result=insertAtRange(item.target,item.range.cloneRange(),glyph);item.range=result.range;item.currentText+=glyph;
      }
      item.medialMarks.push(glyph);
    }
    button?.classList.add('modifier-selected');button?.setAttribute('aria-pressed','true');
  }
  function previousCodePointStart(value,end) {
    let start=end-1;
    if (start>0&&/^[\uDC00-\uDFFF]$/.test(value[start])&&/[\uD800-\uDBFF]/.test(value[start-1])) start--;
    return start;
  }
  function isSundaneseMark(value,start) {
    const code=value.codePointAt(start);
    return (code>=0x1BA1&&code<=0x1BAA)||(code>=0x1B80&&code<=0x1B82);
  }
  function previousClusterStart(value,end) {
    if (end<=0) return 0;
    let start=previousCodePointStart(value,end);
    while(start>0&&isSundaneseMark(value,start)) start=previousCodePointStart(value,start);
    return start;
  }
  function backspace() {
    pending=null; renderVariants(null);
    if (!prepareTarget()) return;
    focusTarget();
    if (isControl(target)) {
      let start=Math.min(inputSelection?.start??target.selectionStart??target.value.length,target.value.length);
      let end=Math.min(inputSelection?.end??target.selectionEnd??start,target.value.length);
      if (start===end) start=previousClusterStart(target.value,start);
      if (start===end) return;
      target.setRangeText('',start,end,'end');
      inputSelection={start,end:start};
      dispatchInput(target,null,'deleteContentBackward'); return;
    }
    const range=contentRange();
    if (range.collapsed) {
      const selection=document.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      if (typeof selection.modify==='function') selection.modify('extend','backward','character');
      if (selection.rangeCount) range.setStart(selection.getRangeAt(0).startContainer,selection.getRangeAt(0).startOffset),range.setEnd(selection.getRangeAt(0).endContainer,selection.getRangeAt(0).endOffset);
    }
    if (range.collapsed) return;
    range.deleteContents(); range.collapse(true);
    const selection=document.getSelection(); selection.removeAllRanges(); selection.addRange(range); savedRange=range.cloneRange();
    dispatchInput(target,null,'deleteContentBackward');
  }

  function makeButton(glyph,label,title,onClick,className='key') {
    const button=document.createElement('button');
    button.type='button'; button.className=className; button.title=title||label; button.setAttribute('aria-label',title||label);
    const main=document.createElement('span'); main.className='glyph'; main.textContent=glyph;
    const sub=document.createElement('small'); sub.textContent=label;
    button.append(main,sub);
    button.addEventListener('pointerdown',e=>e.preventDefault());
    button.addEventListener('click',e=>{e.stopPropagation();keyboardHasFocus=true;const index=navButtons().indexOf(button);if(index>=0){navIndex=index;updateNavHighlight();}onClick();});
    return button;
  }
  function navButtons() { return variantArea&&!variantArea.hidden?Array.from(variantArea.querySelectorAll('button.key')):Array.from(keyArea?.querySelectorAll('button.key')||[]); }
  function navColumns() { if(variantArea&&!variantArea.hidden)return innerWidth<=430?4:8;return activeTab==='Vowels'?7:activeTab==='Signs'?3:5; }
  function updateNavHighlight() { const items=navButtons();items.forEach((button,i)=>button.classList.toggle('nav-selected',i===navIndex)); }
  function revealInPanel(element) {
    if(!panel||!element)return;
    const panelRect=panel.getBoundingClientRect(),elementRect=element.getBoundingClientRect();
    if(elementRect.top<panelRect.top)panel.scrollTop-=panelRect.top-elementRect.top;
    else if(elementRect.bottom>panelRect.bottom)panel.scrollTop+=elementRect.bottom-panelRect.bottom;
  }
  function moveNav(dx,dy) {
    const items=navButtons(), cols=navColumns(); if(!items.length)return;
    const rows=Math.ceil(items.length/cols),row=Math.floor(navIndex/cols),col=navIndex%cols;
    const nextRow=Math.max(0,Math.min(rows-1,row+dy)),nextCol=Math.max(0,Math.min(cols-1,col+dx));
    navIndex=Math.min(items.length-1,nextRow*cols+nextCol);updateNavHighlight();
    revealInPanel(items[navIndex]);
  }
  function handleKeyboardNav(e) {
    if(!host)return;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeKeyboard();return;}
    if(!keyboardHasFocus||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
    if(e.key==='Tab'){
      e.preventDefault();e.stopPropagation();
      const tabs=['Consonants','Vowels','Signs','Digits'];
      activeTab=tabs[(tabs.indexOf(activeTab)+1)%tabs.length];
      panel?.querySelectorAll('.tab').forEach(tab=>tab.setAttribute('aria-selected',String(tab.textContent===activeTab)));
      renderKeys();
      return;
    }
    const directions={w:[0,-1],ArrowUp:[0,-1],s:[0,1],ArrowDown:[0,1],a:[-1,0],ArrowLeft:[-1,0],d:[1,0],ArrowRight:[1,0]};
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    if(directions[key]){e.preventDefault();e.stopPropagation();moveNav(...directions[key]);return;}
    if(e.key==='Shift'){const button=navButtons()[navIndex];if(button){e.preventDefault();e.stopPropagation();button.click();}}
  }
  function renderVariants(consonant) {
    variantArea.replaceChildren();
    if (!consonant) { variantArea.hidden=true;navIndex=baseNavIndex;updateNavHighlight();if(keyArea?.children[navIndex])revealInPanel(keyArea.children[navIndex]);return; }
    baseNavIndex=navIndex;
    variantArea.hidden=false;
    const heading=document.createElement('div'); heading.className='variant-heading'; heading.textContent='Choose the syllable for '+consonant.latin;
    const choices=document.createElement('div'); choices.className='variant-choices';
    for (const [vowel,suffix] of VARIANTS) {
      const glyph=consonant.glyph+suffix;
      const label=vowel==='no vowel'?consonant.latin.slice(0,-1):consonant.latin.slice(0,-1)+vowel;
      const title=vowel==='no vowel'?label+' (no vowel)':label;
      const button=makeButton(glyph,label,title,()=>applyVariant(suffix),'key variant');
      choices.append(button);
    }
    const modifierHeading=document.createElement('div');modifierHeading.className='modifier-heading';modifierHeading.textContent='Rarangken';
    const modifierChoices=document.createElement('div');modifierChoices.className='modifier-choices';
    for(const [glyph,label,kind] of SYLLABLE_MODIFIERS){
      const button=makeButton(glyph,'',label,()=>addSyllableModifier(glyph,kind,button),'key modifier');button.setAttribute('aria-pressed','false');modifierChoices.append(button);
    }
    variantArea.append(heading,choices,modifierHeading,modifierChoices);navIndex=0;updateNavHighlight();requestAnimationFrame(()=>revealInPanel(variantArea));
  }
  function renderKeys() {
    keyArea.replaceChildren(); variantArea.hidden=true; pending=null;
    if (activeTab==='Consonants') {
      keyArea.className='key-area consonant-grid';
      [...CONSONANTS].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'})).forEach(([glyph,latin])=>keyArea.append(makeButton(glyph,latin,latin,()=>{
        const inserted=insertText(glyph);
        if (inserted) { pending=Object.assign(inserted,{currentText:glyph,medialMarks:[],finalMarks:[]}); renderVariants({glyph,latin}); }
      })));
    } else if (activeTab==='Vowels') {
      keyArea.className='key-area vowel-grid';
      [...VOWELS].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'})).forEach(([glyph,latin])=>keyArea.append(makeButton(glyph,latin,latin,()=>insertText(glyph))));
    } else if (activeTab==='Signs') {
      keyArea.className='key-area sign-grid';
      [...SIGNS].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'})).forEach(([glyph,label])=>keyArea.append(makeButton(glyph,label,label,()=>insertText(glyph))));
    } else {
      keyArea.className='key-area digit-grid';
      DIGITS.forEach(([glyph,label])=>keyArea.append(makeButton(glyph,label,label,()=>insertText(glyph))));
    }
    navIndex=Math.min(navColumns()-1,Math.max(0,keyArea.children.length?keyArea.children.length-1:0));updateNavHighlight();
  }
  function buildPanel() {
    if (host) return;
    host=document.createElement('div'); host.dataset.kecapUi='';
    host.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
    shadow=host.attachShadow({mode:'closed'});
    const style=document.createElement('style');
    style.textContent=`@font-face{font-family:"Kecap Sunda Keyboard";src:url("${FONT_URL}")} :host{all:initial} .panel{position:fixed;left:16px;bottom:16px;width:min(558px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;pointer-events:auto;border:1px solid #c7a87f;border-radius:14px;background:#fff8e9;color:#2a1911;box-shadow:0 10px 34px #0005;font:14px/1.4 system-ui,sans-serif} .bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 11px;background:#2a120c;color:#fff1d2;border-radius:13px 13px 0 0;cursor:move;user-select:none;touch-action:none} .title{font-weight:700;font-size:14px}.bar small{display:block;color:#e8c98e;font-size:10px;font-weight:400}.close{flex:none;border:1px solid #ffffff55;border-radius:7px;background:#ffffff18;color:white;width:30px;height:28px;font:20px/1 system-ui;cursor:pointer}.inside{padding:7px 10px 8px}.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:7px}.tab,.utility{border:1px solid #c8b493;border-radius:7px;background:#f0dfbd;color:#542518;padding:6px 9px;font:600 12px system-ui;cursor:pointer}.tab[aria-selected=true]{background:#542518;border-color:#542518;color:#fff}.key-area{display:grid;gap:5px}.consonant-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.vowel-grid{grid-template-columns:repeat(7,minmax(0,1fr))}.sign-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.digit-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.key{min-width:0;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:1px solid #ddc9a7;border-radius:8px;background:#fffdf6;color:#2a1911;cursor:pointer}.key:hover{border-color:#aa502b;background:#f7e9cd}.glyph{font:30px/1.15 "Kecap Sunda Keyboard","Noto Sans Sundanese",sans-serif}.key small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px/1.2 system-ui,sans-serif;color:#634e40}.sign-grid .key{min-height:50px}.variant-area{margin-top:7px;padding:7px;border:1px solid #d9c3a0;border-radius:9px;background:#f7ebd4}.variant-heading{margin-bottom:5px;color:#542518;font-weight:700;font-size:12px}.variant-choices,.modifier-choices{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:4px}.variant{min-height:44px;padding:2px}.variant .glyph{font-size:27px}.variant small{font-size:9px}.modifier-heading{margin-top:7px;padding-top:6px;border-top:1px solid #e3d1b2;color:#542518;font-weight:700;font-size:11px}.modifier{min-height:38px;padding:2px}.modifier .glyph{font-size:23px}.modifier small{font-size:9px}.modifier-selected{background:#f2dbb5;border-color:#aa502b}.tools{display:flex;gap:6px;margin-top:7px;padding-top:6px;border-top:1px solid #e3d1b2}.utility{min-width:82px}.utility.space{flex:1}.message{min-height:0;margin-top:4px;color:#794326;font-size:11px}.message:empty{display:none} .key.nav-selected{outline:3px solid #b65a32;outline-offset:1px;background:#f2dbb5} .panel:focus{outline:none} @media(max-width:430px){.consonant-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.variant-choices,.modifier-choices{grid-template-columns:repeat(4,minmax(0,1fr))}.sign-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    style.textContent+='.modifier-choices{grid-template-columns:repeat(6,minmax(0,1fr))}.modifier small{display:none}';
    panel=document.createElement('section'); panel.className='panel'; panel.tabIndex=0; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','On-screen Aksara Sunda keyboard');
    const bar=document.createElement('div'); bar.className='bar';
    const title=document.createElement('div'); title.className='title'; title.textContent='Aksara Sunda keyboard';
    const subtitle=document.createElement('small'); subtitle.textContent='Drag to move · Tab switches tabs · W A S D or arrows · Shift selects · Esc closes'; title.append(subtitle);
    const close=document.createElement('button'); close.className='close'; close.type='button'; close.textContent='×'; close.title='Close keyboard'; close.setAttribute('aria-label','Close keyboard'); close.addEventListener('pointerdown',e=>e.preventDefault()); close.addEventListener('click',closeKeyboard);
    bar.append(title,close);
    const inside=document.createElement('div'); inside.className='inside';
    const tabs=document.createElement('div'); tabs.className='tabs';
    for (const name of ['Consonants','Vowels','Signs','Digits']) {
      const tab=document.createElement('button'); tab.type='button'; tab.className='tab'; tab.textContent=name; tab.setAttribute('aria-selected',String(name===activeTab)); tab.addEventListener('pointerdown',e=>e.preventDefault()); tab.addEventListener('click',()=>{keyboardHasFocus=true;activeTab=name;tabs.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x===tab)));renderKeys();}); tabs.append(tab);
    }
    keyArea=document.createElement('div');
    variantArea=document.createElement('div'); variantArea.className='variant-area'; variantArea.hidden=true;
    const tools=document.createElement('div'); tools.className='tools';
    const back= document.createElement('button'); back.type='button'; back.className='utility'; back.textContent='⌫ Backspace'; back.addEventListener('pointerdown',e=>e.preventDefault()); back.addEventListener('click',backspace);
    const space=document.createElement('button'); space.type='button'; space.className='utility space'; space.textContent='Space'; space.addEventListener('pointerdown',e=>e.preventDefault()); space.addEventListener('click',()=>{pending=null;renderVariants(null);insertText(' ');});
    tools.append(back,space);
    messageArea=document.createElement('div'); messageArea.className='message'; messageArea.setAttribute('aria-live','polite');
    inside.append(tabs,keyArea,variantArea,tools,messageArea); panel.append(bar,inside); shadow.append(style,panel); document.documentElement.append(host);
    renderKeys(); installDrag(bar);
    host.addEventListener('pointerdown',()=>{keyboardHasFocus=true;},true);
    panel.focus({preventScroll:true});keyboardHasFocus=true;
    if(!listenersInstalled){document.addEventListener('pointerdown',outsidePointer,true);window.addEventListener('resize',clampPanel);document.addEventListener('keydown',handleKeyboardNav,true);listenersInstalled=true;}
  }
  function outsidePointer(e) {
    if (!host||e.composedPath().includes(host)) return;
    keyboardHasFocus=false;
    pending=null; renderVariants(null);
    const root=editableRoot(e.target);
    if (root) rememberEditor(root); else {target=null;inputSelection=null;savedRange=null;}
  }
  function closeKeyboard() { if(host)host.remove();host=null;panel=null;keyArea=null;variantArea=null;messageArea=null;pending=null; }
  function installDrag(handle) {
    let drag=null;
    handle.addEventListener('pointerdown',e=>{
      if(e.target.closest('button'))return;
      const r=panel.getBoundingClientRect(); drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};
      handle.setPointerCapture(e.pointerId); panel.style.left=r.left+'px'; panel.style.top=r.top+'px'; panel.style.bottom='auto'; e.preventDefault();
    });
    handle.addEventListener('pointermove',e=>{if(!drag)return;panel.style.left=(drag.left+e.clientX-drag.x)+'px';panel.style.top=(drag.top+e.clientY-drag.y)+'px';clampPanel();});
    const stop=()=>{drag=null;}; handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);
  }
  function clampPanel() {
    if(!panel||!panel.isConnected)return;
    const r=panel.getBoundingClientRect(), pad=8;
    panel.style.left=Math.max(pad,Math.min(innerWidth-r.width-pad,r.left))+'px';
    panel.style.top=Math.max(pad,Math.min(innerHeight-r.height-pad,r.top))+'px';
    panel.style.bottom='auto';
  }
  function openKeyboard() {
    if(!target) { const active=editableRoot(document.activeElement); if(active)rememberEditor(active);else rememberFromSelection(); }
    buildPanel();
    panel?.focus({preventScroll:true});keyboardHasFocus=true;
    if(!target)notify('Click inside a text field or editable page area, then choose a key.');
    else notify('');
  }
  function matchesToggleShortcut(e) {
    const shortcut=toggleShortcut;
    return !e.repeat&&!e.isComposing&&e.key.toLowerCase()===shortcut.key&&e.ctrlKey===!!shortcut.ctrl&&e.altKey===!!shortcut.alt&&e.shiftKey===!!shortcut.shift&&e.metaKey===!!shortcut.meta;
  }
  document.addEventListener('keydown',e=>{
    if(!matchesToggleShortcut(e))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(host)closeKeyboard();else openKeyboard();
  },true);
  chrome.storage.local.get('keyboardShortcut',data=>{if(data.keyboardShortcut?.key)toggleShortcut=data.keyboardShortcut;});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.keyboardShortcut)toggleShortcut=changes.keyboardShortcut.newValue||DEFAULT_TOGGLE_SHORTCUT;});
  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse)=>{
    if(msg?.type!=='KECAP_OPEN_KEYBOARD')return false;
    openKeyboard(); sendResponse({ok:true}); return true;
  });
})();
