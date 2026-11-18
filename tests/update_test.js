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
  check('update.json version matches package.json', JSON.parse(fs.readFileSync(require('path').resolve(__dirname, '../update.json'), 'utf8')).version === pkg.version);
  check('version.js matches package.json', pkg.version === (fs.readFileSync(require('path').resolve(__dirname, '../src/version.js'), 'utf8').match(/GAME_VERSION = '([^']+)'/) || [])[1], pkg.version);

  const tap = async (page, k) => { await page.keyboard.down(k); await sleep(70); await page.keyboard.up(k); await sleep(200); };

  let r = await run('newer');
  let u = await r.page.evaluate(() => ({ s: Updater.state, l: Updater.latest }));
  check('newer version on GitHub is detected', u.s === 'newer' && u.l === '99.0.0', u);
  await tap(r.page, 'ArrowUp');                    // 從「開始遊戲」往上＝第 3 項「更新」
  await tap(r.page, 'z');
  check('update item opens the in-game update screen', await r.page.evaluate(() => Engine.top().constructor.name) === 'UpdateScene');
  await tap(r.page, 'z');                          // 第一個動作＝下載新版本
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
  await tap(r.page, 'x'); await sleep(200);
  const still = await r.page.evaluate(() => Engine.top().constructor.name);
  check('title screen still works after a failed check', still === 'TitleScene', still);
  await tap(r.page, 'ArrowDown'); await tap(r.page, 'z'); await sleep(600);
  const started = await r.page.evaluate(() => Engine.top().constructor.name);
  check('new game still starts from the title', started === 'DialogScene' || started === 'MapScene', started);
  await r.page.close();

  // 桌面版（模擬 Electron 的更新事件）：下載進度 → 下載完成自動跳出更新畫面 → 按「重新啟動並安裝」
  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 896 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.route('https://raw.githubusercontent.com/**', r => r.abort());
    await page.addInitScript(() => {
      window.__installed = 0; window.__checks = 0;
      window.desktopApp = { onUpdateStatus: cb => { window.__emit = cb; }, installUpdate: () => { window.__installed++; }, checkUpdate: () => { window.__checks++; return Promise.resolve(true); } };
    });
    await page.goto(URL); await sleep(1200);
    await page.evaluate(() => window.__emit({ status: 'downloading', message: '正在下載更新 42%', percent: 42 }));
    await sleep(300);
    let d = await page.evaluate(() => ({ k: Updater.info().kind, p: Updater.info().percent, t: Engine.top().constructor.name }));
    check('desktop: download progress shown, no popup yet', d.k === 'downloading' && d.p === 42 && d.t === 'TitleScene', d);
    await page.evaluate(() => window.__emit({ status: 'downloaded', message: '新版 9.9.9 已下載完成；重新啟動即可安裝。' }));
    await sleep(400);
    d = await page.evaluate(() => ({ k: Updater.info().kind, t: Engine.top().constructor.name }));
    check('desktop: finished download auto-opens the update screen', d.k === 'downloaded' && d.t === 'UpdateScene', d);
    await page.screenshot({ path: require('os').tmpdir() + '/u_desktop.png' });
    await tap(page, 'z');                           // 第一個動作＝重新啟動並安裝
    check('desktop: install button calls installUpdate', await page.evaluate(() => window.__installed) === 1);
    await tap(page, 'ArrowDown'); await tap(page, 'z');
    check('desktop: check button calls checkUpdate', await page.evaluate(() => window.__checks) >= 1);
    check('no JS errors (desktop)', errs.length === 0, errs);
    await page.close();
  }

  console.log(`${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
