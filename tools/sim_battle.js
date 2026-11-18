// 戰鬥平衡模擬：node tools/sim_battle.js [路線 force|wit] [野外戰鬥場數]
const path = require('path');
globalThis.window = globalThis;
require('../data/characters.js'); require('../data/maps.js'); require('../data/battle.js'); require('../data/equipment.js');
const BL = require('../src/battle_logic.js');

const BLX = BL; require('../src/game.js'); const Game = globalThis.Game; Game.items = { herb: 6, tonic: 2, smoke: 0 };
const D = DATA, B = D.battle;

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
  const heal = sk.find(s => s.kind === 'heal');
  if (heal && hurtMate.hp / hurtMate.hpMax < 0.6) return { type: 'skill', skill: heal.id, target: hurtMate };
  const atkSk = sk.filter(s => s.kind === 'phys' || s.kind === 'tact').sort((a, c) => c.tp - a.tp)[0];
  const tgt = foes.slice().sort((x, y) => x.hp - y.hp)[0];
  if (atkSk && (foes.length > 1 || tgt.hp > 40)) return { type: 'skill', skill: atkSk.id, target: tgt };
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

const route = process.argv[2] || 'force', N = process.argv[3] === undefined ? 5 : +process.argv[3], TRIALS = 200;
const N2 = process.argv[4] === undefined ? 6 : +process.argv[4];
const stat = { win3: 0, n3: 0, lv3: 0, win2: 0, n2: 0, lv2: 0, winBoss: 0, lossField: 0, n: 0, avgLv: 0, avgRounds: 0 };
for (let t = 0; t < TRIALS; t++) {
  const rng = seeded(1234 + t);
  const party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].concat(process.env.GUEST === '0' ? [] : ['zoujing']).map(mk);
  // 劉關張入隊時追到 2 級（暫定）
  party.slice(1).forEach(m => BL.gainExp(m, BL.expFor(2)));
  const flags = { route };
  let dead = false;
  for (let i = 0; i < N && !dead; i++) {
    const groups = B.groups.field1; const g = groups[Math.floor(rng() * groups.length)];
    const r = fight(party, g, flags, rng, false);
      if (r.o === 'lose') { stat.lossField++; dead = true; }
    if (i % 3 === 2) heal(party);   // 約每 3 場回旅館休息一次
  }
  if (!dead && N % 3 !== 0) { /* 打 Boss 前先休息 */ } heal(party); Game.items.herb = 6; Game.items.tonic = 2;
  if (dead) continue;
  stat.avgLv += party[0].level;
  const r = fight(party, B.groups.boss[0], flags, rng, true);
  stat.n++; stat.avgRounds += r.b.round; if (r.o === 'win') stat.winBoss++;
  if (r.o !== 'win') continue;
  // 第二段：廣陽野外 N2 場（field2）再打渠帥
  let dead2 = false;
  heal(party);
  for (let i = 0; i < N2 && !dead2; i++) {
    const groups = B.groups.field2; const g = groups[Math.floor(rng() * groups.length)];
    const rr = fight(party, g, flags, rng, false);
      if (rr.o === 'lose') dead2 = true;
    if (i % 3 === 2) heal(party);
  }
  heal(party); Game.items.herb = 6; Game.items.tonic = 2;
  if (dead2) continue;
  stat.lv2 += party[0].level;
  const r2 = fight(party, B.groups.boss2[0], flags, rng, true);
  stat.n2++; if (r2.o === 'win') stat.win2++;
  if (r2.o !== 'win') continue;
  // 第三段：鄒靖離隊、曹操助戰；潁川野外 N3 場（field3）再打波才（長社火攻：第 2、4 回合結束敵全體受 15%）
  const N3 = process.argv[5] === undefined ? 5 : +process.argv[5];
  const cao = mk('caocao'); BL.gainExp(cao, BL.expFor(party[0].level));
  party.pop(); party.push(cao); heal(party);
  let dead3 = false;
  for (let i = 0; i < N3 && !dead3; i++) {
    const groups = B.groups.field3; const g = groups[Math.floor(rng() * groups.length)];
    const rr = fight(party, g, flags, rng, false);
    if (rr.o === 'lose') dead3 = true;
    if (i % 3 === 2) heal(party);
  }
  heal(party); Game.items.herb = 6; Game.items.tonic = 2;
  if (dead3) continue;
  stat.lv3 += party[0].level;
  const r3 = fight(party, B.groups.boss3[0], flags, rng, true, { rounds: [2, 4], pct: 0.15, texts: [] });
  stat.n3++; if (r3.o === 'win') stat.win3++;
}
console.log(`route=${route} fights=${N}: field losses ${stat.lossField}/${TRIALS}; boss win ${stat.winBoss}/${stat.n}; avg nyao Lv ${(stat.avgLv/stat.n).toFixed(1)}; avg boss rounds ${(stat.avgRounds/stat.n).toFixed(1)}`);
console.log(`stage2 fights=${N2}: boss2 win ${stat.win2}/${stat.n2}; avg nyao Lv ${(stat.lv2/Math.max(1,stat.n2)).toFixed(1)}`);
console.log(`stage3 fights=${process.argv[5] === undefined ? 5 : +process.argv[5]}: boss3 win ${stat.win3}/${stat.n3}; avg nyao Lv ${(stat.lv3/Math.max(1,stat.n3)).toFixed(1)}`);
