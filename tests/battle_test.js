const { chromium } = require('playwright');
const OUT = require('os').tmpdir();
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));   // 標題的更新檢查不連真的網路
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const tap = async (k, hold = 70, after = 170) => { await page.keyboard.down(k); await sleep(hold); await page.keyboard.up(k); await sleep(after); };
  const shot = n => page.screenshot({ path: `${OUT}/b_${n}.png` });
  const S = () => page.evaluate(() => { const t = Engine.top(); return { scene: t.constructor.name, state: t.state, map: Game.mapId, pos: Game.pos, gold: Game.gold, items: Game.items, flags: Game.flags,
    party: Game.party.map(m => ({ n: m.name, lv: m.level, hp: m.hp, hpMax: m.hpMax, tp: m.tp, tpMax: Game.tpMaxOf(m), exp: m.exp, atk: m.atk, int: m.int, })) }; });


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
  await sleep(400);
  await talk();     // 序幕對話
  await sleep(300);
  await page.evaluate(() => { Game.flags.heard_merchant = true; });   // 先聽過市集的消息，劉備才會正式招募
  let s = await S();
  check('new game: gold 50, 3 herbs, 1 member', s.gold === 50 && s.items.herb === 3 && s.party.length === 1, { g: s.gold, i: s.items });

  // 真按鍵：招募劉備 (14,8)
  await tap('ArrowRight'); await tap('ArrowRight'); await tap('ArrowRight'); await tap('ArrowRight');   // (15,9)->(18,9)? blocked by liubei at 18 => stops at 17
  await tap('ArrowRight');
  s = await S();
  check('walked to (17,9) next to Liu Bei', s.pos.x === 17 && s.pos.y === 9, s.pos);
  await tap('z'); await sleep(400);
  await talk();
  await sleep(300);
  s = await S();
  check('talking to Liu Bei recruits him (party 2, flag set, back on map)', s.party.length === 2 && s.flags.recruited_liubei && s.scene === 'MapScene', { n: s.party.length, sc: s.scene });
  const hid = await page.evaluate(() => !Engine.top().npcAt(18, 9));
  check('Liu Bei NPC no longer blocks (18,9)', hid);

  // 招募關羽、張飛（用程式捷徑，上面已驗證真按鍵路徑）
  await page.evaluate(() => { const m = Engine.top(); m.runAct({ recruit: 'guanyu' }); m.runAct({ recruit: 'zhangfei' }); while (Engine.top().constructor.name === 'DialogScene') Engine.pop(); });
  await sleep(200);
  s = await S();
  check('party of 4', s.party.length === 4 && s.scene === 'MapScene', s.party.map(p => p.n));

  // 路線選擇改在酒肆由劉備提問（story_test 驗證）；這裡直接設定武力路線
  await page.evaluate(() => { Game.flags.route = 'force'; });

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
  await tap('Escape'); for (let i = 0; i < 4; i++) await tap('ArrowDown'); await tap('Enter');
  s = await S(); check('item screen opens', s.scene === 'ItemScene', s.scene);
  await tap('z'); await tap('ArrowDown'); await tap('z'); await shot('item_use');
  s = await S();
  check('herb heals Liu Bei by 60 and consumes one', s.party[1].hp === 70 && s.items.herb === 2, { hp: s.party[1].hp, herb: s.items.herb });
  await tap('x'); await tap('x'); await tap('x');
  s = await S(); check('back to map from item screen', s.scene === 'MapScene', s.scene);

  // ---- 旅館 & 商店
  await page.evaluate(() => { Game.flags.oath_done = true; Game.gold = 100; Game.party[2].hp = 5; Game.party[2].tp = 0; Engine.replaceAll(new Scenes.Map('inn', { x: 8, y: 3, dir: 'up' })); });
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
  for (let i = 0; i < 14; i++) { await tap('ArrowDown', 60, 150); if ((await S()).scene === 'BattleScene') break; }
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
  await page.evaluate(() => { Math.random = () => 0.5; });

  // ---- Boss：把隊伍調強，真按鍵打到底
  await page.evaluate(() => { Game.party.forEach(m => { m.atk = 120; m.hp = m.hpMax = 999; }); Engine.replaceAll(new Scenes.Map('field', { x: 11, y: 17, dir: 'down' })); });
  await sleep(300);
  await tap('ArrowDown'); // 面向下？已在 (11,17)，boss 在 (11,18)
  await tap('z'); await sleep(400); await talk(); await sleep(500);
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
  await tap('ArrowRight'); await shot('allatk_menu'); await tap('z'); await tap('z');
  const plans = await page.evaluate(() => Engine.top().plans.map(p => p && p.type + (p.auto ? ':auto' : '')));
  check('選擇全體普通攻擊後全員設定自動普通攻擊', plans.length === 4 && plans.every(x => x === 'attack:auto'), plans);
  s = await fightByKeys({ script: [['ArrowRight', 'z']] });
  check('all-attack battle finishes', s && s.scene === 'MapScene', s && s.scene);
  for (let i = 0; i < 6 && (await S()).scene !== 'MapScene'; i++) await tap('z');

  // ---- 扣血要等「打到」的那一刻：下完指令、動作播放中，畫面兵力不能比實際動作進度先掉
  await page.evaluate(() => { Engine.top().startBattle(['captain', 'bandit'], false); });
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  for (let i = 0; i < 4; i++) { await tap('z'); await tap('z'); }   // 四人都選「攻擊」第一個敵人
  const seen = await page.evaluate(() => new Promise(res => {
    const b = Engine.top(), out = { early: 0, late: 0, frames: 0 };
    const full = b.b.enemies.reduce((a, e) => a + e.hpMax, 0);
    const t0 = performance.now();
    (function loop() {
      const real = b.b.enemies.reduce((a, e) => a + Math.max(0, e.hp), 0), shown = b.b.enemies.reduce((a, e) => a + Math.max(0, b.H(e)), 0);
      out.frames++;
      if (real < full && shown === full) out.early++;       // 邏輯已扣、畫面還沒扣（正確：動畫還沒打到）
      if (shown < real) out.late++;                          // 畫面比邏輯扣得多（不可能）
      if (performance.now() - t0 < 3000) requestAnimationFrame(loop); else res(out);
    })();
  }));
  check('HP bars only drop when the hit lands (not at command time)', seen.early > 0 && seen.late === 0, seen);
  await page.evaluate(() => { Engine.top().b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); Engine.top().finish('win'); });
  for (let i = 0; i < 12 && (await S()).scene !== 'MapScene'; i++) await tap('z');

  // ---- 偵察：不耗回合，顯示敵人資料，X 回到指令
  await page.evaluate(() => { Engine.top().startBattle(['captain', 'bandit'], false); });
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  const cmdIdx = await page.evaluate(() => { const b = Engine.top(); return { cur: b.cur, round: b.b.round }; });
  await tap('ArrowRight'); await tap('ArrowRight'); await tap('z');      // 第 3 欄：偵察
  let sc = await page.evaluate(() => { const b = Engine.top(); return { st: b.state, ty: b.pending && b.pending.type }; });
  await tap('z');
  sc = await page.evaluate(() => { const b = Engine.top(); return { st: b.state, cur: b.cur, round: b.b.round, n: b.targets.length }; });
  check('偵察 opens the scout panel without using the turn', sc.st === 'scout' && sc.cur === cmdIdx.cur && sc.round === cmdIdx.round, sc);
  await tap('ArrowDown');
  sc = await page.evaluate(() => Engine.top().scoutIdx);
  check('偵察 can switch enemy', sc === 1, sc);
  await shot('scout');
  await tap('x');
  sc = await page.evaluate(() => { const b = Engine.top(); return { st: b.state, cur: b.cur }; });
  check('X leaves scout back to command menu', sc.st === 'cmd' && sc.cur === cmdIdx.cur, sc);
  await page.evaluate(() => { Engine.top().b.enemies.forEach(e => { e.hp = 0; }); });
  await page.evaluate(() => { const b = Engine.top(); b.finish('win'); });
  for (let i = 0; i < 12 && (await S()).scene !== 'MapScene'; i++) await tap('z');

  // ---- 全體攻擊：按一次就自動打到底（不再每回合問指令），再按一下取消
  await page.evaluate(() => { Game.party.forEach(m => { m.atk = 12; m.lead = 0; m.luck = 0; m.hp = m.hpMax = 999; }); Engine.top().startBattle(['captain', 'bandit'], false); });
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  await tap('ArrowRight'); await tap('z'); await tap('z');
  let cmdAgain = false, maxRound = 0;
  for (let i = 0; i < 400; i++) {
    const t = await page.evaluate(() => { const b = Engine.top(); return { sc: b.constructor.name, st: b.state, r: b.b && b.b.round, auto: b.auto }; });
    if (t.sc !== 'BattleScene') break;
    if (t.st === 'cmd') { cmdAgain = true; break; }
    maxRound = Math.max(maxRound, t.r || 0);
    await sleep(100);
  }
  check('全體攻擊 runs several rounds by itself without asking for commands', !cmdAgain && maxRound >= 2, { cmdAgain, maxRound });
  for (let i = 0; i < 12 && (await S()).scene !== 'MapScene'; i++) await tap('z', 40, 300);
  await page.evaluate(() => { Game.party.forEach(m => { m.atk = 1; m.hp = m.hpMax = 999; }); Engine.top().startBattle(['bandit', 'bandit', 'captain'], false); });
  for (let i = 0; i < 20 && (await S()).state !== 'cmd'; i++) await tap('z', 40, 120);
  await tap('ArrowRight'); await tap('z'); await tap('z'); await sleep(300);
  const wasAuto = await page.evaluate(() => Engine.top().auto);
  await tap('z', 40, 100);
  const nowAuto = await page.evaluate(() => Engine.top().auto);
  check('pressing again cancels auto battle', wasAuto === true && nowAuto === false, { wasAuto, nowAuto });
  await page.evaluate(() => { Engine.top().b.party.forEach(u => { u.hp = 999; }); });
  for (let i = 0; i < 200 && (await S()).state !== 'cmd'; i++) await sleep(100);
  check('after cancelling, command menu returns', (await S()).state === 'cmd');
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 15, y: 9, dir: 'down' })); });
  await sleep(300);

  // ---- 戰敗：把隊伍弄成 1 血、攻擊 1，打黃巾兵
  await page.evaluate(() => { Game.gold = 101; Game.party.forEach(m => { m.atk = 1; m.int = 1; m.luck = 0; m.lead = 0; m.grd = 0; m.def = 0; m.hp = 1; }); Engine.top().startBattle(['bandit', 'bandit', 'captain'], false); });
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
