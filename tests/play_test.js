// Drives the real game in headless Chromium with real key presses.
const { chromium } = require('playwright');
const OUT = require('os').tmpdir();
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');

let pass = 0, fail = 0;
const check = (name, ok, extra) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));   // 標題的更新檢查不連真的網路
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const st = () => page.evaluate(() => ({
    scene: Engine.top().constructor.name, map: Game.mapId, pos: Game.pos, flags: Game.flags,
    nyao: { atk: Game.party[0].atk, int: Game.party[0].int, points: Game.party[0].points }
  }));
  const tap = async (key, hold = 80, after = 190) => { await page.keyboard.down(key); await sleep(hold); await page.keyboard.up(key); await sleep(after); };
  const shot = async name => page.screenshot({ path: `${OUT}/shot_${name}.png` });

  await page.goto(URL);
  await sleep(500);
  check('title scene shows', (await st()).scene === 'TitleScene');
  await shot('1_title');

  await tap('Enter');
  await sleep(400);
  check('new game opens the intro dialogue', (await st()).scene === 'DialogScene');
  for (let g = 0; g < 20 && (await st()).scene === 'DialogScene'; g++) await tap('z', 40, 250);
  await sleep(300);
  check('intro sets flag intro_done and returns to map', (await st()).flags.intro_done === true && (await st()).scene === 'MapScene', (await st()).flags);
  let s = await st();
  check('new game enters map at start', s.scene === 'MapScene' && s.map === 'zhuoxian' && s.pos.x === 15 && s.pos.y === 9, s.pos);
  await sleep(300);
  await shot('2_map');

  // collision with the map edge: hold left for a long time, must stop at x=1 (tree at x=0)
  await page.keyboard.down('ArrowLeft'); await sleep(2200); await page.keyboard.up('ArrowLeft'); await sleep(200);
  s = await st();
  check('walking left stops at the edge tree (x=1)', s.pos.x === 1 && s.pos.y === 9, s.pos);

  // logic-level collision checks
  const col = await page.evaluate(() => { const m = Engine.top(); return { tree: m.blocked(1, 5), water: m.blocked(22, 17), free: m.blocked(2, 9), npc: m.blocked(13, 8), crystal: m.blocked(17, 6), oob: m.blocked(-1, 3) }; });
  check('tree/water/npc/crystal/out-of-bounds are blocked, grass is free', col.tree && col.water && col.npc && col.crystal && col.oob && !col.free, col);

  // walk back: right 12 -> (13,9), directly below the villager at (13,8)
  for (let i = 0; i < 12; i++) await tap('ArrowRight');
  s = await st();
  check('tap = exactly one tile', s.pos.x === 13 && s.pos.y === 9, s.pos);

  // talk to villager at (9,6): face up (blocked -> just turns), press Z
  await tap('ArrowUp');
  s = await st();
  check('pushing into an NPC does not move', s.pos.x === 13 && s.pos.y === 9 && s.pos.dir === 'up', s.pos);
  await tap('z');
  check('Z opens dialogue', (await st()).scene === 'DialogScene');
  await sleep(1500);
  await shot('3_dialog');
  await shot('3_dialog');
  for (let g = 0; g < 20 && (await st()).scene === 'DialogScene'; g++) await tap('z', 40, 250);
  await page.evaluate(() => { Game.flags.route = 'wit'; });   // 路線選擇現在在酒肆（劉備提問），這裡直接設定
  s = await st();
  check('route flag can be set (wit)', s.flags.route === 'wit', s.flags);
  await sleep(300);
  check('dialogue closes back to map', (await st()).scene === 'MapScene');

  // menu + status + allocate points (nyao: 6 points, atk/int start at 12)
  await tap('Escape');
  check('Esc opens menu', (await st()).scene === 'MenuScene');
  await shot('5_menu');
  await tap('Enter');
  check('menu -> status', (await st()).scene === 'StatusScene');
  await tap('z'); await tap('ArrowDown'); await tap('z');   // 角色資料是唯讀，不能配點
  s = await st();
  check('status is read-only: atk 13, int 13, no points', s.nyao.atk === 13 && s.nyao.int === 13 && s.nyao.points === undefined, s.nyao);
  await shot('6_status');
  await tap('x'); await tap('x');
  check('status/menu close back to map', (await st()).scene === 'MapScene');

  // go to the save crystal at (17,6): from (13,9) right 3 -> (16,9), up 3 -> (16,6), face right
  for (let i = 0; i < 3; i++) await tap('ArrowRight');
  await tap('ArrowUp'); await tap('ArrowUp'); await tap('ArrowUp');
  await tap('ArrowRight');
  s = await st();
  check('standing at (16,6) facing the crystal', s.pos.x === 16 && s.pos.y === 6 && s.pos.dir === 'right', s.pos);
  await tap('z');
  check('Z at the crystal opens save screen', (await st()).scene === 'SaveScene');
  await tap('z');
  await shot('7_save');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('chuanyue-sanguo-v1-slot0') || 'null'));
  check('slot 1 written with position/stats/flags', !!stored && stored.pos.x === 16 && stored.pos.y === 6 && stored.party[0].atk === 13 && stored.flags.route === 'wit', stored && { pos: stored.pos, atk: stored.party[0].atk });
  await tap('x');

  // door warp: up to row 5, left along it to x=5, then up into the door at (5,4)
  await tap('ArrowUp');
  for (let i = 0; i < 11; i++) await tap('ArrowLeft');
  await tap('ArrowUp'); await sleep(700);
  s = await st();
  check('door warps into the inn at (5,6)', s.map === 'inn' && s.pos.x === 5 && s.pos.y === 6, { map: s.map, pos: s.pos });
  await shot('8_inn');
  await tap('ArrowDown'); await tap('ArrowDown'); await sleep(700);  // (5,7) is the exit door
  s = await st();
  check('exit door returns to town at (5,5)', s.map === 'zhuoxian' && s.pos.x === 5 && s.pos.y === 5, { map: s.map, pos: s.pos });

  // reload the page and load the save from the title screen
  await page.evaluate(() => { localStorage.setItem('chuanyue-sanguo-v1-slot2', JSON.stringify({ version: 99, mapId: 'zhuoxian' })); localStorage.setItem('chuanyue-sanguo-v1-slot1', '{not json'); });
  await page.reload(); await sleep(500);
  await tap('ArrowDown'); await tap('Enter');
  check('title -> load screen', (await st()).scene === 'SaveScene');
  await tap('ArrowDown'); await tap('Enter');       // slot 2: invalid json
  await shot('9_load_bad');
  check('corrupt save does not crash or load', (await st()).scene === 'SaveScene');
  await tap('ArrowDown'); await tap('Enter');       // slot 3: wrong version
  check('wrong-version save is refused', (await st()).scene === 'SaveScene');
  await tap('ArrowDown'); await tap('Enter');       // back to slot 1 (wraps): valid
  await sleep(400);
  s = await st();
  check('valid save restores map, position, stats and flags', s.scene === 'MapScene' && s.map === 'zhuoxian' && s.pos.x === 16 && s.pos.y === 6 && s.nyao.atk === 13 && s.nyao.int === 13 && s.flags.route === 'wit', s);
  await shot('10_loaded');

  // window resize keeps integer scaling
  await page.setViewportSize({ width: 1920, height: 1080 }); await sleep(300);
  const size = await page.evaluate(() => ({ S: Engine.S, w: Engine.canvas.width, h: Engine.canvas.height }));
  check('1920x1080 scales up to fill the window height (1080)', size.h >= 1070 && size.h <= 1080 && size.S > 4.5, size);

  check('no page errors or console errors', errors.length === 0, errors);
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
