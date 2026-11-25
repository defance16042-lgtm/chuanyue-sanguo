// 第三章「兗州風雲」：陳留募兵 → 徐州（陶謙、張闓）→ 濮陽之火（侯成、宋憲、典韋護主）→ 小沛轅門射戟 → 下邳陷陣營（高順）
// 地圖本身由 data/ch3world.js 產生（tools/build_ch3.py）。這裡是敵人、裝備、房屋、商店、對話、任務與通往第二章大地圖的出口。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };

  // ================= 敵人 =================
  B.enemies.yanzhou_thug = { name: '兗州賊', terrain: T('A', 'B', 'B', 'C'), int: 10, lead: 10, luck: 5, title: '兗州亂兵', cls: '賊兵', weapon: '刀', desc: '趁著曹操遠征、兗州空虛，各縣冒出來的盜匪與亂兵。', hp: 1050, atk: 90, def: 42, spd: 13, exp: 190, gold: 130, sprite: 2 };
  B.enemies.qingzhou_vet = { name: '青州老兵', terrain: T('A', 'B', 'B', 'C'), int: 10, lead: 12, luck: 5, title: '黃巾降兵', cls: '精兵', weapon: '槍', desc: '當年被曹操收編的青州黃巾，打仗不要命，只是跟誰都能打。', hp: 1300, atk: 98, def: 48, spd: 12, exp: 220, gold: 150, sprite: 11 };
  B.enemies.xuzhou_rebel = { name: '徐州亂兵', terrain: T('B', 'A', 'B', 'B'), int: 10, lead: 10, luck: 5, title: '徐州亂兵', cls: '亂兵', weapon: '刀', desc: '陶謙治下失了管束的兵，搶了老百姓還要說是徵收。', hp: 1150, atk: 94, def: 44, spd: 12, exp: 200, gold: 140, sprite: 3 };
  B.enemies.bz_archer = { name: '并州弓手', terrain: T('B', 'A', 'B', 'C'), int: 14, lead: 8, luck: 6, title: '呂布的弓手', cls: '弓兵', weapon: '弓', desc: '呂布從并州帶來的神射手，轅門射戟就是他們練出來的準頭。', hp: 560, atk: 96, def: 28, spd: 17, exp: 210, gold: 150, sprite: 20 };
  B.enemies.xianzhen = { name: '陷陣營兵', terrain: T('A', 'B', 'A', 'C'), int: 10, lead: 16, luck: 5, title: '高順的陷陣營', cls: '精兵', weapon: '槍', desc: '高順一手帶出來的七百精兵，號稱「所攻無不破」，穿重甲、結密陣。', hp: 1250, atk: 96, def: 48, spd: 14, exp: 300, gold: 220, sprite: 53 };
  B.enemies.zhangkai = { name: '張闓', terrain: T('B', 'A', 'A', 'C'), int: 26, lead: 46, luck: 8, title: '泰山賊・黃巾降將', cls: '賊將', weapon: '刀', desc: '陶謙派去護送曹嵩的都尉，原是黃巾降兵。看到老人家車裡的金銀，心就歪了。', hp: 36000, atk: 156, def: 72, spd: 18, exp: 4800, gold: 3400, sprite: 52, boss: true, ai: 'boss' };
  B.enemies.houcheng = { name: '侯成', terrain: T('A', 'B', 'B', 'C'), int: 30, lead: 46, luck: 10, title: '呂布部將', cls: '猛將', weapon: '刀', desc: '呂布麾下的并州將，後來因為被偷了馬、還得罪了主公，反而把呂布綁了。這時他還很忠心。', hp: 26000, atk: 142, def: 64, spd: 20, exp: 5000, gold: 3600, sprite: 40, boss: true, ai: 'boss' };
  B.enemies.songxian = { name: '宋憲', terrain: T('A', 'B', 'B', 'C'), int: 28, lead: 44, luck: 10, title: '呂布部將', cls: '猛將', weapon: '矛', desc: '呂布麾下的并州將，和侯成同進同退，連被呂布罵都一起被罵。', hp: 27000, atk: 138, def: 65, spd: 17, exp: 5000, gold: 3600, sprite: 41, boss: true, ai: 'boss' };
  B.enemies.gaoshun = { name: '高順', terrain: T('A', 'B', 'A', 'C'), int: 40, lead: 58, luck: 12, title: '陷陣營統領', cls: '陷陣將', weapon: '槍', desc: '呂布麾下最清醒的一個人，沉默寡言、不喝酒、不收禮，多次勸諫呂布不聽。他的陷陣營，是這亂世裡數一數二的精兵。', hp: 30000, atk: 142, def: 68, spd: 22, exp: 7000, gold: 5200, sprite: 49, boss: true, ai: 'boss' };
  // 一般遇敵：第三章三區（兗州西、兗州北與徐州、下邳一帶）
  B.groups.field11 = [['yanzhou_thug', 'yanzhou_thug', 'qingzhou_vet', 'bz_archer'], ['yanzhou_thug', 'yanzhou_thug', 'yanzhou_thug', 'bz_archer'], ['qingzhou_vet', 'qingzhou_vet', 'yanzhou_thug', 'bz_archer', 'bz_archer'], ['yanzhou_thug', 'qingzhou_vet', 'qingzhou_vet', 'langqi']];
  B.groups.field12 = [['xuzhou_rebel', 'xuzhou_rebel', 'qingzhou_vet', 'bz_archer'], ['xuzhou_rebel', 'xuzhou_rebel', 'xuzhou_rebel', 'bz_archer'], ['xuzhou_rebel', 'qingzhou_vet', 'yanzhou_thug', 'bz_archer', 'bz_archer'], ['langqi', 'xuzhou_rebel', 'xuzhou_rebel', 'qingzhou_vet']];
  B.groups.field13 = [['xianzhen', 'xuzhou_rebel', 'xuzhou_rebel', 'bz_archer'], ['xianzhen', 'xianzhen', 'qingzhou_vet', 'bz_archer'], ['xianzhen', 'langqi', 'langqi', 'bz_archer', 'bz_archer'], ['xianzhen', 'xianzhen', 'xianzhen', 'bz_archer']];
  B.groups.boss18 = [['zhangkai', 'yanzhou_thug', 'yanzhou_thug', 'xuzhou_rebel', 'xuzhou_rebel']];
  B.groups.boss19 = [['houcheng', 'songxian', 'qingzhou_vet', 'qingzhou_vet', 'bz_archer']];
  B.groups.boss20 = [['gaoshun', 'xianzhen', 'xianzhen', 'xianzhen', 'xianzhen']];
  // 打倒之後在野外還會（機率低）遇到的殘部
  B.rematch.zhangkai_down = 'zhangkai'; B.rematch.houcheng_down = 'houcheng'; B.rematch.puyang_fire = 'songxian'; B.rematch.gaoshun_down = 'gaoshun';
  ['zhangkai', 'houcheng', 'songxian', 'gaoshun'].forEach(function (id) { B.enemies[id + '_r'] = Object.assign({}, B.enemies[id], { rematchOf: id }); });

  // 專屬地形（terrain.js 先載入，所以第三章的敵人與角色在這裡補上）
  Object.assign(D.terrainHome, { yanzhou_thug: 'plain', qingzhou_vet: 'plain', xuzhou_rebel: 'forest', bz_archer: 'forest', xianzhen: 'plain', zhangkai: 'mountain', houcheng: 'plain', songxian: 'plain', gaoshun: 'plain', dianwei: 'plain' });
  ['yanzhou_thug', 'qingzhou_vet', 'xuzhou_rebel', 'bz_archer', 'xianzhen', 'zhangkai', 'houcheng', 'songxian', 'gaoshun'].forEach(function (id) {
    D.applyTerrain(id, B.enemies[id], !!B.enemies[id].boss);
    if (B.enemies[id + '_r']) D.applyTerrain(id + '_r', B.enemies[id + '_r'], true);
  });

  // ================= 裝備 =================
  const G4 = {
    forge_sword: { name: '精煉長劍', slot: 'weapon', wtype: '劍', mods: { pow: 36, int: 2 }, price: 1500, desc: '徐州名匠連打七日的劍，劍脊上還有他按下去的指紋。' },
    forge_blade: { name: '精煉環首刀', slot: 'weapon', wtype: '刀', mods: { pow: 36, spd: 1 }, price: 1500, desc: '環首刀的大環可以穿繩，打完仗還能掛在腰上晾。' },
    forge_lance: { name: '精煉長矛', slot: 'weapon', wtype: '矛', mods: { pow: 36, grd: 2 }, price: 1520, desc: '矛桿用的是白蠟木，彈性好，捅人也很有彈性。' },
    forge_spear: { name: '精煉鐵槍', slot: 'weapon', wtype: '槍', mods: { pow: 39, spd: -1 }, price: 1560, desc: '槍頭比人頭還重，用的人要有點自信。' },
    war_fan: { name: '運籌羽扇', slot: 'weapon', wtype: '扇', mods: { int: 18, lead: 2 }, price: 1560, desc: '扇骨裡刻著算籌，據說搖三下就能算出對方的糧草。' },
    lamellar: { name: '札甲', slot: 'armor', mods: { def: 17, spd: -1 }, price: 1500, desc: '一片片鐵札用皮繩穿起來，走起路來嘩啦嘩啦，想偷襲都不行。' },
    tiger_helm: { name: '虎首盔', slot: 'helm', mods: { def: 8, grd: 4, lead: 1 }, price: 1100, desc: '盔頂雕了隻老虎，看起來比戴盔的人還兇。' },
    swift_boots: { name: '追風靴', slot: 'boots', mods: { spd: 6, def: 3 }, price: 1200, desc: '靴底縫了三層牛皮，據說穿著它追得上逃跑的敵將。' },
    tiger_tally: { name: '虎符', slot: 'charm', mods: { lead: 9, grd: 2 }, price: 1100, desc: '半枚銅虎符，另一半在不知道哪個將軍手上。' },
    zhangkai_saber: { name: '泰山賊刀', slot: 'weapon', wtype: '刀', mods: { pow: 66, spd: 1 }, price: 0, desc: '張闓的佩刀，刀背上有好幾道缺口，是搶來的東西砍壞的。' },
    houcheng_helm: { name: '并州鐵盔', slot: 'helm', mods: { def: 13, lead: 4, grd: 3 }, price: 0, desc: '侯成戴過的盔。後來他的馬被偷，這頂盔沒被偷，算是不幸中的大幸。' },
    songxian_glaive: { name: '宋憲長戟', slot: 'weapon', wtype: '矛', mods: { pow: 64, grd: 2 }, price: 0, desc: '宋憲用的長戟，戟尖有一點彎，聽說是為了鉤住敵人的衣領。' },
    xianzhen_armor: { name: '陷陣重甲', slot: 'armor', mods: { def: 25, spd: -1 }, price: 0, desc: '陷陣營專用的重鎧，穿著它衝鋒，跟一堵移動的牆沒兩樣。' },
    gaoshun_spear: { name: '陷陣鐵槍', slot: 'weapon', wtype: '槍', mods: { pow: 70, spd: 1 }, price: 0, desc: '高順的槍。槍桿上沒有任何花紋，因為他覺得花紋不能殺人。' },
    dianwei_halberd: { name: '惡來雙戟', slot: 'weapon', wtype: '矛', mods: { pow: 58, grd: 3 }, price: 0, desc: '典韋的雙戟，一支八十斤。他說另一支是備用的。' }
  };
  Object.keys(G4).forEach(function (k) { E[k] = G4[k]; });
  D.drops.zhangkai = ['zhangkai_saber', 1.0]; D.drops.zhangkai_r = ['zhangkai_saber', 0.2];
  D.drops.houcheng = ['houcheng_helm', 1.0]; D.drops.houcheng_r = ['houcheng_helm', 0.2];
  D.drops.songxian = ['songxian_glaive', 1.0]; D.drops.songxian_r = ['songxian_glaive', 0.2];
  D.drops.gaoshun = ['gaoshun_spear', 1.0]; D.drops.gaoshun_r = ['gaoshun_spear', 0.2];
  D.drops.xianzhen = ['xianzhen_armor', 0.03];

  // ================= 助戰角色：典韋（章節結束就離隊） =================
  D.characters.dianwei = {
    id: 'dianwei', name: '典韋', sprite: 53, portrait: 169, zi: '', title: '司馬・帳下都尉', cls: '猛將', weapon: '矛', guest: true,
    terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' },
    hp: 210, tp: 6, atk: 24, int: 6, spd: 9, lead: 16, luck: 8, grd: 15,
    growth: { hp: 24, atk: 2.2, int: 0.4, spd: 0.2, lead: 0.9, luck: 0.4, grd: 1.0, tp: 0.4 },
    trait: { name: '古之惡來', desc: '武力 +3、防禦 +2', mods: { atk: 3, grd: 2 } },
    bio: '陳留己吾人，力大無窮，雙戟各重八十斤。曹操的貼身護衛，吃飯嫌別人夾菜太慢，打仗嫌敵人衝得太慢。'
  };

  D.applyTerrain('dianwei', D.characters.dianwei, true);

  // ================= 商店 =================
  const W3 = ['steel_sword', 'steel_blade', 'steel_lance', 'iron_spear', 'crane_fan', 'fine_sword', 'fine_blade', 'fine_lance', 'fine_spear', 'sage_fan'];
  const A3 = ['chain_mail', 'iron_armor', 'steel_helm', 'war_helm', 'iron_boots', 'march_boots', 'lucky_jade', 'war_banner', 'guard_charm'];
  const W4 = ['fine_sword', 'fine_blade', 'fine_lance', 'fine_spear', 'sage_fan', 'forge_sword', 'forge_blade', 'forge_lance', 'forge_spear', 'war_fan'];
  const A4 = ['iron_armor', 'lamellar', 'war_helm', 'tiger_helm', 'march_boots', 'swift_boots', 'war_banner', 'tiger_tally', 'guard_charm', 'lucky_jade'];
  D.shops.medic4 = ['herb2', 'herb3', 'tonic2', 'tonic3', 'revive', 'revive2', 'smoke'];
  D.shopKinds.medic4 = 'general'; D.shopNames.medic4 = '名醫的藥鋪';
  const SAY = {
    weapon: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，刀槍劍戟扇都有。買賣都行，你的舊兵器我也收，只是只給一半價。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    armor: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，甲、盔、靴、飾品都有。穿得好，才活得久。舊的你要賣，我也收。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    general: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，藥品和雜貨都有。多備幾包藥，保命用。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; }
  };
  const shopLines = function (kind, who, shopName, id) { return SAY[kind](who, shopName).map(function (l) { return JSON.parse(JSON.stringify(l).replace('"$"', JSON.stringify(id))); }); };
  const defShop = function (town, kind, tier, shopName, keeper) {
    const id = town + '_' + kind;
    D.shopKinds[id] = kind; D.shopNames[id] = shopName;
    D.shops[id] = kind === 'weapon' ? (tier === 4 ? W4 : W3) : kind === 'armor' ? (tier === 4 ? A4 : A3) : (tier === 4 ? D.shops.medic4 : D.shops.medic3);
    S['shop_' + id] = shopLines(kind, keeper, shopName, id);
    return id;
  };

  // ================= 城裡的房屋 =================
  // 每個城鎮：依 ch3world.js 的門序（由上到下、由左到右）排。kind：weapon/armor/general/inn 是店，其餘是民宅。
  const SLOTS = [[3, 2], [6, 2], [2, 4], [7, 4]];
  const innLines = function (who, hello) { return [{ speaker: who, text: hello, choices: [{ label: '住宿 30金', act: { rest: true } }, { label: '不住了' }] }]; };
  const HOUSES = {
    chenliu: [
      { name: '募兵所', size: 'small', chest: { id: 'h_cl_a', gold: 400, item: { herb2: 2 }, msg: '募兵桌下的木箱，裝著發給新兵的第一個月餉。' },
        npc: { name: '募兵官', sprite: 9, lines: ['募兵官：曹將軍說，來投軍的先吃三碗飯，吃得下的，直接編進虎豹騎。', '募兵官：吃不下的……嗯，編進輜重營，也算人盡其才。'] } },
      { kind: 'inn', id: 'inn', name: '陳留客棧', keeper: '掌櫃', sprite: 4, hello: '客官住一晚吧？最近兵多，鋪位緊，可是我給您留了間乾淨的。' },
      { kind: 'weapon', name: '陳留武器店', keeper: '鐵匠', sprite: 11, tier: 3 },
      { kind: 'armor', name: '陳留防具店', keeper: '甲冑匠', sprite: 8, tier: 3 },
      { kind: 'general', name: '陳留雜貨店', keeper: '掌櫃', sprite: 4, tier: 3 },
      { name: '衛茲故居', size: 'small', chest: { id: 'h_cl_b', gold: 300, msg: '供桌底下壓著一個小布袋，裡面的錢是衛家人替衛茲存的。' },
        npc: { name: '衛家老僕', sprite: 6, lines: ['老僕：我家老爺衛茲，當年把全部家財都給了曹將軍起兵，說這人以後一定了不得。', '老僕：後來他在滎陽……唉。老爺的眼光，沒錯過。'] } }
    ],
    dongah: [
      { name: '東阿縣衙', size: 'big', chest: { id: 'h_da_a', gold: 500, item: { tonic2: 2 }, msg: '縣衙的公文箱底，有一疊沒發出去的賞銀。' },
        npc: { name: '縣吏', sprite: 9, lines: ['縣吏：程昱先生在城裡到處奔走，說兗州要守住，只剩東阿、范縣、鄄城三座城。', '縣吏：三座城！您聽聽，三座城也能守，這就叫窮則變。'] } },
      { kind: 'inn', id: 'inn', name: '東阿客棧', keeper: '掌櫃', sprite: 4, hello: '東阿這幾天不安寧，不過店裡的被子還是乾的。要不要住一晚？' },
      { kind: 'weapon', name: '東阿武器店', keeper: '鐵匠', sprite: 11, tier: 3 },
      { kind: 'armor', name: '東阿防具店', keeper: '甲冑匠', sprite: 8, tier: 3 },
      { kind: 'general', name: '東阿雜貨店', keeper: '掌櫃', sprite: 4, tier: 3 }
    ],
    puyang: [
      { name: '田氏大宅', size: 'small', chest: { id: 'h_py_a', gold: 800, item: { herb3: 1, tonic3: 1 }, msg: '田家的地窖裡存了好幾箱錢，大概是準備「獻」給曹操的那一份。' },
        npc: { name: '田氏家丁', sprite: 9, states: [
          { flag: 'puyang_fire', lines: ['家丁：我家老爺說，那把火是呂布手下放的，跟我們田家一點關係都沒有。……您信嗎？反正我不信。'] },
          { lines: ['家丁：老爺正在寫一封信給曹將軍，說要「獻城」。您別看我，我什麼都不知道。'] }] } },
      { name: '濮陽府衙', size: 'big', chest: { id: 'h_py_b', gold: 600, msg: '府衙的書案下，有陳宮留下來的軍餉帳。' },
        npc: { name: '府中書吏', sprite: 10, lines: ['書吏：陳宮大人說，曹操一走，兗州就是一塊沒蓋蓋子的肉。他說這話時，還舔了舔嘴唇。', '書吏：我當時心想，大人您這比喻，是不是有點太直接了。'] } },
      { kind: 'inn', id: 'inn', name: '濮陽客棧', keeper: '掌櫃', sprite: 4, hello: '客官放心，客棧雖然燒了半邊，二樓的床還在。要住一晚嗎？' },
      { kind: 'weapon', name: '濮陽武器店', keeper: '鐵匠', sprite: 11, tier: 4 },
      { kind: 'general', name: '濮陽雜貨店', keeper: '掌櫃', sprite: 4, tier: 4 }
    ],
    xiaopei: [
      { name: '小沛縣衙', size: 'big', chest: { id: 'h_xp_a', gold: 700, item: { herb3: 1 }, msg: '縣衙的帳房裡，鎖著一小袋徐州送來的犒軍銀。' },
        npc: { name: '縣吏', sprite: 9, lines: ['縣吏：小沛是個小地方，今天卻同時住了呂布和袁術的使者，我已經三天沒睡了。', '縣吏：您說，他們要是在縣衙打起來，這房子賠得起嗎？'] } },
      { kind: 'inn', id: 'inn', name: '小沛客棧', keeper: '掌櫃', sprite: 4, hello: '小沛客棧，物美價廉。不過今晚能睡的只有一間房，您要的話趕緊。' },
      { kind: 'weapon', name: '小沛武器店', keeper: '鐵匠', sprite: 11, tier: 4 },
      { kind: 'armor', name: '小沛防具店', keeper: '甲冑匠', sprite: 8, tier: 4 },
      { kind: 'general', name: '小沛雜貨店', keeper: '掌櫃', sprite: 4, tier: 4 }
    ],
    xuzhou: [
      { name: '太守府側院', size: 'small', chest: { id: 'h_xz_a', gold: 900, item: { herb3: 2, revive: 1 }, msg: '陶謙的書房裡，一隻上了鎖的木匣，裡面是備給曹嵩一行的見面禮。' },
        npc: { name: '府中老吏', sprite: 10, lines: ['老吏：陶使君年紀大了，一天要唉聲嘆氣八次。', '老吏：今天他才嘆了五次，我看這是好兆頭。'] } },
      { kind: 'inn', id: 'inn', name: '徐州客棧', keeper: '掌櫃', sprite: 4, hello: '徐州是富庶之地，客棧也講究。住一晚吧，早飯有糕點。' },
      { kind: 'weapon', name: '徐州武器店', keeper: '鐵匠', sprite: 11, tier: 4 },
      { kind: 'armor', name: '徐州防具店', keeper: '甲冑匠', sprite: 8, tier: 4 },
      { kind: 'general', name: '徐州雜貨店', keeper: '掌櫃', sprite: 4, tier: 4 },
      { name: '糜家商號', size: 'small', chest: { id: 'h_xz_b', gold: 1200, msg: '糜家商號的帳房，櫃子裡有一包預備給賓客的銀子。' },
        npc: { name: '糜家管事', sprite: 9, lines: ['管事：我家糜竺大人家財萬貫，連店裡的掃帚都是紅木的。', '管事：他說，錢是用來花在對的人身上的。我看他最近花在您這位劉使君身上不少。'] } }
    ],
    jiwu: [
      { name: '典韋舊宅', size: 'small', chest: { id: 'h_jw_a', gold: 300, item: { herb2: 2 }, msg: '米缸底下壓著一小袋錢，是典韋寄回老家的軍餉，上面還貼著他的大名。' },
        npc: { name: '典韋的鄰居', sprite: 6, lines: ['鄰居：典韋這孩子啊，從小力氣就大，吃飯一人頂三人。', '鄰居：他年輕時替朋友報仇，把仇家一刀砍了，提著人頭走出市集，整條街沒人敢追。後來曹將軍看中他，聽說到現在還沒人敢跟他搶飯吃。'] } },
      { kind: 'general', name: '己吾雜貨店', keeper: '掌櫃', sprite: 4, tier: 3 },
      { kind: 'inn', id: 'inn', size: 'big', name: '己吾客棧', keeper: '掌櫃', sprite: 4, hello: '客官打哪來？己吾村小，客棧也小，不過典韋將軍回鄉的時候，也是住這間。要不要住一晚？' }
    ],
    liangfu: [
      { name: '採藥人的家', size: 'small', chest: { id: 'h_lf_a', gold: 500, item: { tonic2: 2, herb2: 2 }, msg: '藥簍裡藏著幾包曬好的草藥。' },
        npc: { name: '採藥人', sprite: 8, lines: ['採藥人：泰山深處有座山寨，寨主叫臧霸，手下的泰山賊最近越來越囂張。', '採藥人：山裡我走了三十年，最怕的不是老虎，是賊。老虎起碼不會跟我要買路錢。'] } },
      { kind: 'general', name: '梁父雜貨店', keeper: '掌櫃', sprite: 4, tier: 3 },
      { kind: 'inn', id: 'inn', size: 'big', name: '梁父客棧', keeper: '掌櫃', sprite: 4, hello: '梁父山腳下的客棧，晚上能聽見山風。住一晚吧，被子我曬過了。' }
    ],
    huaxian: [
      { name: '驛站舊屋', size: 'small', chest: { id: 'h_hx_a', gold: 600, msg: '驛站的案頭抽屜裡，有一小袋沒人認領的銀子。' },
        npc: { name: '驛丁', sprite: 10, states: [
          { flag: 'zhangkai_down', lines: ['驛丁：曹嵩老太爺就是在這裡遇害的。那天夜裡，一百多輛車，全被劫了。', '驛丁：張闓死了，老太爺卻回不來了。我們華縣的人，這輩子都不想再看見那天的火光。'] },
          { lines: ['驛丁：老太爺的車隊今天該路過華縣了。一百多輛車，滿滿都是財物，這年頭帶這麼多錢趕路，真是不要命。', '驛丁：我看護送的那個都尉，眼神總是在車上打轉。你們……要不要去看一眼？'] }] } },
      { kind: 'general', name: '華縣雜貨店', keeper: '掌櫃', sprite: 4, tier: 3 },
      { kind: 'inn', id: 'inn', size: 'big', name: '華縣客棧', keeper: '掌櫃', sprite: 4, hello: '華縣是個小地方，來往的都是趕路的。住一晚吧，睡得香一點。' }
    ],
    xiapi: [
      { name: '圯橋老人的茅屋', size: 'small', chest: { id: 'h_xp_b', gold: 500, item: { tonic3: 1 }, msg: '茅屋的角落有只舊木箱，裡面沒有書，只有一雙破草鞋。' },
        npc: { name: '圯橋老人', sprite: 8, states: [
          { flag: 'gaoshun_down', lines: ['老人：高順輸了，呂布的氣數也快到了。這些事我沒看，是橋下的水告訴我的。', '老人：老夫年輕時，在橋上丟過一隻鞋，教一個少年撿了三次。那少年得了一卷書，後來幫著漢高祖得了天下。', '老人：書叫《三略》，講的是「柔能制剛」。如今它不在老夫手裡……你們去問問天下的讀書人，遇到肯為百姓讀書的，大概就是了。'], set: { clue_sanlue: true } },
          { lines: ['老人：年輕人，橋下水深，鞋不要亂丟。', '老人：……你問我知不知道一卷書？等你們把外頭那支穿重甲的軍隊解決了，老夫再說。'] }] } },
      { name: '下邳守將府', size: 'big', chest: { id: 'h_xp_c', gold: 1000, item: { herb3: 2 }, msg: '守將府的武庫裡，有一排排擦得發亮的槍，連一粒灰都沒有。' },
        npc: { name: '守府親兵', sprite: 9, lines: ['親兵：我們統領高順大人從不喝酒，連過年都不喝。', '親兵：他說酒會誤事。主公呂將軍說，這人真沒意思。'] } },
      { kind: 'inn', id: 'inn', name: '下邳客棧', keeper: '掌櫃', sprite: 4, hello: '下邳客棧，乾淨安靜。這年頭安靜的店不多了，您要不要住一晚？' },
      { kind: 'weapon', name: '下邳武器店', keeper: '鐵匠', sprite: 11, tier: 4 },
      { kind: 'armor', name: '下邳防具店', keeper: '甲冑匠', sprite: 8, tier: 4 }
    ]
  };
  Object.keys(HOUSES).forEach(function (town) {
    const tm = D.maps[town], doors = D.ch3Doors[town];
    HOUSES[town].forEach(function (h, i) {
      const dr = doors[i], ds = Array.isArray(dr[0]) ? dr : [dr];
      const big = h.size === 'big', w = big ? 12 : 10, ht = 7, dx = Math.floor(w / 2) - 1, id = town + '_' + (h.id || 'h' + i);
      const rows = [];
      for (let y = 0; y < ht; y++) { let r = ''; for (let x = 0; x < w; x++) r += (y === 0 || x === 0 || x === w - 1 || y === ht - 1) ? '#' : '_'; rows.push(r); }
      const put = function (x, y, ch) { rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); };
      put(1, 1, 'X'); put(2, 1, 'B'); put(1, 5, 'B'); if (big) put(w - 2, 5, 'X');
      put(dx, ht - 1, 'D'); if (ds.length > 1) put(dx + 1, ht - 1, 'D');
      const npcs = [], objects = [];
      let mapName = h.name;
      if (h.kind) {
        const mk = h.kind;
        let dlg;
        if (mk === 'inn') { dlg = 'inn_' + id; S[dlg] = innLines(h.keeper, h.hello); }
        else { dlg = 'shop_' + defShop(town, mk, h.tier, h.name, h.keeper); }
        npcs.push({ id: id + '_keeper', name: h.keeper, sprite: h.sprite, x: 4, y: 2, dir: 'down', dialogue: dlg, alts: [] });
      } else {
        const n = h.npc, alts = [];
        let def = null;
        (n.states || [{ lines: n.lines }]).forEach(function (st, k) {
          const key = 'h_' + town + '_' + i + '_0_' + k;
          S[key] = st.lines.map(function (t, li) {
            const m = /^([^：]{1,8})：(.*)$/.exec(t);
            const line = { speaker: m ? m[1] : n.name, text: m ? m[2] : t };
            if (li === st.lines.length - 1) { if (st.act) line.act = st.act; if (st.set) line.set = st.set; }
            return line;
          });
          if (st.flag) alts.push({ flag: st.flag, dialogue: key }); else def = key;
        });
        npcs.push({ id: id + '_n0', name: n.name, sprite: n.sprite, x: SLOTS[0][0] + (big ? 1 : 0), y: SLOTS[0][1], dir: 'down', dialogue: def || alts[alts.length - 1].dialogue, alts: alts });
        if (h.chest) objects.push(Object.assign({ type: 'chest', x: w - 2, y: 1 }, h.chest));
      }
      D.maps[id] = { name: mapName, tiles: rows, start: { x: dx, y: ht - 2, dir: 'up' },
        warps: [{ x: dx, y: ht - 1, to: town, tx: ds[0][0], ty: ds[0][1] + 1, dir: 'down' }].concat(ds.length > 1 ? [{ x: dx + 1, y: ht - 1, to: town, tx: ds[1][0], ty: ds[1][1] + 1, dir: 'down' }] : []),
        npcs: npcs, objects: objects };
      ds.forEach(function (d) { tm.warps.push({ x: d[0], y: d[1], to: id, tx: dx, ty: ht - 2, dir: 'up' }); });
    });
  });
  // 戶外商販（沒有房子可以分配的店）
  defShop('puyang', 'armor', 4, '濮陽防具攤', '流動甲冑商'); defShop('xiapi', 'general', 4, '下邳雜貨攤', '行腳藥商');
  const nm = D.maps;
  nm.puyang.npcs.push({ id: 'py_armorer', name: '流動甲冑商', sprite: 8, x: 8, y: 16, dir: 'right', dialogue: 'shop_puyang_armor' });
  nm.xiapi.npcs.push({ id: 'xp_medic', name: '行腳藥商', sprite: 10, x: 6, y: 16, dir: 'up', dialogue: 'shop_xiapi_general' });

  // ================= 城裡的人（主線與閒聊） =================
  const P = function (map, o) { nm[map].npcs.push(o); };
  // ---- 陳留
  nm.chenliu.events.push({ once: 'cl_intro_done', dialogue: 'cl_intro' });
  P('chenliu', { id: 'cl_caocao', name: '曹操', sprite: 17, x: 11, y: 7, dir: 'down', dialogue: 'cl_caocao', alts: [{ flag: 'cl_meet', dialogue: 'cl_caocao2' }] });
  P('chenliu', { id: 'cl_dianwei', name: '典韋', sprite: 53, x: 13, y: 7, dir: 'left', dialogue: 'cl_dianwei', hideIf: 'cl_meet' });
  P('chenliu', { id: 'cl_soldier', name: '新兵', sprite: 9, x: 5, y: 11, dir: 'right', dialogue: 'cl_soldier' });
  P('chenliu', { id: 'cl_kid', name: '孩童', sprite: 7, x: 17, y: 12, dir: 'left', dialogue: 'cl_kid' });
  // ---- 東阿
  P('dongah', { id: 'da_chengyu', name: '程昱', sprite: 10, x: 11, y: 6, dir: 'down', dialogue: 'da_chengyu' });
  P('dongah', { id: 'da_peasant', name: '農夫', sprite: 4, x: 7, y: 12, dir: 'right', dialogue: 'da_peasant' });
  // ---- 徐州
  P('xuzhou', { id: 'xz_taoqian', name: '陶謙', sprite: 56, x: 12, y: 8, dir: 'down', dialogue: 'xz_taoqian', alts: [{ flag: 'zhangkai_down', dialogue: 'xz_taoqian3' }, { flag: 'xz_taoqian', dialogue: 'xz_taoqian2' }] });
  P('xuzhou', { id: 'xz_mizhu', name: '糜竺', sprite: 57, x: 10, y: 8, dir: 'right', dialogue: 'xz_mizhu', alts: [{ flag: 'zhangkai_down', dialogue: 'xz_mizhu2' }] });
  P('xuzhou', { id: 'xz_zhangkai', name: '張闓', sprite: 58, x: 12, y: 16, dir: 'up', dialogue: 'boss_zhangkai', showIf: 'xz_taoqian', hideIf: 'zhangkai_down' });
  P('xuzhou', { id: 'xz_courier', name: '快馬信使', sprite: 9, x: 7, y: 12, dir: 'right', dialogue: 'xz_courier', showIf: 'zhangkai_down', hideIf: 'houcheng_down' });
  P('xuzhou', { id: 'xz_citizen', name: '徐州百姓', sprite: 7, x: 17, y: 12, dir: 'left', dialogue: 'xz_citizen' });
  // ---- 濮陽
  nm.puyang.events.push({ once: 'py_intro_done', dialogue: 'py_intro', need: ['yz_news'] });
  P('puyang', { id: 'py_chengong', name: '陳宮', sprite: 54, x: 10, y: 7, dir: 'right', dialogue: 'py_chengong', hideIf: 'houcheng_down' });
  P('puyang', { id: 'py_houcheng', name: '侯成', sprite: 46, x: 12, y: 7, dir: 'left', dialogue: 'boss_houcheng', hideIf: 'houcheng_down' });
  P('puyang', { id: 'py_caocao', name: '曹操', sprite: 17, x: 8, y: 9, dir: 'right', dialogue: 'py_caocao', alts: [{ flag: 'puyang_fire', dialogue: 'py_caocao2' }], showIf: 'yz_news' });
  P('puyang', { id: 'py_refugee', name: '難民', sprite: 7, x: 15, y: 11, dir: 'left', dialogue: 'py_refugee' });
  // ---- 小沛
  P('xiaopei', { id: 'xp_lubu', name: '呂布', sprite: 33, x: 11, y: 5, dir: 'down', dialogue: 'xp_lubu', alts: [{ flag: 'xp_archery', dialogue: 'xp_lubu2' }], showIf: 'houcheng_down' });
  P('xiaopei', { id: 'xp_jiling', name: '紀靈', sprite: 9, x: 9, y: 5, dir: 'right', dialogue: 'xp_jiling', alts: [{ flag: 'xp_archery', dialogue: 'xp_jiling2' }], showIf: 'houcheng_down' });
  P('xiaopei', { id: 'xp_watcher', name: '圍觀百姓', sprite: 6, x: 16, y: 11, dir: 'left', dialogue: 'xp_watcher' });
  // ---- 下邳
  P('xiapi', { id: 'xp_gaoshun', name: '高順', sprite: 55, x: 11, y: 7, dir: 'down', dialogue: 'boss_gaoshun', showIf: 'xp_archery', hideIf: 'gaoshun_down' });
  P('xiapi', { id: 'xp_chengong', name: '陳宮', sprite: 54, x: 14, y: 8, dir: 'left', dialogue: 'xp_chengong', showIf: 'gaoshun_down' });
  P('xiapi', { id: 'xp_soldier', name: '下邳守兵', sprite: 9, x: 15, y: 11, dir: 'left', dialogue: 'xp_soldier' });

  // ---- 三個村莊
  const V = function (map, id, name, sprite, x, y, dir, lines, flagAlt) {
    S['v_' + id] = lines.map(function (t) { return { speaker: name, text: t }; });
    const n = { id: id, name: name, sprite: sprite, x: x, y: y, dir: dir, dialogue: 'v_' + id };
    if (flagAlt) { S['v_' + id + '_2'] = flagAlt.lines.map(function (t) { return { speaker: name, text: t }; }); n.alts = [{ flag: flagAlt.flag, dialogue: 'v_' + id + '_2' }]; }
    nm[map].npcs.push(n);
  };
  V('jiwu', 'jw_wife', '村婦', 6, 10, 6, 'down', ['聽說咱們村的典韋當了曹將軍的大官，村裡人都說：「那娃從小就愛吃，現在終於吃到官飯了。」']);
  V('jiwu', 'jw_hunter', '獵戶', 7, 17, 12, 'left', ['我打了半輩子獵，山裡的野豬看見典韋都繞著走。他一個人能背兩頭回來，真是怪物。']);
  V('liangfu', 'lf_herb', '採藥老翁', 8, 13, 8, 'down', ['泰山上有座賊寨，聽說裡面有個通天洞，一路通到山後去。你們要是進去，記得多備藥。']);
  V('liangfu', 'lf_kid', '孩童', 7, 6, 12, 'right', ['我爹說，晚上不要往山裡跑，會被泰山賊抓去當伙夫。我說我不會煮飯，他說那更糟。']);
  V('huaxian', 'hx_post', '驛卒', 9, 10, 6, 'down', ['曹老太爺的車隊今天要來。我們華縣驛站準備了一整桌，就是不知道他吃不吃得慣。'], { flag: 'zhangkai_down', lines: ['驛站的桌子，到現在還沒收。老太爺沒來得及吃。'] });
  V('huaxian', 'hx_farmer', '老農', 6, 17, 12, 'left', ['這年頭種地都不安穩，兵來了搶糧，賊來了搶人。我就想活著把這季麥子收了。']);
  D.worldBackfill.jiwu = 'xurong_down'; D.worldBackfill.liangfu = 'cl_meet'; D.worldBackfill.huaxian = 'xz_taoqian';

  // ================= 對話 =================
  S.pass_sealed3 = [{ speaker: '', text: '關門守軍攔住去路：「洛陽的事情還沒了結，南邊的兗州、徐州不太平，沒有令牌不放行！」' }];
  S.cl_intro = [
    { speaker: '', text: '陳留。兗州最西邊的一座城，城牆比洛陽的完整多了，街上到處是剛剛招來的新兵。' },
    { speaker: '', text: '從董卓手上逃出來的曹操，在這裡變賣家財、豎起大旗，誰來投軍，就賞一碗飯。', set: { cl_intro_done: true } },
    { speaker: '劉備', text: '孟德兄的動作，比誰都快。' },
    { speaker: '諸葛貓妖', text: '喵……我覺得這地方的飯，比洛陽的好吃。' }
  ];
  S.cl_soldier = [{ speaker: '新兵', text: '我是三天前來投軍的！曹將軍說，吃得下三碗飯的，直接編進精銳。我吃了五碗，他們說：「那你去管糧草吧。」' }];
  S.cl_kid = [{ speaker: '孩童', text: '我也想去當兵！可是長官說我連矛都拿不動。我說我可以去拿矛頭，他們說那更危險。' }];
  S.cl_dianwei = [
    { speaker: '典韋', text: '哼，又是來蹭飯的？……喔，你們是跟著曹公打過洛陽的人。' },
    { speaker: '典韋', text: '俺這雙戟八十斤一支，你們看清楚了。去找曹公吧，他在前面。' }
  ];
  S.cl_caocao = [
    { speaker: '曹操', text: '玄德！哈哈，你們終於到了。洛陽之後，我們都差點被董卓的人包圓。' },
    { speaker: '曹操', text: '我在陳留散了家財，招來五千人。袁本初他們……嗯，說要搞什麼盟主，我看盟主這個頭銜，只能當飯吃。' },
    { speaker: '劉備', text: '孟德兄有什麼打算？' },
    { speaker: '曹操', text: '我父親曹嵩在琅琊避難，陶謙那老頭派人說要護送他來兗州。你們替我走一趟徐州，去見陶使君，順便盯著點。' },
    { speaker: '曹操', text: '對了，這位是典韋，我帳下最能打的。他吃飯嫌夾菜慢，打仗嫌敵人慢，你們帶著他，路上不會寂寞。' },
    { speaker: '典韋', text: '主公放心。誰敢動曹老太爺一根汗毛，俺把他的戟折成牙籤。', act: { guest: 'dianwei' } },
    { speaker: '', text: '（典韋助戰，暫時加入了隊伍。）', set: { cl_meet: true } }
  ];
  S.cl_caocao2 = [{ speaker: '曹操', text: '徐州就在東南邊，從小沛過去最快。我父親一生沒吃過苦，路上你們多擔待。' }];
  S.da_chengyu = [
    { speaker: '程昱', text: '主公出征在外，兗州只剩下三座城。我帶著幾百人守在東阿，守一天算一天。' },
    { speaker: '程昱', text: '你們要是路過，替我留意一下濮陽那邊。陳宮那個人，聰明得很，聰明人做起壞事來，最難防。' }
  ];
  S.da_peasant = [{ speaker: '農夫', text: '又要打仗了？我種的麥子還沒收呢。徐州、濮陽、陳留，哪個地方的麥子不是麥子？' }];
  S.xz_taoqian = [
    { speaker: '陶謙', text: '喔喔，你們是曹孟德派來的？老夫陶謙，在這徐州守了一輩子。' },
    { speaker: '陶謙', text: '曹老太爺昨日從琅琊啟程，老夫派了都尉張闓帶兵護送，應當今日就到。' },
    { speaker: '糜竺', text: '使君放心，我已命人備了酒席。……奇怪，怎麼這麼久還沒有消息？' },
    { speaker: '', text: '（先在城裡逛逛，等等看曹嵩一行的消息。城南好像有些騷動。）', set: { xz_taoqian: true } }
  ];
  S.xz_taoqian2 = [{ speaker: '陶謙', text: '老夫心裡不踏實。張闓那個人……他原本是黃巾降兵，我本不該信他。' }];
  S.xz_taoqian3 = [{ speaker: '陶謙', text: '曹嵩……死了。老夫這一生，從沒有這麼想死過一次。曹操那邊，老夫是無話可說了。' }];
  S.xz_mizhu = [{ speaker: '糜竺', text: '我家世代經商，沒有打過仗。可我看得出，這座城的氣，不太對。' }];
  S.xz_mizhu2 = [{ speaker: '糜竺', text: '我願散盡家財，只求曹操息怒。可我知道他不會。他的眼睛，已經是紅的了。' }];
  S.xz_citizen = [{ speaker: '徐州百姓', text: '我們徐州是魚米之鄉，從沒有這樣擔心過。聽說曹操的父親要經過這裡，大家都在想，萬一出事，我們都要陪葬。' }];
  S.boss_zhangkai = [
    { speaker: '張闓', text: '喔？你們是誰的人？我這輛車上，可沒什麼好看的。' },
    { speaker: '劉備', text: '你是陶使君派去護送曹老太爺的都尉？老太爺人呢？' },
    { speaker: '張闓', text: '……那老頭子嘛，車裡的金銀太多，路上不太平，我替他保管了。他自己，也在路上被我「保管」了。' },
    { speaker: '典韋', text: '你說什麼？！你把曹老太爺怎麼了？！' },
    { speaker: '張闓', text: '嘿嘿，一刀的事。想替他討回公道？來啊，我張闓也不是吃素的！', act: { battle: 'boss18', flag: 'zhangkai_down', after: 'zhangkai_after' } }
  ];
  S.zhangkai_after = [
    { speaker: '張闓', text: '……沒想到你們這麼能打。罷了，我帶著金銀往南逃，不信你們追得上。' },
    { speaker: '', text: '張闓帶著殘部逃入淮南的山林，只留下一輛翻倒的馬車，與滿地的血跡。' },
    { speaker: '典韋', text: '……曹老太爺。' },
    { speaker: '劉備', text: '典韋將軍，節哀。我們回去，如實告訴孟德兄。' },
    { speaker: '', text: '（獲得泰山賊刀、金 3400。）', act: { gold: 3400 } },
    { speaker: '快馬信使', text: '劉使君！急報！曹將軍聽說老太爺遇害，已盡起大軍攻徐州，所到之處雞犬不留！' },
    { speaker: '快馬信使', text: '還有一件更壞的事——陳宮、張邈聯合呂布，趁曹將軍不在，偷襲了兗州！濮陽已被呂布佔了！' },
    { speaker: '劉備', text: '……什麼？！' },
    { speaker: '諸葛貓妖', text: '喵，這下，陳留、東阿，都要變成孤島了。' },
    { speaker: '', text: '（主線：趕往濮陽，奪回兗州。）', set: { yz_news: true } }
  ];
  S.xz_courier = [{ speaker: '快馬信使', text: '急報不能再拖了！呂布佔了濮陽，曹將軍的後路被斷了。劉使君，求您務必先去濮陽！' }];
  S.py_intro = [
    { speaker: '', text: '濮陽。城門半開著，守軍的旗幟，換成了「呂」字大旗。' },
    { speaker: '', text: '街上看不到幾個百姓，只有成排的并州兵，弓箭上弦。' },
    { speaker: '曹操', text: '玄德！你們也到了……哼，我曹孟德一生，從沒被人這樣截過後路。' }
  ];
  S.py_refugee = [{ speaker: '難民', text: '昨天還是曹軍的地盤，今天就變了呂布的。我們這些百姓，是誰來都一樣，只求別燒房子。' }];
  S.py_chengong = [
    { speaker: '陳宮', text: '喔？劉玄德。我知道你，天下皆知你仁義。可仁義換不來地盤。' },
    { speaker: '陳宮', text: '曹操殺了邊讓、屠了徐州，這樣的人，不配當兗州之主。' },
    { speaker: '劉備', text: '陳公臺，你當年放曹操一命，卻說他是奸雄。如今自己……' },
    { speaker: '陳宮', text: '……這是我這輩子最大的錯，也是最後一次錯。呂布將軍的部下就在前面，請吧。' }
  ];
  S.py_caocao = [
    { speaker: '曹操', text: '我剛從徐州趕回來。我父親的仇還沒報完，兗州又被人搶了。這世上，真是沒有一天是消停的。' },
    { speaker: '曹操', text: '侯成和宋憲守在前面。玄德，你們先上，我帶典韋壓陣！……不對，典韋在你們那裡。算了，我自己壓陣。' }
  ];
  S.py_caocao2 = [{ speaker: '曹操', text: '我的鬍子……我的鬍子只剩一半了。典韋，你下次救我的時候，能不能順便把鬍子也救一救？' }];
  S.boss_houcheng = [
    { speaker: '侯成', text: '來者何人？報上名來！' },
    { speaker: '宋憲', text: '還用問？曹操的人。兄弟，上！' },
    { speaker: '曹操', text: '呂布的走狗，還敢攔路？今日讓你們知道，什麼叫「盟主」！' },
    { speaker: '侯成', text: '呂將軍說了，曹操的人，一個不留！', act: { battle: 'boss19', flag: 'houcheng_down', after: 'houcheng_after' } }
  ];
  S.houcheng_after = [
    { speaker: '侯成', text: '……撤！撤進城去！' },
    { speaker: '宋憲', text: '兄弟！別丟下我！……哎，這人怎麼跑得比我還快？' },
    { speaker: '', text: '呂布軍殘部退入濮陽城中。這時，城中的大戶田氏派人送來一封信，說願意「獻城」，請曹將軍當夜入城。' },
    { speaker: '曹操', text: '呵，有人要獻城？那就去看看，是真獻，還是真「獻」。' },
    { speaker: '劉備', text: '孟德兄，小心有詐。' },
    { speaker: '曹操', text: '怕什麼？我曹孟德有典韋在側，天底下哪有人敢對我動手！……對吧，典韋？' },
    { speaker: '典韋', text: '主公放心，誰敢動您，俺的雙戟先動他。' },
    { speaker: '', text: '當夜，曹操領兵入城。剛過城門，城中四面火起——田氏果然是詐降！' },
    { speaker: '曹操', text: '中計了！快撤！東門！往東門撤！……不對，東門也是火！' },
    { speaker: '呂布軍', text: '放箭！放火！別讓曹操跑了！' },
    { speaker: '典韋', text: '主公！您的馬跑了！上俺的肩！' },
    { speaker: '曹操', text: '典韋！火燒到鬍子了！我的鬍子！' },
    { speaker: '典韋', text: '您別動，俺幫您拍掉！……啪！' },
    { speaker: '曹操', text: '好疼！你是想拍火還是拍我？！' },
    { speaker: '典韋', text: '都拍！俺一戟開路，您跟著俺！今天這火燒不死您，也燒不死俺！' },
    { speaker: '', text: '典韋雙戟開路，一路殺出重圍，背著曹操衝出火海。他的衣甲被燒了大半，背上全是傷，卻沒有倒下。' },
    { speaker: '曹操', text: '……典韋，你這條命，是我的。以後誰再敢說你傻，我先砍他。' },
    { speaker: '典韋', text: '主公，您的鬍子只剩一半了。' },
    { speaker: '曹操', text: '……閉嘴。（獲得并州鐵盔、宋憲長戟、金 3600。）', act: { gold: 3600 } },
    { speaker: '', text: '呂布軍趁夜突圍，濮陽失守又復得。曹操退守東阿，與呂布隔城對峙，戰事進入膠著。', set: { puyang_fire: true } },
    { speaker: '', text: '同一時間，徐州的陶謙病重，將徐州託付給劉備。而呂布兵敗兗州，一路南逃，最後投奔了劉備所在的小沛。' }
  ];
  S.xp_watcher = [{ speaker: '圍觀百姓', text: '聽說呂布大將軍今天要在轅門射戟！我們都來看熱鬧。這比唱戲還好看。' }];
  S.xp_lubu = [
    { speaker: '呂布', text: '喔？劉備！你在這兒？……不對，今天是我請客。紀靈的人馬已經兵臨城下，你要的是和，還是戰？' },
    { speaker: '劉備', text: '玄德只求兩家罷兵。呂將軍，您願意出面調停嗎？' },
    { speaker: '呂布', text: '哈！本將軍願意。可是我有個辦法：我把畫戟插在一百五十步外的轅門上，我一箭射中小枝，你們兩家就罷兵。要是射不中，隨你們打。' },
    { speaker: '紀靈', text: '……一百五十步？別開玩笑了，你連箭都未必拉得開。' },
    { speaker: '呂布', text: '看好了！', set: { xp_archery_start: true } },
    { speaker: '', text: '呂布拈弓搭箭，一聲弦響，箭矢如流星，正中畫戟小枝。轅門內外，一片寂靜。' },
    { speaker: '紀靈', text: '……天神也。我們撤兵。' },
    { speaker: '呂布', text: '哈哈哈哈！本將軍的箭，從沒有射不中的東西！' },
    { speaker: '劉備', text: '呂將軍，謝謝您。' },
    { speaker: '諸葛貓妖', text: '喵，這人射戟很準，射人心……大概也很準，射不準的是自己的運氣。' },
    { speaker: '', text: '（獲得金 3000。）', act: { gold: 3000 } },
    { speaker: '', text: '然而，呂布並非久居人下之人。不久之後，他趁劉備出征袁術，悄悄佔領了徐州與下邳。' },
    { speaker: '', text: '（主線：前往下邳，奪回要地，擊敗呂布的陷陣營。）', set: { xp_archery: true } }
  ];
  S.xp_lubu2 = [{ speaker: '呂布', text: '哈！劉備，這徐州小城，我先替你看管著。你也別氣，本將軍這輩子，從沒有為別人看過家。' }];
  S.xp_jiling = [{ speaker: '紀靈', text: '袁公路大人的軍令是「拿下小沛」。可呂布這個人……我看他是在坑我們。' }];
  S.xp_jiling2 = [{ speaker: '紀靈', text: '輸了就是輸了。回去告訴袁公，呂布這個人，不能惹。' }];
  S.xp_chengong = [
    { speaker: '陳宮', text: '你們贏了。高順敗了，呂布的氣數也盡了。可我陳宮，還是不會投降。' },
    { speaker: '陳宮', text: '當年我放走曹操，是我這輩子最大的錯。呂布這人，有勇無謀，我跟著他，也是半斤八兩。' }
  ];
  S.xp_soldier = [{ speaker: '下邳守兵', text: '統領高順大人說，進城的人，先卸甲再報名字。我說，要是連甲都卸了，打起來怎麼辦？他說，那就別打。' }];
  S.boss_gaoshun = [
    { speaker: '高順', text: '來了。我家主公說，劉備是個仁義之人，不會對我們動手。可我不信。' },
    { speaker: '劉備', text: '高將軍，我們不願與你為敵。只要你交還下邳，我保你們性命。' },
    { speaker: '高順', text: '……我是呂布的人。主公再不堪，也是主公。陷陣營，結陣！' },
    { speaker: '典韋', text: '來得好！這才是俺想打的對手！', act: { battle: 'boss20', flag: 'gaoshun_down', after: 'gaoshun_after' } }
  ];
  S.gaoshun_after = [
    { speaker: '高順', text: '……陷陣營，從沒有輸過。今日，是第一次。' },
    { speaker: '劉備', text: '高將軍，你是個真正的將軍。只可惜，跟錯了人。' },
    { speaker: '高順', text: '主公不聽我的勸，我就守著他。這是我的道。……你們走吧，下邳，就交給你們了。' },
    { speaker: '', text: '（獲得陷陣鐵槍、金 5200。）', act: { gold: 5200 } },
    { speaker: '典韋', text: '主公那邊還在等俺。劉使君，諸葛先生，各位，俺就此告辭了。' },
    { speaker: '劉備', text: '典韋將軍，保重。替我向孟德兄問好。', act: { leave: 'dianwei' } },
    { speaker: '', text: '下邳城外，有個老人倚在橋上，遠遠看著這支剛打完仗的隊伍。老人手裡，似乎抱著一隻舊草鞋。' },
    { speaker: '', text: '（城中茅屋的圯橋老人，似乎知道些什麼。）' },
    { speaker: '', text: '【第三章　兗州風雲　完】', set: { ch3_end: true } }
  ];

  // ================= 主線任務 =================
  D.mainQuest.push(
    { done: 'cl_meet', title: '第三章：穿過關東南邊的關門，到陳留見曹操', world: 'world3', to: 'chenliu', where: '陳留', hint: '關東大地圖（洛陽附近）最南邊有一道關門，打完徐榮才會開。' },
    { done: 'xz_taoqian', title: '到徐州拜見陶謙', world: 'world3', to: 'xuzhou', where: '徐州', hint: '徐州在兗徐大地圖的西南方，沿路會經過小沛。' },
    { done: 'zhangkai_down', title: '在徐州城南擊敗殺害曹嵩的張闓', world: 'world3', to: 'xuzhou', where: '徐州城內南面', hint: '張闓守在城南。典韋會與你同行。' },
    { done: 'houcheng_down', title: '趕往濮陽，擊敗侯成與宋憲', world: 'world3', to: 'puyang', where: '濮陽', hint: '濮陽在大地圖東北。打完之後會有一場大火。' },
    { done: 'xp_archery', title: '到小沛，目睹呂布轅門射戟', world: 'world3', to: 'xiaopei', where: '小沛', hint: '小沛在大地圖正中央偏南。' },
    { done: 'gaoshun_down', title: '到下邳，擊敗高順與陷陣營', world: 'world3', to: 'xiapi', where: '下邳', hint: '下邳在大地圖東南。陷陣營都穿重甲，要備好藥品。' }
  );
  D.mainQuestEnd = '第三章主線已全部完成。第四章敬請期待！圯橋老人說的《三略》，還有大地圖上的洞穴與支線，都可以先去看看。';

  // ================= 通往第二章大地圖的出口 =================
  // 關東大地圖（world2）南端：從酸棗往南開一條路，盡頭是一道關門，打完徐榮才會開。
  (function () {
    const m = D.maps.world2, grid = m.tiles.map(function (r) { return r.split(''); });
    for (let y = 40; y <= 56; y++) grid[y][62] = ',';
    for (let y = 53; y <= 56; y++) { grid[y][61] = 'g'; grid[y][63] = 'g'; }
    grid[57][62] = 'G'; grid[57][61] = 'Q'; grid[57][63] = 'Q'; grid[56][62] = ',';
    m.tiles = grid.map(function (r) { return r.join(''); });
    m.warps.push({ x: 62, y: 57, to: 'world3', tx: 3, ty: 13, dir: 'right', need: 'xurong_down', deny: 'pass_sealed3', bx: 62, by: 56 });
  })();
  D.worldBackfill.chenliu = 'xurong_down'; D.worldBackfill.dongah = 'cl_meet'; D.worldBackfill.xuzhou = 'cl_meet';
  D.worldBackfill.puyang = 'zhangkai_down'; D.worldBackfill.xiaopei = 'houcheng_down'; D.worldBackfill.xiapi = 'xp_archery';
})();
