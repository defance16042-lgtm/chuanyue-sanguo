// 批次D：經驗值每級歸零、毒每回合只扣一次、特效圖集
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(600);
  const r = await page.evaluate(async () => {
    const o = {}, BL = BattleLogic;
    Game.fresh(); Game.party = ['nyao', 'liubei'].map(Game.makeMember);
    const m = Game.party[0];
    BL.gainExp(m, BL.expNeed(1) + 5);
    o.lv2 = [m.level, m.exp];                     // 升到 2 級，剩 5
    BL.gainExp(m, BL.expNeed(2) - 5);
    o.lv3 = [m.level, m.exp];                     // 剛好升 3 級，歸 0
    // 舊存檔（累積制）換算
    const snap = Game.snapshot(); const old = JSON.parse(JSON.stringify(snap));
    old.party.forEach(p => { delete p.expV; p.level = 5; p.exp = BL.expFor(5) + 7; });
    Game.restore(old); o.mig = [Game.party[0].level, Game.party[0].exp];
    // 毒：走真正的戰鬥場景，一整回合只能扣 1 回合
    Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu'].map(Game.makeMember);
    return o;
  });
  console.log(JSON.stringify(r));
  check('升級後經驗從餘數重新累積', r.lv2[0] === 2 && r.lv2[1] === 5, r.lv2);
  check('剛好升級經驗歸 0', r.lv3[0] === 3 && r.lv3[1] === 0, r.lv3);
  check('舊存檔經驗換算成本級經驗', r.mig[0] === 5 && r.mig[1] === 7, r.mig);
  // 毒：直接用 BattleScene 跑一回合
  const t = await page.evaluate(async () => {
    Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu'].map(Game.makeMember);
    const sc = new Scenes.Battle(['turban', 'turban'], {}); Engine.push(sc);
    const e = sc.b.enemies[0]; e.hp = e.hpMax = 99999; e.dot = { pct: 0.05, turns: 3 };
    let sawExec = false, guard = 0, ticks = 0, lastHp = e.hp;
    while (guard++ < 6000) {
      if (sc.state === 'exec') sawExec = true;
      if (sc.state === 'cmd') { if (sawExec) break; sc.commit({ type: 'defend' }); continue; }
      Engine.hit.ok = true; sc.update(120); Engine.hit.ok = false;
    }
    return { turns: e.dot ? e.dot.turns : 0, state: sc.state, guard, sawExec };
  });
  console.log(JSON.stringify(t));
  check('毒一回合只扣一次（3→2）', t.turns === 2, t);
  const e = await page.evaluate(() => {
    const D = DATA, B = D.battle, o = {};
    o.art = D.characters.lubu.portrait >= 116 && D.characters.caocao.portrait >= 116 && D.npcPortraits['皇甫嵩'] >= 116;
    o.wild = Object.keys(B.wildGen.field5 || []).length > 0 && B.enemies[B.wildGen.field5[0]].eSkills.length === 3;
    o.eskill = Object.values(B.enemies).filter(e => e.eSkills).length > 60;
    o.forms = D.formationOrder.length >= 20 && D.formations.bagua.only === 'zhugeliang';
    o.late = (B.charSkills.liubei || []).some(e => Array.isArray(e) && B.skills[e[1]].kind === 'hot');
    // 敵將會用專屬計謀
    Game.fresh(); Game.party = ['nyao', 'liubei'].map(Game.makeMember);
    const b = BattleLogic.newBattle(Game.party, ['lubu', 'langqi'], { rng: () => 0.01 });
    const act = BattleLogic.planEnemy(b, b.enemies[0]); o.act = act.type;
    // 有將領時小兵變強
    o.minion = b.enemies[1].hp > B.enemies.langqi.hp * 1.5;
    // 孟津渡：進圖事件只會觸發一次
    Game.flags = {}; Engine.replaceAll(new Scenes.Map('mengjin', DATA.maps.mengjin.start));
    return o;
  });
  console.log(JSON.stringify(e));
  check('武將有自創畫像', e.art); check('野外無名將領有專屬計謀', e.wild); check('敵將各有專屬計謀', e.eskill);
  check('陣形增加且八卦陣限孔明', e.forms); check('劉備有持續回復計謀', e.late);
  check('敵將會使用專屬計謀', e.act === 'skill', e.act); check('將領帶的小兵變強', e.minion);
  await page.waitForTimeout(400);
  const mj = await page.evaluate(() => Game.flags.mj_intro_done);
  check('孟津渡開場對話只觸發一次（旗標已記錄）', mj === true, mj);
  const fxok = await page.evaluate(() => !!(window.FX64 && Engine.images.fx64 && Engine.images.fx64.width === 64 * FX64.frames && FX64.rows.fire != null));
  check('特效圖集載入', fxok);
  check('無錯誤', errors.length === 0, errors.slice(0, 3));
  console.log(`${pass} passed, ${fail} failed`); await br.close(); process.exit(fail ? 1 : 0);
})();
