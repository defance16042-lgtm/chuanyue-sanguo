// 第二章(三)：虎牢關呂布、洛陽徐榮、曹操離隊
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
  async function talk() { for (let g = 0; g < 60; g++) { if ((await top()) !== 'DialogScene') return; await tap('z', 40, 120); } }
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei', 'caocao'].map(Game.makeMember).filter(Boolean); Game.flags = { intro_done: true, huaxiong_down: true, seen_sishui: true }; });
  const st = await page.evaluate(() => ({ p: Game.party.map(m => m.id), g: ['boss16', 'boss17', 'field10'].map(k => !!DATA.battle.groups[k]), w: DATA.worldTowns.hulao && DATA.worldTowns.luoyang }));
  check('data present', st.g.every(Boolean) && !!st.w, st);
  // 世界地圖進虎牢關
  const hl = await page.evaluate(() => DATA.worldTowns.hulao);
  await page.evaluate(h => Engine.replaceAll(new Scenes.Map('world2', { x: h.x, y: h.y + 1, dir: 'up' })), hl); await sleep(300); await tap('ArrowUp', 90, 1200);
  check('enter hulao from world', (await page.evaluate(() => Game.mapId)) === 'hulao');
  await page.evaluate(() => Engine.replaceAll(new Scenes.Map('hulao', { x: 11, y: 4, dir: 'up' }))); await sleep(400); await talk();
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('lubu starts battle', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.lubu_down = true; });
  // 洛陽：徐榮
  await page.evaluate(() => Engine.replaceAll(new Scenes.Map('luoyang', { x: 20, y: 10, dir: 'right' }))); await sleep(400); await talk();
  const xr = await page.evaluate(() => { const m = Engine.top().map; return Engine.top().constructor.name; });
  check('luoyang loads', xr === 'MapScene', xr);
  await page.evaluate(() => { Game.flags.ly_caocao_go = true; Engine.replaceAll(new Scenes.Map('luoyang', { x: 20, y: 10, dir: 'right' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('xurong starts battle', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.xurong_down = true; });
  // after-dialogue: caocao leaves
  await page.evaluate(() => Engine.push(new Scenes.Dialog(DATA.dialogue.xurong_after))); await talk();
  const left = await page.evaluate(() => Game.party.map(m => m.id));
  check('caocao left the party', !left.includes('caocao'), left);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
