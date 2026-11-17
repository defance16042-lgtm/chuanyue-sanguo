// 標題畫面的更新檢查：用假的 GitHub 回應測三種結果，並確認版本號與 package.json 一致
const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const pkg = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, '../package.json'), 'utf8'));
  const browser = await chromium.launch();
  async function run(mode) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 896 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.route('https://raw.githubusercontent.com/**', r => {
      if (mode === 'error') return r.abort();
      const v = mode === 'newer' ? '99.0.0' : pkg.version;
      r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ version: v }) });
    });
    await page.addInitScript(() => { window.__opened = []; window.open = u => { window.__opened.push(u); }; });
    await page.goto(URL); await sleep(1500);
    const st = await page.evaluate(() => ({ title: Engine.top().constructor.name }));
    return { page, errs, st };
  }
  check('version.js matches package.json', pkg.version === (fs.readFileSync(require('path').resolve(__dirname, '../src/version.js'), 'utf8').match(/GAME_VERSION = '([^']+)'/) || [])[1], pkg.version);

  const tap = async (page, k) => { await page.keyboard.down(k); await sleep(70); await page.keyboard.up(k); await sleep(200); };

  let r = await run('newer');
  let u = await r.page.evaluate(() => ({ s: Updater.state, l: Updater.latest }));
  check('newer version on GitHub is detected', u.s === 'newer' && u.l === '99.0.0', u);
  await tap(r.page, 'ArrowUp');                    // 從「開始遊戲」往上＝第 3 項「下載新版本」
  await tap(r.page, 'z');
  const opened = await r.page.evaluate(() => window.__opened);
  check('selecting the update item opens the download page', opened.length === 1 && /archive\/refs\/heads\/main\.zip/.test(opened[0]), opened);
  await r.page.screenshot({ path: require('os').tmpdir() + '/u_newer.png' });
  check('no JS errors (newer)', r.errs.length === 0, r.errs);
  await r.page.close();

  r = await run('same');
  u = await r.page.evaluate(() => ({ s: Updater.state }));
  check('same version is reported as latest', u.s === 'latest', u);
  await r.page.close();

  r = await run('error');
  u = await r.page.evaluate(() => ({ s: Updater.state }));
  check('offline/blocked check ends in error state without crashing', u.s === 'error' && r.errs.length === 0, { u, e: r.errs });
  await tap(r.page, 'ArrowUp'); await tap(r.page, 'z'); await sleep(500);
  const still = await r.page.evaluate(() => Engine.top().constructor.name);
  check('title screen still works after a failed check', still === 'TitleScene', still);
  await tap(r.page, 'ArrowDown'); await tap(r.page, 'z'); await sleep(600);
  const started = await r.page.evaluate(() => Engine.top().constructor.name);
  check('new game still starts from the title', started === 'DialogScene' || started === 'MapScene', started);
  await r.page.close();

  console.log(`${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
