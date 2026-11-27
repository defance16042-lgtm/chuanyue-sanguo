// 第三章「兗州風雲」：地圖連通、城鎮房屋、商店、主線流程與戰鬥、典韋助戰與離隊
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

  // ---- 1. 資料與地圖結構
  const d = await page.evaluate(() => {
    const D = DATA, o = { errs: [] }, solid = new Set(D.solidTiles);
    const towns = ['chenliu', 'dongah', 'puyang', 'xiaopei', 'xuzhou', 'xiapi'];
    o.towns = towns.every(t => D.townIds.includes(t) && D.worldTowns[t] && D.worldTowns[t].world === 'world3');
    o.groups = ['field11', 'field12', 'field13', 'boss18', 'boss19', 'boss20'].every(g => D.battle.groups[g]);
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && walk(m, nx, ny)) { seen.add(k); q.push([nx, ny]); } }); } return seen; };
    // 所有 world3 相關地圖：每個 NPC、寶箱站在走得到的地方；warp 目的地存在
    Object.keys(D.maps).filter(id => id === 'world3' || towns.includes(id) || towns.some(t => id.indexOf(t + '_') === 0)).forEach(id => {
      const m = D.maps[id], r = reach(m, m.start.x, m.start.y);
      (m.npcs || []).forEach(n => { if (!walk(m, n.x, n.y)) o.errs.push(id + ' npc on solid ' + n.id); else if (![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((n.x + a) + ',' + (n.y + b)) || r.has(n.x + ',' + n.y))) o.errs.push(id + ' npc unreachable ' + n.id); });
      (m.objects || []).forEach(c => { if (c.type === 'chest' && ![[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => r.has((c.x + a) + ',' + (c.y + b)))) o.errs.push(id + ' chest unreachable ' + c.id); });
      (m.warps || []).forEach(w => { if (!D.maps[w.to]) o.errs.push(id + ' warp to missing ' + w.to); else { const t = D.maps[w.to]; if (!walk(t, w.tx, w.ty)) o.errs.push(id + ' warp lands on solid ' + w.to + ' ' + w.tx + ',' + w.ty); } });
    });
    // 大地圖：從出生點走得到每座城與回關門
    const w3 = D.maps.world3, r3 = reach(w3, w3.start.x, w3.start.y);
    towns.forEach(t => { const p = D.worldTowns[t]; if (!r3.has(p.x + ',' + (p.y + 1))) o.errs.push('world3 town unreachable ' + t); });
    o.gate = w3.warps.find(w => w.to === 'world2');
    const w2 = D.maps.world2, g2 = w2.warps.find(w => w.to === 'world3');
    o.w2gate = g2 && { need: g2.need };
    // world2：從酸棗走得到新關門前一格
    const r2 = reach(w2, D.worldTowns.suanzao.x, D.worldTowns.suanzao.y + 1);
    o.w2reach = g2 && r2.has(g2.bx + ',' + g2.by);
    // 每間商店有貨、每座城的店家數（武器／防具／雜貨）
    o.shops = towns.map(t => ['weapon', 'armor', 'general'].filter(k => D.shops[t + '_' + k] && D.shops[t + '_' + k].length).length);
    // 主線任務指向的地點存在
    o.quest = D.mainQuest.filter(q => q.world === 'world3').every(q => D.worldTowns[q.to]);
    // 招收館
    o.hall = towns.every(t => D.townHasInn(t));
    // 殘部與可招收將領
    o.recruit = ['zhangkai', 'houcheng', 'songxian', 'gaoshun'].map(i => !!(D.characters[i] && D.characters[i].recruit && D.battle.enemies[i + '_r']));
    o.eskills = ['zhangkai', 'houcheng', 'songxian', 'gaoshun'].every(i => D.battle.enemies[i].eSkills && D.battle.enemies[i].eSkills.length >= 2);
    return o;
  });
  check('六座城都註冊在 world3', d.towns);
  check('場景敵群與頭目群存在', d.groups);
  check('地圖／NPC／寶箱／傳送點全部合法', d.errs.length === 0, d.errs.slice(0, 8));
  check('world3 有回第二章的關門', !!d.gate, d.gate);
  check('world2 南邊的關門需要打完徐榮', d.w2gate && d.w2gate.need === 'xurong_down', d.w2gate);
  check('world2 從酸棗走得到新關門', d.w2reach === true);
  check('每座城的店家（武器／防具／雜貨）齊全', d.shops.every(n => n === 3), d.shops);
  check('第三章主線任務地點都在大地圖上', d.quest);
  check('每座城有招賢官', d.hall);
  check('4 位新將領可招收且有專屬計謀', d.recruit.every(Boolean) && d.eskills, d.recruit);

  // ---- 2. 關門：沒打完徐榮進不去、打完進得去
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, huaxiong_down: true, lubu_down: true }; Engine.replaceAll(new Scenes.Map('world2', { x: 62, y: 56, dir: 'down' })); });
  await sleep(300); await tap('ArrowDown', 90, 800); await talk();
  check('徐榮還沒打倒：關門不開', (await page.evaluate(() => Game.mapId)) === 'world2');
  await page.evaluate(() => { Game.flags.xurong_down = true; Engine.replaceAll(new Scenes.Map('world2', { x: 62, y: 56, dir: 'down' })); });
  await sleep(300); await tap('ArrowDown', 90, 1500);
  check('徐榮倒下之後：進入 world3', (await page.evaluate(() => Game.mapId)) === 'world3', await page.evaluate(() => Game.mapId));

  // ---- 3. 陳留：曹操、典韋助戰
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('chenliu', { x: 11, y: 8, dir: 'up' })); });
  await sleep(500); await talk();
  check('陳留入城劇情已看過', await page.evaluate(() => !!Game.flags.cl_intro_done));
  await tap('z', 60, 400); await talk();
  const cl = await page.evaluate(() => ({ meet: !!Game.flags.cl_meet, party: Game.party.map(m => m.id) }));
  check('跟曹操談完：典韋入隊', cl.meet && cl.party.includes('dianwei'), cl);

  // ---- 4. 徐州：陶謙 → 張闓開戰
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xuzhou', { x: 12, y: 9, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk();
  check('見過陶謙', await page.evaluate(() => !!Game.flags.xz_taoqian));
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xuzhou', { x: 12, y: 15, dir: 'down' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('張闓開戰', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.zhangkai_down = true; Engine.push(new Scenes.Dialog(DATA.dialogue.zhangkai_after)); }); await talk();
  check('張闓戰後：兗州急報（yz_news）', await page.evaluate(() => !!Game.flags.yz_news));

  // ---- 5. 濮陽：侯成、宋憲、火燒濮陽、典韋沒死
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('puyang', { x: 11, y: 9, dir: 'up' })); }); await sleep(500); await talk();
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('puyang', { x: 12, y: 8, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('侯成宋憲開戰', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.houcheng_down = true; Engine.push(new Scenes.Dialog(DATA.dialogue.houcheng_after)); }); await talk();
  const fire = await page.evaluate(() => ({ f: !!Game.flags.puyang_fire, dw: Game.party.some(m => m.id === 'dianwei') }));
  check('濮陽之火：典韋護主且仍在隊中', fire.f && fire.dw, fire);

  // ---- 6. 小沛：轅門射戟
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xiaopei', { x: 11, y: 6, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk();
  check('轅門射戟完成', await page.evaluate(() => !!Game.flags.xp_archery));

  // ---- 7. 下邳：高順 → 典韋離隊
  await page.evaluate(() => { Engine.replaceAll(new Scenes.Map('xiapi', { x: 11, y: 8, dir: 'up' })); }); await sleep(400);
  await tap('z', 60, 400); await talk(); await sleep(900);
  check('高順開戰', (await top()) === 'BattleScene', await top());
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); Game.flags.gaoshun_down = true; Engine.push(new Scenes.Dialog(DATA.dialogue.gaoshun_after)); }); await talk();
  const end = await page.evaluate(() => ({ e: !!Game.flags.ch3_end, party: Game.party.map(m => m.id) }));
  check('第三章結束：典韋離隊', end.e && !end.party.includes('dianwei'), end);
  const qe = await page.evaluate(() => { const fl = Game.flags; return DATA.mainQuest.filter(q => q.world === 'world3').every(q => typeof q.done === 'function' ? q.done(fl) : fl[q.done]); });
  check('第三章主線任務全部完成', qe);

  // ---- 8. 野外遇敵區域對應 field11～13
  const zones = await page.evaluate(() => { const m = DATA.maps.world3; return m.zoneTiers; });
  check('world3 zoneTiers = 11,12,13', JSON.stringify(zones) === '[11,12,13]', zones);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
