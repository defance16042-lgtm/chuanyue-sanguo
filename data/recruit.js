// 可招收將領：只會是「主線已經打倒過的頭目」，之後在野外遇到他們的殘部（捲土重來）時，有一點機會投降，可選擇招收。
// 主線 Boss 戰本身不會招收。殘部有時一次來一到三位。每位將領同時是敵方單位（B.enemies.<id>_r，recruit=id）與角色（D.characters.<id>）。
(function () {
  const D = window.DATA, B = D.battle;
  // id：[字, 能力型態（b猛將/t謀士/s疾風）, 地圖人物圖列（sprites.png；沒有專屬圖的借用 tools/recruit_chars.py 的列）, 簡介]
  const INFO = {
    chengyuanzhi: ['', 'b', 5, '黃巾的老將，嗓門大、人緣好。被你們打敗之後倒也服氣。'],
    qushuai: ['', 'b', 12, '黃巾渠帥，講義氣，打輸了就認。'],
    bocai: ['', 's', 18, '潁川黃巾大帥，行動快、愛耍小聰明。'],
    pengtuo: ['', 'b', 37, '汝南黃巾渠帥，力氣大，說話直。'],
    zhaohong: ['', 'b', 39, '宛城黃巾大帥，用槍的好手。'],
    hanzhong: ['', 'b', 40, '趙弘戰死後接手宛城的大帥，個性沉穩。'],
    busi: ['', 'b', 38, '黃巾渠帥，一提到打仗就興奮。'],
    zhangliang: ['', 't', 21, '地公將軍，張角之弟，擅長調度。'],
    zhangbao: ['', 'b', 22, '人公將軍，張角之弟，脾氣不小。'],
    zhangjiao: ['', 't', 23, '大賢良師，太平道的領袖。被你們打敗後竟然也肯同行，真是奇事。'],
    duyou: ['', 't', 25, '黑山軍的軍師型人物，慣用扇子。'],
    zhangyan: ['', 's', 26, '黑山軍首領，身手輕捷，人稱「飛燕」。'],
    zhangchun: ['', 'b', 32, '烏桓的猛將，騎射俱精。'],
    huaxiong: ['', 'b', 31, '董卓帳下猛將，勇冠三軍，就是愛吹牛。'],
    lubu: ['奉先', 'b', 33, '人中呂布。方天畫戟在手，天下少有敵手。'],
    xurong: ['', 'b', 34, '董卓部將，用兵老練，善守善攻。']
  };
  const TP = { b: { hp: 1.15, atk: 1.2, int: 0.8, spd: 0.95, grow: { hp: 20, atk: 2.0, int: 0.6, spd: 0.25, lead: 0.8, luck: 0.4, grd: 0.9, tp: 0.4 } },
               t: { hp: 0.95, atk: 0.85, int: 1.3, spd: 1, grow: { hp: 15, atk: 0.8, int: 1.8, spd: 0.3, lead: 1.2, luck: 0.5, grd: 0.6, tp: 0.8 } },
               s: { hp: 1, atk: 1, int: 1, spd: 1.35, grow: { hp: 17, atk: 1.4, int: 1.0, spd: 0.6, lead: 0.8, luck: 0.6, grd: 0.7, tp: 0.5 } } };
  const TERR = { b: { plain: 'S', forest: 'B', mountain: 'B', sea: 'C', desert: 'B' }, t: { plain: 'B', forest: 'S', mountain: 'A', sea: 'C', desert: 'B' }, s: { plain: 'S', forest: 'A', mountain: 'C', sea: 'B', desert: 'B' } };
  const TRAIT = { b: { name: '勇猛', desc: '武力 +2', mods: { atk: 2 } }, t: { name: '多謀', desc: '智力 +2', mods: { int: 2 } }, s: { name: '疾風', desc: '速度 +2', mods: { spd: 2 } } };
  B.surrenderBase = 0.10;   // 殘部被打敗後，每位投降的基本機率；隊伍最高統率每點再 +0.2%，上限 25%
  B.surrenderMax = 0.25;
  Object.keys(INFO).forEach(function (id) {
    const e = B.enemies[id], r = B.enemies[id + '_r'], f = INFO[id], tp = TP[f[1]];
    if (!e || !r) return;
    const wp = e.weapon === '弓' ? '槍' : (e.weapon || '刀'), star = id === 'lubu' ? 1.4 : (id === 'zhangjiao' || id === 'huaxiong' || id === 'xurong' ? 1.15 : 1);
    D.characters[id] = { id: id, name: e.name, sprite: f[2], zi: f[0], title: e.title || '', cls: e.cls || '武官', weapon: wp, terrain: TERR[f[1]],
      hp: Math.round(110 * tp.hp * star), tp: f[1] === 't' ? 10 : 6, atk: Math.round(13 * tp.atk * star), int: Math.round(11 * tp.int * star), spd: Math.round(10 * tp.spd), lead: 12 + (f[1] === 't' ? 4 : 0), luck: 9, grd: 9,
      growth: tp.grow, trait: TRAIT[f[1]], bio: f[3], home: f[1] === 't' ? 'forest' : 'plain', recruit: true };
    r.recruit = id;
  });
})();

// ---- 招收館：每座城鎮都有一位招賢官（大地圖上的城鎮 D.worldTowns）----
(function () {
  const D = window.DATA, solid = {};
  D.solidTiles.forEach(function (t) { solid[t] = true; });
  D.dialogue.hall_officer = [
    { speaker: '招賢官', text: '這裡是招收館。歸順的將領可以寄放在這裡，隊伍想換人，隨時來領。劉備、關羽、張飛，還有你，也都可以寄放。' },
    { speaker: '招賢官', text: '要辦理嗎？', choices: [{ label: '辦理寄放與領人', act: { hall: true } }, { label: '不用了' }] }
  ];
  Object.keys(D.worldTowns || {}).forEach(function (id) {
    const m = D.maps[id]; if (!m) return;
    const used = {}; (m.npcs || []).concat(m.objects || [], m.signs || [], m.warps || []).forEach(function (o) { used[o.x + ',' + o.y] = true; });
    used[m.start.x + ',' + m.start.y] = true;
    const at = function (x, y) { const ch = (m.tiles[y] || '')[x]; return ch === undefined ? -1 : D.legend[ch]; };
    let best = null, bd = 1e9;
    for (let y = 2; y < m.tiles.length - 2; y++) for (let x = 2; x < m.tiles[y].length - 2; x++) {
      const t = at(x, y); if (t !== 1 && t !== 5 && t !== 0 && t !== 31) continue;
      let ok = !used[x + ',' + y];
      for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) { const q = at(x + dx, y + dy); if (q < 0 || solid[q] || q === 8 || q === 40 || q === 41 || used[(x + dx) + ',' + (y + dy)]) ok = false; }
      if (!ok) continue;
      const d = Math.abs(x - m.start.x) + Math.abs(y - m.start.y) + (Math.abs(x - m.start.x) + Math.abs(y - m.start.y) < 3 ? 40 : 0);
      if (d < bd) { bd = d; best = { x: x, y: y }; }
    }
    if (best) m.npcs.push({ id: 'hall_officer', name: '招賢官', sprite: 29, x: best.x, y: best.y, dir: 'down', dialogue: 'hall_officer' });
  });
})();

// 村莊與城鎮裡不會隨機遇敵（只有主線、支線的敵軍 NPC 才會開戰）
(function () {
  const D = window.DATA;
  Object.keys(D.worldTowns || {}).forEach(function (id) { if (D.maps[id]) delete D.maps[id].encounter; });
})();
