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
    ['world', 'world2', 'cave1', 'cave2', 'cave3', 'cave4', 'cave5'].concat(D.townIds).forEach(id => {
      const m = D.maps[id]; if (!m) { out.push('missing ' + id); return; }
      const w = m.tiles[0].length; if (!m.tiles.every(r => r.length === w)) out.push(id + ' ragged');
      m.warps.forEach(x => { if (!D.maps[x.to]) out.push(id + ' bad warp'); else if (!/^world2?$/.test(x.to) && solid.has(tid(D.maps[x.to], x.tx, x.ty))) out.push(id + ' lands on solid ' + x.to); });
    });
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || ny >= m.tiles.length || nx >= m.tiles[0].length) return; if (solid.has(tid(m, nx, ny)) || seen.has(nx + ',' + ny)) return; seen.add(nx + ',' + ny); q.push([nx, ny]); }); } return seen; };
    ['world', 'world2'].forEach(wid => { const WM = D.maps[wid], r = reach(WM, WM.start.x, WM.start.y);
      if (wid === 'world') [[19, 23], [62, 13], [3, 58]].forEach(p => reach(WM, p[0], p[1]).forEach(k => r.add(k)));   // 第二章的區域要穿過山口／關口才到，從山口另一側出發也算
      WM.warps.forEach(w => { if (!r.has((w.bx !== undefined ? w.bx : w.x) + ',' + (w.by !== undefined ? w.by : w.y + 1)) && !r.has(w.x + ',' + (w.y + 1)) && !r.has((w.x + 1) + ',' + w.y) && !r.has((w.x - 1) + ',' + w.y)) out.push('unreachable ' + wid + ' ' + w.to); });
      WM.npcs.forEach(n => { if (!D.dialogue[n.dialogue]) out.push('no dlg ' + n.id); (n.alts || []).forEach(a => { if (!D.dialogue[a.dialogue]) out.push('no alt ' + a.dialogue); }); });
      const d1 = WM.dock; if (!r.has(d1.arrive[0] + ',' + d1.arrive[1])) out.push('dock arrive unreachable ' + wid); });
    D.townIds.forEach(t => { const m = D.maps[t], g = m.warps.find(x => /^world2?$/.test(x.to)); if (!g) { out.push('no gate ' + t); return; } if (!reach(m, m.start.x, m.start.y).has(g.x + ',' + g.y)) out.push('gate unreachable ' + t); });
    ['cave1', 'cave2', 'cave3', 'cave4', 'cave5'].forEach(cv => [cv, cv + '_2', cv + '_3'].forEach(c => { if (!D.maps[c]) { out.push('missing floor ' + c); return; } const m = D.maps[c], s = reach(m, m.start.x, m.start.y); m.warps.forEach(w => { if (!D.maps[w.to]) out.push(c + ' bad warp'); else if (solid.has(tid(D.maps[w.to], w.tx, w.ty))) out.push(c + ' lands on solid'); }); m.objects.forEach(o => { if (o.secret) return; if (!s.has(o.x + ',' + o.y) && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => s.has((o.x + a) + ',' + (o.y + b)))) out.push(c + ' chest unreachable ' + o.id); }); m.npcs.forEach(n => { if (!D.dialogue[n.dialogue]) out.push('no dlg ' + n.id); }); const g = D.battle.groups[c.replace('_3', '') + 'boss']; if (c.endsWith('_3') ? !g : false) out.push('no boss group ' + c); m.objects.filter(o => o.type === 'gate').forEach(g => { if (!m.objects.some(o => o.type === 'lever' && o.flag === g.flag)) out.push(c + ' gate without lever'); if (!m.objects.some(o => o.secret)) out.push(c + ' gate without secret chest'); }); m.objects.filter(o => o.type === 'lever').forEach(l => { if (!m.objects.some(o => o.type === 'gate' && o.flag === l.flag)) out.push(c + ' lever without gate'); }); m.npcs.forEach(n => { (n.alts || []).forEach(a => { if (!D.dialogue[a.dialogue]) out.push('no alt ' + a.dialogue); }); }); }));
    Object.keys(D.battle.groups).forEach(g => D.battle.groups[g].forEach(gr => gr.forEach(e => { if (!D.battle.enemies[e]) out.push('bad enemy ' + e); })));
    return out;
  });
  check('world/cave data consistent and reachable', d.length === 0, d);
  async function talk() { for (let g = 0; g < 40; g++) { const d = await page.evaluate(() => Engine.top().constructor.name === 'DialogScene'); if (!d) return; await tap('z', 40, 260); } }
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
  await go('world', 46, 11, 'up'); await sleep(300); await tap('ArrowUp', 90, 1200);
  m = await page.evaluate(() => Game.mapId); check('the camp on the world map leads into the field south of Zhuoxian', m === 'field', m);
  await go('field', 11, 1, 'up'); await sleep(300); await tap('ArrowUp', 90, 1200);
  m = await page.evaluate(() => [Game.mapId, Game.pos.x, Game.pos.y]); check('the field north gate returns to the camp', m[0] === 'world' && m[1] === 46 && m[2] === 11, m);
  await page.evaluate(() => { delete Game.flags['chest_' + 'c1a']; Game.items.herb = 0; });
  const cc = await page.evaluate(() => DATA.maps.cave1.objects[0]); await go('cave1', cc.x + 1, cc.y, 'left'); await sleep(300); await tap('z', 60, 400);
  let c = await page.evaluate(() => [Game.items.herb, Game.flags.chest_c1a]); check('chest gives items once', c[0] === 3 && c[1] === true, c);
  for (let i = 0; i < 4; i++) await tap('z', 60, 250);
  const cc2 = await page.evaluate(() => DATA.maps.cave1.objects[0]); await go('cave1', cc2.x + 1, cc2.y, 'left'); await sleep(300); await tap('z', 60, 400);
  c = await page.evaluate(() => Game.items.herb); check('opened chest stays empty', c === 3, c);
  await page.evaluate(() => { Game.flags.seen_zhuoxian = true; Game.flags.boss_down = true; Game.flags.lastTown = 'guangyang'; });
  // 多層洞穴：守路頭目擋路會開戰、樓梯上下樓
  const fl = await page.evaluate(() => { const m = DATA.maps.cave2, g = m.npcs.find(n => /_g1$/.test(n.id)), dn = m.warps.find(w => w.to === 'cave2_2'); return { g: { x: g.x, y: g.y }, dn: { x: dn.x, y: dn.y } }; });
  await page.evaluate(() => { Game.party.forEach(m => { m.hp = m.hpMax = 9999; }); });
  const around = await page.evaluate(({ x, y }) => { const m = DATA.maps.cave2, ok = (a, b) => ((ch => { const t = DATA.legend[ch]; return t !== undefined && !DATA.solidTiles.includes(t); })(m.tiles[b][a])); return [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']].find(([dx, dy]) => ok(x + dx, y + dy)); }, fl.g);
  await go('cave2', fl.g.x + around[0], fl.g.y + around[1], around[2]); await sleep(300); await tap('z', 60, 500); await talk(); await sleep(800);
  const sc = await page.evaluate(() => Engine.top().constructor.name); check('cave guard starts a battle when spoken to', sc === 'BattleScene', sc);
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); });
  await page.evaluate(({ x, y }) => { const m = DATA.maps.cave2; const open = [[-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down'], [0, 1, 'up']].find(([dx, dy]) => (ch => { const t = DATA.legend[ch]; return t !== undefined && !DATA.solidTiles.includes(t); })(m.tiles[y + dy][x + dx])); Engine.replaceAll(new Scenes.Map('cave2', { x: x + open[0], y: y + open[1], dir: open[2] === 'right' ? 'right' : open[2] })); window.__o = open; }, fl.dn);
  await sleep(300);
  const key = await page.evaluate(() => ({ right: 'ArrowRight', left: 'ArrowLeft', down: 'ArrowDown', up: 'ArrowUp' }[window.__o[2]]));
  await tap(key, 90, 1200);
  m = await page.evaluate(() => Game.mapId); check('stairs down lead to the second floor', m === 'cave2_2', m);
  const up = await page.evaluate(() => DATA.maps.cave2_2.warps[0]); check('second floor has a way back up', up.to === 'cave2', up);
  // 拉桿開石門、靈泉回復、陶罐只開一次
  const lv = await page.evaluate(() => { for (const id of ['cave1_2', 'cave2_2', 'cave3_2', 'cave4_2']) { const m = DATA.maps[id], l = m.objects.find(o => o.type === 'lever'); if (l) return { id, l, g: m.objects.find(o => o.type === 'gate' && o.flag === l.flag) }; } return null; });
  check('a cave floor has a lever and a stone gate', !!lv && !!lv.g, lv);
  const side = await page.evaluate(({ l, id }) => { const m = DATA.maps[id]; return [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']].find(([dx, dy]) => (ch => { const t = DATA.legend[ch]; return t !== undefined && !DATA.solidTiles.includes(t); })(m.tiles[l.y + dy][l.x + dx]) && !m.objects.some(o => o.x === l.x + dx && o.y === l.y + dy)); }, lv);
  await page.evaluate(() => { delete Game.flags[Engine.top().map && 'x']; });
  await go(lv.id, lv.l.x + side[0], lv.l.y + side[1], side[2]); await sleep(300);
  const blocked0 = await page.evaluate(({ g }) => Engine.top().blocked(g.x, g.y), lv);
  await tap('z', 60, 400); await talk();
  const blocked1 = await page.evaluate(({ g }) => Engine.top().blocked(g.x, g.y), lv);
  check('the gate blocks until the lever is pulled', blocked0 === true && blocked1 === false, [blocked0, blocked1]);
  const sp = await page.evaluate(() => { for (const id of ['cave1_3', 'cave2_3', 'cave3_3', 'cave4_3']) { const m = DATA.maps[id], o = m.objects.find(o => o.type === 'spring'); if (o) return { id, o }; } return null; });
  check('the last floor has a healing spring', !!sp, sp);
  const side2 = await page.evaluate(({ o, id }) => { const m = DATA.maps[id]; return [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']].find(([dx, dy]) => (ch => { const t = DATA.legend[ch]; return t !== undefined && !DATA.solidTiles.includes(t); })(m.tiles[o.y + dy][o.x + dx]) && !m.objects.some(q => q.x === o.x + dx && q.y === o.y + dy)); }, sp);
  await page.evaluate(() => { Game.party.forEach(m => { m.hp = 1; }); });
  await go(sp.id, sp.o.x + side2[0], sp.o.y + side2[1], side2[2]); await sleep(300); await tap('z', 60, 400); await talk();
  const hp = await page.evaluate(() => Game.party.every(m => m.hp === m.hpMax)); check('the spring restores the party', hp);
  check('no page errors', errors.length === 0, errors);
  console.log(`\n${pass} passed, ${fail} failed`); await browser.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
