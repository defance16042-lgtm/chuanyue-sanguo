// 第二章大地圖相關：渡口、關口、孟津、邙山古墓（cave5）
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  // ---- 關口守將（第一章大地圖西邊的關口）
  B.enemies.guanjiang = { name: '關口守將', terrain: T('B', 'B', 'A', 'C'), int: 30, lead: 40, luck: 8, title: '關口守將', cls: '守將', weapon: '矛', desc: '奉命把守關口的老將，沒有太守的文書，連一隻鳥都別想飛過去。', hp: 9000, atk: 96, def: 42, spd: 14, exp: 900, gold: 700, sprite: 12, boss: true, ai: 'boss' };
  B.groups.passguard = [['guanjiang', 'captain', 'captain', 'elite', 'archer']];
  // ---- 邙山古墓（第二章大地圖的洞穴）
  B.enemies.guosi = { name: '郭汜', terrain: T('B', 'B', 'A', 'C'), int: 34, lead: 42, luck: 10, title: '董卓部將', cls: '西涼將', weapon: '刀', desc: '董卓麾下的西涼將領，奉命來邙山刨漢家皇陵的陪葬品，充當遷都的軍費。', hp: 21000, atk: 132, def: 60, spd: 18, exp: 2600, gold: 2000, sprite: 28, boss: true, ai: 'boss' };
  B.groups.cave5boss = [['guosi', 'langqi', 'langqi', 'xiliang', 'xiliang']];
  B.groups.cave5g1 = [['xiliang', 'xiliang', 'langqi', 'captain']];
  B.groups.cave5g2 = [['langqi', 'langqi', 'xiliang', 'xiliang', 'captain']];
  E.hanling_helm = { name: '漢陵玉冠', slot: 'helm', mods: { def: 8, int: 3 }, price: 0, desc: '漢家皇陵陪葬的玉冠，戴上去連走路都端正了。' };
  E.hanling_sword = { name: '漢陵古劍', slot: 'weapon', wtype: '劍', mods: { pow: 54, int: 3 }, price: 0, desc: '從古墓裡出土的劍，劍身依然雪亮。' };
  E.hanling_fan = { name: '陵寢羽扇', slot: 'weapon', wtype: '扇', mods: { pow: 46, int: 8 }, price: 0, desc: '陪葬的羽扇，扇面上繡著已經褪色的雲紋。' };
  E.cicada_jade = { name: '漢玉蟬', slot: 'charm', mods: { grd: 6, int: 6, luck: 3 }, price: 0, desc: '含在逝者口中的玉蟬，據說能保人遇事不慌。' };
  E.guosi_blade = { name: '西涼彎刀', slot: 'weapon', wtype: '刀', mods: { pow: 60, spd: 1 }, price: 0, desc: '郭汜的佩刀，刀鋒帶著一股塞外的風沙味。' };
  D.drops.guosi = ['guosi_blade', 1.0];
  D.worldBackfill.mengjin = 'py_news';
  D.worldBackfill.suanzao = 'py_news';
  S.cave5_boss = [
    { speaker: '郭汜', text: '嘿，又來幾個不要命的？這裡頭的東西，董相國早就預訂了！' },
    { speaker: '劉備', text: '這是漢家先帝的陵寢！你們怎麼敢……' },
    { speaker: '郭汜', text: '死人要錢幹什麼？活人才要打仗！想勸我？先過我的刀！', act: { battle: 'cave5boss', flag: 'cave5_down', after: 'cave5_after' } }
  ];
  S.cave5_after = [{ speaker: '郭汜', text: '……算你們狠。可是遷都的軍費，不是我一個人的事，你們攔得住一個，攔不住整個西涼軍。' }];
  S.cave5_g1 = [{ speaker: '西涼百夫長', text: '站住！奉董相國之命搬東西，閒人不許靠近。' }, { speaker: '張飛', text: '搬東西？搬的是別人祖宗的東西吧！', act: { battle: 'cave5g1', flag: 'cave5_g1_down', after: 'cave5_g1_after' } }];
  S.cave5_g1_after = [{ speaker: '西涼百夫長', text: '……放行。' }];
  S.cave5_g2 = [{ speaker: '墓道校尉', text: '再往下就是主墓室了，過了我這關再說。' }, { speaker: '關羽', text: '得罪了。', act: { battle: 'cave5g2', flag: 'cave5_g2_down', after: 'cave5_g2_after' } }];
  S.cave5_g2_after = [{ speaker: '墓道校尉', text: '……你們走吧，後果自負。' }];
  S.cave5_sp = [{ speaker: '守墓老人', text: '老朽替漢家守了四十年的陵，沒想到先來的不是盜賊，是官軍。' }, { speaker: '守墓老人', text: '這點藥草是陵裡留下的，給你們帶著。拜託，別讓他們把先帝的陵拆光。', choices: [{ label: '收下藥草', act: { give: { herb: 4, tonic: 3 }, once: 'cave5_sp_done' } }, { label: '不用了' }] }];
  S.cave5_sp_after = [{ speaker: '守墓老人', text: '去吧，願漢家的列祖列宗保佑你們。' }];
  // ---- 渡口與關口
  S.boat_early = [{ speaker: '船夫', text: '黃巾還沒平，河上不太平，沒人敢出船啊。' }];
  S.boat_offer = [{ speaker: '船夫', text: '要過河？去關東的船，順著黃河走，一人 300 金（全隊一起算）。比走關口省事，也省得和守將打架。' },
    { speaker: '船夫', text: '怎麼樣，上不上船？', choices: [
      { label: '上船（300金）', act: { pay: 300, warp: { map: 'world2', x: 30, y: 8, dir: 'down' } } },
      { label: '再想想' }] }];
  S.boat_back = [{ speaker: '船夫', text: '要回河北？一趟 200 金。', choices: [
      { label: '搭船回去（200金）', act: { pay: 200, warp: { map: 'world', x: 85, y: 33, dir: 'left' } } },
      { label: '不用了' }] }];
  S.pass_guard_early = [{ speaker: '關尉', text: '黃巾亂事未平，朝廷有令，閒雜人等不得出關。回去吧！' }, { speaker: '諸葛貓妖', text: '（官軍的關尉……等天下的消息傳來，這道關的守將大概就要換人了，喵。）' }];
  S.pass_guard = [
    { speaker: '關口守將', text: '站住！關東諸侯會盟，過關的人都要查驗。沒有文書，休想通過！' },
    { speaker: '張飛', text: '文書？俺的丈八蛇矛就是文書！', act: { battle: 'passguard', flag: 'pass_open', after: 'pass_after' } }];
  S.pass_after = [{ speaker: '關口守將', text: '……好，你們過吧。算我這把老骨頭認栽。' }];
  S.pass_deny = [{ speaker: '', text: '關門緊閉，守將不肯放行。' }];
  // ---- 孟津
  S.mj_intro = [{ speaker: '', text: '孟津渡口。黃河在這裡寬得望不到對岸，船影點點，卻不見幾個客商。' }, { speaker: '諸葛貓妖', text: '渡口冷清，是因為洛陽那邊要打仗了吧……喵。' }];
  S.mj_elder = [{ speaker: '渡口老人', text: '武王伐紂就是在這裡會盟的。八百諸侯，如今只剩十八路，還各懷鬼胎。' }];
  S.mj_fisher = [{ speaker: '漁夫', text: '聽說董卓要燒洛陽？皇帝都被他架走了，我這種打魚的，只能看著河水發呆。' }];
  S.mj_merchant = [{ speaker: '行商', text: '洛陽的商人都往這邊逃，我是來賣便宜貨的。要不要看看？', act: { shop: 'changshe' } }];
  S.mj_child = [{ speaker: '孩童', text: '我長大要當船夫！一次能載好幾百人！' }];
})();
