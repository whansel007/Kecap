(function (root) {
  'use strict';
  const C = { k:0x1B8A, g:0x1B8C, ng:0x1B8D, c:0x1B8E, j:0x1B8F, ny:0x1B91, t:0x1B92, d:0x1B93, n:0x1B94, p:0x1B95, b:0x1B98, m:0x1B99, y:0x1B9A, r:0x1B9B, l:0x1B9C, w:0x1B9D, s:0x1B9E, h:0x1BA0, q:0x1B8B, z:0x1B90, f:0x1B96, v:0x1B97, x:0x1B9F, kh:0x1BAE, sy:0x1BAF };
  const V = { a:0x1B83, i:0x1B84, u:0x1B85, 'é':0x1B86, o:0x1B87, e:0x1B88, eu:0x1B89 };
  const SIGN = { i:0x1BA4, u:0x1BA5, 'é':0x1BA6, o:0x1BA7, e:0x1BA8, eu:0x1BA9 };
  const MEDIAL = { r:0x1BA2, l:0x1BA3, y:0x1BA1 };
  const FINAL = { ng:0x1B80, r:0x1B81, h:0x1B82 };
  const DIGITS = Array.from({length:10}, (_,i)=>String.fromCodePoint(0x1BB0+i));
  const NAMES = {0x1B80:'Panyecek marks final ng',0x1B81:'Panglayar marks final r',0x1B82:'Pangwisad marks final h',0x1B83:'is independent a',0x1B84:'is independent i',0x1B85:'is independent u',0x1B86:'is independent é',0x1B87:'is independent o',0x1B88:'is independent e (pepet)',0x1B89:'is independent eu',0x1BA1:'Pamingkal adds medial y',0x1BA2:'Panyakra adds medial r',0x1BA3:'Panyiku adds medial l',0x1BA4:'Panghulu changes the vowel to i',0x1BA5:'Panyuku changes the vowel to u',0x1BA6:'Panéléng changes the vowel to é',0x1BA7:'Panolong changes the vowel to o',0x1BA8:'Pamepet changes the vowel to e',0x1BA9:'Paneuleung changes the vowel to eu',0x1BAA:'Pamaéh removes the vowel'};
  for(const [sound,code] of Object.entries(C)) NAMES[code]=`is ${sound}a`;
  const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ]+)*/g;
  const OVERRIDES = {};
  const cp = n => String.fromCodePoint(n);
  const consonants = ['ng','ny','kh','sy'];
  const vowels = ['eu','é','a','i','u','o','e'];
  function tokenize(s) {
    const out=[];
    for(let i=0;i<s.length;) {
      if(s[i]==="'" || s[i]==='’') { out.push({t:'raw',v:s[i++]}); continue; }
      const rest=s.slice(i); let hit=null;
      for(const v of vowels) if(rest.startsWith(v)) { hit={t:'v',v}; break; }
      if(hit) { out.push(hit); i+=hit.v.length; continue; }
      for(const c of consonants) if(rest.startsWith(c)) { hit={t:'c',v:c}; break; }
      if(!hit && /[bcdfghjklmnpqrstvwxyz]/.test(s[i])) hit={t:'c',v:s[i]};
      if(hit) { out.push(hit); i+=hit.v.length; }
      else { out.push({t:'raw',v:s[i++]}); }
    }
    return out;
  }
  function transliterateWord(word) {
    const lower=String(word).toLowerCase().replace(/[è]/g,'é');
    if(Object.prototype.hasOwnProperty.call(OVERRIDES,lower)) return {glyphs:OVERRIDES[lower],parts:[{latin:String(word),glyph:OVERRIDES[lower]}]};
    const ts=tokenize(lower), parts=[];
    const add=(latin,glyph)=>{ if(!latin) return; parts.push({latin,glyph}); };
    let i=0, hasSyllable=false;
    while(i<ts.length) {
      const a=ts[i];
      if(a.t==='raw') { add(a.v,a.v); i++; continue; }
      if(a.t==='v') { add(a.v,cp(V[a.v])); hasSyllable=true; i++; continue; }
      // A medial cluster is one onset unit: consonant + r/l/y + vowel.
      if(i+2<ts.length && ts[i+1].t==='c' && MEDIAL[ts[i+1].v] && ts[i+2].t==='v' && !['r','l','y'].includes(a.v)) {
        const m=ts[i+1].v, v=ts[i+2].v;
        add(a.v+m+v, cp(C[a.v]||C[a.v[0]])+cp(MEDIAL[m])+(v==='a'?'':cp(SIGN[v])));
        hasSyllable=true; i+=3; continue;
      }
      const next=ts[i+1];
      if(next && next.t==='v') {
        add(a.v+next.v, cp(C[a.v]||C[a.v[0]])+(next.v==='a'?'':cp(SIGN[next.v])));
        hasSyllable=true; i+=2; continue;
      }
      // A consonant without a following vowel closes a syllable. Special finals
      // are combining signs; other consonants use their letter plus pamaaeh.
      if(FINAL[a.v] && hasSyllable) add(a.v,cp(FINAL[a.v]));
      else add(a.v,(C[a.v] ? cp(C[a.v]) : cp(C[a.v[0]]))+cp(0x1BAA));
      i++;
    }
    return {glyphs:parts.map(p=>p.glyph).join(''),parts};
  }
  function transliterate(text, opts) {
    const options=Object.assign({digits:true},opts||{}), input=String(text);
    let out='', last=0; WORD_RE.lastIndex=0; let m;
    while((m=WORD_RE.exec(input))) {
      out+=input.slice(last,m.index).replace(/[0-9]/g,d=>options.digits?DIGITS[Number(d)]:d);
      out+=transliterateWord(m[0]).glyphs; last=m.index+m[0].length;
    }
    out+=input.slice(last).replace(/[0-9]/g,d=>options.digits?DIGITS[Number(d)]:d);
    return out;
  }
  function explainPart(part) {
    return Array.from(String(part.glyph||''), ch=>{const code=ch.codePointAt(0);const description=NAMES[code]||`Unicode character U+${code.toString(16).toUpperCase()}`;return {glyph:ch,codepoint:'U+'+code.toString(16).toUpperCase().padStart(4,'0'),description};});
  }
  const api={transliterate,transliterateWord,explainPart,WORD_RE,OVERRIDES};
  root.Aksara=api;
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
