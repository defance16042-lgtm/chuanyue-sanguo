// 洛陽廢墟：曹操以助戰身分在隊伍裡時，曹操 NPC 會被藏起來；徐榮仍必須出現，主線不能卡住
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const vis = (flags, ids) => { Game.fresh(); Game.flags = Object.assign({ intro_done: true }, flags); Game.party = ids.map(Game.makeMember); const c = Game.party.find(m => m.id === 'caocao'); if (c) c.guest = true; Engine.replaceAll(new Scenes.Map('luoyang')); const t = Engine.top(); const o = {}; DATA.maps.luoyang.npcs.forEach(n => o[n.id] = t.visible(n)); return o; };
    return { withCao: vis({}, ['nyao', 'liubei', 'guanyu', 'caocao']), noCao: vis({}, ['nyao', 'liubei', 'guanyu']), noCaoTalked: vis({ ly_caocao_go: true }, ['nyao', 'liubei']), done: vis({ xurong_down: true }, ['nyao', 'liubei']) };
  });
  check('曹操（助戰）在隊 → 曹操NPC隱藏、徐榮出現', r.withCao.lycaocao === false && r.withCao.xurong === true, r.withCao);
  check('曹操不在隊、沒談過 → 曹操在、徐榮不在', r.noCao.lycaocao === true && r.noCao.xurong === false, r.noCao);
  check('談過曹操 → 徐榮出現', r.noCaoTalked.xurong === true);
  check('打倒徐榮後 → 兩者都消失', r.done.xurong === false && r.done.lycaocao === false);
  check('無錯誤', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
