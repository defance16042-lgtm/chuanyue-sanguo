// 遊戲進度：隊伍、劇情旗標、目前位置、遊玩時間，以及存檔用的快照與還原。
(function () {
  const D = window.DATA;
  const Game = {};

  // 防禦由兵力換算，不是獨立能力
  // 基本防禦＝兵力×8%＋守備÷4（裝備與特性另外加）
  Game.recalc = function (m) { m.def = Math.round(m.hpMax * 0.08 + (m.grd || 0) / 4); return m; };

  // 裝備＋特性帶來的加成
  Game.bonus = function (m, key) {
    let v = 0;
    const c = D.characters[m.id];
    if (c && c.trait && c.trait.mods && c.trait.mods[key]) v += c.trait.mods[key];
    const eq = m.equip || {};
    Object.keys(eq).forEach(function (slot) {
      const it = eq[slot] && D.equipment[eq[slot]];
      if (it && it.mods && it.mods[key]) v += it.mods[key];
    });
    return v;
  };
  // 實際能力值（基本值＋裝備＋特性）
  // 攻擊力＝武力×2＋裝備攻擊力；防禦力＝防禦（兵力、守備換算）＋裝備
  Game.eff = function (m, key) {
    if (key === 'pow') return Game.eff(m, 'atk') * 2 + Game.bonus(m, 'pow');
    return (m[key] || 0) + Game.bonus(m, key);
  };
  // 大頭像編號（沒有就回傳 -1）
  Game.portraitOf = function (m) { const c = D.characters[m.id]; return c && typeof c.portrait === 'number' ? c.portrait : -1; };
  Game.canEquip = function (m, id) { const it = D.equipment[id]; if (!it || (it.only && it.only !== m.id)) return false;
    const c = D.characters[m.id]; return !(it.wtype && c && c.weapon && it.wtype !== c.weapon); };
  Game.equip = function (m, slot, id) {
    m.equip = m.equip || {};
    const old = m.equip[slot];
    if (old) Game.equipInv[old] = (Game.equipInv[old] || 0) + 1;
    if (id) { Game.equipInv[id]--; m.equip[slot] = id; } else delete m.equip[slot];
  };
  // ---- 戰術點（TP）：基本值 + 固定加成 + 智力加成 + 軍師加成 ----
  // 軍師：隊伍裡指定一個人當軍師，全隊最大 TP 隨軍師的智力增加，軍師本人每回合多回 1 點 TP。
  Game.advisor = null;
  Game.formation = 'none';
  Game.advisorOf = function () { return Game.advisor ? (Game.party || []).filter(function (m) { return m.id === Game.advisor; })[0] || null : null; };
  Game.tpBonusFromAdvisor = function () { const a = Game.advisorOf(); return a ? Math.floor(Game.eff(a, 'int') * 0.25) : 0; };
  Game.tpMaxOf = function (m) { return (m.tpMax || 0) + 6 + Math.floor(Game.eff(m, 'int') / 6) + Game.tpBonusFromAdvisor(); };
  Game.fullTp = function (m) { m.tp = Game.tpMaxOf(m); };
  Game.addGear = function (id, n) { Game.equipInv[id] = (Game.equipInv[id] || 0) + (n || 1); };

  Game.makeMember = function (id) {
    const c = D.characters[id];
    return Game.recalc({
      id: id, name: c.name, sprite: c.sprite, allocatable: false, guest: !!c.guest,
      level: 1, exp: 0,
      hpMax: c.hp, hp: c.hp, tpMax: c.tp, tp: c.tp,
      atk: c.atk, int: c.int, def: 0, spd: c.spd, lead: c.lead, luck: c.luck, grd: c.grd,
      equip: {}
    });
  };

  // ---- 招收館：寄放在館裡的角色（不在隊伍裡），隊伍最多 5 人 ----
  Game.roster = [];
  Game.MAX_PARTY = 5;
  Game.topLevel = function () { return Math.max.apply(null, (Game.party || []).concat(Game.roster || []).map(function (m) { return m.level || 1; }).concat([1])); };
  Game.hasMember = function (id) { return (Game.party || []).concat(Game.roster || []).some(function (m) { return m.id === id; }); };
  // 招收一位將領：隊伍有空位就直接入隊，否則送進招收館。回傳 'party' 或 'hall'
  Game.addRecruit = function (id) {
    const m = Game.makeMember(id), lv = Game.topLevel();
    if (lv > 1 && window.BattleLogic) window.BattleLogic.gainExp(m, window.BattleLogic.expFor(lv));
    m.hp = m.hpMax; Game.fullTp(m);
    Game.flags['recruited_' + id] = true;
    if (Game.party.length < Game.MAX_PARTY) { Game.party.push(m); return 'party'; }
    Game.roster.push(m); return 'hall';
  };
  // 隊伍與招收館之間搬人。回傳 null 表示成功，否則是說明文字
  Game.deposit = function (i) {
    const m = Game.party[i];
    if (!m) return '沒有這個人。';
    if (m.guest) return m.name + '是助戰的客將，不能寄放。';
    if (Game.party.length <= 1) return '隊伍裡至少要留一個人。';
    Game.party.splice(i, 1); Game.roster.push(m);
    if (Game.advisor === m.id) Game.advisor = null;
    return null;
  };
  Game.withdraw = function (i) {
    if (Game.party.length >= Game.MAX_PARTY) return '隊伍已滿（最多 5 人），先寄放一位吧。';
    const m = Game.roster.splice(i, 1)[0]; if (m) Game.party.push(m);
    return null;
  };

  Game.fresh = function () {
    const start = D.maps.zhuoxian.start;
    Game.flags = {};
    Game.playtime = 0;
    Game.mapId = 'zhuoxian';
    Game.pos = { x: start.x, y: start.y, dir: start.dir };
    Game.party = [Game.makeMember('nyao')];
    Game.roster = [];
    Game.gold = 50;
    Game.items = { herb: 3, tonic: 0, smoke: 0 };
    Game.equipInv = {};
    Game.advisor = null; Game.formation = 'none';
  };

  Game.snapshot = function () {
    return JSON.parse(JSON.stringify({
      version: 1, mapId: Game.mapId, pos: Game.pos, flags: Game.flags,
      party: Game.party, roster: Game.roster, gold: Game.gold, items: Game.items, equipInv: Game.equipInv, advisor: Game.advisor, formation: Game.formation, playtime: Game.playtime, savedAt: Date.now()
    }));
  };

  // 讀檔時檢查內容，壞掉或版本不符就拒絕，避免載入後卡死。
  Game.restore = function (d) {
    try {
      if (!d || d.version !== 1 || !D.maps[d.mapId] || !Array.isArray(d.party) || !d.party.length) return false;
      const m = D.maps[d.mapId];
      if (!d.pos || d.pos.x < 0 || d.pos.y < 0 || d.pos.y >= m.tiles.length || d.pos.x >= m.tiles[0].length) return false;
      Game.mapId = d.mapId;
      Game.pos = { x: d.pos.x, y: d.pos.y, dir: d.pos.dir || 'down' };
      Game.flags = d.flags || {};
      Game.party = d.party;
      Game.roster = Array.isArray(d.roster) ? d.roster.filter(function (m) { return m && D.characters[m.id]; }) : [];
      Game.roster.forEach(function (m) { m.equip = m.equip || {}; m.allocatable = false; Game.recalc(m); });
      Game.party.forEach(function (m) {
        const c = D.characters[m.id] || {};
        if (typeof m.lead !== 'number') m.lead = typeof m.cha === 'number' ? Math.round(m.cha * 0.8) + 2 : (c.lead || 8);
        if (typeof m.luck !== 'number') m.luck = c.luck || 8;
        if (typeof m.grd !== 'number') m.grd = c.grd || 6;
        delete m.cha;
        m.equip = m.equip || {};
        m.allocatable = false;
        if (m.points > 0 && window.BattleLogic) { for (let i = 0; i < m.points; i++) window.BattleLogic.randomStat(m); }
        delete m.points;
        Game.recalc(m);
      });
      Game.equipInv = Object.assign({}, d.equipInv || {});
      Game.advisor = d.advisor || null; Game.formation = d.formation || 'none';
      Game.party.forEach(function (m) { if (m.tp >= (m.tpMax || 0)) Game.fullTp(m); });
      Game.playtime = d.playtime || 0;
      Game.gold = typeof d.gold === 'number' ? d.gold : 0;
      Game.items = Object.assign({ herb: 0, tonic: 0, smoke: 0 }, d.items || {});
      return true;
    } catch (e) { return false; }
  };

  Game.fresh();
  window.Game = Game;
})();
