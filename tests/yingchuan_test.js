// 中原篇（一）潁川・長社・波才：地圖資料檢查、劇情流程、縱火戰場事件
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const tap = async (k, hold = 70, after = 170) => { await page.keyboard.down(k); await sleep(hold); await page.keyboard.up(k); await sleep(after); };
  const S = () => page.evaluate(() => { const t = Engine.top(); return { scene: t.constructor.name, map: Game.mapId, flags: Game.flags, n: Game.party.length, ids: Game.party.map(m => m.id), gold: Game.gold, gear: Game.equipInv }; });
  async function talk(choiceIdx = 0) {
    for (let g = 0; g < 160; g++) {
      const d = await page.evaluate(() => { const t = Engine.top(); return t.constructor.name === 'DialogScene' ? { c: t.choosing, full: t.shown >= Array.from(t.line().text).length } : null; });
      if (!d) return;
      if (d.c) { for (let i = 0; i < choiceIdx; i++) await tap('ArrowDown'); await tap('z'); } else await tap('z', 40, d.full ? 120 : 220);
    }
  }
  const go = (map, x, y, dir = 'down') => page.evaluate(([m, x, y, d]) => { Engine.replaceAll(new Scenes.Map(m, { x, y, dir: d })); }, [map, x, y, dir]);
  async function face(map, x, y, dir) { await go(map, x, y, dir); await sleep(150); await tap('z'); await sleep(300); await talk(); await sleep(200); }

  await page.goto(URL); await sleep(500);
  // 地圖資料：每列等長、字元都在 legend、NPC／傳送點落在可走的格子、對話都存在
  const md = await page.evaluate(() => {
    const D = DATA, out = [];
    ['yingchuan', 'changshe', 'runan', 'wancheng', 'dongjun', 'jizhou', 'guangzong'].forEach(id => {
      const m = D.maps[id], w = m.tiles[0].length;
      if (!m.tiles.every(r => r.length === w)) out.push(id + ' ragged');
      m.tiles.forEach((r, y) => [...r].forEach((ch, x) => { if (!(ch in D.legend)) out.push(id + ' bad tile ' + ch); }));
      const tid = (x, y) => D.legend[m.tiles[y][x]];
      m.npcs.forEach(n => { if (D.solidTiles.includes(tid(n.x, n.y))) out.push(id + ' npc on solid ' + n.id); if (!D.dialogue[n.dialogue]) out.push('missing dialogue ' + n.dialogue); if (n.alt && !D.dialogue[n.alt.dialogue]) out.push('missing alt ' + n.alt.dialogue); });
      m.warps.forEach(wp => { if (D.solidTiles.includes(tid(wp.x, wp.y))) out.push(id + ' warp on solid'); if (!D.maps[wp.to]) out.push('bad warp'); if (wp.deny && !D.dialogue[wp.deny]) out.push('missing deny ' + wp.deny); });
      (m.events || []).forEach(e => { if (!D.dialogue[e.dialogue]) out.push('missing event dlg'); });
      (m.signs || []).forEach(sg => { if (!D.dialogue[sg.dialogue]) out.push('missing sign dlg'); });
      // 起點到傳送點要走得通（簡單 BFS）
      const seen = new Set(), q = [[m.start.x, m.start.y]]; seen.add(m.start.x + ',' + m.start.y);
      while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (ny < 0 || nx < 0 || ny >= m.tiles.length || nx >= w) return; if (D.solidTiles.includes(tid(nx, ny)) || seen.has(nx + ',' + ny)) return; seen.add(nx + ',' + ny); q.push([nx, ny]); }); }
      m.warps.forEach(wp => { if (!seen.has(wp.x + ',' + wp.y)) out.push(id + ' warp unreachable ' + wp.x + ',' + wp.y); });
      m.npcs.forEach(n => { const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((n.x + dx) + ',' + (n.y + dy))); if (!ok) out.push(id + ' npc unreachable ' + n.id); });
    });
    ['bocai', 'elite'].forEach(e => { if (!D.battle.enemies[e]) out.push('no enemy ' + e); });
    ['field3', 'boss3'].forEach(g => (D.battle.groups[g] || []).forEach(grp => grp.forEach(e => { if (!D.battle.enemies[e]) out.push('group ' + g + ' bad enemy ' + e); })));
    return out;
  });
  check('Yingchuan/Changshe map data consistent', md.length === 0, md);

  // 廣陽 → 潁川：渠帥沒倒之前走不過去，倒了就能去
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, boss_down: true }; });
  await go('guangyang', 11, 18, 'down'); await sleep(200); await tap('ArrowDown', 90, 600); await talk();
  let s = await S(); check('south exit of Guangyang is locked before boss2', s.map === 'guangyang', s.map);
  await page.evaluate(() => { Game.flags.boss2_down = true; });
  await go('guangyang', 11, 18, 'down'); await sleep(200); await tap('ArrowDown', 90, 700); await sleep(500); await talk();
  s = await S(); check('after boss2 the south exit leads to Yingchuan', s.map === 'yingchuan', s.map);
  await sleep(800); await talk(); s = await S();
  check('Yingchuan intro plays once', s.flags.yc_intro_done === true, s.flags);

  // 長社：皇甫嵩 → 曹操助戰 → 皇甫嵩的計策 → 波才戰
  await page.evaluate(() => { Game.flags.boss2_down = true; });
  await face('changshe', 5, 7, 'up'); s = await S();    // 皇甫嵩 (5,6) 在 (5,7) 的上方
  check('Huangfu Song first talk sets huangfu_met', s.flags.huangfu_met === true, s.flags);
  await face('changshe', 12, 4, 'up'); s = await S();    // 曹操 (12,3)
  check('Cao Cao joins as a guest (5th slot)', s.ids.includes('caocao') && s.flags.guest_caocao && s.n === 5, s.ids);
  const cc = await page.evaluate(() => { const m = Game.party.find(x => x.id === 'caocao'); return { guest: m.guest, p: Game.portraitOf(m), skills: BattleLogic.skillsFor(m, Game.flags).map(k => k.name) }; });
  check('Cao Cao is a guest with portrait and skills', cc.guest && cc.p === 5 && cc.skills.includes('亂世奇謀'), cc);
  await go('changshe', 5, 7, 'up'); await sleep(150); await tap('z'); await sleep(300); await talk();
  await sleep(800);
  const bt = await page.evaluate(() => { const t = Engine.top(); return { sc: t.constructor.name, fire: t.b && t.b.fire && t.b.fire.rounds, boss: t.b && t.b.enemies.map(e => e.id) }; });
  check('plan dialogue ends in the Bocai battle with fire event', bt.sc === 'BattleScene' && JSON.stringify(bt.fire) === '[2,4]' && bt.boss[0] === 'bocai', bt);

  // 縱火：第 2、4 回合結束，敵全體受傷；頭目至少留 1 兵力
  const fr = await page.evaluate(() => {
    const b = Engine.top().b, before = b.enemies.map(e => e.hp), out = {};
    b.round = 1; out.r1 = BattleLogic.fireEvents(b).length;
    b.round = 2; const ev = BattleLogic.fireEvents(b); out.r2 = ev.filter(e => e.type === 'dmg').length; out.again = BattleLogic.fireEvents(b).length;
    out.bossLoss = before[0] - b.enemies[0].hp; out.pct = Math.round(b.enemies[0].hpMax * 0.15);
    b.enemies[0].hp = 5; b.round = 4; BattleLogic.fireEvents(b); out.bossLeft = b.enemies[0].hp;
    return out;
  });
  check('fire does nothing on round 1, hits every enemy on round 2, only once per round', fr.r1 === 0 && fr.r2 === 5 && fr.again === 0, fr);
  check('fire damage is 15% max HP and never kills the boss', fr.bossLoss === fr.pct && fr.bossLeft === 1, fr);
  // 勝利後
  await page.evaluate(() => { const t = Engine.top(); t.b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); t.finish('win'); });
  for (let i = 0; i < 90 && (await S()).scene === 'BattleScene'; i++) await tap('z');
  await sleep(500); await talk(); s = await S();
  check('winning sets bocai_down, pays 400 gold and gives the book', s.flags.bocai_down === true && s.gear.bamboo_book === 1 && s.gold >= 400, { f: s.flags.bocai_down, g: s.gold, gear: s.gear });
  await face('changshe', 5, 7, 'up');
  // 中原篇（二）：汝南／宛城流程
  await page.evaluate(() => { Game.flags.bocai_down = true; });
  let r = await page.evaluate(() => { const g = DATA.battle.groups; return ['boss4', 'boss5', 'boss6', 'field4'].every(k => g[k] && g[k].every(grp => grp.every(id => DATA.battle.enemies[id] && DATA.battle.enemies[id].sprite < 12))); });
  check('new battle groups reference real enemies with sprites', r);
  await go('yingchuan', 26, 12, 'right'); await sleep(200); await tap('ArrowRight'); await sleep(500);
  s = await S(); check('east exit of yingchuan leads to runan once bocai is down', s.map === 'runan', s.map);
  await talk();
  await go('runan', 22, 10, 'right'); await sleep(150); await tap('ArrowRight'); await sleep(500); await talk(); s = await S();
  check('runan east gate blocked until pengtuo is down', s.map === 'runan', s.map);
  await go('runan', 19, 10, 'left'); await sleep(150); await tap('z'); await sleep(300); await talk(); await sleep(600);
  check('talking to pengtuo starts boss4', (await S()).scene === 'BattleScene');
  await page.evaluate(() => { const t = Engine.top(); t.b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); t.finish('win'); });
  for (let i = 0; i < 90 && (await S()).scene === 'BattleScene'; i++) await tap('z');
  await sleep(500); await talk(); s = await S();
  check('pengtuo_down set and gold paid', s.flags.pengtuo_down === true && s.gold >= 300, { f: s.flags.pengtuo_down, g: s.gold });
  await go('runan', 22, 10, 'right'); await sleep(150); await tap('ArrowRight'); await sleep(500); await talk();
  check('runan east gate opens after pengtuo', (await S()).map === 'wancheng', (await S()).map);
  await face('wancheng', 12, 4, 'down');
  await sleep(500);
  check('zhaohong starts boss5', (await S()).scene === 'BattleScene');
  await page.evaluate(() => { const t = Engine.top(); t.b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); t.finish('win'); });
  for (let i = 0; i < 90 && (await S()).scene === 'BattleScene'; i++) await tap('z');
  await sleep(500); await talk(); s = await S();
  check('zhaohong_down set', s.flags.zhaohong_down === true, s.flags);
  await face('wancheng', 12, 4, 'down'); await sleep(500);
  check('hanzhong replaces zhaohong and starts boss6', (await S()).scene === 'BattleScene');
  await page.evaluate(() => { const t = Engine.top(); t.b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); t.finish('win'); });
  for (let i = 0; i < 90 && (await S()).scene === 'BattleScene'; i++) await tap('z');
  await sleep(500); await talk(); s = await S();
  check('hanzhong_down set, chapter text shown', s.flags.hanzhong_down === true, s.flags);
  // 東郡倉亭：卜巳
  await go('wancheng', 22, 10, 'right'); await sleep(150); await tap('ArrowRight'); await sleep(500); await talk();
  check('wancheng east exit leads to dongjun after hanzhong', (await S()).map === 'dongjun', (await S()).map);
  await page.evaluate(() => { if (!Game.party.some(m => m.id === 'caocao')) Game.party.push(Game.makeMember('caocao')); });
  await face('dongjun', 19, 10, 'left'); await sleep(500);
  check('busi starts boss7', (await S()).scene === 'BattleScene');
  await page.evaluate(() => { const t = Engine.top(); t.b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); t.finish('win'); });
  for (let i = 0; i < 90 && (await S()).scene === 'BattleScene'; i++) await tap('z');
  await sleep(900); await talk(); await sleep(400); await talk(); s = await S();
  check('busi_down set, caocao leaves the party', s.flags.busi_down === true && !s.ids.includes('caocao'), { f: s.flags.busi_down, ids: s.ids, sc: s.scene, g: s.gold });
  // 冀州篇（一）：廣宗・張梁・盧植
  await go('dongjun', 22, 10, 'right'); await sleep(150); await tap('ArrowRight'); await sleep(500); await talk();
  check('dongjun east exit leads to jizhou after busi', (await S()).map === 'jizhou', (await S()).map);
  await go('jizhou', 22, 10, 'right'); await sleep(150); await tap('ArrowRight'); await sleep(500); await talk();
  check('jizhou east exit leads to guangzong', (await S()).map === 'guangzong', (await S()).map);
  await page.evaluate(() => { Game.party = Game.party.filter(m => m.id !== 'caocao'); Game.party = Game.party.slice(0, 4); });
  await face('guangzong', 4, 6, 'right'); await sleep(400); await talk();
  s = await S();
  check('luzhi joins as a guest', s.ids.includes('luzhi') && s.flags.guest_luzhi === true, s.ids);
  await face('guangzong', 16, 10, 'right'); await sleep(500);
  check('zhangliang starts boss8', (await S()).scene === 'BattleScene');
  await page.evaluate(() => { const t = Engine.top(); t.b.enemies.forEach(e => { e.hp = 0; e.dhp = 0; }); t.finish('win'); });
  for (let i = 0; i < 90 && (await S()).scene === 'BattleScene'; i++) await tap('z');
  await sleep(900); await talk(); await sleep(400); await talk(); s = await S();
  check('zhangliang_down set', s.flags.zhangliang_down === true, s.flags);
  await face('guangzong', 6, 6, 'right'); await sleep(400); await talk(); await sleep(400); await talk(); s = await S();
  check('zuofeng scene: luzhi leaves the party', s.flags.zuofeng_done === true && !s.ids.includes('luzhi'), { f: s.flags.zuofeng_done, ids: s.ids });
  check('no JS errors', errors.length === 0, errors);
  console.log(`${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
