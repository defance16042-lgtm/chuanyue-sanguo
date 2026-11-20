// 大地圖與洞穴用的資料：洞穴頭目、洞穴專屬裝備、對話
(function () {
  const D = window.DATA, B = D.battle, S = D.dialogue;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  // ---- 洞穴頭目（選擇性挑戰，比同地區的劇情頭目略弱）
  B.enemies.dengmao = { name: '鄧茂', terrain: T('B', 'B', 'A', 'C'), int: 18, lead: 16, luck: 8, title: '黃巾餘黨', cls: '賊將', weapon: '刀', desc: '潰敗後帶著殘部躲進遺洞的黃巾將領，守著一洞的搶來的家當。', hp: 2400, atk: 50, def: 24, spd: 11, exp: 220, gold: 260, sprite: 5, boss: true, ai: 'boss' };
  B.enemies.yudigen = { name: '于氐根', terrain: T('B', 'A', 'S', 'C'), int: 26, lead: 30, luck: 10, title: '黑山帥', cls: '賊帥', weapon: '槍', desc: '黑山諸帥之一，號「劈天」，力氣大得能單手拎起石磨。盜窟的規矩就是他的拳頭。', hp: 9000, atk: 96, def: 44, spd: 13, exp: 700, gold: 600, sprite: 19, boss: true, ai: 'boss' };
  B.enemies.tadun = { name: '蹋頓', terrain: T('A', 'B', 'B', 'C'), int: 22, lead: 36, luck: 9, title: '烏桓單于', cls: '單于', weapon: '矛', desc: '烏桓的大人，統領三郡烏桓騎兵。洞裡藏的是他歷年劫掠的戰利品。', hp: 15000, atk: 116, def: 54, spd: 17, exp: 1500, gold: 1000, sprite: 23, boss: true, ai: 'boss' };
  B.enemies.yuji = { name: '于吉', terrain: T('B', 'B', 'B', 'C'), int: 72, lead: 40, luck: 16, title: '太平道方士', cls: '方士', weapon: '扇', desc: '據說得了《太平清領書》真傳的方士，張角死後仍在洞裡畫符念咒，誰也說不準他是真仙還是裝神弄鬼。', hp: 12000, atk: 100, def: 50, spd: 14, exp: 1300, gold: 900, sprite: 8, boss: true, ai: 'boss' };
  B.groups.cave1boss = [['dengmao', 'veteran', 'veteran', 'archer']];
  B.groups.cave2boss = [['yudigen', 'heishan_b', 'heishan_b', 'heishan_a', 'heishan_a']];
  B.groups.cave3boss = [['tadun', 'wuhuan', 'wuhuan', 'wuhuan']];
  B.groups.cave4boss = [['yuji', 'elite', 'elite', 'archer', 'archer']];
  // ---- 專屬裝備
  const E = D.equipment;
  E.pilgrim_helm = { name: '遺洞鐵盔', slot: 'helm', mods: { def: 4, grd: 2 }, price: 0, desc: '黃巾遺洞寶箱裡的舊鐵盔，擦乾淨還挺亮。' };
  E.pilgrim_sword = { name: '遺洞古劍', slot: 'weapon', wtype: '劍', mods: { pow: 24, int: 2 }, price: 0, desc: '鄧茂守著的古劍，不知哪朝哪代的遺物。' };
  E.bandit_boots = { name: '賊王飛靴', slot: 'boots', mods: { spd: 5, def: 2 }, price: 0, desc: '盜窟裡搜來的好靴子，跑起來像背後有人追。' };
  E.bandit_spear = { name: '山賊長槍', slot: 'weapon', wtype: '槍', mods: { pow: 38, spd: -1 }, price: 0, desc: '槍桿被汗水磨得發亮的山賊長槍。' };
  E.dipi_spear = { name: '劈天槍', slot: 'weapon', wtype: '槍', mods: { pow: 46, grd: 2 }, price: 0, desc: '于氐根的愛槍，據說一槍能劈開山岩。' };
  E.wuhuan_cloak = { name: '烏桓皮裘', slot: 'armor', mods: { def: 14, spd: 1 }, price: 0, desc: '草原上的厚皮裘，擋風也擋刀。' };
  E.steppe_fan = { name: '草原神扇', slot: 'weapon', wtype: '扇', mods: { pow: 40, int: 6 }, price: 0, desc: '烏桓巫師用的羽扇，扇骨刻滿看不懂的符號。' };
  E.tadun_halberd = { name: '單于大戟', slot: 'weapon', wtype: '矛', mods: { pow: 50, lead: 3 }, price: 0, desc: '蹋頓的大戟，沉得像一塊鐵。' };
  E.sage_amulet = { name: '方士符籙', slot: 'charm', mods: { grd: 8, int: 6 }, price: 0, desc: '貼在身上心裡會踏實一點的符。有沒有效，各憑本心。' };
  E.taiping_sword = { name: '太平古劍', slot: 'weapon', wtype: '劍', mods: { pow: 50, int: 6 }, price: 0, desc: '劍身刻著「太平」二字，劍氣比字還重。' };
  E.yuji_robe = { name: '于吉道袍', slot: 'armor', mods: { def: 18, int: 5, grd: 3 }, price: 0, desc: '看起來普通，穿上卻有種被什麼護著的感覺。' };

  // ---- 洞穴守路頭目（每座洞穴一、二樓各一個，擋在通往樓梯的必經走廊）
  B.groups.cave1g1 = [['captain', 'veteran', 'veteran', 'archer']];
  B.groups.cave1g2 = [['captain', 'captain', 'veteran', 'elite', 'archer']];
  B.groups.cave2g1 = [['heishan_b', 'heishan_b', 'heishan_a', 'officer']];
  B.groups.cave2g2 = [['heishan_b', 'heishan_b', 'heishan_b', 'heishan_a', 'heishan_a', 'officer']];
  B.groups.cave3g1 = [['wuhuan', 'wuhuan', 'wuhuan', 'heishan_a']];
  B.groups.cave3g2 = [['wuhuan', 'wuhuan', 'wuhuan', 'wuhuan', 'heishan_b']];
  B.groups.cave4g1 = [['captain', 'elite', 'elite', 'archer', 'archer']];
  B.groups.cave4g2 = [['captain', 'captain', 'elite', 'elite', 'archer', 'archer']];
  const G = [
    ['cave1', '洞口守卒頭目', '站住！這裡是黃巾遺洞，閒人免進！', '遺洞監工', '想下去？先過了我這關。底下的東西，可不是你們能碰的。'],
    ['cave2', '盜窟哨長', '喂！什麼人敢闖黑山的地盤？', '盜窟總管', '想見我們大當家？先打贏我再說！'],
    ['cave3', '烏桓百夫長', '漢人，這裡是烏桓人的洞穴，止步！', '烏桓祭司長', '長生天的聖地，不許外人踏入。'],
    ['cave4', '黃天力士', '此乃太平祕窟，凡人止步。', '符籙護法', '想見于吉方士，先過我這關。']];
  G.forEach(function (g) {
    S[g[0] + '_g1'] = [{ speaker: g[1], text: g[2] }, { speaker: '張飛', text: '少囉嗦，打過再說！', act: { battle: g[0] + 'g1', flag: g[0] + '_g1_down', after: g[0] + '_g1_after' } }];
    S[g[0] + '_g1_after'] = [{ speaker: g[1], text: '……可惡，讓你們過去了。' }];
    S[g[0] + '_g2'] = [{ speaker: g[3], text: g[4] }, { speaker: '關羽', text: '得罪了。', act: { battle: g[0] + 'g2', flag: g[0] + '_g2_down', after: g[0] + '_g2_after' } }];
    S[g[0] + '_g2_after'] = [{ speaker: g[3], text: '……這條路，是你們的了。' }];
  });
  // ---- 洞穴裡的特別 NPC
  S.cave1_sp = [{ speaker: '被囚的鄉民', text: '你們是來救我的嗎？我被黃巾殘黨抓來挖洞，已經好幾個月沒見過太陽了。' }, { speaker: '被囚的鄉民', text: '洞底的頭領鄧茂其實也沒打算殺我，只是不讓我走。這點傷藥是我藏的，你們拿去。', act: { give: { herb: 3 }, once: 'cave1_sp_done' } }];
  S.cave1_sp_after = [{ speaker: '被囚的鄉民', text: '我會趁守衛不注意偷偷溜走的。你們小心，洞底那個鄧茂不好惹。' }];
  S.cave2_sp = [{ speaker: '落魄的軍師', text: '嘿，我本來是于氐根的軍師，現在被他趕到這個犄角旮旯。一句話，他不聽我的。' }, { speaker: '落魄的軍師', text: '這卷兵書我用不上了，兩百金讓給你。你們要是打贏了他，也算替我出口氣。', choices: [{ label: '買下 200金', act: { pay: 200, gear: ['bamboo_book'], once: 'cave2_sp_done' } }, { label: '不買了' }] }];
  S.cave2_sp_after = [{ speaker: '落魄的軍師', text: '買賣兩清，祝你們旗開得勝。記得，于氐根的拳頭很重。' }];
  S.cave3_sp = [{ speaker: '烏桓巫師', text: '漢人的客人，長生天指引你們來到這裡。' }, { speaker: '烏桓巫師', text: '我替你們祈福，洗去疲累。', act: { heal: true } }];
  S.cave4_sp = [{ speaker: '修道的童子', text: '師父說過，能答出他的謎題的人，才有資格往下走。' }, { speaker: '修道的童子', text: '有一種東西，越用越短，卻越燒越亮。是什麼？', choices: [{ label: '蠟燭', act: { give: { tonic: 4 }, once: 'cave4_sp_done' } }, { label: '刀' }, { label: '酒' }] }];
  S.cave4_sp_after = [{ speaker: '修道的童子', text: '答對了呢。師父今天心情不好，你們下去的時候小心。' }];
  E.turban_charm = { name: '黃巾遺符', slot: 'charm', mods: { grd: 5, luck: 4 }, price: 0, desc: '石門後密室裡的舊符，據說是黃巾軍的護身符，不知有沒有用。' };
  E.bandit_seal = { name: '盜王印', slot: 'charm', mods: { lead: 5, spd: 2 }, price: 0, desc: '黑山盜窟歷代大當家傳下來的印，拿著它，手下的人都會多聽你一句。' };
  E.wolf_tooth = { name: '狼牙墜', slot: 'charm', mods: { pow: 3, lead: 4 }, price: 0, desc: '烏桓人用狼牙做的墜子，戴著有股野性的底氣。' };
  E.taiji_jade = { name: '太極玉', slot: 'charm', mods: { int: 8, grd: 4 }, price: 0, desc: '一塊刻著陰陽魚的玉，握在手裡有點涼。' };
  D.drops.dengmao = ['pilgrim_sword', 1.0];
  D.drops.yudigen = ['dipi_spear', 1.0];
  D.drops.tadun = ['tadun_halberd', 1.0];
  D.drops.yuji = ['yuji_robe', 1.0];
  // ---- 讀檔補旗標：已經通過的城，在大地圖上也能進去（舊存檔）
  D.worldBackfill = { guangyang: 'boss_down', yingchuan: 'boss2_down', changshe: 'boss2_down', runan: 'bocai_down', wancheng: 'pengtuo_down', dongjun: 'hanzhong_down',
    jizhou: 'busi_down', guangzong: 'busi_down', xiaquyang: 'zuofeng_done', gzcity: 'zhangbao_down', anxi: 'sanzhang_down', heishan: 'duyou_down',
    youbei: 'zhangyan_down', pingyuan: 'zhangchun_down', suanzao: 'py_news', sishui: 'sz_meeting' };
  // ---- 對話
  S.world_unknown = [{ speaker: '', text: '城門緊閉，守軍說：「這座城你們還沒打過招呼吧？先照著大路走，到了再說。」' }];
  S.world_garrison = [{ speaker: '', text: '城頭插滿敵軍的旗幟，守軍嚴陣以待，城門緊閉。（劇情還沒走到這裡，先照著主線一步步打過去吧。）' }];
  S.cave1_boss = [
    { speaker: '鄧茂', text: '誰！……又是官兵？不對，你們不是。' },
    { speaker: '劉備', text: '我們只是路過，聽說這洞裡有黃巾的殘部。' },
    { speaker: '鄧茂', text: '黃巾已經散了，我只想守著這洞裡剩下的東西過日子。想拿走？先問我的刀！', act: { battle: 'cave1boss', flag: 'cave1_down', after: 'cave1_after' } }
  ];
  S.cave1_after = [{ speaker: '鄧茂', text: '……輸了就是輸了。洞裡的東西你們拿去吧，我不想再打了。' }, { speaker: '', text: '獲得戰利品。' }];
  S.cave2_boss = [
    { speaker: '于氐根', text: '嘿，哪來的肥羊，敢闖我黑山盜窟的門？' },
    { speaker: '張飛', text: '大哥你看，他這嗓門比俺還大！' },
    { speaker: '于氐根', text: '留下買路財，不然讓你們見識見識「劈天」的拳頭！', act: { battle: 'cave2boss', flag: 'cave2_down', after: 'cave2_after' } }
  ];
  S.cave2_after = [{ speaker: '于氐根', text: '哎呦……好漢力氣不小。行，這洞裡的東西你們隨便拿，別說我是被打趴的啊！' }];
  S.cave3_boss = [
    { speaker: '蹋頓', text: '漢人？敢深入烏桓人的洞穴？' },
    { speaker: '關羽', text: '你們年年南下劫掠，今日有人來討個說法。' },
    { speaker: '蹋頓', text: '草原的規矩，誰的拳頭硬，戰利品就歸誰！', act: { battle: 'cave3boss', flag: 'cave3_down', after: 'cave3_after' } }
  ];
  S.cave3_after = [{ speaker: '蹋頓', text: '好……你們有本事。這些戰利品，今日歸你們。' }];
  S.cave4_boss = [
    { speaker: '于吉', text: '貧道算到今日有貴客上門，果然不差。' },
    { speaker: '諸葛貓妖', text: '你這句話對每個來的人都說過吧？' },
    { speaker: '于吉', text: '……被看穿了。那就只好請諸位賜教一場！', act: { battle: 'cave4boss', flag: 'cave4_down', after: 'cave4_after' } }
  ];
  S.cave4_after = [{ speaker: '于吉', text: '貧道輸得心服口服。洞裡的東西，請笑納。' }];
})();
