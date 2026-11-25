// 音樂：各場景選對曲目、曲子長度對齊、所有音效都能播、沒有錯誤
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await sleep(600);
  await page.keyboard.press('x'); await sleep(300);
  const cur = () => page.evaluate(() => Audio2.current());
  const waitTrack = async (expected, timeout = 4000) => {
    const start = Date.now(); let value;
    while (Date.now() - start < timeout) {
      value = await cur();
      if (value === expected) { await sleep(250); value = await cur(); if (value === expected) return value; }
      await sleep(100);
    }
    return value;
  };
  const L = await page.evaluate(() => Object.keys(Audio2.TRACKS).map(k => [k, Audio2.lengths(k)]));
  L.forEach(([k, l]) => { if (!/victory|defeat/.test(k)) check('track ' + k + ' voices aligned to 128 steps', l.slice(0, -1).every(x => x <= 128) && l[l.length - 1] === 128, l); });
  check('title music on the title screen', (await cur()) === 'title', await cur());
  await page.evaluate(() => { Game.fresh(); Game.flags = { intro_done: true }; Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Engine.replaceAll(new Scenes.Map('zhuoxian', { x: 5, y: 5 })); });
  const villageTrack = await waitTrack('village'); check('village music in town', villageTrack === 'village', villageTrack);
  await page.evaluate(() => Engine.replaceAll(new Scenes.Map('world', { x: 20, y: 20 }))); await sleep(500); check('world music on world map', (await cur()) === 'world', await cur());
  await page.evaluate(() => Engine.replaceAll(new Scenes.Map('cave1', DATA.maps.cave1.start))); await sleep(500); check('cave music in cave', (await cur()) === 'cave', await cur());
  await page.evaluate(() => Engine.push(new Scenes.Battle(['turban', 'turban'], { boss: false, onEnd() {} }))); await sleep(500); check('normal battle music', (await cur()) === 'battle', await cur());
  await page.evaluate(() => { Engine.pop(); Engine.push(new Scenes.Battle(['chengyuanzhi', 'turban'], { boss: true, onEnd() {} })); }); await sleep(500); check('boss battle music', (await cur()) === 'boss', await cur());
  await page.evaluate(() => { Engine.top().result = 'win'; }); await sleep(500); check('victory jingle after win', (await cur()) === 'victory', await cur());
  const state = await page.evaluate(() => Audio2.state && Audio2.state());
  const names = await page.evaluate(() => { const s = new Set(); Object.values(DATA.battle.skills).forEach(k => k.fx && s.add(k.fx)); ['hit', 'blade', 'arrow', 'axe', 'wave'].forEach(x => s.add(x)); s.forEach(n => Audio2.sfx(n)); return s.size; });
  check('every skill effect has a sound', names >= 36, names);
  await sleep(1500);
  await page.keyboard.press('m'); check('M mutes', await page.evaluate(() => Audio2.isMuted()) === true);
  await page.keyboard.press('m'); check('M unmutes', await page.evaluate(() => Audio2.isMuted()) === false);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
