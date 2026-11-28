// 第四章「許都風雲」（批次1）：許都煮酒論英雄 → 衣帶詔 → 汝南叛曹（車冑）→ 鄴城見袁紹 → 白馬（顏良）→ 延津（文丑）→ 官渡
// 地圖由 data/ch4world.js 產生（tools/build_ch4.py）。這裡是敵人、裝備、房屋、商店、對話、任務，與 world3 通往這裡的關門。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };

  // ================= 敵人 =================
  B.enemies.yu_bandit = { name: '豫州流寇', terrain: T('A', 'B', 'B', 'C'), int: 10, lead: 12, luck: 5, title: '汝南餘黨', cls: '賊兵', weapon: '刀', desc: '黃巾散去之後留在汝南、潁川一帶的老盜匪，換了好幾個旗號，人還是那幾個人。', hp: 1450, atk: 108, def: 52, spd: 13, exp: 260, gold: 180, sprite: 2 };
  B.enemies.yuan_infantry = { name: '袁軍步兵', terrain: T('A', 'B', 'B', 'C'), int: 10, lead: 14, luck: 5, title: '河北步卒', cls: '步兵', weapon: '槍', desc: '袁紹從冀州帶出來的步兵，人多、盔亮、旗子大，打仗的氣勢全寫在行頭上。', hp: 1700, atk: 114, def: 58, spd: 12, exp: 300, gold: 200, sprite: 3 };
  B.enemies.yuan_crossbow = { name: '袁軍弩手', terrain: T('B', 'A', 'B', 'C'), int: 14, lead: 10, luck: 6, title: '河北弩兵', cls: '弓兵', weapon: '弓', desc: '袁軍的強弩手，據說一輪齊射能把樹林射成牙籤堆。', hp: 700, atk: 118, def: 32, spd: 17, exp: 290, gold: 200, sprite: 20 };
  B.enemies.hebei_cav = { name: '河北騎兵', terrain: T('A', 'C', 'C', 'C'), int: 10, lead: 14, luck: 6, title: '河北精騎', cls: '騎兵', weapon: '槍', desc: '冀州的馬好、人壯，衝起來像一堵會喘氣的牆。', hp: 1500, atk: 122, def: 50, spd: 20, exp: 320, gold: 220, sprite: 11 };
  B.enemies.yuan_elite = { name: '河北精銳', terrain: T('A', 'B', 'A', 'C'), int: 12, lead: 18, luck: 6, title: '袁紹親兵', cls: '精兵', weapon: '槍', desc: '袁紹麾下挑出來的親兵，個頭整齊、盔甲鋥亮，主要任務是讓主公看了開心。', hp: 1950, atk: 124, def: 62, spd: 14, exp: 380, gold: 260, sprite: 53 };
  B.enemies.chezhou = { name: '車冑', terrain: T('A', 'B', 'B', 'C'), int: 34, lead: 48, luck: 8, title: '徐州刺史・曹操親信', cls: '刺史', weapon: '槍', desc: '曹操留在徐州的親信，奉命盯著劉備。他不是個壞人，只是運氣不好，剛好站在歷史要殺人的那條路上。', hp: 38000, atk: 190, def: 88, spd: 19, exp: 5600, gold: 4200, sprite: 56, boss: true, ai: 'boss' };
  B.enemies.yanliang = { name: '顏良', terrain: T('A', 'B', 'B', 'C'), int: 24, lead: 52, luck: 10, title: '河北上將', cls: '猛將', weapon: '刀', desc: '袁紹麾下的河北名將，勇猛過人，只是脾氣和主公一樣急。據說他打仗時，連自己人都要躲著走。', hp: 42000, atk: 194, def: 92, spd: 20, exp: 6600, gold: 5000, sprite: 57, boss: true, ai: 'boss' };
  B.enemies.wenchou = { name: '文丑', terrain: T('A', 'B', 'B', 'C'), int: 26, lead: 50, luck: 10, title: '河北上將', cls: '猛將', weapon: '槍', desc: '顏良的老搭檔，和顏良並稱河北雙壁。他最大的毛病，就是替朋友報仇的時候太急。', hp: 44000, atk: 200, def: 92, spd: 22, exp: 7000, gold: 5200, sprite: 58, boss: true, ai: 'boss' };
  // 一般遇敵：第四章三區（許都與汝南、官渡與延津、白馬與鄴城）
  B.groups.field14 = [['yu_bandit', 'yu_bandit', 'yuan_infantry', 'yuan_crossbow'], ['yu_bandit', 'yu_bandit', 'yu_bandit', 'yuan_crossbow'], ['yuan_infantry', 'yuan_infantry', 'yu_bandit', 'yuan_crossbow', 'yuan_crossbow'], ['yu_bandit', 'yuan_infantry', 'yuan_infantry', 'hebei_cav']];
  B.groups.field15 = [['yuan_infantry', 'yuan_infantry', 'yuan_crossbow', 'hebei_cav'], ['yuan_infantry', 'yuan_infantry', 'yuan_infantry', 'yuan_crossbow'], ['hebei_cav', 'hebei_cav', 'yuan_infantry', 'yuan_crossbow', 'yuan_crossbow'], ['yuan_infantry', 'hebei_cav', 'hebei_cav', 'yu_bandit']];
  B.groups.field16 = [['yuan_elite', 'yuan_infantry', 'yuan_crossbow', 'hebei_cav'], ['yuan_elite', 'yuan_elite', 'yuan_crossbow', 'yuan_crossbow'], ['hebei_cav', 'hebei_cav', 'hebei_cav', 'yuan_crossbow', 'yuan_crossbow'], ['yuan_elite', 'yuan_elite', 'hebei_cav', 'yuan_infantry']];
  B.groups.boss21 = [['chezhou', 'yu_bandit', 'yu_bandit', 'yuan_infantry', 'yuan_infantry']];
  B.groups.boss22 = [['yanliang', 'yuan_elite', 'yuan_elite', 'yuan_crossbow', 'yuan_crossbow']];
  B.groups.boss23 = [['wenchou', 'yuan_elite', 'hebei_cav', 'hebei_cav', 'yuan_crossbow']];
  // 打倒之後在野外還會（機率低）遇到的殘部
  B.rematch.chezhou_down = 'chezhou'; B.rematch.yanliang_down = 'yanliang'; B.rematch.wenchou_down = 'wenchou';
  ['chezhou', 'yanliang', 'wenchou'].forEach(function (id) { B.enemies[id + '_r'] = Object.assign({}, B.enemies[id], { rematchOf: id }); });
  Object.assign(D.terrainHome, { yu_bandit: 'plain', yuan_infantry: 'plain', yuan_crossbow: 'forest', hebei_cav: 'plain', yuan_elite: 'plain', chezhou: 'plain', yanliang: 'plain', wenchou: 'plain' });
  ['yu_bandit', 'yuan_infantry', 'yuan_crossbow', 'hebei_cav', 'yuan_elite', 'chezhou', 'yanliang', 'wenchou'].forEach(function (id) {
    D.applyTerrain(id, B.enemies[id], !!B.enemies[id].boss);
    if (B.enemies[id + '_r']) D.applyTerrain(id + '_r', B.enemies[id + '_r'], true);
  });

  // ================= 裝備 =================
  const G5 = {
    xu_sword: { name: '許都劍', slot: 'weapon', wtype: '劍', mods: { pow: 44, int: 3 }, price: 2200, desc: '許都官匠鑄的劍，劍鞘上刻了一行「奉天子詔」，不知道是自己刻的還是別人刻的。' },
    xu_blade: { name: '百鍊環刀', slot: 'weapon', wtype: '刀', mods: { pow: 44, spd: 1 }, price: 2200, desc: '一把刀鍛了百次，鍛到後來鐵匠自己也忘了原本想打的是什麼。' },
    xu_lance: { name: '蛇矛・仿', slot: 'weapon', wtype: '矛', mods: { pow: 44, grd: 3 }, price: 2240, desc: '仿蛇矛的樣子打的，矛頭彎彎曲曲，據說是為了嚇人。' },
    xu_spear: { name: '百戰鐵槍', slot: 'weapon', wtype: '槍', mods: { pow: 47, spd: -1 }, price: 2280, desc: '槍桿上留著使用者的指痕，一把槍被握過上萬次才會有的那種亮。' },
    xu_fan: { name: '羽扇・青鸞', slot: 'weapon', wtype: '扇', mods: { int: 22, lead: 3 }, price: 2280, desc: '扇骨上畫了一隻青鸞，據說搖起來有風聲，不過可能是畫上去的。' },
    scale_armor: { name: '魚鱗甲', slot: 'armor', mods: { def: 22, spd: -1 }, price: 2200, desc: '鐵片排得像魚鱗，下雨天會發出沙沙的聲音，可惜敵人不會因此覺得浪漫。' },
    dragon_helm: { name: '蟠龍盔', slot: 'helm', mods: { def: 10, grd: 5, lead: 2 }, price: 1700, desc: '盔頂盤了一條龍，龍的表情看起來很不耐煩。' },
    cloud_boots: { name: '踏雲靴', slot: 'boots', mods: { spd: 8, def: 4 }, price: 1800, desc: '靴底有雲紋，穿起來腳步輕，被追殺的時候格外有感。' },
    jade_seal_charm: { name: '玉帶佩', slot: 'charm', mods: { lead: 11, grd: 3 }, price: 1700, desc: '一條繫著小玉珮的衣帶。聽說有人曾把一份很重要的詔書縫在這種帶子裡。' },
    chezhou_lance: { name: '刺史長槍', slot: 'weapon', wtype: '槍', mods: { pow: 76, grd: 2 }, price: 0, desc: '車冑的長槍，槍柄上刻了「徐州」兩個字，後面又被劃掉改刻成「豫州」。' },
    yanliang_blade: { name: '河北大刀', slot: 'weapon', wtype: '刀', mods: { pow: 82, spd: 1 }, price: 0, desc: '顏良的大刀，刀面寬得能當盾牌，刀柄上纏著袁家的紅絲。' },
    wenchou_spear: { name: '河北雙壁槍', slot: 'weapon', wtype: '槍', mods: { pow: 84, spd: 1 }, price: 0, desc: '文丑的長槍，槍纓是藍的。他說這是為了和顏良的紅纓分得開，免得打仗時互相認錯。' },
    yuan_armor: { name: '河北精銳甲', slot: 'armor', mods: { def: 30, spd: -1 }, price: 0, desc: '袁紹親兵穿的鎧甲，擦得能照出人影，所以敵人通常能先看見自己的狼狽樣。' }
  };
  Object.keys(G5).forEach(function (k) { E[k] = G5[k]; });
  D.drops.chezhou = ['chezhou_lance', 1.0]; D.drops.chezhou_r = ['chezhou_lance', 0.2];
  D.drops.yanliang = ['yanliang_blade', 1.0]; D.drops.yanliang_r = ['yanliang_blade', 0.2];
  D.drops.wenchou = ['wenchou_spear', 1.0]; D.drops.wenchou_r = ['wenchou_spear', 0.2];
  D.drops.yuan_elite = ['yuan_armor', 0.03];

  // ================= 商店 =================
  const W5 = ['fine_sword', 'fine_blade', 'fine_lance', 'fine_spear', 'sage_fan', 'xu_sword', 'xu_blade', 'xu_lance', 'xu_spear', 'xu_fan'];
  const A5 = ['lamellar', 'scale_armor', 'tiger_helm', 'dragon_helm', 'swift_boots', 'cloud_boots', 'war_banner', 'tiger_tally', 'jade_seal_charm', 'guard_charm'];
  const SAY = {
    weapon: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，刀槍劍戟扇都有。買賣都行，你的舊兵器我也收，只是只給一半價。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    armor: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，甲、盔、靴、飾品都有。穿得好，才活得久。舊的你要賣，我也收。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    general: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，藥品和雜貨都有。多備幾包藥，保命用。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; }
  };
  const defShop = function (town, kind, shopName, keeper) {
    const id = town + '_' + kind;
    D.shopKinds[id] = kind; D.shopNames[id] = shopName;
    D.shops[id] = kind === 'weapon' ? W5 : kind === 'armor' ? A5 : D.shops.medic4;
    S['shop_' + id] = SAY[kind](keeper, shopName).map(function (l) { return JSON.parse(JSON.stringify(l).replace('"$"', JSON.stringify(id))); });
    return id;
  };

  // ================= 城裡的房屋 =================
  const SLOTS = [[3, 2]];
  const innLines = function (who, hello) { return [{ speaker: who, text: hello, choices: [{ label: '住宿 30金', act: { rest: true } }, { label: '不住了' }] }]; };
  const HOUSES = {
    xudu: [
      { name: '丞相府偏廳', size: 'small', chest: { id: 'h_xd_a', gold: 1200, item: { herb3: 2, tonic3: 1 }, msg: '偏廳的茶几下，壓著一袋曹操犒賞賓客用的銀子。' },
        npc: { name: '府中侍從', sprite: 10, lines: ['侍從：丞相府裡規矩多，連倒茶都要先喊一聲「茶來了」，免得客人以為是毒藥。', '侍從：荀令君說，這叫「先通報再下藥」。……我覺得這說法有點不對勁。'] } },
      { kind: 'inn', id: 'inn', name: '許都客棧', keeper: '掌櫃', sprite: 4, hello: '許都是天子腳下，客棧也講究。住一晚吧，床單是當天洗的。' },
      { kind: 'weapon', name: '許都武器店', keeper: '鐵匠', sprite: 11, tier: 5 },
      { kind: 'armor', name: '許都防具店', keeper: '甲冑匠', sprite: 8, tier: 5 },
      { kind: 'general', name: '許都雜貨店', keeper: '掌櫃', sprite: 4, tier: 5 },
      { name: '董承府', size: 'small', chest: { id: 'h_xd_b', gold: 900, msg: '董府書房的暗格裡，有一小袋金子和一張空白的絹帛。' },
        npc: { name: '董府家丁', sprite: 9, states: [
          { flag: 'xd_belt', lines: ['家丁：我家老爺最近喜歡摸衣帶，一邊摸一邊歎氣。小的什麼都沒看見。', '家丁：……我是說，小的什麼都看見了，但我嘴很緊。'] },
          { lines: ['家丁：我家老爺是國舅，天子的岳丈……不對，是天子的「董貴人」的父親。反正都是皇親。', '家丁：他最近老往曹丞相府跑，說是去喝茶。我看他是去探口風。'] }] } }
    ],
    runan: [
      { name: '汝南縣衙', size: 'big', chest: { id: 'h_rn4_a', gold: 1000, item: { herb3: 1 }, msg: '縣衙帳房的櫃子裡，有一袋沒來得及發出去的軍餉。' },
        npc: { name: '縣吏', sprite: 9, lines: ['縣吏：汝南這幾年換主換得比換季還勤，今天是黃巾，明天是袁術，後天不知道是誰。', '縣吏：我們縣衙現在的規矩是：誰來都請坐，誰走都不送。'] } },
      { kind: 'inn', id: 'inn', name: '汝南客棧', keeper: '掌櫃', sprite: 4, hello: '汝南客棧，不問來路。住一晚吧，錢先付，免得您半夜被抓走。' },
      { kind: 'weapon', name: '汝南武器店', keeper: '鐵匠', sprite: 11, tier: 5 },
      { kind: 'armor', name: '汝南防具店', keeper: '甲冑匠', sprite: 8, tier: 5 },
      { kind: 'general', name: '汝南雜貨店', keeper: '掌櫃', sprite: 4, tier: 5 }
    ],
    guandu: [
      { name: '官渡糧倉', size: 'big', chest: { id: 'h_gd_a', gold: 1500, item: { herb3: 2, tonic3: 2 }, msg: '糧倉最裡面的小櫃裡，有一包預備犒賞押糧官的銀子。' },
        npc: { name: '押糧官', sprite: 9, lines: ['押糧官：官渡這地方，別的沒有，就是糧多。丞相說，守得住糧，就守得住天下。', '押糧官：可是袁紹的人多啊……他們一人吃一口，我們就要沒了。'] } },
      { kind: 'inn', id: 'inn', name: '官渡客棧', keeper: '掌櫃', sprite: 4, hello: '官渡這幾天全是兵，客棧倒是安靜。住一晚吧，這是最後一間乾淨的房。' },
      { kind: 'weapon', name: '官渡武器店', keeper: '鐵匠', sprite: 11, tier: 5 },
      { kind: 'general', name: '官渡雜貨店', keeper: '掌櫃', sprite: 4, tier: 5 },
      { name: '軍營民宅', size: 'small', chest: { id: 'h_gd_b', gold: 1100, msg: '民宅的床底下，藏著一包士兵寄放的軍餉。' },
        npc: { name: '老兵', sprite: 6, lines: ['老兵：我打過黃巾、打過董卓，沒想到老了還要在官渡守糧。', '老兵：丞相說，這是最後一仗。我聽了三十年，每次都是最後一仗。'] } }
    ],
    yanjin: [
      { name: '渡口民宅', size: 'small', chest: { id: 'h_yj_a', gold: 1000, item: { herb3: 1, tonic3: 1 }, msg: '渡口船夫家的魚簍底下，壓著一小袋過路人給的渡資。' },
        npc: { name: '船夫', sprite: 6, lines: ['船夫：黃河的水一年一個脾氣，今年脾氣特別壞。', '船夫：袁軍的人要渡河，一次就想包下十艘船，我說，船有，水不一定有。'] } },
      { name: '延津縣衙', size: 'big', chest: { id: 'h_yj_b', gold: 1300, msg: '縣衙的公文櫃深處，有一份寫了一半的軍報，旁邊壓著一袋賞銀。' },
        npc: { name: '縣吏', sprite: 10, lines: ['縣吏：延津是渡口城，誰要渡河都得先過我這裡。我每天蓋印蓋到手軟。', '縣吏：今天蓋的最多的是袁軍的通行文書。唉，蓋印是我的命，也是我的罪。'] } },
      { kind: 'inn', id: 'inn', name: '延津客棧', keeper: '掌櫃', sprite: 4, hello: '延津客棧，聽得見黃河水聲。住一晚吧，睡著了就聽不見了。' },
      { kind: 'weapon', name: '延津武器店', keeper: '鐵匠', sprite: 11, tier: 5 },
      { kind: 'general', name: '延津雜貨店', keeper: '掌櫃', sprite: 4, tier: 5 }
    ],
    baima: [
      { name: '白馬縣衙', size: 'big', chest: { id: 'h_bm_a', gold: 1400, item: { herb3: 2, revive: 1 }, msg: '縣衙的案桌下，劉延留了一袋預備犒軍的賞銀。' },
        npc: { name: '守城校尉', sprite: 9, lines: ['校尉：太守劉延說，白馬城小，守不住也要守。我們現在每天最大的娛樂，就是數對面的旗。', '校尉：今天對面的旗，比昨天又多了一面。'] } },
      { kind: 'inn', id: 'inn', name: '白馬客棧', keeper: '掌櫃', sprite: 4, hello: '白馬客棧，城裡最後一家還開著的店。住一晚吧，明天可能就沒了。' },
      { kind: 'weapon', name: '白馬武器店', keeper: '鐵匠', sprite: 11, tier: 5 },
      { kind: 'armor', name: '白馬防具店', keeper: '甲冑匠', sprite: 8, tier: 5 },
      { kind: 'general', name: '白馬雜貨店', keeper: '掌櫃', sprite: 4, tier: 5 }
    ],
    ye: [
      { name: '袁府偏院', size: 'small', chest: { id: 'h_ye_a', gold: 1600, item: { tonic3: 2, herb3: 2 }, msg: '袁府偏院的箱子裡，裝著一小袋準備賞給賓客的金餅。' },
        npc: { name: '袁府侍從', sprite: 10, lines: ['侍從：我家主公四世三公，家裡的杯子比縣衙的印還多。', '侍從：他說，打仗就是比誰的杯子多。我聽了覺得……很有道理，又好像哪裡不對。'] } },
      { kind: 'inn', id: 'inn', name: '鄴城客棧', keeper: '掌櫃', sprite: 4, hello: '鄴城是河北第一大城，客棧也氣派。住一晚吧，早飯有羊肉。' },
      { kind: 'weapon', name: '鄴城武器店', keeper: '鐵匠', sprite: 11, tier: 5 },
      { kind: 'armor', name: '鄴城防具店', keeper: '甲冑匠', sprite: 8, tier: 5 },
      { kind: 'general', name: '鄴城雜貨店', keeper: '掌櫃', sprite: 4, tier: 5 },
      { name: '田豐故居', size: 'small', chest: { id: 'h_ye_b', gold: 800, msg: '書房的案頭，一冊攤開的兵書下壓著一小袋錢。' },
        npc: { name: '田家老僕', sprite: 6, lines: ['老僕：我家老爺田豐，一天要勸主公三次。主公聽了兩次，煩了一次。', '老僕：老爺說，主公要是聽他的，就贏；不聽，就輸。我看，這兩條都不太好聽。'] } }
    ]
  };
  Object.keys(HOUSES).forEach(function (town) {
    const tm = D.maps[town], doors = D.ch4Doors[town];
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
        else { dlg = 'shop_' + defShop(town, h.kind, h.name, h.keeper); }
        npcs.push({ id: id + '_keeper', name: h.keeper, sprite: h.sprite, x: 4, y: 2, dir: 'down', dialogue: dlg, alts: [] });
      } else {
        const n = h.npc, alts = [];
        let def = null;
        (n.states || [{ lines: n.lines }]).forEach(function (st, k) {
          const key = 'h_' + town + '_' + i + '_0_' + k;
          S[key] = st.lines.map(function (t) {
            const m = /^([^：]{1,8})：(.*)$/.exec(t);
            return { speaker: m ? m[1] : n.name, text: m ? m[2] : t };
          });
          if (st.flag) alts.push({ flag: st.flag, dialogue: key }); else def = key;
        });
        npcs.push({ id: id + '_n0', name: n.name, sprite: n.sprite, x: SLOTS[0][0] + (big ? 1 : 0), y: SLOTS[0][1], dir: 'down', dialogue: def || alts[alts.length - 1].dialogue, alts: alts });
        if (h.chest) objects.push(Object.assign({ type: 'chest', x: w - 2, y: 1 }, h.chest));
      }
      D.maps[id] = { name: h.name, tiles: rows, start: { x: dx, y: ht - 2, dir: 'up' },
        warps: [{ x: dx, y: ht - 1, to: town, tx: ds[0][0], ty: ds[0][1] + 1, dir: 'down' }].concat(ds.length > 1 ? [{ x: dx + 1, y: ht - 1, to: town, tx: ds[1][0], ty: ds[1][1] + 1, dir: 'down' }] : []),
        npcs: npcs, objects: objects };
      ds.forEach(function (d) { tm.warps.push({ x: d[0], y: d[1], to: id, tx: dx, ty: ht - 2, dir: 'up' }); });
    });
  });
  // 戶外商販（沒有房子可以分配的店）
  defShop('guandu', 'armor', '官渡防具攤', '行腳甲冑商'); defShop('yanjin', 'armor', '延津防具攤', '渡口甲冑商');
  const nm = D.maps;
  nm.guandu.npcs.push({ id: 'gd_armorer', name: '行腳甲冑商', sprite: 8, x: 8, y: 16, dir: 'right', dialogue: 'shop_guandu_armor' });
  nm.yanjin.npcs.push({ id: 'yj_armorer', name: '渡口甲冑商', sprite: 8, x: 8, y: 16, dir: 'right', dialogue: 'shop_yanjin_armor' });

  // ================= 城裡的人（主線與閒聊） =================
  const P = function (map, o) { nm[map].npcs.push(o); };
  // ---- 許都
  nm.xudu.events.push({ once: 'xd_intro_done', dialogue: 'xd_intro' });
  P('xudu', { id: 'xd_caocao', name: '曹操', sprite: 17, x: 11, y: 7, dir: 'down', dialogue: 'xd_caocao', alts: [{ flag: 'xd_wine', dialogue: 'xd_caocao2' }] });
  P('xudu', { id: 'xd_xunyu', name: '荀彧', sprite: 60, x: 9, y: 7, dir: 'right', dialogue: 'xd_xunyu', alts: [{ flag: 'xd_belt', dialogue: 'xd_xunyu3' }, { flag: 'xd_wine', dialogue: 'xd_xunyu2' }] });
  P('xudu', { id: 'xd_dongcheng', name: '董承', sprite: 61, x: 14, y: 11, dir: 'left', dialogue: 'xd_dongcheng', alts: [{ flag: 'xd_belt', dialogue: 'xd_dongcheng2' }], showIf: 'xd_wine' });
  P('xudu', { id: 'xd_guard', name: '禁軍', sprite: 9, x: 6, y: 12, dir: 'right', dialogue: 'xd_guard' });
  P('xudu', { id: 'xd_scholar', name: '太學生', sprite: 10, x: 17, y: 12, dir: 'left', dialogue: 'xd_scholar' });
  // ---- 汝南
  P('runan', { id: 'rn_chezhou', name: '車冑', sprite: 62, x: 12, y: 8, dir: 'down', dialogue: 'boss_chezhou', showIf: 'xd_belt', hideIf: 'chezhou_down' });
  P('runan', { id: 'rn_courier', name: '快馬信使', sprite: 9, x: 7, y: 12, dir: 'right', dialogue: 'rn_courier', showIf: 'chezhou_down' });
  P('runan', { id: 'rn_citizen', name: '汝南百姓', sprite: 7, x: 17, y: 11, dir: 'left', dialogue: 'rn_citizen' });
  // ---- 鄴城
  nm.ye.events.push({ once: 'ye_intro_done', dialogue: 'ye_intro', need: ['chezhou_down'] });
  P('ye', { id: 'ye_yuanshao', name: '袁紹', sprite: 65, x: 11, y: 7, dir: 'down', dialogue: 'ye_yuanshao', alts: [{ flag: 'ye_meet', dialogue: 'ye_yuanshao2' }] });
  P('ye', { id: 'ye_tianfeng', name: '田豐', sprite: 10, x: 8, y: 7, dir: 'right', dialogue: 'ye_tianfeng' });
  P('ye', { id: 'ye_guard', name: '袁軍衛士', sprite: 9, x: 15, y: 12, dir: 'left', dialogue: 'ye_guard' });
  // ---- 白馬
  P('baima', { id: 'bm_liuyan', name: '劉延', sprite: 9, x: 11, y: 5, dir: 'down', dialogue: 'bm_liuyan', alts: [{ flag: 'yanliang_down', dialogue: 'bm_liuyan2' }], showIf: 'ye_meet' });
  P('baima', { id: 'bm_yanliang', name: '顏良', sprite: 63, x: 12, y: 16, dir: 'up', dialogue: 'boss_yanliang', showIf: 'ye_meet', hideIf: 'yanliang_down' });
  P('baima', { id: 'bm_soldier', name: '守城兵', sprite: 9, x: 16, y: 11, dir: 'left', dialogue: 'bm_soldier' });
  // ---- 延津
  P('yanjin', { id: 'yj_wenchou', name: '文丑', sprite: 64, x: 12, y: 16, dir: 'up', dialogue: 'boss_wenchou', showIf: 'yanliang_down', hideIf: 'wenchou_down' });
  P('yanjin', { id: 'yj_refugee', name: '難民', sprite: 7, x: 15, y: 11, dir: 'left', dialogue: 'yj_refugee' });
  // ---- 官渡
  nm.guandu.events.push({ once: 'gd_intro_done', dialogue: 'gd_intro', need: ['wenchou_down'] });
  P('guandu', { id: 'gd_caocao', name: '曹操', sprite: 17, x: 11, y: 6, dir: 'down', dialogue: 'gd_caocao', showIf: 'wenchou_down' });
  P('guandu', { id: 'gd_xunyu', name: '荀彧', sprite: 60, x: 9, y: 6, dir: 'right', dialogue: 'gd_xunyu', showIf: 'wenchou_down' });
  P('guandu', { id: 'gd_soldier', name: '押運兵', sprite: 9, x: 6, y: 11, dir: 'right', dialogue: 'gd_soldier' });

  // ================= 對話 =================
  S.pass_sealed4 = [{ speaker: '', text: '關門守軍攔住去路：「下邳的事情還沒了結，東邊許都的令牌還沒發下來，不能放行！」' }];
  S.xd_intro = [
    { speaker: '', text: '許都。漢天子遷來的新都，城牆新、宮殿新、街上的禁軍盔甲也新，只有人心是舊的。' },
    { speaker: '', text: '曹操把天子迎到這裡，「奉天子以令不臣」，一句話，就讓他的每一道命令都有了名分。', set: { xd_intro_done: true } },
    { speaker: '劉備', text: '這座城……比洛陽，更像個家。可是，不像漢家的家。' },
    { speaker: '諸葛貓妖', text: '喵……我讀過的書裡，這一段叫做「挾天子」。……我現在才明白，那三個字有多重。' },
    { speaker: '張飛', text: '什麼挾不挾的，俺看這城裡，連條野狗都排隊。' }
  ];
  S.xd_guard = [{ speaker: '禁軍', text: '站住！……喔，是劉使君的人。丞相有令，凡是劉使君的人，不必搜身，只需要「目送」。' }];
  S.xd_scholar = [{ speaker: '太學生', text: '我讀了十年書，最想問天子一句話：您的衣服，是不是比丞相的新？……我沒敢問。' }];
  S.xd_caocao = [
    { speaker: '曹操', text: '玄德！下邳一戰，你的名聲，天下人都聽說了。我已上表天子，封你為左將軍，從此，你我是自己人。' },
    { speaker: '劉備', text: '丞相厚愛，備愧不敢當。' },
    { speaker: '曹操', text: '少來這套。今晚，我在後園擺了幾顆青梅、一壺煮酒，咱們好好聊聊。……就咱們幾個，你跟貓先生，一起來。' },
    { speaker: '', text: '（後園。青梅酸、酒燙，天上烏雲堆成了山。曹操揮了揮手，侍從把旁人都支開了。）' },
    { speaker: '曹操', text: '玄德，你說說看，如今天下，誰算得上英雄？' },
    { speaker: '劉備', text: '備……肉眼凡胎，哪裡認得英雄。', choices: [
      { label: '袁紹四世三公，兵多將廣', set: { xd_wine_a: true } },
      { label: '袁術、劉表、孫策之流', set: { xd_wine_b: true } },
      { label: '備怎麼知道？吃梅子吃梅子', set: { xd_wine_c: true } }] },
    { speaker: '曹操', text: '哈哈哈！袁紹色厲膽薄，好謀無斷；袁術是塚中枯骨；劉表徒有虛名……天下英雄，唯使君與操耳！' },
    { speaker: '', text: '（轟隆——一聲驚雷，劉備手裡的筷子「噹」一聲掉在了地上。）' },
    { speaker: '劉備', text: '哎呀！這雷，嚇我一跳！' },
    { speaker: '諸葛貓妖', text: '（……喵。他剛才的演技，我想給滿分。）' },
    { speaker: '曹操', text: '大丈夫也怕雷？哈哈，坐，坐。', set: { xd_wine: true } },
    { speaker: '', text: '（得到曹操的賞賜：金 1500。）', act: { once: 'xd_wine_gold', gold: 1500 } }
  ];
  S.xd_caocao2 = [{ speaker: '曹操', text: '玄德，天子身邊的人，你多留心。……當然，我也留心你。哈哈，開玩笑的。' }];
  S.xd_xunyu = [
    { speaker: '荀彧', text: '在下荀彧，在丞相帳下理些文書。劉使君、貓先生，久仰。' },
    { speaker: '荀彧', text: '丞相迎天子，是為了讓天下人看見：有一個人，願意替漢室扛這個擔子。至於這個擔子最後有多重，現在還不好說。' }
  ];
  S.xd_xunyu2 = [
    { speaker: '荀彧', text: '聽說昨夜後園的雷，劉使君嚇掉了筷子？呵，丞相回來時，心情很好。' },
    { speaker: '荀彧', text: '……不過，使君，丞相心情好的時候，通常是他最想把事情做絕的時候。小心。' }
  ];
  S.xd_xunyu3 = [{ speaker: '荀彧', text: '董國舅那邊的事……我什麼都沒聽見。使君，請務必快些離開許都，越快越好。' }];
  S.xd_dongcheng = [
    { speaker: '董承', text: '劉使君，請借一步說話。……天子命我，密授衣帶詔。詔在這件袍的衣帶裡。' },
    { speaker: '董承', text: '曹操挾天子以令諸侯，朝中大臣敢怒不敢言。如今只有使君，才有膽量與他一搏。' },
    { speaker: '劉備', text: '……國舅，備是漢室宗親，天子有詔，備豈能不受？只是此事，千萬要小心。' },
    { speaker: '諸葛貓妖', text: '（喵……我記得這一段。衣帶詔，後來洩露，董承全家都……我不能說。）' },
    { speaker: '董承', text: '今夜的事，只有天知、地知、你我知。', set: { xd_belt: true } },
    { speaker: '', text: '（得到玉帶佩。）', act: { once: 'xd_belt_gift', gear: ['jade_seal_charm'] } }
  ];
  S.xd_dongcheng2 = [{ speaker: '董承', text: '詔書要藏好，衣帶要綁緊。使君，汝南那邊，有人在等你。' }];
  S.boss_chezhou = [
    { speaker: '車冑', text: '劉使君，丞相命我盯著你。可你竟然帶著人，一路走到了汝南？' },
    { speaker: '劉備', text: '車刺史，備有詔在身，不得不為漢室行事。請你讓開。' },
    { speaker: '車冑', text: '詔書？什麼詔書？使君，你這是要造反啊！' },
    { speaker: '諸葛貓妖', text: '（喵……歷史上，車冑是被關羽斬在徐州。這次換成汝南……我改了地點，沒改結果。）' },
    { speaker: '關羽', text: '車刺史，請。' },
    { speaker: '車冑', text: '來吧！我車冑，是丞相的人，絕不讓你過去！', act: { battle: 'boss21', flag: 'chezhou_down', after: 'chezhou_after' } }
  ];
  S.chezhou_after = [
    { speaker: '車冑', text: '……我輸了。丞相，我對不起您。' },
    { speaker: '劉備', text: '車刺史，備並無加害之心，只是，此事已經回不了頭。' },
    { speaker: '車冑', text: '……你們快走吧。丞相的人，很快就會到。' },
    { speaker: '', text: '（獲得刺史長槍、金 4200。）', act: { gold: 4200 } },
    { speaker: '諸葛貓妖', text: '喵……我們現在，就是曹操的叛臣了。' },
    { speaker: '劉備', text: '備不是叛臣，備是天子的臣。', set: { ch4_rebel: true } },
    { speaker: '張飛', text: '大哥，咱們現在去哪兒？' },
    { speaker: '劉備', text: '北渡黃河，去鄴城。袁本初與曹操不睦，也許，那裡能暫借容身。' }
  ];
  S.rn_courier = [{ speaker: '快馬信使', text: '急報！曹丞相親率大軍東征，說要「親自來看看劉備」！……您，您就是劉備？啊，我什麼都沒說！' }];
  S.rn_citizen = [{ speaker: '汝南百姓', text: '汝南這地方，每隔幾年就換一個主人，我們百姓的規矩是：誰來，就唱誰的歌。' }];
  S.ye_intro = [
    { speaker: '', text: '鄴城。冀州的大城，城高、兵多、旌旗滿街，整座城像是在說：「我們很有錢。」' },
    { speaker: '', text: '袁紹，四世三公，坐擁冀、青、幽、并四州之地，是天下最有資格稱雄的人。', set: { ye_intro_done: true } },
    { speaker: '劉備', text: '……這城，確實比許都更有帝王氣象。' },
    { speaker: '諸葛貓妖', text: '喵……氣象越大，裡面越空。我讀過的書，這樣的故事不少。' }
  ];
  S.ye_yuanshao = [
    { speaker: '袁紹', text: '玄德！我已聽說了，你在許都殺了曹操的刺史，實在痛快！' },
    { speaker: '袁紹', text: '曹操挾天子以令諸侯，我早看他不順眼。你我聯手，把他連根拔起，如何？' },
    { speaker: '劉備', text: '本初兄，備有詔在身，為漢室而戰，自當出力。' },
    { speaker: '袁紹', text: '好！我已派顏良為先鋒，進攻白馬。文丑隨後接應，大軍十萬，不日就能蕩平官渡！' },
    { speaker: '田豐', text: '主公，曹操用兵如神，我軍糧草雖多，卻不宜速戰。當以久持之策——' },
    { speaker: '袁紹', text: '田先生，你的話太多了。' },
    { speaker: '諸葛貓妖', text: '（……喵。他一句話，把最聰明的人堵回去了。歷史果然是這麼走的。）' },
    { speaker: '劉備', text: '本初兄，備願往白馬，替劉延太守解圍。' },
    { speaker: '袁紹', text: '白馬？……那是我軍要進攻的地方。玄德，你……罷了，你願去，就去吧。' },
    { speaker: '', text: '（劉備決定去白馬解圍。他有自己的打算：不能讓白馬百姓，成為兩家爭霸的犧牲品。）', set: { ye_meet: true } }
  ];
  S.ye_yuanshao2 = [{ speaker: '袁紹', text: '玄德去了白馬？好，好。顏良勇猛，應該用不著你。……不過，你要去就去。' }];
  S.ye_tianfeng = [
    { speaker: '田豐', text: '袁公人多、糧多、地多，可就是「聽」得少。' },
    { speaker: '田豐', text: '諸位，倘若這一仗輸了，請記得我說過：主公若聽我的，必勝。' }
  ];
  S.ye_guard = [{ speaker: '袁軍衛士', text: '我家主公說了，冀州大，鄴城更大。進城的人，不許迷路，更不許走錯路。' }];
  S.bm_liuyan = [
    { speaker: '劉延', text: '劉使君！太好了，城外顏良帶著大軍，我這座小城快撐不住了。' },
    { speaker: '劉備', text: '劉太守放心，備來助你。顏良就在城南。' },
    { speaker: '劉延', text: '顏良勇冠三軍，使君千萬小心。' }
  ];
  S.bm_liuyan2 = [{ speaker: '劉延', text: '白馬之圍已解。使君之恩，白馬百姓，永誌不忘。' }];
  S.bm_soldier = [{ speaker: '守城兵', text: '我昨天夜裡守了一晚，數了城外一千零八盞火把。數到最後一盞，天亮了。' }];
  S.boss_yanliang = [
    { speaker: '顏良', text: '就是你們，要替曹操守這座小城？來得好！我顏良的大刀，正愁沒人試！' },
    { speaker: '劉備', text: '顏將軍，白馬百姓無辜，何不退兵？' },
    { speaker: '顏良', text: '退兵？我家主公十萬大軍在後，這小城，今天就要踏平！' },
    { speaker: '關羽', text: '二哥我，來會會他。' },
    { speaker: '諸葛貓妖', text: '（……喵，歷史上，關羽在白馬一刀刺顏良於萬軍之中。這一次，我們來幫忙。）' },
    { speaker: '顏良', text: '少廢話！看刀！', act: { battle: 'boss22', flag: 'yanliang_down', after: 'yanliang_after' } }
  ];
  S.yanliang_after = [
    { speaker: '顏良', text: '……我顏良，一生不敗，今日卻輸給了……你們。' },
    { speaker: '關羽', text: '顏將軍，你的刀法，確是上品。只是，你選錯了主公。' },
    { speaker: '顏良', text: '……文丑……替我……報仇……' },
    { speaker: '', text: '（獲得河北大刀、金 5000。）', act: { gold: 5000 } },
    { speaker: '劉延', text: '白馬之圍解了！劉使君、關將軍，大恩不言謝！' },
    { speaker: '諸葛貓妖', text: '喵……文丑，很快就會來了。' }
  ];
  S.boss_wenchou = [
    { speaker: '文丑', text: '就是你們殺了顏良？我文丑，和顏良情同手足。今天，你們一個也別想走！' },
    { speaker: '劉備', text: '文將軍，顏良之事，備深感遺憾，可那一戰，是他先動的手。' },
    { speaker: '文丑', text: '廢話少說！我今天就要替顏良報仇！' },
    { speaker: '張飛', text: '來啊！俺老張正好手癢！', act: { battle: 'boss23', flag: 'wenchou_down', after: 'wenchou_after' } }
  ];
  S.wenchou_after = [
    { speaker: '文丑', text: '……顏良，我……來陪你了。' },
    { speaker: '劉備', text: '文將軍，河北雙壁，一世英名，今日同赴黃泉，備也深感惋惜。' },
    { speaker: '', text: '（獲得河北雙壁槍、金 5200。）', act: { gold: 5200 } },
    { speaker: '諸葛貓妖', text: '喵……河北最強的兩個人，都倒下了。官渡大戰，馬上就要開始。' },
    { speaker: '', text: '（曹操的軍隊，正駐紮在官渡。劉備一行，決定去官渡見一見曹操。）' }
  ];
  S.yj_refugee = [{ speaker: '難民', text: '我們是從白馬逃出來的。顏良被打倒了，可是文丑的大軍，還在延津。' }];
  S.gd_intro = [
    { speaker: '', text: '官渡。黃河南岸的一座糧城，曹操十萬大軍屯在這裡，與袁紹隔河對峙。' },
    { speaker: '', text: '城裡到處是糧車與營帳，士兵連夜修築營壘，整座城像一張拉滿的弓。', set: { gd_intro_done: true } },
    { speaker: '劉備', text: '……孟德兄，終於還是在這裡，和本初兄見面了。' },
    { speaker: '諸葛貓妖', text: '喵……這座城，就是歷史上那場「以少勝多」的地方。我讀過的書裡，最大的功臣，是糧草。' }
  ];
  S.gd_caocao = [
    { speaker: '曹操', text: '玄德！你竟然在白馬、延津，替我殺了顏良、文丑？' },
    { speaker: '劉備', text: '孟德兄，白馬百姓無辜，備不忍見其受戮。至於衣帶詔之事……備無話可說。' },
    { speaker: '曹操', text: '哈哈，衣帶詔的事，我早就知道了。可你今日救了白馬，我就不計較。' },
    { speaker: '曹操', text: '不過，天下事，從來不是你情我願。使君，你我分道揚鑣，總有一天，要再見面。' },
    { speaker: '關羽', text: '丞相，關某與大哥約定，雲長不負桃園之盟。……今日，是時候回大哥身邊了。' },
    { speaker: '曹操', text: '……雲長，你的心，我早就知道。罷了，罷了。這一路，保重。', set: { ch4_part1_end: true } },
    { speaker: '', text: '【第四章　許都風雲　前半　完】（關羽辭曹、千里走單騎，將在下一個版本登場。）' }
  ];
  S.gd_xunyu = [
    { speaker: '荀彧', text: '關將軍要走了。……其實，丞相比誰都不捨得，只是不說。' },
    { speaker: '荀彧', text: '使君，後會有期。願下一次相見，我們不在戰場上。' }
  ];
  S.gd_soldier = [{ speaker: '押運兵', text: '我一天要運三十車糧，一車一千斤。丞相說，這是糧，也是命。我說，那我運的是三十車命。' }];

  // ================= 主線任務 =================
  D.mainQuest.push(
    { done: 'xd_wine', title: '第四章：從下邳往東，進入許都，與曹操煮酒論英雄', world: 'world4', to: 'xudu', where: '許都', hint: '兗徐大地圖東北角（濮陽東邊）有一道關門，打完高順才會開。' },
    { done: 'xd_belt', title: '在許都城內找董承，接下衣帶詔', world: 'world4', to: 'xudu', where: '許都城內', hint: '董承在城裡的東南角。喝完酒後才會出現。' },
    { done: 'chezhou_down', title: '到汝南，擊敗車冑', world: 'world4', to: 'runan', where: '汝南', hint: '汝南在大地圖西南。車冑守在城裡。' },
    { done: 'ye_meet', title: '北渡黃河，到鄴城見袁紹', world: 'world4', to: 'ye', where: '鄴城', hint: '鄴城在大地圖最北，要過黃河上的渡橋。' },
    { done: 'yanliang_down', title: '到白馬，擊敗顏良，替劉延解圍', world: 'world4', to: 'baima', where: '白馬', hint: '白馬在大地圖東北，顏良守在城南。' },
    { done: 'wenchou_down', title: '到延津，擊敗文丑', world: 'world4', to: 'yanjin', where: '延津', hint: '延津在白馬西邊，文丑守在城南。' },
    { done: 'ch4_part1_end', title: '到官渡見曹操', world: 'world4', to: 'guandu', where: '官渡', hint: '官渡在大地圖中央，延津西南。' }
  );
  D.mainQuestEnd = '第四章前半已全部完成。關羽辭曹、千里走單騎與官渡之戰，將在後續版本登場。大地圖上的村莊、洞穴與支線，也可以先去看看。';

  // ================= 通往第三章大地圖的出口 =================
  // 兗徐大地圖（world3）東北：從濮陽往東開一條路，盡頭是一道關門，打完高順才會開。
  (function () {
    const m = D.maps.world3, grid = m.tiles.map(function (r) { return r.split(''); });
    for (let x = 61; x <= 77; x++) grid[13][x] = ',';
    for (let x = 70; x <= 76; x++) { grid[12][x] = 'g'; grid[14][x] = 'g'; }
    grid[13][78] = 'G'; grid[12][78] = 'Q'; grid[14][78] = 'Q'; grid[12][77] = 'Q'; grid[14][77] = 'Q'; grid[13][77] = ',';
    m.tiles = grid.map(function (r) { return r.join(''); });
    m.warps.push({ x: 78, y: 13, to: 'world4', tx: 3, ty: 35, dir: 'right', need: 'ch3_end', deny: 'pass_sealed4', bx: 77, by: 13 });
  })();
  D.worldBackfill.xudu = 'ch3_end'; D.worldBackfill.runan = 'xd_wine'; D.worldBackfill.ye = 'chezhou_down';
  D.worldBackfill.baima = 'ye_meet'; D.worldBackfill.yanjin = 'yanliang_down'; D.worldBackfill.guandu = 'wenchou_down';
})();
