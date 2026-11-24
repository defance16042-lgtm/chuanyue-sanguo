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
  const fm = await page.evaluate(() => {
    Game.fresh(); Game.flags = { intro_done: true }; Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.party[0].level = 12;
    Engine.replaceAll(new Scenes.Map('zhuoxian')); Engine.top().banner = 0; Engine.top().startBattle(['turban', 'turban'], false);
    const bs = Engine.top(); bs.cur = 0; bs.state = 'cmd'; const tp0 = bs.b.party[0].tp; bs.sel = 1;
    Engine.hit.ok = true; bs.update(16); Engine.hit.ok = false;
    const last = bs.sub[bs.sub.length - 1];
    bs.subSel = bs.sub.length - 1; Engine.hit.ok = true; bs.update(16); Engine.hit.ok = false;
    const list = bs.sub.map(x => x.label);
    const yu = bs.sub.findIndex(x => x.form === 'yulin'); bs.subSel = yu; Engine.hit.ok = true; bs.update(16); Engine.hit.ok = false;
    const act = bs.plans[0];
    const ev = BattleLogic.perform(bs.b, bs.b.party[0], act);
    return { last: last.label, list, act, formation: bs.b.formation && bs.b.formation.id, tpSpent: tp0 - bs.b.party[0].tp, ev: ev.map(e => e.type) };
  });
  check('計謀頁最後有「變陣」，可換陣形（花 2 戰術點）', fm.last === '變陣…' && fm.act && fm.act.type === 'formation' && fm.formation === 'yulin' && fm.tpSpent === 2, fm);
  const c3 = await page.evaluate(() => {
    const D = DATA, o = {};
    // 店家招牌：每間有商人的屋子，外面的門都有字
    o.labels = Object.keys(D.doorLabels).length;
    o.zx = (D.doorLabels.zhuoxian || []).map(l => l.text).join();
    // 助戰角色加入後，原地的 NPC 消失
    Game.fresh(); Game.flags = { intro_done: true }; Game.party = [Game.makeMember('nyao')];
    Engine.replaceAll(new Scenes.Map('field')); const m = Engine.top(); m.banner = 0;
    const npc = m.npcs.find(n => n.id === 'zoujing');
    o.before = m.visible(npc);
    m.runAct({ guest: 'zoujing' }); o.after = m.visible(npc); o.inParty = Game.party.some(x => x.id === 'zoujing');
    // 行走跟隨：前三位隊員跟著隊長
    Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei', 'zhangjiao'].map(Game.makeMember);
    Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 8, y: 8, dir: 'down' })); const mm = Engine.top(); mm.banner = 0;
    const cam = mm.camera(); const f0 = mm.followers(cam);
    mm.p.x = 9; cam.px += 16; const f1 = mm.followers(Object.assign({}, cam, { px: cam.px }));
    o.followers = f0.length;
    return o;
  });
  check('每間商店的門外都有招牌（雜貨店／武器店／防具店／客棧）', c3.labels >= 8 && /雜貨店|防具店|武器店/.test(c3.zx), [c3.labels, c3.zx]);
  check('助戰角色加入後，原本站在外面的 NPC 不見了', c3.before === true && c3.after === false && c3.inParty, c3);
  check('走路時前三位隊員跟隨顯示', c3.followers === 3, c3.followers);
  check('沒有 JS 錯誤', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
