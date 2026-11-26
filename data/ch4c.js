// 第四章 批次2b：三座村莊（中牟村、葛陂村、黎陽渡村）、兩座洞穴（黃河洞窟、葛陂洞）、四條支線與兵書《孫子》
// 洞穴地圖在 data/ch4caves.js、村莊地圖在 data/ch4world.js（都由 tools/build_ch4.py 產生）。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue, nm = D.maps, en = B.enemies;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  const sold = function (n, t) { return [{ speaker: n, text: t }]; };

  // ================= 洞穴頭目 =================
  en.suigu = { name: '眭固', terrain: T('B', 'B', 'A', 'C'), int: 38, lead: 58, luck: 10, title: '黃河黑山軍首領', cls: '山賊將', weapon: '刀', desc: '黑山軍餘部的首領，據守黃河邊的洞窟。他想去投袁紹，卻在半路被曹操的軍隊截住，最後死在射犬。', hp: 44000, atk: 203, def: 92, spd: 22, exp: 8000, gold: 5600, sprite: 47, boss: true, ai: 'boss' };
  en.liupi = { name: '劉辟', terrain: T('B', 'B', 'A', 'C'), int: 34, lead: 52, luck: 10, title: '汝南黃巾首領', cls: '山賊將', weapon: '槍', desc: '汝南黃巾的餘黨首領，與龔都占著葛陂一帶，先投袁紹，後來又和劉備一起在汝南與曹軍周旋。', hp: 52000, atk: 214, def: 100, spd: 20, exp: 9000, gold: 6000, sprite: 19, boss: true, ai: 'boss' };
  B.groups.cave8boss = [['suigu'].concat(B.groups.field16[0].slice(0, 4))];
  B.groups.cave9boss = [['liupi'].concat(B.groups.field15[0].slice(0, 4))];
  B.groups.cave8g1 = [B.groups.field16[0].slice(0, 4)]; B.groups.cave8g2 = [B.groups.field16[0].slice(0, 5).reverse()];
  B.groups.cave9g1 = [B.groups.field15[0].slice(0, 4)]; B.groups.cave9g2 = [B.groups.field15[0].slice(0, 5).reverse()];
  const GENS = [
    { k: 'cave8', boss: 'suigu', field: 'field16', title: '黃河黑山軍將領', where: '黃河洞窟', names: ['楊醜', '白繞', '張白騎'], sprites: [3, 12, 19], atk: 150, def: 66, spd: 19,
      says: ['洞口濕滑，腳底下留神。……不過，你們能不能走到洞裡，也要看我答不答應。', '黑山軍的旗，在黃河邊插了十年，不是誰想拔就拔的。', '飛燕將軍早就走了，我們還在。你們，打算怎麼過去？'] },
    { k: 'cave9', boss: 'liupi', field: 'field15', title: '汝南黃巾將領', where: '葛陂洞', names: ['龔都', '何曼', '黃邵'], sprites: [12, 3, 19], atk: 154, def: 68, spd: 18,
      says: ['汝南的黃巾還沒死絕，葛陂的洞，還輪不到官府來管。', '何曼是我的名，曹操的兵怕我，不是沒有理由的。', '黃邵在這洞裡守了五年，連隻老鼠都沒放進去過。你們倒是比老鼠大了一點。'] }
  ];
  const FRAC = [0.22, 0.32, 0.45];
  GENS.forEach(function (g) {
    const bs = en[g.boss];
    g.names.forEach(function (nmn, i) {
      const id = 'gen_' + g.k + (i ? '_' + (i + 1) : '');
      en[id] = { name: nmn, terrain: T('B', 'B', 'A', 'C'), int: 24, lead: 34, luck: 8, title: g.title, cls: '將領', weapon: '刀', desc: '鎮守' + g.where + '的將領，兵多將廣，比尋常守衛難纏得多。',
        hp: Math.round(bs.hp * FRAC[i] / 10) * 10, atk: g.atk, def: g.def, spd: g.spd, exp: Math.round(bs.exp * FRAC[i]), gold: Math.round(bs.gold * FRAC[i]), sprite: g.sprites[i], boss: true, ai: 'boss' };
      B.groups[id] = [[id].concat(B.groups[g.field][0].slice(0, 4))];
      S[id] = [{ speaker: nmn, text: g.says[i] }, { speaker: '', text: nmn + '擺開架勢，身後的兵卒也圍了上來。', act: { battle: id, flag: id + '_down', after: id + '_after' } }];
      S[id + '_after'] = [{ speaker: nmn, text: '……好身手。算我技不如人，路給你們讓開。' }];
    });
  });
  ['suigu', 'liupi'].forEach(function (id) { D.terrainHome[id] = 'mountain'; });
  GENS.forEach(function (g) { g.names.forEach(function (_, i) { D.terrainHome['gen_' + g.k + (i ? '_' + (i + 1) : '')] = 'mountain'; }); });
  Object.keys(en).filter(function (k) { return /^(suigu|liupi|gen_cave[89])/.test(k); }).forEach(function (k) { D.applyTerrain(k, en[k], true); });

  // ================= 裝備、道具、兵書 =================
  Object.assign(E, {
    huanghe_helm: { name: '黃河水盔', slot: 'helm', mods: { def: 14, grd: 5, lead: 2 }, price: 0, desc: '黃河邊的老船夫戴的鐵盔，被水泡得發青，卻比新的還結實。' },
    huanghe_boots: { name: '渡河靴', slot: 'boots', mods: { spd: 9, def: 4 }, price: 0, desc: '防水的牛皮靴，穿著它過淺灘，腳底不會濕。' },
    huanghe_jade: { name: '黃河玉符', slot: 'charm', mods: { int: 10, lead: 6, luck: 4 }, price: 0, desc: '黃河洞窟深處的玉符，握著它，能聽見很遠的水聲。' },
    suigu_blade: { name: '眭固環刀', slot: 'weapon', wtype: '刀', mods: { pow: 86, spd: 1 }, price: 0, desc: '眭固的環刀，刀環一響，就知道是他來了。' },
    gepo_spear: { name: '葛陂長槍', slot: 'weapon', wtype: '槍', mods: { pow: 88, spd: 1 }, price: 0, desc: '汝南黃巾用的長槍，槍桿上纏著黃布。' },
    gepo_cloak: { name: '葛陂披風', slot: 'armor', mods: { def: 31, spd: 1 }, price: 0, desc: '葛陂洞裡的人縫的披風，厚實，有一股淡淡的煙味。' },
    gepo_charm: { name: '葛陂符', slot: 'charm', mods: { lead: 9, grd: 4, luck: 4 }, price: 0, desc: '葛陂洞的信物，據說帶著它，汝南的人都會賣你一個面子。' },
    q_ration_armor: { name: '護糧鐵甲', slot: 'armor', mods: { def: 33, lead: 2 }, price: 0, desc: '官渡押運官穿過的鐵甲，甲片上有被火燒過的痕跡。他說，糧在人在。' },
    q_ru_helm: { name: '汝南義盔', slot: 'helm', mods: { def: 14, grd: 5, lead: 2 }, price: 0, desc: '汝南百姓湊錢打的頭盔，盔頂上刻了一個「義」字。' },
    q_bai_charm: { name: '白馬平安符', slot: 'charm', mods: { lead: 12, grd: 4, luck: 3 }, price: 0, desc: '白馬城官倉的小吏縫的符，邊角整整齊齊，像帳冊一樣。' }
  });
  D.drops.suigu = ['suigu_blade', 1.0];
  B.items.relic_sunzi = { name: '孫子注竹簡', desc: '曹操親自批註的《孫子》竹簡，被人從許都偷走，藏在葛陂洞，要拿回去還給曹府主簿。', price: 0, quest: true };
  B.items.relic_granary = { name: '軍糧帳冊', desc: '白馬官倉被劫走的軍糧帳冊，藏在黃河洞窟，要拿回去交給倉曹。', price: 0, quest: true };
  // 兵書《孫子》：兵者，詭道也。單體高倍率的謀略攻擊
  B.skills.sun_gui = { name: '孫子・詭道', tp: 10, kind: 'tact', target: 'one', power: 4.4, fx: 'star' };
  B.bookSkills.sun = 'sun_gui'; B.bookNames.sun = '孫子';

  // ================= 洞穴的對話 =================
  S.cave8_g1 = [{ speaker: '洞口哨兵', text: '站住！這是黑山軍的洞，閒人不得入內！' }, { speaker: '關羽', text: '讓開。', act: { battle: 'cave8g1', flag: 'cave8_g1_down', after: 'cave8_g1_after' } }];
  S.cave8_g1_after = sold('洞口哨兵', '……過去吧。裡面比我強的人，多得很。');
  S.cave8_g2 = [{ speaker: '洞中頭目', text: '再往裡走就是眭大哥歇腳的地方，沒有他的話，誰也不能過。' }, { speaker: '張飛', text: '俺老張今天，就是來問他的話！', act: { battle: 'cave8g2', flag: 'cave8_g2_down', after: 'cave8_g2_after' } }];
  S.cave8_g2_after = sold('洞中頭目', '……你們贏了。大哥就在最深處。');
  S.cave8_sp = [{ speaker: '逃難的船夫', text: '我在黃河上撐了二十年船，黑山軍搶了我的船，還把我當成「領航員」帶進洞裡。' },
    { speaker: '逃難的船夫', text: '這點藥草是我偷偷藏的，給你們帶著吧。要是見到眭固，替我說一聲：我的船，我不要了，但我的帽子，我要。', choices: [{ label: '收下藥草', act: { give: { herb3: 3, tonic3: 2 }, once: 'cave8_sp_done' } }, { label: '不用了' }] }];
  S.cave8_sp_after = sold('逃難的船夫', '黃河水深，人心更深。你們小心。');
  S.cave8_boss = [
    { speaker: '眭固', text: '來了。我眭固在這黃河邊，等的就是這一天。' },
    { speaker: '劉備', text: '眭壯士，兗豫百姓只想過安穩日子，你何必劫糧斷路？' },
    { speaker: '眭固', text: '安穩日子？我要渡河去投袁紹，你們卻堵在這洞口。誰攔我，我就打誰。' },
    { speaker: '諸葛貓妖', text: '……喵，他不知道，歷史上他最後死在射犬。我是不是該告訴他？' },
    { speaker: '眭固', text: '貓在說什麼？看刀！', act: { battle: 'cave8boss', flag: 'cave8_down', after: 'cave8_after' } }];
  S.cave8_after = [
    { speaker: '眭固', text: '……我輸了。黃河邊的風，今天特別冷。' },
    { speaker: '關羽', text: '眭壯士，刀法不錯。可惜走錯了路。' },
    { speaker: '眭固', text: '路是自己選的……你們走吧。' }];
  S.cave9_g1 = [{ speaker: '葛陂哨兵', text: '站住！這是葛陂洞，劉大帥的地盤！' }, { speaker: '關羽', text: '讓開。', act: { battle: 'cave9g1', flag: 'cave9_g1_down', after: 'cave9_g1_after' } }];
  S.cave9_g1_after = sold('葛陂哨兵', '……進去吧。劉大帥在裡面，他可不好說話。');
  S.cave9_g2 = [{ speaker: '洞中小頭目', text: '再往裡走就是大帥的議事廳了。你們想幹什麼？' }, { speaker: '張飛', text: '來問你們大帥要一卷竹簡！', act: { battle: 'cave9g2', flag: 'cave9_g2_down', after: 'cave9_g2_after' } }];
  S.cave9_g2_after = sold('洞中小頭目', '……你們贏了。大帥就在前面。');
  S.cave9_sp = [{ speaker: '流亡的鄉老', text: '我們葛陂的老百姓，被黃巾、被官軍，輪流搶了十幾年。到最後，連誰是誰都分不清了。' },
    { speaker: '流亡的鄉老', text: '這點藥草是我藏的，給你們帶著吧。要是見到劉辟，就說葛陂的鄉老想問他：你什麼時候，才肯把糧還給鄉親？', choices: [{ label: '收下藥草', act: { give: { herb3: 3, tonic3: 3 }, once: 'cave9_sp_done' } }, { label: '不用了' }] }];
  S.cave9_sp_after = sold('流亡的鄉老', '劉辟那個人，說話不算數，但也不算壞。你們小心。');
  S.cave9_boss = [
    { speaker: '劉辟', text: '終於有人找到葛陂洞了。我劉辟在汝南，投過袁紹，也和劉玄德並肩過。' },
    { speaker: '劉備', text: '劉壯士，我們此來，是要取回一卷被偷走的竹簡。還請高抬貴手。' },
    { speaker: '劉辟', text: '竹簡？那是我們從許都「借」來的。我沒讀過書，所以特別想看看，書是什麼味道。' },
    { speaker: '諸葛貓妖', text: '……喵，那個味道，叫做「這是別人的東西」。' },
    { speaker: '劉辟', text: '別囉嗦，打贏我再說！', act: { battle: 'cave9boss', flag: 'cave9_down', after: 'cave9_after' } }];
  S.cave9_after = [
    { speaker: '劉辟', text: '……輸了。竹簡在洞裡的箱子裡，自己去拿吧。' },
    { speaker: '劉辟', text: '你們日後若見到劉玄德，就說劉辟還記得汝南的那一仗。' }];

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
    zhongmu: [
      { name: '亭長舊宅', size: 'small', chest: { id: 'h_zm_a', gold: 1400, item: { herb3: 2, tonic3: 2 }, msg: '亭長舊宅的灶台後，有一袋沒來得及帶走的銀子。' },
        npc: { name: '亭長的老僕', sprite: 6, lines: ['老僕：我家老爺當年在這裡當亭長，有一晚抓到一個形跡可疑的人，是曹操，慌慌張張逃命的那個。', '老僕：他說，您把我放了，天下將來有您的一半。……結果老爺把官印丟了，跟他跑了。'] } },
      { kind: 'general', name: '中牟雜貨店', keeper: '掌櫃', sprite: 4 },
      { kind: 'inn', id: 'inn', size: 'big', name: '中牟客棧', keeper: '掌櫃', sprite: 4, hello: '中牟村小，客棧也小，不過有一晚，曹丞相也是住這間，睡得特別不踏實。要不要住一晚？' }
    ],
    gepo: [
      { name: '葛陂老農的家', size: 'small', chest: { id: 'h_gp_a', gold: 1200, item: { tonic3: 2, herb3: 2 }, msg: '米缸底下有幾包曬乾的草藥和一小袋錢。' },
        npc: { name: '葛陂老農', sprite: 8, lines: ['老農：葛陂那個洞，原來是我們老百姓躲兵的洞，現在讓黃巾餘黨給占了。', '老農：洞裡有個人叫劉辟，說話聲音大，心卻不壞。他前兩年還給我送過一袋麥。'] } },
      { kind: 'general', name: '葛陂雜貨店', keeper: '掌櫃', sprite: 4 },
      { kind: 'inn', id: 'inn', size: 'big', name: '葛陂客棧', keeper: '掌櫃', sprite: 4, hello: '葛陂客棧，聽得見山裡的風聲。住一晚吧，被子我曬過了，乾淨得很。' }
    ],
    liyang: [
      { name: '渡口漁家', size: 'small', chest: { id: 'h_ly_a', gold: 1600, msg: '漁網底下壓著一小袋渡河錢。' },
        npc: { name: '漁家老嫗', sprite: 12, lines: ['老嫗：黎陽渡口從前是商旅過河最多的地方，現在全是兵。', '老嫗：我家那口子被袁軍拉去撐船，三個月沒回來。……你們要是在黃河邊遇見，替我說一聲：魚網我補好了。'] } },
      { kind: 'general', name: '黎陽雜貨店', keeper: '掌櫃', sprite: 4 },
      { kind: 'inn', id: 'inn', size: 'big', name: '黎陽客棧', keeper: '掌櫃', sprite: 4, hello: '黎陽渡口的客棧，聽得見黃河的水聲。住一晚吧，睡著了就聽不見了。' }
    ]
  };
  Object.keys(VHOUSES).forEach(function (town) {
    const tm = nm[town], doors = D.ch4Doors[town];
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
  V('zhongmu', 'zm_farmer', '老農', 6, 10, 6, 'down', ['聽說曹丞相當年在咱們中牟被抓過，後來是個叫陳宮的縣令放了他。……這種事，村裡人都不敢大聲說。']);
  V('zhongmu', 'zm_trader', '行商', 10, 17, 12, 'left', ['官渡那邊的糧倉被劫過一回，聽說劫的是黃河洞窟裡的黑山軍。你們要是路過黃河邊，順路去看一眼，洞口在大地圖的東邊。']);
  V('gepo', 'gp_woodcutter', '樵夫', 7, 13, 8, 'down', ['葛陂那個洞，在大地圖的西南角，翻過兩座山就到。洞裡有人住，白天不太敢出來，晚上卻很吵。']);
  V('gepo', 'gp_kid', '孩童', 7, 6, 12, 'right', ['我爹說，葛陂洞裡面有個大叔叫龔都，會變魔術。他拿一顆石頭，變成一顆饅頭，再吃掉。']);
  V('liyang', 'ly_boatman', '擺渡人', 9, 10, 6, 'down', ['黎陽的渡口，最近袁軍的運糧船一艘接一艘。官渡的曹軍想劫糧，可惜黃河太寬，他們的箭射不到。']);
  V('liyang', 'ly_fisher', '漁夫', 6, 17, 12, 'left', ['東邊有個山洞，裡頭有一群黑山軍的人。他們不搶漁民，只搶過路的糧車。……這也算是一種「道義」吧。']);
  D.worldBackfill.zhongmu = 'xd_wine'; D.worldBackfill.gepo = 'chezhou_down'; D.worldBackfill.liyang = 'yanliang_down';

  // ================= 支線 =================
  const c8 = freeSpot('cave8_2'), c9 = freeSpot('cave9_2');
  const pickG = function (map, hx, hy) { return spotNear(map, hx, hy); };
  const g1 = pickG('guandu', 13, 12), g2 = pickG('xudu', 12, 13), g3 = pickG('runan', 11, 12), g4 = pickG('baima', 14, 13);
  const SIDE = [
    { id: 'q13', kind: 'bounty', giver: 'guandu', npc: { x: g1.x, y: g1.y, name: '官渡押運官', sprite: 9 }, target: 'gen_cave8_3', targetName: '黃河洞窟的張白騎', where: '黃河洞窟（大地圖東北，白馬東邊的山裡）最深處的前一道關', gear: ['q_ration_armor'], gold: 3200,
      ask: '官渡的糧道，這陣子老被黃河洞窟的黑山軍劫。他們最近來了個叫張白騎的，馬快，刀快，連我們的押運隊都不敢走夜路。誰能去收拾他，我就把這件鐵甲送給誰。', done: '張白騎被打敗了？！太好了，糧道總算安穩了。這件護糧鐵甲，是我年輕時穿過的，請收下。' },
    { id: 'q14', kind: 'fetch', giver: 'xudu', npc: { x: g2.x, y: g2.y, name: '曹府主簿', sprite: 10 }, chest: { map: 'cave9_2', x: c9.x, y: c9.y, id: 'q_sunzi' }, item: 'relic_sunzi', itemName: '孫子注竹簡', where: '葛陂洞二層的深處', book: 'sun', gold: 4000,
      ask: '丞相批註的《孫子》竹簡，前天夜裡被人從府裡偷走了。聽說是汝南葛陂洞的人幹的，那些人沒讀過書，卻偏偏偷書。你們若能取回，丞相肯定感激，我也能把這部書的心法，轉授給你們。', done: '竹簡！是丞相的批註！「兵者，詭道也」——這一句，丞相批了三行。《孫子》的心法，今天我轉授給你們。' },
    { id: 'q15', kind: 'bounty', giver: 'runan', npc: { x: g3.x, y: g3.y, name: '汝南亭長', sprite: 12 }, target: 'gen_cave9_3', targetName: '葛陂洞的黃邵', where: '葛陂洞（大地圖西南角）最深處的前一道關', gear: ['q_ru_helm'], gold: 3000,
      ask: '葛陂洞的黃邵，帶著人在汝南一帶搶糧。縣裡湊了點賞金，也湊了一頂頭盔，只是沒人敢去。你們願意試試嗎？', done: '黃邵被打敗了！這頂義盔是百姓湊錢打的，不太華麗，但有心意。' },
    { id: 'q16', kind: 'fetch', giver: 'baima', npc: { x: g4.x, y: g4.y, name: '白馬倉曹', sprite: 10 }, chest: { map: 'cave8_2', x: c8.x, y: c8.y, id: 'q_granary' }, item: 'relic_granary', itemName: '軍糧帳冊', where: '黃河洞窟二層的深處', gear: ['q_bai_charm'], gold: 3600,
      ask: '白馬的軍糧帳冊，被黃河洞窟的人搶走了。沒有它，我連誰領了多少糧都算不清，更別說分給百姓了。你們能幫我找回來嗎？', done: '帳冊！就是這一本！三千石糧的流向，總算能對上了。這個平安符是我縫的，請收下。' }
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
})();
