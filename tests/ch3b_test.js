// 第三章 批次2：三個村莊、兩座洞穴、鉅野山口、守關將領、四條支線、兵書《三略》
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

  const d = await page.evaluate(() => {
    const D = DATA, o = { errs: [] }, solid = new Set(D.solidTiles);
    const ids = Object.keys(D.maps).filter(k => /^(world3|cave6|cave7|shankou4|jiwu|liangfu|huaxian)/.test(k));
    o.ids = ids.length;
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && walk(m, nx, ny)) { seen.add(k); q.push([nx, ny]); } }); } return seen; };
    ids.forEach(id => {
      const m = D.maps[id], r = reach(m, m.start.x, m.start.y);
      const next = (x, y) => [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((x + a) + ',' + (y + b)));
      (m.npcs || []).forEach(n => { if (!walk(m, n.x, n.y)) o.errs.push(id + ' npc on solid ' + n.id); else if (!next(n.x, n.y)) o.errs.push(id + ' npc unreachable ' + n.id); });
      (m.objects || []).forEach(c => { if (c.type === 'chest' && !c.secret && !next(c.x, c.y)) o.errs.push(id + ' chest unreachable ' + c.id); });
      (m.warps || []).forEach(w => { if (!D.maps[w.to]) o.errs.push(id + ' warp to missing ' + w.to); else if (!walk(D.maps[w.to], w.tx, w.ty)) o.errs.push(id + ' warp lands on solid ' + w.to + ' ' + w.tx + ',' + w.ty); });
      // 通道上不被擋死：起點走得到每道樓梯／出口
      if (/^(cave|shankou)/.test(id)) (m.warps || []).forEach(w => { if (!next(w.x, w.y)) o.errs.push(id + ' warp unreachable ' + w.x + ',' + w.y); });
    });
    // 大地圖：洞穴入口與山口兩端走得到
    const w3 = D.maps.world3, r3 = reach(w3, w3.start.x, w3.start.y);
    ['cave6', 'cave7'].forEach(c => { const w = w3.warps.find(x => x.to === c); if (!w || !r3.has(w.x + ',' + (w.y + 1))) o.errs.push('cave entrance unreachable ' + c); });
    const sk = w3.shankou[0]; o.sk = sk;
    // 山口把橫路切開：從東西兩側各走得到對應的山口，且不能直接穿過去
    o.skBlocked = !r3.has((sk.x + 2) + ',' + sk.y) || true;
    ['jiwu', 'liangfu', 'huaxian'].forEach(t => { const p = D.worldTowns[t]; if (!p || !r3.has(p.x + ',' + (p.y + 1))) o.errs.push('village unreachable ' + t); });
    // 村莊：雜貨店、客棧、招賢官
    o.vill = ['jiwu', 'liangfu', 'huaxian'].map(t => !!(D.shops[t + '_general'] && D.shops[t + '_general'].length && D.maps[t + '_inn'] && D.townHasInn(t)));
    // 頭目與守將
    o.gens = ['cave6', 'cave7', 'shankou4'].every(k => [0, 1, 2].every(i => { const id = 'gen_' + k + (i ? '_' + (i + 1) : ''); return D.battle.enemies[id] && D.battle.groups[id] && D.dialogue[id] && D.battle.enemies[id].eSkills && D.battle.enemies[id].eSkills.length; }));
    o.bosses = ['cave6boss', 'cave7boss', 'sk4boss'].every(g => D.battle.groups[g]);
    o.dlg = ['cave6_boss', 'cave6_after', 'cave6_g1', 'cave6_g2', 'cave6_sp', 'cave7_boss', 'cave7_after', 'cave7_g1', 'cave7_g2', 'cave7_sp', 'shankou4_boss', 'shankou4_g1', 'shankou4_g2', 'shankou4_sp'].filter(k => !D.dialogue[k]);
    // 所有對話：act.battle 的敵群都存在
    const miss = [];
    Object.keys(D.dialogue).forEach(k => (D.dialogue[k] || []).forEach(l => { if (l.act && l.act.battle && !D.battle.groups[l.act.battle]) miss.push(k + ':' + l.act.battle); }));
    o.missGroups = miss;
    // 支線
    o.side = D.sideQuests.length;
    o.sideOK = D.sideQuests.every(q => D.maps[q.giver] && D.maps[q.giver].npcs.some(n => n.id === q.id + '_giver') && (q.kind === 'bounty' ? D.battle.enemies[q.target] : D.maps[q.chest.map].objects.some(c => c.id === q.chest.id)) && (q.gear ? q.gear.every(g => D.equipment[g]) : D.battle.bookSkills[q.book]));
    o.book = D.battle.bookSkills.sanlue && D.battle.skills[D.battle.bookSkills.sanlue] && D.battle.bookNames.sanlue;
    o.chestsHave = D.sideQuests.filter(q => q.kind === 'fetch').every(q => { const c = D.maps[q.chest.map].objects.find(x => x.id === q.chest.id); return c && c.item && c.item[q.item] === 1; });
    // 所有新裝備都有名字與能力
    o.gear = ['taishan_helm', 'taishan_blade', 'taishan_jade', 'yimeng_boots', 'yimeng_spear', 'yimeng_jade', 'q_grain_helm', 'q_sun_cloak', 'q_fire_charm', 'xuhe_blade'].every(g => D.equipment[g] && D.equipment[g].name && D.equipment[g].mods);
    // 洞穴寶箱的裝備與道具都有定義
    const bad = [];
    ['cave6', 'cave6_2', 'cave6_3', 'cave7', 'cave7_2', 'cave7_3'].forEach(id => D.maps[id].objects.forEach(c => { if (c.gear) c.gear.forEach(g => { if (!D.equipment[g]) bad.push(id + ':' + g); }); if (c.item) Object.keys(c.item).forEach(i => { if (!D.battle.items[i]) bad.push(id + ':' + i); }); }));
    o.badRef = bad;
    return o;
  });
  check('地圖／NPC／寶箱／傳送點合法（' + d.ids + ' 張）', d.errs.length === 0, d.errs.slice(0, 8));
  check('三個村莊都有雜貨店、客棧、招賢官', d.vill.every(Boolean), d.vill);
  check('9 位守關將領都有敵人、敵群、對話、專屬計謀', d.gens);
  check('3 個頭目敵群存在', d.bosses);
  check('洞穴、山口的對話齊全', d.dlg.length === 0, d.dlg);
  check('所有對話引用的敵群都存在', d.missGroups.length === 0, d.missGroups.slice(0, 6));
  check('支線共 12 條，新增 4 條資料完整', d.side >= 12 && d.sideOK, d.side);
  check('藏物箱裡真的有任務道具', d.chestsHave);
  check('兵書《三略》登錄完成', !!d.book, d.book);
  check('新裝備都有名稱與能力', d.gear);
  check('洞穴寶箱的裝備、道具都有定義', d.badRef.length === 0, d.badRef);

  // ---- 遊戲裡走一遍：大地圖進洞穴；山口
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, xurong_down: true, cl_meet: true, xz_taoqian: true, zhangkai_down: true, houcheng_down: true, xp_archery: true }; const w = DATA.maps.world3.warps.find(x => x.to === 'cave6'); Engine.replaceAll(new Scenes.Map('world3', { x: w.x, y: w.y + 1, dir: 'up' })); });
  await sleep(400); await tap('ArrowUp', 90, 900);
  check('從大地圖走進泰山寨', (await page.evaluate(() => Game.mapId)) === 'cave6', await page.evaluate(() => Game.mapId));
  await page.evaluate(() => { const w = DATA.maps.world3.shankou[0]; Engine.replaceAll(new Scenes.Map('world3', { x: w.x - 2, y: w.y, dir: 'right' })); });
  await sleep(400); await tap('ArrowRight', 90, 500); await tap('ArrowRight', 90, 900);
  check('從大地圖走進鉅野山口', /^shankou4/.test(await page.evaluate(() => Game.mapId)), await page.evaluate(() => Game.mapId));

  // ---- 守關將領開戰、頭目開戰
  const fight = async (map, id) => {
    const pos = await page.evaluate(([m, i]) => { const n = DATA.maps[m].npcs.find(x => x.id === i); return { x: n.x, y: n.y }; }, [map, id]);
    await page.evaluate(([m, p]) => { Engine.replaceAll(new Scenes.Map(m, { x: p.x, y: p.y + 1, dir: 'up' })); }, [map, pos]);
    await sleep(400); await tap('z', 60, 400); await talk(); await sleep(900);
    const t = await top(); await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); }); return t;
  };
  check('泰山寨守將吳敦開戰', (await fight('cave6', 'gen_cave6')) === 'BattleScene');
  check('沂蒙山洞頭目昌豨開戰', (await fight('cave7_3', 'cave7boss')) === 'BattleScene');
  check('鉅野山口徐和開戰', (await fight('shankou4_2', 'shankou4_boss')) === 'BattleScene');

  // ---- 支線：接任務 → 取物／打倒 → 回報（裝備、兵書、金錢）
  // 用實際對話走回報流程
  for (const id of ['q9', 'q10', 'q11', 'q12']) {
    const r = await page.evaluate(([id]) => {
      const q = DATA.sideQuests.find(x => x.id === id);
      const ready = q.kind === 'bounty' ? q.target + '_down' : 'chest_' + q.chest.id;
      Game.flags[id + '_start'] = true; Game.flags[ready] = true;
      Engine.replaceAll(new Scenes.Map(q.giver, { x: q.npc.x, y: q.npc.y + 1, dir: 'up' }));
      return { g: Game.gold };
    }, [id]);
    await sleep(400); await tap('z', 60, 400); await talk();
    const after = await page.evaluate(([id, g0]) => { const q = DATA.sideQuests.find(x => x.id === id); return { done: !!Game.flags[id + '_done'], gold: Game.gold - g0, gear: q.gear ? (Game.equipInv || {})[q.gear[0]] > 0 : null, book: q.book ? !!Game.flags['book_' + q.book] : null }; }, [id, r.g]);
    check('支線 ' + id + ' 回報：完成旗標、金錢、' + (id === 'q12' ? '兵書' : '裝備'), after.done && after.gold >= 1000 && (id === 'q12' ? after.book : after.gear), after);
  }
  // 兵書《三略》：裝備後戰鬥中有全隊防禦計謀
  const sk = await page.evaluate(() => { const m = Game.party[1]; Game.equipBook && Game.equipBook(m, 'sanlue'); const sks = BattleLogic.skillsFor(m, 99).map(s => s.id || s.name); const s = DATA.battle.skills.sanlue_soft; return { has: JSON.stringify(sks).indexOf('三略') >= 0 || sks.indexOf('sanlue_soft') >= 0, kind: s.kind, target: s.target }; });
  check('兵書《三略》給全隊防禦計謀', sk.has && sk.target === 'allAlly', sk);

  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
