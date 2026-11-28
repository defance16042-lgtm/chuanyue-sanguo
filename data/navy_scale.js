// 水軍隨進度成長：依「當地野外遭遇」（field<tier>）的平均強度，替每個區域等級各做一組水軍。
// 水賊→水軍兵→白波賊→荊州水軍，水軍將領（管亥、郭太）也跟著區域等級變強。
(function () {
  const D = window.DATA, B = D.battle, en = B.enemies;
  const avg = function (tier) {
    const gs = B.groups['field' + tier]; if (!gs) return null;
    const ids = {}; gs.forEach(function (g) { g.forEach(function (id) { ids[id] = 1; }); });
    const list = Object.keys(ids).map(function (id) { return en[id]; }).filter(function (e) { return e && !e.boss; });
    if (!list.length) return null;
    const m = function (k) { return list.reduce(function (s, e) { return s + (e[k] || 0); }, 0) / list.length; };
    return { hp: m('hp'), atk: m('atk'), def: m('def'), spd: m('spd'), exp: m('exp'), gold: m('gold') };
  };
  const KIND = function (t) { return t <= 4 ? 'shuizei' : (t <= 8 ? 'shuijun' : (t <= 12 ? 'baibo' : 'shuijun')); };
  for (let t = 1; t <= 30; t++) {
    const a = avg(t); if (!a) continue;
    const mk = function (id, base, mult, extra) {
      const b = en[base], o = Object.assign({}, b, extra || {});
      o.hp = Math.round(a.hp * mult.hp / 10) * 10; o.atk = Math.round(a.atk * mult.atk); o.def = Math.round(a.def * mult.def);
      o.spd = Math.max(b.spd, Math.round(a.spd * 0.95)); o.exp = Math.round(a.exp * mult.exp); o.gold = Math.round(a.gold * mult.exp);
      en[id] = o; D.terrainHome && (D.terrainHome[id] = 'sea');
      if (D.applyTerrain) D.applyTerrain(id, o, false);
    };
    const main = KIND(t);
    mk('shuizei_t' + t, 'shuizei', { hp: 0.8, atk: 0.95, def: 0.9, exp: 0.9 });
    mk('shuijun_t' + t, main === 'baibo' ? 'baibo' : 'shuijun', { hp: 1.1, atk: 1.05, def: 1.05, exp: 1.1 }, t >= 13 ? { name: '荊州水軍', title: '荊州水軍', desc: '蔡瑁帶出來的荊州水軍，船堅炮利，腳一沾水就特別穩。' } : {});
    B.groups['coast_t' + t] = t <= 4 ? [['shuizei_t' + t, 'shuizei_t' + t, 'shuizei_t' + t], ['shuizei_t' + t, 'shuizei_t' + t, 'captain', 'shuizei_t' + t]]
      : [['shuijun_t' + t, 'shuijun_t' + t, 'shuizei_t' + t, 'shuizei_t' + t], ['shuijun_t' + t, 'shuijun_t' + t, 'shuijun_t' + t, 'shuizei_t' + t]];
    if (t >= 7) {
      const gen = t >= 9 ? 'guotai' : 'guanhai';
      mk('gen_navy_t' + t, gen, { hp: 22, atk: 1.4, def: 1.4, exp: 12 }, { ai: 'boss' });
      B.groups['coastG_t' + t] = [['gen_navy_t' + t, 'shuijun_t' + t, 'shuijun_t' + t, 'shuizei_t' + t, 'shuizei_t' + t]];
    }
  }
})();
