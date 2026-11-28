// 第六章「三顧茅廬」（批次1）：新野徐庶薦孔明 → 隆中三顧（童子、崔州平、司馬徽、諸葛均、黃承彥）→ 隆中對 → 孔明出山
// 地圖由 data/ch6world.js 產生（tools/build_ch6.py）。博望坡、新野之戰、村落、洞穴、山口留給批次 2。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue, nm = D.maps;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };

  // ================= 敵人 =================
  const EN = B.enemies;
  EN.bandit6 = { name: '荊山山賊', terrain: T('A', 'A', 'B', 'C'), int: 9, lead: 12, luck: 6, title: '荊山草寇', cls: '步兵', weapon: '刀', desc: '在荊山一帶攔路的山賊，搶人很兇，逃跑更快。', hp: 2500, atk: 158, def: 84, spd: 15, exp: 620, gold: 420, sprite: 3 };
  B.groups.field19 = [['jing_soldier', 'cao_vet', 'jing_archer', 'yan_cav'], ['cao_vet', 'cao_vet', 'jing_archer', 'bandit6'], ['bandit6', 'bandit6', 'jing_soldier', 'jing_archer'], ['yan_cav', 'cao_vet', 'jing_archer', 'jing_archer', 'bandit6']];
  B.groups.ch6_bandit = [['bandit6', 'bandit6', 'bandit6', 'jing_archer']];
  D.terrainHome.bandit6 = 'forest'; D.applyTerrain('bandit6', EN.bandit6, false);

  // ================= 裝備 =================
  const G7 = {
    fc_sword: { name: '樊城劍', slot: 'weapon', wtype: '劍', mods: { pow: 55, int: 3 }, price: 3200, desc: '樊城的鐵匠照著新野軍的樣子打的劍，劍柄纏了一圈新麻繩。' },
    fc_blade: { name: '漢水環刀', slot: 'weapon', wtype: '刀', mods: { pow: 55, spd: 1 }, price: 3200, desc: '漢水邊的刀匠做的刀，刀背上有一道水波紋。' },
    fc_lance: { name: '荊北長矛', slot: 'weapon', wtype: '矛', mods: { pow: 55, grd: 3 }, price: 3240, desc: '荊州北部的長矛，矛桿用的是南陽的白蠟木。' },
    fc_spear: { name: '襄漢長槍', slot: 'weapon', wtype: '槍', mods: { pow: 58, spd: -1 }, price: 3280, desc: '襄陽與漢水之間的槍匠打的長槍，槍纓是新野軍的赭紅色。' },
    fc_fan: { name: '南陽羽扇', slot: 'weapon', wtype: '扇', mods: { int: 30, lead: 3 }, price: 3280, desc: '南陽出的羽扇，扇骨細，風大一點就要用雙手握。' },
    fc_armor: { name: '荊北鎖甲', slot: 'armor', mods: { def: 30, spd: -1 }, price: 3200, desc: '荊州北部的鎖甲，環扣細密，穿久了肩膀會有一道印子。' },
    fc_helm: { name: '新野軍盔', slot: 'helm', mods: { def: 14, grd: 7, lead: 2 }, price: 2500, desc: '新野軍的頭盔，盔纓是赭紅色，遠遠就看得出是劉備的人。' },
    fc_boots: { name: '南陽輕靴', slot: 'boots', mods: { spd: 10, def: 5 }, price: 2600, desc: '南陽人穿的輕靴，走山路特別穩。' },
    fc_charm: { name: '隆中書簡', slot: 'charm', mods: { int: 7, lead: 6 }, price: 2500, desc: '隆中的讀書人隨身帶的竹簡掛飾，裡面夾著半片寫了字的竹片。' },
    lz_fan: { name: '白羽綸巾扇', slot: 'weapon', wtype: '扇', mods: { int: 48, lead: 6 }, price: 0, desc: '崔州平送的羽扇，扇骨上刻著「靜」字。他說這把扇子送給「以後會用得到的人」。' },
    lz_robe: { name: '隆中鶴氅', slot: 'armor', mods: { def: 24, int: 6 }, price: 0, desc: '黃承彥家織的鶴氅，白底青邊，穿起來像一隻要去讀書的鶴。' },
    sj_charm: { name: '水鏡玉佩', slot: 'charm', mods: { int: 10, luck: 4 }, price: 0, desc: '司馬徽送的玉佩，背面刻著兩個字：「好」「好」。' }
  };
  Object.keys(G7).forEach(function (k) { E[k] = G7[k]; });

  // ================= 新夥伴：徐庶、諸葛亮（核心隊員） =================
  const CH = {
    xushu: { id: 'xushu', name: '徐庶', sprite: 70, portrait: 188, zi: '元直', title: '潁川名士・劍客謀士', cls: '軍師', weapon: '劍', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' },
      hp: 150, tp: 12, atk: 17, int: 22, spd: 16, lead: 22, luck: 10, grd: 9, growth: { hp: 19, atk: 1.6, int: 1.7, spd: 0.6, lead: 1.2, luck: 0.6, grd: 0.8, tp: 0.8 },
      trait: { name: '單福劍心', desc: '武力 +2、智力 +2', mods: { atk: 2, int: 2 } }, bio: '潁川人，年少時替朋友報仇殺過人，披髮塗面逃亡，後來改名「單福」，棄劍讀書。能打、能謀，也是整個三國裡最會「推薦別人」的人。' },
    zhugeliang: { id: 'zhugeliang', name: '諸葛亮', sprite: 71, portrait: 189, zi: '孔明', title: '臥龍・隆中隱士', cls: '軍師', weapon: '扇', terrain: { plain: 'B', forest: 'A', mountain: 'B', sea: 'A' },
      hp: 135, tp: 18, atk: 6, int: 31, spd: 13, lead: 30, luck: 14, grd: 10, growth: { hp: 15, atk: 0.5, int: 2.7, spd: 0.5, lead: 1.8, luck: 1.0, grd: 0.7, tp: 1.2 },
      trait: { name: '臥龍', desc: '智力 +4、統率 +3', mods: { int: 4, lead: 3 } }, bio: '琅琊陽都人，躬耕隆中，自比管仲、樂毅。劉備三顧而出，一席隆中對把天下講成三份。貓妖借了他的名字，他似乎一眼就認出了這隻貓。' }
  };
  Object.assign(D.terrainHome, { xushu: 'plain', zhugeliang: 'forest' });
  Object.keys(CH).forEach(function (id) { D.characters[id] = CH[id]; D.applyTerrain(id, CH[id], true); });
  const SK = B.skills;
  SK.xushu_a = { name: '單福劍', tp: 3, kind: 'phys', target: 'one', power: 1.8, fx: 'slash' };
  SK.xushu_b = { name: '暗殺', tp: 6, kind: 'assassinate', target: 'one', chance: 0.65, bossPct: 0.15, fx: 'slash' };
  SK.xushu_c = { name: '反間計', tp: 5, kind: 'discord', target: 'one', chance: 0.75, turns: 2, fx: 'confuse' };
  SK.xushu_d = { name: '招降', tp: 7, kind: 'defect', target: 'one', chance: 0.65, fx: 'up_r' };
  SK.zhuge_a = { name: '火計', tp: 4, kind: 'tact', target: 'one', power: 2.6, fx: 'fire' };
  SK.zhuge_b = { name: '空城計', tp: 8, kind: 'discord', target: 'all', chance: 0.6, turns: 2, fx: 'confuse' };
  SK.zhuge_c = { name: '博望火計', tp: 10, allTp: 15, kind: 'tact', target: 'one', choice: true, power: 4.0, allPower: 2.4, fx: 'fire', replaces: 'zhuge_a' };
  SK.zhuge_f = { name: '天火燎原', tp: 20, kind: 'tact', target: 'all', power: 3.8, fx: 'fire' };
  B.charSkills.xushu = ['xushu_a', [3, 'xushu_b'], [8, 'xushu_c'], [14, 'xushu_d']];
  B.charSkills.zhugeliang = ['zhuge_a', [4, 'zhuge_b'], [10, 'zhuge_c'], [15, 'sx_reflect'], [20, 'sx_seal'], [28, 'zhuge_f']];
  B.advisorSkills.xushu = [[1, 'adv_xushu_a']];
  B.advisorSkills.zhugeliang = [[1, 'adv_zhuge_a'], [10, 'adv_zhuge_b']];
  SK.adv_xushu_a = { name: '單福妙計', tp: 6, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.4, turns: 4, fx: 'up_r' };
  SK.adv_zhuge_a = { name: '隆中對策', tp: 7, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.45, turns: 4, fx: 'up_r' };
  SK.adv_zhuge_b = { name: '八陣固守', tp: 7, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.4, turns: 4, fx: 'up_r' };

  // ================= 商店與房屋 =================
  const W7 = ['yb_sword', 'yb_blade', 'yb_lance', 'yb_spear', 'yb_fan', 'fc_sword', 'fc_blade', 'fc_lance', 'fc_spear', 'fc_fan'];
  const A7 = ['cao_armor', 'xiang_helm', 'jing_boots', 'yb_jade', 'fc_armor', 'fc_helm', 'fc_boots', 'fc_charm', 'dragon_helm', 'guard_charm'];
  const SAY = {
    weapon: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，兵器都是新打的。想打勝仗，先換把好傢伙。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    armor: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，甲冑靴帽都有。穿好一點，被砍的時候至少體面。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    general: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，藥品和雜貨都有。多備幾包藥，保命用。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; }
  };
  const defShop = function (town, kind, shopName, keeper) {
    const id = town + '_' + kind;
    D.shopKinds[id] = kind; D.shopNames[id] = shopName;
    D.shops[id] = kind === 'weapon' ? W7 : kind === 'armor' ? A7 : D.shops.medic4;
    S['shop_' + id] = SAY[kind](keeper, shopName).map(function (l) { return JSON.parse(JSON.stringify(l).replace('"$"', JSON.stringify(id))); });
    return id;
  };
  const innLines = function (who, hello) { return [{ speaker: who, text: hello, choices: [{ label: '住宿 30金', act: { rest: true } }, { label: '不住了' }] }]; };
  const SLOTS = [[3, 2]];
  const HOUSES = {
    fancheng: [
      { name: '樊城縣衙', size: 'big', chest: { id: 'h6_fc_a', gold: 2000, item: { herb3: 3, tonic3: 3 }, msg: '縣衙的偏櫃裡，有一袋劉表撥給樊城的軍費。' },
        npc: { name: '縣吏', sprite: 10, lines: ['縣吏：樊城跟襄陽只隔一條漢水，可是兩邊的人，走路的方式都不一樣。', '縣吏：襄陽那邊走得慢，樊城這邊走得快。因為樊城是前線。'] } },
      { kind: 'inn', id: 'inn', name: '樊城客棧', keeper: '掌櫃', sprite: 4, hello: '樊城客棧，客人不是兵，就是商人。住一晚吧，馬廄剛打掃過。' },
      { kind: 'weapon', name: '樊城武器店', keeper: '鐵匠', sprite: 11 },
      { kind: 'armor', name: '樊城防具店', keeper: '甲冑匠', sprite: 8 },
      { kind: 'general', name: '樊城雜貨店', keeper: '掌櫃', sprite: 4 }
    ],
    longzhong: [
      { name: '諸葛草廬', size: 'small', npc: { name: '空草廬', sprite: 6, lines: ['……'] } },
      { name: '隆中農家', size: 'small', chest: { id: 'h6_lz_a', gold: 1500, item: { herb3: 2, tonic3: 2 }, msg: '米缸旁邊的小木箱，裡面是一袋曬乾的草藥和幾枚銅錢。' },
        npc: { name: '農家老丈', sprite: 6, lines: ['老丈：隆中這地方，山青水綠，種田很舒服。唯一的麻煩，是隔壁的先生每天睡到中午，連雞都不好意思叫太早。', '老丈：他說自己「躬耕隴畝」，可我從沒見過他拿鋤頭。倒是常看他拿一本書。'] } },
      { kind: 'inn', id: 'inn', size: 'big', name: '隆中客棧', keeper: '掌櫃', sprite: 4, hello: '隆中客棧，山裡人開的店。住一晚吧，夜裡聽得見松濤。' }
    ],
    shuijing: [
      { name: '水鏡莊正堂', size: 'big', chest: { id: 'h6_sj_a', gold: 1800, item: { herb3: 3, tonic3: 2 }, msg: '堂後書架下的木盒裡，是一袋學生們湊給先生買茶的錢。' },
        npc: { name: '莊中學生', sprite: 10, lines: ['學生：先生說，天下的學問，一半在書裡，一半在煮茶的火候裡。', '學生：先生最常說的話只有一個字。……我們私下賭他一整天能說幾次。'] } },
      { name: '藥圃小屋', size: 'small', chest: { id: 'h6_sj_b', gold: 1200, item: { herb3: 3 }, msg: '藥櫃的最下層，有一小包曬好的藥材和一袋診金。' },
        npc: { name: '藥圃童子', sprite: 7, lines: ['童子：我們莊裡的藥草，是先生親手種的。他說藥可以救人，書也可以。', '童子：他還說，兩樣都救不了的人，煮一壺茶陪他聊聊也行。'] } },
      { kind: 'inn', id: 'inn', size: 'big', name: '水鏡客棧', keeper: '掌櫃', sprite: 4, hello: '水鏡莊旁的客棧，客人多半是來拜見先生的讀書人。住一晚吧，早飯有竹筍。' }
    ]
  };
  Object.keys(HOUSES).forEach(function (town) {
    const tm = nm[town], doors = D.ch6Doors[town];
    HOUSES[town].forEach(function (h, i) {
      const dr = doors[i], ds = Array.isArray(dr[0]) ? dr : [dr];
      const big = h.size === 'big', w = big ? 12 : 10, ht = 7, dx = Math.floor(w / 2) - 1, id = town + '_' + (h.id || 'h' + i);
      const rows = [];
      for (let y = 0; y < ht; y++) { let r = ''; for (let x = 0; x < w; x++) r += (y === 0 || x === 0 || x === w - 1 || y === ht - 1) ? '#' : '_'; rows.push(r); }
      const put = function (x, y, ch) { rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); };
      put(1, 1, 'X'); put(2, 1, 'B'); put(1, 5, 'B'); if (big) put(w - 2, 5, 'X');
      put(dx, ht - 1, 'D'); if (ds.length > 1) put(dx + 1, ht - 1, 'D');
      const npcs = [], objects = [];
      if (h.kind) {
        let dlg;
        if (h.kind === 'inn') { dlg = 'inn_' + id; S[dlg] = innLines(h.keeper, h.hello); }
        else dlg = 'shop_' + defShop(town, h.kind, h.name, h.keeper);
        npcs.push({ id: id + '_keeper', name: h.keeper, sprite: h.sprite, x: 4, y: 2, dir: 'down', dialogue: dlg, alts: [] });
      } else {
        const n = h.npc, key = 'h_' + town + '_' + i + '_0_0';
        S[key] = n.lines.map(function (t) { const m = /^([^：]{1,8})：(.*)$/.exec(t); return { speaker: m ? m[1] : n.name, text: m ? m[2] : t }; });
        npcs.push({ id: id + '_n0', name: n.name, sprite: n.sprite, x: SLOTS[0][0] + (big ? 1 : 0), y: SLOTS[0][1], dir: 'down', dialogue: key, alts: [] });
        if (h.chest) objects.push(Object.assign({ type: 'chest', x: w - 2, y: 1 }, h.chest));
      }
      nm[id] = { name: h.name, tiles: rows, start: { x: dx, y: ht - 2, dir: 'up' },
        warps: [{ x: dx, y: ht - 1, to: town, tx: ds[0][0], ty: ds[0][1] + 1, dir: 'down' }].concat(ds.length > 1 ? [{ x: dx + 1, y: ht - 1, to: town, tx: ds[1][0], ty: ds[1][1] + 1, dir: 'down' }] : []),
        npcs: npcs, objects: objects };
      ds.forEach(function (d) { tm.warps.push({ x: d[0], y: d[1], to: id, tx: dx, ty: ht - 2, dir: 'up' }); });
    });
  });

  // ================= 找空地放人 =================
  const solid = {}; D.solidTiles.forEach(function (t) { solid[t] = 1; });
  const walk = function (m, x, y) { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid[D.legend[ch]]; };
  const SOLIDOBJ = { chest: 1, torch: 1, bones: 1, statue: 1, tablet: 1, urn: 1, spring: 1, lever: 1, gate: 1, save: 1 };
  const blockedSet = function (m, withNpc) {
    const b = {};
    (m.objects || []).forEach(function (o) { if (SOLIDOBJ[o.type]) b[o.x + ',' + o.y] = 1; });
    if (withNpc) (m.npcs || []).forEach(function (n) { b[n.x + ',' + n.y] = 1; });
    return b;
  };
  const bfs = function (m, from, blocked) {
    const dist = {}; dist[from.x + ',' + from.y] = 0; const q = [[from.x, from.y]];
    while (q.length) {
      const c = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        const nx = c[0] + d[0], ny = c[1] + d[1], key = nx + ',' + ny;
        if (dist[key] !== undefined || !walk(m, nx, ny) || blocked[key]) return;
        dist[key] = dist[c[0] + ',' + c[1]] + 1; q.push([nx, ny]);
      });
    }
    return dist;
  };
  const spotNear = function (mapId, hx, hy) {
    const m = nm[mapId], blocked = blockedSet(m, true), dist = bfs(m, m.start, blockedSet(m, false)), bad = [];
    (m.warps || []).forEach(function (w) { bad.push([w.x, w.y]); }); (m.npcs || []).forEach(function (n) { bad.push([n.x, n.y]); }); (m.objects || []).forEach(function (o) { bad.push([o.x, o.y]); });
    let best = null;
    Object.keys(dist).forEach(function (k) {
      const p = k.split(','), x = +p[0], y = +p[1], ch = m.tiles[y][x];
      if (ch !== 'g' && ch !== ',' && ch !== '.') return;
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!walk(m, x + d[0], y + d[1]) || blocked[(x + d[0]) + ',' + (y + d[1])]) return;
      if (bad.some(function (b) { return Math.abs(b[0] - x) + Math.abs(b[1] - y) < 3; })) return;
      const dd = Math.abs(x - hx) + Math.abs(y - hy);
      if (!best || dd < best.d) best = { x: x, y: y, d: dd };
    });
    if (!best) throw new Error('no spot ' + mapId);
    return best;
  };
  const P = function (map, id, name, sprite, hx, hy, dir, extra) {
    const sp = spotNear(map, hx, hy);
    nm[map].npcs.push(Object.assign({ id: id, name: name, sprite: sprite, x: sp.x, y: sp.y, dir: dir || 'down', dialogue: id }, extra || {}));
  };
  const L = function (key, who, lines) { S[key] = lines.map(function (l) { return typeof l === 'string' ? { speaker: who, text: l } : l; }); };

  // ================= 通往第六章的關門（世界5 → 世界6） =================
  (function () {
    const w5 = nm.world5, y = 51, x5 = 78;
    for (let x = 61; x < x5; x++) { const ch = w5.tiles[y][x]; if ('gYM~Ta,.'.indexOf(ch) >= 0) w5.tiles[y] = w5.tiles[y].slice(0, x) + ',' + w5.tiles[y].slice(x + 1); }
    w5.tiles[y] = w5.tiles[y].slice(0, x5) + 'P' + w5.tiles[y].slice(x5 + 1);
    w5.warps.push({ x: x5, y: y, to: 'world6', tx: 3, ty: 24, dir: 'right', need: 'ch6_xushu_rec', deny: 'ch6_sealed' });
    L('ch6_sealed', '', [{ speaker: '', text: '襄陽以東是通往南陽盆地的大路。劉備還沒打聽到臥龍岡的方位，貿然上路，只會在荊州的山裡繞圈子。' }]);
  })();
  Object.assign(D.worldBackfill, { fancheng: 'ch6_xushu_rec', longzhong: 'ch6_xushu_rec', shuijing: 'ch6_xushu_rec' });

  // ================= 新野：徐庶 =================
  P('xinye', 'xy_xushu', '徐庶', 70, 14, 12, 'down', { dialogue: 'c6_xushu', showIf: 'ch5_end', hideIf: 'ch6_xushu_rec' });
  L('c6_xushu', '徐庶', [
    { speaker: '', text: '新野城中，一位穿舊布衣、腰間掛著一把舊劍的讀書人，正在牆邊讀一卷竹簡。' },
    '劉皇叔留步。在下潁川徐元直，在新野等了皇叔好些日子。',
    { speaker: '劉備', text: '先生是……？' },
    '少年時替朋友報仇，殺過人，披髮塗面逃命，後來改名換姓，棄劍讀書。如今天下將亂，想找一位值得追隨的主公。',
    { speaker: '張飛', text: '大哥，這先生的劍看起來有一股殺氣。' },
    '張將軍好眼力。劍還在，只是這幾年多半拿來切菜。',
    { speaker: '諸葛貓妖', text: '（喵……徐庶。演義裡他「走馬薦諸葛」，是三顧茅廬的前奏。我現在站在這段故事的入口。）' },
    { speaker: '劉備', text: '先生若願同行，備求之不得。' },
    '在下願隨皇叔。不過有一事相告：隆中臥龍岡，有一位年輕人，才學勝我十倍。我是螢火，他是皓月。',
    { speaker: '劉備', text: '世上竟有這樣的人？先生何不請他一同來？' },
    '此人可就見，不可屈致。皇叔須親自去拜訪，而且不會只一次。',
    { speaker: '諸葛貓妖', text: '（……喵。我的名字，原來是借來的。我有一點緊張。）' },
    { speaker: '劉備', text: '好。備擇日，親往臥龍岡。', set: { ch6_xushu_rec: true }, act: { recruit: 'xushu' } },
    { speaker: '', text: '【徐庶加入隊伍。目標：越過襄陽以東的關門，前往隆中。】' }
  ]);
  S.ch6_note = [{ speaker: '', text: '【第六章前半　三顧茅廬　完】（博望坡之戰與新野守城，將在後續版本登場。）' }];

  // ================= 樊城 =================
  P('fancheng', 'fc_sunqian', '孫乾', 10, 12, 10, 'down', { dialogue: 'c6_sunqian0', alts: [{ flag: 'ch6_fast', dialogue: 'c6_sunqian2' }, { flag: 'ch6_v2', dialogue: 'c6_sunqian1' }] });
  L('c6_sunqian0', '孫乾', ['皇叔，樊城雖小，卻是荊州的北門。曹操的人馬要南下，第一站就是這裡。', '至於臥龍岡的先生……我也只聽過名字，沒見過人。']);
  L('c6_sunqian1', '孫乾', [
    '皇叔二次登門，又沒見到先生？',
    { speaker: '張飛', text: '大哥，這人架子也太大了！俺去叫他出來，一嗓子的事！' },
    { speaker: '劉備', text: '三弟，不可無禮。（對孫乾）公祐，備下次該怎麼去？' },
    '古人求賢，要先齋戒沐浴，擇個吉日，誠心而往。皇叔三日之後再去，禮數最足。',
    { speaker: '關羽', text: '二哥我……陪兄長一同去。', set: { ch6_fast: true } },
    { speaker: '', text: '【目標：再訪隆中，登門拜訪諸葛亮。】' }
  ]);
  L('c6_sunqian2', '孫乾', ['皇叔，吉日已擇，齋戒也做足了。這一趟，一定能見到先生。']);
  P('fancheng', 'fc_jianyong', '簡雍', 9, 17, 12, 'left', { dialogue: 'c6_jianyong' });
  L('c6_jianyong', '簡雍', ['當年我跟著皇叔在涿縣賣草鞋，皇叔說：「總有一天要做大事。」我說：「那得先把草鞋賣完。」', '事到如今，草鞋沒賣完，大事倒真的來了。']);
  P('fancheng', 'fc_scout', '探子', 7, 8, 14, 'right', { dialogue: 'c6_fcscout' });
  L('c6_fcscout', '探子', ['北邊的消息：曹軍在許都集結，帶頭的好像是夏侯惇。聽說他一隻眼睛，看人比別人兩隻眼睛還兇。', '不過這些事都歸皇叔和軍師們煩惱，我只負責跑腿。']);

  // ================= 水鏡莊：司馬徽 =================
  nm.shuijing_h0.npcs[0].dialogue = 'h_shuijing_0_0_0';   // 正堂學生：維持原樣
  P('shuijing', 'sj_sima', '司馬徽', 10, 12, 10, 'down', { dialogue: 'c6_sima0', alts: [{ flag: 'ch6_shui', dialogue: 'c6_sima2' }, { flag: 'ch6_v1', dialogue: 'c6_sima1' }] });
  L('c6_sima0', '司馬徽', [{ speaker: '', text: '水鏡莊前，一位白髮老者正蹲在地上，給一株小松樹澆水。' }, '好，好。年輕人，今天天氣不錯。', { speaker: '劉備', text: '先生，備想請教……' }, '好，好。先把茶喝了再說。']);
  L('c6_sima1', '司馬徽', [
    { speaker: '劉備', text: '水鏡先生，備往臥龍岡拜訪孔明，兩度……不，頭一回，沒見到人。先生可知他的去處？' },
    '好，好。',
    { speaker: '張飛', text: '這老頭除了「好」還會說別的嗎？' },
    '好。……伏龍、鳳雛，兩人得一，可安天下。',
    { speaker: '劉備', text: '先生說的伏龍，便是孔明？' },
    '好，好。孔明這個人，不愛見客，愛見誠心的客。皇叔，改日再去，風雪也要去。',
    { speaker: '諸葛貓妖', text: '（……喵，他到底只說了「好」，還是什麼都說了？）', set: { ch6_shui: true } },
    { speaker: '', text: '【目標：再訪隆中。這一次，天會下雪。】' }
  ]);
  L('c6_sima2', '司馬徽', ['好，好。皇叔，記得穿暖一點。風雪裡訪友，是一件很風雅的事，也是一件很冷的事。', { speaker: '司馬徽', text: '好。（遞上一枚玉佩）這個送給貓先生。', act: { once: 'got_sj_charm', gear: ['sj_charm'] } }]);

  // ================= 隆中：三顧 =================
  const lz = nm.longzhong;
  // 草廬：孔明（第三次才在）
  (function () {
    const h = nm.longzhong_h0;
    h.npcs = [{ id: 'lz_zhuge', name: '諸葛亮', sprite: 71, x: 6, y: 3, dir: 'down', dialogue: 'c6_zhuge', showIf: 'ch6_fast', hideIf: 'ch6_zhuge_join' }];
    h.objects = [{ type: 'tablet', x: 8, y: 1, text: '草廬壁上掛著一幅字：「非淡泊無以明志，非寧靜無以致遠。」字跡清瘦，像是有人寫的時候，一直沒睡著。' }];
  })();
  P('longzhong', 'lz_boy', '童子', 7, 12, 13, 'down', { dialogue: 'c6_tz1', showIf: 'ch6_xushu_rec', alts: [
    { flag: 'ch6_zhuge_join', dialogue: 'c6_tz6' }, { flag: 'ch6_fast', dialogue: 'c6_tz5' }, { flag: 'ch6_v2', dialogue: 'c6_tz4' }, { flag: 'ch6_shui', dialogue: 'c6_tz3' }, { flag: 'ch6_v1', dialogue: 'c6_tz2' }] });
  L('c6_tz1', '童子', [
    { speaker: '', text: '草廬前，一個梳著雙髻的童子正在掃地，掃得很慢，像是在等什麼人來把他叫停。' },
    { speaker: '劉備', text: '漢左將軍、宜城亭侯、豫州牧、皇叔劉備，特來拜見諸葛先生。' },
    '……這麼長的名字，我記不住。先生？先生不在。',
    { speaker: '劉備', text: '敢問先生往何處去了？' },
    '或駕小舟遊於江湖之中，或訪僧道於山嶺之上，或尋朋友於村落，或樂琴棋於洞府之中。往來莫測，不知去向。',
    { speaker: '張飛', text: '那不就是「不知道」嗎？' },
    '是。',
    { speaker: '諸葛貓妖', text: '（……喵。他回答得跟背台詞一樣。）', set: { ch6_v1: true } },
    { speaker: '', text: '【第一次拜訪撲空。路上似乎有人在談天說地……】' }
  ]);
  L('c6_tz2', '童子', ['先生還沒回來。回不回來，也不好說。……您要不先去別的地方走走？水鏡莊的先生，聽說跟我家先生很熟。']);
  L('c6_tz3', '童子', [
    { speaker: '', text: '北風捲著雪花，童子裹著一件大棉襖，在草廬前跺腳。' },
    '又是您啊皇叔。先生……先生前天回來過一趟，今天一早，又被朋友叫出去了。',
    { speaker: '張飛', text: '又不在？俺看他是故意躲俺們！' },
    '張將軍，您別凶，先生真的出門了。……他留了話：若是皇叔來了，請在隆中走走，先生的弟弟和岳父在附近。',
    { speaker: '諸葛貓妖', text: '（喵，雪下這麼大，卻不見先生……他是真的不在，還是真的在，只是還沒準備好見我們？）', set: { ch6_v2: true } },
    { speaker: '', text: '【第二次拜訪撲空。可以去跟隆中的諸葛均、黃承彥聊聊，再回樊城商量第三次。】' }
  ]);
  L('c6_tz4', '童子', ['先生還是不在。皇叔三請不見，下一次，也許該先回樊城，跟孫先生商量商量。']);
  L('c6_tz5', '童子', ['噓……先生在草堂裡午睡。皇叔請輕一點，千萬別吵醒他，他起床氣很大。']);
  L('c6_tz6', '童子', ['先生走了，我就剩這把掃帚了。……皇叔，替我跟先生說，院子我會替他掃乾淨。']);
  // 崔州平：第一次拜訪後，路上遇到
  P('longzhong', 'lz_cui', '崔州平', 6, 8, 12, 'down', { dialogue: 'c6_cui', showIf: 'ch6_v1', hideIf: 'ch6_cui_down' });
  L('c6_cui', '崔州平', [
    { speaker: '', text: '隆中路旁，一位戴著斗笠的讀書人坐在石頭上，正對著一盤沒有棋子的棋盤發呆。' },
    '貴客是來找孔明的吧？在下崔州平，孔明的朋友。他不在家，我知道。',
    { speaker: '劉備', text: '先生可知天下大勢？' },
    '天下大勢，治久必亂，亂久必治。如今正是亂世之始，皇叔想要拿一個「治」字，恐怕有點早。',
    { speaker: '劉備', text: '備只想為百姓，做一點事。' },
    '好。那就請皇叔先把這個麻煩解決。……山路後面，有一夥人，剛剛在搶我的棋盤。',
    { speaker: '諸葛貓妖', text: '（喵，棋盤也搶？這夥山賊的目標好像不太遠大。）', act: { battle: 'ch6_bandit', flag: 'ch6_cui_down', after: 'c6_cui_after' } }
  ]);
  L('c6_cui_after', '崔州平', [
    '好身手。皇叔，您想找孔明，我只能說：他在，您就來得及；他不在，您就等得起。',
    { speaker: '', text: '（獲得白羽綸巾扇、金 5000。）', act: { gold: 5000, gear: ['lz_fan'] } },
    { speaker: '諸葛貓妖', text: '（喵，崔州平……歷史上他是孔明的朋友，跟孔明一樣不願出仕。他們兩個大概是用「不當官」互相取暖的。）' }
  ]);
  // 諸葛均、黃承彥：第二次拜訪之後
  P('longzhong', 'lz_jun', '諸葛均', 8, 15, 11, 'down', { dialogue: 'c6_jun', showIf: 'ch6_shui', hideIf: 'ch6_zhuge_join' });
  L('c6_jun', '諸葛均', [
    '客人是皇叔？家兄……家兄去訪友了。其實我也不知道他去哪兒了，反正他走的時候，帶了一卷書和一把扇子。',
    { speaker: '劉備', text: '令兄是怎麼樣的人？' },
    '家兄這人……睡得很晚，起得更晚。嘴巴裡常說「管仲、樂毅」，手上卻在算怎麼種地更省力。我覺得他志向不小，本事也不小，就是脾氣有一點懶。',
    { speaker: '諸葛貓妖', text: '（喵，這個形容，居然跟我有點像。）' }
  ]);
  P('longzhong', 'lz_huang', '黃承彥', 6, 10, 15, 'right', { dialogue: 'c6_huang', showIf: 'ch6_shui', hideIf: 'ch6_zhuge_join' });
  L('c6_huang', '黃承彥', [
    '老夫黃承彥，是孔明的岳父。孔明他啊，娶我女兒，是我女兒挑的他。我女兒說：「我聽說他在找媳婦，我又醜又聰明，剛好。」',
    { speaker: '張飛', text: '你女兒真有種！' },
    '哈哈，是有種。孔明那孩子，晴天讀書，雨天讀書，下雪天也讀書。皇叔想見他，記得一件事——他睡著的時候，叫不醒；醒著的時候，攔不住。',
    { speaker: '', text: '（獲得隆中鶴氅。）', act: { once: 'got_lz_robe', gear: ['lz_robe'] } }
  ]);
  // 三顧：孔明
  L('c6_zhuge', '諸葛亮', [
    { speaker: '', text: '草堂內，一位青年枕著書卷，睡得正香。劉備站在階下，一動不動。關羽在後面端著手，張飛的臉越來越黑。' },
    { speaker: '張飛', text: '大哥！他睡得比豬還香！俺去後面放把火，看他起不起來！' },
    { speaker: '關羽', text: '三弟，不可無禮。' },
    { speaker: '', text: '（過了很久……）' },
    { speaker: '諸葛亮', text: '（吟）大夢誰先覺？平生我自知。草堂春睡足，窗外日遲遲。' },
    { speaker: '諸葛亮', text: '……有客來了？童子，為何不叫我？' },
    { speaker: '劉備', text: '先生，備劉備，漢室宗親，三度來訪，只為請教天下大計。' },
    { speaker: '諸葛亮', text: '（看向貓妖，微微一怔）……這位朋友，你的名字，很熟。' },
    { speaker: '諸葛貓妖', text: '（喵……他在看我。像是在看一面鏡子。）' },
    { speaker: '劉備', text: '漢室傾頹，奸臣竊命，備欲伸大義於天下，而智術淺短，至今未成。願先生賜教。' },
    { speaker: '諸葛亮', text: '自董卓造逆以來，天下豪傑並起，跨州連郡者不可勝數。曹操比於袁紹，名微而眾寡，然而曹操竟能克袁紹，以弱為強，非獨天時，亦是人謀。' },
    { speaker: '諸葛亮', text: '如今曹操已擁百萬之眾，挾天子以令諸侯，這一方，不可與爭鋒。孫權據有江東，已歷三世，國險而民附，賢能為之用，這一方，可以為援，不可圖也。' },
    { speaker: '諸葛亮', text: '荊州北據漢、沔，利盡南海，東連吳會，西通巴、蜀，是用武之國，而其主不能守。益州險塞，沃野千里，天府之土，劉璋闇弱，民殷國富而不知存恤。' },
    { speaker: '諸葛亮', text: '將軍既是帝室之胄，信義著於四海，若跨有荊、益，保其巖阻，西和諸戎，南撫夷越，外結好孫權，內修政理。天下有變，命一上將將荊州之軍以向宛、洛，將軍身率益州之眾出於秦川。如此，霸業可成，漢室可興矣。' },
    { speaker: '張飛', text: '……俺聽不懂。但他說的，好像很厲害。' },
    { speaker: '關羽', text: '三弟，你只要知道，兄長聽懂了，就夠了。' },
    { speaker: '劉備', text: '先生之言，使備茅塞頓開！備雖愚鈍，願以先生為師。先生若肯出山，備必以魚水之情待之！' },
    { speaker: '諸葛亮', text: '皇叔既三顧於草廬之中，亮豈敢不從？……只是，亮想先問皇叔一件事：若有一天，要在天下和百姓之間選一個，皇叔選哪一個？' },
    { speaker: '劉備', text: '百姓。' },
    { speaker: '諸葛亮', text: '那亮，就陪皇叔走這一遭。……（轉向貓妖）這位朋友，你也一起來吧。我昨夜夢見一隻貓，在我的書架上翻書，翻到最後一頁，卻是空白的。' },
    { speaker: '諸葛貓妖', text: '（……喵。他不知道，那一頁是我。）' },
    { speaker: '', text: '（諸葛亮收拾書卷，將草廬託付給弟弟諸葛均，隨劉備一行下山。）', set: { ch6_zhuge_join: true }, act: { recruit: 'zhugeliang' } },
    { speaker: '', text: '【諸葛亮加入隊伍！】' },
    { speaker: '', text: '【第六章前半　三顧茅廬　完】（博望坡之戰、新野守城，將在後續版本登場。）' }
  ]);

  // ================= 主線任務 =================
  D.mainQuest.push(
    { done: 'ch6_xushu_rec', title: '第六章：回新野，聽徐庶推薦臥龍岡的先生', world: 'world5', to: 'xinye', where: '新野', hint: '新野在第五章大地圖南邊。徐庶站在城中，需先聽過牧童唱歌。' },
    { done: 'ch6_v1', title: '越過襄陽東邊的關門，到隆中拜訪諸葛亮', world: 'world6', to: 'longzhong', where: '隆中', hint: '襄陽東邊有一扇關門，過了就是第六章的大地圖。隆中在大地圖西南，童子在草廬前。' },
    { done: 'ch6_shui', title: '到水鏡莊，向司馬徽請教', world: 'world6', to: 'shuijing', where: '水鏡莊', hint: '水鏡莊在大地圖東南。司馬徽在莊前澆松樹。' },
    { done: 'ch6_v2', title: '再訪隆中（風雪中的第二次）', world: 'world6', to: 'longzhong', where: '隆中', hint: '見過司馬徽之後，再找隆中的童子。' },
    { done: 'ch6_fast', title: '回樊城，找孫乾商量第三次拜訪', world: 'world6', to: 'fancheng', where: '樊城', hint: '樊城在大地圖北邊。孫乾站在城中。' },
    { done: 'ch6_zhuge_join', title: '三顧臥龍岡，請孔明出山', world: 'world6', to: 'longzhong', where: '隆中（草廬）', hint: '進入隆中村子裡最靠西的草廬，孔明在裡面午睡。' }
  );
  D.mainQuestEnd = '第六章前半已完成，諸葛亮加入。博望坡之戰與新野守城，將在後續版本登場。';
})();
