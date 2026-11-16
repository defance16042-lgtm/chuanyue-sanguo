const { chromium } = require('playwright');
const OUT = require('os').tmpdir();
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const tap = async (k, hold = 70, after = 170) => { await page.keyboard.down(k); await sleep(hold); await page.keyboard.up(k); await sleep(after); };
  const shot = n => page.screenshot({ path: `${OUT}/b_${n}.png` });
  const S = () => page.evaluate(() => { const t = Engine.top(); return { scene: t.constructor.name, state: t.state, map: Game.mapId, pos: Game.pos, gold: Game.gold, items: Game.items, flags: Game.flags,
    party: Game.party.map(m => ({ n: m.name, lv: m.level, hp: m.hp, hpMax: m.hpMax, tp: m.tp, tpMax: m.tpMax, exp: m.exp, atk: m.atk, int: m.int, pts: m.points })) }; });


  async function talk(choiceIdx = 0) {   // 把目前的對話用真按鍵讀完；遇到選項就選第 choiceIdx 個
    for (let g = 0; g < 80; g++) {
      const d = await page.evaluate(() => { const t = Engine.top(); return t.constructor.name === 'DialogScene' ? { c: t.choosing, full: t.shown >= Array.from(t.line().text).length } : null; });
      if (!d) return;
      if (d.c) { for (let i = 0; i < choiceIdx; i++) await tap('ArrowDown'); await tap('z'); }
      else await tap('z', 40, d.full ? 120 : 220);
    }
  }
  // 用真的按鍵打完一場戰鬥。pick(state)->動作：預設一律「攻擊」。
  async function fightByKeys(opts = {}) {
    let guard = 0, shots = 0;
    while (guard++ < 400) {
      const s = await S();
      if (s.scene !== 'BattleScene') return s;
      if (s.state === 'cmd') {
        if (opts.shotCmd && !shots++) await shot(opts.shotCmd);
        if (opts.script && opts.script.length) { for (const k of opts.script.shift()) await tap(k); }
        else { await tap('z'); await tap('z'); }
      } else await tap('z', 40, 90);
    }
    return null;
  }

  await page.goto(URL); await sleep(500);
  await tap('Enter');
  let s = await S();
  check('new game: gold 50, 3 herbs, 1 member', s.gold === 50 && s.items.herb === 3 && s.party.length === 1, { g: s.gold, i: s.items });

  // 真按鍵：招募劉備 (14,8)
  await tap('ArrowRight'); await tap('ArrowRight'); await tap('ArrowRight'); await tap('ArrowRight');   // (11,8)->(15,8)? blocked by liubei at 14 => stops at 13
  await tap('ArrowRight');
  s = await S();
  check('walked to (13,8) next to Liu Bei', s.pos.x === 13 && s.pos.y === 8, s.pos);
  await tap('z'); await sleep(900); await tap('z'); await sleep(500);
  s = await S();
  check('talking to Liu Bei recruits him (party 2, flag set, NPC hidden)', s.party.length === 2 && s.flags.recruited_liubei && s.scene === 'DialogScene', { n: s.party.length, sc: s.scene });
  await sleep(900); await tap('z'); await sleep(300);
  s = await S();
  check('back on map after the recruit message', s.scene === 'MapScene');
  const hid = await page.evaluate(() => !Engine.top().npcAt(14, 8));
  check('Liu Bei NPC no longer blocks (14,8)', hid);

  // 招募關羽、張飛（用程式捷徑，上面已驗證真按鍵路徑）
  await page.evaluate(() => { const m = Engine.top(); m.runAct({ recruit: 'guanyu' }); m.runAct({ recruit: 'zhangfei' }); while (Engine.top().constructor.name === 'DialogScene') Engine.pop(); });
  await sleep(200);
  s = await S();
  check('party of 4', s.party.length === 4 && s.scene === 'MapScene', s.party.map(p => p.n));

  // 路線選擇：村民 (9,6)。目前在 (13,8)
  await tap('ArrowLeft'); await tap('ArrowLeft'); await tap('ArrowLeft'); await tap('ArrowLeft'); // (9,8)
  await tap('ArrowUp');                                                                         // (9,7)
  await tap('ArrowUp');                                                                         // faces NPC
  await tap('z'); await sleep(300);
  await page.waitForFunction(() => Engine.top().constructor.name === 'DialogScene');
  // 第一句→選項句：手動推進到選項出現
  for (let g = 0; g < 20; g++) { const c = await page.evaluate(() => Engine.top().choosing); if (c) break; await tap('z', 40, 250); }
  s = await S();
  check('choice dialog open (choosing)', s.scene === 'DialogScene');
  await shot('route_choice');
  await talk(0);   // 武力路線
  s = await S();
  check('route=force stored, back on map', s.flags.route === 'force' && s.scene === 'MapScene', { r: s.flags.route, sc: s.scene });
  await tap('z'); await sleep(300);
  const dl = await page.evaluate(() => Engine.top().lines[0].text);
  check('villager now says the route is locked', /已經選好路線/.test(dl), dl);
  await talk();

  // 狀態畫面顯示路線技能
  await tap('Escape'); await tap('Enter'); await shot('status_route');
  const nyao = await page.evaluate(() => BattleLogic.skillsFor(Game.party[0], Game.flags).map(x => x.name));
  check('force route unlocks 猛擊 only (Lv1)', JSON.stringify(nyao) === '["猛擊"]', nyao);
  await tap('x'); await tap('x');

  // ---- 戰鬥（真按鍵）
  await page.evaluate(() => { Engine.top().startBattle(['turban', 'archer'], false); });
  await sleep(300);
  s = await S(); check('battle scene started', s.scene === 'BattleScene', s.scene);
  await sleep(1500); await shot('intro');
  // 等到指令選單
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  s = await S(); check('command menu reached', s.state === 'cmd', s.state);
  await shot('cmd');
  // 計謀：諸葛貓妖(第一位) 選 計謀→猛擊→目標
  await tap('ArrowDown'); await tap('z'); await sleep(100); await shot('skill_menu');
  s = await S(); check('skill menu open', s.state === 'skill', s.state);
  await tap('z'); await sleep(100); await shot('target');
  s = await S(); check('target select open', s.state === 'target', s.state);
  await tap('z');
  const before = await S();
  s = await fightByKeys({ shotCmd: 'cmd2' });
  check('battle ended on the map', s && s.scene === 'MapScene', s && s.scene);
  check('win: gold increased, exp gained', s.gold > before.gold && s.party[0].exp > 0, { gold: s.gold, exp: s.party[0].exp });
  await sleep(300); await shot('after_win');

  // 回復道具：先讓某人受傷，從選單用傷藥
  await page.evaluate(() => { Game.party[1].hp = 10; });
  await tap('Escape'); await tap('ArrowDown'); await tap('Enter');
  s = await S(); check('item screen opens', s.scene === 'ItemScene', s.scene);
  await tap('z'); await tap('ArrowDown'); await tap('z'); await shot('item_use');
  s = await S();
  check('herb heals Liu Bei by 60 and consumes one', s.party[1].hp === 70 && s.items.herb === 2, { hp: s.party[1].hp, herb: s.items.herb });
  await tap('x'); await tap('x'); await tap('x');
  s = await S(); check('back to map from item screen', s.scene === 'MapScene', s.scene);

  // ---- 旅館 & 商店
  await page.evaluate(() => { Game.gold = 100; Game.party[2].hp = 5; Game.party[2].tp = 0; Engine.replaceAll(new Scenes.Map('inn', { x: 8, y: 3, dir: 'up' })); });
  await sleep(300); await tap('z'); await sleep(1800); await tap('z'); await sleep(100);
  await tap('z');  // 住宿
  await sleep(300);
  s = await S();
  check('inn: gold 100 -> 70, party fully healed', s.gold === 70 && s.party[2].hp === s.party[2].hpMax && s.party[2].tp === s.party[2].tpMax, { g: s.gold, p: s.party[2] });
  await page.evaluate(() => { while (Engine.top().constructor.name === 'DialogScene') Engine.pop(); Game.gold = 10; Engine.top().runAct({ rest: true }); });
  await sleep(200);
  s = await S(); check('inn: not enough gold is refused, gold unchanged', s.gold === 10, s.gold);
  await page.evaluate(() => { while (Engine.top().constructor.name === 'DialogScene') Engine.pop(); Game.gold = 100; Engine.top().runAct({ buy: 'smoke' }); while (Engine.top().constructor.name === 'DialogScene') Engine.pop(); });
  await sleep(200);
  s = await S(); check('buy smoke bomb: gold 60, smoke 1', s.gold === 60 && s.items.smoke === 1, { g: s.gold, i: s.items });

  // ---- 隨機遇敵：Math.random=0 → 一定遇敵；走 4 步
  await page.evaluate(() => { Math.random = () => 0; Engine.replaceAll(new Scenes.Map('field', { x: 11, y: 2, dir: 'down' })); });
  await sleep(300);
  for (let i = 0; i < 5; i++) { await tap('ArrowDown', 60, 150); if ((await S()).scene === 'BattleScene') break; }
  s = await S(); check('random encounter triggers in the field', s.scene === 'BattleScene', { sc: s.scene, pos: s.pos });
  // 逃跑：用煙霧彈（一定逃走）。cmd → 道具 → 煙霧彈
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  await tap('ArrowDown'); await tap('ArrowDown'); await tap('z');
  s = await S(); check('item list open in battle', s.state === 'item', s.state);
  await shot('battle_items');
  // 選單中只有 傷藥(2) 和 煙霧彈(1) → 煙霧彈在第二個
  await tap('ArrowDown'); await tap('z');
  for (let i = 0; i < 60 && (await S()).scene === 'BattleScene'; i++) await tap('z', 40, 100);
  s = await S(); check('smoke bomb escapes; back on map; smoke used up', s.scene === 'MapScene' && s.items.smoke === 0, { sc: s.scene, sm: s.items.smoke });
  await page.evaluate(() => { Math.random = Object.getPrototypeOf(Math).random || Math.random; });

  // ---- Boss：把隊伍調強，真按鍵打到底
  await page.evaluate(() => { Game.party.forEach(m => { m.atk = 120; m.hp = m.hpMax = 999; }); Engine.replaceAll(new Scenes.Map('field', { x: 11, y: 17, dir: 'down' })); });
  await sleep(300);
  await tap('ArrowDown'); // 面向下？已在 (11,17)，boss 在 (11,18)
  await tap('z'); await sleep(2000); await tap('z'); await sleep(200); await tap('z'); await sleep(2000); await tap('z'); await sleep(500);
  s = await S(); check('boss battle starts after dialogue', s.scene === 'BattleScene', s.scene);
  for (let i = 0; i < 15 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  await shot('boss_cmd');
  // 試著逃跑應被拒絕 (Boss不能逃)：指令 逃跑 = index 4（往上一格）
  await tap('ArrowRight'); await tap('ArrowDown'); await tap('ArrowDown'); await tap('z');   // 逃跑
  for (let i = 0; i < 12; i++) { await tap('z', 40, 120); }
  s = await S(); check('fleeing from boss is refused (still in battle)', s.scene === 'BattleScene', s.scene);
  s = await fightByKeys({});
  check('boss defeated: flag set, boss NPC gone', s && s.flags.boss_down === true, s && s.flags.boss_down);
  for (let i = 0; i < 10 && (await S()).scene !== 'MapScene'; i++) { await sleep(1500); await tap('z'); }
  s = await S(); check('after boss: on map', s.scene === 'MapScene', s.scene);
  const bossGone = await page.evaluate(() => !Engine.top().npcAt(11, 18));
  check('boss NPC hidden', bossGone);

  // ---- 全體攻擊
  await page.evaluate(() => { Engine.top().startBattle(['turban', 'turban', 'archer'], false); });
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  await tap('ArrowRight'); await shot('allatk_menu'); await tap('z');
  const plans = await page.evaluate(() => Engine.top().plans.map(p => p && p.type + (p.auto ? ':auto' : '')));
  check('全體攻擊 sets an auto attack for all 4 members at once', plans.length === 4 && plans.every(x => x === 'attack:auto'), plans);
  s = await fightByKeys({ script: [['ArrowRight', 'z']] });
  check('all-attack battle finishes', s && s.scene === 'MapScene', s && s.scene);
  for (let i = 0; i < 6 && (await S()).scene !== 'MapScene'; i++) await tap('z');

  // ---- 戰敗：把隊伍弄成 1 血、攻擊 1，打黃巾兵
  await page.evaluate(() => { Game.gold = 101; Game.party.forEach(m => { m.atk = 1; m.int = 1; m.def = 0; m.hp = 1; }); Engine.top().startBattle(['bandit', 'bandit', 'captain'], false); });
  s = await fightByKeys({});
  for (let i = 0; i < 10 && (await S()).scene !== 'MapScene'; i++) await tap('z');
  s = await S();
  check('defeat: back in town, gold halved (101 -> 50), party restored', s.map === 'zhuoxian' && s.gold === 50 && s.party.every(p => p.hp === p.hpMax), { map: s.map, g: s.gold });
  await tap('z'); await sleep(300);

  // ---- 存檔含金錢/道具
  await page.evaluate(() => { Game.gold = 777; Game.items.herb = 9; localStorage.setItem('chuanyue-sanguo-v1-slot0', JSON.stringify(Game.snapshot())); });
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('chuanyue-sanguo-v1-slot0')); delete d.gold; delete d.items; localStorage.setItem('chuanyue-sanguo-v1-slot1', JSON.stringify(d)); });
  await page.reload(); await sleep(500);
  await tap('ArrowDown'); await tap('Enter'); await tap('Enter'); await sleep(300);
  s = await S(); check('load restores gold 777 & herbs 9 & route', s.gold === 777 && s.items.herb === 9 && s.flags.route === 'force' && s.party.length === 4, { g: s.gold, h: s.items.herb });
  await page.reload(); await sleep(500);
  await tap('ArrowDown'); await tap('Enter'); await tap('ArrowDown'); await tap('Enter'); await sleep(300);
  s = await S(); check('old save without gold/items loads with defaults', s.scene === 'MapScene' && s.gold === 0 && s.items.herb === 0, { g: s.gold, i: s.items });

  check('no page errors', errors.length === 0, errors);
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
