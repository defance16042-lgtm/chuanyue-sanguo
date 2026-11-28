// 陣形站位：只看第幾位，和人物無關；後排要退得很遠
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    Game.fresh(); Game.flags = { intro_done: true };
    const mk = ids => { const p = ids.map(Game.makeMember); p.forEach(m => m.level = 50); return p; };
    const out = {};
    const run = (ids, fm) => { Game.party = mk(ids); Game.formation = fm; const s = new Scenes.Battle(['turban', 'turban', 'turban', 'turban', 'turban'], { onEnd() {} }); return s; };
    const a = run(['zhugeliang', 'liubei', 'guanyu', 'zhangfei', 'caocao'], 'bagua');
    out.txA = a.b.party.map(u => u.tx); out.rowsA = a.b.party.map(u => u.rowKind);
    const b = run(['caocao', 'zhangfei', 'liubei', 'guanyu', 'zhugeliang'], 'bagua');
    out.txB = b.b.party.map(u => u.tx); out.idsB = b.b.party.map(u => u.id);
    out.defA3 = BattleLogic.eff(a.b.party[2], 'def') / a.b.party[2].def;       // 第3位（後排）
    out.defA1 = BattleLogic.eff(a.b.party[0], 'def') / a.b.party[0].def;       // 第1位（前排）
    out.intBack = BattleLogic.eff(a.b.party[2], 'int') / a.b.party[2].int;
    out.intFront = BattleLogic.eff(a.b.party[0], 'int') / a.b.party[0].int;
    const n = run(['nyao', 'liubei', 'guanyu'], 'none'); out.txN = n.b.party.map(u => u.tx);
    // 動畫：u.x 會滑向 tx
    const s = run(['zhugeliang', 'liubei', 'guanyu', 'zhangfei', 'caocao'], 'bagua'); const x0 = s.b.party[0].x; for (let i = 0; i < 60; i++) s.update(16); out.slide = [x0, s.b.party[0].x, s.b.party[0].tx];
    out.rowsAll = DATA.formationOrder.filter(id => id !== 'none').map(id => DATA.formations[id].rows && DATA.formations[id].rows.length);
    out.hasBack = DATA.formationOrder.filter(id => id !== 'none').map(id => DATA.formations[id].rows.includes(2) || DATA.formations[id].rows.includes(1));
    return out;
  });
  console.log(JSON.stringify(r));
  check('slot 1 and 5 are the front row in 八卦陣', r.rowsA[0] === 0 && r.rowsA[4] === 0 && r.rowsA[2] === 2, r.rowsA);
  check('positions depend only on the slot (same tx for any lineup)', JSON.stringify(r.txA) === JSON.stringify(r.txB), [r.txA, r.txB]);
  check('lineup order really differs', r.idsB[0] === 'caocao');
  check('back row is at least 48px behind the front row', r.txA[0] - r.txA[2] >= 48, [r.txA[0], r.txA[2]]);
  check('back-row slot gets the back bonus (int), front does not', r.intBack > r.intFront, [r.intBack, r.intFront]);
  check('front-row slot gets the front bonus (def) more than back', r.defA1 > r.defA3, [r.defA1, r.defA3]);
  check('no formation keeps everybody at the default spot', new Set(r.txN).size === 1, r.txN);
  check('units slide from the default spot to the formation spot', r.slide[0] === 58 && r.slide[1] === r.slide[2], r.slide);
  check('every formation defines 5 slots', r.rowsAll.every(x => x === 5), r.rowsAll);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
