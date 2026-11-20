// 大地圖與洞穴：資料一致、每座城／洞穴走得到、未到過的城進不去、寶箱只能開一次
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1024, height: 896 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await sleep(500);
  const d = await page.evaluate(() => {
    const D = DATA, out = [], W = D.maps.world, solid = new Set(D.solidTiles);
    const tid = (m, x, y) => D.legend[m.tiles[y][x]];
    ['world', 'cave1', 'cave2', 'cave3', 'cave4'].concat(D.townIds).forEach(id => {
      const m = D.maps[id]; if (!m) { out.push('missing ' + id); return; }
      const w = m.tiles[0].length; if (!m.tiles.every(r => r.length === w)) out.push(id + ' ragged');
      m.warps.forEach(x => { if (!D.maps[x.to]) out.push(id + ' bad warp'); else if (x.to !== 'world' && solid.has(tid(D.maps[x.to], x.tx, x.ty))) out.push(id + ' lands on solid ' + x.to); });
    });
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || ny >= m.tiles.length || nx >= m.tiles[0].length) return; if (solid.has(tid(m, nx, ny)) || seen.has(nx + ',' + ny)) return; seen.add(nx + ',' + ny); q.push([nx, ny]); }); } return seen; };
    const r = reach(W, W.start.x, W.start.y);
    W.warps.forEach(w => { if (!r.has(w.x + ',' + (w.y + 1))) out.push('unreachable ' + w.to); });
    D.townIds.forEach(t => { const m = D.maps[t], g = m.warps.find(x => x.to === 'world'); if (!g) { out.push('no gate ' + t); return; } if (!reach(m, m.start.x, m.start.y).has(g.x + ',' + g.y)) out.push('gate unreachable ' + t); });
    ['cave1', 'cave2', 'cave3', 'cave4'].forEach(c => { const m = D.maps[c], s = reach(m, m.start.x, m.start.y); m.objects.forEach(o => { if (!s.has(o.x + ',' + o.y) && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => s.has((o.x + a) + ',' + (o.y + b)))) out.push(c + ' chest unreachable ' + o.id); }); m.npcs.forEach(n => { if (!D.dialogue[n.dialogue]) out.push('no dlg ' + n.id); }); const g = D.battle.groups[c + 'boss']; if (!g) out.push('no boss group ' + c); });
    Object.keys(D.battle.groups).forEach(g => D.battle.groups[g].forEach(gr => gr.forEach(e => { if (!D.battle.enemies[e]) out.push('bad enemy ' + e); })));
    return out;
  });
  check('world/cave data consistent and reachable', d.length === 0, d);
  const go = (m, x, y, dir) => page.evaluate(([m, x, y, dir]) => Engine.replaceAll(new Scenes.Map(m, { x, y, dir })), [m, x, y, dir]);
  const tap = async (k, h = 90, a = 700) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); await sleep(a); };
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, seen_zhuoxian: true }; });
  const gy = await page.evaluate(() => DATA.worldTowns.guangyang); await go('world', gy.x, gy.y + 1, 'up'); await sleep(300); await tap('ArrowUp', 90, 500);
  let m = await page.evaluate(() => Game.mapId);
  check('unvisited town (guangyang) refuses entry from the world map', m === 'world', m);
  await page.evaluate((gy) => { Engine.replaceAll(new Scenes.Map('world', { x: gy.x, y: gy.y + 1, dir: 'up' })); Game.flags.seen_guangyang = true; }, gy);
  await sleep(300); await tap('ArrowUp', 90, 1200);
  m = await page.evaluate(() => Game.mapId); check('visited town can be entered from the world map', m === 'guangyang', m);
  await page.evaluate(() => { const s = Engine.top(); const g = s.map.warps.find(w => w.to === 'world'); Engine.replaceAll(new Scenes.Map('guangyang', { x: g.x, y: g.y - 1, dir: 'down' })); });
  await sleep(300); await tap('ArrowDown', 90, 1200);
  m = await page.evaluate(() => [Game.mapId, Game.pos.x, Game.pos.y]); check('town gate leads back onto the world map', m[0] === 'world' && m[1] === gy.x && m[2] === gy.y + 1, m);
  await page.evaluate(() => { delete Game.flags.chest_c1a; Game.items.herb = 0; });
  await go('cave1', 4, 12, 'left'); await sleep(300); await tap('z', 60, 400);
  let c = await page.evaluate(() => [Game.items.herb, Game.flags.chest_c1a]); check('chest gives items once', c[0] === 3 && c[1] === true, c);
  for (let i = 0; i < 4; i++) await tap('z', 60, 250);
  await go('cave1', 4, 12, 'left'); await sleep(300); await tap('z', 60, 400);
  c = await page.evaluate(() => Game.items.herb); check('opened chest stays empty', c === 3, c);
  await page.evaluate(() => { Game.flags.seen_zhuoxian = true; Game.flags.boss_down = true; Game.flags.lastTown = 'guangyang'; });
  check('no page errors', errors.length === 0, errors);
  console.log(`\n${pass} passed, ${fail} failed`); await browser.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
