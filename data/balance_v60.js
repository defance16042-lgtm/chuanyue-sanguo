// v0.60.0 戰鬥平衡：將領更強、更常成群出現、新計謀（策反計＝計謀反彈、禁策計＝封住計謀）
(function () {
  const D = window.DATA, B = D.battle, SK = B.skills;
  B.generalBoost = { hp: 1.15, atk: 1.35, int: 1.2, def: 1.1 };   // 所有將領（頭目與無名將領）進場時的能力加成
  B.rematchRate = 0.12;     // 打倒過的將領殘部再度出現
  B.wildGenRate = 0.28;     // 一到兩位無名將領帶隊
  B.allGenRate = 0.07;      // 五位全是將領
  B.bossEscort = 0.7;       // 頭目戰：帶著曾經被打敗的將領一起出戰的機率（一到三位）
  SK.sx_reflect = { name: '策反計', tp: 7, kind: 'reflect', target: 'self', turns: 3, pct: 0.6, fx: 'up_r' };
  SK.sx_seal = { name: '禁策計', tp: 6, kind: 'seal', target: 'one', turns: 3, chance: 0.8, fx: 'dizzy' };
  SK.sx_seal2 = { name: '連環禁策', tp: 11, kind: 'seal', target: 'all', turns: 2, chance: 0.7, fx: 'dizzy', replaces: 'sx_seal' };
  const add = function (list, entry) { if (list && list.indexOf(entry) < 0) list.push(entry); };
  // 謀士專有：許攸（禁策）、貓妖智取路線（禁策、策反）
  if (B.charSkills.xuyou) add(B.charSkills.xuyou, [8, 'sx_seal']);
  if (B.charSkills.xuyou) add(B.charSkills.xuyou, [14, 'sx_reflect']);
  if (B.routeSkills && B.routeSkills.wit) { B.routeSkills.wit.push([24, 'sx_seal'], [34, 'sx_reflect'], [46, 'sx_seal2']); }
  // 敵方謀臣也會用：審配（策反計）、蔡瑁（禁策計）
  [['shenpei', 'sx_reflect'], ['shenpei_r', 'sx_reflect'], ['caimao', 'sx_seal']].forEach(function (p) {
    const e = B.enemies[p[0]]; if (e) { e.eSkills = (e.eSkills || []).slice(); if (e.eSkills.indexOf(p[1]) < 0) e.eSkills.push(p[1]); }
  });
})();
