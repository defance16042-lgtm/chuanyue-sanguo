// 洞穴／關隘：物件是實體障礙、開完消失、泉水一次性；存檔只在城鎮驛館
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
    const D = DATA, o = {};
    o.saveLeft = Object.keys(D.maps).filter(k => (D.maps[k].objects || []).some(x => x.type === 'save'));
    const inner = Object.keys(D.maps).filter(k => D.maps[k].cave || D.maps[k].fort);
    o.passOk = ['shankou1', 'shankou1_2', 'shankou4_3', 'guan_w', 'guan_e', 'wg1', 'wuchao'].every(k => inner.includes(k));
    o.inner = inner.length;
    Game.fresh(); Game.party = ['nyao'].map(Game.makeMember);
    const bad = [];
    inner.forEach(k => {
      const sc = new Scenes.Map(k); sc.map.objects.forEach(ob => {
        if (['chest', 'urn', 'tablet', 'spring', 'lever'].includes(ob.type) && !sc.blocked(ob.x, ob.y)) bad.push(k + ':' + ob.type);
      });
    });
    o.bad = bad;
    // 泉水一次性
    const sk = inner.find(k => D.maps[k].objects.some(x => x.type === 'spring'));
    if (sk) {
      const sp = D.maps[sk].objects.find(x => x.type === 'spring'), sc = new Scenes.Map(sk);
      Game.party[0].hp = 1; sc.p = { x: sp.x, y: sp.y + 1, dir: 'up' }; sc.say = () => {};
      sc.interact(); o.healed = Game.party[0].hp === Game.party[0].hpMax; o.gone = !sc.objAt(sp.x, sp.y); o.walkable = !sc.blocked(sp.x, sp.y);
    } else o.healed = o.gone = o.walkable = 'nospring';
    // 陶罐與寶箱開完消失
    const ck = inner.find(k => D.maps[k].objects.some(x => x.type === 'chest'));
    const ch = D.maps[ck].objects.find(x => x.type === 'chest'), sc2 = new Scenes.Map(ck);
    sc2.say = () => {}; sc2.openChest(ch); o.chestGone = !sc2.objAt(ch.x, ch.y) && !sc2.blocked(ch.x, ch.y) || sc2.blocked(ch.x, ch.y) === !!sc2.npcAt(ch.x, ch.y);
    // 每座城鎮都有驛館，驛館有存檔與招收
    o.noInn = Object.keys(D.worldTowns).filter(t => !D.townHasInn(t));
    const inn = D.dialogue.inn_chenliu_inn[0].choices.map(c => c.label).join('|');
    o.innChoices = inn; o.hasSave = /存檔/.test(inn) && /招收/.test(inn);
    o.noOfficer = !Object.keys(D.maps).some(k => (D.maps[k].npcs || []).some(n => n.id === 'hall_officer'));
    o.noRow = Object.keys(D.characters).filter(k => typeof D.battleRow[k] !== 'number');
    return o;
  });
  check('no save crystals', r.saveLeft.length === 0, r.saveLeft);
  check('山口與關口也算洞穴型地圖', r.passOk);
  check('objects solid', r.bad.length === 0, r.bad.slice(0, 5));
  check('spring heals once and vanishes', r.healed === true && r.gone === true, [r.healed, r.gone, r.walkable]);
  check('chest vanishes', r.chestGone === true);
  check('every town has inn', r.noInn.length === 0, r.noInn);
  check('inn has save + hall', r.hasSave, r.innChoices);
  check('no hall officer', r.noOfficer);
  check('every character has a battle sprite row with weapon', r.noRow.length === 0, r.noRow);
  check('no errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
