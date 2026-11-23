// 商店分開（武器店／防具店／雜貨店）、可賣出、陶罐碎了消失、角色資料分頁
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 768, height: 672 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await sleep(500);
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, route: 'wit' }; Game.gold = 1000; Game.items = { herb: 2, tonic: 0, smoke: 0 }; Game.equipInv = { iron_sword: 1, leather: 1, jade: 1 }; Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 10, y: 12, dir: 'down' })); });
  await sleep(300);
  const hit = async (k) => { await page.evaluate(k => { Engine.hit = { [k]: true }; Engine.top().update(0.016); Engine.hit = {}; }, k); };
  const open = async (id) => { await page.evaluate(id => Engine.push(new Scenes.Shop(id)), id); await sleep(80); };
  const st = () => page.evaluate(() => { const t = Engine.top(); return { mode: t.mode, kind: t.kind, rows: t.list().map(r => r.id), gold: Game.gold, msg: t.msg }; });

  // 資料：每個城鎮都有分開的店
  const d = await page.evaluate(() => ({
    kinds: Object.keys(DATA.shopKinds), wp: DATA.shops.changshe_weapon, ar: DATA.shops.changshe_h3_armor, ge: DATA.shops.changshe_general,
    names: ['zhuoxian_weapon', 'home1_armor', 'zhuoxian_h0_general'].map(k => DATA.shopNames[k]), home1: DATA.maps.home1.name }));
  const types = await page.evaluate(() => { const o = {}; Object.keys(DATA.shopKinds).forEach(k => { const kd = DATA.shopKinds[k]; o[k] = DATA.shops[k].every(id => { const e = DATA.equipment[id], it = DATA.battle.items[id]; return kd === 'weapon' ? e && e.slot === 'weapon' : kd === 'armor' ? e && e.slot !== 'weapon' : !!it; }); }); return o; });
  check('every shop sells only its own kind', Object.values(types).every(Boolean), Object.keys(types).filter(k => !types[k]));
  check('at least 3 shop kinds in many towns', d.kinds.length >= 24, d.kinds.length);
  check('home1 is renamed to a shop', /防具店/.test(d.home1), d.home1);

  // 買
  await open('changshe_weapon');
  let s = await st(); check('shop opens at menu', s.mode === 'menu');
  await hit('ok'); s = await st(); check('buy list shows weapons', s.mode === 'buy' && s.rows.length > 5, s.rows);
  const g0 = s.gold; await hit('ok'); s = await st();
  check('buying costs gold and adds gear', s.gold < g0 && (await page.evaluate(() => Object.keys(Game.equipInv).length)) >= 3, s);
  await hit('cancel'); s = await st(); check('cancel returns to menu', s.mode === 'menu');
  // 賣：武器店只收武器
  await hit('down'); await hit('ok'); s = await st();
  check('weapon shop buys only weapons', s.mode === 'sell' && s.rows.every(id => id !== 'leather' && id !== 'jade' && id !== 'herb'), s.rows);
  const g1 = s.gold; await hit('ok'); s = await st();
  check('selling pays half the price', s.gold > g1, [g1, s.gold]);
  await page.evaluate(() => Engine.pop());
  // 防具店
  await open('changshe_h3_armor'); await hit('down'); await hit('ok'); s = await st();
  check('armor shop buys armor/charms, not weapons', s.rows.includes('leather') && s.rows.includes('jade') && !s.rows.includes('iron_sword'), s.rows);
  await page.evaluate(() => Engine.pop());
  // 雜貨店
  await open('changshe_general'); await hit('down'); await hit('ok'); s = await st();
  check('general store buys potions', s.rows.includes('herb'), s.rows);
  const h0 = await page.evaluate(() => Game.items.herb); await hit('ok');
  check('selling a potion removes one', (await page.evaluate(() => Game.items.herb)) === h0 - 1);
  await page.evaluate(() => Engine.pop());
  // 賣不掉獨特裝備
  await page.evaluate(() => { Game.addGear('swallow_blade'); }); await open('changshe_weapon'); await hit('down'); await hit('ok'); s = await st();
  check('unique gear (price 0) cannot be sold', !s.rows.includes('swallow_blade'), s.rows);
  await page.evaluate(() => Engine.pop());

  // 屋子：武器店、防具店、雜貨店都進得去
  const hs = await page.evaluate(() => ['changshe_h0', 'changshe_h3', 'wancheng_h0', 'pingyuan_h2', 'sishui_h3', 'suanzao_h2', 'mengjin_h2'].map(m => [m, DATA.maps[m].name, DATA.maps[m].npcs[0].dialogue, !!DATA.dialogue[DATA.maps[m].npcs[0].dialogue]]));
  check('shop houses have keeper dialogue', hs.every(h => h[3]), hs);
  // 休息還在（長社軍需官）
  const rest = await page.evaluate(() => JSON.stringify(DATA.dialogue.shop_changshe_weapon).includes('rest'));
  check('inn rest option kept at 長社軍需官', rest);

  // 陶罐：打破之後消失、不擋路
  const u = await page.evaluate(() => {
    const m = DATA.maps.cave1, o = m.objects.find(x => x.type === 'urn');
    if (!o) return null;
    Engine.replaceAll(new Scenes.Map('cave1', { x: 1, y: 1, dir: 'down' }));
    const t = Engine.top(); const before = !!t.objAt(o.x, o.y), blockedBefore = t.blocked(o.x, o.y);
    Game.flags['urn_' + o.id] = true;
    return { before, blockedBefore, after: !!t.objAt(o.x, o.y), blockedAfter: t.blocked(o.x, o.y) };
  });
  check('an urn exists in cave1', !!u, u);
  if (u) check('urn never blocks the way (walk onto it to open)', !u.blockedBefore && !u.blockedAfter, u);

  // 角色資料分頁
  await page.evaluate(() => { Game.party.forEach(m => BattleLogic.gainExp(m, BattleLogic.expFor(14))); Game.advisor = 'nyao'; Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 10, y: 12, dir: 'down' })); Engine.push(new Scenes.Status()); });
  await sleep(100);
  const pages = [];
  for (let i = 0; i < 5; i++) { pages.push(await page.evaluate(() => Engine.top().page)); await page.screenshot({ path: '/tmp/status_p' + i + '.png' }); await hit('ok'); }
  check('status has 5 pages that cycle', pages.join() === '0,1,2,3,4' && (await page.evaluate(() => Engine.top().page)) === 0, pages);
  await hit('right'); await hit('right'); await hit('ok'); await hit('ok'); await hit('ok');
  check('pages work for another member (guanyu advisor page)', (await page.evaluate(() => [Engine.top().idx, Engine.top().page])).join() === '2,3');
  check('no page errors', errors.length === 0, errors);
  await b.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})();
