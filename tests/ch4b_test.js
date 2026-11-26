// 第四章批次2a：五關道地圖、頭目擋路、入口、戰鬥與鄴城重逢
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
  async function talk() { for (let g = 0; g < 90; g++) { if ((await top()) !== 'DialogScene') return; await tap('z', 40, 120); } }
  const d = await page.evaluate(() => {
    const D = DATA, o = { errs: [] }, solid = new Set(D.solidTiles);
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const reach = (m, sx, sy, block) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && walk(m, nx, ny) && !(block && block.x === nx && block.y === ny)) { seen.add(k); q.push([nx, ny]); } }); } return seen; };
    ['wg1', 'wg2', 'wg3', 'wg4', 'wg5'].forEach(id => {
      const m = D.maps[id]; if (!m) { o.errs.push('missing ' + id); return; }
      const bossNpc = m.npcs.find(n => n.id === id + 'boss'), r = reach(m, m.start.x, m.start.y), rb = reach(m, m.start.x, m.start.y, bossNpc);
      m.npcs.forEach(n => { if (!walk(m, n.x, n.y)) o.errs.push(id + ' npc solid ' + n.id); [n.dialogue].concat((n.alts || []).map(a => a.dialogue)).forEach(k => { if (!D.dialogue[k]) o.errs.push(id + ' dlg ' + k); }); });
      m.objects.forEach(c => { if (c.type === 'chest' && !r.has(c.x + ',' + c.y)) o.errs.push(id + ' chest unreachable ' + c.id); });
      m.warps.forEach(w => { if (!D.maps[w.to]) o.errs.push(id + ' warp missing'); else if (!walk(D.maps[w.to], w.tx, w.ty)) o.errs.push(id + ' warp lands solid ' + w.to + w.tx + ',' + w.ty); if (!walk(m, w.x, w.y)) o.errs.push(id + ' warp tile solid ' + w.x + ',' + w.y); });
      if (!r.has('11,1')) o.errs.push(id + ' north unreachable');
      if (rb.has('11,1')) o.errs.push(id + ' boss does not block');
      ['boss', 'g1', 'g2'].forEach(k => { if (!D.battle.groups[id + k]) o.errs.push('group ' + id + k); });
    });
    o.entry = D.maps.world4.warps.find(w => w.to === 'wg1');
    o.w4walk = walk(D.maps.world4, D.ch4Entry.x, D.ch4Entry.y);
    o.drop = !!D.drops.kongxiu;
    o.gear = ['chitu_boots', 'guan_green_robe', 'hanshou_seal', 'dongling_blade'].every(g => D.equipment[g]);
    return o;
  });
  check('五關道地圖/NPC/寶箱/傳送/擋路驗證', d.errs.length === 0, d.errs);
  check('入口傳送點存在', !!d.entry && d.entry.need === 'ch4_guan_leave', d.entry);
  check('入口圖塊可走', d.w4walk); check('裝備齊全', d.gear);
  // 入口
  await page.evaluate(() => { Game.flags.ch4_guan_leave = true; Engine.replaceAll(new Scenes.Map('world4', { x: DATA.ch4Entry.x - 1, y: DATA.ch4Entry.y, dir: 'right' })); });
  await sleep(300); await tap('ArrowRight', 90, 1500);
  check('由大地圖進入東嶺關', (await page.evaluate(() => Game.mapId)) === 'wg1', await page.evaluate(() => Game.mapId));
  // 每關頭目開戰
  for (const k of ['wg1', 'wg2', 'wg3', 'wg4', 'wg5']) {
    await page.evaluate(k => { while (Engine.stack && Engine.stack.length > 1 && Engine.top().constructor.name !== 'MapScene') Engine.pop(); Engine.replaceAll(new Scenes.Map(k, { x: 11, y: 13, dir: 'up' })); }, k);
    await sleep(400); await tap('z', 60, 400); await talk(); await sleep(900);
    check(k + ' 頭目開戰', (await top()) === 'BattleScene', await top());
    await page.evaluate(k => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags[k + '_down'] = true; Engine.push(new Scenes.Dialog(DATA.dialogue[k + '_after'])); }, k); await talk();
  }
  check('黃河渡口後旗標', await page.evaluate(() => !!Game.flags.wg5_down));
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
