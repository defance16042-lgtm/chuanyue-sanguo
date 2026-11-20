// 第一章（涿縣篇、幽州篇）劇情流程測試：用真按鍵讀對話，用程式傳送節省走路時間
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const tap = async (k, hold = 70, after = 170) => { await page.keyboard.down(k); await sleep(hold); await page.keyboard.up(k); await sleep(after); };
  const S = () => page.evaluate(() => { const t = Engine.top(); return { scene: t.constructor.name, map: Game.mapId, pos: Game.pos, flags: Game.flags, n: Game.party.length, lv: Game.party[0].level }; });
  async function talk(choiceIdx = 0) {
    for (let g = 0; g < 120; g++) {
      const d = await page.evaluate(() => { const t = Engine.top(); return t.constructor.name === 'DialogScene' ? { c: t.choosing, full: t.shown >= Array.from(t.line().text).length } : null; });
      if (!d) return;
      if (d.c) { for (let i = 0; i < choiceIdx; i++) await tap('ArrowDown'); await tap('z'); }
      else await tap('z', 40, d.full ? 120 : 220);
    }
  }
  const go = (map, x, y, dir = 'down') => page.evaluate(([m, x, y, d]) => { Engine.replaceAll(new Scenes.Map(m, { x, y, dir: d })); }, [map, x, y, dir]);
  // 站到 (x,y) 面向 dir，按 Z 與前方的人／物互動並把對話讀完
  async function face(map, x, y, dir) { await go(map, x, y, dir); await sleep(150); await tap('z'); await sleep(300); await talk(); await sleep(200); }

  await page.goto(URL); await sleep(500);
  await tap('Enter'); await sleep(500);
  let s = await S();
  check('intro dialogue opens by itself', s.scene === 'DialogScene');
  await talk(); await sleep(300); s = await S();
  check('intro done flag + back on map', s.flags.intro_done && s.scene === 'MapScene', s.flags);

  // 告示牌 (14,10)：站在 (14,9) 面向下
  await face('zhuoxian', 14, 9, 'down'); s = await S();
  check('reading the notice board sets notice_read', s.flags.notice_read === true);

  // 順序限制：沒聽過市集消息時劉備不會招募
  await face('zhuoxian', 17, 9, 'right'); s = await S();
  check('Liu Bei will not join before the merchant talk', s.n === 1 && !s.flags.recruited_liubei, { n: s.n });
  await face('zhuoxian', 6, 13, 'left'); s = await S();   // 張世平 (5,13) 在 (6,13) 的左邊
  check('talking to Zhang Shiping sets heard_merchant', s.flags.heard_merchant === true, s.flags);
  await face('zhuoxian', 17, 9, 'right'); s = await S();
  check('Liu Bei joins after the merchant talk', s.n === 2 && s.flags.recruited_liubei, { n: s.n });

  // 關羽要在張飛之後；張飛要在劉備之後
  await face('zhuoxian', 5, 15, 'right'); s = await S();
  check('Guan Yu will not join before Zhang Fei', s.n === 2, { n: s.n });
  await face('zhuoxian', 5, 19, 'right'); s = await S();
  check('Zhang Fei joins after Liu Bei', s.n === 3 && s.flags.recruited_zhangfei, { n: s.n });
  await face('zhuoxian', 5, 15, 'right'); s = await S();
  check('Guan Yu joins after Zhang Fei', s.n === 4 && s.flags.recruited_guanyu, { n: s.n });

  // 出城限制：還沒結拜／選路線，城門過不去
  await go('zhuoxian', 15, 24, 'down'); await sleep(150);
  await tap('ArrowDown', 90, 600); await talk(); await sleep(300); s = await S();
  check('south gate refuses to open before the oath', s.map === 'zhuoxian' && s.pos.y <= 24, s.pos);

  // 酒肆：進門自動觸發桃園結義，最後選擇路線（選第二個＝智力）
  await go('inn', 5, 6, 'up'); await sleep(400);
  s = await S(); check('oath scene starts on entering the inn', s.scene === 'DialogScene');
  await talk(1); await sleep(300); s = await S();
  check('oath_done set, route chosen (wit)', s.flags.oath_done === true && s.flags.route === 'wit' && s.scene === 'MapScene', s.flags);
  await go('zhuoxian', 15, 24, 'down'); await sleep(150);
  await tap('ArrowDown', 90, 900); s = await S();
  check('after the oath the south gate opens (onto the world map)', s.map === 'world', s.map);

  // 野外：鄒靖給任務；沒打倒程遠志前不能往南
  await face('field', 12, 2, 'right'); s = await S();
  check('Zou Jing sets camp_ok', s.flags.camp_ok === true, s.flags);
  await go('field', 11, 18, 'down'); await sleep(150);
  await tap('ArrowDown', 90, 900); s = await S();
  check('field south exit leads out to the world map', s.map === 'world', s.map);
  const gp = await page.evaluate(() => DATA.worldTowns.guangyang);
  await go('world', gp.x, gp.y + 1, 'up'); await sleep(150);
  await tap('ArrowUp', 90, 900); await talk(); s = await S();
  check('Guangyang gate stays shut until Cheng Yuanzhi is beaten', s.map === 'world', s.map);

  // 程遠志倒下之後，大地圖上廣陽的城門就開了
  await page.evaluate(() => { Game.flags.boss_down = true; });
  await go('world', gp.x, gp.y + 1, 'up'); await sleep(150);
  await tap('ArrowUp', 90, 900); s = await S();
  check('after the boss the way to Guangyang is open', s.map === 'guangyang', s.map);

  // 廣陽頭目：對話後進入戰鬥，勝利後旗標與結尾對話
  await page.evaluate(() => { Game.party.forEach(m => { m.atk = 300; m.hp = m.hpMax = 9999; }); });
  await go('guangyang', 11, 16, 'down'); await sleep(150);
  await tap('z'); await sleep(400); await talk(); await sleep(600);
  s = await S(); check('talking to the Guangyang chieftain starts a battle', s.scene === 'BattleScene', s.scene);
  for (let i = 0; i < 400; i++) {
    const t = await page.evaluate(() => { const b = Engine.top(); return { sc: b.constructor.name, st: b.state }; });
    if (t.sc !== 'BattleScene') break;
    if (t.st === 'cmd') { await tap('z'); await tap('z'); } else await tap('z', 40, 90);
  }
  await sleep(400); await talk(); await sleep(300); s = await S();
  check('boss2_down set and chapter-part ending shown', s.flags.boss2_down === true && s.scene === 'MapScene', s.flags);

  // 經驗表：沒有上限，每級需要的經驗越來越多
  const ex = await page.evaluate(() => { const a = []; for (let n = 2; n <= 60; n++) a.push(BattleLogic.expFor(n) - BattleLogic.expFor(n - 1)); return a; });
  check('exp needed per level keeps growing (Lv2..60)', ex.every((v, i) => i === 0 || v > ex[i - 1]), ex.slice(0, 6));
  const lv = await page.evaluate(() => { const m = Game.party[0]; BattleLogic.gainExp(m, BattleLogic.expFor(25)); return m.level; });
  check('no level cap (reaches Lv25)', lv >= 25, lv);

  check('no JS errors', errors.length === 0, errors);
  console.log(`${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
