// 房子：每扇門都進得去、孫子兵法任務、一次性禮物、付錢購買、洞穴進度對話
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1024, height: 896 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const tap = async (k, h = 70, a = 170) => { await page.keyboard.down(k); await sleep(h); await page.keyboard.up(k); await sleep(a); };
  async function talk(choice = 0) {
    for (let g = 0; g < 80; g++) {
      const d = await page.evaluate(() => { const t = Engine.top(); return t.constructor.name === 'DialogScene' ? { c: t.choosing, full: t.shown >= Array.from(t.line().text).length } : null; });
      if (!d) return;
      if (d.c) { for (let i = 0; i < choice; i++) await tap('ArrowDown'); await tap('z'); } else await tap('z', 40, d.full ? 120 : 220);
    }
  }
  const go = (m, x, y, dir) => page.evaluate(([m, x, y, d]) => Engine.replaceAll(new Scenes.Map(m, { x, y, dir: d })), [m, x, y, dir]);
  const npc = async (map, id, choice = 0) => {   // 站到 NPC 正下方（或旁邊）對話
    const pos = await page.evaluate(([map, id]) => { const n = DATA.maps[map].npcs.find(n => n.id === id); return { x: n.x, y: n.y }; }, [map, id]);
    await go(map, pos.x, pos.y + 1, 'up'); await sleep(200); await tap('z'); await sleep(300); await talk(choice); await sleep(300);
  };
  const G = () => page.evaluate(() => ({ gold: Game.gold, flags: Game.flags, items: Game.items, gear: Game.equipInv, map: Game.mapId }));
  await page.goto(URL); await sleep(500);
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true }; Game.gold = 1000; Game.items = {}; });
  // 房屋門若與舊 warp 重疊，必須由新生成的房屋 warp 優先處理。
  const conflicts = await page.evaluate(() => {
    const bad = [];
    Object.keys(DATA.maps).filter(id => /_h\\d+$/.test(id)).forEach(id => {
      const town = id.replace(/_h\\d+$/, ''), map = DATA.maps[town];
      if (!map) return;
      (map.warps || []).filter(w => w.to === id).forEach(w => {
        const first = map.warps.find(k => k.x === w.x && k.y === w.y);
        if (!first || first.to !== id) bad.push({ house: id, x: w.x, y: w.y, first: first && first.to });
      });
    });
    return bad;
  });
  check('house doors are not shadowed by older warp entries', conflicts.length === 0, conflicts);
  check('chapter 1 Runan map is isolated from chapter 4 Runan houses',
    !(DATA.maps.runan_ch1.warps || []).some(w => /^runan_h\\d+$/.test(w.to)),
    (DATA.maps.runan_ch1.warps || []).filter(w => /^runan_h\\d+$/.test(w.to)).map(w => w.to));
  // 走進門
  await go('changshe', 5, 6, 'up'); await sleep(200); await tap('ArrowUp', 90, 900);
  let g = await G(); check('door of the scholar house really opens', g.map === 'changshe_h0', g.map);
  await tap('ArrowDown', 90, 400); await tap('ArrowDown', 90, 1000); g = await G();
  check('exit door returns to the town in front of the door', g.map === 'changshe', g.map);
  // 孫子兵法任務
  await npc('changshe_h0', 'changshe_h0_n0'); g = await G(); check('scholar starts the quest', g.flags.q_sunzi_ask === true, g.flags);
  await go('wancheng_h0', 8, 2, 'up'); await sleep(200); await tap('z'); await sleep(300); await talk(); g = await G();
  check('chest in the craftsman tent finds the scroll', g.flags.q_sunzi_found === true, g.flags);
  await npc('changshe_h0', 'changshe_h0_n0'); g = await G();
  check('returning gives the scroll once', g.gear.sunzi_scroll === 1 && g.flags.h_sunzi_done === true, g.gear);
  await npc('changshe_h0', 'changshe_h0_n0'); g = await G(); check('talking again does not give another', g.gear.sunzi_scroll === 1, g.gear);
  // 一次性禮物
  await npc('changshe_h1', 'changshe_h1_n0'); await npc('changshe_h1', 'changshe_h1_n0'); g = await G(); check('gift item only once', g.items.tonic === 2, g.items);
  // 付錢買
  await npc('dongjun_h0', 'dongjun_h0_n0', 0); g = await G(); check('buying the blade costs 400 and gives it once', g.gold === 600 && g.gear.smith_blade === 1, { gold: g.gold, gear: g.gear });
  await npc('dongjun_h0', 'dongjun_h0_n0', 0); g = await G(); check('cannot buy twice', g.gold === 600 && g.gear.smith_blade === 1, { gold: g.gold });
  // 洞穴進度對話
  await npc('dongjun_h1', 'dongjun_h1_n0'); g = await G(); check('before the cave is cleared, merchant only gives a hint', g.gold === 600, g.gold);
  await page.evaluate(() => { Game.flags.cave2_down = true; });
  await npc('dongjun_h1', 'dongjun_h1_n0'); g = await G(); check('after cave2_down the merchant rewards 500 gold', g.gold === 1100 && g.flags.h_dj_cave2 === true, g.gold);
  // 猜謎
  await npc('anxi_h3', 'anxi_h3_n0', 1); g = await G(); check('wrong riddle answer gives nothing', !g.gear.wine_gourd, g.gear);
  await npc('anxi_h3', 'anxi_h3_n0', 0); g = await G(); check('right riddle answer gives the gourd', g.gear.wine_gourd === 1, g.gear);
  check('no page errors', errors.length === 0, errors);
  console.log(`\n${pass} passed, ${fail} failed`); await browser.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
