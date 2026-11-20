// 大地圖與洞穴用的資料：洞穴頭目、洞穴專屬裝備、對話
(function () {
  const D = window.DATA, B = D.battle;
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
  D.drops.dengmao = ['pilgrim_sword', 1.0];
  D.drops.yudigen = ['dipi_spear', 1.0];
  D.drops.tadun = ['tadun_halberd', 1.0];
  D.drops.yuji = ['yuji_robe', 1.0];
  // ---- 讀檔補旗標：已經通過的城，在大地圖上也能進去（舊存檔）
  D.worldBackfill = { guangyang: 'boss_down', yingchuan: 'boss2_down', changshe: 'boss2_down', runan: 'bocai_down', wancheng: 'pengtuo_down', dongjun: 'hanzhong_down',
    jizhou: 'busi_down', guangzong: 'busi_down', xiaquyang: 'zuofeng_done', gzcity: 'zhangbao_down', anxi: 'sanzhang_down', heishan: 'duyou_down',
    youbei: 'zhangyan_down', pingyuan: 'zhangchun_down', suanzao: 'py_news', sishui: 'sz_meeting' };
  // ---- 對話
  const S = D.dialogue;
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
