// v0.60.0 戰鬥平衡：兵力影響傷害、基本傷害、毒按現有兵力、策反計（反彈）、禁策計、將領加成、經驗曲線
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
    const B = DATA.battle, BL = window.BattleLogic, o = {};
    const mk = (group, rng) => { Game.fresh(); Game.party = ['nyao', 'liubei'].map(Game.makeMember); return BL.newBattle(Game.party, group, { rng: rng || (() => 0.5) }); };
    const g = B.groups.field1[0].slice(0, 2);
    // 兵力越多越痛
    let b = mk(g); let a = b.party[0]; let t = b.enemies[0]; t.hp = t.hpMax = 99999; a.tp = 99;
    const dmg = () => { const h = t.hp; BL.perform(b, a, { type: 'attack', target: t }); const d = h - t.hp; t.hp = h; return d; };
    const full = dmg(); a.hp = Math.round(a.hpMax * 0.2); const low = dmg();
    o.full = full; o.low = low; o.troop = full > low * 1.5 && low >= 1;
    // 基本傷害：防禦極高也有傷
    t.def = 99999; a.hp = a.hpMax; o.floor = dmg() > 5;
    // 毒按目前兵力
    b = mk(g); t = b.enemies[0]; t.hp = 1000; t.hpMax = 5000; t.dot = { pct: 0.1, turns: 2 }; BL.statusEvents(b); o.dot = t.hp;
    // 策反計：反彈
    B.skills.t_fire = { name: '火', tp: 1, kind: 'tact', target: 'one', power: 2 };
    b = mk(g); a = b.party[0]; t = b.enemies[0]; t.reflect = 3; t.reflectPct = 0.6; t.hp = t.hpMax = 99999; a.tp = 9; const hp0 = a.hp;
    BL.perform(b, a, { type: 'skill', skill: 't_fire', target: t }); o.reflectBack = a.hp < hp0 && t.hp < 99999;
    // 禁策計
    b = mk(g); a = b.party[0]; t = b.enemies[0]; a.tp = 9; a.int = 999; t.int = 1; b.rng = () => 0.01;
    BL.perform(b, a, { type: 'skill', skill: 'sx_seal', target: t }); o.sealed = t.sealed > 0;
    const ev = BL.perform(b, t, { type: 'skill', skill: 't_fire', target: a }); o.sealedMsg = ev.some(e => e.text && /禁策/.test(e.text));
    // 將領加成
    const bid = Object.keys(B.enemies).find(k => B.enemies[k].boss), e = B.enemies[bid];
    const bb = mk([bid]); o.bossBoost = bb.enemies[0].hp > e.hp && bb.enemies[0].atk > e.atk;
    // 經驗曲線
    o.exp2 = BL.expNeed(2); o.exp10 = BL.expNeed(10);
    o.skillText = BL.skillText(Object.assign({ id: 'x' }, B.skills.sx_reflect)) + '|' + BL.skillText(Object.assign({ id: 'y' }, B.skills.sx_seal));
    return o;
  });
  check('兵力多寡影響傷害', r.troop, [r.full, r.low]); check('基本傷害', r.floor);
  check('毒按目前兵力(1000→900)', r.dot === 900, r.dot); check('策反計反彈', r.reflectBack);
  check('禁策計', r.sealed && r.sealedMsg); check('將領加成', r.bossBoost); check('經驗升高', r.exp2 >= 30 && r.exp10 >= 300, [r.exp2, r.exp10]);
  check('說明文字', /反彈/.test(r.skillText) && /禁策/.test(r.skillText), r.skillText);
  check('無錯誤', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
