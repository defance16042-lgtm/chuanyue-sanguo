// 第四章批次2b：村莊、洞穴、守將、四條支線與兵書《孫子》
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
    const vill = ['zhongmu', 'gepo', 'liyang'], caves = ['cave8', 'cave9'];
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && walk(m, nx, ny)) { seen.add(k); q.push([nx, ny]); } }); } return seen; };
    const ids = Object.keys(D.maps).filter(id => vill.some(v => id === v || id.indexOf(v + '_') === 0) || caves.some(c => id === c || id.indexOf(c + '_') === 0));
    ids.forEach(id => {
      const m = D.maps[id], r = reach(m, m.start.x, m.start.y);
      (m.npcs || []).forEach(n => { if (!walk(m, n.x, n.y)) o.errs.push(id + ' npc solid ' + n.id); else if (![[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]].some(([a, b]) => r.has((n.x + a) + ',' + (n.y + b)))) o.errs.push(id + ' npc unreachable ' + n.id); [n.dialogue].concat((n.alts || []).map(a => a.dialogue)).forEach(k => { if (!D.dialogue[k]) o.errs.push(id + ' missing dlg ' + k); }); });
      (m.objects || []).forEach(c => { if (c.type === 'chest' && ![[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((c.x + a) + ',' + (c.y + b)))) o.errs.push(id + ' chest unreachable ' + c.id); });
      (m.warps || []).forEach(w => { if (!D.maps[w.to]) o.errs.push(id + ' warp missing ' + w.to); else if (!walk(D.maps[w.to], w.tx, w.ty)) o.errs.push(id + ' warp lands solid ' + w.to + w.tx + ',' + w.ty); });
    });
    const w4 = D.maps.world4, r4 = reach(w4, w4.start.x, w4.start.y);
    vill.forEach(t => { const p = D.worldTowns[t]; if (!p || !r4.has(p.x + ',' + (p.y + 1))) o.errs.push('village unreachable ' + t); if (!D.maps[t].npcs.some(n => n.id === 'hall_officer')) o.errs.push('no hall ' + t); if (!w4.warps.find(w => w.to === t)) o.errs.push('no world warp ' + t); });
    caves.forEach(c => { const w = w4.warps.find(w2 => w2.to === c); if (!w || !r4.has(w.x + ',' + (w.y + 1))) o.errs.push('cave entrance unreachable ' + c); ['boss', 'g1', 'g2'].forEach(k => { if (!D.battle.groups[c + k]) o.errs.push('group ' + c + k); }); [1, 2, 3].forEach(i => { const id = 'gen_' + c + (i > 1 ? '_' + i : ''); if (!D.battle.enemies[id] || !D.battle.groups[id] || !D.dialogue[id]) o.errs.push('gen ' + id); }); });
    vill.forEach(t => { ['general'].forEach(k => { if (!D.shops[t + '_' + k] || !D.shops[t + '_' + k].length) o.errs.push('shop ' + t + k); }); if (!Object.keys(D.maps).some(i => i === t + '_inn')) o.errs.push('inn ' + t); });
    o.quests = D.sideQuests.filter(q => /^q1[3-6]$/.test(q.id)).length;
    o.sideOk = D.sideQuests.filter(q => /^q1[3-6]$/.test(q.id)).every(q => { const g = D.maps[q.giver].npcs.find(n => n.id === q.id + '_giver'); return g && g.x === q.npc.x && g.y === q.npc.y && walk(D.maps[q.giver], g.x, g.y) && (q.kind === 'bounty' ? D.battle.enemies[q.target] && D.maps[q.target.replace(/^gen_/, '')] : D.maps[q.chest.map].objects.some(c => c.id === q.chest.id)); });
    o.book = D.battle.bookSkills.sun && D.battle.skills[D.battle.bookSkills.sun] && D.battle.bookNames.sun;
    o.gear = ['huanghe_helm', 'huanghe_boots', 'huanghe_jade', 'suigu_blade', 'gepo_spear', 'gepo_cloak', 'gepo_charm', 'q_ration_armor', 'q_ru_helm', 'q_bai_charm'].every(g => D.equipment[g]);
    o.secret = ['huanghe_jade', 'gepo_charm'].every(g => Object.values(D.maps).some(m => (m.objects || []).some(c => (c.gear || []).includes(g))));
    o.eskills = ['suigu', 'liupi'].every(i => D.battle.enemies[i].eSkills && D.battle.enemies[i].eSkills.length >= 2);
    return o;
  });
  check('村莊／洞穴／傳送／守將／商店驗證', d.errs.length === 0, d.errs);
  check('四條支線資料', d.quests === 4 && d.sideOk, [d.quests, d.sideOk]);
  check('兵書《孫子》', !!d.book, d.book); check('裝備齊全', d.gear); check('密室寶物在箱子裡', d.secret); check('頭目有專屬計謀', d.eskills);
  // 流程：村莊入口、洞穴入口
  await page.evaluate(() => { Game.flags.seen_zhongmu = true; Engine.replaceAll(new Scenes.Map('world4', { x: DATA.worldTowns.zhongmu.x, y: DATA.worldTowns.zhongmu.y + 2, dir: 'up' })); });
  await sleep(300); await tap('ArrowUp', 90, 300); await tap('ArrowUp', 90, 1500);
  check('進入中牟村', (await page.evaluate(() => Game.mapId)) === 'zhongmu', await page.evaluate(() => Game.mapId));
  const cw = await page.evaluate(() => { const w = DATA.maps.world4.warps.find(w => w.to === 'cave9'); return { x: w.x, y: w.y }; });
  await page.evaluate(c => { Engine.replaceAll(new Scenes.Map('world4', { x: c.x, y: c.y + 2, dir: 'up' })); }, cw);
  await sleep(300); await tap('ArrowUp', 90, 300); await tap('ArrowUp', 90, 1500);
  check('進入葛陂洞', (await page.evaluate(() => Game.mapId)) === 'cave9', await page.evaluate(() => Game.mapId));
  // 守將與頭目開戰、支線流程
  for (const id of ['gen_cave8', 'gen_cave8_2', 'gen_cave8_3', 'gen_cave9', 'gen_cave9_2', 'gen_cave9_3', 'cave8boss', 'cave9boss']) {
    const mp = await page.evaluate(id => { const k = Object.keys(DATA.maps).find(m => (DATA.maps[m].npcs || []).some(n => n.id === id)); const n = DATA.maps[k].npcs.find(n => n.id === id); return { k, n: { x: n.x, y: n.y } }; }, id);
    await page.evaluate(({ k, n, id }) => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Engine.replaceAll(new Scenes.Map(k, { x: n.x, y: n.y + 1, dir: 'up' })); }, { ...mp, id });
    await sleep(350); await tap('z', 60, 400); await talk(); await sleep(800);
    check(id + ' 開戰', (await top()) === 'BattleScene', await top());
  }
  // 支線：取物 + 領兵書
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); const q = DATA.sideQuests.find(q => q.id === 'q14'); Game.flags.q14_start = true; Game.flags.xd_intro_done = true; Game.flags['chest_' + q.chest.id] = true; Engine.replaceAll(new Scenes.Map('xudu', { x: q.npc.x, y: q.npc.y + 1, dir: 'up' })); });
  await sleep(400); await tap('z', 60, 400); await talk();
  check('q14 交付後得到《孫子》與金', await page.evaluate(() => !!Game.flags.q14_done && !!Game.flags.book_sun));
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
