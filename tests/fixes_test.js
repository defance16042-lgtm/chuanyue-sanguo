// 戰鬥最多 5 對 5、全隊一鍵逃跑、毒計機率、村鎮不遇敵、寶箱陶罐不擋路、偵察分頁
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
    const D = DATA, o = {};
    Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember);
    o.cap = Math.max.apply(null, Object.keys(D.battle.groups).map(k => D.battle.groups[k].map(g => BattleLogic.newBattle(Game.party, g, {}).enemies.length)).reduce((a, b) => a.concat(b), []));
    // 毒計：不是必中
    let hit = 0, N = 400;
    for (let i = 0; i < N; i++) { const b = BattleLogic.newBattle(Game.party, ['turban', 'turban', 'turban'], {}); const a = b.party[0]; a.tp = 99;
      const ev = BattleLogic.perform(b, a, { type: 'skill', skill: 'poison', target: b.enemies[0] }); hit += b.enemies.filter(e => e.dot).length / 3; }
    o.poisonRate = hit / N;
    o.guardsPoison = D.battle.skills.poison.pct <= 0.05 && D.battle.skills.poison2.pct <= 0.08;
    o.townEnc = Object.keys(D.worldTowns).filter(t => D.maps[t].encounter);
    o.guan = D.characters.guanyu.terrain.sea;
    return o;
  });
  console.log(JSON.stringify(r));
  check('戰鬥敵方最多 5 位', r.cap <= 5, r.cap);
  check('毒計不是必中、也不是幾乎不中', r.poisonRate > 0.35 && r.poisonRate < 0.8, r.poisonRate);
  check('毒計傷害降低', r.guardsPoison);
  check('村鎮沒有隨機遇敵', r.townEnc.length === 0, r.townEnc);
  check('關羽水戰適性 A', r.guan === 'A');
  // 全隊逃跑：一個人按下就結算
  const fl = await page.evaluate(() => {
    Game.fresh(); Game.flags = { intro_done: true }; Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember);
    Engine.replaceAll(new Scenes.Map('zhuoxian')); Engine.top().banner = 0; Engine.top().startBattle(['turban', 'turban'], false);
    const bs = Engine.top(); bs.b.canFlee = true; bs.sel = 5; bs.state = 'cmd'; bs.cur = 0;
    Engine.hit.ok = true; bs.update(16); Engine.hit.ok = false;
    return { plans: bs.plans.map(p => p && p.type), state: bs.state };
  });
  check('按一次逃跑，全隊都排好動作（一人逃、其餘防禦）', fl.plans[0] === 'flee' && fl.plans.slice(1).every(t => t === 'defend') && fl.state !== 'cmd', fl);
  // 寶箱不擋路、走上去就開
  const ch = await page.evaluate(() => {
    Game.fresh(); Game.flags = { intro_done: true };
    Engine.replaceAll(new Scenes.Map('cave1_2')); const m = Engine.top(); m.banner = 0;
    const c = m.map.objects.find(o => o.type === 'chest');
    const blocked = m.blocked(c.x, c.y);
    m.p.x = c.x; m.p.y = c.y; m.stepOnObj();
    return { blocked, opened: !!Game.flags['chest_' + c.id] || Engine.stack.length > 1 };
  });
  check('寶箱不擋路，踩上去會開', ch.blocked === false && ch.opened, ch);
  check('沒有 JS 錯誤', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
