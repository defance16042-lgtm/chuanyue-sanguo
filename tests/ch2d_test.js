// 第二章大地圖：搭船、關口、孟津、邙山古墓
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 1024, height: 896 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await sleep(500);
  const tap = async (k, h = 60, a = 300) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); await sleep(a); };
  const top = () => page.evaluate(() => Engine.top().constructor.name);
  const info = () => page.evaluate(() => [Game.mapId, Game.pos.x, Game.pos.y]);
  async function talk(pick) { for (let g = 0; g < 80; g++) { if ((await top()) !== 'DialogScene') return; await tap(pick && g > 3 ? 'z' : 'z', 40, 120); } }
  const go = (m, x, y, d) => page.evaluate(([m, x, y, d]) => Engine.replaceAll(new Scenes.Map(m, { x, y, dir: d })), [m, x, y, d]);
  const setup = flags => page.evaluate(f => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = Object.assign({ intro_done: true }, f); Game.gold = 1000; }, flags);
  const W = await page.evaluate(() => ({ w1: DATA.maps.world.dock, w2: DATA.maps.world2.dock, p1: DATA.maps.world.pass, p2: DATA.maps.world2.pass, ids: DATA.worldIds }));
  check('world maps exist (ch1-ch5)', W.ids.join() === 'world,world2,world3,world4,world5', W.ids);
  // 渡口：黃巾沒平，船夫不載
  await setup({ seen_zhuoxian: true }); await go('world', W.w1.x - 1, W.w1.y, 'right'); await sleep(300); await tap('z', 60, 400); await talk();
  check('boatman refuses before chapter 2', (await info())[0] === 'world', await info());
  // 章節進行後：付錢搭船到孟津
  await setup({ seen_zhuoxian: true, py_news: true }); await go('world', W.w1.x - 1, W.w1.y, 'right'); await sleep(300);
  await tap('z', 60, 500); for (let i = 0; i < 4; i++) await tap('z', 40, 150);
  for (let i = 0; i < 3; i++) { if ((await top()) === 'DialogScene') await tap('z', 40, 150); }
  await sleep(500);
  let r = await page.evaluate(() => [Engine.top().constructor.name, Game.mapId, Game.gold]);
  check('boat takes you to the Yellow River on the Guandong map and costs 300', r[1] === 'world2' && r[2] === 700, r);
  // 孟津可以進、酸棗可以進（py_news 之後）
  const mj = await page.evaluate(() => DATA.worldTowns.mengjin);
  await go('world2', mj.x, mj.y + 1, 'up'); await sleep(300); await tap('ArrowUp', 90, 1200);
  check('mengjin gate opens', (await info())[0] === 'mengjin', await info());
  const sz = await page.evaluate(() => DATA.worldTowns.suanzao);
  await go('world2', sz.x, sz.y + 1, 'up'); await sleep(300); await tap('ArrowUp', 90, 1200);
  check('suanzao gate opens', (await info())[0] === 'suanzao', await info());
  // 回程搭船
  await setup({ py_news: true }); await go('world2', W.w2.x, W.w2.y + 1, 'up'); await sleep(300); await tap('z', 60, 500);
  for (let i = 0; i < 6; i++) { if ((await top()) === 'DialogScene') await tap('z', 40, 150); }
  await sleep(500); r = await page.evaluate(() => [Game.mapId, Game.gold]);
  check('boat back to the northern map costs 200', r[0] === 'world' && r[1] === 800, r);
  // 古墓
  const c5 = await page.evaluate(() => ['cave5', 'cave5_2', 'cave5_3'].map(k => !!DATA.maps[k]));
  check('cave5 has three floors', c5.every(Boolean), c5);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
