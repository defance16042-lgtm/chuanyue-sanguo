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
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
