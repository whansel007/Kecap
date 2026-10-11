'use strict';
const assert = require('node:assert');
const Aksara = require('../lib/aksara.js');
const expected = {
  sunda:'1B9E 1BA5 1B94 1BAA 1B93', kecap:'1B8A 1BA8 1B8E 1B95 1BAA',
  hatur:'1BA0 1B92 1BA5 1B81', nuhun:'1B94 1BA5 1BA0 1BA5 1B94 1BAA',
  aksara:'1B83 1B8A 1BAA 1B9E 1B9B', ngaran:'1B8D 1B9B 1B94 1BAA',
  dengan:'1B93 1BA8 1B8D 1B94 1BAA', kuring:'1B8A 1BA5 1B9B 1BA4 1B80',
  bandung:'1B98 1B94 1BAA 1B93 1BA5 1B80', sekolah:'1B9E 1BA8 1B8A 1BA7 1B9C 1B82',
  bapak:'1B98 1B95 1B8A 1BAA', nyanyi:'1B91 1B91 1BA4', prima:'1B95 1BA2 1BA4 1B99',
  indonesia:'1B84 1B94 1BAA 1B93 1BA7 1B94 1BA8 1B9E 1BA4 1B83',
  '2026':'1BB2 1BB0 1BB2 1BB6'
};
const cps = s => Array.from(s, c=>c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join(' ');
for(const [word, codes] of Object.entries(expected)) {
  assert.equal(cps(Aksara.transliterate(word)), codes, word);
  const result=Aksara.transliterateWord(word);
  assert.equal(result.parts.map(p=>p.glyph).join(''),result.glyphs,`${word} parts`);
}
assert.equal(Aksara.transliterate('Hatur nuhun!'),`${Aksara.transliterate('hatur')} ${Aksara.transliterate('nuhun')}!`);
for(const value of ['', '!?—🙂', 'Halo, 2026!']) assert.equal(typeof Aksara.transliterate(value),'string');
assert.equal(Aksara.transliterate('Halo, 2026!'),`${Aksara.transliterate('Halo')}, ${Aksara.transliterate('2026')}!`);
assert.equal(Aksara.transliterate('2026',{digits:false}),'2026');
console.log('aksara tests passed');
