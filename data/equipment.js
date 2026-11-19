// 裝備資料。五個欄位：weapon 武器、armor 護甲、helm 頭盔、boots 鞋靴、charm 飾品。
// wtype：武器種類（劍／刀／矛／槍／扇），要和角色的武器種類相同才能裝備。
// mods：能力加成（pow 攻擊力、def 防禦力、atk 武力、int 智力、spd 速度、lead 統率、luck 運氣、grd 守備）。
// only：專屬裝備，只有該角色能裝。shop：商店販售（price 金）。
window.DATA = window.DATA || {};
window.DATA.slots = { weapon: '武器', armor: '護甲', helm: '頭盔', boots: '鞋靴', charm: '飾品' };
window.DATA.equipment = {
  // 武器
  wood_sword:  { name: '木劍',     slot: 'weapon', wtype: '劍', mods: { pow: 4 }, price: 40, shop: 1, desc: '練習用的劍' },
  iron_sword:  { name: '鐵劍',     slot: 'weapon', wtype: '劍', mods: { pow: 10 }, price: 120, shop: 1, desc: '尋常鐵匠打的劍' },
  iron_blade:  { name: '鐵刀',     slot: 'weapon', wtype: '刀', mods: { pow: 10 }, price: 120, shop: 1, desc: '厚背的鐵刀' },
  iron_lance:  { name: '鐵矛',     slot: 'weapon', wtype: '矛', mods: { pow: 10, grd: 1 }, price: 130, shop: 1, desc: '矛頭沉，守得住' },
  spear:       { name: '長槍',     slot: 'weapon', wtype: '槍', mods: { pow: 12, spd: -1 }, price: 150, shop: 1, desc: '攻擊強，稍重' },
  feather_fan: { name: '羽扇',     slot: 'weapon', wtype: '扇', mods: { int: 5 }, price: 130, shop: 1, desc: '輕搖羽扇，頭腦清晰' },
  bamboo_book: { name: '竹簡兵書', slot: 'weapon', wtype: '扇', mods: { int: 3, lead: 3 }, price: 160, shop: 1, desc: '裡面寫的是行軍之法' },
  // 護甲
  cloth:       { name: '布衣',     slot: 'armor', mods: { def: 1 }, price: 30, shop: 1, desc: '一般百姓穿的衣服' },
  leather:     { name: '皮甲',     slot: 'armor', mods: { def: 3 }, price: 90, shop: 1, desc: '輕便的皮甲' },
  scale:       { name: '鐵札甲',   slot: 'armor', mods: { def: 6, spd: -1 }, price: 220, shop: 1, desc: '鐵片編成，較重' },
  // 頭盔
  headband:    { name: '頭巾',     slot: 'helm', mods: { def: 1 }, price: 25, shop: 1, desc: '包頭的布巾' },
  iron_helm:   { name: '鐵盔',     slot: 'helm', mods: { def: 2, grd: 2 }, price: 100, shop: 1, desc: '擋得住一記悶棍' },
  // 鞋靴
  straw_shoes: { name: '草鞋',     slot: 'boots', mods: { spd: 1 }, price: 30, shop: 1, desc: '劉備家的名產' },
  leather_boot:{ name: '皮靴',     slot: 'boots', mods: { spd: 2, def: 1 }, price: 110, shop: 1, desc: '跑得快，也耐穿' },
  // 飾品
  jade:        { name: '玉佩',     slot: 'charm', mods: { luck: 4 }, price: 140, shop: 1, desc: '據說能帶來好運' },
  war_drum:    { name: '小戰鼓',   slot: 'charm', mods: { lead: 4 }, price: 170, shop: 1, desc: '敲一敲，士氣更旺' },
  amulet:      { name: '護身符',   slot: 'charm', mods: { grd: 4 }, price: 130, shop: 1, desc: '廟裡求來的平安符' },
  // 戰利品（敵人掉落）
  yellow_scarf:{ name: '黃巾',     slot: 'helm', mods: { def: 2, luck: 1 }, price: 0, desc: '黃巾賊的頭巾，洗乾淨還能戴' },
  rebel_blade: { name: '賊將大刀', slot: 'weapon', wtype: '刀', mods: { pow: 14 }, price: 0, desc: '程遠志用過的大刀' },
  river_charm: { name: '水澤符', slot: 'charm', mods: { grd: 5, luck: 2 }, price: 0, desc: '彭脫身上的護符，據說能避開水災' },
  iron_helm2:  { name: '紫纓盔',   slot: 'helm', mods: { def: 4, lead: 2 }, price: 0, desc: '趙弘戴過的紫纓鐵盔' },
  war_blade:   { name: '赤紋刀',   slot: 'weapon', wtype: '刀', mods: { pow: 22 }, price: 0, desc: '韓忠的佩刀，刀背刻著赤紋' },
  bronze_armor: { name: '青銅甲', slot: 'armor', mods: { def: 9 }, price: 0, desc: '卜巳穿在身上的青銅重甲，很重，但很硬' },
  renkong_sash: { name: '人公黃巾', slot: 'helm', mods: { lead: 4, int: 3, def: 3 }, price: 0, desc: '張梁頭上的黃巾，繡著「人公」二字' },
  dikong_fan:  { name: '地公羽扇', slot: 'weapon', wtype: '扇', mods: { pow: 28, int: 4 }, price: 0, desc: '張寶使過的妖術羽扇，扇骨裡嵌著細小的符紙' },
  taiping_book: { name: '太平要術', slot: 'charm', mods: { int: 8, lead: 4 }, price: 0, desc: '張角的太平道經書。寫的是符水與天下大勢，兩種都不太好懂' },
  huangtian_banner: { name: '黃天令旗', slot: 'charm', mods: { lead: 6, luck: 5, def: 4 }, price: 0, desc: '三兄弟並肩戰到最後留下的黃色令旗，旗面上寫著「蒼天已死」四個字，已經褪色' },
  duyou_seal:  { name: '督郵官印', slot: 'charm', mods: { int: 4, luck: 4 }, price: 0, desc: '督郵的銅印，上面刻著「督」字。拿著它去敲門，沒人敢不開（只有在劇情裡有效）' },
  swallow_blade: { name: '飛燕刀', slot: 'weapon', wtype: '刀', mods: { pow: 36, spd: 3 }, price: 0, desc: '張燕的佩刀，刀身輕薄，揮起來像燕子掠過水面' },
  // 專屬武器
  qinglong:    { name: '青龍偃月刀', slot: 'weapon', wtype: '刀', mods: { pow: 18, lead: 2 }, only: 'guanyu', price: 0, desc: '關羽專屬。刀光如青龍' },
  serpent:     { name: '丈八蛇矛', slot: 'weapon', wtype: '矛', mods: { pow: 18, grd: 2 }, only: 'zhangfei', price: 0, desc: '張飛專屬。一矛橫掃一片' },
  twin_swords: { name: '雙股劍',   slot: 'weapon', wtype: '劍', mods: { pow: 8, int: 3, lead: 3 }, only: 'liubei', price: 0, desc: '劉備專屬。一對長劍，劍穗隨風' }
};
// 敵人掉落：敵人 id → [裝備 id, 機率]
window.DATA.drops = {
  chengyuanzhi: ['rebel_blade', 1.0],
  bocai: ['scale', 1.0],
  pengtuo: ['river_charm', 1.0],
  zhaohong: ['iron_helm2', 1.0],
  hanzhong: ['war_blade', 1.0],
  busi: ['bronze_armor', 1.0],
  zhangbao: ['dikong_fan', 1.0], zhangbao_r: ['dikong_fan', 0.2], zhangjiao: ['taiping_book', 1.0], zhangjiao_r: ['taiping_book', 0.2],
  duyou: ['duyou_seal', 1.0], duyou_r: ['duyou_seal', 0.2], zhangyan: ['swallow_blade', 1.0], zhangyan_r: ['swallow_blade', 0.2],
  heishan_b: ['leather', 0.1], officer: ['leather', 0.1],
  zhangliang: ['renkong_sash', 1.0], zhangliang_r: ['renkong_sash', 0.2],
  veteran: ['leather', 0.12],
  bocai_r: ['scale', 0.25], pengtuo_r: ['river_charm', 0.2], zhaohong_r: ['iron_helm2', 0.2], hanzhong_r: ['war_blade', 0.2], busi_r: ['bronze_armor', 0.2], chengyuanzhi_r: ['rebel_blade', 0.2], qushuai_r: ['yellow_scarf', 0.3],
  elite: ['leather', 0.1],
  qushuai: ['yellow_scarf', 1.0],
  archer: ['headband', 0.08],
  captain: ['yellow_scarf', 0.12]
};
// 商店：蘇雙（涿縣）
window.DATA.shopNames = { suishuang: '蘇雙的貨攤', changshe: '長社軍需官' };
window.DATA.shops = {
  changshe: ['iron_sword', 'iron_blade', 'iron_lance', 'spear', 'feather_fan', 'bamboo_book', 'leather', 'scale', 'iron_helm', 'leather_boot', 'jade', 'war_drum', 'amulet'],
  suishuang: ['wood_sword', 'iron_sword', 'iron_blade', 'iron_lance', 'spear', 'feather_fan', 'cloth', 'leather', 'headband', 'iron_helm', 'straw_shoes', 'jade', 'amulet']
};
