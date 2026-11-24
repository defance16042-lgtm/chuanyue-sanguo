// 介面文字不超出畫面或所在的視窗框：把各個畫面用最極端的內容畫出來，記錄每一行文字的寬度並檢查
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x).slice(0, 700) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage({ viewport: { width: 1024, height: 896 } });
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__rec = { texts: [], panels: [] };
    const E = Engine, ot = E.text, op = E.panel;
    E.text = function (c, str, x, y, o) { ot.apply(this, arguments); o = o || {}; const w = c.measureText(String(str)).width, size = o.size || 9; const al = o.align || 'left';
      const x0 = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x; window.__rec.texts.push({ s: String(str), x0, x1: x0 + w, y, size, scene: window.__cur }); };
    E.panel = function (c, x, y, w, h) { op.apply(this, arguments); window.__rec.panels.push({ x, y, w, h, scene: window.__cur }); };
  });
  await page.evaluate(() => {
    window.__setup = () => { Game.fresh(); Game.flags = { intro_done: true, book_wu: true, book_liutao: true, book_weiliao: true };
      Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei', 'zhangjiao', 'lubu', 'huaxiong', 'xurong'].map(Game.makeMember);
      Game.party.forEach(m => { m.level = 45; if (Game.recalc) Game.recalc(m); m.hp = m.hpMax; });
      Game.items.herb = 99; Game.items.tonic = 9; Game.items.smoke = 9; Object.keys(DATA.equipment).forEach(k => Game.addGear(k, 3)); Game.gold = 999999;
      Game.autoBook('wu'); Game.autoBook('liutao'); Game.autoBook('weiliao'); Game.roster = [Game.makeMember('duyou'), Game.makeMember('chengyuanzhi')]; };
  });
  const bad = [];
  async function run(label, js, frames) {
    await page.evaluate((label) => { window.__setup(); Engine.replaceAll(new Scenes.Map('zhuoxian')); Engine.top().banner = 0; window.__rec.texts = []; window.__rec.panels = []; window.__cur = label; }, label);
    await page.evaluate(js);
    await page.waitForTimeout(frames || 150);
    const v = await page.evaluate(() => {
      const R = window.__rec, out = [];
      R.texts.filter(t => t.size !== 6).forEach(t => {   // size 6 是大地圖上的店家招牌（畫在地圖座標）
        if (t.x1 > 255.5 || t.x0 < 0 || t.y + t.size > 224) out.push({ screen: true, s: t.s, x1: Math.round(t.x1), y: t.y });
        const ps = R.panels.filter(p => t.x0 >= p.x - 0.5 && t.x0 < p.x + p.w && t.y >= p.y && t.y < p.y + p.h).sort((a, b) => a.w * a.h - b.w * b.h);
        if (ps.length) { const p = ps[0]; if (t.x1 > p.x + p.w - 3 || t.y + t.size > p.y + p.h + 1) out.push({ panel: [p.x, p.y, p.w, p.h], s: t.s, x1: Math.round(t.x1), y: t.y }); }
      });
      return out;
    });
    if (process.env.OV) console.log(label, await page.evaluate(() => window.__rec.texts.length));
    const seen = {}; const u = v.filter(x => !seen[x.s] && (seen[x.s] = 1));
    if (u.length) bad.push({ label, v: u.slice(0, 5) });
  }
  await run('menu', "Engine.push(new Scenes.Menu())");
  for (let i = 0; i < 8; i++) for (let pg = 0; pg < 3; pg++) await run('status' + i + '_p' + pg, `(() => { const s = new Scenes.Status(); s.idx = ${i}; s.page = ${pg}; Engine.push(s); })()`);
  for (let t = 0; t < 3; t++) await run('bag' + t, `(() => { const s = new Scenes.Item(); s.tab = ${t}; Engine.push(s); })()`);
  for (let i = 0; i < 8; i++) await run('equip' + i, `(() => { const s = new Scenes.Equip(); s.idx = ${i}; Engine.push(s); })()`);
  await run('equip_pick', "(() => { const s = new Scenes.Equip(); s.mode = 'pick'; Engine.push(s); })()");
  await run('formation', "Engine.push(new Scenes.Formation())");
  await run('quest', "Engine.push(new Scenes.Quest())");
  await run('quest2', "(() => { const s = new Scenes.Quest(); s.tab = 1; Engine.push(s); })()");
  await run('hall', "Engine.push(new Scenes.Hall())");
  await run('fieldskill', "Engine.push(new Scenes.FieldSkill())");
  await run('save', "Engine.push(new Scenes.Save('save'))");
  await run('recruit', "Engine.push(new Scenes.RecruitOffer(['zhangjiao', 'lubu'], () => {}))");
  for (const sid of Object.keys(await page.evaluate(() => DATA.shops))) await run('shop_' + sid, `Engine.push(new Scenes.Shop('${sid}'))`);
  // 戰鬥：指令、計謀、道具、偵察
  await run('battle_cmd', "Engine.top().startBattle(['lubu', 'huaxiong', 'zhangjiao', 'zhangchun', 'xurong'].filter(x => DATA.battle.enemies[x]), false)", 400);
  await run('battle_skill', "(() => { Engine.top().startBattle(['turban'], false); const b = Engine.top(); b.cur = 0; b.state = 'cmd'; b.sel = 1; Engine.hit.ok = true; b.update(16); Engine.hit.ok = false; })()", 400);
  await run('battle_item', "(() => { Engine.top().startBattle(['turban'], false); const b = Engine.top(); b.cur = 0; b.state = 'cmd'; b.sel = 2; Engine.hit.ok = true; b.update(16); Engine.hit.ok = false; })()", 400);
  for (const e of ['lubu', 'huaxiong', 'zhangjiao', 'xurong', 'zhangchun', 'dongzhuo'])
    for (const pg of [0, 1]) await run('scout_' + e + pg, `(() => { if (!DATA.battle.enemies['${e}']) return; Engine.top().startBattle(['${e}'], false); const b = Engine.top(); b.targets = b.b.enemies; b.scoutIdx = 0; b.scoutPage = ${pg}; b.state = 'scout'; })()`, 300);
  check('沒有 JS 錯誤', errors.length === 0, errors);
  check('所有畫面文字都在畫面與視窗框內', bad.length === 0, bad);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
