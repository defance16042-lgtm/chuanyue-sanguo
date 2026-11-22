// 戰鬥計謀選單翻頁、畫面依視窗放到最大
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage({ viewport: { width: 1280, height: 800 } });
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  const tap = async k => { await page.keyboard.down(k); await page.waitForTimeout(80); await page.keyboard.up(k); await page.waitForTimeout(250); };
  const sz = await page.evaluate(() => [Engine.canvas.width, Engine.canvas.height]);
  check('screen fills the window height (800)', sz[1] >= 790 && sz[1] <= 800, sz);
  await page.evaluate(() => { Game.fresh(); Game.flags = { intro_done: true, route: 'wit' }; Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.party[0].level = 30; Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 5, y: 5 })); Engine.push(new Scenes.Battle(['turban', 'archer'], { onEnd() {} })); });
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => Engine.top().state) === 'cmd') break; await page.waitForTimeout(250); }
  await page.evaluate(() => { Engine.top().cur = 0; Engine.top().sel = 0; });
  await tap('ArrowDown'); await tap('z');
  const n = await page.evaluate(() => Engine.top().sub.length);
  check('skill list is long (needs paging)', n > 6, n);
  await tap('ArrowRight'); check('right moves to the second column', await page.evaluate(() => Engine.top().subSel) === 3);
  await tap('ArrowRight'); check('right again flips to page 2', await page.evaluate(() => Engine.top().subSel) === 6);
  await tap('ArrowLeft'); check('left flips back to page 1', await page.evaluate(() => Engine.top().subSel) === 0);
  for (let i = 0; i < 7; i++) await tap('ArrowDown');
  check('down past the page end flips pages', await page.evaluate(() => Engine.top().subSel) === 7);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
