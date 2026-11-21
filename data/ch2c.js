// 第二章（三）：虎牢關・三英戰呂布、洛陽焚毀・徐榮截擊
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  // ---- 敵人（數值比華雄再強一階；呂布是這一章最強的頭目）
  B.enemies.lubu = { name: '呂布', terrain: T('A', 'B', 'A', 'C'), int: 30, lead: 62, luck: 12, title: '飛將・并州刺史', cls: '無雙猛將', weapon: '矛', desc: '人中呂布，馬中赤兔。董卓的義子，號稱天下第一的猛將，手中方天畫戟無人能擋。', hp: 30000, atk: 140, def: 62, spd: 30, exp: 6000, gold: 4500, sprite: 26, boss: true, ai: 'boss' };
  B.enemies.xurong = { name: '徐榮', terrain: T('B', 'B', 'A', 'C'), int: 52, lead: 55, luck: 10, title: '董卓部將', cls: '伏兵將', weapon: '矛', desc: '董卓麾下善於用兵的老將，在滎陽設伏，專等追兵自投羅網。', hp: 33000, atk: 150, def: 70, spd: 18, exp: 4200, gold: 3000, sprite: 27, boss: true, ai: 'boss' };
  B.enemies.langqi = { name: '并州狼騎', terrain: T('A', 'B', 'B', 'C'), int: 12, lead: 14, luck: 6, title: '呂布親兵', cls: '騎兵', weapon: '矛', desc: '呂布從并州帶來的精騎，衝鋒起來像一群餓狼。', hp: 900, atk: 84, def: 38, spd: 20, exp: 90, gold: 110, sprite: 29 };
  B.groups.boss16 = [['lubu', 'langqi', 'langqi', 'langqi', 'xiliang']];
  B.groups.boss17 = [['xurong', 'xiliang', 'xiliang', 'langqi', 'langqi']];
  B.groups.field10 = [['langqi', 'xiliang', 'xiliang', 'heishan_a'], ['langqi', 'langqi', 'xiliang', 'xiliang'], ['langqi', 'langqi', 'langqi', 'xiliang', 'heishan_a'], ['langqi', 'langqi', 'xiliang', 'xiliang', 'wuhuan']];
  // 打倒之後在一般遇敵中也會（5%）出現的殘部：能力與原本頭目完全一樣
  B.rematch.lubu_down = 'lubu'; B.rematch.xurong_down = 'xurong';
  ['lubu', 'xurong'].forEach(function (id) { B.enemies[id + '_r'] = Object.assign({}, B.enemies[id], { rematchOf: id }); });
  // ---- 裝備
  E.fangtian_halberd = { name: '方天畫戟', slot: 'weapon', wtype: '矛', mods: { pow: 56, spd: 2 }, price: 0, desc: '呂布的成名兵器，月牙戟刃寒光逼人，天下僅此一柄。' };
  E.chitu_saddle = { name: '赤兔馬鞍', slot: 'boots', mods: { spd: 7, def: 3 }, price: 0, desc: '赤兔馬留下的鞍具，據說騎上去一日千里。' };
  E.xurong_armor = { name: '伏兵鐵甲', slot: 'armor', mods: { def: 20, spd: 1 }, price: 0, desc: '徐榮穿的青灰色鐵甲，特別適合藏在草叢裡。' };
  D.drops.lubu = ['fangtian_halberd', 1.0]; D.drops.lubu_r = ['fangtian_halberd', 0.2];
  D.drops.xurong = ['xurong_armor', 1.0]; D.drops.xurong_r = ['xurong_armor', 0.2];
  D.drops.langqi = ['chitu_saddle', 0.03];
  D.worldBackfill.hulao = 'huaxiong_down'; D.worldBackfill.luoyang = 'lubu_down';
  // ---- 對話
  S.hl_intro = [
    { speaker: '', text: '虎牢關。群山夾道，關城依險而建，比汜水關更加雄偉。' },
    { speaker: '', text: '董卓聽聞華雄陣亡，震怒之下親率大軍屯守虎牢關，並命義子呂布守關。', set: { hl_intro_done: true } },
    { speaker: '曹操', text: '呂布……天下皆知其勇。連華雄都擋不住雲長一刀，這回，只怕沒那麼容易了。' },
    { speaker: '劉備', text: '再難，也得過去。身後是十八路諸侯，更是天下百姓。' }
  ];
  S.hl_scout = [{ speaker: '聯軍斥候', text: '那位呂布，騎著赤兔馬，從關裡衝出來的時候，真像一團火。' }, { speaker: '聯軍斥候', text: '我們這邊已經有三員將領被他挑下馬了。……不，是四員。我數錯了。' }];
  S.hl_gongsun = [{ speaker: '公孫瓚', text: '那呂布……果然名不虛傳。我與他戰了數十回合，幾乎抵擋不住。' }, { speaker: '公孫瓚', text: '多虧玄德兄弟挺身而出。你們三位，萬萬小心。' }];
  S.hl_sunjian = [{ speaker: '孫堅', text: '我與董卓有不共戴天之仇。呂布若是擋在關前，我便先打斷他的腿！' }, { speaker: '孫堅', text: '……話是這麼說，但他那匹馬真快。你們先上，我在後頭掠陣。' }];
  S.boss_lubu = [
    { speaker: '呂布', text: '吾乃溫侯呂布！天下英雄，何人敢與我一戰？' },
    { speaker: '張飛', text: '三姓家奴休得猖狂！燕人張翼德在此！' },
    { speaker: '呂布', text: '……誰？我看起來像是會怕人的嗎？' },
    { speaker: '關羽', text: '三弟，不可大意！某來助你！' },
    { speaker: '劉備', text: '備亦來！今日，三兄弟合力，會一會天下第一！' },
    { speaker: '呂布', text: '好！一個也是打，三個也是打。來吧——讓你們見識見識何謂無雙！', act: { battle: 'boss16', flag: 'lubu_down', after: 'lubu_after' } }
  ];
  S.lubu_after = [
    { speaker: '', text: '三人圍著呂布，戰了五十回合不分勝負；劉備雙劍齊出，逼得呂布虛晃一戟，撥馬回頭。' },
    { speaker: '呂布', text: '哼……今日就先記下這筆帳！' },
    { speaker: '', text: '呂布退回關內，聯軍乘勢掩殺。關門洞開，虎牢關破。' },
    { speaker: '張飛', text: '大哥！二哥！痛快！俺這輩子沒打過這麼過癮的仗！' },
    { speaker: '關羽', text: '呂布之勇，名不虛傳。他日若再相遇，勝負難料。' },
    { speaker: '', text: '（獲得方天畫戟、金 4500。）', act: { gold: 4500 } },
    { speaker: '', text: '此時，董卓早已驚慌失措，下令遷都長安，並放火焚燒洛陽。……一場更大的災難，正在洛陽等著他們。' }
  ];
  S.ly_intro = [
    { speaker: '', text: '洛陽。這座曾經繁華的帝都，如今只剩焦黑的斷牆與冒煙的廢墟。' },
    { speaker: '', text: '董卓劫持天子與百姓遷往長安，臨走前放火焚城，二百里內，雞犬不留。', set: { ly_intro_done: true } },
    { speaker: '劉備', text: '……這是人做的事嗎？' },
    { speaker: '關羽', text: '此賊不除，天下永無寧日。' }
  ];
  S.ly_refugee = [{ speaker: '難民', text: '他們把我們趕出家門……說要遷都，路上走不動的，就地……唉。' }, { speaker: '難民', text: '我家的米缸還埋在後院，可是房子都燒光了，找不到了。' }];
  S.ly_old = [{ speaker: '老宮人', text: '老身在宮裡伺候了四十年。昨日還是九重宮闕，今日就只剩灰了。' }, { speaker: '老宮人', text: '孩子，你們若要追董卓，萬事小心，那賊人最會設伏。' }];
  S.ly_sunjian = [
    { speaker: '孫堅', text: '我帶人進城撲火，在宮中的一口井裡，撈出了一樣東西。' },
    { speaker: '孫堅', text: '……是傳國玉璽。此事你們知道就好，千萬別對旁人說，連袁本初也不行。' },
    { speaker: '張飛', text: '嗯？什麼玉璽？大哥，他說什麼？' },
    { speaker: '劉備', text: '三弟，什麼也沒聽到。' }
  ];
  S.ly_caocao = [
    { speaker: '曹操', text: '玄德，你來得正好。董卓挾天子西逃，正是追擊良機，可袁本初他們一個個按兵不動，說什麼「不可輕進」。' },
    { speaker: '曹操', text: '好！他們不去，我自己去！孟德今日便領兵追擊，你們……要不要同行？' },
    { speaker: '劉備', text: '孟德兄，備願與你同行。' },
    { speaker: '曹操', text: '好！走！', set: { ly_caocao_go: true } }
  ];
  S.boss_xurong = [
    { speaker: '徐榮', text: '哈哈哈！我家主公早就算準，你們這些人必定追來。這一路，我已經等了你們三天！' },
    { speaker: '曹操', text: '伏兵！……玄德，小心！' },
    { speaker: '徐榮', text: '來得好！洛陽之火，便是你們的葬身之火！', act: { battle: 'boss17', flag: 'xurong_down', after: 'xurong_after' } }
  ];
  S.xurong_after = [
    { speaker: '', text: '徐榮兵敗，帶著殘部退向西面。但曹操的兵馬在這場伏擊中折損慘重，他自己的肩頭也中了一箭。' },
    { speaker: '曹操', text: '……是我輕敵了。諸侯各懷異心，這場聯盟，怕是撐不了多久。' },
    { speaker: '曹操', text: '玄德，今日多謝你們相助。我要回去重新整頓兵馬，咱們後會有期。' },
    { speaker: '劉備', text: '孟德兄保重。', act: { leave: 'caocao' } },
    { speaker: '', text: '（獲得伏兵鐵甲、金 3000。）', act: { gold: 3000 } },
    { speaker: '', text: '【第二章　群雄逐鹿　完】' }
  ];
})();
