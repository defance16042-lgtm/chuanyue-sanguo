// 關口（可進入的要塞）與山口（翻山越嶺的隘道）。地圖在載入時由下面的規格組出來。
// 關口：從南門進、北門出，正中間的城牆缺口由守將把守；兩翼是營房和糧倉，後方是指揮廳。
// 山口：大地圖橫路上的一道懸崖，兩側各有一個山口；進去是一條蜿蜒的山路，窄處由山賊將領把守。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;
  const T = function (p, f, m, s, d) { return { plain: p, forest: f, mountain: m, sea: s, desert: d || 'B' }; };
  // ---- 守將與敵群 ----
  B.enemies.fanchou = { name: '樊稠', terrain: T('B', 'C', 'A', 'C', 'A'), int: 30, lead: 40, luck: 9, title: '董卓部將', cls: '西涼將', weapon: '槍', desc: '董卓麾下的西涼悍將，奉命鎖住東面的關口，不讓關東的人一兵一卒過去。', hp: 26000, atk: 136, def: 62, spd: 17, exp: 3000, gold: 2400, sprite: 27, boss: true, ai: 'boss', home: 'mountain' };
  B.enemies.bairao = { name: '白繞', terrain: T('B', 'A', 'S', 'C'), int: 30, lead: 30, luck: 12, title: '黑山軍大帥', cls: '山賊將', weapon: '斧', desc: '黑山軍的頭領之一，綽號「白繞」，帶著上千人守著太行山的隘口收買路錢。', hp: 13000, atk: 100, def: 46, spd: 17, exp: 1100, gold: 900, sprite: 19, boss: true, ai: 'boss', home: 'mountain' };
  B.enemies.qiuliju = { name: '丘力居', terrain: T('A', 'C', 'B', 'C', 'S'), int: 24, lead: 40, luck: 9, title: '烏桓大人', cls: '烏桓王', weapon: '矛', desc: '烏桓的大人，統領上谷一帶的騎兵，把燕山口當成自家的後門。', hp: 17500, atk: 114, def: 52, spd: 19, exp: 1500, gold: 1200, sprite: 23, boss: true, ai: 'boss', home: 'desert' };
  B.enemies.hucai = { name: '胡才', terrain: T('B', 'A', 'S', 'C'), int: 28, lead: 36, luck: 10, title: '白波軍頭領', cls: '山賊將', weapon: '刀', desc: '白波軍的頭領，帶著殘部佔了轘轅山口，專劫過往的糧車。', hp: 25000, atk: 132, def: 60, spd: 18, exp: 2800, gold: 2200, sprite: 18, boss: true, ai: 'boss', home: 'mountain' };
  Object.keys(B.enemies).forEach(function (k) { const e = B.enemies[k]; if (/^(fanchou|bairao|qiuliju|hucai)$/.test(k) && e.terrain[e.home] !== 'S') e.terrain[e.home] = 'S'; });
  B.groups.geboss = [['fanchou', 'langqi', 'langqi', 'xiliang', 'xiliang']];
  B.groups.sk1boss = [['bairao', 'heishan_b', 'heishan_b', 'heishan_a', 'heishan_a']];
  B.groups.sk1g1 = [['heishan_b', 'heishan_b', 'heishan_a', 'heishan_a']]; B.groups.sk1g2 = [['heishan_b', 'heishan_b', 'heishan_b', 'heishan_a']];
  B.groups.sk2boss = [['qiuliju', 'wuhuan', 'wuhuan', 'wuhuan']];
  B.groups.sk2g1 = [['wuhuan', 'wuhuan', 'wuhuan']]; B.groups.sk2g2 = [['wuhuan', 'wuhuan', 'wuhuan', 'bandit']];
  B.groups.sk3boss = [['hucai', 'baibo', 'baibo', 'baibo']];
  B.groups.sk3g1 = [['baibo', 'baibo', 'baibo']]; B.groups.sk3g2 = [['baibo', 'baibo', 'xiliang', 'xiliang']];
  // ---- 裝備 ----
  E.pass_halberd = { name: '關城長戟', slot: 'weapon', wtype: '矛', mods: { pow: 66, def: 2 }, price: 0, desc: '樊稠守關時用的長戟，戟杆被握得發亮。' };
  E.guan_armor = { name: '關防鐵甲', slot: 'armor', mods: { def: 18, spd: -1 }, price: 0, desc: '守關將領的鐵甲，鑄著關城的名字。' };
  E.cliff_boots = { name: '登山鐵靴', slot: 'boots', mods: { spd: 4, def: 3 }, price: 0, desc: '山賊翻山越嶺穿的鐵釘靴，走再陡的路也不滑。' };
  E.bairao_axe = { name: '白繞開山斧', slot: 'weapon', wtype: '刀', mods: { pow: 56 }, price: 0, desc: '白繞的大斧，據說劈開過整塊山石。' };
  E.horse_charm = { name: '烏桓馬牌', slot: 'charm', mods: { spd: 5, luck: 3 }, price: 0, desc: '烏桓大人發給騎兵的銅牌，掛著它的人，馬也格外聽話。' };
  E.hucai_spear = { name: '胡才鐵槍', slot: 'weapon', wtype: '槍', mods: { pow: 68, spd: 1 }, price: 0, desc: '白波頭領胡才的長槍，槍頭開過不少糧車。' };
  E.pass_pass = { name: '通關文牒', slot: 'charm', mods: { grd: 6, luck: 5 }, price: 0, desc: '蓋著關防大印的文牒，看起來比任何護身符都管用。' };
  D.drops.fanchou = ['pass_halberd', 1.0]; D.drops.bairao = ['bairao_axe', 1.0]; D.drops.qiuliju = ['horse_charm', 1.0]; D.drops.hucai = ['hucai_spear', 1.0];
  // ---- 對話 ----
  const sold = function (n, t) { return [{ speaker: n, text: t }]; };
  S.gw_s1 = sold('守卒', '站住，登記！姓名、來歷、要去哪裡？……你們是義軍啊，那我少寫兩行。');
  S.gw_s2 = sold('哨兵', '關城的箭樓一共十二座，我每天爬十二次，腿都爬粗了。');
  S.gw_s3 = sold('營房老兵', '小夥子，打仗不是靠勇，是靠命。命硬的才活到我這個歲數。');
  S.gw_s4 = sold('糧官', '糧倉的鑰匙在我這裡，不過裡頭的箱子沒鎖，你們要看就看吧。');
  S.gw_s5 = sold('傳令兵', '洛陽那邊亂成一團，關東的消息一個比一個嚇人。');
  S.gw_off = sold('參軍', '守將是個老軍頭，脾氣硬，嘴巴更硬。想過關，先過他那一關。');
  S.ge_s1 = sold('西涼兵', '董相國有令：關東來的人，一律不准過！');
  S.ge_s2 = sold('西涼哨兵', '樊將軍在關上守了三個月，連個鳥都沒放過去。');
  S.ge_s3 = sold('營房兵', '我是涼州人，離家一千里來守這座關。想娘，不敢說。');
  S.ge_s4 = sold('糧官', '糧車三天沒到了，關上的人開始啃乾餅。');
  S.ge_s5 = sold('傳令兵', '虎牢關那邊有消息，說呂將軍一個人頂十個人。');
  S.ge_off = sold('參軍', '樊將軍交代：關東軍要是想過關，就叫他們先數數這關上有多少支箭。');
  S.ge_boss = [
    { speaker: '樊稠', text: '站住！奉董相國之命，此關只出不進。報上名來！' },
    { speaker: '劉備', text: '漢室宗親劉備，奉旨討賊，借道過關。' },
    { speaker: '樊稠', text: '討賊？我看你們才是賊。想過去，先過我手上的槍！', act: { battle: 'geboss', flag: 'fanchou_down', after: 'ge_after' } }];
  S.ge_after = sold('樊稠', '……關城守不住了，董相國不會放過我。你們走吧，我也該另謀生路了。');
  // 山口：每個山口的守將、小隊、碑文
  const SK = {
    shankou1: { boss: ['白繞', 'sk1boss', 'bairao_down', '「此山是我開，此路是我栽，要想從此過，留下買路財！」白繞的旗子插在隘口正中。', '太行山的買路錢，我收了十年，從沒有人不給。你們不給？那就用刀來付！', '……好、好，這條路讓給你們。不過下回再來，記得帶銀子。'], g1: ['山賊哨', '這條路是白繞大哥的，要過去先留下錢！'], g2: ['山賊頭目', '再往上就是大寨了，你們有幾條命？'], tab: '「太行山口」——碑下壓著一堆舊布條，是被劫的客商留下的記號。', sp: ['迷路的行商', '我被山賊追了三天才逃進這個山洞，這些藥草給你們，別讓我白逃了。'] },
    shankou2: { boss: ['丘力居', 'sk2boss', 'qiuliju_down', '山口旁插著烏桓的狼頭旗，旗下的馬糞還是熱的。', '漢人的軍隊，居然也敢走燕山口？留下馬，或者留下命！', '……你們比漢人官軍強。這條路，讓給你們走。'], g1: ['烏桓哨兵', '這是烏桓大人的草場，外人不許進！'], g2: ['烏桓百夫長', '大人的帳篷就在前面，你們再往前一步，我們就放箭。'], tab: '「燕山口」——石碑上刻著漢字與烏桓文，意思是：此路為界。', sp: ['被俘的邊民', '烏桓人把我抓來運草料，這點乾糧是藏下來的，請你們收下。'] },
    shankou3: { boss: ['胡才', 'sk3boss', 'hucai_down', '山口上掛著「白波」的黑旗，路邊還有被劫翻的糧車。', '關東軍的糧車我劫過，董卓的糧車我也劫過，你們的路費要不要也交一交？', '……罷了罷了，這山口讓給你們，下次我換個山頭。'], g1: ['白波賊哨', '誰讓你們走這條路的？過路費拿來！'], g2: ['白波賊目', '前面就是大當家，別再往前走了。'], tab: '「轘轅山口」——十八盤山路，據說走完一趟，鞋底要磨掉一寸。', sp: ['採藥老人', '轘轅山的藥草最好，可惜如今被賊人佔了，這點拿去吧。'] }
  };
  Object.keys(SK).forEach(function (k) {
    const o = SK[k];
    S[k + '_boss'] = [{ speaker: '', text: o.boss[3] }, { speaker: o.boss[0], text: o.boss[4], act: { battle: o.boss[1], flag: o.boss[2], after: k + '_after' } }];
    S[k + '_after'] = [{ speaker: o.boss[0], text: o.boss[5] }];
    S[k + '_g1'] = [{ speaker: o.g1[0], text: o.g1[1], act: { battle: k.replace('shankou', 'sk') + 'g1', flag: k + '_g1_down', after: k + '_gafter' } }];
    S[k + '_g2'] = [{ speaker: o.g2[0], text: o.g2[1], act: { battle: k.replace('shankou', 'sk') + 'g2', flag: k + '_g2_down', after: k + '_gafter' } }];
    S[k + '_gafter'] = [{ speaker: '', text: '（敵人敗退了。）' }];
    S[k + '_sp'] = [{ speaker: o.sp[0], text: o.sp[1], choices: [{ label: '收下', act: { give: { herb: 5, tonic: 3 }, once: k + '_sp_done' } }, { label: '不用了' }] }];
    S[k + '_sp_after'] = [{ speaker: o.sp[0], text: '一路小心，山上的路不好走。' }];
  });
  // ---- 地圖組裝 ----
  const grid = function (w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; };
  const rect = function (g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
  const rows = function (g) { return g.map(function (r) { return r.join(''); }); };
  const chestObj = function (id, x, y, o) { return Object.assign({ type: 'chest', id: id, x: x, y: y }, o); };
  function fortress(id, name, o) {
    const g = grid(24, 26, ','); rect(g, 0, 0, 23, 25, '#'); rect(g, 1, 1, 22, 24, ',');
    for (let y = 0; y <= 25; y++) { g[y][11] = ','; g[y][12] = ','; }
    for (let x = 1; x <= 22; x++) g[12][x] = '#';
    g[12][11] = ','; g[12][12] = '#';
    [[8, 10], [13, 10]].forEach(function (t) { rect(g, t[0], t[1], t[0] + 2, t[1] + 1, 'W'); rect(g, t[0], t[1] - 1, t[0] + 2, t[1] - 1, 'R'); });
    [[1, 1], [20, 1]].forEach(function (t) { rect(g, t[0], t[1], t[0] + 2, t[1] + 1, 'W'); rect(g, t[0], t[1] - 0, t[0] + 2, t[1], 'R'); });
    rect(g, 2, 14, 8, 21, 'W'); rect(g, 3, 15, 8, 20, '_'); g[14][8] = 'W'; g[21][8] = 'W';   // 營房（東側開口）
    rect(g, 15, 14, 21, 21, 'W'); rect(g, 15, 15, 20, 20, '_');                               // 糧倉（西側開口）
    rect(g, 4, 2, 9, 6, 'W'); rect(g, 5, 3, 9, 5, '_'); rect(g, 5, 6, 9, 6, '_'); rect(g, 4, 1, 9, 1, 'R');      // 指揮廳西翼
    rect(g, 14, 2, 19, 6, 'W'); rect(g, 14, 3, 18, 5, '_'); rect(g, 14, 6, 18, 6, '_'); rect(g, 14, 1, 19, 1, 'R');   // 東翼（中間留一條路通往北門）
    const dec = function (x, y, c) { g[y][x] = c; };
    [[4, 15, 'O'], [5, 15, 'O'], [3, 20, 'X'], [4, 20, 'X'], [16, 15, 'X'], [17, 15, 'X'], [20, 16, 'O'], [20, 17, 'O'], [6, 3, 'X'], [15, 3, 'O'], [10, 22, 'F'], [13, 22, 'F'], [10, 8, 'F'], [13, 8, 'F']].forEach(function (d) { dec(d[0], d[1], d[2]); });
    const npc = function (i, n, sp, x, y, dir, dlg) { return { id: id + '_n' + i, name: n, sprite: sp, x: x, y: y, dir: dir, dialogue: dlg }; };
    const npcs = [npc(1, o.n[0], o.sp[0], 10, 21, 'right', o.p + '_s1'), npc(2, o.n[1], o.sp[0], 13, 18, 'left', o.p + '_s2'), npc(3, o.n[2], o.sp[1], 6, 17, 'down', o.p + '_s3'),
      npc(4, o.n[3], o.sp[2], 18, 17, 'down', o.p + '_s4'), npc(5, o.n[4], o.sp[0], 10, 9, 'right', o.p + '_s5'), npc(6, o.n[5], o.sp[2], 8, 4, 'right', o.p + '_off')];
    npcs.push(o.boss);
    const objects = o.chests.map(function (c) { return chestObj(c[0], c[1], c[2], c[3]); });
    D.maps[id] = { name: name, battleBg: 'grass', home: { map: 'world' }, tiles: rows(g), start: { x: 11, y: 24, dir: 'up' }, warps: o.warps, npcs: npcs, objects: objects, encounter: null };
  }
  fortress('guan_w', '西關', {
    p: 'gw', n: ['守卒', '哨兵', '營房老兵', '糧官', '傳令兵', '參軍'], sp: [34, 33, 32],
    boss: { id: 'gw_boss', name: '關口守將', sprite: 34, x: 11, y: 12, dir: 'down', dialogue: 'pass_guard_early', hideIf: 'pass_open', alts: [{ flag: 'py_news', dialogue: 'pass_guard' }] },
    chests: [['gw_c1', 19, 15, { gold: 600, msg: '糧倉角落的軍餉箱，封條上蓋著關防大印。' }], ['gw_c2', 20, 20, { item: { herb: 5, tonic: 3 }, msg: '醫藥箱，是軍醫備著給傷兵用的。' }], ['gw_c3', 16, 4, { gold: 900, gear: ['guan_armor'], msg: '指揮廳的案頭有一只上了鎖的鐵匣，撬開來，裡面是一套關城的鐵甲。' }], ['gw_c4', 3, 19, { item: { herb: 4 }, msg: '營房床底下的包袱，裡面是老兵藏的藥。' }]],
    warps: [{ x: 11, y: 25, to: 'world', tx: 3, ty: 58, dir: 'right' }, { x: 12, y: 25, to: 'world', tx: 3, ty: 58, dir: 'right' }, { x: 11, y: 0, to: 'world2', tx: 75, ty: 40, dir: 'left' }, { x: 12, y: 0, to: 'world2', tx: 75, ty: 40, dir: 'left' }]
  });
  fortress('guan_e', '成皋東關', {
    p: 'ge', n: ['西涼兵', '西涼哨兵', '營房兵', '糧官', '傳令兵', '參軍'], sp: [25, 25, 34],
    boss: { id: 'ge_boss', name: '樊稠', sprite: 27, x: 11, y: 12, dir: 'down', dialogue: 'ge_boss', hideIf: 'fanchou_down' },
    chests: [['ge_c1', 19, 15, { gold: 1500, msg: '糧倉角落的軍餉箱，印著董卓軍的烙印。' }], ['ge_c2', 20, 20, { item: { herb: 6, tonic: 4 }, msg: '醫藥箱，裡面的藥比關東軍的好得多。' }], ['ge_c3', 16, 4, { gold: 2000, gear: ['pass_pass'], msg: '指揮廳的鐵匣裡，是一張蓋著大印的通關文牒。' }], ['ge_c4', 3, 19, { item: { herb: 5 }, msg: '營房床下的包袱，被翻過不少次了。' }]],
    warps: [{ x: 11, y: 25, to: 'world2', tx: 76, ty: 40, dir: 'left' }, { x: 12, y: 25, to: 'world2', tx: 76, ty: 40, dir: 'left' }, { x: 11, y: 0, to: 'world', tx: 3, ty: 58, dir: 'right' }, { x: 12, y: 0, to: 'world', tx: 3, ty: 58, dir: 'right' }]
  });
  // 山口：三層山路。山腳（西）→ 山頂（窄口有守將）→ 山腳（東）；層與層之間走石階，山頂窄處由守將把守
  function climb(id, name, st, tier) {
    const o = SK[id], sid = id.replace('shankou', 'sk');
    const floorMap = function (segs, pockets, choke) {
      const g = grid(24, 28, 'Q');
      segs.forEach(function (s) {
        for (let y = Math.min(s[1], s[3]) - (s[0] === s[2] ? 0 : 1); y <= Math.max(s[1], s[3]) + (s[0] === s[2] ? 0 : 1); y++)
          for (let x = Math.min(s[0], s[2]) - (s[1] === s[3] ? 0 : 1); x <= Math.max(s[0], s[2]) + (s[1] === s[3] ? 0 : 1); x++) if (x > 0 && x < 23 && y >= 0 && y < 28) g[y][x] = ',';
      });
      pockets.forEach(function (r) { rect(g, r[0], r[1], r[2], r[3], ','); });
      for (let y = 0; y < 28; y++) for (let x = 0; x < 24; x++) {
        if (g[y][x] !== ',') continue; const h = (x * 7 + y * 13 + x * y) % 11;
        if (h < 3) g[y][x] = 'M'; else if (h === 3 && y > 1 && y < 26) g[y][x] = 'Y';
      }
      if (choke) { for (let x = choke[0]; x <= choke[1]; x++) { g[choke[2] - 1][x] = 'Q'; g[choke[2] + 1][x] = 'Q'; g[choke[2]][x] = ','; } }
      return g;
    };
    const stair = function (g, x, y, ch) { g[y][x] = ch; };
    const warp = function (x, y, to, tx, ty, dir) { return { x: x, y: y, to: to, tx: tx, ty: ty, dir: dir }; };
    // 第一層：山腳（西）
    let g = floorMap([[12, 27, 12, 22], [12, 22, 6, 22], [6, 22, 6, 15], [6, 15, 16, 15], [16, 15, 16, 8], [16, 8, 10, 8], [10, 8, 10, 2]], [[1, 18, 4, 20], [18, 11, 22, 13]]);
    for (let x = 11; x <= 13; x++) { g[27][x] = ','; g[26][x] = ','; }
    stair(g, 10, 1, '<'); g[2][10] = ','; g[1][9] = 'Q'; g[1][11] = 'Q';
    D.maps[id] = { name: name + '・山腳', battleBg: 'mountain', mountain: true, encounter: { group: 'field' + tier, rate: 0.1, minSteps: 4 }, tiles: rows(g), start: { x: 12, y: 25, dir: 'up' }, home: { map: 'world' },
      warps: [warp(11, 27, 'WORLD', 0, 0, 'left'), warp(12, 27, 'WORLD', 0, 0, 'left'), warp(13, 27, 'WORLD', 0, 0, 'left'), warp(10, 1, id + '_2', 10, 26, 'up')],
      npcs: [{ id: id + '_g1', name: o.g1[0], sprite: 2, x: 6, y: 18, dir: 'down', dialogue: id + '_g1', hideIf: id + '_g1_down' }],
      objects: [chestObj(id + '_c1', 2, 19, st.c1), { type: 'tablet', x: 11, y: 24, text: o.tab }, { type: 'bones', x: 20, y: 12, text: '一具被山風吹乾的屍骨，旁邊的行囊早被掏空了。' }, { type: 'torch', x: 14, y: 21, text: '路邊插著山賊的火把，油還沒燒完。' }] };
    // 第二層：山頂（窄口與守將）
    g = floorMap([[10, 27, 10, 22], [10, 22, 18, 22], [18, 22, 18, 15], [18, 15, 6, 15], [6, 15, 6, 8], [6, 8, 12, 8], [12, 8, 12, 2]], [[19, 17, 22, 19], [5, 21, 8, 23], [14, 3, 16, 5]], [8, 16, 15]);
    stair(g, 10, 27, '>'); g[26][10] = ','; g[27][9] = 'Q'; g[27][11] = 'Q'; stair(g, 12, 1, '>'); g[2][12] = ','; g[1][11] = 'Q'; g[1][13] = 'Q';
    D.maps[id + '_2'] = { name: name + '・山頂', battleBg: 'mountain', mountain: true, encounter: { group: 'field' + tier, rate: 0.1, minSteps: 4 }, tiles: rows(g), start: { x: 10, y: 26, dir: 'up' }, home: { map: 'world' },
      warps: [warp(10, 27, id, 10, 2, 'down'), warp(12, 1, id + '_3', 12, 26, 'up')],
      npcs: [{ id: id + '_boss', name: o.boss[0], sprite: st.sprite, x: 12, y: 15, dir: 'right', dialogue: id + '_boss', hideIf: o.boss[2] },
        { id: id + '_g2', name: o.g2[0], sprite: 3, x: 17, y: 18, dir: 'down', dialogue: id + '_g2', hideIf: id + '_g2_down' },
        { id: id + '_sp', name: o.sp[0], sprite: 8, x: 21, y: 18, dir: 'left', dialogue: id + '_sp', alts: [{ flag: id + '_sp_done', dialogue: id + '_sp_after' }] }],
      objects: [chestObj(id + '_c2', 6, 22, st.c2), chestObj(id + '_c3', 15, 4, st.c3), { type: 'spring', x: 22, y: 19, text: '山頂的泉水，清冽甘甜。' }, { type: 'statue', x: 8, y: 21, text: '一座風化的山神像，腳下擺著山賊供的酒。' }] };
    // 第三層：山腳（東）
    g = floorMap([[12, 27, 12, 22], [12, 22, 18, 22], [18, 22, 18, 14], [18, 14, 7, 14], [7, 14, 7, 7], [7, 7, 12, 7], [12, 7, 12, 0]], [[2, 11, 5, 13]]);
    for (let x = 11; x <= 13; x++) { g[0][x] = ','; g[1][x] = ','; }
    stair(g, 12, 27, '<'); g[26][12] = ','; g[27][11] = 'Q'; g[27][13] = 'Q';
    D.maps[id + '_3'] = { name: name + '・東麓', battleBg: 'mountain', mountain: true, encounter: { group: 'field' + tier, rate: 0.1, minSteps: 4 }, tiles: rows(g), start: { x: 12, y: 26, dir: 'up' }, home: { map: 'world' },
      warps: [warp(12, 27, id + '_2', 12, 2, 'down'), warp(11, 0, 'WORLD', 0, 0, 'right'), warp(12, 0, 'WORLD', 0, 0, 'right'), warp(13, 0, 'WORLD', 0, 0, 'right')],
      npcs: [], objects: [chestObj(id + '_c4', 3, 12, { gold: Math.round(st.c1.gold * 0.8), msg: '路邊岩縫裡的錢袋，大概是哪個逃命的行商掉的。' }), { type: 'bones', x: 19, y: 17, text: '岩縫裡露出半截生鏽的刀。' }, { type: 'torch', x: 14, y: 20, text: '山賊守夜的火把。' }] };
  }
  climb('shankou1', '太行山口', { sprite: 19, c1: { gold: 700, msg: '山賊藏在石縫裡的贓物。' }, c2: { gear: ['cliff_boots'], msg: '一只被山石壓著的皮箱，裡面是一雙鐵釘靴。' }, c3: { item: { herb: 5, tonic: 3 }, msg: '路邊的藥囊。' } }, 7);
  climb('shankou2', '燕山口', { sprite: 23, c1: { gold: 900, msg: '烏桓人藏在氈子下的銀幣。' }, c2: { gear: ['horse_charm'], msg: '一個氈包，裡面掛著一枚銅馬牌。' }, c3: { item: { herb: 5, tonic: 4 }, msg: '草原的藥草袋。' } }, 8);
  climb('shankou3', '轘轅山口', { sprite: 18, c1: { gold: 1800, msg: '被劫的糧車裡，翻出來的一袋軍餉。' }, c2: { gold: 2200, gear: ['cliff_boots'], msg: '十八盤路上的石龕，裡面供著一雙舊鐵靴。' }, c3: { item: { herb: 6, tonic: 5 }, msg: '採藥人留在石縫裡的藥包。' } }, 10);
  // 山口兩端接回大地圖：南端回到西側，北端出到東側
  ['world', 'world2'].forEach(function (w) {
    (D.maps[w].shankou || []).forEach(function (sk) {
      [sk.id, sk.id + '_2', sk.id + '_3'].forEach(function (mid) {
        const m = D.maps[mid]; if (!m) return; m.home = { map: w };
        m.warps.forEach(function (wp) { if (wp.to === 'WORLD') { wp.to = w; wp.tx = wp.y >= 26 ? sk.x - 2 : sk.x + 2; wp.ty = sk.y; } });
      });
    });
  });
})();
