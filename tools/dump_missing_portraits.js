// 列出「有講話卻沒有大頭像」的人物與其地圖人物圖列，輸出 /tmp/missing_portraits.json，給 build_portraits_extra.py 使用。
// 用法：node tools/dump_missing_portraits.js  （先在 data/portraits_extra.js 重新產生前，用原本 52 格的版本，或暫時移出它）
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => /^data\//.test(s) && !/portraits_extra/.test(s));
const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
srcs.forEach(s => vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx));
const D = ctx.window.DATA, have = new Set(Object.keys(D.npcPortraits || {}));
Object.values(D.characters).forEach(c => { if (typeof c.portrait === 'number' && !c.recruit) have.add(c.name); });
const miss = {};
Object.keys(D.dialogue).forEach(k => (D.dialogue[k] || []).forEach(l => { if (l.speaker && !have.has(l.speaker)) miss[l.speaker] = 1; }));
const rows = {};
Object.keys(D.maps).forEach(m => (D.maps[m].npcs || []).forEach(n => { if (miss[n.name] && rows[n.name] === undefined) rows[n.name] = n.sprite; }));
fs.writeFileSync('/tmp/missing_portraits.json', JSON.stringify(Object.keys(miss).map(n => ({ name: n, row: rows[n] === undefined ? null : rows[n] }))));
console.log(Object.keys(miss).length);
