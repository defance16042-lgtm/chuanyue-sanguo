// 戰鬥平衡模擬：node tools/sim_battle.js [路線 force|wit] [野外戰鬥場數]
const path = require('path');
globalThis.window = globalThis;
require('fs').readFileSync(require('path').resolve(__dirname, '../index.html'), 'utf8').match(/data\/[a-z0-9_]+\.js/g).forEach(f => require('../' + f));
const BL = require('../src/battle_logic.js');

const BLX = BL; require('../src/game.js'); const Game = globalThis.Game; Game.items = { herb: 6, tonic: 2, smoke: 0 };
const D = DATA, B = D.battle; const TUNE = JSON.parse(process.env.TUNE || '{}'); Object.keys(TUNE).forEach(k => Object.assign(B.enemies[k], TUNE[k]));

function mk(id) { return Game.makeMember(id); }
function seeded(s) { return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

function spend(m, route) { // 把點數全加到路線屬性
  while (m.points > 0) { if (route === 'force') m.atk++; else m.int++; m.points--; }
}
function chooseAction(b, u, flags) {
  const foes = BL.alive(b.enemies), mates = BL.alive(b.party);
  const hurtMate = mates.slice().sort((x, y) => x.hp / x.hpMax - y.hp / y.hpMax)[0];
  if (hurtMate.hp / hurtMate.hpMax < 0.35 && Game.items.herb > 0) { Game.items.herb--; return { type: 'item', item: 'herb', target: hurtMate }; }
  const sk = BL.skillsFor(u.ref, flags).filter(s => u.tp >= s.tp);
  const mode = foes.length >= 3 ? 'all' : 'one';
  const cost = s => (s.choice && mode === 'all' && s.allTp) ? s.allTp : s.tp;
  const heal = sk.find(s => s.kind === 'heal');
  if (heal && hurtMate.hp / hurtMate.hpMax < 0.6) return { type: 'skill', skill: heal.id, target: hurtMate };
  const atkSk = sk.filter(s => (s.kind === 'phys' || s.kind === 'tact') && u.tp >= cost(s)).sort((a, c) => cost(c) - cost(a))[0];
  const tgt = foes.slice().sort((x, y) => x.hp - y.hp)[0];
  if (atkSk && (foes.length > 1 || tgt.hp > 40)) return { type: 'skill', skill: atkSk.id, target: tgt, mode: atkSk.choice ? mode : undefined };
  const buff = sk.find(s => s.kind === 'buff' || s.kind === 'debuff');
  if (buff && b.round === 1) return { type: 'skill', skill: buff.id, target: tgt };
  return { type: 'attack', target: tgt };
}
function fight(party, group, flags, rng, boss, fire) {
  const b = BL.newBattle(party, group, { flags, rng, boss, canFlee: !boss, fire });
  for (let r = 0; r < 60; r++) {
    BL.beginRound(b);
    for (const u of BL.order(b)) {
      if (u.hp <= 0) continue;
      const a = u.side === 'party' ? chooseAction(b, u, flags) : BL.planEnemy(b, u);
      BL.perform(b, u, a);
      if (BL.outcome(b)) break;
    }
    const o = BL.outcome(b); if (o) break;
    BL.fireEvents(b);
    if (BL.outcome(b)) break;
    BL.endRound(b);
  }
  BL.syncBack(b);
  const o = BL.outcome(b);
  if (o === 'win') { const v = BL.victory(b); b.party.forEach(u => { if (u.hp > 0) BL.gainExp(u.ref, v.share); }); b.rewards = v; }
  return { o: o || 'timeout', b };
}
function heal(party) { party.forEach(m => { m.hp = m.hpMax; m.tp = m.tpMax; }); }


// 第二、三章 Boss 平衡：node tools/sim_ch3.js [等級] [路線 force|wit] [敵群,敵群...]
const L = +(process.argv[2] || 45), route = process.argv[3] || 'force', TRIALS = 100;
const T = ['boss15','boss16','boss17','boss18','boss19','boss20','field11','field12','field13'];
const keys = process.argv[4] ? process.argv[4].split(',') : T;
keys.forEach(k => {
  const grp = B.groups[k]; if (!grp) { console.log(k + ' (none)'); return; }
  let win = 0, rounds = 0, hpLeft = 0;
  for (let t = 0; t < TRIALS; t++) {
    const rng = seeded(777 + t);
    const party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(mk);
    party.forEach(m => BL.gainExp(m, BL.expFor(L)));
    Game.items = { herb: 6, tonic: 2, smoke: 0 };
    const g1 = grp.length > 1 ? grp[Math.floor(rng() * grp.length)] : grp[0];
    const isBoss = !/^coast/.test(k);
    const r = fight(party, g1, { route }, rng, isBoss);
    rounds += r.b.round; if (r.o === 'win') { win++; hpLeft += party.reduce((a, m) => a + m.hp / m.hpMax, 0) / party.length; }
  }
  console.log(k.padEnd(10), 'Lv' + L, 'win', win + '/' + TRIALS, 'avg rounds', (rounds / TRIALS).toFixed(1), 'avg hp left', win ? (hpLeft / win * 100).toFixed(0) + '%' : '-');
});
