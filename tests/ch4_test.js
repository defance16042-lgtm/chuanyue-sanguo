// 第四章「許都風雲」批次1：地圖連通、城鎮房屋、商店、主線流程與戰鬥
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
    const towns = ['xudu', 'runan', 'guandu', 'yanjin', 'baima', 'ye'];
    o.towns = towns.every(t => D.townIds.includes(t) && D.worldTowns[t] && D.worldTowns[t].world === 'world4');
    o.groups = ['field14', 'field15', 'field16', 'boss21', 'boss22', 'boss23'].every(g => D.battle.groups[g]);
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && walk(m, nx, ny)) { seen.add(k); q.push([nx, ny]); } }); } return seen; };
    Object.keys(D.maps).filter(id => id === 'world4' || towns.includes(id) || towns.some(t => id.indexOf(t + '_') === 0)).forEach(id => {
      const m = D.maps[id], r = reach(m, m.start.x, m.start.y);
      (m.npcs || []).forEach(n => { if (!walk(m, n.x, n.y)) o.errs.push(id + ' npc on solid ' + n.id); else if (![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((n.x + a) + ',' + (n.y + b)) || r.has(n.x + ',' + n.y))) o.errs.push(id + ' npc unreachable ' + n.id); });
      (m.objects || []).forEach(c => { if (c.type === 'chest' && ![[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((c.x + a) + ',' + (c.y + b)))) o.errs.push(id + ' chest unreachable ' + c.id); });
      (m.warps || []).forEach(w => { if (!D.maps[w.to]) o.errs.push(id + ' warp to missing ' + w.to); else if (!walk(D.maps[w.to], w.tx, w.ty)) o.errs.push(id + ' warp lands on solid ' + w.to + ' ' + w.tx + ',' + w.ty); });
      (m.npcs || []).forEach(n => { [n.dialogue].concat((n.alts || []).map(a => a.dialogue)).forEach(k => { if (!D.dialogue[k]) o.errs.push(id + ' missing dialogue ' + k); }); });
    });
    const w4 = D.maps.world4, r4 = reach(w4, w4.start.x, w4.start.y);
    towns.forEach(t => { const p = D.worldTowns[t]; if (!r4.has(p.x + ',' + (p.y + 1))) o.errs.push('world4 town unreachable ' + t); });
    o.gate = w4.warps.find(w => w.to === 'world3');
    const w3 = D.maps.world3, g3 = w3.warps.find(w => w.to === 'world4');
    o.w3gate = g3 && { need: g3.need };
    const r3 = reach(w3, w3.start.x, w3.start.y); o.w3reach = g3 && r3.has(g3.bx + ',' + g3.by);
    o.shops = towns.map(t => ['weapon', 'armor', 'general'].filter(k => D.shops[t + '_' + k] && D.shops[t + '_' + k].length).length);
    o.quest = D.mainQuest.filter(q => q.world === 'world4').every(q => D.worldTowns[q.to]);
    o.hall = towns.every(t => D.maps[t].npcs.some(n => n.id === 'hall_officer'));
    o.recruit = ['chezhou', 'yanliang', 'wenchou'].map(i => !!(D.characters[i] && D.characters[i].recruit && D.battle.enemies[i + '_r']));
    o.eskills = ['chezhou', 'yanliang', 'wenchou'].every(i => D.battle.enemies[i].eSkills && D.battle.enemies[i].eSkills.length >= 2);
    o.gear = ['xu_sword', 'scale_armor', 'chezhou_lance', 'yanliang_blade', 'wenchou_spear', 'yuan_armor', 'jade_seal_charm'].every(g => D.equipment[g]);
    o.shopGear = [].concat(...towns.map(t => ['weapon', 'armor'].map(k => D.shops[t + '_' + k] || []))).every(l => l.every(g => D.equipment[g]));
    o.portraits = ['xunyu', 'dongcheng', 'chezhou', 'yanliang', 'wenchou', 'yuanshao'].every(i => typeof D.artPortraits.ids[i] === 'number') && ['荀彧', '董承', '車冑', '顏良', '文丑', '袁紹'].every(n => typeof D.npcPortraits[n] === 'number');
    return o;
  });
  check('六座城都註冊在 world4', d.towns);
  check('場景敵群與頭目群存在', d.groups);
  check('地圖／NPC／寶箱／傳送點／對話全部合法', d.errs.length === 0, d.errs.slice(0, 8));
  check('world4 有回第三章的關門', !!d.gate, d.gate);
  check('world3 東邊的關門需要 ch3_end 且走得到', d.w3gate && d.w3gate.need === 'ch3_end' && d.w3reach === true, d.w3gate);
  check('每座城店家齊全', d.shops.every(n => n === 3), d.shops);
  check('主線任務地點都在大地圖上', d.quest);
  check('每座城有招賢官', d.hall);
  check('3 位新將領可招收且有專屬計謀', d.recruit.every(Boolean) && d.eskills, d.recruit);
  check('新裝備存在、商店貨品都有定義', d.gear && d.shopGear);
  check('6 位新人物有頭像', d.portraits);

  // 關門
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, xurong_down: true, gaoshun_down: true }; Engine.replaceAll(new Scenes.Map('world3', { x: 77, y: 13, dir: 'right' })); });
  await sleep(300); await tap('ArrowRight', 90, 800); await talk();
  check('ch3_end 之前：關門不開', (await page.evaluate(() => Game.mapId)) === 'world3');
  await page.evaluate(() => { Game.flags.ch3_end = true; Engine.replaceAll(new Scenes.Map('world3', { x: 77, y: 13, dir: 'right' })); });
  await sleep(300); await tap('ArrowRight', 90, 1500);
  check('ch3_end 之後：進入 world4', (await page.evaluate(() => Game.mapId)) === 'world4', await page.evaluate(() => Game.mapId));

  // 許都：入城、煮酒論英雄、衣帶詔
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xudu', { x: 11, y: 9, dir: 'up' })); });
  await sleep(500); await talk();
  check('許都入城劇情', await page.evaluate(() => !!Game.flags.xd_intro_done));
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xudu', { x: 11, y: 8, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk();
  check('煮酒論英雄完成', await page.evaluate(() => !!Game.flags.xd_wine && Game.gold >= 1500));
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xudu', { x: 13, y: 11, dir: 'right' })); }); await sleep(400);
  await tap('z', 60, 400); await talk();
  check('衣帶詔', await page.evaluate(() => !!Game.flags.xd_belt && (Game.equipInv || {}).jade_seal_charm > 0), await page.evaluate(() => Game.equipInv));

  // 汝南：車冑
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('runan', { x: 12, y: 9, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('車冑開戰', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.chezhou_down = true; Engine.push(new Scenes.Dialog(DATA.dialogue.chezhou_after)); }); await talk();
  check('車冑戰後：叛曹', await page.evaluate(() => !!Game.flags.ch4_rebel));

  await page.evaluate(() => { Game.flags.xd_chitu = true; });

  // 白馬：顏良
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('baima', { x: 12, y: 15, dir: 'down' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('顏良開戰', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.yanliang_down = true; Engine.push(new Scenes.Dialog(DATA.dialogue.yanliang_after)); }); await talk();

  // 延津：文丑
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('yanjin', { x: 12, y: 15, dir: 'down' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('文丑開戰', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.wenchou_down = true; Engine.push(new Scenes.Dialog(DATA.dialogue.wenchou_after)); }); await talk();

  // 官渡辭曹
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('guandu', { x: 11, y: 9, dir: 'up' })); }); await sleep(500); await talk();
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('guandu', { x: 11, y: 7, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk();
  check('官渡：辭曹', await page.evaluate(() => !!Game.flags.ch4_guan_leave));
  // 鄴城重逢
  await page.evaluate(() => { Game.flags.wg5_down = true; Engine.replaceAll(new Scenes.Map('ye', { x: 11, y: 9, dir: 'up' })); }); await sleep(500); await talk();
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('ye', { x: 11, y: 8, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk();
  check('鄴城重逢', await page.evaluate(() => !!Game.flags.ye_meet && !!Game.flags.ch4_end));
  const qe = await page.evaluate(() => { const fl = Game.flags; fl.xd_chitu = fl.wg5_down = true; return DATA.mainQuest.filter(q => q.world === 'world4').every(q => typeof q.done === 'function' ? q.done(fl) : fl[q.done]); });
  check('第四章主線任務全部完成', qe);
  const zones = await page.evaluate(() => DATA.maps.world4.zoneTiers);
  check('world4 zoneTiers = 14,15,16', JSON.stringify(zones) === '[14,15,16]', zones);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
