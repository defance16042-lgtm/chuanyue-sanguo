// 後期計謀（Lv26～60）、劉備的持續回復系、關羽／張飛／曹操／盧植的後期專屬計、敵方將領的專屬計謀。
// 效果各有不同：吸血、斬殺、持續傷害、持續回復、封印、遲緩、連擊、增益減益。
(function () {
  const D = window.DATA, B = D.battle, S = B.skills;
  Object.assign(S, {
    // ---- 物理系 ----
    p_rend:    { name: '裂甲斬',   tp: 8, kind: 'phys', target: 'one', power: 3.0, rider: { stat: 'def', mult: 0.75, turns: 3 }, fx: 'cross' },
    p_storm:   { name: '風雷連擊', tp: 9, kind: 'phys', target: 'one', power: 0.8, hits: 4, fx: 'flurry' },
    p_charge:  { name: '破陣衝鋒', tp: 10, kind: 'phys', target: 'all', power: 1.5, fx: 'multithrust' },
    p_drain:   { name: '噬魂斬',   tp: 9, kind: 'phys', target: 'one', power: 2.6, leech: 0.8, fx: 'bloodslash' },
    p_exec2:   { name: '誅殺',     tp: 10, kind: 'phys', target: 'one', power: 2.2, lowBonus: 2.0, fx: 'execute' },
    p_quake:   { name: '地裂震軍', tp: 11, kind: 'phys', target: 'all', power: 1.4, rider: { stat: 'spd', mult: 0.7, turns: 3 }, fx: 'axe' },
    p_bleed:   { name: '血刃風暴', tp: 8, kind: 'dot', target: 'all', pct: 0.06, turns: 3, chance: 0.75, fx: 'bloodslash' },
    // ---- 謀略系 ----
    tt_inferno: { name: '焚天烈焰', tp: 13, kind: 'tact', target: 'all', power: 2.6, rider: { stat: 'atk', mult: 0.75, turns: 3 }, fx: 'fire', fxLevel: 5 },
    tt_storm:   { name: '九天雷罰', tp: 12, allTp: 16, kind: 'tact', target: 'one', choice: true, power: 5.0, allPower: 2.8, fx: 'thunder' },
    tt_flood2:  { name: '洪流滅陣', tp: 12, kind: 'tact', target: 'all', power: 2.1, rider: { stat: 'def', mult: 0.7, turns: 3 }, fx: 'water' },
    tt_miasma:  { name: '瘴氣蝕骨', tp: 9, kind: 'dot', target: 'all', pct: 0.07, turns: 4, chance: 0.75, fx: 'smoke' },
    tt_mirage:  { name: '幻影迷蹤', tp: 9, kind: 'confuse', target: 'all', turns: 3, fx: 'star' },
    tt_seal:    { name: '封穴令',   tp: 11, kind: 'stun', target: 'all', turns: 2, fx: 'dizzy' },
    tt_stone:   { name: '山崩地陷', tp: 11, kind: 'tact', target: 'all', power: 2.2, rider: { stat: 'spd', mult: 0.65, turns: 3 }, fx: 'rock' },
    tt_qimen:   { name: '奇門遁甲', tp: 13, kind: 'tact', target: 'one', power: 6.0, fx: 'bagua' },
    // ---- 增益／減益 ----
    bf_valor:  { name: '激昂戰歌', tp: 9, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.6, turns: 4, fx: 'up_r' },
    bf_fort:   { name: '銅牆鐵壁', tp: 9, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.8, turns: 4, fx: 'up_b' },
    bf_wind:   { name: '乘風破浪', tp: 8, kind: 'buff', target: 'allAlly', stat: 'spd', mult: 1.7, turns: 4, fx: 'wind' },
    bf_wit:    { name: '神機妙算', tp: 9, kind: 'buff', target: 'allAlly', stat: 'int', mult: 1.6, turns: 4, fx: 'up_y' },
    bf_inv:    { name: '金剛不壞', tp: 12, kind: 'buff', target: 'allAlly', stat: 'def', mult: 2.4, turns: 2, fx: 'aura' },
    db_weak2:  { name: '威懾天下', tp: 9, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.45, turns: 4, fx: 'roar' },
    db_slow2:  { name: '泥沼纏足', tp: 8, kind: 'debuff', target: 'all', stat: 'spd', mult: 0.45, turns: 4, fx: 'trap' },
    // ---- 劉備：持續回復與多樣補血 ----
    liu_hot1:  { name: '春風化雨', tp: 5, kind: 'hot', target: 'ally', pct: 0.08, turns: 4, fx: 'bloom' },
    liu_cure:  { name: '仁心妙手', tp: 7, kind: 'cleanse', target: 'ally', healPct: 0.4, fx: 'purify' },
    liu_hot2:  { name: '甘露普降', tp: 9, kind: 'hot', target: 'allAlly', pct: 0.06, turns: 4, fx: 'leaf' },
    liu_heal4: { name: '菩提生息', tp: 11, kind: 'heal', target: 'allAlly', power: 3.0, fx: 'purify' },
    liu_bless: { name: '漢室之光', tp: 10, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.45, turns: 4, extra: { stat: 'atk', mult: 1.2 }, fx: 'aura' },
    liu_hot3:  { name: '長生訣',   tp: 12, kind: 'hot', target: 'allAlly', pct: 0.1, turns: 5, fx: 'revive' },
    liu_rev3:  { name: '桃園再生', tp: 18, kind: 'revive', target: 'deadAlly', pct: 1.0, fx: 'revive', replaces: 'revive2' },
    // ---- 關羽 ----
    g_lone:    { name: '千里走單騎', tp: 6, kind: 'buff', target: 'self', stat: 'spd', mult: 1.6, turns: 4, extra: { stat: 'atk', mult: 1.3 }, fx: 'wind' },
    g_wine:    { name: '溫酒斬將', tp: 9, kind: 'phys', target: 'one', power: 2.8, lowBonus: 2.2, fx: 'execute' },
    g_moon:    { name: '青龍偃月陣', tp: 12, kind: 'phys', target: 'all', power: 1.8, fx: 'dragon', fxLevel: 3 },
    g_saint:   { name: '武聖降世', tp: 14, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.5, turns: 4, extra: { stat: 'spd', mult: 1.2 }, fx: 'up_r' },
    // ---- 張飛 ----
    z_bridge:  { name: '長坂橋斷喝', tp: 10, kind: 'stun', target: 'all', turns: 2, fx: 'roar' },
    z_stab:    { name: '蛇矛連環', tp: 9, kind: 'phys', target: 'one', power: 1.1, hits: 3, fx: 'multithrust' },
    z_mad:     { name: '狂暴', tp: 8, kind: 'buff', target: 'self', stat: 'atk', mult: 2.0, turns: 3, extra: { stat: 'def', mult: 0.8 }, fx: 'rage' },
    z_peerless:{ name: '萬夫莫敵', tp: 13, kind: 'phys', target: 'all', power: 2.0, fx: 'whirl' },
    // ---- 曹操 ----
    c_poem:    { name: '橫槊賦詩', tp: 9, kind: 'buff', target: 'allAlly', stat: 'int', mult: 1.5, turns: 4, extra: { stat: 'atk', mult: 1.25 }, fx: 'up_y' },
    c_imperial:{ name: '挾天子令', tp: 10, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.6, turns: 3, fx: 'banner' },
    c_chain:   { name: '連環火船', tp: 14, kind: 'tact', target: 'all', power: 2.6, rider: { stat: 'spd', mult: 0.65, turns: 3 }, fx: 'fire', fxLevel: 5 },
    c_wei:     { name: '魏武雄風', tp: 12, kind: 'tact', target: 'one', power: 5.0, fx: 'thunder' },
    // ---- 盧植 ----
    l_siege:   { name: '長圍久困', tp: 9, kind: 'debuff', target: 'all', stat: 'spd', mult: 0.5, turns: 4, extra: { stat: 'def', mult: 0.8 }, fx: 'cage' },
    l_scholar: { name: '儒將攻心', tp: 10, kind: 'confuse', target: 'all', turns: 3, fx: 'confuse' },
    l_wall:    { name: '堅壁清野', tp: 11, kind: 'buff', target: 'allAlly', stat: 'def', mult: 2.0, turns: 3, fx: 'banner' },
    // ---- 軍師新計 ----
    adv_nyao_d: { name: '諸葛神算', tp: 11, kind: 'tact', target: 'all', power: 3.0, fx: 'bagua' },
    adv_nyao_e: { name: '錦囊三策', tp: 12, kind: 'heal', target: 'allAlly', power: 3.2, fx: 'bloom' },
    adv_liu_d:  { name: '白帝託孤', tp: 14, kind: 'hot', target: 'allAlly', pct: 0.08, turns: 5, fx: 'revive' }
  });
  // 每人 +1 的敵方用「持續回復」：沿用 liu_hot1 的效果
  const A = function (arr, extra) { extra.forEach(function (e) { arr.push(e); }); };
  A(B.routeSkills.force, [[30, 'p_rend'], [33, 'p_bleed'], [36, 'p_storm'], [40, 'p_drain'], [44, 'p_charge'], [48, 'p_exec2'], [52, 'p_quake'], [56, 'bf_valor'], [60, 'db_weak2']]);
  A(B.routeSkills.wit, [[30, 'tt_inferno'], [33, 'tt_miasma'], [36, 'tt_mirage'], [40, 'tt_storm'], [44, 'tt_flood2'], [48, 'tt_seal'], [52, 'tt_stone'], [56, 'bf_wit'], [60, 'tt_qimen']]);
  A(B.charSkills.liubei, [[20, 'liu_hot1'], [26, 'liu_cure'], [30, 'liu_hot2'], [36, 'liu_heal4'], [42, 'liu_bless'], [50, 'liu_hot3'], [56, 'liu_rev3']]);
  A(B.charSkills.guanyu, [[26, 'g_lone'], [32, 'g_wine'], [40, 'g_moon'], [50, 'g_saint']]);
  A(B.charSkills.zhangfei, [[26, 'z_bridge'], [32, 'z_stab'], [40, 'z_mad'], [50, 'z_peerless']]);
  A(B.charSkills.caocao, [[28, 'c_poem'], [34, 'c_imperial'], [42, 'c_chain'], [52, 'c_wei']]);
  A(B.charSkills.luzhi, [[24, 'l_siege'], [30, 'l_scholar'], [38, 'l_wall']]);
  B.advisorSkills.nyao.push([20, 'adv_nyao_d'], [30, 'adv_nyao_e']);
  B.advisorSkills.liubei.push([24, 'adv_liu_d']);

  // ---- 可招收將領：Lv26 / 36 / 48 再學三招（依型態與編號各不相同）----
  const PH = ['p_rend', 'p_storm', 'p_drain', 'p_exec2', 'p_quake', 'p_charge', 'p_bleed'];
  const TT = ['tt_inferno', 'tt_storm', 'tt_flood2', 'tt_miasma', 'tt_stone', 'tt_mirage', 'tt_seal'];
  const SU = ['bf_wind', 'bf_valor', 'bf_fort', 'db_slow2', 'db_weak2', 'liu_hot1', 'bf_inv'];
  let n = 0;
  Object.keys(B.charSkills).forEach(function (id) {
    const c = D.characters[id]; if (!c || !c.recruit) return;
    const i = n++, first = B.skills[id + '_1'] || {}, caster = first.kind === 'tact';
    const mainPool = caster ? TT : PH;
    // 每人的複製版技能：名字帶人名，數值與原版相同，所以每個人的計謀名單都不同
    const mk = function (src, suffix, label) {
      const k = id + '_L' + suffix, s = Object.assign({}, S[src]); s.name = c.name.slice(0, 2) + label; S[k] = s; return k;
    };
    const L = [
      [26, mk(mainPool[i % mainPool.length], 'a', caster ? '奇謀' : '絕招')],
      [36, mk(SU[(i * 3 + 1) % SU.length], 'b', '戰令')],
      [48, mk(mainPool[(i + 3) % mainPool.length], 'c', caster ? '天罰' : '破軍')]
    ];
    L.forEach(function (e) { B.charSkills[id].push(e); });
  });

  // ---- 敵方將領專屬計謀：每位將領 2～3 招，由名字決定，各不相同（敵方出招不耗戰術點，威力打七五折）----
  const hashN = function (s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) >>> 0; return h; };
  const PICK = function (arr, h, k) { return arr[(h >>> (k * 3)) % arr.length]; };
  const E_PH = ['p_rend', 'p_storm', 'p_drain', 'p_exec2', 'p_quake', 'p_bleed', 'p_charge'];
  const E_TT = ['tt_storm', 'tt_inferno', 'tt_miasma', 'tt_mirage', 'tt_stone', 'tt_flood2', 'tt_seal'];
  const E_SU = ['bf_valor', 'bf_fort', 'bf_wind', 'liu_hot1', 'db_weak2', 'db_slow2', 'liu_hot2'];
  const FIXED = {
    lubu: ['p_exec2', 'p_charge', 'bf_valor'], huaxiong: ['p_rend', 'p_quake', 'db_weak2'], zhangjiao: ['tt_storm', 'tt_miasma', 'liu_hot2'],
    zhangbao: ['tt_mirage', 'tt_stone', 'bf_wit'], zhangliang: ['tt_inferno', 'p_bleed', 'liu_hot1'], xurong: ['p_charge', 'bf_fort', 'p_rend'],
    dongzhuo: ['p_quake', 'db_weak2', 'bf_fort'], guosi: ['p_bleed', 'p_drain', 'bf_wind'], bocai: ['tt_inferno', 'p_storm', 'bf_wind']
  };
  Object.keys(B.enemies).forEach(function (id) {
    const e = B.enemies[id], base = id.replace(/_r$/, '');
    const general = e.boss || /將|帥|教主|首領/.test(e.cls || '') || /^gen_/.test(base) || /_r$/.test(id);
    if (!general || e.eSkills) return;
    if (FIXED[base]) { e.eSkills = FIXED[base].slice(); return; }
    const h = hashN(base), caster = (e.int || 0) >= (e.atk || 1) * 0.45 || e.weapon === '扇';
    e.eSkills = caster ? [PICK(E_TT, h, 0), PICK(E_TT, h, 2), PICK(E_SU, h, 1)] : [PICK(E_PH, h, 0), PICK(E_PH, h, 2), PICK(E_SU, h, 1)];
    if (e.eSkills[0] === e.eSkills[1]) e.eSkills[1] = (caster ? E_TT : E_PH)[(h + 3) % 7];
  });
})();
