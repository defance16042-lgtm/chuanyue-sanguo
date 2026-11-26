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
    xurong: ['', 'b', 34, '董卓部將，用兵老練，善守善攻。'],
    zhangkai: ['', 'b', 58, '泰山賊出身的都尉，下手狠、翻臉快，打輸了卻很識時務。'],
    houcheng: ['', 'b', 46, '呂布麾下并州將，比主公有耐心，就是運氣差。'],
    songxian: ['', 'b', 47, '與侯成同進同退的并州將，用戟的好手。'],
    chezhou: ['', 'b', 62, '曹操留在徐州的刺史，做事謹慎、不太會變通，打輸了反而鬆了口氣。'],
    yanliang: ['', 'b', 63, '河北名將，並稱雙壁之一，一刀劈下去像劈柴。'],
    wenchou: ['', 'b', 64, '河北雙壁之一，槍法剛猛，最看重朋友。'],
    gaoshun: ['', 'b', 55, '陷陣營統領，不飲酒、不收禮，一板一眼的老派將軍。'],
    caoren: ['子孝', 'b', 66, '曹操的族弟，用兵穩、守得牢，人稱「天人」。打輸了還記得先把部下接回去。'],
    shenpei: ['正南', 't', 67, '袁紹帳下的剛直謀臣，鎮守鄴城，一生忠於袁氏，脾氣比他的城牆還硬。']
  };
  const TP = { b: { hp: 1.15, atk: 1.2, int: 0.8, spd: 0.95, grow: { hp: 20, atk: 2.0, int: 0.6, spd: 0.25, lead: 0.8, luck: 0.4, grd: 0.9, tp: 0.4 } },
               t: { hp: 0.95, atk: 0.85, int: 1.3, spd: 1, grow: { hp: 15, atk: 0.8, int: 1.8, spd: 0.3, lead: 1.2, luck: 0.5, grd: 0.6, tp: 0.8 } },
               s: { hp: 1, atk: 1, int: 1, spd: 1.35, grow: { hp: 17, atk: 1.4, int: 1.0, spd: 0.6, lead: 0.8, luck: 0.6, grd: 0.7, tp: 0.5 } } };
  const TERR = { b: { plain: 'S', forest: 'B', mountain: 'B', sea: 'C', desert: 'B' }, t: { plain: 'B', forest: 'S', mountain: 'A', sea: 'C', desert: 'B' }, s: { plain: 'S', forest: 'A', mountain: 'C', sea: 'B', desert: 'B' } };
  const TRAIT = { b: { name: '勇猛', desc: '武力 +2', mods: { atk: 2 } }, t: { name: '多謀', desc: '智力 +2', mods: { int: 2 } }, s: { name: '疾風', desc: '速度 +2', mods: { spd: 2 } } };
  // 依史實為每位將領單獨設計的能力與成長：[兵力, 戰術點, 武力, 智力, 速度, 統率, 運氣, 防禦]、成長、特性。猛將重武力與兵力，智將重智力與統率，疾風型重速度。
  const G = function (hp, atk, int, spd, lead, luck, grd, tp) { return { hp: hp, atk: atk, int: int, spd: spd, lead: lead, luck: luck, grd: grd, tp: tp }; };
  const PROF = {
    chengyuanzhi: { s: [118, 6, 13, 8, 8, 14, 8, 10], g: G(19, 1.7, 0.5, 0.2, 1.0, 0.4, 1.0, 0.4), t: ['老黃巾', '防禦 +3、統率 +1', { grd: 3, lead: 1 }] },
    qushuai: { s: [115, 6, 13, 9, 10, 13, 10, 9], g: G(18, 1.7, 0.6, 0.25, 0.9, 0.8, 0.8, 0.4), t: ['義氣相挺', '運氣 +3、武力 +1', { luck: 3, atk: 1 }] },
    bocai: { s: [105, 7, 12, 13, 16, 15, 11, 7], g: G(16, 1.3, 1.2, 0.8, 1.1, 0.6, 0.6, 0.6), t: ['長社火計', '智力 +2、速度 +2', { int: 2, spd: 2 }] },
    pengtuo: { s: [135, 4, 16, 5, 7, 10, 8, 12], g: G(23, 2.1, 0.2, 0.15, 0.6, 0.3, 1.1, 0.3), t: ['蠻力過人', '武力 +3、防禦 +1', { atk: 3, grd: 1 }] },
    zhaohong: { s: [125, 6, 15, 8, 10, 12, 9, 11], g: G(20, 1.9, 0.5, 0.3, 0.8, 0.4, 0.9, 0.4), t: ['宛城槍術', '武力 +2、速度 +1', { atk: 2, spd: 1 }] },
    hanzhong: { s: [130, 6, 12, 10, 8, 16, 9, 14], g: G(21, 1.4, 0.7, 0.2, 1.2, 0.4, 1.3, 0.4), t: ['堅城死守', '防禦 +4、統率 +1', { grd: 4, lead: 1 }] },
    busi: { s: [108, 8, 12, 12, 11, 11, 16, 8], g: G(17, 1.3, 1.0, 0.4, 0.7, 1.0, 0.6, 0.6), t: ['卜卦趨吉', '運氣 +4', { luck: 4 }] },
    zhangliang: { s: [100, 12, 9, 19, 10, 18, 10, 7], g: G(15, 0.7, 2.0, 0.3, 1.4, 0.5, 0.6, 0.9), t: ['地公之謀', '智力 +3、統率 +1', { int: 3, lead: 1 }] },
    zhangbao: { s: [118, 8, 15, 13, 10, 13, 9, 9], g: G(18, 1.7, 1.2, 0.3, 0.9, 0.5, 0.8, 0.6), t: ['人公妖術', '智力 +2、武力 +1', { int: 2, atk: 1 }] },
    zhangjiao: { s: [105, 14, 8, 23, 9, 22, 14, 8], g: G(15, 0.6, 2.2, 0.3, 1.6, 0.7, 0.5, 1.0), t: ['太平要術', '智力 +4、統率 +1', { int: 4, lead: 1 }] },
    duyou: { s: [98, 12, 8, 19, 12, 16, 11, 6], g: G(14, 0.6, 1.9, 0.35, 1.2, 0.6, 0.5, 0.9), t: ['黑山奇謀', '智力 +3', { int: 3 }] },
    zhangyan: { s: [108, 6, 14, 12, 19, 14, 12, 7], g: G(17, 1.6, 0.9, 0.8, 0.8, 0.7, 0.6, 0.5), t: ['飛燕輕功', '速度 +4', { spd: 4 }] },
    zhangchun: { s: [118, 6, 15, 10, 15, 15, 9, 9], g: G(19, 1.8, 0.7, 0.5, 1.0, 0.4, 0.8, 0.4), t: ['烏桓騎射', '武力 +2、速度 +2', { atk: 2, spd: 2 }] },
    huaxiong: { s: [150, 5, 20, 5, 9, 12, 6, 12], g: G(22, 2.4, 0.3, 0.2, 0.7, 0.2, 1.0, 0.3), t: ['勇冠三軍', '武力 +4、運氣 -1', { atk: 4, luck: -1 }] },
    lubu: { s: [165, 6, 24, 8, 14, 16, 8, 12], g: G(24, 2.7, 0.4, 0.5, 0.9, 0.3, 1.0, 0.4), t: ['人中呂布', '武力 +5、速度 +2', { atk: 5, spd: 2 }] },
    xurong: { s: [138, 6, 15, 12, 9, 20, 10, 14], g: G(21, 1.8, 0.7, 0.2, 1.4, 0.4, 1.2, 0.4), t: ['老將持重', '統率 +4、防禦 +2', { lead: 4, grd: 2 }] },
    zhangkai: { s: [118, 6, 14, 8, 12, 10, 12, 8], g: G(18, 1.8, 0.4, 0.4, 0.5, 0.7, 0.6, 0.4), t: ['見利忘義', '武力 +2、運氣 +2', { atk: 2, luck: 2 }] },
    houcheng: { s: [128, 6, 16, 11, 11, 15, 5, 11], g: G(20, 1.9, 0.7, 0.35, 1.0, 0.2, 0.9, 0.4), t: ['并州之將', '武力 +2、統率 +2', { atk: 2, lead: 2 }] },
    songxian: { s: [132, 5, 17, 8, 10, 13, 8, 12], g: G(21, 2.0, 0.4, 0.25, 0.8, 0.4, 1.0, 0.4), t: ['長戟鉤擊', '武力 +3、防禦 +1', { atk: 3, grd: 1 }] },
    gaoshun: { s: [145, 6, 17, 14, 11, 24, 9, 15], g: G(22, 1.9, 0.8, 0.3, 1.5, 0.4, 1.3, 0.5), t: ['陷陣之志', '統率 +4、防禦 +3', { lead: 4, grd: 3 }] },
    caoren: { s: [152, 6, 19, 12, 14, 22, 10, 14], g: G(22, 2.1, 0.6, 0.4, 1.3, 0.4, 1.2, 0.4), t: ['天人將軍', '武力 +3、防禦 +2', { atk: 3, grd: 2 }] },
    shenpei: { s: [102, 12, 8, 21, 8, 20, 9, 12], g: G(15, 0.6, 2.1, 0.25, 1.5, 0.4, 0.8, 0.9), t: ['忠直謀臣', '智力 +3、防禦 +2', { int: 3, grd: 2 }] },
    chezhou: { s: [115, 7, 12, 14, 10, 18, 8, 10], g: G(18, 1.2, 1.2, 0.3, 1.3, 0.4, 0.8, 0.6), t: ['刺史之任', '統率 +3、智力 +1', { lead: 3, int: 1 }] },
    yanliang: { s: [155, 5, 21, 6, 10, 14, 8, 13], g: G(22, 2.5, 0.3, 0.25, 0.8, 0.3, 1.1, 0.3), t: ['河北雙壁', '武力 +4、防禦 +1', { atk: 4, grd: 1 }] },
    wenchou: { s: [145, 5, 20, 7, 12, 13, 8, 11], g: G(21, 2.3, 0.4, 0.4, 0.8, 0.3, 0.9, 0.3), t: ['河北雙壁', '武力 +3、速度 +1', { atk: 3, spd: 1 }] }
  };
  B.surrenderBase = 0.10;   // 殘部被打敗後，每位投降的基本機率；隊伍最高統率每點再 +0.2%，上限 25%
  B.surrenderMax = 0.25;
  Object.keys(INFO).forEach(function (id) {
    const e = B.enemies[id], r = B.enemies[id + '_r'], f = INFO[id], tp = TP[f[1]];
    if (!e || !r) return;
    const wp = e.weapon === '弓' ? '槍' : (e.weapon || '刀'), star = id === 'lubu' ? 1.4 : (id === 'zhangjiao' || id === 'huaxiong' || id === 'xurong' ? 1.15 : 1);
    D.characters[id] = { id: id, name: e.name, sprite: f[2], zi: f[0], title: e.title || '', cls: e.cls || '武官', weapon: wp, terrain: TERR[f[1]],
      hp: Math.round(110 * tp.hp * star), tp: f[1] === 't' ? 10 : 6, atk: Math.round(13 * tp.atk * star), int: Math.round(11 * tp.int * star), spd: Math.round(10 * tp.spd), lead: 12 + (f[1] === 't' ? 4 : 0), luck: 9, grd: 9,
      growth: tp.grow, trait: TRAIT[f[1]], bio: f[3], home: f[1] === 't' ? 'forest' : 'plain', recruit: true };
    const pr = PROF[id];
    if (pr) {
      const c = D.characters[id], v = pr.s;
      Object.assign(c, { hp: v[0], tp: v[1], atk: v[2], int: v[3], spd: v[4], lead: v[5], luck: v[6], grd: v[7], growth: pr.g, trait: { name: pr.t[0], desc: pr.t[1], mods: pr.t[2] } });
    }
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
