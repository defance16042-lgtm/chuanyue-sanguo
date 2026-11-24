// 野外無名將領：由各區平常遇到的雜兵「升格」而成（名字加「將」，兵力與能力大增，並有專屬計謀）。
// 野外遇敵時有機會遇到一到兩位無名將領帶隊，偶爾會遇到五位全是將領的組合。
(function () {
  const D = window.DATA, B = D.battle, S = B.skills;
  const POOL = { atk: ['p_rend', 'p_storm', 'p_drain', 'p_quake', 'p_bleed', 'p_charge', 'p_exec2'], tact: ['tt_storm', 'tt_inferno', 'tt_miasma', 'tt_mirage', 'tt_stone', 'tt_seal'], sup: ['bf_valor', 'bf_fort', 'bf_wind', 'liu_hot1', 'db_slow2'] };
  const hashN = function (s) { let h = 11; for (let i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) >>> 0; return h; };
  B.wildGen = {};   // 各區（field1～field10、coast）可升格的敵人 id 清單
  const make = function (id) {
    const e = B.enemies[id]; if (!e || e.boss || e.eSkills || /_r$/.test(id) || /^gen_/.test(id)) return null;
    const wid = id + '_w'; if (B.enemies[wid]) return wid;
    const nm = /(兵|卒|手|賊|眾)$/.test(e.name) ? e.name.replace(/(兵|卒|手|賊|眾)$/, '將') : e.name + '將';
    const h = hashN(id), caster = (e.int || 0) >= e.atk * 0.45;
    const w = Object.assign({}, e, {
      name: nm, title: '無名將領', cls: '將領', desc: '帶著一群' + e.name + '四處流竄的將領，沒人記得他叫什麼，但他的兵都聽他的。',
      hp: Math.round(e.hp * 3.4), atk: Math.round(e.atk * 1.3), def: Math.round(e.def * 1.25), int: Math.round((e.int || e.atk * 0.3) * 1.4), spd: e.spd + 2, lead: (e.lead || 0) + 12,
      exp: Math.round(e.exp * 3.2), gold: Math.round(e.gold * 3), ai: 'boss',
      eSkills: caster ? [POOL.tact[h % 6], POOL.tact[(h >>> 3) % 6], POOL.sup[(h >>> 5) % 5]] : [POOL.atk[h % 7], POOL.atk[(h >>> 3) % 7], POOL.sup[(h >>> 5) % 5]]
    });
    if (w.eSkills[0] === w.eSkills[1]) w.eSkills[1] = (caster ? POOL.tact : POOL.atk)[(h + 2) % (caster ? 6 : 7)];
    B.enemies[wid] = w; return wid;
  };
  Object.keys(B.groups).forEach(function (g) {
    if (!/^field\d+$|^coast[ABC]$/.test(g)) return;
    const set = {};
    B.groups[g].forEach(function (row) { row.forEach(function (id) { const w = make(id); if (w) set[w] = true; }); });
    B.wildGen[g] = Object.keys(set);
  });
  B.wildGenRate = 0.16;      // 一般遇敵中，有一到兩位無名將領帶隊的機率
  B.allGenRate = 0.035;      // 五位全是將領
})();
