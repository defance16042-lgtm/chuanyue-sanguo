// 第五章批次2：三村、兩洞、四支線、兵書《墨子》
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch(), page = await br.newPage({ viewport: { width: 1024, height: 896 } });
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  const tap = async (k, h = 60, a = 300) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); await sleep(a); };
  const top = () => page.evaluate(() => Engine.top().constructor.name);
  async function talk() { for (let g = 0; g < 90; g++) { if ((await top()) !== 'DialogScene') return; await tap('z', 40, 120); } }
  const r = await page.evaluate(() => {
    const D = DATA, o = { errs: [] };
    const vill = ['yanshou', 'bowang', 'hanshui'], caves = ['cave10', 'cave11'];
    const w5 = D.maps.world5, solid = new Set(D.solidTiles);
    const walkable = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    // 大地圖可達
    const seen = new Set([w5.start.x + ',' + w5.start.y]), q = [[w5.start.x, w5.start.y]];
    while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const k = (x + a) + ',' + (y + b); if (!seen.has(k) && walkable(w5, x + a, y + b)) { seen.add(k); q.push([x + a, y + b]); } }); }
    vill.forEach(t => { const p = D.worldTowns[t]; if (!p || !seen.has(p.x + ',' + (p.y + 1))) o.errs.push('village unreachable ' + t); if (!D.townHasInn(t)) o.errs.push('no inn ' + t); if (!w5.warps.find(w => w.to === t)) o.errs.push('no warp ' + t); if (!D.maps[t].npcs.length) o.errs.push('no npcs ' + t); });
    caves.forEach(c => { const w = w5.warps.find(w => w.to === c); if (!w) o.errs.push('no cave warp ' + c); else if (!seen.has(w.x + ',' + (w.y + 1))) o.errs.push('cave unreachable ' + c); [c, c + '_2', c + '_3'].forEach(id => { if (!D.maps[id]) o.errs.push('missing ' + id); }); });
    // 洞穴：守將、頭目在路上，箱子站得到
    caves.forEach(c => ['', '_2', '_3'].forEach((suf, i) => {
      const m = D.maps[c + suf]; if (!m) return;
      if ((m.objects || []).some(x => x.type === 'save')) o.errs.push('save in ' + c + suf);
      const gen = m.npcs.find(n => n.id.startsWith('gen_' + c)); if (!gen) o.errs.push('no gen ' + c + suf);
      if (i === 2 && !m.npcs.some(n => n.id === c + 'boss')) o.errs.push('no boss ' + c);
    }));
    o.bosses = ['zhangwu', 'chensun'].every(id => D.battle.enemies[id] && D.battle.groups[id === 'zhangwu' ? 'cave10boss' : 'cave11boss']);
    o.book = D.battle.bookSkills.mo === 'mo_shou' && D.battle.skills.mo_shou.kind === 'buff';
    // 支線：目的地導航、箱子、道具
    const sq = D.sideQuests.filter(q => /^q(17|18|19|20)$/.test(q.id));
    o.sq = sq.length;
    sq.forEach(q => {
      const g = D.maps[q.giver]; if (!g.npcs.some(n => n.id === q.id + '_giver')) o.errs.push('no giver ' + q.id);
      if (q.kind === 'fetch') { const m = D.maps[q.chest.map]; if (!m.objects.some(x => x.id === q.chest.id)) o.errs.push('no chest ' + q.id); }
      else if (!D.battle.enemies[q.target]) o.errs.push('no target ' + q.id);
    });
    // 不重疊：箱子位置互不相同
    const pos = {}; sq.filter(q => q.kind === 'fetch').forEach(q => { const k = q.chest.map + q.chest.x + ',' + q.chest.y; if (pos[k]) o.errs.push('chest overlap ' + k); pos[k] = 1; });
    // 領獎
    Game.fresh(); Game.party = ['nyao'].map(Game.makeMember);
    const sc = new Scenes.Map('liyangcheng'); sc.say = () => {};
    Game.flags.chest_q_tianfeng = true; Game.flags.q17_start = true;
    o.hasAlt = D.maps.liyangcheng.npcs.find(n => n.id === 'q17_giver').alts.some(a => a.flag === 'chest_q_tianfeng');
    return o;
  });
  check('no errors in data', r.errs.length === 0, r.errs);
  check('bosses defined', r.bosses);
  check('book 墨子 is a buff book', r.book);
  check('4 side quests', r.sq === 4, r.sq);
  check('giver alt chain', r.hasAlt);
  // 流程：進村、進洞、守將與頭目開戰、支線領獎
  await page.evaluate(() => { Game.flags.seen_yanshou = true; Engine.replaceAll(new Scenes.Map('world5', { x: DATA.worldTowns.yanshou.x, y: DATA.worldTowns.yanshou.y + 2, dir: 'up' })); });
  await sleep(300); await tap('ArrowUp', 90, 300); await tap('ArrowUp', 90, 1500);
  check('進入延壽村', (await page.evaluate(() => Game.mapId)) === 'yanshou', await page.evaluate(() => Game.mapId));
  const cw = await page.evaluate(() => { const w = DATA.maps.world5.warps.find(w => w.to === 'cave11'); return { x: w.x, y: w.y }; });
  await page.evaluate(c => { Engine.replaceAll(new Scenes.Map('world5', { x: c.x, y: c.y + 2, dir: 'up' })); }, cw);
  await sleep(300); await tap('ArrowUp', 90, 300); await tap('ArrowUp', 90, 1500);
  check('進入博望山洞', (await page.evaluate(() => Game.mapId)) === 'cave11', await page.evaluate(() => Game.mapId));
  for (const id of ['gen_cave10', 'gen_cave10_2', 'gen_cave10_3', 'gen_cave11', 'gen_cave11_2', 'gen_cave11_3', 'cave10boss', 'cave11boss']) {
    const mp = await page.evaluate(id => { const k = Object.keys(DATA.maps).find(m => (DATA.maps[m].npcs || []).some(n => n.id === id)); const n = DATA.maps[k].npcs.find(n => n.id === id); return { k, n: { x: n.x, y: n.y } }; }, id);
    await page.evaluate(({ k, n }) => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Engine.replaceAll(new Scenes.Map(k, { x: n.x, y: n.y + 1, dir: 'up' })); }, mp);
    await sleep(350); await tap('z', 60, 400); await talk(); await sleep(800);
    check(id + ' 開戰', (await top()) === 'BattleScene', await top());
  }
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); const q = DATA.sideQuests.find(q => q.id === 'q20'); Game.flags.q20_start = true; Game.flags['chest_' + q.chest.id] = true; Engine.replaceAll(new Scenes.Map('xinye', { x: q.npc.x, y: q.npc.y + 1, dir: 'up' })); });
  await sleep(400); await tap('z', 60, 400); await talk();
  check('q20 交付後得到《墨子》與金', await page.evaluate(() => !!Game.flags.q20_done && !!Game.flags.book_mo));
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
