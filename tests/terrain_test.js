// 專屬地形、血條顏色、海岸水軍遇敵
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 1024, height: 896 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await sleep(500);
  const d = await page.evaluate(() => {
    const D = DATA, bad = [];
    Object.keys(D.characters).forEach(k => { const c = D.characters[k]; if (!c.home || !D.terrainNames[c.home] || c.terrain[c.home] !== 'S') bad.push('char ' + k); });
    Object.keys(D.battle.enemies).forEach(k => { const e = D.battle.enemies[k]; if (!e.home || !D.terrainNames[e.home] || !['S', 'A'].includes(e.terrain[e.home])) bad.push('enemy ' + k + ' ' + e.home); });
    return { bad, colors: D.terrainColors, names: D.terrainNames, homes: ['wuhuan', 'shuijun', 'bandit', 'archer', 'turban'].map(k => D.battle.enemies[k].home) };
  });
  check('every character and enemy has a valid home terrain', d.bad.length === 0, d.bad);
  check('five terrains with five bar colours', Object.keys(d.colors).length === 5 && new Set(Object.values(d.colors)).size === 5 && Object.keys(d.names).length === 5, d.names);
  check('homes: desert/sea/mountain/forest/plain', d.homes.join() === 'desert,sea,mountain,forest,plain', d.homes);
  // 海岸沙灘遇敵
  await page.evaluate(() => { Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.flags = { intro_done: true, seen_zhuoxian: true }; Engine.replaceAll(new Scenes.Map('world', { x: 85, y: 33, dir: 'down' })); });
  await sleep(400);
  const r = await page.evaluate(() => {
    const m = Engine.top(); const t = m.terrainHere(); m.steps = 99;
    const oldR = Math.random; Math.random = () => 0.01;   // 必定遇敵
    m.stepEncounter(); Math.random = oldR;
    const top = Engine.top(); return { terr: t, scene: top.constructor.name, bt: top.b && top.b.terrain, names: top.b && top.b.enemies.map(e => e.name) };
  });
  check('beach counts as desert', r.terr === 'desert', r.terr);
  check('beach encounter is navy fought at sea', r.scene === 'BattleScene' && r.bt === 'sea' && r.names.some(n => /水|白波|管亥|郭太/.test(n)), r);
  await sleep(1400); await page.screenshot({ path: '/tmp/coast_battle.png' });
  await page.evaluate(() => { while (Engine.top().constructor.name !== 'MapScene') Engine.pop(); });
  // 內陸不會遇到水軍
  const inl = await page.evaluate(() => {
    Engine.replaceAll(new Scenes.Map('world', { x: 38, y: 13, dir: 'down' }));
    const m = Engine.top(); m.steps = 99; const oldR = Math.random; Math.random = () => 0.01; m.stepEncounter(); Math.random = oldR;
    const t = Engine.top(); return { bt: t.b && t.b.terrain, names: t.b && t.b.enemies.map(e => e.name) };
  });
  check('inland encounter is not navy', inl.bt === 'plain' && !inl.names.some(n => /水|白波/.test(n)), inl);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close();
})();
