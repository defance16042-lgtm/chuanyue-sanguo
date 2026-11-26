// 第五章批次1：世界地圖5、五座城、烏巢、頭目、許攸／張郃助戰、曹仁與審配招收、主線流程
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
  async function talk() { for (let g = 0; g < 120; g++) { if ((await top()) !== 'DialogScene') return; await tap('z', 40, 120); } }
  const d = await page.evaluate(() => {
    const D = DATA, o = { errs: [] }, solid = new Set(D.solidTiles);
    const towns = ['yangwu', 'liyangcheng', 'cangting', 'xinye', 'xiangyang'];
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && walk(m, nx, ny)) { seen.add(k); q.push([nx, ny]); } }); } return seen; };
    const ids = Object.keys(D.maps).filter(id => towns.some(v => id === v || id.indexOf(v + '_') === 0) || id === 'wuchao');
    ids.forEach(id => {
      const m = D.maps[id], r = reach(m, m.start.x, m.start.y), near = (x, y) => [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((x + a) + ',' + (y + b)));
      (m.npcs || []).forEach(n => { if (!walk(m, n.x, n.y)) o.errs.push(id + ' npc solid ' + n.id); else if (!near(n.x, n.y)) o.errs.push(id + ' npc unreachable ' + n.id); [n.dialogue].concat((n.alts || []).map(a => a.dialogue)).forEach(k => { if (!D.dialogue[k]) o.errs.push(id + ' missing dlg ' + k); }); });
      (m.objects || []).forEach(c => { if (c.type === 'chest' && !near(c.x, c.y)) o.errs.push(id + ' chest unreachable ' + c.id); });
      (m.warps || []).forEach(w => { if (!D.maps[w.to]) o.errs.push(id + ' warp missing ' + w.to); else if (!walk(D.maps[w.to], w.tx, w.ty)) o.errs.push(id + ' warp lands solid ' + w.to + w.tx + ',' + w.ty); });
    });
    const w5 = D.maps.world5, r5 = reach(w5, w5.start.x, w5.start.y);
    towns.forEach(t => { const p = D.worldTowns[t]; if (!p || !r5.has(p.x + ',' + (p.y + 1))) o.errs.push('town unreachable ' + t); if (!D.maps[t].npcs.some(n => n.id === 'hall_officer')) o.errs.push('no hall ' + t); });
    const wu = w5.warps.find(w => w.to === 'wuchao'); if (!wu || !r5.has(wu.x + ',' + (wu.y + 1))) o.errs.push('wuchao entrance unreachable');
    const g4 = D.maps.world4.warps.find(w => w.to === 'world5'); const w4 = D.maps.world4, r4 = reach(w4, w4.start.x, w4.start.y);
    if (!g4 || !r4.has((g4.x - 1) + ',' + g4.y)) o.errs.push('world4 gate unreachable');
    if (!w5.warps.find(w => w.to === 'world4')) o.errs.push('no back gate');
    // 主線任務旗標鏈的 NPC 與旗標一致
    ['boss24', 'boss25', 'boss26', 'boss27', 'boss28', 'yw_patrol', 'wc_g1', 'wc_g2', 'field17', 'field18'].forEach(g => { if (!D.battle.groups[g]) o.errs.push('group ' + g); else D.battle.groups[g].forEach(row => row.forEach(e => { if (!D.battle.enemies[e]) o.errs.push('enemy ' + e); })); });
    ['caoren', 'shenpei'].forEach(c => { const ch = D.characters[c]; if (!ch || !ch.recruit) o.errs.push('recruit ' + c); if (!D.battle.enemies[c + '_r']) o.errs.push('rem ' + c); if (!D.battle.charSkills[c] || D.battle.charSkills[c].length < 7) o.errs.push('skills ' + c); if (!D.battle.advisorSkills[c]) o.errs.push('adv ' + c); });
    ['xuyou', 'zhanghe'].forEach(c => { const ch = D.characters[c]; if (!ch || !ch.guest) o.errs.push('guest ' + c); if (!D.battle.charSkills[c]) o.errs.push('gskills ' + c); });
    o.gear = ['yb_sword', 'cao_armor', 'xiang_helm', 'jing_boots', 'yb_jade', 'caoren_spear', 'wuchao_blade', 'shenpei_fan', 'yuanshang_sword', 'caimao_helm'].every(g => D.equipment[g]);
    o.shops = towns.every(t => D.shops[t + '_general'] && D.shops[t + '_general'].length);
    o.quest = D.mainQuest.filter(q => q.world === 'world5').length >= 6;
    o.tiles = new Set(w5.tiles.join('')).size;
    return o;
  });
  check('世界地圖5／城鎮／烏巢／傳送／NPC／寶箱／敵人／招收／助戰驗證', d.errs.length === 0, d.errs);
  check('裝備、商店、任務資料', d.gear && d.shops && d.quest, [d.gear, d.shops, d.quest]);
  // 流程：進入關門
  await page.evaluate(() => { Game.flags.ch5_xun = true; const g = DATA.maps.world4.warps.find(w => w.to === 'world5'); Engine.replaceAll(new Scenes.Map('world4', { x: g.x - 1, y: g.y, dir: 'right' })); });
  await sleep(300); await tap('ArrowRight', 90, 1500);
  check('由世界地圖4進入第五章世界地圖', (await page.evaluate(() => Game.mapId)) === 'world5', await page.evaluate(() => Game.mapId));
  // 每位頭目開戰
  for (const [map, id, fl] of [['runan', 'rn_caoren', 'ch5_start'], ['wuchao', 'wcboss', ''], ['liyangcheng', 'ly_shenpei', 'zhanghe_join'], ['cangting', 'ct_yuanshang', 'shenpei_down'], ['xiangyang', 'xg_caimao', 'yuanshang_down'], ['yangwu', 'yw_captain', 'ch5_xun']]) {
    const n = await page.evaluate(({ map, id, fl }) => { if (fl) Game.flags[fl] = true; const n = DATA.maps[map].npcs.find(n => n.id === id); return { x: n.x, y: n.y }; }, { map, id, fl });
    await page.evaluate(({ map, n }) => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.wc_intro_done = true; Engine.replaceAll(new Scenes.Map(map, { x: n.x, y: n.y + 1, dir: 'up' })); }, { map, n });
    await sleep(400); await tap('z', 60, 400); await talk(); await sleep(900);
    check(id + ' 開戰', (await top()) === 'BattleScene', await top());
  }
  // 助戰：許攸、張郃加入與離隊
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.yw_scout_down = true; const n = DATA.maps.yangwu.npcs.find(n => n.id === 'yw_xuyou'); Engine.replaceAll(new Scenes.Map('yangwu', { x: n.x, y: n.y + 1, dir: 'up' })); });
  await sleep(400); await tap('z', 60, 400); await talk();
  check('許攸加入', await page.evaluate(() => !!Game.flags.xuyou_join && Game.party.some(m => m.id === 'xuyou')));
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); delete Game.flags.zhanghe_join; Game.flags.chunyuqiong_down = true; Game.flags.wc_intro_done = true; const n = DATA.maps.wuchao.npcs.find(n => n.id === 'wc_zhanghe'); Engine.replaceAll(new Scenes.Map('wuchao', { x: n.x, y: n.y + 1, dir: 'up' })); });
  await sleep(400); await tap('z', 60, 400); await talk();
  check('張郃加入', await page.evaluate(() => !!Game.flags.zhanghe_join && Game.party.some(m => m.id === 'zhanghe')));
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.caimao_down = true; const n = DATA.maps.xiangyang.npcs.find(n => n.id === 'xg_liubiao'); Engine.replaceAll(new Scenes.Map('xiangyang', { x: n.x, y: n.y + 1, dir: 'up' })); });
  await sleep(400); await tap('z', 60, 400); await talk();
  check('章末客串離隊', await page.evaluate(() => !!Game.flags.ch5_liubiao && !Game.party.some(m => m.id === 'xuyou' || m.id === 'zhanghe')));
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); const n = DATA.maps.xinye.npcs.find(n => n.id === 'xy_child'); Engine.replaceAll(new Scenes.Map('xinye', { x: n.x, y: n.y + 1, dir: 'up' })); });
  await sleep(400); await tap('z', 60, 400); await talk();
  check('章末旗標 ch5_end', await page.evaluate(() => !!Game.flags.ch5_end));
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
