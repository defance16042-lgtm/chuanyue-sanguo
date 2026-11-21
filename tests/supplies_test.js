// 藥品、復活、新計謀、軍師專屬計謀（不開瀏覽器，直接測戰鬥邏輯）
globalThis.window = globalThis;
['characters', 'maps', 'dialogue', 'battle', 'equipment', 'world', 'world_data', 'houses', 'ch2c', 'ch2d', 'passes', 'terrain', 'supplies'].forEach(f => require('../data/' + f + '.js'));
const BL = require('../src/battle_logic.js'); require('../src/game.js');
const G = globalThis.Game, D = DATA, B = D.battle;
let pass = 0, fail = 0;
const check = (n, ok, x) => { (ok ? pass++ : fail++); console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); };
const mk = (id, lv) => { const m = G.makeMember(id); if (lv > 1) BL.gainExp(m, BL.expFor(lv)); return m; };
const rng = () => 0.5;
G.items = { herb: 3, tonic: 0, smoke: 0, revive: 2, revive2: 1, herb2: 2, tonic2: 2 };

// 物品
['herb', 'herb2', 'herb3', 'tonic', 'tonic2', 'tonic3', 'revive', 'revive2'].forEach(k => check('item exists ' + k, !!B.items[k]));
check('three HP tiers increase', B.items.herb.hp < B.items.herb2.hp && B.items.herb2.hp < B.items.herb3.hp);
check('three TP tiers increase', B.items.tonic.tp < B.items.tonic2.tp && B.items.tonic2.tp < B.items.tonic3.tp);

// 復活藥
G.advisor = null;
let party = ['nyao', 'liubei', 'guanyu'].map(id => mk(id, 10));
let b = BL.newBattle(party, ['turban'], { flags: { route: 'wit' }, rng });
const dead = b.party[1]; dead.hp = 0;
let ev = BL.perform(b, b.party[0], { type: 'item', item: 'revive', target: dead });
check('revive item brings back an ally at half HP', dead.hp === Math.round(dead.hpMax * 0.5), dead.hp);
check('revive item is consumed', G.items.revive === 1, G.items.revive);
ev = BL.perform(b, b.party[0], { type: 'item', item: 'revive' });
check('revive with nobody down refunds the item', G.items.revive === 1, G.items.revive);
b.party[2].hp = 0;
BL.perform(b, b.party[0], { type: 'item', item: 'revive2', target: b.party[2] });
check('revive2 gives full HP', b.party[2].hp === b.party[2].hpMax);
// 藥
b.party[0].hp = 10; BL.perform(b, b.party[0], { type: 'item', item: 'herb2', target: b.party[0] });
check('herb2 heals 200', b.party[0].hp === Math.min(b.party[0].hpMax, 210), b.party[0].hp);
b.party[0].tp = 0; BL.perform(b, b.party[0], { type: 'item', item: 'tonic2', target: b.party[0] });
check('tonic2 restores 16 TP', b.party[0].tp === Math.min(b.party[0].tpMax, 16), b.party[0].tp);

// 復活術
const has = (m, id, flags) => BL.skillsFor(m, flags || { route: 'wit' }).some(s => s.id === id);
check('nyao (wit) learns revive at Lv10', !has(mk('nyao', 9), 'revive') && has(mk('nyao', 10), 'revive'));
check('nyao (force) learns revive at Lv18', !has(mk('nyao', 17), 'revive', { route: 'force' }) && has(mk('nyao', 18), 'revive', { route: 'force' }));
check('luzhi learns revive at Lv10 and revive2 at Lv20', has(mk('luzhi', 10), 'revive') && has(mk('luzhi', 20), 'revive2') && !has(mk('luzhi', 20), 'revive'));
check('caocao learns revive at Lv16', !has(mk('caocao', 15), 'revive') && has(mk('caocao', 16), 'revive'));
check('guanyu never learns revive', !has(mk('guanyu', 60), 'revive'));
party = ['nyao', 'liubei'].map(id => mk(id, 12));
b = BL.newBattle(party, ['turban'], { flags: { route: 'wit' }, rng });
b.party[1].hp = 0; b.party[0].tp = 20;
BL.perform(b, b.party[0], { type: 'skill', skill: 'revive', target: b.party[1] });
check('revive skill raises the ally at 35%', b.party[1].hp === Math.round(b.party[1].hpMax * 0.35) && b.party[0].tp === 12, [b.party[1].hp, b.party[0].tp]);

// 調息
b.party[0].tp = 20; b.party[1].tp = 0;
BL.perform(b, b.party[0], { type: 'skill', skill: 'tpgive', target: b.party[1] });
check('tpgive moves TP to an ally', b.party[1].tp > 0 && b.party[0].tp === 17, [b.party[1].tp, b.party[0].tp]);

// 軍師專屬計謀
const lvl = (id, l) => mk(id, l);
G.advisor = null;
check('no advisor skills when not advisor', !BL.skillsFor(lvl('caocao', 20), {}).some(s => s.adv));
G.advisor = 'caocao';
const cs = BL.skillsFor(lvl('caocao', 20), {}).filter(s => s.adv).map(s => s.id);
check('caocao as advisor gets 3 exclusive skills', cs.length === 3, cs);
check('other members get none while caocao is advisor', !BL.skillsFor(lvl('luzhi', 20), {}).some(s => s.adv));
G.advisor = 'luzhi';
check('luzhi as advisor gets his own set', BL.skillsFor(lvl('luzhi', 20), {}).filter(s => s.adv).map(s => s.id).join() === 'adv_lu_a,adv_lu_b,adv_lu_c');
G.advisor = 'nyao';
check('nyao as advisor gets his own set', BL.skillsFor(lvl('nyao', 12), { route: 'wit' }).filter(s => s.adv).length === 3);
check('every advisor skill is defined', Object.keys(B.advisorSkills).every(k => B.advisorSkills[k].every(e => B.skills[e[1]])));
G.advisor = null;

// 新計謀效果
party = ['nyao', 'liubei', 'guanyu'].map(id => mk(id, 20));
b = BL.newBattle(party, ['turban', 'turban'], { flags: { route: 'wit' }, rng });
b.party[0].tp = 50;
const d0 = b.enemies[0].def;
BL.perform(b, b.party[0], { type: 'skill', skill: 'weaken' });
check('weaken lowers every foe def', b.enemies.every(e => BL.eff(e, 'def') < d0), b.enemies.map(e => BL.eff(e, 'def')));
const s0 = b.party[1].spd;
BL.perform(b, b.party[0], { type: 'skill', skill: 'haste' });
check('haste raises ally speed', BL.eff(b.party[1], 'spd') > s0);
const hp0 = b.enemies.map(e => e.hp);
BL.perform(b, b.party[0], { type: 'skill', skill: 'ambush' });
check('ambush hits all foes', b.enemies.every((e, i) => e.hp < hp0[i]));
check('skill count grew', Object.keys(B.skills).length >= 55, Object.keys(B.skills).length);

// 補給與商店
check('medic shops defined', ['medic1', 'medic2', 'medic3'].every(k => D.shops[k] && D.shops[k].every(i => B.items[i])));
const chest = D.maps.cave5_3.objects.find(o => o.id === 'c5h');
check('deep chest carries revive2', chest.item.revive2 >= 1, chest.item);
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
