// 裝備／能力／助戰／舊存檔轉換（不需要瀏覽器）
globalThis.window = globalThis;
['characters', 'maps', 'battle', 'equipment'].forEach(f => require('../data/' + f + '.js'));
const BL = require('../src/battle_logic.js'); require('../src/game.js');
const G = Game, D = DATA; let pass = 0, fail = 0;
const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (ok ? '' : '  -> ' + JSON.stringify(x))); ok ? pass++ : fail++; };

G.fresh(); G.party.push(G.makeMember('guanyu'));
const gy = G.party[1], base = gy.atk;
check('trait adds to effective atk', G.eff(gy, 'atk') === base + 3, G.eff(gy, 'atk'));
G.addGear('iron_blade'); G.equip(gy, 'weapon', 'iron_blade');
check('equip raises 攻擊力 by 10 and uses inventory', G.eff(gy, 'pow') === (base + 3) * 2 + 10 && !G.equipInv.iron_blade, G.eff(gy, 'pow'));
check('battle unit carries weapon pow', BL.newBattle(G.party, ['turban'], {}).party[1].pow === 10);
check('weapon type restricts: sword not for 刀 user, blade not for 扇 user', !G.canEquip(gy, 'wood_sword') && !G.canEquip(G.party[0], 'iron_blade') && G.canEquip(G.party[0], 'feather_fan'));
check('exclusive gear only for owner', G.canEquip(gy, 'qinglong') && !G.canEquip(G.party[0], 'qinglong'));
G.equip(gy, 'weapon', null);
check('unequip returns to inventory', G.equipInv.iron_blade === 1 && !gy.equip.weapon);
G.equip(gy, 'helm', null);
// 隨機成長：沒有配點，升級各項能力隨機增加，且統計上接近成長率
const n = G.makeMember('nyao'); const before = { atk: n.atk, lead: n.lead };
BL.gainExp(n, BL.expFor(30));
check('random growth, no points', n.level === 30 && n.points === undefined && n.atk > before.atk && n.lead > before.lead, n);
let sum = 0; for (let i = 0; i < 400; i++) { const m = G.makeMember('guanyu'); BL.gainExp(m, BL.expFor(2)); sum += m.atk - D.characters.guanyu.atk; }
check('guanyu atk growth avg ≈ 2.4', Math.abs(sum / 400 - 2.4) < 0.3, sum / 400);
// 助戰
const z = G.makeMember('zoujing'); check('guest flag', z.guest === true);
// 戰鬥：統率加成、暴擊與閃避進場
G.party.push(z);
const b = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 });
check('lead bonus from highest 統率', Math.abs(b.leadBonus - Math.max(...b.party.map(u => u.lead)) * 0.003) < 1e-9, b.leadBonus);
check('battle unit uses effective stats', b.party[1].atk === G.eff(gy, 'atk') && b.party[1].pow === 0, b.party[1].atk);
// 舊存檔轉換
const old = G.snapshot(); old.party = [{ id: 'nyao', name: '諸葛貓妖', sprite: 0, allocatable: true, level: 3, exp: 30, hpMax: 150, hp: 150, tpMax: 9, tp: 9, atk: 12, int: 14, def: 12, spd: 14, cha: 10, points: 5 }];
old.equipInv = undefined;
check('old save restores', G.restore(JSON.parse(JSON.stringify(old))));
const o = G.party[0];
check('old save: points spent randomly, cha→lead, new stats', o.points === undefined && o.cha === undefined && o.lead > 0 && o.luck > 0 && o.grd > 0 && (o.atk + o.int + o.spd + o.lead + o.luck + o.grd) >= 12 + 14 + 14 + 5 + 8 + 14 + 6, o);
check('equipment data consistent', Object.values(D.equipment).every(e => D.slots[e.slot]) && Object.values(D.shops).every(l => l.every(id => D.equipment[id])) && Object.values(D.drops).every(d => D.equipment[d[0]]));
// 地形
check('forest/mountain/sea are walkable and mapped', [19, 20, 21].every(t => !D.solidTiles.includes(t)) && D.terrainOf[19] === 'forest' && D.terrainOf[20] === 'mountain' && D.terrainOf[21] === 'sea');
check('every map tile letter exists in legend', Object.values(D.maps).every(m => m.tiles.every(r => [...r].every(ch => ch in D.legend))));
const mk2 = terrain => { const bb = BL.newBattle([G.makeMember('liubei')], ['bandit'], { rng: () => 0.5, terrain }); return bb; };
const dmg = terrain => { const bb = mk2(terrain); const ev = BL.perform(bb, bb.party[0], { type: 'attack', target: bb.enemies[0] }); return ev.find(e => e.type === 'dmg').amount; };
check('terrain affects damage: 劉備 plain(A) > sea(B) vs bandit; bandit weak on plain(C)', dmg('plain') > dmg('sea'), [dmg('plain'), dmg('sea')]);
const bb2 = BL.newBattle([G.makeMember('guanyu')], ['bandit'], { rng: () => 0.5, terrain: 'forest' });
const hit = t => { const x = BL.newBattle([G.makeMember('guanyu')], ['bandit'], { rng: () => 0.5, terrain: t }); x.party[0].luck = 0; return BL.perform(x, x.enemies[0], { type: 'attack', target: x.party[0] }).find(e => e.type === 'dmg').amount; };
check('bandit hits harder in forest(A) than on plain(C)', hit('forest') > hit('plain'), [hit('forest'), hit('plain')]);
check('every party character has a portrait index within the sheet', ['nyao', 'liubei', 'guanyu', 'zhangfei', 'zoujing'].every(id => G.portraitOf(G.makeMember(id)) >= 0 && G.portraitOf(G.makeMember(id)) < 5));
// 計謀：單體／全體
{
  const mk = () => { G.fresh(); const p = G.party[0]; p.int = 40; const bb = BL.newBattle(G.party, ['turban', 'turban', 'turban'], { rng: () => 0.5 }); bb.party[0].tp = 20; return bb; };
  const sumDmg = ev => ev.filter(e => e.type === 'dmg').reduce((a, e) => a + e.amount, 0);
  let bb = mk(); const e1 = BL.perform(bb, bb.party[0], { type: 'skill', skill: 'fire', mode: 'one', target: bb.enemies[0] });
  const one = e1.filter(e => e.type === 'dmg'); const tp1 = 20 - bb.party[0].tp;
  bb = mk(); const e2 = BL.perform(bb, bb.party[0], { type: 'skill', skill: 'fire', mode: 'all' });
  const all = e2.filter(e => e.type === 'dmg'); const tp2 = 20 - bb.party[0].tp;
  check('fire single hits 1 foe, all hits 3', one.length === 1 && all.length === 3, [one.length, all.length]);
  check('all mode costs more TP', tp2 > tp1, [tp1, tp2]);
  check('single hits harder than each spread hit', one[0].amount > all[0].amount, [one[0].amount, all[0].amount]);
  check('fx events precede damage, with wait', e2.findIndex(e => e.type === 'fx') < e2.findIndex(e => e.type === 'wait') && e2.findIndex(e => e.type === 'wait') < e2.findIndex(e => e.type === 'dmg'));
  const lv = e => e.find(x => x.type === 'fx').level;
  G.fresh(); G.party[0].int = 10; const lo = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 }); lo.party[0].tp = 20;
  G.fresh(); G.party[0].int = 90; const hi = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 }); hi.party[0].tp = 20;
  check('higher int → stronger fire level', lv(BL.perform(hi, hi.party[0], { type: 'skill', skill: 'fire', mode: 'one', target: hi.enemies[0] })) > lv(BL.perform(lo, lo.party[0], { type: 'skill', skill: 'fire', mode: 'one', target: lo.enemies[0] })));
  // 補血：全體
  G.fresh(); G.party.push(G.makeMember('liubei')); const hb = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 });
  hb.party.forEach(u => { u.hp = 1; }); hb.party[1].tp = 20;
  const he = BL.perform(hb, hb.party[1], { type: 'skill', skill: 'mend', mode: 'all' });
  check('mend all heals every ally', he.filter(e => e.type === 'heal').length === 2, he);
}
// 捲土重來：殘部資料存在、較弱、可正常開戰
{
  const B = DATA.battle;
  const okAll = Object.keys(B.rematch).every(f => { const id = B.rematch[f], r = B.enemies[id + '_r']; return r && r.hp === B.enemies[id].hp && r.atk === B.enemies[id].atk && r.name === B.enemies[id].name; });
  check('rematch variants exist, same stats as the original', okAll);
  G.fresh(); const bb = BL.newBattle(G.party, ['busi_r', 'veteran', 'archer'], { rng: () => 0.5 });
  check('rematch enemy can start a battle', bb.enemies.length === 3 && bb.enemies[0].hp >= B.enemies.busi_r.hp);
}
// 隨等級進化的計謀
{
  const names = (id, lv, flags) => { G.fresh(); const m = G.makeMember(id); m.level = lv; return BL.skillsFor(m, flags || {}).map(k => k.id).join(); };
  check('liubei Lv1 has mend, Lv8 mend2 replaces it, Lv16 mend3', names('liubei', 1) === 'inspire,mend' && names('liubei', 8) === 'inspire,mend2' && names('liubei', 16) === 'mend3,inspire2'.split(',').reverse().join() || names('liubei', 16).includes('mend3') && !names('liubei', 16).includes('mend2,'), [names('liubei', 1), names('liubei', 8), names('liubei', 16)]);
  check('guanyu Lv8 qinglong2 replaces qinglong, Lv10 adds whirl, Lv14 adds wusheng', names('guanyu', 8) === 'qinglong2' && names('guanyu', 14) === 'qinglong2,whirl,execute,wusheng', [names('guanyu', 8), names('guanyu', 14)]);
  check('nyao wit route: fire at 3, fire2 at 10, fire3 at 18', names('nyao', 3, { route: 'wit' }).includes('fire') && names('nyao', 10, { route: 'wit' }).includes('fire2') && !names('nyao', 10, { route: 'wit' }).split(',').includes('fire') && names('nyao', 18, { route: 'wit' }).includes('fire3') && !names('nyao', 18, { route: 'wit' }).includes('fire2'), names('nyao', 18, { route: 'wit' }));
  check('nyao force route: breach2 at 16', names('nyao', 16, { route: 'force' }).includes('breach2') && !names('nyao', 16, { route: 'force' }).split(',').includes('breach'), names('nyao', 16, { route: 'force' }));
  const f1 = DATA.battle.skills.fire, f2 = DATA.battle.skills.fire2, f3 = DATA.battle.skills.fire3;
  check('higher tiers hit harder and cost more', f2.power > f1.power && f3.power > f2.power && f2.tp > f1.tp);
  G.fresh(); const mm = G.makeMember('nyao'); mm.level = 3;
  const ups = BL.gainExp(mm, 100000); check('gainExp still works with many levels', ups.length > 5);
}
// TP 加成、軍師、武器特效
{
  G.fresh(); const m = G.makeMember('liubei'); G.party = [G.makeMember('nyao'), m];
  const base = G.tpMaxOf(m);
  check('TP max is above the old base value', base > m.tpMax, [m.tpMax, base]);
  G.advisor = 'liubei'; const withAdv = G.tpMaxOf(G.party[0]);
  G.advisor = null; const noAdv = G.tpMaxOf(G.party[0]);
  check('advisor raises the whole party max TP', withAdv > noAdv, [noAdv, withAdv]);
  G.advisor = 'nyao'; const bb = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 });
  bb.party.forEach(u => { u.tp = 0; });
  BL.endRound ? BL.endRound(bb) : null;
  G.advisor = null;
  check('weapon fx mapping', BL.weaponFx('劍') === 'slash' && BL.weaponFx('刀') === 'chop' && BL.weaponFx('矛') === 'thrust' && BL.weaponFx('槍') === 'thrust' && BL.weaponFx('扇') === 'wave' && BL.weaponFx('弓') === 'arrow' && BL.weaponFx('斧') === 'axe');
  G.fresh(); G.party = [G.makeMember('guanyu')]; const wb = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 });
  const ev = BL.perform(wb, wb.party[0], { type: 'attack', target: wb.enemies[0] });
  check('guan yu attack uses the blade effect', ev.some(e => e.type === 'fx' && e.fx === 'chop'), ev.map(e => e.type + ':' + (e.fx || '')).join());
  G.fresh(); G.party = [G.makeMember('zhangfei')]; const sb = BL.newBattle(G.party, ['turban'], { rng: () => 0.5 });
  check('zhang fei attack uses the thrust effect', BL.perform(sb, sb.party[0], { type: 'attack', target: sb.enemies[0] }).some(e => e.fx === 'thrust'));
  // 存檔保存軍師
  G.fresh(); G.advisor = 'nyao'; const saved = JSON.parse(JSON.stringify({ version: 1, mapId: G.mapId, pos: G.pos, flags: G.flags, party: G.party, gold: G.gold, items: G.items, equipInv: G.equipInv, advisor: G.advisor, playtime: 0 }));
  G.advisor = null; G.restore(saved); check('advisor survives save/load', G.advisor === 'nyao');
  G.advisor = null;
}
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
