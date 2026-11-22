// 商店：武器店、防具店、雜貨店各自分開，每間都能買也能賣。越後面的城鎮賣越好的貨。最後才載入（在 supplies.js 之後）。
(function () {
  const D = window.DATA, E = D.equipment, S = D.dialogue;
  // ---- 新增可以買到的裝備（原本只有第一級）----
  const G2 = {
    steel_sword:  { name: '鋼劍',     slot: 'weapon', wtype: '劍', mods: { pow: 17 }, price: 320, desc: '百煉的鋼，劍刃會唱歌' },
    steel_blade:  { name: '鋼刀',     slot: 'weapon', wtype: '刀', mods: { pow: 17 }, price: 320, desc: '刃口薄而利，一刀見血' },
    steel_lance:  { name: '鋼矛',     slot: 'weapon', wtype: '矛', mods: { pow: 17, grd: 2 }, price: 340, desc: '矛桿用硬木，穩得很' },
    iron_spear:   { name: '精鐵長槍', slot: 'weapon', wtype: '槍', mods: { pow: 19, spd: -1 }, price: 360, desc: '重槍，一槍挑翻戰馬' },
    crane_fan:    { name: '鶴羽扇',   slot: 'weapon', wtype: '扇', mods: { int: 9 }, price: 340, desc: '鶴羽扇輕搖，思路清晰' },
    fine_sword:   { name: '百鍊寶劍', slot: 'weapon', wtype: '劍', mods: { pow: 27, int: 1 }, price: 760, desc: '名匠花了半年打的劍' },
    fine_blade:   { name: '百鍊寶刀', slot: 'weapon', wtype: '刀', mods: { pow: 27 }, price: 760, desc: '刀光如水，削鐵如泥' },
    fine_lance:   { name: '百鍊長矛', slot: 'weapon', wtype: '矛', mods: { pow: 27, grd: 2 }, price: 780, desc: '矛尖寒光，守攻兼備' },
    fine_spear:   { name: '百鍊鐵槍', slot: 'weapon', wtype: '槍', mods: { pow: 30, spd: -1 }, price: 800, desc: '沉甸甸的好槍' },
    sage_fan:     { name: '賢者羽扇', slot: 'weapon', wtype: '扇', mods: { int: 14, lead: 2 }, price: 800, desc: '據說是隱士留下的扇子' },
    chain_mail:   { name: '鎖子甲',   slot: 'armor', mods: { def: 9, spd: -1 }, price: 420, desc: '環環相扣，刀砍不透' },
    iron_armor:   { name: '鐵鎧',     slot: 'armor', mods: { def: 13, spd: -1 }, price: 820, desc: '整片鐵鎧，扎實但沉' },
    steel_helm:   { name: '鐵胄',     slot: 'helm', mods: { def: 4, grd: 2 }, price: 260, desc: '堅固的頭胄' },
    war_helm:     { name: '百戰盔',   slot: 'helm', mods: { def: 6, grd: 3, lead: 1 }, price: 620, desc: '凹痕滿身，每一道都是一場仗' },
    iron_boots:   { name: '鐵靴',     slot: 'boots', mods: { def: 3, spd: 1 }, price: 300, desc: '靴頭包鐵，踢人也痛' },
    march_boots:  { name: '行軍靴',   slot: 'boots', mods: { spd: 4, def: 2 }, price: 640, desc: '日行百里不磨腳' },
    lucky_jade:   { name: '吉玉',     slot: 'charm', mods: { luck: 7 }, price: 480, desc: '溫潤的玉，運氣會好一點' },
    war_banner:   { name: '小令旗',   slot: 'charm', mods: { lead: 7 }, price: 520, desc: '舉起來，兵就會跟上' },
    guard_charm:  { name: '平安鎖',   slot: 'charm', mods: { grd: 7 }, price: 460, desc: '長輩給的平安鎖' }
  };
  Object.keys(G2).forEach(function (k) { E[k] = G2[k]; });

  // ---- 貨品（依城鎮進度分級）----
  const W1 = ['wood_sword', 'iron_sword', 'iron_blade', 'iron_lance', 'spear', 'feather_fan', 'bamboo_book'];
  const W2 = ['iron_sword', 'iron_blade', 'iron_lance', 'spear', 'feather_fan', 'steel_sword', 'steel_blade', 'steel_lance', 'iron_spear', 'crane_fan'];
  const W3 = ['steel_sword', 'steel_blade', 'steel_lance', 'iron_spear', 'crane_fan', 'fine_sword', 'fine_blade', 'fine_lance', 'fine_spear', 'sage_fan'];
  const A1 = ['cloth', 'leather', 'headband', 'iron_helm', 'straw_shoes', 'leather_boot', 'jade', 'amulet'];
  const A2 = ['leather', 'scale', 'chain_mail', 'iron_helm', 'steel_helm', 'leather_boot', 'iron_boots', 'jade', 'war_drum', 'amulet', 'lucky_jade'];
  const A3 = ['chain_mail', 'iron_armor', 'steel_helm', 'war_helm', 'iron_boots', 'march_boots', 'lucky_jade', 'war_banner', 'guard_charm'];
  const GEN = { 1: 'medic1', 2: 'medic2', 3: 'medic3' };
  const TIER = { 1: [W1, A1], 2: [W2, A2], 3: [W3, A3] };

  D.shopKinds = D.shopKinds || {};
  function defShop(id, kind, name, stock) { D.shops[id] = stock; D.shopKinds[id] = kind; D.shopNames[id] = name; }
  ['medic1', 'medic2', 'medic3'].forEach(function (id) { D.shopKinds[id] = 'general'; });
  D.shopNames.medic1 = '雜貨店'; D.shopNames.medic2 = '雜貨店'; D.shopNames.medic3 = '雜貨店';
  D.shops.medic1 = ['herb', 'tonic', 'smoke'];
  D.shops.medic2 = ['herb', 'herb2', 'tonic', 'tonic2', 'revive', 'smoke'];

  // 一間店 = 店名 + 掌櫃 + 開場白
  const SAY = {
    weapon: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，刀槍劍戟都有。買賣都行，你的舊兵器我也收，只是只給一半價。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    armor: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，甲、盔、靴、飾品都有。穿得好，才活得久。舊的你要賣，我也收。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; },
    general: function (who, shop) { return [{ speaker: who, text: '這裡是' + shop + '，藥品和雜貨都有。多備幾包藥，保命用。', choices: [{ label: '看看', act: { shop: '$' } }, { label: '不用了' }] }]; }
  };
  function sayFor(kind, who, shopName, shopId) {
    return SAY[kind](who, shopName).map(function (l) { return JSON.parse(JSON.stringify(l).replace('"$"', JSON.stringify(shopId))); });
  }
  // 讓某間屋子（或戶外 NPC）變成一間店。target: { map, house: true } 換掉屋裡的 NPC；{ map, npc: '名字' } 換掉戶外 NPC 的台詞
  function makeShop(mapId, kind, tier, shopName, keeper, sprite, outdoorNpc) {
    const id = mapId + '_' + kind, stock = kind === 'weapon' ? TIER[tier][0] : kind === 'armor' ? TIER[tier][1] : null;
    if (kind === 'general') { D.shops[id] = D.shops[GEN[tier]]; D.shopKinds[id] = 'general'; D.shopNames[id] = shopName; }
    else defShop(id, kind, shopName, stock);
    S['shop_' + id] = sayFor(kind, keeper, shopName, id);
    const m = D.maps[mapId]; if (!m) return;
    if (outdoorNpc) {
      const n = m.npcs.find(function (q) { return q.name === outdoorNpc; });
      if (n) {
        // 保留原本的閒聊台詞與「休息」選項，再接上商店選單
        const orig = S[n.dialogue] || [], flavor = orig.filter(function (l) { return !l.choices && !l.act; });
        const rest = [].concat.apply([], orig.map(function (l) { return (l.choices || []).filter(function (c) { return c.act && c.act.rest; }); }));
        const shopLines = S['shop_' + id], last = shopLines[shopLines.length - 1];
        if (rest.length) last.choices = [last.choices[0]].concat(rest, [last.choices[1]]);
        S['shop_' + id] = flavor.concat(shopLines);
        n.name = keeper; n.dialogue = 'shop_' + id; n.alts = []; if (sprite != null) n.sprite = sprite;
      }
      return;
    }
    m.name = shopName;
    m.npcs = [{ id: mapId + '_keeper', name: keeper, sprite: sprite, x: m.npcs[0] ? m.npcs[0].x : 3, y: m.npcs[0] ? m.npcs[0].y : 2, dir: 'down', dialogue: 'shop_' + id, alts: [] }];
  }
  // 戶外攤位（NPC 站在街上）：{ map, keeper, 原本的名字 }
  // ---- 涿縣：蘇雙的攤位＝武器店、民宅＝防具店、張世平的貨棧＝雜貨店 ----
  makeShop('zhuoxian', 'weapon', 1, '蘇雙的武器攤', '蘇雙', 15, '蘇雙');
  makeShop('home1', 'armor', 1, '成衣防具店', '裁縫', 7);
  makeShop('zhuoxian_h0', 'general', 1, '張世平的雜貨店', '夥計', 9);
  // ---- 長社 ----
  makeShop('changshe', 'weapon', 2, '長社武器攤', '軍需官', 10, '軍需官');
  makeShop('changshe_h3', 'armor', 2, '長社防具店', '甲冑匠', 8);
  makeShop('changshe', 'general', 2, '長社雜貨攤', '藥師', 10, '城裡的百姓');
  // ---- 宛城 ----
  makeShop('wancheng_h3', 'weapon', 2, '宛城武器店', '攻城工匠', 11);
  makeShop('wancheng', 'armor', 2, '宛城防具攤', '甲冑匠', 8, '攻城的士兵');
  makeShop('wancheng_h1', 'general', 2, '宛城雜貨店', '糧官', 9);
  // ---- 安喜 ----
  makeShop('anxi_h2', 'weapon', 2, '安喜武器店', '鐵匠', 11);
  makeShop('anxi_h1', 'armor', 2, '安喜防具店', '甲冑匠', 8);
  makeShop('anxi_h4', 'general', 2, '安喜雜貨店', '掌櫃', 4);
  // ---- 平原 ----
  makeShop('pingyuan_h2', 'weapon', 3, '平原武器店', '鐵匠', 11);
  makeShop('pingyuan_h1', 'armor', 3, '平原防具店', '甲冑匠', 8);
  makeShop('pingyuan_h4', 'general', 3, '平原雜貨店', '掌櫃', 4);
  // ---- 汜水關下 ----
  makeShop('sishui_h3', 'weapon', 3, '關下武器店', '鐵匠', 21);
  makeShop('sishui_h2', 'armor', 3, '關下防具店', '糧官', 9);
  makeShop('sishui_h1', 'general', 3, '關下雜貨店', '軍醫', 10);
  // ---- 酸棗 ----
  makeShop('suanzao_h1', 'weapon', 3, '袁軍武器庫', '軍需官', 9);
  makeShop('suanzao_h2', 'armor', 3, '補給營防具庫', '補給官', 9);
  makeShop('suanzao_h3', 'general', 3, '軍醫帳雜貨', '軍醫', 10);
  // ---- 孟津 ----
  makeShop('mengjin_h4', 'weapon', 3, '孟津武器店', '老闆', 8);
  makeShop('mengjin', 'armor', 3, '孟津防具攤', '行商', 9, '行商');
  makeShop('mengjin_h2', 'general', 3, '孟津雜貨鋪', '掌櫃', 4);
  // 舊的混合貨攤不再使用
  delete D.shops.suishuang; delete D.shops.changshe;
})();
