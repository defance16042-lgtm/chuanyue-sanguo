// 第五章 批次2：三座村莊（延壽村、博望村、漢水渡村）、兩座洞穴（江夏水寨洞、博望山洞）、四條支線與兵書《墨子》
// 洞穴地圖在 data/ch5caves.js、村莊地圖在 data/ch5world.js（都由 tools/build_ch5.py 產生）。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue, nm = D.maps, en = B.enemies;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  const sold = function (n, t) { return [{ speaker: n, text: t }]; };

  // ================= 洞穴頭目 =================
  en.zhangwu = { name: '張武', terrain: T('B', 'B', 'A', 'C'), int: 36, lead: 56, luck: 10, title: '江夏水賊首領', cls: '山賊將', weapon: '刀', desc: '江夏一帶的水賊頭子，占著水寨洞，專劫長江上的商船。後來被趙雲一槍刺落馬下，奪回了劉備的坐騎。', hp: 28000, atk: 200, def: 86, spd: 22, exp: 9600, gold: 6400, sprite: 47, boss: true, ai: 'boss' };
  en.chensun = { name: '陳孫', terrain: T('B', 'B', 'A', 'C'), int: 40, lead: 54, luck: 10, title: '荊北山賊首領', cls: '山賊將', weapon: '槍', desc: '和張武一夥的山賊，占著博望山的洞穴。他們搶了一匹白色的馬，不知道那匹馬的主人是誰，也不知道馬的主人有多少兄弟。', hp: 54000, atk: 218, def: 104, spd: 20, exp: 10400, gold: 7000, sprite: 19, boss: true, ai: 'boss' };
  B.groups.cave10boss = [['zhangwu'].concat(B.groups.field17[0].slice(0, 4))];
  B.groups.cave11boss = [['chensun'].concat(B.groups.field17[0].slice(0, 4))];
  B.groups.cave10g1 = [B.groups.field17[0].slice(0, 4)]; B.groups.cave10g2 = [B.groups.field17[0].slice(0, 5).reverse()];
  B.groups.cave11g1 = [B.groups.field17[1].slice(0, 4)]; B.groups.cave11g2 = [B.groups.field17[1].slice(0, 5).reverse()];
  const GENS = [
    { k: 'cave10', boss: 'zhangwu', field: 'field17', title: '江夏水賊將領', where: '江夏水寨洞', names: ['周倉的舊部', '水寨二當家', '浪裡白條'], sprites: [3, 12, 19], atk: 160, def: 72, spd: 19,
      says: ['水寨洞的水位漲了，你們的腳最好抬高一點。……不然，連人帶鞋，一起泡。', '二當家我不愛說話，只愛揍人。你們有什麼遺言，快說。', '浪裡白條是我的名，水裡我最行。可惜這是洞裡，你們走運了。'] },
    { k: 'cave11', boss: 'chensun', field: 'field17', title: '荊北山賊將領', where: '博望山洞', names: ['獨眼龍', '山大王的軍師', '飛天鼠'], sprites: [12, 3, 19], atk: 164, def: 74, spd: 18,
      says: ['博望山的洞，是我們山大王的家。你們進來，問過我的刀沒有？', '我是軍師。軍師的意思是：我動腦，你們動手挨打。', '飛天鼠不是鼠，是飛，飛過你們的頭頂，再回頭刺你們屁股。'] }
  ];
  const FRAC = [0.22, 0.32, 0.45];
  GENS.forEach(function (g) {
    const bs = en[g.boss];
    g.names.forEach(function (nmn, i) {
      const id = 'gen_' + g.k + (i ? '_' + (i + 1) : '');
      en[id] = { name: nmn, terrain: T('B', 'B', 'A', 'C'), int: 26, lead: 36, luck: 8, title: g.title, cls: '將領', weapon: '刀', desc: '鎮守' + g.where + '的將領，兵多將廣，比尋常守衛難纏得多。',
        hp: Math.round(bs.hp * FRAC[i] / 10) * 10, atk: g.atk, def: g.def, spd: g.spd, exp: Math.round(bs.exp * FRAC[i]), gold: Math.round(bs.gold * FRAC[i]), sprite: g.sprites[i], boss: true, ai: 'boss' };
      B.groups[id] = [[id].concat(B.groups[g.field][0].slice(0, 4))];
      S[id] = [{ speaker: nmn, text: g.says[i] }, { speaker: '', text: nmn + '擺開架勢，身後的兵卒也圍了上來。', act: { battle: id, flag: id + '_down', after: id + '_after' } }];
      S[id + '_after'] = [{ speaker: nmn, text: '……好身手。算我技不如人，路給你們讓開。' }];
    });
  });
  ['zhangwu', 'chensun'].forEach(function (id) { D.terrainHome[id] = 'mountain'; });
  GENS.forEach(function (g) { g.names.forEach(function (_, i) { D.terrainHome['gen_' + g.k + (i ? '_' + (i + 1) : '')] = 'mountain'; }); });
  Object.keys(en).filter(function (k) { return /^(zhangwu|chensun|gen_cave1[01])/.test(k); }).forEach(function (k) { D.applyTerrain(k, en[k], true); });

  // ================= 裝備、道具、兵書 =================
  Object.assign(E, {
    jx_helm: { name: '江夏水寨盔', slot: 'helm', mods: { def: 16, grd: 6, lead: 3 }, price: 0, desc: '水賊的鐵盔，內襯塞著防潮的蘆葦，戴起來有一股魚腥味，卻特別結實。' },
    jx_boots: { name: '踏浪靴', slot: 'boots', mods: { spd: 10, def: 5 }, price: 0, desc: '江夏水賊穿的靴子，鞋底有三道防滑紋，走在濕漉漉的船板上不會滑倒。' },
    jx_jade: { name: '江夏水符', slot: 'charm', mods: { int: 11, lead: 7, luck: 4 }, price: 0, desc: '水寨洞深處的玉符，握著它，彷彿聽得見長江的浪聲。' },
    zhangwu_blade: { name: '張武水寨刀', slot: 'weapon', wtype: '刀', mods: { pow: 94, spd: 1 }, price: 0, desc: '張武的環首刀，刀背上刻著長江水位的標記。' },
    bw_spear: { name: '博望長槍', slot: 'weapon', wtype: '槍', mods: { pow: 96, spd: 1 }, price: 0, desc: '博望山賊用的長槍，槍纓是一撮白色的馬鬃。' },
    bw_cloak: { name: '博望山披風', slot: 'armor', mods: { def: 35, spd: 1 }, price: 0, desc: '山洞裡縫的厚披風，內裡縫了兩層羊皮，擋風，也擋刀。' },
    bw_charm: { name: '博望符', slot: 'charm', mods: { lead: 10, grd: 5, luck: 5 }, price: 0, desc: '博望山洞的信物，據說帶著它，荊北的山賊都會讓你三分。' },
    q_tian_helm: { name: '田豐諫盔', slot: 'helm', mods: { def: 17, grd: 7, lead: 3 }, price: 0, desc: '田豐舊部送的頭盔，盔裡藏著一張小紙條，寫著：「忠言逆耳，頭盔護頭。」' },
    q_grain_armor: { name: '運糧衛鐵甲', slot: 'armor', mods: { def: 37, lead: 2 }, price: 0, desc: '運糧小隊護衛長的鐵甲，每一片甲片都被他擦得亮晶晶，像怕糧車看不見他。' },
    q_xu_charm: { name: '許攸家書符', slot: 'charm', mods: { int: 9, lead: 10, luck: 4 }, price: 0, desc: '許攸家人轉託的護身符，布面上繡著「歸」字，針腳歪歪斜斜。' }
  });
  D.drops.zhangwu = ['zhangwu_blade', 1.0];
  B.items.relic_tianfeng = { name: '田豐舊簡', desc: '田豐在獄中批注的竹簡，被藏在江夏水寨洞，要交還給田豐的舊部。', price: 0, quest: true };
  B.items.relic_xuyou = { name: '許攸家書', desc: '許攸家人被劫走的家書，藏在博望山洞，要交給襄陽的許攸舊友。', price: 0, quest: true };
  B.items.relic_flute = { name: '牧童的竹笛', desc: '新野牧童被山賊搶走的竹笛，藏在江夏水寨洞，要還給他。', price: 0, quest: true };
  // 兵書《墨子》：非攻、守城。全隊防禦大幅提高（既有五本兵書都是攻擊類）
  B.skills.mo_shou = { name: '墨子・守城', tp: 8, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.6, turns: 4, fx: 'up_b' };
  B.bookSkills.mo = 'mo_shou'; B.bookNames.mo = '墨子';

  // ================= 洞穴的對話 =================
  S.cave10_g1 = [{ speaker: '水寨哨兵', text: '站住！這是水寨洞，外人不准進！' }, { speaker: '關羽', text: '讓開。', act: { battle: 'cave10g1', flag: 'cave10_g1_down', after: 'cave10_g1_after' } }];
  S.cave10_g1_after = sold('水寨哨兵', '……過去吧。裡面的人，可沒我這麼好說話。');
  S.cave10_g2 = [{ speaker: '洞中頭目', text: '再往裡走，就是張大王的水寨了。想過去，先問我手裡的刀。' }, { speaker: '張飛', text: '俺老張今天，專門來問刀！', act: { battle: 'cave10g2', flag: 'cave10_g2_down', after: 'cave10_g2_after' } }];
  S.cave10_g2_after = sold('洞中頭目', '……你們贏了。大王在最深處。');
  S.cave10_sp = [{ speaker: '逃出來的漁民', text: '我是江夏打魚的，水寨洞的人搶了我的船，還讓我幫他們數錢。數了三天，一枚也沒讓我留。' },
    { speaker: '逃出來的漁民', text: '這點藥草是我趁他們睡覺偷的，給你們帶著吧。要是見到張武，替我問他：我的船，什麼時候還？', choices: [{ label: '收下藥草', act: { give: { herb3: 3, tonic3: 2 }, once: 'cave10_sp_done' } }, { label: '不用了' }] }];
  S.cave10_sp_after = sold('逃出來的漁民', '長江水深，人心難測。你們小心。');
  S.cave10_boss = [
    { speaker: '張武', text: '終於來人了。我張武在江夏水寨，劫過的船，比你們見過的都多。' },
    { speaker: '劉備', text: '張壯士，長江上的商旅只想平安過江，你何必斷人生路？' },
    { speaker: '張武', text: '生路？我自己的生路也是搶來的。你們要走，就從我身上跨過去。' },
    { speaker: '諸葛貓妖', text: '……喵，他不知道，將來他會被一個穿白袍的人，一槍挑下馬。我要不要先提醒他一聲？' },
    { speaker: '張武', text: '貓在嘀咕什麼？看刀！', act: { battle: 'cave10boss', flag: 'cave10_down', after: 'cave10_after' } }];
  S.cave10_after = [
    { speaker: '張武', text: '……我輸了。長江的水，今天特別涼。' },
    { speaker: '關羽', text: '張壯士，刀法不錯，可惜用錯了地方。' },
    { speaker: '張武', text: '地方是自己選的……你們走吧。' }];
  S.cave11_g1 = [{ speaker: '山洞哨兵', text: '站住！這是博望山洞，山大王的地盤！' }, { speaker: '關羽', text: '讓開。', act: { battle: 'cave11g1', flag: 'cave11_g1_down', after: 'cave11_g1_after' } }];
  S.cave11_g1_after = sold('山洞哨兵', '……進去吧。山大王不太好說話。');
  S.cave11_g2 = [{ speaker: '洞中小頭目', text: '再往裡走，就是陳大王的大廳了。你們想幹什麼？' }, { speaker: '張飛', text: '來問你們大王要一封家書！', act: { battle: 'cave11g2', flag: 'cave11_g2_down', after: 'cave11_g2_after' } }];
  S.cave11_g2_after = sold('洞中小頭目', '……你們贏了。大王就在前面。');
  S.cave11_sp = [{ speaker: '採藥的老人', text: '我在博望山採了一輩子藥，山洞裡有一群人，把山路封了，連我的藥簍都收走。' },
    { speaker: '採藥的老人', text: '這點藥草是我藏的，給你們帶著吧。要是見到陳孫，替我說一句：藥簍可以不還，山路，請讓開。', choices: [{ label: '收下藥草', act: { give: { herb3: 3, tonic3: 3 }, once: 'cave11_sp_done' } }, { label: '不用了' }] }];
  S.cave11_sp_after = sold('採藥的老人', '博望山的風大，山洞裡的人火氣更大。你們小心。');
  S.cave11_boss = [
    { speaker: '陳孫', text: '終於有人找到博望山洞了。我陳孫在荊北，劫過路，也劫過一匹白馬。' },
    { speaker: '劉備', text: '陳壯士，我們此來，是想取回一封被劫走的家書，還請高抬貴手。' },
    { speaker: '陳孫', text: '家書？我不識字。我留著它，是因為紙很白，拿來糊窗戶正好。' },
    { speaker: '諸葛貓妖', text: '……喵，那是一個人想回家的心願，不是窗戶紙。' },
    { speaker: '陳孫', text: '囉嗦！打贏我再說！', act: { battle: 'cave11boss', flag: 'cave11_down', after: 'cave11_after' } }];
  S.cave11_after = [
    { speaker: '陳孫', text: '……輸了。家書在洞裡的箱子裡，自己去拿吧。' },
    { speaker: '陳孫', text: '你們若是見到那匹白馬的主人，就說陳孫……記得那一槍。' }];

  // ================= 村莊 =================
  // ================= 村莊 =================
  const SLOTS = [[3, 2]];
  const innLines = function (who, hello) { return [{ speaker: who, text: hello, choices: [{ label: '住宿 30金', act: { rest: true } }, { label: '不住了' }] }]; };
  const vShop = function (town, name, keeper) {
    const id = town + '_general';
    D.shopKinds[id] = 'general'; D.shopNames[id] = name; D.shops[id] = D.shops.medic4;
    S['shop_' + id] = [{ speaker: keeper, text: '這裡是' + name + '，藥品和雜貨都有。多備幾包藥，保命用。', choices: [{ label: '看看', act: { shop: id } }, { label: '不用了' }] }];
    return id;
  };
  const VHOUSES = {
    yanshou: [
      { name: '延壽老書生的家', size: 'small', chest: { id: 'h_ys_a', gold: 1800, item: { herb3: 2, tonic3: 2 }, msg: '書架背後有個小木箱，裡面是一袋留給學生的銀子。' },
        npc: { name: '老書生', sprite: 10, lines: ['老書生：北邊的酸棗，二十年前，十八路諸侯在這裡歃血為盟，要討董卓。', '老書生：酒喝了，牛殺了，盟約也立了。結果呢？沒人肯先出兵。……你說，這叫什麼盟？'] } },
      { kind: 'general', name: '延壽雜貨店', keeper: '掌櫃', sprite: 4 },
      { kind: 'inn', id: 'inn', size: 'big', name: '延壽客棧', keeper: '掌櫃', sprite: 4, hello: '延壽客棧，當年諸侯們也住過隔壁那間。他們吵了一整晚，我一個字都沒聽懂。住一晚吧？' }
    ],
    bowang: [
      { name: '博望獵戶的家', size: 'small', chest: { id: 'h_bw_a', gold: 1700, item: { tonic3: 2, herb3: 2 }, msg: '獸皮底下壓著一小袋賣皮毛換來的錢。' },
        npc: { name: '博望獵戶', sprite: 8, lines: ['獵戶：博望坡這地方，樹多，路窄，風又大，最適合放火。', '獵戶：我常在想，哪天要是有大軍路過，被人一把火燒了，大概也不奇怪。……你們別往心裡去，我只是隨口說說。'] } },
      { kind: 'general', name: '博望雜貨店', keeper: '掌櫃', sprite: 4 },
      { kind: 'inn', id: 'inn', size: 'big', name: '博望客棧', keeper: '掌櫃', sprite: 4, hello: '博望客棧，晚上聽得見山風吹過樹梢，像有人在說悄悄話。住一晚吧。' }
    ],
    hanshui: [
      { name: '漢水擺渡人的家', size: 'small', chest: { id: 'h_hn_a', gold: 2000, msg: '船槳底下藏著一小袋渡河錢。' },
        npc: { name: '擺渡老嫗', sprite: 12, lines: ['老嫗：漢水的渡口，過去是荊襄最熱鬧的地方，現在只剩蔡家的巡船。', '老嫗：我家那口子撐了一輩子船，有一天說他看到一個年輕人，站在對岸，一動不動，望著襄陽的方向，像在等人。'] } },
      { kind: 'general', name: '漢水雜貨店', keeper: '掌櫃', sprite: 4 },
      { kind: 'inn', id: 'inn', size: 'big', name: '漢水客棧', keeper: '掌櫃', sprite: 4, hello: '漢水渡口的客棧，聽得見江水拍岸的聲音。住一晚吧，睡著了就聽不見了。' }
    ]
  };
  Object.keys(VHOUSES).forEach(function (town) {
    const tm = nm[town], doors = D.ch5Doors[town];
    VHOUSES[town].forEach(function (h, i) {
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
        else dlg = 'shop_' + vShop(town, h.name, h.keeper);
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


  // ================= 找空地放人（村莊與城鎮內的 NPC） =================
  const solid = {}; D.solidTiles.forEach(function (t) { solid[t] = 1; });
  const walk = function (m, x, y) { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid[D.legend[ch]]; };
  const SOLIDOBJ = { chest: 1, torch: 1, bones: 1, statue: 1, tablet: 1, urn: 1, spring: 1, lever: 1, gate: 1, save: 1 };
  function blockedSet(m, withNpc) {
    const b = {};
    (m.objects || []).forEach(function (o) { if (SOLIDOBJ[o.type]) b[o.x + ',' + o.y] = 1; });
    if (withNpc) (m.npcs || []).forEach(function (n) { b[n.x + ',' + n.y] = 1; });
    return b;
  }
  function bfs(m, from, blocked) {
    const dist = {}, prev = {}; dist[from.x + ',' + from.y] = 0; const q = [[from.x, from.y]];
    while (q.length) {
      const c = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        const nx = c[0] + d[0], ny = c[1] + d[1], key = nx + ',' + ny;
        if (dist[key] !== undefined || !walk(m, nx, ny) || blocked[key]) return;
        dist[key] = dist[c[0] + ',' + c[1]] + 1; prev[key] = c[0] + ',' + c[1]; q.push([nx, ny]);
      });
    }
    return { dist: dist, prev: prev };
  }
  // 戶外空地：地面是草地／道路、四周四格都能走、離門與其他人至少兩格，取離提示點最近的
  function spotNear(mapId, hx, hy) {
    const m = nm[mapId], blocked = blockedSet(m, true), r = bfs(m, m.start, blockedSet(m, false));
    const bad = []; (m.warps || []).forEach(function (w) { bad.push([w.x, w.y]); }); (m.npcs || []).forEach(function (n) { bad.push([n.x, n.y]); }); (m.objects || []).forEach(function (o) { bad.push([o.x, o.y]); });
    let best = null;
    Object.keys(r.dist).forEach(function (k) {
      const p = k.split(','), x = +p[0], y = +p[1], ch = m.tiles[y][x];
      if (ch !== 'g' && ch !== ',' && ch !== '.') return;
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!walk(m, x + d[0], y + d[1]) || blocked[(x + d[0]) + ',' + (y + d[1])]) return;
      if (bad.some(function (b) { return Math.abs(b[0] - x) + Math.abs(b[1] - y) < 3; })) return;
      const dd = Math.abs(x - hx) + Math.abs(y - hy);
      if (!best || dd < best.d) best = { x: x, y: y, d: dd };
    });
    if (!best) throw new Error('no spot ' + mapId);
    return best;
  }
  // 洞穴：箱子放在「周圍八格都能走」的房間空地
  function freeSpot(mapId) {
    const m = nm[mapId], blocked = blockedSet(m, true), r = bfs(m, m.start, blockedSet(m, false)), wp = {};
    (m.warps || []).forEach(function (w) { wp[w.x + ',' + w.y] = 1; });
    let best = null;
    Object.keys(r.dist).forEach(function (k) {
      const p = k.split(','), x = +p[0], y = +p[1];
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { if (!walk(m, x + dx, y + dy) || blocked[(x + dx) + ',' + (y + dy)] || wp[(x + dx) + ',' + (y + dy)]) return; }
      if (!best || r.dist[k] > best.d) best = { x: x, y: y, d: r.dist[k] };
    });
    return best;
  }
  function placeGen(mapId, genId, target) {
    const m = nm[mapId], blocked = blockedSet(m, true), r = bfs(m, m.start, blockedSet(m, false)), tk = target.x + ',' + target.y;
    const path = []; let cur = r.dist[tk] !== undefined ? tk : null;
    if (!cur) [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { const k2 = (target.x + d[0]) + ',' + (target.y + d[1]); if (r.dist[k2] !== undefined) { cur = k2; return true; } return false; });
    while (cur) { path.unshift(cur); cur = r.prev[cur]; }
    const wp = {}; (m.warps || []).forEach(function (w) { wp[w.x + ',' + w.y] = 1; });
    const near = function (x, y) { return Object.keys(blocked).some(function (k) { const p = k.split(','); return Math.abs(p[0] - x) + Math.abs(p[1] - y) <= 1; }) || Object.keys(wp).some(function (k) { const p = k.split(','); return Math.abs(p[0] - x) + Math.abs(p[1] - y) <= 1; }); };
    if (path.length < 4) throw new Error('placeGen path too short: ' + mapId + ' ' + genId);
    const start = Math.floor(path.length * 0.6);
    let pick = null;
    for (let d = 0; d < path.length && !pick; d++) {
      [start + d, start - d].some(function (i) { if (i < 2 || i >= path.length - 1) return false; const p = path[i].split(','); if (!near(+p[0], +p[1])) { pick = { x: +p[0], y: +p[1] }; return true; } return false; });
    }
    if (!pick) { const p = path[Math.max(2, start)].split(','); pick = { x: +p[0], y: +p[1] }; }
    const e = en[genId];
    m.npcs.push({ id: genId, name: e.name, sprite: e.sprite, x: pick.x, y: pick.y, dir: 'down', dialogue: genId, hideIf: genId + '_down' });
  }
  GENS.forEach(function (g) {
    [0, 1, 2].forEach(function (i) {
      const mapId = i ? g.k + '_' + (i + 1) : g.k, m = nm[mapId], gid = 'gen_' + g.k + (i ? '_' + (i + 1) : '');
      let target;
      if (i < 2) { const w = m.warps.find(function (w2) { return w2.to === g.k + '_' + (i + 2); }); target = { x: w.x, y: w.y }; }
      else { const bn = m.npcs.find(function (n) { return n.id === g.k + 'boss'; }); target = { x: bn.x, y: bn.y }; }
      placeGen(mapId, gid, target);
    });
  });


  // ---- 村莊裡的人
  const V = function (map, id, name, sprite, hx, hy, dir, lines, flagAlt) {
    const sp = spotNear(map, hx, hy);
    S['v_' + id] = lines.map(function (t) { return { speaker: name, text: t }; });
    const n = { id: id, name: name, sprite: sprite, x: sp.x, y: sp.y, dir: dir, dialogue: 'v_' + id };
    if (flagAlt) { S['v_' + id + '_2'] = flagAlt.lines.map(function (t) { return { speaker: name, text: t }; }); n.alts = [{ flag: flagAlt.flag, dialogue: 'v_' + id + '_2' }]; }
    nm[map].npcs.push(n);
  };
  V('yanshou', 'sz_farmer', '老農', 6, 10, 6, 'down', ['酸棗那塊「盟壇」的石頭，現在被我們拿來墊豬圈。……祖宗留下的東西，也是要實用的。']);
  V('yanshou', 'sz_trader', '行商', 10, 17, 12, 'left', ['南邊荊州一帶有兩個山洞，聽說裡面各住著一夥人。往東南走是水寨洞，往西邊走是博望山洞，兩個都不好惹。']);
  V('bowang', 'bw_shepherd', '牧羊人', 7, 13, 8, 'down', ['博望山的山洞，在大地圖的西邊，往新野走的路上。洞裡有人，晚上燈火很亮，白天卻沒人敢靠近。']);
  V('bowang', 'bw_kid', '孩童', 7, 6, 12, 'right', ['我聽說新野有個牧童，會吹一種很好聽的笛子。可是前陣子，他的笛子被山賊搶走了，他每天都在哭。']);
  V('hanshui', 'hs_boatman', '擺渡人', 9, 10, 6, 'down', ['漢水東邊有個山洞，洞裡的人專劫過江的船。我們撐船的，都不敢走夜路。']);
  V('hanshui', 'hs_fisher', '漁夫', 6, 17, 12, 'left', ['前幾天有個白衣書生站在對岸，一站就是半天。我問他在看什麼，他說：「等一個人，也許要等很久。」']);
  D.worldBackfill.yanshou = 'xuyou_join'; D.worldBackfill.bowang = 'caimao_down'; D.worldBackfill.hanshui = 'yuanshang_down';

  // ================= 支線 =================
  const c10 = freeSpot('cave10_2'), c11 = freeSpot('cave11_2'), c11a = freeSpot('cave11');
  const pickG = function (map, hx, hy) { return spotNear(map, hx, hy); };
  const g1 = pickG('liyangcheng', 13, 12), g2 = pickG('cangting', 12, 13), g3 = pickG('xiangyang', 11, 12), g4 = pickG('xinye', 14, 13);
  const SIDE = [
    { id: 'q17', kind: 'fetch', giver: 'liyangcheng', npc: { x: g1.x, y: g1.y, name: '田豐的舊部', sprite: 12 }, chest: { map: 'cave10_2', x: c10.x, y: c10.y, id: 'q_tianfeng' }, item: 'relic_tianfeng', itemName: '田豐舊簡', where: '江夏水寨洞二層的深處', gear: ['q_tian_helm'], gold: 5000,
      ask: '田豐大人入獄前，把他批注的竹簡託給我保管。後來我被追殺，竹簡在逃難途中被水賊搶走，藏進了江夏水寨洞。那是他一生的心血，你們願意幫我找回來嗎？', done: '就是這卷竹簡！田大人的字，一筆一劃都還在。這頂頭盔是他的舊物，請收下。' },
    { id: 'q18', kind: 'bounty', giver: 'cangting', npc: { x: g2.x, y: g2.y, name: '倉亭運糧官', sprite: 9 }, target: 'gen_cave10_3', targetName: '江夏水寨洞的浪裡白條', where: '江夏水寨洞（大地圖東南）最深處的前一道關', gear: ['q_grain_armor'], gold: 4800,
      ask: '我們的運糧小隊，三天前在漢水邊失蹤了，聽說是被一個叫「浪裡白條」的水賊劫走的。糧倒是其次，那十幾個兄弟的下落才要緊。你們能替我討個公道嗎？', done: '浪裡白條倒了！兄弟們也被救出來了！這副鐵甲是護衛長的，請收下。' },
    { id: 'q19', kind: 'fetch', giver: 'xiangyang', npc: { x: g3.x, y: g3.y, name: '許攸的舊友', sprite: 10 }, chest: { map: 'cave11_2', x: c11.x, y: c11.y, id: 'q_xuyou' }, item: 'relic_xuyou', itemName: '許攸家書', where: '博望山洞二層的深處', gear: ['q_xu_charm'], gold: 5200,
      ask: '許攸的家人被審配關進牢裡，許攸投曹之前，曾託人送出一封家書。那個人在博望山下被劫，信也一起被劫走了。你們若能取回，也算替許攸了卻一樁心事。', done: '家書！這是許攸的筆跡！雖然他已經……唉，總之，謝謝你們。這個符是他家人託我轉交的，請收下。' },
    { id: 'q20', kind: 'fetch', giver: 'xinye', npc: { x: g4.x, y: g4.y, name: '新野牧童', sprite: 7 }, chest: { map: 'cave11', x: c11a.x, y: c11a.y, id: 'q_flute' }, item: 'relic_flute', itemName: '牧童的竹笛', where: '博望山洞一層的深處', book: 'mo', gold: 5400,
      ask: '我的竹笛被山賊搶走了。那是我爺爺留給我的，笛子上刻著一朵雲。我每天都在新野郊外吹「臥龍岡」那首歌，現在吹不出來了……你們能幫我找回來嗎？', done: '就是這支笛子！我爺爺說，這首歌是一位住在臥龍岡的先生教的。……他還說，那位先生自比管仲、樂毅。這本《墨子》是爺爺留下的書，你們拿去吧。' }
  ];
  SIDE.forEach(function (q) { D.sideQuests.push(q); });
  SIDE.forEach(function (q) {
    const id = q.id, nmn = q.npc.name, map = nm[q.giver];
    const ready = q.kind === 'bounty' ? q.target + '_down' : 'chest_' + q.chest.id;
    const rewardAct = { once: id + '_reward', gold: q.gold };
    if (q.gear) rewardAct.gear = q.gear;
    if (q.book) rewardAct.book = q.book;
    const st = function (k) { const o = {}; o[k] = true; return o; };
    S[id + '_ask'] = [{ speaker: nmn, text: q.ask, set: st(id + '_start') },
      { speaker: '', text: '【支線任務】' + (q.kind === 'bounty' ? '討伐' + q.targetName + '。' : '找回' + q.itemName + '。') + '地點：' + q.where + '。可在選單「任務」查看。' }];
    S[id + '_wait'] = [{ speaker: nmn, text: q.kind === 'bounty' ? '拜託你們了。' + q.targetName + '還在' + q.where + '。' : '拜託你們了。' + q.itemName + '在' + q.where + '。' }];
    S[id + '_turn'] = [{ speaker: nmn, text: q.done, act: rewardAct, set: st(id + '_done') }];
    S[id + '_after'] = [{ speaker: nmn, text: '真的很感謝你們。' }];
    map.npcs.push({ id: id + '_giver', name: nmn, sprite: q.npc.sprite, x: q.npc.x, y: q.npc.y, dir: 'down', dialogue: id + '_ask',
      alts: [{ flag: id + '_done', dialogue: id + '_after' }, { flag: ready, dialogue: id + '_turn' }, { flag: id + '_start', dialogue: id + '_wait' }] });
    if (q.kind === 'fetch') {
      const items = {}; items[q.item] = 1;
      nm[q.chest.map].objects.push({ type: 'chest', id: q.chest.id, x: q.chest.x, y: q.chest.y, item: items, msg: '找到了' + q.itemName + '！' });
    }
  });
  D.mainQuestEnd = '第四章主線已完成。大地圖上的村莊、洞穴與支線都可以去走走：黃河洞窟、葛陂洞裡有兵書與強敵。官渡之戰與烏巢火攻，將在後續版本登場。';
  D.mainQuestEnd = '第五章已完成。官渡之戰、烏巢火攻與荊州的故事告一段落。村莊、洞穴與支線都可以去走走：江夏水寨洞、博望山洞裡有兵書與強敵。三顧茅廬與新的世界，將在後續版本登場。';
})();
