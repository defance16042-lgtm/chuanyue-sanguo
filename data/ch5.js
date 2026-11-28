// 第五章「官渡烽火」（批次1）：田豐牢中勸諫 → 汝南擊退曹仁 → 荀彧託付偵察 → 陽武遇許攸 → 官渡獻計 → 烏巢火攻（淳于瓊）→ 張郃倒戈
//   → 黎陽（審配）→ 倉亭津（袁尚、袁紹病逝）→ 襄陽（蔡瑁、劉表）→ 新野（牧童與臥龍岡的歌）
// 地圖由 data/ch5world.js 產生（tools/build_ch5.py）。這裡是敵人、裝備、房屋、商店、人物、對話、任務與通往世界地圖的關門。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue, nm = D.maps;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };

  // ================= 敵人 =================
  const EN = B.enemies;
  EN.yuan_vet = { name: '袁軍老兵', terrain: T('A', 'B', 'B', 'C'), int: 11, lead: 16, luck: 5, title: '河北老卒', cls: '步兵', weapon: '槍', desc: '跟著袁紹打了十年仗的老兵，盔甲上的鏽比戰功多。', hp: 2200, atk: 142, def: 72, spd: 13, exp: 480, gold: 320, sprite: 3 };
  EN.yuan_ballista = { name: '袁軍強弩', terrain: T('B', 'A', 'B', 'C'), int: 15, lead: 10, luck: 6, title: '河北弩兵', cls: '弓兵', weapon: '弓', desc: '官渡土山上居高臨下的弩手，據說曹軍的帳篷都被他們射成了篩子。', hp: 900, atk: 146, def: 40, spd: 18, exp: 470, gold: 320, sprite: 20 };
  EN.yan_cav = { name: '冀州重騎', terrain: T('A', 'C', 'C', 'C'), int: 10, lead: 15, luck: 6, title: '冀州重騎兵', cls: '騎兵', weapon: '槍', desc: '連馬都披了甲的重騎兵，衝起來的聲音像一面倒下的城牆。', hp: 1950, atk: 150, def: 62, spd: 21, exp: 500, gold: 340, sprite: 11 };
  EN.cao_vet = { name: '曹軍老兵', terrain: T('A', 'B', 'B', 'C'), int: 13, lead: 20, luck: 6, title: '曹軍守兵', cls: '精兵', weapon: '槍', desc: '官渡一路守下來的曹軍老兵，口糧只剩三天，脾氣倒是比糧多。', hp: 2400, atk: 146, def: 78, spd: 14, exp: 520, gold: 350, sprite: 53 };
  EN.jing_soldier = { name: '荊州兵', terrain: T('A', 'B', 'B', 'B'), int: 11, lead: 14, luck: 6, title: '荊襄步卒', cls: '步兵', weapon: '槍', desc: '劉表治下的荊州兵，個個吃得白胖、練得整齊，打過的仗卻不多。', hp: 2350, atk: 152, def: 80, spd: 13, exp: 560, gold: 380, sprite: 2 };
  EN.jing_archer = { name: '荊州弓手', terrain: T('B', 'A', 'B', 'B'), int: 15, lead: 11, luck: 6, title: '荊襄弓兵', cls: '弓兵', weapon: '弓', desc: '襄陽城頭的弓手，射得準，只是平常沒什麼機會射活人。', hp: 960, atk: 154, def: 44, spd: 18, exp: 550, gold: 380, sprite: 22 };
  // 頭目：曹仁 62 號（戰鬥圖 60）、審配 61、其餘借用既有的戰鬥圖
  const BOSS = [
    ['caoren', '曹仁', '曹操族弟・征南將軍', '猛將', '槍', 60, 48000, 208, 96, 21, 8800, 6400, 26, 34, '曹操的族弟，守城是一把好手，進攻也不含糊。他在汝南追著劉備跑，追到劉備自己都覺得不好意思。'],
    ['chunyuqiong', '淳于瓊', '袁軍督軍・烏巢守將', '猛將', '刀', 52, 42000, 210, 96, 17, 9200, 6800, 20, 38, '袁紹派去守糧倉的督軍，能喝，更能睡。烏巢被燒的那天晚上，他剛好喝到第三壺。'],
    ['shenpei', '審配', '袁軍謀臣・鄴城守將', '謀臣', '扇', 61, 30000, 208, 88, 18, 9600, 7000, 24, 56, '袁紹麾下最固執的謀臣，守城與勸諫都一樣不肯退讓。他一輩子沒退過一步，包括退錯了的那一步。'],
    ['yuanshang', '袁尚', '袁紹之子・大將軍', '武將', '劍', 48, 50000, 216, 100, 20, 10000, 7200, 18, 32, '袁紹最疼的小兒子，穿得比誰都亮，只是打起仗來很少有人看他的臉色。他的哥哥很不服氣。'],
    ['caimao', '蔡瑁', '荊州水軍都督', '將領', '劍', 51, 52000, 220, 102, 19, 10400, 7600, 30, 46, '荊州的水軍都督，劉表的小舅子，最拿手的事是宴客，其次是在宴客時順便辦點別的事。']
  ];
  BOSS.forEach(function (b) {
    EN[b[0]] = { name: b[1], terrain: T('A', 'B', 'B', 'C'), int: b[12], lead: b[13], luck: 9, title: b[2], cls: b[3], weapon: b[4], desc: b[14], hp: b[6], atk: b[7], def: b[8], spd: b[9], exp: b[10], gold: b[11], sprite: b[5], boss: true, ai: 'boss' };
  });
  // 一般遇敵：field17（官渡一帶）、field18（荊州）
  B.groups.field17 = [['yuan_vet', 'yuan_vet', 'yuan_ballista', 'yan_cav'], ['yuan_vet', 'yuan_vet', 'yuan_vet', 'yuan_ballista'], ['yan_cav', 'yan_cav', 'yuan_vet', 'yuan_ballista', 'yuan_ballista'], ['cao_vet', 'yuan_vet', 'yuan_vet', 'yan_cav']];
  B.groups.field18 = [['jing_soldier', 'jing_soldier', 'jing_archer', 'yan_cav'], ['jing_soldier', 'jing_soldier', 'jing_soldier', 'jing_archer'], ['yan_cav', 'yan_cav', 'jing_soldier', 'jing_archer', 'jing_archer'], ['cao_vet', 'jing_soldier', 'jing_soldier', 'jing_archer']];
  B.groups.boss24 = [['caoren', 'cao_vet', 'cao_vet', 'yan_cav', 'yuan_ballista']];
  B.groups.boss25 = [['chunyuqiong', 'yuan_vet', 'yuan_vet', 'yuan_ballista', 'yuan_ballista']];
  B.groups.boss26 = [['shenpei', 'yuan_vet', 'yuan_ballista', 'yuan_ballista', 'yan_cav']];
  B.groups.boss27 = [['yuanshang', 'yan_cav', 'yan_cav', 'yuan_vet', 'yuan_ballista']];
  B.groups.boss28 = [['caimao', 'jing_soldier', 'jing_soldier', 'jing_archer', 'jing_archer']];
  B.groups.yw_patrol = [['yuan_vet', 'yuan_vet', 'yuan_ballista', 'yan_cav']];
  B.groups.wc_g1 = [['yuan_vet', 'yuan_vet', 'yuan_ballista', 'yuan_ballista']];
  B.groups.wc_g2 = [['yan_cav', 'yuan_vet', 'yuan_vet', 'yuan_ballista']];
  B.rematch.caoren_down = 'caoren'; B.rematch.shenpei_down = 'shenpei';
  ['caoren', 'shenpei'].forEach(function (id) { EN[id + '_r'] = Object.assign({}, EN[id], { rematchOf: id }); });
  Object.assign(D.terrainHome, { yuan_vet: 'plain', yuan_ballista: 'forest', yan_cav: 'plain', cao_vet: 'plain', jing_soldier: 'plain', jing_archer: 'forest', caoren: 'plain', chunyuqiong: 'plain', shenpei: 'plain', yuanshang: 'plain', caimao: 'sea' });
  ['yuan_vet', 'yuan_ballista', 'yan_cav', 'cao_vet', 'jing_soldier', 'jing_archer', 'caoren', 'chunyuqiong', 'shenpei', 'yuanshang', 'caimao'].forEach(function (id) {
    D.applyTerrain(id, EN[id], !!EN[id].boss);
    if (EN[id + '_r']) D.applyTerrain(id + '_r', EN[id + '_r'], true);
  });

  // ================= 裝備 =================
  const G6 = {
    yb_sword: { name: '官渡劍', slot: 'weapon', wtype: '劍', mods: { pow: 50, int: 3 }, price: 2700, desc: '官渡鐵匠連夜打的劍，劍身上還留著鑄模的熱氣。' },
    yb_blade: { name: '陽武環首刀', slot: 'weapon', wtype: '刀', mods: { pow: 50, spd: 1 }, price: 2700, desc: '環首刀，刀頭帶一個圓環，據說可以拴在腰帶上，也可以拿來掛水壺。' },
    yb_lance: { name: '倉亭長矛', slot: 'weapon', wtype: '矛', mods: { pow: 50, grd: 3 }, price: 2740, desc: '渡口守軍用的長矛，矛頭上有一道淺淺的缺口，是被人用船槳敲出來的。' },
    yb_spear: { name: '荊襄長槍', slot: 'weapon', wtype: '槍', mods: { pow: 53, spd: -1 }, price: 2780, desc: '荊襄的槍匠用楠木做槍桿，輕而韌，只是用的人往往不夠勇。' },
    yb_fan: { name: '青綸羽扇', slot: 'weapon', wtype: '扇', mods: { int: 25, lead: 3 }, price: 2780, desc: '青絲帶綁著的羽扇，據說某位「臥龍」的扇子就長這樣。……據說。' },
    cao_armor: { name: '黑光鎧', slot: 'armor', mods: { def: 26, spd: -1 }, price: 2700, desc: '曹軍制式的黑鎧，打了蠟，大太陽底下會反光，敵人遠遠看到就知道是誰來了。' },
    xiang_helm: { name: '襄陽盔', slot: 'helm', mods: { def: 12, grd: 6, lead: 2 }, price: 2100, desc: '荊襄兵的頭盔，內襯是軟皮，戴起來很舒服，大概也因此沒那麼想打仗。' },
    jing_boots: { name: '荊襄快靴', slot: 'boots', mods: { spd: 9, def: 4 }, price: 2200, desc: '水鄉人穿的快靴，鞋底有防滑的紋路。' },
    yb_jade: { name: '官渡玉墜', slot: 'charm', mods: { lead: 12, grd: 4 }, price: 2100, desc: '官渡之戰前夕，有人在營裡賣的玉墜，說是「不被燒糧倉」的護符。' },
    caoren_spear: { name: '天人槍', slot: 'weapon', wtype: '槍', mods: { pow: 90, grd: 2 }, price: 0, desc: '曹仁的長槍，槍桿比一般的粗一圈。他說這是因為「守城的人要握得穩」。' },
    wuchao_blade: { name: '烏巢酒刀', slot: 'weapon', wtype: '刀', mods: { pow: 92, spd: 1 }, price: 0, desc: '淳于瓊的刀，刀背上有一圈酒漬，據說他連磨刀都要先喝一口。' },
    shenpei_fan: { name: '鄴城令羽扇', slot: 'weapon', wtype: '扇', mods: { int: 40, lead: 5 }, price: 0, desc: '審配的羽扇，扇骨上刻著「死守」兩個字，字的筆畫比誰都用力。' },
    yuanshang_sword: { name: '袁氏金劍', slot: 'weapon', wtype: '劍', mods: { pow: 91, int: 3 }, price: 0, desc: '袁尚的佩劍，劍鞘鑲了三顆寶石，劍身倒是普通得很。' },
    caimao_helm: { name: '水軍都督盔', slot: 'helm', mods: { def: 16, grd: 7, lead: 3 }, price: 0, desc: '蔡瑁的頭盔，盔頂有一個小小的船形裝飾，他說這是水軍的驕傲。' },
    xuyou_scroll: { name: '許攸密書', slot: 'charm', mods: { int: 8, lead: 6 }, price: 0, desc: '許攸投曹時帶來的書信，信上列了袁軍糧倉的位置，每一個都畫了圈。' }
  };
  Object.keys(G6).forEach(function (k) { E[k] = G6[k]; });
  D.drops.caoren = ['caoren_spear', 1.0]; D.drops.caoren_r = ['caoren_spear', 0.2];
  D.drops.chunyuqiong = ['wuchao_blade', 1.0];
  D.drops.shenpei = ['shenpei_fan', 1.0]; D.drops.shenpei_r = ['shenpei_fan', 0.2];
  D.drops.yuanshang = ['yuanshang_sword', 1.0]; D.drops.caimao = ['caimao_helm', 1.0];
  D.drops.cao_vet = ['cao_armor', 0.03];

  // ================= 助戰：許攸、張郃（章末離隊） =================
  const GUEST = {
    xuyou: { id: 'xuyou', name: '許攸', sprite: 68, portrait: 186, zi: '子遠', title: '袁紹舊部・謀士', cls: '軍師', weapon: '扇', guest: true, terrain: { plain: 'B', forest: 'A', mountain: 'B', sea: 'C' },
      hp: 118, tp: 12, atk: 8, int: 25, spd: 11, lead: 17, luck: 12, grd: 8, growth: { hp: 15, atk: 0.6, int: 2.0, spd: 0.4, lead: 1.3, luck: 0.8, grd: 0.6, tp: 0.9 },
      trait: { name: '奇謀獻計', desc: '智力 +3、運氣 +2', mods: { int: 3, luck: 2 } }, bio: '南陽人，袁紹的舊友，也是曹操的舊友。他一輩子最大的貢獻就是在對的時間投奔了對的人，最大的毛病，是話太多。' },
    zhanghe: { id: 'zhanghe', name: '張郃', sprite: 69, portrait: 187, zi: '儁乂', title: '袁軍將領・巧變之士', cls: '猛將', weapon: '矛', guest: true, terrain: { plain: 'A', forest: 'B', mountain: 'A', sea: 'C' },
      hp: 155, tp: 8, atk: 20, int: 14, spd: 15, lead: 20, luck: 9, grd: 11, growth: { hp: 21, atk: 1.9, int: 0.8, spd: 0.5, lead: 1.2, luck: 0.4, grd: 0.9, tp: 0.5 },
      trait: { name: '巧變', desc: '武力 +2、速度 +2', mods: { atk: 2, spd: 2 } }, bio: '河間人，袁紹的將領，先勸袁紹別攻曹營，勸不動，後來連營寨一起歸了曹操。能打、能變，也比誰都懂得及時調頭。' }
  };
  Object.assign(D.terrainHome, { xuyou: 'forest', zhanghe: 'plain' });
  Object.keys(GUEST).forEach(function (id) { D.characters[id] = GUEST[id]; D.applyTerrain(id, GUEST[id], true); });
  const SK = B.skills;
  SK.xuyou_a = { name: '袁營密報', tp: 4, kind: 'debuff', target: 'all', stat: 'def', mult: 0.7, turns: 3, fx: 'crack' };
  SK.xuyou_b = { name: '倒戈獻策', tp: 5, kind: 'tact', target: 'one', power: 2.4, fx: 'fire' };
  SK.xuyou_c = { name: '烏巢火計', tp: 9, allTp: 13, kind: 'tact', target: 'one', choice: true, power: 3.8, allPower: 2.2, fx: 'fire', replaces: 'xuyou_b' };
  SK.zhanghe_a = { name: '巧變突刺', tp: 3, kind: 'phys', target: 'one', power: 1.8, fx: 'thrust' };
  SK.zhanghe_b = { name: '陣前調頭', tp: 4, kind: 'buff', target: 'self', stat: 'spd', mult: 1.6, turns: 3, fx: 'wind', extra: { stat: 'atk', mult: 1.2 } };
  SK.zhanghe_c = { name: '倒戈連刺', tp: 8, kind: 'phys', target: 'one', power: 0.8, hits: 4, fx: 'multithrust', replaces: 'zhanghe_a' };
  B.charSkills.xuyou = ['xuyou_a', [5, 'xuyou_b'], [12, 'xuyou_c']];
  B.charSkills.zhanghe = ['zhanghe_a', [5, 'zhanghe_b'], [12, 'zhanghe_c']];
  B.advisorSkills.xuyou = [[1, 'adv_xuyou_a']];
  SK.adv_xuyou_a = { name: '獻計燒糧', tp: 6, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.4, turns: 4, fx: 'up_r' };

  // ================= 商店 =================
  const W6 = ['xu_sword', 'xu_blade', 'xu_lance', 'xu_spear', 'xu_fan', 'yb_sword', 'yb_blade', 'yb_lance', 'yb_spear', 'yb_fan'];
  const A6 = ['scale_armor', 'cao_armor', 'dragon_helm', 'xiang_helm', 'cloud_boots', 'jing_boots', 'tiger_tally', 'jade_seal_charm', 'yb_jade', 'guard_charm'];
  const SAY = {
    weapon: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，兵器都是新打的。想打勝仗，先換把好傢伙。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    armor: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，甲冑靴帽都有。穿好一點，被砍的時候至少體面。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    general: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，藥品和雜貨都有。多備幾包藥，保命用。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; }
  };
  const defShop = function (town, kind, shopName, keeper) {
    const id = town + '_' + kind;
    D.shopKinds[id] = kind; D.shopNames[id] = shopName;
    D.shops[id] = kind === 'weapon' ? W6 : kind === 'armor' ? A6 : D.shops.medic4;
    S['shop_' + id] = SAY[kind](keeper, shopName).map(function (l) { return JSON.parse(JSON.stringify(l).replace('"$"', JSON.stringify(id))); });
    return id;
  };
  const innLines = function (who, hello) { return [{ speaker: who, text: hello, choices: [{ label: '住宿 30金', act: { rest: true } }, { label: '不住了' }] }]; };
  const SLOTS = [[3, 2]];

  // ================= 城裡的房屋 =================
  const HOUSES = {
    yangwu: [
      { name: '陽武營務所', size: 'big', chest: { id: 'h5_yw_a', gold: 1700, item: { herb3: 2, tonic3: 2 }, msg: '營務所的帳房裡，有一袋袁軍來不及發的餉銀。' },
        npc: { name: '營務官', sprite: 9, lines: ['營務官：陽武這地方現在全是袁軍。土山一座接一座，堆得比城牆還高。', '營務官：我們的主公說，土山堆高了，射箭更準。……我覺得他是堆上癮了。'] } },
      { kind: 'inn', id: 'inn', name: '陽武客棧', keeper: '掌櫃', sprite: 4, hello: '陽武客棧，這幾天客人都是兵。住一晚吧，床都是剛擦過的。' },
      { kind: 'weapon', name: '陽武武器店', keeper: '鐵匠', sprite: 11 },
      { kind: 'armor', name: '陽武防具店', keeper: '甲冑匠', sprite: 8 },
      { kind: 'general', name: '陽武雜貨店', keeper: '掌櫃', sprite: 4 }
    ],
    liyangcheng: [
      { name: '黎陽糧倉', size: 'big', chest: { id: 'h5_ly_a', gold: 1800, item: { herb3: 2, revive: 1 }, msg: '糧倉的最裡間，有一小袋留給督糧官的賞金。' },
        npc: { name: '督糧官', sprite: 10, lines: ['督糧官：黎陽的糧，是整個冀州最多的。可惜這一年，糧車都往官渡跑，怎麼跑都跑不回來。', '督糧官：我們這些管糧的，最怕兩件事：糧少，和糧被燒。'] } },
      { kind: 'inn', id: 'inn', name: '黎陽客棧', keeper: '掌櫃', sprite: 4, hello: '黎陽客棧，天一黑就清靜了。住一晚吧，後院有口井，水特別甜。' },
      { kind: 'weapon', name: '黎陽武器店', keeper: '鐵匠', sprite: 11 },
      { kind: 'general', name: '黎陽雜貨店', keeper: '掌櫃', sprite: 4 },
      { name: '審府偏院', size: 'small', chest: { id: 'h5_ly_b', gold: 1200, msg: '偏院的書案抽屜裡，壓著一小袋審配留給家僕的銀子。' },
        npc: { name: '審府家僕', sprite: 6, lines: ['家僕：我家老爺為人剛直，連給兒子取名都要先寫三篇奏疏。', '家僕：他最常說的一句話是：「寧可站著死，不能跪著活。」……可跪著活，聽說比較舒服。'] } }
    ],
    cangting: [
      { name: '倉亭渡口營', size: 'small', chest: { id: 'h5_ct_a', gold: 1500, item: { herb3: 2 }, msg: '營房的行軍床下，有一個士兵留下的小錢袋。' },
        npc: { name: '渡口老兵', sprite: 6, lines: ['老兵：倉亭是黃河上的津渡，我在這裡守了二十年，船沉了三次，人倒是沒掉過。', '老兵：聽說主公病倒了。這種事，咱們小兵不敢說，只敢在夜裡自己嘀咕。'] } },
      { name: '倉亭縣衙', size: 'big', chest: { id: 'h5_ct_b', gold: 1600, msg: '縣衙的案卷櫃裡，有一份沒寫完的軍報和一袋賞銀。' },
        npc: { name: '縣吏', sprite: 10, lines: ['縣吏：我只負責蓋印，打勝打敗，我都蓋同一枚。', '縣吏：蓋印的時候，我不看內容，只看有沒有蓋歪。'] } },
      { kind: 'inn', id: 'inn', name: '倉亭客棧', keeper: '掌櫃', sprite: 4, hello: '倉亭客棧，渡口邊，一開窗就是黃河。住一晚吧，水聲比搖籃曲好用。' },
      { kind: 'weapon', name: '倉亭武器店', keeper: '鐵匠', sprite: 11 },
      { kind: 'general', name: '倉亭雜貨店', keeper: '掌櫃', sprite: 4 }
    ],
    xinye: [
      { name: '新野縣衙', size: 'big', chest: { id: 'h5_xy_a', gold: 1500, item: { herb3: 2, tonic3: 2 }, msg: '縣衙的偏櫃裡，有一袋劉表撥給新野的軍費。' },
        npc: { name: '縣吏', sprite: 10, lines: ['縣吏：新野是個小城，劉表把它撥給劉皇叔，說是「暫借」。', '縣吏：我們這裡人少、糧少、麻煩更少。希望皇叔來了，也保持這個傳統。'] } },
      { kind: 'inn', id: 'inn', name: '新野客棧', keeper: '掌櫃', sprite: 4, hello: '新野客棧，客人少，被子乾淨。住一晚吧，窗外還能聽見牧童唱歌。' },
      { kind: 'weapon', name: '新野武器店', keeper: '鐵匠', sprite: 11 },
      { kind: 'general', name: '新野雜貨店', keeper: '掌櫃', sprite: 4 },
      { name: '農家小院', size: 'small', chest: { id: 'h5_xy_b', gold: 1000, msg: '農家的米缸底下，壓著一小袋過路客人留下的飯錢。' },
        npc: { name: '農家老丈', sprite: 6, lines: ['老丈：新野東邊的山岡上，有個年輕人住在草屋裡，人家都叫他「臥龍」。', '老丈：我不曉得他睡的是龍還是豬，但他每天都睡到日上三竿。'] } }
    ],
    xiangyang: [
      { name: '襄陽州牧府', size: 'big', chest: { id: 'h5_xg_a', gold: 2000, item: { herb3: 3, tonic3: 3 }, msg: '州牧府的偏廳裡，有一個預備宴客用的賞金袋。' },
        npc: { name: '府中書吏', sprite: 10, lines: ['書吏：荊州九郡，八十一州縣，主公每天都在想：怎麼讓這些地方，永遠不要有事。', '書吏：最有效的辦法，就是什麼事都不管。'] } },
      { kind: 'inn', id: 'inn', name: '襄陽客棧', keeper: '掌櫃', sprite: 4, hello: '襄陽客棧，荊州第一大店。住一晚吧，早飯有魚羹。' },
      { kind: 'weapon', name: '襄陽武器店', keeper: '鐵匠', sprite: 11 },
      { kind: 'armor', name: '襄陽防具店', keeper: '甲冑匠', sprite: 8 },
      { kind: 'general', name: '襄陽雜貨店', keeper: '掌櫃', sprite: 4 },
      { name: '水軍營房', size: 'small', chest: { id: 'h5_xg_b', gold: 1400, msg: '營房的木箱裡，有一包水軍士兵合夥攢下的賞錢。' },
        npc: { name: '水軍老兵', sprite: 6, lines: ['老兵：蔡都督的水軍，漢水上沒有對手，因為漢水上沒有別人。', '老兵：我們的船是荊州最漂亮的。至於能不能打仗……反正也沒打過。'] } }
    ]
  };
  Object.keys(HOUSES).forEach(function (town) {
    const tm = nm[town], doors = D.ch5Doors[town];
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

  // ================= 烏巢（單層戰場地圖） =================
  (function () {
    const FW = 24, FH = 26, g = [];
    for (let y = 0; y < FH; y++) g.push('#'.repeat(FW).split(''));
    const box = function (x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
    box(2, 14, 21, 24, 'g'); box(2, 2, 21, 10, 'g'); box(11, 11, 11, 13, ','); box(11, 14, 12, 25, ','); box(11, 0, 12, 10, ',');
    box(5, 18, 18, 18, ','); box(5, 6, 18, 6, ',');
    for (let x = 2; x <= 21; x += 3) { g[14][x] = 'T'; g[10][x] = 'T'; }
    g[14][11] = ','; g[14][12] = ','; g[10][11] = ','; g[10][12] = ',';
    const tiles = g.map(function (r) { return r.join(''); });
    nm.wuchao = { name: '烏巢糧倉', battleBg: 'grass', home: { map: 'world5' }, encounter: { group: 'field17', rate: 0.05, minSteps: 6 }, tiles: tiles, start: { x: 11, y: 24, dir: 'up' }, events: [{ once: 'wc_intro_done', dialogue: 'wc_intro' }],
      warps: [{ x: 11, y: 25, to: 'world5', tx: 0, ty: 0, dir: 'down' }, { x: 12, y: 25, to: 'world5', tx: 0, ty: 0, dir: 'down' }],
      npcs: [
        { id: 'wcboss', name: '淳于瓊', sprite: 52, x: 11, y: 12, dir: 'down', dialogue: 'boss_chunyuqiong', hideIf: 'chunyuqiong_down' },
        { id: 'wc_g1', name: '烏巢守兵', sprite: 2, x: 8, y: 20, dir: 'down', dialogue: 'wc_g1', hideIf: 'wc_g1_down' },
        { id: 'wc_g2', name: '烏巢守兵', sprite: 2, x: 15, y: 8, dir: 'down', dialogue: 'wc_g2', hideIf: 'wc_g2_down' },
        { id: 'wc_zhanghe', name: '張郃', sprite: 69, x: 11, y: 8, dir: 'down', dialogue: 'wc_zhanghe', showIf: 'chunyuqiong_down', hideIf: 'zhanghe_join' }
      ],
      objects: [
        { type: 'chest', id: 'wc_c1', x: 4, y: 22, gold: 4200, msg: '倉庫角落裡堆著袁軍的餉銀。' },
        { type: 'chest', id: 'wc_c2', x: 19, y: 4, item: { herb3: 5, tonic3: 4 }, msg: '被丟棄的藥箱。' },
        { type: 'torch', x: 9, y: 16, text: '一支燒得正旺的火把。……今晚它不是用來照明的。' }, { type: 'torch', x: 14, y: 16, text: '一支火把，等著被人拿去糧倉。' },
        { type: 'tablet', x: 13, y: 23, text: '「烏巢」——袁軍屯糧的地方，一萬車糧草。石碑下被人新刻了一行字：「某夜，火起。」' }
      ] };
    S.wc_intro = [
      { speaker: '', text: '夜。烏巢。幾百輛糧車排得像一座城，守兵早就睡了，只剩酒氣在營中飄。', set: { wc_intro_done: true } },
      { speaker: '許攸', text: '就是這裡。袁紹一萬車糧，全在這裡。' },
      { speaker: '諸葛貓妖', text: '（……喵，我讀過這一段。糧倉被燒，袁紹的軍心跟著散。可親眼看見，才知道火把有多燙。）' },
      { speaker: '劉備', text: '各位，這一戰不是為了報仇，是為了讓這場仗，早點結束。' }
    ];
    S.wc_g1 = [{ speaker: '烏巢守兵', text: '誰？誰在那邊？……酒還沒醒，你們先別走！', act: { battle: 'wc_g1', flag: 'wc_g1_down', after: 'wc_gafter' } }];
    S.wc_g2 = [{ speaker: '烏巢守兵', text: '糧倉重地，閒人止步！……你們是曹軍的人？來人啊！', act: { battle: 'wc_g2', flag: 'wc_g2_down', after: 'wc_gafter' } }];
    S.wc_gafter = [{ speaker: '', text: '（守兵被擊退了。）' }];
    S.boss_chunyuqiong = [
      { speaker: '', text: '糧倉正中，淳于瓊抱著酒壺，半睡半醒地靠在糧車上。' },
      { speaker: '淳于瓊', text: '……嗯？誰把本督的酒搶了？……是曹軍？！來人！來人啊！' },
      { speaker: '張飛', text: '俺老張今天，就是來送你一場好覺的！' },
      { speaker: '諸葛貓妖', text: '喵……淳于將軍，我勸你先把酒放下。歷史上你這一戰，是邊喝邊輸的。', act: { battle: 'boss25', flag: 'chunyuqiong_down', after: 'chunyuqiong_after' } }
    ];
    S.chunyuqiong_after = [
      { speaker: '淳于瓊', text: '……我的糧……我的酒……我的鼻子！……' },
      { speaker: '', text: '（獲得烏巢酒刀、金 6800。）', act: { gold: 6800 } },
      { speaker: '許攸', text: '點火！把糧車全點了！' },
      { speaker: '', text: '一把火從糧倉的角落燒起，風一吹，火龍就竄上了半個天空。整座烏巢像一盞巨大的燈籠，把夜空燒成了橘紅色。' },
      { speaker: '諸葛貓妖', text: '喵……（耳朵貼平）……雖然我知道這一幕早晚會來，但原來火這麼大。' },
      { speaker: '關羽', text: '這一把火，袁紹的軍心，也要一起燒了。' },
      { speaker: '', text: '（遠處傳來馬蹄聲，一隊袁軍將領趕到烏巢，帶頭的是張郃。）' }
    ];
    S.wc_zhanghe = [
      { speaker: '張郃', text: '烏巢……烏巢怎麼會被燒？！' },
      { speaker: '張郃', text: '我早就勸過主公：曹營難攻，不如先救烏巢。主公說我長他人志氣。……現在好了，主公沒糧了，我也沒家了。' },
      { speaker: '劉備', text: '張將軍，天下英雄，擇主而事。歸順大漢，並不丟臉。' },
      { speaker: '張郃', text: '劉皇叔……我張郃一生敬重名士，今日就把這支部隊，連同我自己，一併交給曹公吧。……在此之前，我願與各位一路同行。', set: { zhanghe_join: true }, act: { guest: 'zhanghe' } },
      { speaker: '諸葛貓妖', text: '喵，他連倒戈都倒得有條理。' }
    ];
  })();

  // ================= 通往第五章的關門 =================
  (function () {
    const w4 = nm.world4, w5 = nm.world5, row = 26, x4 = 78;
    w4.tiles[row] = w4.tiles[row].slice(0, x4) + 'P' + w4.tiles[row].slice(x4 + 1);
    w4.warps.push({ x: x4, y: row, to: 'world5', tx: 3, ty: 24, dir: 'right', need: 'ch5_xun', deny: 'ch5_sealed' });
    S.ch5_sealed = [{ speaker: '', text: '前面是通往官渡北岸的大路，袁軍的哨兵來來往往，現在過去只會被當成探子。' }];
    // 烏巢入口：陽武東邊
    let ex = null; const yw = D.worldTowns.yangwu;
    for (let d = 6; d < 16 && !ex; d++) for (let dy = 0; dy <= 3 && !ex; dy++) {
      const x = yw.x + d, y = yw.y + dy, ch = w5.tiles[y][x];
      if ((ch === 'g' || ch === ',') && ['g', ','].indexOf(w5.tiles[y + 1][x]) >= 0 && ['g', ','].indexOf(w5.tiles[y - 1][x]) >= 0) ex = { x: x, y: y };
    }
    if (!ex) throw new Error('wuchao entrance');
    w5.tiles[ex.y] = w5.tiles[ex.y].slice(0, ex.x) + 'P' + w5.tiles[ex.y].slice(ex.x + 1);
    w5.warps.push({ x: ex.x, y: ex.y, to: 'wuchao', tx: 11, ty: 24, dir: 'up', need: 'wuchao_plan', deny: 'wc_sealed' });
    nm.wuchao.warps.forEach(function (w) { w.tx = ex.x; w.ty = ex.y + 1; });
    D.ch5Wuchao = ex;
    S.wc_sealed = [{ speaker: '', text: '前面是袁軍的屯糧重地，沒有確切的情報，現在貿然過去，只會打草驚蛇。' }];
  })();

  // ================= 城裡的人 =================
  const P = function (map, o) { nm[map].npcs.push(o); };
  // ---- 鄴城：田豐的勸諫
  const yt = nm.ye.npcs.find(function (n) { return n.id === 'ye_tianfeng'; });
  yt.alts = [{ flag: 'ch5_start', dialogue: 'ye_tianfeng3' }, { flag: 'ch4_end', dialogue: 'ye_tianfeng2' }];
  S.ye_tianfeng2 = [
    { speaker: '田豐', text: '劉皇叔，貓先生。我勸過主公：曹操兵少糧缺，只要用久戰疲他，不出三年，必勝。' },
    { speaker: '田豐', text: '主公說我動搖軍心，要把我關進牢裡。……我來見你們，是因為這座城，不是久留之地。' },
    { speaker: '劉備', text: '先生之言，備記下了。袁公恐怕不聽……我與二弟、三弟，想南去汝南，聯絡劉辟、龔都。' },
    { speaker: '田豐', text: '汝南有曹仁的人馬，要小心。……貓先生。' },
    { speaker: '諸葛貓妖', text: '喵？' },
    { speaker: '田豐', text: '你看起來不像是個普通的貓。若有一天你真的能改變什麼，就從救一個該救的人開始吧。', set: { ch5_start: true } },
    { speaker: '諸葛貓妖', text: '（……喵，我讀過田豐的下場。這句話聽起來像是遺言，我現在不敢多想。）' }
  ];
  S.ye_tianfeng3 = [{ speaker: '田豐', text: '汝南路遠，保重。主公若兵敗，我恐怕也等不到那一天了。' }];
  // ---- 汝南：曹仁
  P('runan', { id: 'rn_caoren', name: '曹仁', sprite: 66, x: 12, y: 8, dir: 'down', dialogue: 'boss_caoren', showIf: 'ch5_start', hideIf: 'caoren_down' });
  S.boss_caoren = [
    { speaker: '', text: '汝南縣衙前，一面「曹」字旗迎風展開。曹仁跨馬立在旗下，槍尖指向地面。' },
    { speaker: '曹仁', text: '劉玄德！你在汝南招兵買馬，真當許都沒人了？' },
    { speaker: '劉備', text: '曹將軍，備無意與丞相為敵，只是備與雲長、翼德兄弟之間，有誓。' },
    { speaker: '曹仁', text: '兄弟之誓？很好。我曹仁也有兄弟之誓——不讓人動我兄長的地盤！' },
    { speaker: '張飛', text: '俺老張今天，要把你的槍，捲成麻花！' },
    { speaker: '諸葛貓妖', text: '（喵，歷史上，這一仗劉備輸了。這次，我們試試看。）', act: { battle: 'boss24', flag: 'caoren_down', after: 'caoren_after' } }
  ];
  S.caoren_after = [
    { speaker: '曹仁', text: '……好！今日我輸得服氣。劉皇叔，有你這幾位兄弟，何愁天下？' },
    { speaker: '', text: '（獲得天人槍、金 6400。）', act: { gold: 6400 } },
    { speaker: '劉備', text: '曹將軍，承讓。……雲長，我們得趕緊離開汝南，曹丞相的大軍，很快就會到。' },
    { speaker: '關羽', text: '兄長放心，我先去官渡見一見荀令君，聽聽他有什麼話說。', set: { ch5_ru: true } },
    { speaker: '諸葛貓妖', text: '（……喵，終於要開始了。官渡之戰。）' }
  ];
  // ---- 官渡：荀彧與曹操
  const gx = nm.guandu.npcs.find(function (n) { return n.id === 'gd_xunyu'; });
  gx.alts = [{ flag: 'wuchao_plan', dialogue: 'gd_xunyu5c' }, { flag: 'ch5_xun', dialogue: 'gd_xunyu5b' }, { flag: 'caoren_down', dialogue: 'gd_xunyu5' }];
  S.gd_xunyu5 = [
    { speaker: '荀彧', text: '關將軍、劉皇叔、貓先生。你們來得正是時候。' },
    { speaker: '荀彧', text: '袁紹軍在陽武堆了十幾座土山，居高臨下射我們的營帳。丞相已經快撐不住了，糧草只剩下十日。' },
    { speaker: '荀彧', text: '請你們到陽武偵察，看看袁軍的虛實。大地圖的東邊有一扇關門，過了就是袁軍的地界。' },
    { speaker: '劉備', text: '令君放心，備一定盡力。' },
    { speaker: '諸葛貓妖', text: '喵……（小聲）我們到底算誰那邊的？', set: { ch5_xun: true } },
    { speaker: '荀彧', text: '貓先生這句話，我就當沒聽見。' }
  ];
  S.gd_xunyu5b = [{ speaker: '荀彧', text: '陽武在官渡東邊，大地圖盡頭有一道關門。小心行事，不要被袁軍當成探子。' }];
  S.gd_xunyu5c = [{ speaker: '荀彧', text: '烏巢的事，丞相親自去辦。你們若是同行，路上小心。' }];
  const gc = nm.guandu.npcs.find(function (n) { return n.id === 'gd_caocao'; });
  gc.alts = [{ flag: 'wuchao_plan', dialogue: 'gd_caocao5b' }, { flag: 'xuyou_join', dialogue: 'gd_caocao5' }, { flag: 'ch4_end', dialogue: 'gd_caocao_idle' }];
  S.gd_caocao_idle = [{ speaker: '曹操', text: '皇叔，貓先生，一路辛苦。官渡這邊，眼下全靠荀令君出主意。' }];
  S.gd_caocao5 = [
    { speaker: '', text: '曹操聽說許攸來投，連鞋都沒穿就跑出來迎接，赤著腳跑了半個營。' },
    { speaker: '曹操', text: '子遠！你來了，我的大事成了！' },
    { speaker: '許攸', text: '孟德，你還有多少糧？' },
    { speaker: '曹操', text: '……三個月。' },
    { speaker: '許攸', text: '再說一次。' },
    { speaker: '曹操', text: '……一個月。' },
    { speaker: '許攸', text: '孟德，你不誠實。……實話說吧。' },
    { speaker: '曹操', text: '……只剩這一個月的軍糧。' },
    { speaker: '許攸', text: '袁紹有糧一萬車，囤在烏巢，守將淳于瓊嗜酒無備。你親率輕騎，燒他的糧，不出三日，袁軍自潰。' },
    { speaker: '曹操', text: '好！就這麼辦！皇叔，貓先生，各位，烏巢一行，請你們與我同去！' },
    { speaker: '諸葛貓妖', text: '喵……我們現在，是在曹營裡幫曹操燒袁紹的糧。……歷史真的很奇怪。', set: { wuchao_plan: true } },
    { speaker: '', text: '【目標：從陽武東邊的小路進入烏巢，夜襲糧倉。】' }
  ];
  S.gd_caocao5b = [{ speaker: '曹操', text: '烏巢就在陽武東邊的小路盡頭。動作要快，火要大！' }];
  // ---- 陽武：偵察與許攸
  P('yangwu', { id: 'yw_captain', name: '袁軍巡營校尉', sprite: 9, x: 12, y: 8, dir: 'down', dialogue: 'yw_captain', showIf: 'ch5_xun', hideIf: 'yw_scout_down' });
  S.yw_captain = [
    { speaker: '袁軍巡營校尉', text: '什麼人？竟敢擅自在營中走動？' },
    { speaker: '關羽', text: '路過。' },
    { speaker: '袁軍巡營校尉', text: '路過？大營之內，沒有路過這種事！來人，拿下！', act: { battle: 'yw_patrol', flag: 'yw_scout_down', after: 'yw_captain_after' } }
  ];
  S.yw_captain_after = [
    { speaker: '袁軍巡營校尉', text: '……你們這些人，到底是哪邊的？' },
    { speaker: '諸葛貓妖', text: '喵，這個問題，我們自己也在想。' },
    { speaker: '', text: '（校尉倒地。營帳後面，一個人影鬼鬼祟祟地竄出來。）' }
  ];
  P('yangwu', { id: 'yw_xuyou', name: '許攸', sprite: 68, x: 11, y: 11, dir: 'down', dialogue: 'yw_xuyou', showIf: 'yw_scout_down', hideIf: 'xuyou_join' });
  S.yw_xuyou = [
    { speaker: '許攸', text: '各位且慢！我是袁紹的謀士許攸，也是……曹孟德的老朋友。' },
    { speaker: '劉備', text: '許先生為何在此？' },
    { speaker: '許攸', text: '我勸主公分兵襲許都，他不聽；我家人在鄴城犯了法，審配還抓去了。……我想去官渡，找孟德。你們願意帶我一程嗎？' },
    { speaker: '諸葛貓妖', text: '喵……許攸，你這樣算不算「叛逃」？' },
    { speaker: '許攸', text: '不算。我是「棄暗投明」，只是方向剛好相反。' },
    { speaker: '關羽', text: '先生既願投曹公，我等便護送你到官渡。', set: { xuyou_join: true }, act: { guest: 'xuyou' } },
    { speaker: '', text: '【目標：回官渡，把許攸帶給曹操。】' }
  ];
  P('yangwu', { id: 'yw_soldier', name: '袁軍士兵', sprite: 9, x: 16, y: 12, dir: 'left', dialogue: 'yw_soldier' });
  S.yw_soldier = [{ speaker: '袁軍士兵', text: '我們主公說，土山堆得越高，射箭越準。……可我們的弓，是拿來射人的，不是拿來射土的。' }];
  // ---- 黎陽：審配
  P('liyangcheng', { id: 'ly_shenpei', name: '審配', sprite: 67, x: 12, y: 8, dir: 'down', dialogue: 'boss_shenpei', showIf: 'zhanghe_join', hideIf: 'shenpei_down' });
  S.boss_shenpei = [
    { speaker: '', text: '黎陽城內，審配立於大堂之上，身後是整整齊齊的弩手。' },
    { speaker: '審配', text: '烏巢被燒，張郃倒戈，主公在前線危在旦夕。我審配只有一句話：城在人在，城破人亡！' },
    { speaker: '劉備', text: '審先生，袁公若兵敗，先生又何必送死？' },
    { speaker: '審配', text: '士為知己者死。袁公待我如國士，我便以國士報之！來人，放箭！' },
    { speaker: '諸葛貓妖', text: '（……喵，這人比城牆還硬。希望一頓打能讓他軟一點。）', act: { battle: 'boss26', flag: 'shenpei_down', after: 'shenpei_after' } }
  ];
  S.shenpei_after = [
    { speaker: '審配', text: '……我輸了。……但請記住，審配至死，不降。' },
    { speaker: '', text: '（獲得鄴城令羽扇、金 7000。）', act: { gold: 7000 } },
    { speaker: '劉備', text: '審先生，保重。願你日後，不要把性命壓在一座城上。' },
    { speaker: '諸葛貓妖', text: '喵……（歷史上，審配最後在鄴城被擒，仍罵不絕口。他這輩子唯一不拐彎的事，就是死。）' }
  ];
  P('liyangcheng', { id: 'ly_scribe', name: '糧倉書吏', sprite: 10, x: 16, y: 12, dir: 'left', dialogue: 'ly_scribe' });
  S.ly_scribe = [{ speaker: '糧倉書吏', text: '黎陽的糧本來是要運去官渡的，烏巢一燒，這些糧，現在連自己人都不夠分。' }];
  // ---- 倉亭津：袁尚與袁紹之死
  P('cangting', { id: 'ct_yuanshang', name: '袁尚', sprite: 65, x: 12, y: 8, dir: 'down', dialogue: 'boss_yuanshang', showIf: 'shenpei_down', hideIf: 'yuanshang_down' });
  S.boss_yuanshang = [
    { speaker: '', text: '倉亭津渡口，袁尚金盔金甲，把一面「袁」字大旗插在岸邊。' },
    { speaker: '袁尚', text: '你們就是壞了我父親大事的人？我袁顯甫，今日就替父親討回公道！' },
    { speaker: '關羽', text: '公子年少，一時意氣，易招大禍。' },
    { speaker: '袁尚', text: '少廢話！我父親是四世三公，我是袁家的繼承人！來人，給我上！' },
    { speaker: '諸葛貓妖', text: '喵，這位公子穿得這麼亮，等一下打起來，記得先打他的盔。', act: { battle: 'boss27', flag: 'yuanshang_down', after: 'yuanshang_after' } }
  ];
  S.yuanshang_after = [
    { speaker: '袁尚', text: '……我輸了？不可能……我是袁家的繼承人……' },
    { speaker: '', text: '（獲得袁氏金劍、金 7200。）', act: { gold: 7200 } },
    { speaker: '', text: '一名快馬傳令兵從北面奔來，滿臉汗水。' },
    { speaker: '傳令兵', text: '急報！袁公……袁公病倒了，嘔血數升，眼下……怕是不行了！' },
    { speaker: '袁尚', text: '父親！父親！……我，我要回鄴城！' },
    { speaker: '劉備', text: '本初兄……（低頭，久久不語）' },
    { speaker: '諸葛貓妖', text: '（喵……歷史就是這樣。袁紹死了，兩個兒子還要打。）' },
    { speaker: '', text: '【河北的天，從這一刻開始變了。劉備一行，決定南下荊州。】', set: { ch5_yuan_dead: true } }
  ];
  P('cangting', { id: 'ct_boatman', name: '渡口船夫', sprite: 6, x: 16, y: 12, dir: 'left', dialogue: 'ct_boatman' });
  S.ct_boatman = [{ speaker: '渡口船夫', text: '倉亭的船，今天只載活人。想渡河？先看看對岸有沒有人在等你。' }];
  // ---- 襄陽：蔡瑁與劉表
  P('xiangyang', { id: 'xg_caimao', name: '蔡瑁', sprite: 61, x: 12, y: 8, dir: 'down', dialogue: 'boss_caimao', showIf: 'yuanshang_down', hideIf: 'caimao_down' });
  S.boss_caimao = [
    { speaker: '', text: '襄陽城下，蔡瑁領著一隊荊州水軍，擋在州牧府前。' },
    { speaker: '蔡瑁', text: '劉玄德！你一介外人，也想來荊州分一杯羹？' },
    { speaker: '劉備', text: '德瑁將軍，備乃漢室宗親，此來是奉朝廷之命，並無他意。' },
    { speaker: '蔡瑁', text: '漢室宗親，我們荊州也有！來人，給我拿下！' },
    { speaker: '張飛', text: '又是個宴客的，俺老張今天不吃宴席，吃你！' },
    { speaker: '諸葛貓妖', text: '喵……歷史上他會在宴席上陷害劉備，這一次，我們先把他打趴。', act: { battle: 'boss28', flag: 'caimao_down', after: 'caimao_after' } }
  ];
  S.caimao_after = [
    { speaker: '蔡瑁', text: '……好，是我輕敵了。你們過去吧。主公在州牧府，由他決定。' },
    { speaker: '', text: '（獲得水軍都督盔、金 7600。）', act: { gold: 7600 } }
  ];
  P('xiangyang', { id: 'xg_liubiao', name: '劉表', sprite: 17, x: 11, y: 5, dir: 'down', dialogue: 'xg_liubiao', showIf: 'caimao_down', alts: [{ flag: 'ch5_liubiao', dialogue: 'xg_liubiao2' }] });
  S.xg_liubiao = [
    { speaker: '劉表', text: '玄德賢弟！你終於來了。愚兄坐鎮荊州十年，無事可煩，最近就盼著有人來陪我聊聊天。' },
    { speaker: '劉備', text: '景升兄，備兵敗無依，特來投奔。' },
    { speaker: '劉表', text: '一家人，何必客氣。新野小城，我撥給你駐紮，暫借。……你可以慢慢住，反正我不急著要回來。' },
    { speaker: '諸葛貓妖', text: '喵……（小聲）「暫借」兩個字，念得真重。' },
    { speaker: '', text: '（許攸、張郃一路同行至此，各自告辭，回歸曹公麾下。）', act: { leave: 'xuyou' } },
    { speaker: '', text: '', act: { leave: 'zhanghe' } },
    { speaker: '劉表', text: '玄德，新野有一位姓諸葛的名士，聽說才學不下當年的司馬徽。你若有空，不妨去看看。', set: { ch5_liubiao: true } }
  ];
  S.xg_liubiao2 = [{ speaker: '劉表', text: '玄德，在新野住得慣嗎？……沒有的話，記得告訴我，我再想想辦法。' }];
  P('xiangyang', { id: 'xg_guard', name: '州牧府衛士', sprite: 9, x: 16, y: 12, dir: 'left', dialogue: 'xg_guard' });
  S.xg_guard = [{ speaker: '州牧府衛士', text: '我家主公說，荊州九郡太平，無事為福。……所以您若是來生事的，請先走正門。' }];
  // ---- 新野：牧童與臥龍岡的歌
  P('xinye', { id: 'xy_child', name: '放牛牧童', sprite: 7, x: 12, y: 9, dir: 'down', dialogue: 'xy_child', showIf: 'ch5_liubiao', alts: [{ flag: 'ch5_end', dialogue: 'xy_child2' }] });
  S.xy_child = [
    { speaker: '', text: '新野城外，一個牧童騎在牛背上，一邊唱一邊走。' },
    { speaker: '牧童', text: '蒼天如圓蓋，陸地似棋局。世人黑白分，往來爭榮辱。' },
    { speaker: '牧童', text: '榮者自安安，辱者定碌碌。南陽有隱居，高眠臥不足！' },
    { speaker: '劉備', text: '小兄弟，你唱的是什麼歌？誰教你的？' },
    { speaker: '牧童', text: '是臥龍岡的先生教的。他說，天下大事，要等該來的人來。' },
    { speaker: '諸葛貓妖', text: '（喵……（耳朵豎直，尾巴停住）臥龍岡？諸葛亮？……我的名字，原來在他們的歌裡。）' },
    { speaker: '劉備', text: '貓先生，你怎麼了？' },
    { speaker: '諸葛貓妖', text: '沒事。……只是覺得，有些事情，好像到了該我去面對的時候了。', set: { ch5_end: true } },
    { speaker: '', text: '【第五章　官渡烽火　完】　新野城裡，似乎有一位讀書人在等你們。' }
  ];
  S.xy_child2 = [{ speaker: '牧童', text: '先生說，三顧的人，只要誠心，總有一天會聽見他的草廬裡，有人在翻書。' }];
  // 城鎮開放：打通前一關之後城門才開
  Object.assign(D.worldBackfill, { yangwu: 'ch5_xun', liyangcheng: 'zhanghe_join', cangting: 'shenpei_down', xiangyang: 'yuanshang_down', xinye: 'caimao_down' });

  // ================= 主線任務 =================
  D.mainQuest.push(
    { done: 'ch5_start', title: '第五章：到鄴城牢裡，聽田豐一席話', world: 'world4', to: 'ye', where: '鄴城', hint: '鄴城在大地圖北邊。田豐在城裡大廳西側。第四章結束後才會出現。' },
    { done: 'caoren_down', title: '到汝南，擊敗曹仁', world: 'world4', to: 'runan', where: '汝南', hint: '汝南在大地圖西南。曹仁守在縣衙前。' },
    { done: 'ch5_xun', title: '回官渡，聽荀彧交代偵察任務', world: 'world4', to: 'guandu', where: '官渡', hint: '官渡在大地圖中央。荀彧在城裡北側。' },
    { done: 'yw_scout_down', title: '從大地圖最東邊的關門進入袁軍地界，到陽武偵察', world: 'world5', to: 'yangwu', where: '陽武', hint: '官渡大地圖最東邊（靠近東南角）有一扇關門，過了就是陽武所在的第五章大地圖。' },
    { done: 'xuyou_join', title: '在陽武遇見許攸，護送他回官渡', world: 'world5', to: 'yangwu', where: '陽武', hint: '擊敗巡營校尉之後，許攸會在城裡出現。' },
    { done: 'wuchao_plan', title: '回官渡，與曹操商議烏巢之計', world: 'world4', to: 'guandu', where: '官渡', hint: '帶著許攸回到官渡，曹操在大廳中央。' },
    { done: 'chunyuqiong_down', title: '從陽武東邊的小路進入烏巢，夜襲糧倉', world: 'world5', to: 'yangwu', where: '烏巢（陽武東邊）', hint: '出陽武城門向東走，路邊有一塊關口圖塊。進入後打敗淳于瓊。' },
    { done: 'shenpei_down', title: '到黎陽，擊敗審配', world: 'world5', to: 'liyangcheng', where: '黎陽', hint: '黎陽在第五章大地圖北邊中央。審配守在大堂。' },
    { done: 'yuanshang_down', title: '到倉亭津，擊敗袁尚', world: 'world5', to: 'cangting', where: '倉亭津', hint: '倉亭津在黎陽東邊的渡口。' },
    { done: 'caimao_down', title: '南下襄陽，擊敗蔡瑁', world: 'world5', to: 'xiangyang', where: '襄陽', hint: '襄陽在大地圖東南。蔡瑁守在州牧府前。' },
    { done: 'ch5_end', title: '到新野，聽牧童唱臥龍岡的歌', world: 'world5', to: 'xinye', where: '新野', hint: '新野在大地圖南邊。牧童在城中央，需先拜見過劉表。' }
  );
  D.mainQuestEnd = '第五章已完成。三顧茅廬與新的世界，將在後續版本登場。';
})();
