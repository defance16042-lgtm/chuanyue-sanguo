// 陣形與新計謀機制（在頁面內直接呼叫 BattleLogic）
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const BL = window.BattleLogic || BL, out = {};
    const mk = ids => ids.map(Game.makeMember);
    Game.fresh();
    const party = mk(['nyao', 'liubei', 'guanyu', 'zhangfei', 'zhugeliang']); Game.advisor = 'zhugeliang';
    party.forEach(m => { m.level = 50; });
    const lo = mk(['nyao', 'liubei']); lo[0].level = 4;
    out.u1 = BL.formationUsable('yulin', lo); out.u2 = BL.formationUsable('fangyuan', lo);
    out.bagua = BL.formationUsable('bagua', party); out.baguaNo = BL.formationUsable('bagua', party.slice(0, 4)); Game.advisor = 'nyao'; out.baguaCat = BL.formationUsable('bagua', party); Game.advisor = null; out.baguaNoAdv = BL.formationUsable('bagua', party); Game.advisor = 'zhugeliang';
    const lo2 = mk(['zhugeliang']); lo2[0].level = 20; out.baguaLow = BL.formationUsable('bagua', lo2);
    const seq = () => { let i = 0; return () => ((i++ * 0.37) % 1); };
    const newB = fm => { const b = BL.newBattle(party, ['turban', 'turban', 'elite', 'captain'], { rng: seq() }); if (fm) BL.applyFormation(b, fm); return b; };
    const b0 = newB(), b1 = newB('bagua');
    out.atk0 = BL.eff(b0.party[0], 'atk'); out.atk1 = BL.eff(b1.party[0], 'atk');
    out.foe0 = BL.eff(b0.enemies[0], 'atk'); out.foe1 = BL.eff(b1.enemies[0], 'atk');
    b1.round = 1; out.first = BL.order(b1).slice(0, 4).every(u => u.side === 'party');
    b1.party[1].hp = 10; const h = BL.beginRound(b1); out.healN = h.length; // round becomes 2 -> heals
    // 毒
    const b = newB(); const a = b.party[0], t = b.enemies[0]; a.tp = 99;
    t.hp = t.hpMax = 1000; t.boss = false;
    BL.perform(b, a, { type: 'skill', skill: 'poison' });
    out.dotSet = !!t.dot; const ev = BL.statusEvents(b); out.dotDmg = 1000 - t.hp;
    // 養息
    a.hp = 1; a.hot = { pct: 0.1, turns: 3 }; const ev2 = BL.statusEvents(b); out.hot = a.hp > 1;
    // 震懾
    t.stun = 0; b.rng = () => 0.01; BL.perform(b, a, { type: 'skill', skill: 'stun', target: t }); out.stun = t.stun > 0;
    out.stunBlocks = BL.perform(b, t, { type: 'attack', target: a }).some(e => /震暈/.test(e.text || ''));
    // 清心
    t.confused = 2; t.dot = { pct: .1, turns: 3 }; a.stun = 2; b.party[1].tp = 99; BL.perform(b, b.party[1], { type: 'skill', skill: 'cleanse', target: a }); out.cleanse = a.stun === 0; a.stun = 0;
    // 叫陣
    BL.perform(b, a, { type: 'skill', skill: 'taunt' }); out.taunt = a.taunt > 0;
    // 斬將：低血量傷害較高
    const dmgAt = frac => { const bb = newB(), x = bb.party[0], y = bb.enemies[0]; y.hpMax = y.hp = 100000; y.hp = Math.round(100000 * frac); x.tp = 99; const h0 = y.hp; bb.rng = () => 0.5; BL.perform(bb, x, { type: 'skill', skill: 'execute', target: y }); return h0 - y.hp; };
    out.exeHi = dmgAt(1); out.exeLo = dmgAt(0.1);
    // 飲血
    const bl = newB(), la = bl.party[0], lt = bl.enemies[0]; la.hp = 1; la.tp = 99; lt.hp = lt.hpMax = 100000; bl.rng = () => 0.5; BL.perform(bl, la, { type: 'skill', skill: 'leech', target: lt }); out.leech = la.hp > 1;
    // 水淹
    const bf = newB(), fa = bf.party[0]; fa.tp = 99; BL.perform(bf, fa, { type: 'skill', skill: 'flood' }); out.flood = bf.enemies.some(e => e.hp > 0 && e.buffs.spd);
    return out;
  });
  console.log(JSON.stringify(r));
  check('yulin usable at Lv4 (needs 3)', r.u1 === true);
  check('fangyuan locked at Lv4', r.u2 === false);
  check('bagua usable with zhugeliang advisor Lv50', r.bagua === true);
  check('bagua needs zhugeliang in party', r.baguaNo === false);
  check('bagua not for nyao advisor', r.baguaCat === false);
  check('bagua needs zhugeliang as advisor', r.baguaNoAdv === false);
  check('bagua locked at Lv20', r.baguaLow === false);
  check('bagua boosts atk', r.atk1 > r.atk0 * 1.2, [r.atk0, r.atk1]);
  check('bagua weakens foe', r.foe1 < r.foe0, [r.foe0, r.foe1]);
  check('bagua first strike', r.first === true);
  check('bagua heals', r.healN >= 1, r.healN);
  check('poison sets dot', r.dotSet === true);
  check('poison deals damage', r.dotDmg > 0, r.dotDmg);
  check('regen heals', r.hot === true);
  check('stun applies', r.stun === true);
  check('stun blocks action', r.stunBlocks === true);
  check('cleanse removes stun', r.cleanse === true);
  check('taunt sets flag', r.taunt === true);
  check('execute stronger on weak', r.exeLo > r.exeHi * 1.5, [r.exeHi, r.exeLo]);
  check('leech heals attacker', r.leech === true);
  check('flood slows enemies', r.flood === true);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
