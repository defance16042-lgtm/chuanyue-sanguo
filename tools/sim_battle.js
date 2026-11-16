// 戰鬥平衡模擬：node tools/sim_battle.js [路線 force|wit] [野外戰鬥場數]
const path = require('path');
globalThis.window = globalThis;
require('../data/characters.js'); require('../data/battle.js');
const BL = require('../src/battle_logic.js');
const Game = { items: { herb: 6, tonic: 2, smoke: 0 } }; globalThis.Game = Game;
const D = DATA, B = D.battle;

function mk(id) { const c = D.characters[id]; return { id, name: c.name, allocatable: !!c.allocatable, level: 1, exp: 0, hpMax: c.hp, hp: c.hp, tpMax: c.tp, tp: c.tp, atk: c.atk, int: c.int, def: Math.round(c.hp * 0.08), spd: c.spd, cha: c.cha, points: c.startPoints || 0 }; }
function seeded(s) { return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

function spend(m, route) { // 把點數全加到路線屬性
  while (m.points > 0) { if (route === 'force') m.atk++; else m.int++; m.points--; }
}
function chooseAction(b, u, flags) {
  const foes = BL.alive(b.enemies), mates = BL.alive(b.party);
  const hurtMate = mates.slice().sort((x, y) => x.hp / x.hpMax - y.hp / y.hpMax)[0];
  if (hurtMate.hp / hurtMate.hpMax < 0.35 && Game.items.herb > 0) { Game.items.herb--; return { type: 'item', item: 'herb', target: hurtMate }; }
  const sk = BL.skillsFor(u.ref, flags).filter(s => u.tp >= s.tp);
  const heal = sk.find(s => s.kind === 'heal');
  if (heal && hurtMate.hp / hurtMate.hpMax < 0.6) return { type: 'skill', skill: heal.id, target: hurtMate };
  const atkSk = sk.filter(s => s.kind === 'phys' || s.kind === 'tact').sort((a, c) => c.tp - a.tp)[0];
  const tgt = foes.slice().sort((x, y) => x.hp - y.hp)[0];
  if (atkSk && (foes.length > 1 || tgt.hp > 40)) return { type: 'skill', skill: atkSk.id, target: tgt };
  const buff = sk.find(s => s.kind === 'buff' || s.kind === 'debuff');
  if (buff && b.round === 1) return { type: 'skill', skill: buff.id, target: tgt };
  return { type: 'attack', target: tgt };
}
function fight(party, group, flags, rng, boss) {
  const b = BL.newBattle(party, group, { flags, rng, boss, canFlee: !boss });
  for (let r = 0; r < 60; r++) {
    BL.beginRound(b);
    for (const u of BL.order(b)) {
      if (u.hp <= 0) continue;
      const a = u.side === 'party' ? chooseAction(b, u, flags) : BL.planEnemy(b, u);
      BL.perform(b, u, a);
      if (BL.outcome(b)) break;
    }
    const o = BL.outcome(b); if (o) break;
    BL.endRound(b);
  }
  BL.syncBack(b);
  const o = BL.outcome(b);
  if (o === 'win') { const v = BL.victory(b); b.party.forEach(u => { if (u.hp > 0) BL.gainExp(u.ref, v.share); }); b.rewards = v; }
  return { o: o || 'timeout', b };
}
function heal(party) { party.forEach(m => { m.hp = m.hpMax; m.tp = m.tpMax; }); }

const route = process.argv[2] || 'force', N = process.argv[3] === undefined ? 5 : +process.argv[3], TRIALS = 200;
const stat = { winBoss: 0, lossField: 0, n: 0, avgLv: 0, avgRounds: 0 };
for (let t = 0; t < TRIALS; t++) {
  const rng = seeded(1234 + t);
  const party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(mk);
  // 劉關張入隊時追到 2 級（暫定）
  party.slice(1).forEach(m => BL.gainExp(m, B.expTable[2]));
  party.forEach(m => spend(m, route));
  const flags = { route };
  let dead = false;
  for (let i = 0; i < N && !dead; i++) {
    const groups = B.groups.field1; const g = groups[Math.floor(rng() * groups.length)];
    const r = fight(party, g, flags, rng, false);
    party.forEach(m => spend(m, route));
    if (r.o === 'lose') { stat.lossField++; dead = true; }
    if (i % 3 === 2) heal(party);   // 約每 3 場回旅館休息一次
  }
  if (!dead && N % 3 !== 0) { /* 打 Boss 前先休息 */ } heal(party); Game.items.herb = 6; Game.items.tonic = 2;
  if (dead) continue;
  stat.avgLv += party[0].level;
  const r = fight(party, B.groups.boss[0], flags, rng, true);
  stat.n++; stat.avgRounds += r.b.round; if (r.o === 'win') stat.winBoss++;
}
console.log(`route=${route} fights=${N}: field losses ${stat.lossField}/${TRIALS}; boss win ${stat.winBoss}/${stat.n}; avg nyao Lv ${(stat.avgLv/stat.n).toFixed(1)}; avg boss rounds ${(stat.avgRounds/stat.n).toFixed(1)}`);
