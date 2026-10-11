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
    ['ᮢ','Panyakra','medial','r','-r-'],['ᮣ','Panyiku','medial','l','-l-'],['ᮡ','Pamingkal','medial','y','-y-'],
    ['ᮀ','Panyecek','final','ng','-ng'],['ᮁ','Panglayar','final','r','-r'],['ᮂ','Pangwisad','final','h','-h']
  ].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'}));
  const DIGITS = Array.from({length:10},(_,i)=>[String.fromCodePoint(0x1BB0+i),String(i)]);
  const FONT_URL = chrome.runtime.getURL('fonts/NotoSansSundanese-Regular.ttf');

  function hasExtensionContext() {
    try { return Boolean(chrome.runtime?.id); } catch (_) { return false; }
  }
  function readLocal(keys, callback) {
    if (!hasExtensionContext()) { callback({}); return; }
    try { chrome.storage.local.get(keys, data => { if (hasExtensionContext()) callback(data); }); } catch (_) { callback({}); }
  }
  function writeLocal(values) {
    if (!hasExtensionContext()) return;
    try { chrome.storage.local.set(values); } catch (_) {}
  }
  const tr=(text,substitutions)=>globalThis.KecapLocale?.translate(text,substitutions)||String(text).replace(/\{(\w+)\}/g,(_,key)=>substitutions?.[key]??`{${key}}`);

  const DEFAULT_TOGGLE_SHORTCUT={key:'k',alt:true,ctrl:false,meta:false,shift:true};
  const DEFAULT_KEYBOARD_LAYOUT='alphabetical';
  const SIMILAR_GLYPH_ORDER=['ka','ra','sa','xa','ha','pa','fa','va','la','ta','na','ga','nga','nya','za','da','ja','ba','ca','ya','wa','ma','qa','kha','sya'];
  let toggleShortcut=DEFAULT_TOGGLE_SHORTCUT;
  let latinDisplayMode=false;
  let keyboardLayout=DEFAULT_KEYBOARD_LAYOUT;
  let host=null, shadow=null, panel=null, keyArea=null, variantArea=null, messageArea=null, layoutSelect=null, layoutHint=null, keyboardTip=null;
  let customKeyOrders={};
  let panelResizeObserver=null, boundsSaveTimer=0, boundsRestored=false;
  let target=null, inputSelection=null, savedRange=null, pending=null, activeTab='Consonants', listenersInstalled=false, keyboardHasFocus=false, rightShiftCandidate=false, navIndex=0, baseNavIndex=0;

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
    updateKeyboardTip();
  }
  function rememberFromSelection() {
    const selection=document.getSelection();
    if (!selection?.rangeCount) return;
    const range=selection.getRangeAt(0);
    const root=editableRoot(range.commonAncestorContainer.nodeType===Node.ELEMENT_NODE?range.commonAncestorContainer:range.commonAncestorContainer.parentElement);
    if (root) { target=root; savedRange=range.cloneRange(); updateKeyboardTip(); }
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
    return false;
  }
  function focusTarget() {
    try { target.focus({preventScroll:true}); } catch (_) { try { target.focus(); } catch (_) {} }
    if(isControl(target)&&inputSelection) {
      try { target.setSelectionRange(inputSelection.start,inputSelection.end); } catch (_) {}
    } else if(target&&!isControl(target)&&rangeBelongsTo(savedRange,target)) {
      const selection=document.getSelection();selection.removeAllRanges();selection.addRange(savedRange.cloneRange());
    }
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
  function applyVariant(suffix,vowel) {
    if (!pending) return;
    const item=pending;
    if (!item.target?.isConnected) return;
    focusTarget();
    const vowelText=item.latinMode?(vowel==='no vowel'?'':vowel):suffix;
    const addition=vowelText+(item.finalMarks||[]).map(mark=>mark.text).join('');
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
  function addSyllableModifier(glyph,kind,latinSound,button) {
    if(!pending)return;
    const item=pending;
    const isSelected=button?.getAttribute('aria-pressed')==='true';
    if(isSelected) {
      if(kind==='final')item.finalMarks=item.finalMarks.filter(mark=>mark.glyph!==glyph);
      else {
        const mark=item.medialMarks.find(entry=>entry.glyph===glyph);
        if(mark)removeMedialMark(item,mark);
        item.medialMarks=item.medialMarks.filter(entry=>entry.glyph!==glyph);
      }
      button?.classList.remove('modifier-selected');button?.setAttribute('aria-pressed','false');
      return;
    }
    if(kind==='final'){
      if(!item.finalMarks.some(mark=>mark.glyph===glyph))item.finalMarks.push({glyph,text:item.latinMode?latinSound:glyph});
    } else {
      if(item.medialMarks.some(mark=>mark.glyph===glyph))return;
      const markText=item.latinMode?latinSound:glyph;
      focusTarget();
      if(isControl(item.target)){
        const start=item.end;item.target.setRangeText(markText,start,start,'end');item.end+=markText.length;item.currentText+=markText;item.medialMarks.push({glyph,text:markText,start});inputSelection={start:item.end,end:item.end};dispatchInput(item.target,markText,'insertText');
      } else if(item.node?.isConnected&&item.target.contains(item.node)&&item.node.data.startsWith(item.glyph)) {
        const offset=item.node.data.length;item.node.data+=markText;item.currentText+=markText;item.medialMarks.push({glyph,text:markText,node:item.node,offset});const range=document.createRange();range.setStart(item.node,item.node.data.length);range.collapse(true);const selection=document.getSelection();selection.removeAllRanges();selection.addRange(range);savedRange=range.cloneRange();dispatchInput(item.target,markText,'insertText');
      } else if(item.range&&rangeBelongsTo(item.range,item.target)) {
        const result=insertAtRange(item.target,item.range.cloneRange(),markText);item.range=result.range;item.currentText+=markText;item.medialMarks.push({glyph,text:markText,node:result.node,offset:0});
      }
    }
    button?.classList.add('modifier-selected');button?.setAttribute('aria-pressed','true');
  }
  function removeMedialMark(item,mark) {
    focusTarget();
    if(isControl(item.target)&&Number.isFinite(mark.start)) {
      item.target.setRangeText('',mark.start,mark.start+mark.text.length,'preserve');
      item.end-=mark.text.length;
      for(const other of item.medialMarks)if(other!==mark&&Number.isFinite(other.start)&&other.start>mark.start)other.start-=mark.text.length;
      item.target.setSelectionRange(item.end,item.end);inputSelection={start:item.end,end:item.end};
    } else if(mark.node?.isConnected&&item.target.contains(mark.node)) {
      const offset=Math.max(0,Math.min(mark.offset,mark.node.data.length));
      mark.node.data=mark.node.data.slice(0,offset)+mark.node.data.slice(offset+mark.text.length);
      for(const other of item.medialMarks)if(other!==mark&&other.node===mark.node&&other.offset>offset)other.offset-=mark.text.length;
      const range=document.createRange();range.setStart(mark.node,Math.min(mark.node.data.length,offset));range.collapse(true);
      const selection=document.getSelection();selection.removeAllRanges();selection.addRange(range);savedRange=range.cloneRange();
    }
    dispatchInput(item.target,null,'deleteContentBackward');
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
    button.type='button'; button.className=className; button.title=tr(title||label); button.setAttribute('aria-label',tr(title||label));
    if(className==='key') {
      button.dataset.keyId=glyph;
      button.draggable=keyboardLayout==='custom';
      button.addEventListener('dragstart',event=>{
        if(keyboardLayout!=='custom'){event.preventDefault();return;}
        event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',glyph);
      });
      button.addEventListener('dragover',event=>{if(keyboardLayout==='custom'){event.preventDefault();event.dataTransfer.dropEffect='move';}});
      button.addEventListener('drop',event=>{
        if(keyboardLayout!=='custom')return;
        event.preventDefault();
        try {
          if (!hasExtensionContext()) return;
          const dragged=event.dataTransfer?.getData('text/plain');
          reorderCustomKeys(activeTab,dragged,glyph);
        } catch (error) {
          const invalidated = /extension context invalidated/i.test(String(error?.message || error));
          if (!invalidated && hasExtensionContext()) throw error;
        }
      });
    }
    const main=document.createElement('span'); main.className='glyph'; main.textContent=glyph;
    const sub=document.createElement('small'); sub.textContent=tr(label);
    button.append(main,sub);
    button.addEventListener('pointerdown',e=>{if(!(className==='key'&&keyboardLayout==='custom'))e.preventDefault();});
    button.addEventListener('click',e=>{e.stopPropagation();keyboardHasFocus=true;const index=navButtons().indexOf(button);if(index>=0){navIndex=index;updateNavHighlight();}onClick();});
    return button;
  }
  function navButtons() { return variantArea&&!variantArea.hidden?Array.from(variantArea.querySelectorAll('button.key')):Array.from(keyArea?.querySelectorAll('button.key')||[]); }
  function navColumns() { if(variantArea&&!variantArea.hidden)return innerWidth<=430?4:8;return activeTab==='Signs'?3:keyboardLayout==='alphabetical-vowels'?6:5; }
  function navRowLengths() {
    const count=navButtons().length;
    if((!variantArea||variantArea.hidden)&&activeTab==='Consonants'&&keyboardLayout!=='alphabetical-vowels'&&keyArea?.querySelector('.vowel-row'))return [...Array(Math.ceil(CONSONANTS.length/5)).fill(5),VOWELS.length];
    const columns=navColumns();
    return Array.from({length:Math.ceil(count/columns)},(_,row)=>Math.min(columns,count-row*columns));
  }
  function updateNavHighlight() { const items=navButtons();items.forEach((button,i)=>button.classList.toggle('nav-selected',i===navIndex)); }
  function revealInPanel(element) {
    if(!panel||!element)return;
    const panelRect=panel.getBoundingClientRect(),elementRect=element.getBoundingClientRect();
    if(elementRect.top<panelRect.top)panel.scrollTop-=panelRect.top-elementRect.top;
    else if(elementRect.bottom>panelRect.bottom)panel.scrollTop+=elementRect.bottom-panelRect.bottom;
  }
  function savePanelBounds() {
    if(!panel||!boundsRestored)return;
    const rect=panel.getBoundingClientRect();
    writeLocal({keyboardBounds:{left:rect.left,top:rect.top,width:rect.width,height:rect.height}});
  }
  function queueSavePanelBounds() {
    if(!boundsRestored)return;
    clearTimeout(boundsSaveTimer);
    boundsSaveTimer=setTimeout(savePanelBounds,300);
  }
  function fitPanelToContent() {
    if(!panel?.isConnected)return;
    const current=panel.getBoundingClientRect().height,available=innerHeight-16,needed=panel.scrollHeight;
    if(needed>current+1&&needed<=available) {
      panel.style.height=Math.ceil(needed)+'px';
      clampPanel();
      queueSavePanelBounds();
    }
  }
  function restorePanelBounds() {
    readLocal('keyboardBounds',data=>{
      if(!panel?.isConnected)return;
      boundsRestored=true;
      const bounds=data.keyboardBounds;
      if(bounds&&['left','top','width','height'].every(key=>Number.isFinite(bounds[key]))) {
        panel.style.left=bounds.left+'px';panel.style.top=bounds.top+'px';panel.style.bottom='auto';
        panel.style.width=bounds.width+'px';panel.style.height=bounds.height+'px';
      }
      fitPanelToContent();
      clampPanel();
      panel.style.visibility='visible';
    });
  }
  function sortCustomOrder(items,tab) {
    if(keyboardLayout!=='custom')return items;
    const order=customKeyOrders[tab];
    if(!Array.isArray(order))return items;
    const rank=new Map(order.map((id,index)=>[id,index]));
    return [...items].sort((a,b)=>{
      const hasA=rank.has(a[0]),hasB=rank.has(b[0]);
      if(!hasA&&!hasB)return 0;
      if(!hasA)return 1;
      if(!hasB)return -1;
      return rank.get(a[0])-rank.get(b[0]);
    });
  }
  function reorderCustomKeys(tab,draggedId,targetId) {
    if(!draggedId||draggedId===targetId||!keyArea)return;
    const order=Array.from(keyArea.querySelectorAll('button.key'),button=>button.dataset.keyId);
    const from=order.indexOf(draggedId),to=order.indexOf(targetId);
    if(from<0||to<0)return;
    const [moved]=order.splice(from,1);order.splice(to,0,moved);
    customKeyOrders={...customKeyOrders,[tab]:order};
    writeLocal({keyboardCustomOrders:customKeyOrders});
    renderKeys();
  }
  function moveNav(dx,dy) {
    const items=navButtons(), rowLengths=navRowLengths(); if(!items.length)return;
    let row=0,start=0;
    while(row<rowLengths.length-1&&navIndex>=start+rowLengths[row])start+=rowLengths[row++];
    const col=navIndex-start, nextRow=dy?((row+dy)%rowLengths.length+rowLengths.length)%rowLengths.length:row;
    const nextStart=rowLengths.slice(0,nextRow).reduce((sum,length)=>sum+length,0), nextLength=rowLengths[nextRow];
    const nextCol=dx?((col+dx)%nextLength+nextLength)%nextLength:Math.min(col,nextLength-1);
    navIndex=nextStart+nextCol;updateNavHighlight();
    revealInPanel(items[navIndex]);
  }
  function handleKeyboardNav(e) {
    if(!host)return;
    if(e.code==='ShiftRight'){if(!e.repeat)rightShiftCandidate=true;return;}
    if(rightShiftCandidate)rightShiftCandidate=false;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeKeyboard();return;}
    if(!keyboardHasFocus||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
    if(e.key==='Tab'){
      e.preventDefault();e.stopPropagation();
      const tabs=Array.from(shadow.querySelectorAll('.tab:not([hidden])'));
      const current=tabs.findIndex(tab=>tab.dataset.tab===activeTab);
      const direction=e.shiftKey?-1:1;
      activeTab=tabs[(current+direction+tabs.length)%tabs.length]?.dataset.tab||'Consonants';
      tabs.forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.tab===activeTab)));
      renderKeys();
      return;
    }
    const directions={w:[0,-1],ArrowUp:[0,-1],s:[0,1],ArrowDown:[0,1],a:[-1,0],ArrowLeft:[-1,0],d:[1,0],ArrowRight:[1,0]};
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    if(directions[key]){e.preventDefault();e.stopPropagation();moveNav(...directions[key]);return;}
  }
  function handleKeyboardSelect(e) {
    if(e.code!=='ShiftRight'||!rightShiftCandidate)return;
    rightShiftCandidate=false;
    if(!host||!keyboardHasFocus)return;
    const button=navButtons()[navIndex];
    if(button){e.preventDefault();e.stopPropagation();button.click();}
  }
  function renderVariants(consonant) {
    variantArea.replaceChildren();
    if (!consonant) { variantArea.hidden=true;navIndex=baseNavIndex;updateNavHighlight();updateKeyboardTip();if(keyArea?.children[navIndex])revealInPanel(keyArea.children[navIndex]);return; }
    baseNavIndex=navIndex;
    variantArea.hidden=false;
    const heading=document.createElement('div'); heading.className='variant-heading'; heading.textContent=tr('Choose the syllable for {word}',{word:consonant.latin});
    const choices=document.createElement('div'); choices.className='variant-choices';
    for (const [vowel,suffix] of VARIANTS) {
      const glyph=consonant.glyph+suffix;
      const label=vowel==='no vowel'?consonant.latin.slice(0,-1):consonant.latin.slice(0,-1)+vowel;
      const title=vowel==='no vowel'?label+' (no vowel)':label;
      const button=makeButton(glyph,label,title,()=>applyVariant(suffix,vowel),'key variant');
      choices.append(button);
    }
    const modifierHeading=document.createElement('div');modifierHeading.className='modifier-heading';modifierHeading.textContent=tr('Rarangken');
    const modifierChoices=document.createElement('div');modifierChoices.className='modifier-choices';
    for(const [glyph,label,kind,latinSound,hint] of SYLLABLE_MODIFIERS){
      const button=makeButton(glyph,hint,label,()=>addSyllableModifier(glyph,kind,latinSound,button),'key modifier');button.setAttribute('aria-pressed','false');modifierChoices.append(button);
    }
    variantArea.append(heading,choices,modifierHeading,modifierChoices);navIndex=0;updateNavHighlight();updateKeyboardTip();requestAnimationFrame(()=>{fitPanelToContent();revealInPanel(variantArea);});
  }
  function latinForSign(glyph) {
    const sounds={'ᮡ':'y','ᮢ':'r','ᮣ':'l','ᮤ':'i','ᮥ':'u','ᮦ':'é','ᮧ':'o','ᮨ':'e','ᮩ':'eu','᮪':'','ᮀ':'ng','ᮁ':'r','ᮂ':'h'};
    return Object.prototype.hasOwnProperty.call(sounds,glyph)?sounds[glyph]:glyph;
  }
  function orderedConsonants() {
    if (keyboardLayout==='similar') {
      const byLabel=new Map(CONSONANTS.map(item=>[item[1],item]));
      return SIMILAR_GLYPH_ORDER.map(label=>byLabel.get(label)).filter(Boolean);
    }
    const consonants=[...CONSONANTS].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'}));
    if (keyboardLayout==='alphabetical-vowels') {
      return [...consonants,...VOWELS].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'}));
    }
    return sortCustomOrder(consonants,'Consonants');
  }
  function updateLayoutTabs() {
    if(layoutSelect)layoutSelect.value=keyboardLayout;
    if(layoutHint)layoutHint.hidden=keyboardLayout!=='custom';
    shadow?.querySelectorAll('.tab').forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.tab===activeTab)));
  }
  function updateKeyboardTip() {
    if(!keyboardTip)return;
    const title=keyboardTip.querySelector('strong'),description=keyboardTip.querySelector('span');
    const hasTarget=!!target?.isConnected;
    title.textContent=tr(hasTarget?'Text field active':'Click a text field first');
    keyboardTip.dataset.targetActive=String(hasTarget);
    if(activeTab==='Consonants'&&variantArea&&!variantArea.hidden) {
      description.textContent=tr('Choose any rarangken first, then choose a vowel. The vowel ends the syllable selection.');
    } else if(activeTab==='Consonants') {
      description.textContent=tr('Choose a consonant, add any rarangken, then choose a vowel. The vowel ends the syllable selection.');
    } else if(activeTab==='Signs') {
      title.textContent=tr('Rarangken and signs');description.textContent=tr('Choose a sign to add it to your text.');
    } else {
      title.textContent=tr('Aksara Sunda digits');description.textContent=tr('Choose a digit to add it to your text.');
    }
  }
  function renderKeys() {
    keyArea.replaceChildren(); variantArea.hidden=true; pending=null;
    if (activeTab==='Consonants') {
      keyArea.className='key-area '+(keyboardLayout==='alphabetical-vowels'?'combined-grid':'consonant-grid');
      orderedConsonants().forEach(([glyph,latin])=>keyArea.append(makeButton(glyph,latin,latin,()=>{
        if(VOWELS.some(vowel=>vowel[0]===glyph)) { insertText(latinDisplayMode?latin:glyph); return; }
        const typed=latinDisplayMode?latin.slice(0,-1):glyph;
        const inserted=insertText(typed);
        if (inserted) { pending=Object.assign(inserted,{glyph:typed,currentText:typed,medialMarks:[],finalMarks:[],latinMode:latinDisplayMode}); renderVariants({glyph,latin}); }
      })));
      if(keyboardLayout!=='alphabetical-vowels') {
        const vowelRow=document.createElement('div');vowelRow.className='vowel-row';
        sortCustomOrder([...VOWELS],'Consonants').forEach(([glyph,latin])=>vowelRow.append(makeButton(glyph,latin,latin,()=>insertText(latinDisplayMode?latin:glyph))));
        keyArea.append(vowelRow);
      }
    } else if (activeTab==='Signs') {
      keyArea.className='key-area sign-grid';
      sortCustomOrder([...SIGNS].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'})),'Signs').forEach(([glyph,label])=>keyArea.append(makeButton(glyph,label,label,()=>{const typed=latinDisplayMode?latinForSign(glyph):glyph;if(typed)insertText(typed);})))
    } else {
      keyArea.className='key-area digit-grid';
      sortCustomOrder(DIGITS,'Digits').forEach(([glyph,label])=>keyArea.append(makeButton(glyph,label,label,()=>insertText(latinDisplayMode?label:glyph))));
    }
    navIndex=Math.min(navColumns()-1,Math.max(0,navButtons().length-1));updateNavHighlight();updateKeyboardTip();
  }
  function buildPanel() {
    if (host) return;
    host=document.createElement('div'); host.dataset.kecapUi='';
    host.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
    shadow=host.attachShadow({mode:'closed'});
    const style=document.createElement('style');
    style.textContent=`@font-face{font-family:"Kecap Sunda Keyboard";src:url("${FONT_URL}")} :host{all:initial} .panel{position:fixed;left:16px;bottom:16px;width:min(760px,calc(100vw - 24px));height:min(640px,calc(100vh - 24px));min-width:min(420px,calc(100vw - 24px));min-height:min(360px,calc(100vh - 24px));max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);resize:both;overflow:auto;pointer-events:auto;border:1px solid #c7a87f;border-radius:14px;background:#fff8e9;color:#2a1911;box-shadow:0 10px 34px #0005;font:14px/1.4 system-ui,sans-serif} .bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 11px;background:#2a120c;color:#fff1d2;border-radius:13px 13px 0 0;cursor:move;user-select:none;touch-action:none} .title{font-weight:700;font-size:14px}.bar small{display:block;color:#e8c98e;font-size:10px;font-weight:400}.close{flex:none;border:1px solid #ffffff55;border-radius:7px;background:#ffffff18;color:white;width:30px;height:28px;font:20px/1 system-ui;cursor:pointer}.inside{padding:7px 10px 8px}.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:7px}.tab,.utility{border:1px solid #c8b493;border-radius:7px;background:#f0dfbd;color:#542518;padding:6px 9px;font:600 12px system-ui;cursor:pointer}.tab[aria-selected=true]{background:#542518;border-color:#542518;color:#fff}.key-area{display:grid;gap:5px}.consonant-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.vowel-grid{grid-template-columns:repeat(7,minmax(0,1fr))}.sign-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.digit-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.key{min-width:0;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:1px solid #ddc9a7;border-radius:8px;background:#fffdf6;color:#2a1911;cursor:pointer}.key:hover{border-color:#aa502b;background:#f7e9cd}.glyph{font:30px/1.15 "Kecap Sunda Keyboard","Noto Sans Sundanese",sans-serif}.key small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px/1.2 system-ui,sans-serif;color:#634e40}.sign-grid .key{min-height:50px}.variant-area{margin-top:7px;padding:7px;border:1px solid #d9c3a0;border-radius:9px;background:#f7ebd4}.variant-heading{margin-bottom:5px;color:#542518;font-weight:700;font-size:12px}.variant-choices,.modifier-choices{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:4px}.variant{min-height:44px;padding:2px}.variant .glyph{font-size:27px}.variant small{font-size:9px}.modifier-heading{margin-top:7px;padding-top:6px;border-top:1px solid #e3d1b2;color:#542518;font-weight:700;font-size:11px}.modifier{min-height:38px;padding:2px}.modifier .glyph{font-size:23px}.modifier small{font-size:9px}.modifier-selected{background:#f2dbb5;border-color:#aa502b}.tools{display:flex;gap:6px;margin-top:7px;padding-top:6px;border-top:1px solid #e3d1b2}.utility{min-width:82px}.utility.space{flex:1}.message{min-height:0;margin-top:4px;color:#794326;font-size:11px}.message:empty{display:none} .key.nav-selected{outline:3px solid #b65a32;outline-offset:1px;background:#f2dbb5} .panel:focus{outline:none} @media(max-width:430px){.consonant-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.variant-choices,.modifier-choices{grid-template-columns:repeat(4,minmax(0,1fr))}.sign-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    style.textContent+='.modifier-choices{grid-template-columns:repeat(6,minmax(0,1fr))}.modifier small{display:block;font-size:11px;line-height:1.1}.modifier{min-height:44px}.panel{width:min(760px,calc(100vw - 24px));display:flex;flex-direction:column}.bar{flex:none}.inside{display:flex;flex-direction:column;flex:1;min-height:0}.key{min-height:48px}.key small{font-size:13px}.variant{min-height:48px}.variant small{font-size:12px}.combined-grid{grid-template-columns:repeat(6,minmax(0,1fr))}.vowel-row{grid-column:1/-1;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-top:3px;padding-top:7px;border-top:1px solid #e3d1b2}.layout-control{display:flex;align-items:center;gap:5px;margin-left:auto;font-size:11px;font-weight:700;white-space:nowrap}.layout-select{max-width:190px;padding:6px;border:1px solid #c8b493;border-radius:7px;background:#fff8e9;color:#542518;font:12px system-ui}.layout-hint{margin:0 0 6px;color:#794326;font-size:11px}.keyboard-tip{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:110px;margin-top:8px;padding:18px;border:1px solid #e0ceac;border-radius:10px;background:#f7ebd4;color:#725a43;text-align:center}.keyboard-tip strong{font-size:15px;color:#542518}.keyboard-tip span{max-width:420px;font-size:13px;line-height:1.5}.key[draggable=true]{cursor:grab}.key[draggable=true]:active{cursor:grabbing}@media(max-width:430px){.combined-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.layout-control{width:100%;margin:0}.layout-select{flex:1;max-width:none}}';
    style.textContent+='.keyboard-tip{min-height:50px;margin-top:6px;padding:8px 12px;gap:4px}.keyboard-tip[data-target-active=true] strong{color:#3b6b42}.keyboard-tip[data-target-active=false] strong{color:#9a3c26}';
    panel=document.createElement('section'); panel.className='panel'; panel.style.visibility='hidden'; panel.tabIndex=0; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','On-screen Aksara Sunda keyboard');
    const bar=document.createElement('div'); bar.className='bar';
    const title=document.createElement('div'); title.className='title'; const titleText=document.createElement('span');titleText.className='panel-title';titleText.textContent=tr('Aksara Sunda keyboard');title.append(titleText);
    const subtitle=document.createElement('small'); subtitle.textContent=tr('Drag to move · Tab / Shift+Tab switches tabs · W A S D or arrows · tap Right Shift to select · Esc closes'); title.append(subtitle);
    const close=document.createElement('button'); close.className='close'; close.type='button'; close.textContent='×'; close.title=tr('Close keyboard'); close.setAttribute('aria-label',tr('Close keyboard')); close.addEventListener('pointerdown',e=>e.preventDefault()); close.addEventListener('click',closeKeyboard);
    bar.append(title,close);
    const inside=document.createElement('div'); inside.className='inside';
    const tabs=document.createElement('div'); tabs.className='tabs';
    for (const name of ['Consonants','Digits','Signs']) {
      const tab=document.createElement('button'); tab.type='button'; tab.className='tab'; tab.dataset.tab=name; tab.textContent=tr(name); tab.setAttribute('aria-selected',String(name===activeTab)); tab.addEventListener('pointerdown',e=>e.preventDefault()); tab.addEventListener('click',()=>{keyboardHasFocus=true;activeTab=name;tabs.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x===tab)));renderKeys();}); tabs.append(tab);
    }
    const layoutControl=document.createElement('label');layoutControl.className='layout-control';layoutControl.append(document.createTextNode(tr('Layout')));
    layoutSelect=document.createElement('select');layoutSelect.className='layout-select';layoutSelect.setAttribute('aria-label',tr('Keyboard layout'));
    for(const [value,label] of [['similar','Similar shapes'],['alphabetical','Alphabetical'],['alphabetical-vowels','Alphabetical + vowels'],['custom','Custom · drag to arrange']]){const option=document.createElement('option');option.value=value;option.textContent=tr(label);layoutSelect.append(option);}
    layoutSelect.value=keyboardLayout;layoutSelect.addEventListener('pointerdown',()=>{keyboardHasFocus=false;});layoutSelect.addEventListener('change',()=>{keyboardLayout=layoutSelect.value;keyboardHasFocus=true;updateLayoutTabs();renderKeys();writeLocal({keyboardLayout});if(target?.isConnected)focusTarget();});layoutControl.append(layoutSelect);tabs.append(layoutControl);
    layoutHint=document.createElement('div');layoutHint.className='layout-hint';layoutHint.textContent=tr('Drag and drop keys to arrange them.');layoutHint.hidden=keyboardLayout!=='custom';
    keyboardTip=document.createElement('div');keyboardTip.className='keyboard-tip';
    const tipTitle=document.createElement('strong'),tipDescription=document.createElement('span');keyboardTip.append(tipTitle,tipDescription);
    keyArea=document.createElement('div');
    variantArea=document.createElement('div'); variantArea.className='variant-area'; variantArea.hidden=true;
    const tools=document.createElement('div'); tools.className='tools';
    const back= document.createElement('button'); back.type='button'; back.className='utility backspace'; back.textContent=tr('⌫ Backspace'); back.addEventListener('pointerdown',e=>e.preventDefault()); back.addEventListener('click',backspace);
    const space=document.createElement('button'); space.type='button'; space.className='utility space'; space.textContent=tr('Space'); space.addEventListener('pointerdown',e=>e.preventDefault()); space.addEventListener('click',()=>{pending=null;renderVariants(null);insertText(' ');});
    tools.append(back,space);
    messageArea=document.createElement('div'); messageArea.className='message'; messageArea.setAttribute('aria-live','polite');
    inside.append(tabs,layoutHint,keyArea,variantArea,tools,messageArea,keyboardTip); panel.append(bar,inside); shadow.append(style,panel); document.documentElement.append(host);
    renderKeys(); installDrag(bar); restorePanelBounds();
    panelResizeObserver=new ResizeObserver(queueSavePanelBounds);panelResizeObserver.observe(panel);
    host.addEventListener('pointerdown',()=>{keyboardHasFocus=true;},true);
    keyboardHasFocus=true;
    if(!listenersInstalled){document.addEventListener('pointerdown',outsidePointer,true);window.addEventListener('resize',clampPanel);document.addEventListener('keydown',handleKeyboardNav,true);document.addEventListener('keyup',handleKeyboardSelect,true);listenersInstalled=true;}
  }
  function outsidePointer(e) {
    if (!host||e.composedPath().includes(host)) return;
    keyboardHasFocus=false;
    pending=null; renderVariants(null);
    const root=editableRoot(e.target);
    if (root) rememberEditor(root); else {target=null;inputSelection=null;savedRange=null;}
    updateKeyboardTip();
  }
  function closeKeyboard() { if(host){savePanelBounds();host.remove();}rightShiftCandidate=false;panelResizeObserver?.disconnect();panelResizeObserver=null;clearTimeout(boundsSaveTimer);boundsRestored=false;host=null;panel=null;keyArea=null;variantArea=null;messageArea=null;layoutSelect=null;layoutHint=null;keyboardTip=null;pending=null; }
  function installDrag(handle) {
    let drag=null;
    handle.addEventListener('pointerdown',e=>{
      if(e.target.closest('button'))return;
      const r=panel.getBoundingClientRect(); drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};
      handle.setPointerCapture(e.pointerId); panel.style.left=r.left+'px'; panel.style.top=r.top+'px'; panel.style.bottom='auto'; e.preventDefault();
    });
    handle.addEventListener('pointermove',e=>{if(!drag)return;panel.style.left=(drag.left+e.clientX-drag.x)+'px';panel.style.top=(drag.top+e.clientY-drag.y)+'px';clampPanel();});
    const stop=()=>{if(drag){drag=null;savePanelBounds();}}; handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);
  }
  function clampPanel() {
    if(!panel||!panel.isConnected)return;
    const r=panel.getBoundingClientRect(), pad=8;
    panel.style.left=Math.max(pad,Math.min(innerWidth-r.width-pad,r.left))+'px';
    panel.style.top=Math.max(pad,Math.min(innerHeight-r.height-pad,r.top))+'px';
    panel.style.bottom='auto';
  }
  function refreshKeyboardLanguage() {
    if(!host||!shadow)return;
    shadow.querySelector('.panel-title').textContent=tr('Aksara Sunda keyboard');
    shadow.querySelector('.bar small').textContent=tr('Drag to move · Tab / Shift+Tab switches tabs · W A S D or arrows · tap Right Shift to select · Esc closes');
    const close=shadow.querySelector('.close');close.title=tr('Close keyboard');close.setAttribute('aria-label',tr('Close keyboard'));
    shadow.querySelectorAll('.tab').forEach(tab=>tab.textContent=tr(tab.dataset.tab));
    const layoutText=shadow.querySelector('.layout-control')?.firstChild;if(layoutText)layoutText.textContent=tr('Layout');
    layoutSelect?.setAttribute('aria-label',tr('Keyboard layout'));
    const labels={similar:'Similar shapes',alphabetical:'Alphabetical','alphabetical-vowels':'Alphabetical + vowels',custom:'Custom · drag to arrange'};
    layoutSelect?.querySelectorAll('option').forEach(option=>option.textContent=tr(labels[option.value]));
    if(layoutHint)layoutHint.textContent=tr('Drag and drop keys to arrange them.');
    const back=shadow.querySelector('.backspace');if(back)back.textContent=tr('⌫ Backspace');
    const space=shadow.querySelector('.space');if(space)space.textContent=tr('Space');
    renderKeys();updateKeyboardTip();
  }
  function openKeyboard() {
    if(!target) { const active=editableRoot(document.activeElement); if(active)rememberEditor(active);else rememberFromSelection(); }
    buildPanel();
    keyboardHasFocus=true;
    if(target?.isConnected)focusTarget();
    notify('');
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
  readLocal(['keyboardShortcut','latinDisplay','keyboardLayout','keyboardCustomOrders','uiLanguage'],data=>{if(data.keyboardShortcut?.key)toggleShortcut=data.keyboardShortcut;latinDisplayMode=data.latinDisplay===true;keyboardLayout=data.keyboardLayout||DEFAULT_KEYBOARD_LAYOUT;customKeyOrders=data.keyboardCustomOrders||{};globalThis.KecapLocale?.setLanguage(data.uiLanguage||'en');updateLayoutTabs();if(host)renderKeys();});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local')return;if(changes.keyboardShortcut)toggleShortcut=changes.keyboardShortcut.newValue||DEFAULT_TOGGLE_SHORTCUT;if(changes.latinDisplay)latinDisplayMode=changes.latinDisplay.newValue===true;if(changes.keyboardCustomOrders){customKeyOrders=changes.keyboardCustomOrders.newValue||{};if(host&&keyboardLayout==='custom')renderKeys();}if(changes.keyboardLayout){keyboardLayout=changes.keyboardLayout.newValue||DEFAULT_KEYBOARD_LAYOUT;updateLayoutTabs();if(host)renderKeys();}if(changes.uiLanguage){globalThis.KecapLocale?.setLanguage(changes.uiLanguage.newValue||'en');refreshKeyboardLanguage();}});
  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse)=>{
    if(msg?.type!=='KECAP_OPEN_KEYBOARD')return false;
    openKeyboard(); sendResponse({ok:true}); return true;
  });
})();
