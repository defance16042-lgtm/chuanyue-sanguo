// 遊戲進度：隊伍、劇情旗標、目前位置、遊玩時間，以及存檔用的快照與還原。
(function () {
  const D = window.DATA;
  const Game = {};

  // 防禦由兵力換算，不是獨立能力
  Game.recalc = function (m) { m.def = Math.round(m.hpMax * 0.08); return m; };

  Game.makeMember = function (id) {
    const c = D.characters[id];
    return Game.recalc({
      id: id, name: c.name, sprite: c.sprite, allocatable: !!c.allocatable,
      level: 1, exp: 0,
      hpMax: c.hp, hp: c.hp, tpMax: c.tp, tp: c.tp,
      atk: c.atk, int: c.int, def: 0, spd: c.spd, cha: c.cha,
      points: c.startPoints || 0
    });
  };

  Game.fresh = function () {
    const start = D.maps.zhuoxian.start;
    Game.flags = {};
    Game.playtime = 0;
    Game.mapId = 'zhuoxian';
    Game.pos = { x: start.x, y: start.y, dir: start.dir };
    Game.party = [Game.makeMember('nyao')];
    Game.gold = 50;
    Game.items = { herb: 3, tonic: 0, smoke: 0 };
  };

  Game.snapshot = function () {
    return JSON.parse(JSON.stringify({
      version: 1, mapId: Game.mapId, pos: Game.pos, flags: Game.flags,
      party: Game.party, gold: Game.gold, items: Game.items, playtime: Game.playtime, savedAt: Date.now()
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
      Game.party.forEach(function (m) { const c = D.characters[m.id]; if (typeof m.cha !== 'number') m.cha = c ? c.cha : 10; Game.recalc(m); });
      Game.playtime = d.playtime || 0;
      Game.gold = typeof d.gold === 'number' ? d.gold : 0;
      Game.items = Object.assign({ herb: 0, tonic: 0, smoke: 0 }, d.items || {});
      return true;
    } catch (e) { return false; }
  };

  Game.fresh();
  window.Game = Game;
})();
