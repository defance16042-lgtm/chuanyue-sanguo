// 全體攻擊（自動計謀）：每個角色各自有機率放計，受傷時也會補血／復活
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
    const B = DATA.battle, o = {};
    Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei', 'zhugeliang'].filter(id => DATA.characters[id]).map(Game.makeMember);
    Game.party.forEach(m => { m.lv = 60; });
    // 給每個人一招計謀，兩個人有補血，一個有復活，一個有輔助
    const give = (m, sk) => { const c = DATA.characters[m.id]; c.skills = (c.skills || []).concat([sk]); };
    B.skills.t_heal1 = { name: '補', tp: 1, kind: 'heal', target: 'ally', power: 1 };
    B.skills.t_heal2 = { name: '大補', tp: 1, kind: 'heal', target: 'ally', choice: true, power: 1, allPower: 0.6, allTp: 2 };
    B.skills.t_tact = { name: '計', tp: 1, kind: 'tact', target: 'one', power: 1 };
    B.skills.t_rev = { name: '復', tp: 1, kind: 'revive', target: 'deadAlly', pct: 0.5 };
    const sc = new Scenes.Battle(['turban', 'turban', 'turban'], { boss: false, onEnd() {} });
    const b = sc.b; sc.autoMode = 'tactic';
    const mem = b.party;
    const stub = (u, list) => { u.ref = Object.assign({}, u.ref); BL = window.BattleLogic; };
    const orig = BattleLogic.skillsFor;
    BattleLogic.skillsFor = (ref) => ref.id === mem[0].ref.id ? [B.skills.t_tact, B.skills.t_heal1].map((s, i) => Object.assign({ id: ['t_tact', 't_heal1'][i] }, s))
      : ref.id === mem[1].ref.id ? [Object.assign({ id: 't_heal2' }, B.skills.t_heal2), Object.assign({ id: 't_tact' }, B.skills.t_tact)]
      : ref.id === mem[2].ref.id ? [Object.assign({ id: 't_tact' }, B.skills.t_tact)] : [Object.assign({ id: 't_rev' }, B.skills.t_rev)];
    mem.forEach(u => { u.tp = 50; });
    const count = (u, n, f) => { let c = 0; for (let i = 0; i < n; i++) { const a = sc.autoAction(u); if (f(a)) c++; } return c; };
    // 全員健康：每個有計謀的人都會放計（有機率），不是只有第一個
    const healthy = mem.slice(0, 3).map(u => count(u, 200, a => a.type === 'skill'));
    o.healthy = healthy;
    // 有人重傷：會補血、補血指定對象是最殘的人
    mem[2].hp = Math.floor(mem[2].hpMax * 0.2); mem[1].hp = Math.floor(mem[1].hpMax * 0.3);
    o.healA = count(mem[0], 200, a => a.skill === 't_heal1' && a.target === mem[2]);
    o.healAllMode = count(mem[1], 200, a => a.skill === 't_heal2' && a.mode === 'all');
    // 有人倒下：有復活的人會救人
    mem[3].hp = 0; o.rev = count(mem[3] && mem[4] ? mem[4] : mem[3], 200, a => a.skill === 't_rev');
    BattleLogic.skillsFor = orig;
    return o;
  });
  check('全員健康時，每個角色都會放計（機率，不是只有第一個）', r.healthy.every(c => c > 40 && c < 190), r.healthy);
  check('有人重傷時會補血，且指定最殘的人', r.healA > 80, r.healA);
  check('兩人以上受傷時，可選全體的補血會用全體', r.healAllMode > 40, r.healAllMode);
  check('有人倒下時，有復活術的人會救人', r.rev > 60, r.rev);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
