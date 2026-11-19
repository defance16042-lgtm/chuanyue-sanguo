// 隊伍編成：排列順序、指定軍師（用真的按鍵操作）。
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (name, ok, extra) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 672 } });
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await sleep(500);
  const tap = async k => { await page.keyboard.down(k); await sleep(80); await page.keyboard.up(k); await sleep(190); };
  const S = () => page.evaluate(() => ({ scene: Engine.top().constructor.name, order: Game.party.map(m => m.id).join(), adv: Game.advisor }));
  await page.evaluate(() => { Game.fresh(); Game.flags = { intro_done: true }; Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 5, y: 5 })); });
  await sleep(300);
  await tap('Escape'); check('menu opens', (await S()).scene === 'MenuScene');
  await tap('ArrowDown'); await tap('z'); check('menu -> formation', (await S()).scene === 'FormationScene');
  // 選劉備(第2個) → 移動順序 → 往上一格 → 確定
  await tap('ArrowDown'); await tap('z'); await tap('z'); await tap('ArrowUp'); await tap('z');
  check('move liubei to the top', (await S()).order === 'liubei,nyao,guanyu,zhangfei', (await S()).order);
  // 選第1個(劉備) → 任命軍師
  await page.evaluate(() => { Engine.top().sel = 0; });
  await tap('z'); await tap('ArrowDown'); await tap('z');
  check('liubei becomes advisor', (await S()).adv === 'liubei', (await S()).adv);
  const bonus = await page.evaluate(() => Game.tpBonusFromAdvisor());
  check('advisor gives TP bonus', bonus > 0, bonus);
  await tap('z'); await tap('ArrowDown'); await tap('z');
  check('advisor can be dismissed', (await S()).adv === null);
  await tap('Escape'); check('back to menu', (await S()).scene === 'MenuScene');
  check('no page errors', errors.length === 0, errors);
  console.log(`${pass} passed, ${fail} failed`); await browser.close(); process.exit(fail ? 1 : 0);
})();
