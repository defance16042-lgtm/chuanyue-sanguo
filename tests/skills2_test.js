// 第二批計謀與陣形的戰鬥邏輯測試（純 Node，不開瀏覽器）
const fs = require('fs'), vm = require('vm');
const root = { window: {}, localStorage: { getItem() { return null; }, setItem() {} } };
root.window = root; root.self = root; vm.createContext(root);
['data/battle.js'].forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), root));
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
const B = root.DATA ? root.DATA.battle : null;
check('battle data loaded', !!B);
if (B) {
  ['poison', 'poison2', 'regen', 'cleanse', 'cleanse2', 'stun', 'stun2', 'taunt', 'leech', 'execute', 'rage', 'flood', 'fireall'].forEach(id => check('skill ' + id, !!B.skills[id] && !!B.skills[id].name));
  const all = new Set();
  Object.values(B.routeSkills).forEach(l => l.forEach(e => all.add(e[1])));
  Object.values(B.charSkills).forEach(l => l.forEach(e => all.add(Array.isArray(e) ? e[1] : e)));
  Object.values(B.advisorSkills).forEach(l => l.forEach(e => all.add(e[1])));
  const bad = [...all].filter(id => !B.skills[id]);
  check('all assigned skills exist', bad.length === 0, bad);
  check('skill count >= 60', Object.keys(B.skills).length >= 60, Object.keys(B.skills).length);
}
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
