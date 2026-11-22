// 關口與山口：地圖連通、守將、寶箱、大地圖通道
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
  async function talk() { for (let g = 0; g < 80; g++) { if ((await top()) !== 'DialogScene') return; await tap('z', 40, 120); } }
  const go = (m, x, y, d) => page.evaluate(([m, x, y, d]) => Engine.replaceAll(new Scenes.Map(m, { x, y, dir: d })), [m, x, y, d]);
  const setup = f => page.evaluate(f => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = Object.assign({ intro_done: true }, f); Game.gold = 1000; }, f);
  // 資料與連通性
  const r = await page.evaluate(() => {
    const D = DATA, out = [], solid = new Set(D.solidTiles);
    ['guan_w', 'guan_e', 'shankou1', 'shankou1_2', 'shankou1_3', 'shankou2', 'shankou2_2', 'shankou2_3', 'shankou3', 'shankou3_2', 'shankou3_3'].forEach(id => {
      const m = D.maps[id]; if (!m) { out.push('missing ' + id); return; }
      m.tiles.forEach((row, y) => { if (row.length !== 24) out.push(id + ' row ' + y + ' len ' + row.length); });
      const H = m.tiles.length, W = 24, obst = new Set();
      m.npcs.forEach(n => { if (!/boss$/.test(n.id) && !/^gen_/.test(n.id)) obst.add(n.x + ',' + n.y); if (!D.dialogue[n.dialogue]) out.push(id + ' no dlg ' + n.dialogue); (n.alts || []).forEach(a => { if (!D.dialogue[a.dialogue]) out.push(id + ' no alt ' + a.dialogue); }); });
      m.objects.forEach(o => obst.add(o.x + ',' + o.y));
      const free = (x, y) => { const c = m.tiles[y] && m.tiles[y][x]; return c !== undefined && !solid.has(D.legend[c]) && !obst.has(x + ',' + y); };
      const seen = new Set([m.start.x + ',' + m.start.y]), q = [[m.start.x, m.start.y]];
      while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && free(nx, ny)) { seen.add(k); q.push([nx, ny]); } }); }
      m.objects.forEach(o => { if (o.type === 'chest' && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => seen.has((o.x + a) + ',' + (o.y + b)))) out.push(id + ' chest unreachable ' + o.id); });
      m.npcs.forEach(n => { if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => seen.has((n.x + a) + ',' + (n.y + b)))) out.push(id + ' npc unreachable ' + n.id); });
      m.warps.forEach(w => { if (!seen.has(w.x + ',' + w.y)) out.push(id + ' warp unreachable ' + w.x + ',' + w.y); });
      m.warps.forEach(w => { if (!D.maps[w.to]) out.push(id + ' warp to missing ' + w.to); else { const t = D.maps[w.to].tiles[w.ty] && D.maps[w.to].tiles[w.ty][w.tx]; if (t === undefined || solid.has(D.legend[t])) out.push(id + ' warp lands on solid ' + w.to); } });
    });
    return out;
  });
  check('fortress and mountain-pass maps are consistent and fully reachable', r.length === 0, r);
  const sk = await page.evaluate(() => ({ w1: DATA.maps.world.shankou, w2: DATA.maps.world2.shankou, p1: DATA.maps.world.pass, p2: DATA.maps.world2.pass }));
  check('three mountain passes placed', sk.w1.length === 2 && sk.w2.length === 1, [sk.w1.length, sk.w2.length]);
  // 世界地圖進入關口
  await setup({ py_news: true, sanzhang_down: true, zhangyan_down: true }); await go('world', sk.p1.x + 1, sk.p1.y, 'left'); await sleep(300); await tap('ArrowLeft', 90, 1200);
  check('west pass gate leads into the fortress', (await page.evaluate(() => Game.mapId)) === 'guan_w');
  // 守將擋在缺口；打贏後走過去到另一張地圖
  await go('guan_w', 11, 13, 'up'); await sleep(300); await tap('z', 60, 500); await talk(); await sleep(900);
  check('fortress general starts a battle', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.pass_open = true; Engine.replaceAll(new Scenes.Map('guan_w', { x: 11, y: 13, dir: 'up' })); });
  await sleep(300); for (let i = 0; i < 14; i++) await tap('ArrowUp', 110, 110); await sleep(1200);
  check('walking through the fortress leads to the Guandong map', (await page.evaluate(() => Game.mapId)) === 'world2', await page.evaluate(() => Game.mapId));
  // 東關的守將
  await setup({}); await go('guan_e', 11, 13, 'up'); await sleep(300); await tap('z', 60, 500); await talk(); await sleep(900);
  check('east fortress general fights', (await top()) === 'BattleScene', await top());
  // 山口
  const s1 = sk.w1[0];
  await setup({ sanzhang_down: true, zhangyan_down: true }); await go('world', s1.x - 2, s1.y, 'right'); await sleep(300); await tap('ArrowRight', 90, 1200);
  check('mountain pass entrance leads into the pass map', (await page.evaluate(() => Game.mapId)) === 'shankou1', await page.evaluate(() => Game.mapId));
  await go('shankou1_2', 11, 15, 'right'); await sleep(300);
  await tap('z', 60, 500); await talk(); await sleep(900);
  check('bandit chief blocks the narrow gap', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); });
  // 爬山：山腳北端的石階通往山頂，山頂南端的石階回到山腳
  await go('shankou1', 10, 2, 'up'); await sleep(300); await tap('ArrowUp', 100, 1200);
  check('stairs lead up to the summit floor', (await page.evaluate(() => Game.mapId)) === 'shankou1_2', await page.evaluate(() => Game.mapId));
  await go('shankou1_2', 10, 26, 'down'); await sleep(300); await tap('ArrowDown', 100, 1200);
  check('stairs lead back down to the foot', (await page.evaluate(() => Game.mapId)) === 'shankou1', await page.evaluate(() => Game.mapId));
  // 山腳南端走出去回到西側；從東側山口進入則在東麓
  await go('shankou1', 12, 26, 'down'); await sleep(300); await tap('ArrowDown', 100, 1200);
  const back = await page.evaluate(() => [Game.mapId, Game.pos.x, Game.pos.y]);
  check('leaving the south end returns to the west side of the ridge', back[0] === 'world' && back[1] === s1.x - 2 && back[2] === s1.y, back);
  await go('world', s1.x + 2, s1.y, 'left'); await sleep(300); await tap('ArrowLeft', 90, 1200);
  check('east-side entrance leads to the east foot', (await page.evaluate(() => Game.mapId)) === 'shankou1_3', await page.evaluate(() => Game.mapId));
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
