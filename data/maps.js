// 地圖資料。tiles 每個字元對應 legend 的圖塊編號（assets/tiles.png 由左至右）。
// solid：不能走的圖塊編號。warps：踩上去換地圖。npcs 的 dialogue 對應 data/dialogue.js。
// 地圖資料（城鎮、房屋、洞穴、大地圖）。
window.DATA = window.DATA || {};
window.DATA.legend = { '.': 0, ',': 1, '~': 2, 'T': 3, '#': 4, '_': 5, 'R': 6, 'W': 7, 'D': 8,
  'F': 9, 'O': 10, 'X': 11, 'B': 12, 'f': 13, 'S': 14, 'N': 15, 't': 16, 'H': 17, 'b': 18,
  'Y': 19, 'M': 20, 'Z': 21, 'C': 22, 'V': 23, 'c': 24, 'w': 25, 'q': 26, 'k': 27, 'p': 28, 'l': 29, 'r': 30, 'g': 31, 'a': 32, 'i': 33, 'I': 34, 'm': 35, 'v': 36, 'e': 37, 'u': 38, 'j': 39, '>': 40, '<': 41, 'K': 42, 'G': 43, 'P': 44, 'Q': 45, 'A': 46, 'J': 47, 'L': 48, 'U': 49, 'E': 50, 'h': 51 };   // Y 森林、M 山、Z 海：都可以走過去
// 地形：圖塊編號 → 地形（沒列出的都是平地）。戰鬥會依踩著的地形改變背景與適性
window.DATA.terrainOf = { 19: 'forest', 20: 'mountain', 21: 'sea', 34: 'forest', 35: 'mountain', 47: 'mountain', 48: 'mountain', 51: 'mountain' };
window.DATA.terrainNames = { plain: '平地', forest: '森林', mountain: '山', sea: '海' };
window.DATA.solidTiles = [45, 46, 49, 50, 2, 3, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 25, 26, 27, 28, 29, 30, 37, 38, 39];
window.DATA.maps = {
  zhuoxian: {
    name: '涿縣',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..............................T',
      'T..RRRRR..RRRRR....ttttt..tttt.T',
      'T..RRRRR..RRRRR....ttttt..tttt.T',
      'T..WWDWW..WWDWW....WWDWW..WWWW.T',
      'Tb...,......,..,,....,.........T',
      'TT...,..bT..,..,,....,..b...bT.T',
      'T....,......,..,,....,.........T',
      'T.f..,......,..,,....,.........T',
      'T....,..f...,..,,....,.........T',
      'T....,......,.N,,....,.f.....T.T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,f,,,T',
      'TT.............,,N.............T',
      'T..SS..XB.SS...,,........f...b.T',
      'T.B.....X......,,.fOf...FF.FF..T',
      'T..............,,..f...........T',
      'T..........f...,,...........Hb.T',
      'T.FFF..FFF.....,,.....~~~~~.b..T',
      'T.F.....fF.....,,....~~~~~~~...T',
      'T.F.H....F.....,,.....~~~~~....T',
      'T.F....H.F..b..,,..............T',
      'T.Ff.....F..T..,,.............TT',
      'T.FFFFFFFF.....,,.......bT.....T',
      'T............f.,,.f..f......T..T',
      'T..............,,.........f....T',
      'TT,,TTTTTTTTTTT,,TTTTTTTTTTTTTTT'
    ],
    start: { x: 15, y: 9, dir: 'down' },
    warps: [
      { x: 2, y: 25, to: 'world', tx: 38, ty: 11, dir: 'down' },
      { x: 3, y: 25, to: 'world', tx: 38, ty: 11, dir: 'down' },
      { x: 5, y: 4, to: 'inn', tx: 5, ty: 6, dir: 'up' },
      { x: 12, y: 4, to: 'home1', tx: 4, ty: 5, dir: 'up' },
      { x: 21, y: 4, to: 'home2', tx: 4, ty: 5, dir: 'up' },
      { x: 15, y: 25, to: 'world', tx: 38, ty: 11, dir: 'down', need: 'oath_done', deny: 'gate_closed' },
      { x: 16, y: 25, to: 'world', tx: 38, ty: 11, dir: 'down', need: 'oath_done', deny: 'gate_closed' }
    ],
    npcs: [
      { id: 'villager1', name: '村民', sprite: 4, x: 13, y: 8, dir: 'down', dialogue: 'villager', alt: { flag: 'notice_read', dialogue: 'villager_after' } },
      { id: 'liubei1', name: '劉備', sprite: 1, x: 18, y: 9, dir: 'left', dialogue: 'liubei_early', alt: { flag: 'heard_merchant', dialogue: 'recruit_liubei' }, hideIf: 'recruited_liubei' },
      { id: 'zhangfei1', name: '張飛', sprite: 3, x: 6, y: 19, dir: 'right', dialogue: 'zhangfei_early', alt: { flag: 'recruited_liubei', dialogue: 'recruit_zhangfei' }, hideIf: 'recruited_zhangfei' },
      { id: 'guanyu1', name: '關羽', sprite: 2, x: 6, y: 15, dir: 'right', dialogue: 'guanyu_early', alt: { flag: 'recruited_zhangfei', dialogue: 'recruit_guanyu' }, hideIf: 'recruited_guanyu' },
      { id: 'merchant', name: '張世平', sprite: 14, x: 5, y: 13, dir: 'left', dialogue: 'zhangshiping', alt: { flag: 'heard_merchant', dialogue: 'merchant' } },
      { id: 'vendor2', name: '蘇雙', sprite: 15, x: 12, y: 13, dir: 'left', dialogue: 'suishuang' },
      { id: 'guardL', name: '衛兵', sprite: 9, x: 14, y: 22, dir: 'down', dialogue: 'guard' },
      { id: 'guardR', name: '衛兵', sprite: 9, x: 17, y: 22, dir: 'down', dialogue: 'guard' },
      { id: 'elder1', name: '老人', sprite: 6, x: 8, y: 10, dir: 'down', dialogue: 'elder' },
      { id: 'woman1', name: '婦人', sprite: 7, x: 19, y: 13, dir: 'left', dialogue: 'woman' },
      { id: 'child1', name: '孩童', sprite: 8, x: 21, y: 15, dir: 'down', dialogue: 'child' },
      { id: 'scholar1', name: '書生', sprite: 10, x: 24, y: 9, dir: 'down', dialogue: 'scholar' },
      { id: 'farmer1', name: '農夫', sprite: 11, x: 8, y: 19, dir: 'left', dialogue: 'farmer' }
    ],
    signs: [
      { x: 14, y: 10, dialogue: 'sign_notice' },
      { x: 17, y: 12, dialogue: 'sign_road' }
    ],
    events: [
      { once: 'intro_done', dialogue: 'intro' }
    ],
    objects: [
      { type: 'save', x: 17, y: 6 }
    ]
  },
  field: {
    name: '涿縣南郊',
    battleBg: 'grass',
    encounter: { group: 'field1', rate: 0.07, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTT,,TTTTTTTTTTT',
      'T..........,,..........T',
      'T...T......,,.......T..T',
      'T.YYYYY....,,..........T',
      'T.YYYYYTT..,,...~~.....T',
      'T.YYYYY....,,...~~.....T',
      'T.YYYYY....,,....MMMMM.T',
      'T..TT......,,....MMMMM.T',
      'T..........,,....TTMMM.T',
      'T......MMM.,,....MMMMM.T',
      'T......MMM.,,....MMMMM.T',
      'T..........,,..~~......T',
      'T..........,,..~~..T...T',
      'T..........,,..........T',
      'TZZZZTT....,,..YYYYYYY.T',
      'TZZZZ......,,..YYYYYYY.T',
      'TZZZZ......,,..YYYYYYY.T',
      'TZZZZ......,,..YYYYYYY.T',
      'TZZZZ......,,..........T',
      'TTTTTTTTTTT,,TTTTTTTTTTT'
    ],
    start: { x: 11, y: 1, dir: 'down' },
    warps: [
      { x: 11, y: 0, to: 'world', tx: 46, ty: 11, dir: 'down' },
      { x: 12, y: 0, to: 'world', tx: 46, ty: 11, dir: 'down' },
      { x: 11, y: 19, to: 'world', tx: 46, ty: 11, dir: 'down' },
      { x: 12, y: 19, to: 'world', tx: 46, ty: 11, dir: 'down' }
    ],
    npcs: [
      { id: 'zoujing', name: '鄒靖', sprite: 13, x: 13, y: 2, dir: 'left', dialogue: 'zoujing', alt: { flag: 'boss_down', dialogue: 'zoujing_after' } },
      { id: 'soldierA', name: '官兵', sprite: 9, x: 14, y: 3, dir: 'left', dialogue: 'soldier' },
      { id: 'soldierB', name: '官兵', sprite: 9, x: 9, y: 2, dir: 'right', dialogue: 'soldier' },
      { id: 'boss1', name: '程遠志', sprite: 5, x: 11, y: 18, dir: 'up', dialogue: 'boss_chengyuanzhi', hideIf: 'boss_down' }
    ],
    objects: []
  },
  guangyang: {
    name: '廣陽',
    battleBg: 'grass',
    encounter: { group: 'field2', rate: 0.08, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTT,,TTTTTTTTTTT',
      'T..........,,..........T',
      'T.....b....,,.....b....T',
      'T..RRRRR...,,...RRRRR..T',
      'T..RRRRR...,,...RRRRR..T',
      'T..WWWWW...,,...WWWWW..T',
      'T....f...X.,,.B....f...T',
      'Tb.........,,.........bT',
      'T..........,,..........T',
      'T..RRRR...f,,f...RRRR..T',
      'T..RRRR....,,....RRRR..T',
      'T..WWWW....,,....WWWW..T',
      'T........X.,,.B........T',
      'Tb.........,,.........bT',
      'T....b.FFFF,,FFFF.b....T',
      'T.X........,,.......X..T',
      'T..........,,..........T',
      'T...f...X..,,..B...f...T',
      'T..........,,..........T',
      'TT,,TTTTTTT,,TTTTTTTTTTT'
    ],
    start: { x: 11, y: 1, dir: 'down' },
    warps: [
      { x: 2, y: 19, to: 'world', tx: 54, ty: 13, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 54, ty: 13, dir: 'down' },
      { x: 11, y: 0, to: 'world', tx: 54, ty: 13, dir: 'down' },
      { x: 12, y: 0, to: 'world', tx: 54, ty: 13, dir: 'down' },
      { x: 11, y: 19, to: 'world', tx: 54, ty: 13, dir: 'down' },
      { x: 12, y: 19, to: 'world', tx: 54, ty: 13, dir: 'down' }
    ],
    npcs: [
      { id: 'boss2', name: '黃巾渠帥', sprite: 12, x: 11, y: 17, dir: 'up', dialogue: 'boss_qushuai', hideIf: 'boss2_down' },
      { id: 'refugee', name: '倖存的百姓', sprite: 7, x: 6, y: 7, dir: 'down', dialogue: 'refugee' }
    ],
    objects: []
  },
  yingchuan: {
    name: '潁川道',
    battleBg: 'grass',
    home: { map: 'guangyang' },
    encounter: { group: 'field3', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTT,,TTTTTTTTTTTTT',
      'T............,,............T',
      'T............,,............T',
      'T.YYYYYYYY...,,....MMMMMMMMT',
      'T.YYYYYYYY.f.,,....MMMMMMMMT',
      'T.YYYYYYYY..,,,.f..MMMMMMMMT',
      'T.YYYYYYYY...,,....MMMMMMMMT',
      'T.YYYYYYYY...,,....MMMMMMMMT',
      'T.YYYYYYYY...,,....MMMMMMMMT',
      'T.........f..,,............T',
      'T..TRRRRR...,,,.~~......b..T',
      'T...WWWWW....,,.~~...b.....T',
      'T...WWWWW....,,......T.T....',
      'T...WWDWW....,,............T',
      'T............,,....YYYYYYYYT',
      'T.MMMMMMM...,,,....YYYYYYYYT',
      'T.MMMMMMM..f.,,....YYYYYYYYT',
      'T.MMMMMMM....,,.f..YYYYYYYYT',
      'T.MMMMMMM....,,....YYYYYYYYT',
      'T.MMMMMMM....,,....YYYYYYYYT',
      'T.MMMMMMM.b.,,,....YYYYYYYYT',
      'T............,,..b.........T',
      'T..f.........,,............T',
      'TTTT,,TTTTTTT,,TTTTTTTTTTTTT'
    ],
    start: { x: 13, y: 1, dir: 'down' },
    events: [
      { once: 'yc_intro_done', dialogue: 'yc_intro' }
    ],
    signs: [
      { x: 15, y: 4, dialogue: 'yc_sign' }
    ],
    warps: [
      { x: 4, y: 23, to: 'world', tx: 40, ty: 63, dir: 'down' },
      { x: 5, y: 23, to: 'world', tx: 40, ty: 63, dir: 'down' },
      { x: 13, y: 0, to: 'world', tx: 40, ty: 63, dir: 'down' },
      { x: 14, y: 0, to: 'world', tx: 40, ty: 63, dir: 'down' },
      { x: 13, y: 23, to: 'world', tx: 40, ty: 63, dir: 'down' },
      { x: 14, y: 23, to: 'world', tx: 40, ty: 63, dir: 'down' },
      { x: 27, y: 12, to: 'world', tx: 40, ty: 63, dir: 'down' }
    ],
    npcs: [
      { id: 'kuibing', name: '朱儁軍潰兵', sprite: 9, x: 12, y: 7, dir: 'right', dialogue: 'yc_kuibing' },
      { id: 'ycelder', name: '逃難的老人', sprite: 6, x: 15, y: 12, dir: 'left', dialogue: 'yc_elder' },
      { id: 'ycwoman', name: '抱孩子的婦人', sprite: 7, x: 10, y: 14, dir: 'right', dialogue: 'yc_woman' },
      { id: 'ycfarmer', name: '躲在樹後的農夫', sprite: 11, x: 20, y: 10, dir: 'down', dialogue: 'yc_farmer' }
    ],
    objects: []
  },
  changshe: {
    name: '長社',
    battleBg: 'grass',
    home: { map: 'changshe' },
    tiles: [
      'TTTTTTTTTTT,,TTTTTTTTTTT',
      'T..........,,..........T',
      'T.RRRRRRRb.,,.fRRRRRRR.T',
      'T.RRRRRRR..,,..RRRRRRR.T',
      'T.RRRRRRR..,,..RRRRRRR.T',
      'T.WWWDWWW..,,..WWWDWWW.T',
      'T....,,,,,,,,.....,....T',
      'T..........,,.....,....T',
      'T.......f..,,..b..,....T',
      'T..,,,,,,,,,,,,,,,,,,..T',
      'T...,......,,......,...T',
      'T...,...b..,,..f...,...T',
      'T.RRRRR....,,....RRRRR.T',
      'T.RRRRR....,,....RRRRR.T',
      'T.WWDWW....,,....WWDWW.T',
      'T........f.,,.b........T',
      'T......HH..,,..HH......T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 11, y: 1, dir: 'down' },
    warps: [
      { x: 2, y: 17, to: 'world', tx: 60, ty: 68, dir: 'down' },
      { x: 3, y: 17, to: 'world', tx: 60, ty: 68, dir: 'down' },
      { x: 11, y: 0, to: 'world', tx: 60, ty: 68, dir: 'down' },
      { x: 12, y: 0, to: 'world', tx: 60, ty: 68, dir: 'down' }
    ],
    npcs: [
      { id: 'huangfu', name: '皇甫嵩', sprite: 16, x: 5, y: 6, dir: 'down', dialogue: 'hf_first', alt: { flag: 'guest_caocao', dialogue: 'hf_plan' }, hideIf: 'bocai_down' },
      { id: 'huangfu2', name: '皇甫嵩', sprite: 16, x: 5, y: 6, dir: 'down', dialogue: 'hf_after', showIf: 'bocai_down' },
      { id: 'caocao_npc', name: '曹操', sprite: 17, x: 12, y: 3, dir: 'down', dialogue: 'cc_first', showIf: 'huangfu_met', hideIf: 'guest_caocao' },
      { id: 'csguard1', name: '守城官兵', sprite: 9, x: 10, y: 2, dir: 'right', dialogue: 'cs_guard' },
      { id: 'csguard2', name: '守城官兵', sprite: 9, x: 13, y: 2, dir: 'left', dialogue: 'cs_guard' },
      { id: 'csguard3', name: '舉火把的士兵', sprite: 9, x: 16, y: 9, dir: 'left', dialogue: 'cs_torch' },
      { id: 'quarter', name: '軍需官', sprite: 10, x: 4, y: 11, dir: 'down', dialogue: 'cs_quarter' },
      { id: 'csvillager', name: '城裡的百姓', sprite: 7, x: 19, y: 11, dir: 'left', dialogue: 'cs_villager' },
      { id: 'cschild', name: '孩子', sprite: 8, x: 10, y: 12, dir: 'up', dialogue: 'cs_child' }
    ],
    objects: []
  },
  runan: {
    name: '汝南',
    battleBg: 'grass',
    home: { map: 'changshe' },
    encounter: { group: 'field4', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......YYYYYYYY........T',
      'T......YYYYYYYY....f...T',
      'T..b...YYYYYYYY........T',
      'T.......f..,,....b.....T',
      'T..........,,..........T',
      'T.~~~......,,......YYY.T',
      'T.~~~......,,......YYY.T',
      'T..........,,..........T',
      'T..YYYY....,,..........T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T..YYYY....,,..........T',
      'T..........,,....~~~...T',
      'T......f...,,....~~~...T',
      'T..........,,..........T',
      'T.YYYYYY...,,....f.....T',
      'T.YYYYYY...,,..........T',
      'T..........,,..........T',
      'T..........,,..........T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'rn_intro_done', dialogue: 'rn_intro' }
    ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 80, ty: 67, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 80, ty: 67, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 80, ty: 67, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 80, ty: 67, dir: 'down' }
    ],
    npcs: [
      { id: 'pengtuo', name: '彭脫', sprite: 12, x: 18, y: 10, dir: 'left', dialogue: 'boss_pengtuo', hideIf: 'pengtuo_down' },
      { id: 'rnfisher', name: '蹲在河邊的漁夫', sprite: 11, x: 4, y: 8, dir: 'down', dialogue: 'rn_fisher' },
      { id: 'rnscout', name: '朱儁軍斥候', sprite: 9, x: 9, y: 12, dir: 'right', dialogue: 'rn_scout' },
      { id: 'rnwoman', name: '背著米袋的婦人', sprite: 7, x: 14, y: 14, dir: 'left', dialogue: 'rn_woman' }
    ],
    objects: []
  },
  wancheng: {
    name: '宛城',
    battleBg: 'grass',
    home: { map: 'runan' },
    encounter: { group: 'field4', rate: 0.07, minSteps: 5 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..RRRRR......RRRRR....T',
      'T..RRRRR......RRRRR....T',
      'T..WWDWW......WWDWW....T',
      'T......,,,,,,,,,,,,....T',
      'T......,.........,.....T',
      'T..b...,....f....,..b..T',
      'T......,.........,.....T',
      'T......,.........,.....T',
      'T......,.........,.....T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......,.........,.....T',
      'T..RRRR,.........,.RRRRT',
      'T..RRRR,..~~.....,.RRRRT',
      'T..WDWW,..~~.....,.WWDWT',
      'T......,,,,,,,,,,,,....T',
      'T..f...........b.......T',
      'T......................T',
      'T..........f...........T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'wc_intro_done', dialogue: 'wc_intro' }
    ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 24, ty: 67, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 24, ty: 67, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 24, ty: 67, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 24, ty: 67, dir: 'down' }
    ],
    npcs: [
      { id: 'zhaohong', name: '趙弘', sprite: 12, x: 12, y: 5, dir: 'down', dialogue: 'boss_zhaohong', hideIf: 'zhaohong_down' },
      { id: 'hanzhong', name: '韓忠', sprite: 12, x: 12, y: 5, dir: 'down', dialogue: 'boss_hanzhong', showIf: 'zhaohong_down', hideIf: 'hanzhong_down' },
      { id: 'zhujun', name: '朱儁', sprite: 16, x: 5, y: 15, dir: 'right', dialogue: 'wc_zhujun' },
      { id: 'sunjian', name: '孫堅', sprite: 9, x: 6, y: 8, dir: 'right', dialogue: 'wc_sunjian' },
      { id: 'wcmedic', name: '軍醫', sprite: 10, x: 4, y: 16, dir: 'down', dialogue: 'wc_medic' },
      { id: 'wcsoldier', name: '攻城的士兵', sprite: 9, x: 8, y: 5, dir: 'up', dialogue: 'wc_soldier' }
    ],
    objects: []
  },
  dongjun: {
    name: '東郡・倉亭',
    battleBg: 'grass',
    home: { map: 'wancheng' },
    encounter: { group: 'field5', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..~~~~~~~~~~~~~~~~~~..T',
      'T..~~~~~~~~~~~~~~~~~~..T',
      'T......................T',
      'T..RRRRR......YYYY.....T',
      'T..RRRRR......YYYY.....T',
      'T..WWDWW...............T',
      'T.........f............T',
      'T..................b...T',
      'T......YYY.............T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......YYY.............T',
      'T......................T',
      'T...f.......~~~~.......T',
      'T...........~~~~...RRRRT',
      'T...........~~~~...WDWWT',
      'T......................T',
      'T..YYYYY...........f...T',
      'T..YYYYY...............T',
      'TTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'dj_intro_done', dialogue: 'dj_intro' }
    ],
    warps: [
      { x: 8, y: 19, to: 'world', tx: 84, ty: 53, dir: 'down' },
      { x: 9, y: 19, to: 'world', tx: 84, ty: 53, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 84, ty: 53, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 84, ty: 53, dir: 'down' }
    ],
    npcs: [
      { id: 'busi', name: '卜巳', sprite: 12, x: 18, y: 10, dir: 'left', dialogue: 'boss_busi', hideIf: 'busi_down' },
      { id: 'huangfu3', name: '皇甫嵩', sprite: 16, x: 8, y: 12, dir: 'right', dialogue: 'dj_huangfu', hideIf: 'busi_down' },
      { id: 'huangfu4', name: '皇甫嵩', sprite: 16, x: 8, y: 12, dir: 'right', dialogue: 'dj_end', showIf: 'busi_down' },
      { id: 'djsoldier', name: '運糧的民夫', sprite: 7, x: 5, y: 8, dir: 'down', dialogue: 'dj_porter' },
      { id: 'djscout', name: '探子', sprite: 9, x: 14, y: 7, dir: 'left', dialogue: 'dj_scout' }
    ],
    objects: []
  },
  jizhou: {
    name: '冀州路',
    battleBg: 'grass',
    home: { map: 'dongjun' },
    encounter: { group: 'field6', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.MMMM.........YYYY....T',
      'T.MMMM.........YYYY....T',
      'T.MMM..................T',
      'T......f...............T',
      'T..........,,..........T',
      'T..YYY.....,,....MMM...T',
      'T..YYY.....,,....MMM...T',
      'T..........,,..........T',
      'T..........,,..........T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T..........,,..........T',
      'T...f......,,....YYY...T',
      'T..........,,....YYY...T',
      'T..MM......,,..........T',
      'T..MM......,,.......f..T',
      'T..........,,..........T',
      'T..YYYYY...............T',
      'T..YYYYY...............T',
      'TTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'jz_intro_done', dialogue: 'jz_intro' }
    ],
    warps: [
      { x: 8, y: 19, to: 'world', tx: 52, ty: 27, dir: 'down' },
      { x: 9, y: 19, to: 'world', tx: 52, ty: 27, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 52, ty: 27, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 52, ty: 27, dir: 'down' }
    ],
    npcs: [
      { id: 'jzrefugee', name: '逃難的老人', sprite: 7, x: 6, y: 9, dir: 'right', dialogue: 'jz_refugee' },
      { id: 'jzscout', name: '盧植軍斥候', sprite: 9, x: 13, y: 12, dir: 'left', dialogue: 'jz_scout' }
    ],
    objects: []
  },
  guangzong: {
    name: '廣宗',
    battleBg: 'grass',
    home: { map: 'jizhou' },
    encounter: { group: 'field6', rate: 0.05, minSteps: 6 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..RRRRR......RRRRR....T',
      'T..RRRRR......RRRRR....T',
      'T..WWDWW......WWDWW....T',
      'T......................T',
      'T......f...............T',
      'T..................f...T',
      'T......................T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T.....f................T',
      'T..RRRR........RRRR....T',
      'T..RRRR........RRRR....T',
      'T..WDWW........WWDW....T',
      'T......................T',
      'T..YYYY................T',
      'T..YYYY................T',
      'TTTTTTT,,TTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'gz_intro_done', dialogue: 'gz_intro' }
    ],
    warps: [
      { x: 7, y: 19, to: 'world', tx: 64, ty: 36, dir: 'down' },
      { x: 8, y: 19, to: 'world', tx: 64, ty: 36, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 64, ty: 36, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 64, ty: 36, dir: 'down' }
    ],
    npcs: [
      { id: 'luzhi', name: '盧植', sprite: 19, x: 5, y: 6, dir: 'right', dialogue: 'gz_luzhi', hideIf: 'guest_luzhi' },
      { id: 'zhangliang', name: '張梁', sprite: 21, x: 17, y: 10, dir: 'left', dialogue: 'boss_zhangliang', showIf: 'guest_luzhi', hideIf: 'zhangliang_down' },
      { id: 'zuofeng', name: '左豐', sprite: 20, x: 7, y: 6, dir: 'left', dialogue: 'gz_zuofeng', showIf: 'zhangliang_down', hideIf: 'zuofeng_done' },
      { id: 'huangfu5', name: '皇甫嵩', sprite: 16, x: 9, y: 8, dir: 'down', dialogue: 'gz_huangfu', showIf: 'zuofeng_done' },
      { id: 'gzsoldier', name: '守營士兵', sprite: 9, x: 9, y: 12, dir: 'up', dialogue: 'gz_soldier' },
      { id: 'gzmedic', name: '軍醫', sprite: 10, x: 5, y: 16, dir: 'down', dialogue: 'gz_medic' }
    ],
    objects: []
  },
  xiaquyang: {
    name: '下曲陽',
    battleBg: 'grass',
    home: { map: 'guangzong' },
    encounter: { group: 'field6', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.MMMMMMMMMMMMMMMMMMM..T',
      'T.MMMMMMMMMMMMMMMMMMM..T',
      'T.MMM..............MM..T',
      'T.MMM....MMMM......MM..T',
      'T........MMMM..........T',
      'T..YYY.................T',
      'T..YYY.......f.........T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T..MM..............YYY.T',
      'T..MM..............YYY.T',
      'T......f...............T',
      'T..............MMMM....T',
      'T..YYYYY.......MMMM....T',
      'T..YYYYY...............T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'xq_intro_done', dialogue: 'xq_intro' }
    ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 32, ty: 37, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 32, ty: 37, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 32, ty: 37, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 32, ty: 37, dir: 'down' }
    ],
    npcs: [
      { id: 'zhangbao', name: '張寶', sprite: 22, x: 17, y: 10, dir: 'left', dialogue: 'boss_zhangbao', hideIf: 'zhangbao_down' },
      { id: 'xqscout', name: '皇甫嵩軍斥候', sprite: 9, x: 6, y: 12, dir: 'right', dialogue: 'xq_scout' },
      { id: 'xqmonk', name: '白衣的道人', sprite: 8, x: 12, y: 8, dir: 'down', dialogue: 'xq_monk' }
    ],
    objects: []
  },
  gzcity: {
    name: '廣宗城內',
    battleBg: 'grass',
    home: { map: 'xiaquyang' },
    encounter: { group: 'field6', rate: 0.05, minSteps: 6 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..RRRRR......RRRRR....T',
      'T..RRRRR......RRRRR....T',
      'T..WWDWW......WWDWW....T',
      'T......................T',
      'T..........f...........T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T..RRRR........RRRR....T',
      'T..RRRR........RRRR....T',
      'T..WDWW........WWDW....T',
      'T......................T',
      'T......................T',
      'T..f...........f.......T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'gc_intro_done', dialogue: 'gc_intro' }
    ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 48, ty: 40, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 48, ty: 40, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 48, ty: 40, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 48, ty: 40, dir: 'down' }
    ],
    npcs: [
      { id: 'zhangjiao', name: '張角', sprite: 23, x: 12, y: 5, dir: 'down', dialogue: 'boss_zhangjiao', hideIf: 'zhangjiao_down' },
      { id: 'gcdisciple', name: '黃巾信徒', sprite: 8, x: 7, y: 8, dir: 'right', dialogue: 'gc_disciple' },
      { id: 'gchuangfu', name: '皇甫嵩', sprite: 16, x: 8, y: 15, dir: 'right', dialogue: 'gc_huangfu' }
    ],
    objects: []
  },
  anxi: {
    name: '安喜縣',
    battleBg: 'grass',
    home: { map: 'anxi' },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......RRRRRRRRRR......T',
      'T......RRRRRRRRRR......T',
      'T......WWWWDDWWWW......T',
      'T......................T',
      'T...f..................T',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WDWW..........WWDW..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WWDW..........WDWW..T',
      'T......................T',
      'T...f..........~~~.....T',
      'T..............~~~.....T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'an_intro_done', dialogue: 'an_intro' }
    ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 30, ty: 23, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 30, ty: 23, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 30, ty: 23, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 30, ty: 23, dir: 'down' }
    ],
    npcs: [
      { id: 'jianyong', name: '簡雍', sprite: 27, x: 12, y: 6, dir: 'down', dialogue: 'an_jianyong', alt: { flag: 'duyou_down', dialogue: 'an_jianyong2' } },
      { id: 'duyou', name: '督郵', sprite: 25, x: 12, y: 4, dir: 'down', dialogue: 'boss_duyou', showIf: 'an_duyou_come', hideIf: 'duyou_down' },
      { id: 'anvillager', name: '縣民', sprite: 4, x: 6, y: 11, dir: 'right', dialogue: 'an_villager' },
      { id: 'anwoman', name: '提著菜籃的婦人', sprite: 7, x: 14, y: 15, dir: 'left', dialogue: 'an_woman' },
      { id: 'anelder', name: '縣裡的老人', sprite: 8, x: 8, y: 15, dir: 'up', dialogue: 'an_elder' },
      { id: 'anguard', name: '縣衙差役', sprite: 21, x: 9, y: 4, dir: 'down', dialogue: 'an_guard' }
    ],
    objects: []
  },
  heishan: {
    name: '太行山道',
    battleBg: 'grass',
    home: { map: 'anxi' },
    encounter: { group: 'field7', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.MMMMMMMMMMMMMMMMMMM..T',
      'T.MMMMMMMMMMMMMMMMMMM..T',
      'T.MMM..............MM..T',
      'T.MMM....MMMM......MM..T',
      'T........MMMM..........T',
      'T..YYY.................T',
      'T..YYY.......f.........T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T..MM..............YYY.T',
      'T..MM..............YYY.T',
      'T......f...............T',
      'T..............MMMM....T',
      'T..YYYYY.......MMMM....T',
      'T..YYYYY...............T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'hs_intro_done', dialogue: 'hs_intro' }
    ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 12, ty: 23, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 12, ty: 23, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 12, ty: 23, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 12, ty: 23, dir: 'down' }
    ],
    npcs: [
      { id: 'zhangyan', name: '張燕', sprite: 26, x: 17, y: 10, dir: 'left', dialogue: 'boss_zhangyan', hideIf: 'zhangyan_down' },
      { id: 'gongsunzan', name: '公孫瓚', sprite: 28, x: 6, y: 12, dir: 'right', dialogue: 'hs_gongsun', showIf: 'zhangyan_down' },
      { id: 'hsrefugee', name: '逃難的商人', sprite: 4, x: 8, y: 8, dir: 'right', dialogue: 'hs_merchant' },
      { id: 'hsscout', name: '公孫瓚軍斥候', sprite: 9, x: 12, y: 12, dir: 'left', dialogue: 'hs_scout' }
    ],
    objects: []
  },
  youbei: {
    name: '幽州北境',
    battleBg: 'grass',
    home: { map: 'heishan' },
    encounter: { group: 'field8', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T..MMM.......MMM.......T',
      'T..MMM.......MMM.......T',
      'T......................T',
      'T.........f............T',
      'T......................T',
      'T....YYY...............T',
      'T....YYY...............T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T......................T',
      'T..........f...........T',
      'T..MMMM................T',
      'T..MMMM.........YYY....T',
      'T...............YYY....T',
      'T......................T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'yb_intro_done', dialogue: 'yb_intro' } ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 70, ty: 7, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 70, ty: 7, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 70, ty: 7, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 70, ty: 7, dir: 'down' }
    ],
    npcs: [
      { id: 'zhangchun', name: '張純', sprite: 32, x: 17, y: 10, dir: 'left', dialogue: 'boss_zhangchun', hideIf: 'zhangchun_down' },
      { id: 'ybscout', name: '公孫瓚軍斥候', sprite: 9, x: 8, y: 12, dir: 'right', dialogue: 'yb_scout' },
      { id: 'ybshepherd', name: '牧羊人', sprite: 4, x: 11, y: 5, dir: 'down', dialogue: 'yb_shepherd' }
    ],
    objects: []
  },
  pingyuan: {
    name: '平原縣',
    battleBg: 'grass',
    home: { map: 'pingyuan' },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......RRRRRRRRRR......T',
      'T......RRRRRRRRRR......T',
      'T......WWWWDDWWWW......T',
      'T......................T',
      'T...f..................T',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WDWW..........WWDW..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WWDW..........WDWW..T',
      'T......................T',
      'T...f..........~~~.....T',
      'T..............~~~.....T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'py_intro_done', dialogue: 'py_intro' } ],
    warps: [
      { x: 2, y: 19, to: 'world', tx: 82, ty: 27, dir: 'down' },
      { x: 3, y: 19, to: 'world', tx: 82, ty: 27, dir: 'down' },
      { x: 0, y: 10, to: 'world', tx: 82, ty: 27, dir: 'down' },
      { x: 23, y: 10, to: 'world', tx: 82, ty: 27, dir: 'down' }
    ],
    npcs: [
      { id: 'pyjianyong', name: '簡雍', sprite: 27, x: 12, y: 6, dir: 'down', dialogue: 'py_jianyong' },
      { id: 'pymessenger', name: '傳令兵', sprite: 9, x: 12, y: 8, dir: 'up', dialogue: 'py_messenger', hideIf: 'py_news' },
      { id: 'pyvillager', name: '縣民', sprite: 4, x: 6, y: 11, dir: 'right', dialogue: 'py_villager' },
      { id: 'pyelder', name: '縣裡的老人', sprite: 8, x: 8, y: 15, dir: 'up', dialogue: 'py_elder' },
      { id: 'pymedic', name: '軍醫', sprite: 10, x: 14, y: 15, dir: 'down', dialogue: 'wc_medic' }
    ],
    objects: []
  },
  suanzao: {
    name: '酸棗・聯軍大營',
    battleBg: 'grass',
    home: { map: 'pingyuan' },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T...f..................T',
      'T......................T',
      'T..RRRRR..........RRRR.T',
      'T..RRRRR..........RRRR.T',
      'T..WWDWW..........WWDW.T',
      'T......................T',
      'T..........f...........T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WDWW..........WWDW..T',
      'T......................T',
      'T..YYY.............f...T',
      'T..YYY.................T',
      'TTTTTT,,TTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'sz_intro_done', dialogue: 'sz_intro' } ],
    warps: [
      { x: 6, y: 19, to: 'world2', tx: 62, ty: 39, dir: 'down' },
      { x: 7, y: 19, to: 'world2', tx: 62, ty: 39, dir: 'down' },
      { x: 0, y: 10, to: 'world2', tx: 62, ty: 39, dir: 'down' },
      { x: 23, y: 10, to: 'world2', tx: 62, ty: 39, dir: 'down' }
    ],
    npcs: [
      { id: 'yuanshao', name: '袁紹', sprite: 29, x: 12, y: 6, dir: 'down', dialogue: 'sz_yuanshao', alt: { flag: 'sz_meeting', dialogue: 'sz_yuanshao2' } },
      { id: 'caocao', name: '曹操', sprite: 17, x: 8, y: 8, dir: 'right', dialogue: 'sz_caocao', hideIf: 'sz_cc_joined' },
      { id: 'sunjian', name: '孫堅', sprite: 30, x: 16, y: 8, dir: 'left', dialogue: 'sz_sunjian' },
      { id: 'szgongsun', name: '公孫瓚', sprite: 28, x: 14, y: 12, dir: 'left', dialogue: 'sz_gongsun' },
      { id: 'szsoldier', name: '聯軍士兵', sprite: 9, x: 6, y: 16, dir: 'right', dialogue: 'sz_soldier' },
      { id: 'szmedic', name: '軍醫', sprite: 10, x: 18, y: 16, dir: 'left', dialogue: 'wc_medic' }
    ],
    objects: []
  },
  hulao: {
    name: '虎牢關',
    battleBg: 'grass',
    home: { map: 'sishui' },
    encounter: { group: 'field10', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.MMMMMMMMMMMMMMMMMMMM.T',
      'T.MMMMMM########MMMMMM.T',
      'T.MMMMMM#......#MMMMMM.T',
      'T.......#......#.......T',
      'T.......###..###.......T',
      'T......................T',
      'T....f.................T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T......................T',
      'T..YYY.............YYY.T',
      'T..YYY.............YYY.T',
      'T......................T',
      'T....f.................T',
      'T......................T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'hl_intro_done', dialogue: 'hl_intro' } ],
    warps: [
      { x: 2, y: 19, to: 'world2', tx: 26, ty: 33, dir: 'down' },
      { x: 3, y: 19, to: 'world2', tx: 26, ty: 33, dir: 'down' },
      { x: 0, y: 10, to: 'world2', tx: 26, ty: 33, dir: 'down' },
      { x: 23, y: 10, to: 'world2', tx: 26, ty: 33, dir: 'down' }
    ],
    npcs: [
      { id: 'lubu', name: '呂布', sprite: 33, x: 11, y: 3, dir: 'down', dialogue: 'boss_lubu', hideIf: 'lubu_down' },
      { id: 'hlsunjian', name: '孫堅', sprite: 30, x: 17, y: 8, dir: 'left', dialogue: 'hl_sunjian' },
      { id: 'hlgongsun', name: '公孫瓚', sprite: 28, x: 6, y: 8, dir: 'right', dialogue: 'hl_gongsun' },
      { id: 'hlscout', name: '聯軍斥候', sprite: 9, x: 9, y: 12, dir: 'up', dialogue: 'hl_scout' }
    ],
    objects: []
  },
  luoyang: {
    name: '洛陽廢墟',
    battleBg: 'grass',
    home: { map: 'hulao' },
    encounter: { group: 'field10', rate: 0.07, minSteps: 5 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T.####..####..####..##.T',
      'T.#..X..X..#..#..X..#..T',
      'T.#.....X..#..#.....#..T',
      'T.####..####..####..##.T',
      'T......................T',
      'T.X........f.........X.T',
      'T......................T',
      'T..........XX..........T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T.....X................T',
      'T..TT............X..TT.T',
      'T..TT...............TT.T',
      'T......................T',
      'T.X..............X.....T',
      'T......................T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'ly_intro_done', dialogue: 'ly_intro' } ],
    warps: [
      { x: 2, y: 19, to: 'world2', tx: 10, ty: 27, dir: 'down' },
      { x: 3, y: 19, to: 'world2', tx: 10, ty: 27, dir: 'down' },
      { x: 0, y: 10, to: 'world2', tx: 10, ty: 27, dir: 'down' },
      { x: 23, y: 10, to: 'world2', tx: 10, ty: 27, dir: 'down' }
    ],
    npcs: [
      { id: 'lysunjian', name: '孫堅', sprite: 30, x: 8, y: 12, dir: 'down', dialogue: 'ly_sunjian' },
      { id: 'lycaocao', name: '曹操', sprite: 17, x: 15, y: 9, dir: 'down', dialogue: 'ly_caocao', hideIf: 'xurong_down' },
      { id: 'xurong', name: '徐榮', sprite: 34, x: 21, y: 10, dir: 'left', dialogue: 'boss_xurong', hideIf: 'xurong_down', showIf: 'ly_caocao_go' },
      { id: 'lyrefugee', name: '難民', sprite: 7, x: 4, y: 8, dir: 'right', dialogue: 'ly_refugee' },
      { id: 'lyold', name: '老宮人', sprite: 6, x: 18, y: 14, dir: 'up', dialogue: 'ly_old' }
    ],
    objects: []
  },
  mengjin: {
    name: '孟津渡',
    battleBg: 'grass',
    home: { map: 'mengjin' },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......RRRRRRRRRR......T',
      'T......RRRRRRRRRR......T',
      'T......WWWWDDWWWW......T',
      'T......................T',
      'T...f..................T',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WDWW..........WWDW..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T..RRRR..........RRRR..T',
      'T..RRRR..........RRRR..T',
      'T..WWDW..........WDWW..T',
      'T......................T',
      'T...f..........~~~.....T',
      'T..............~~~.....T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'mj_intro_done', dialogue: 'mj_intro' } ],
    warps: [
      { x: 2, y: 19, to: 'world2', tx: 36, ty: 13, dir: 'down' },
      { x: 3, y: 19, to: 'world2', tx: 36, ty: 13, dir: 'down' }
    ],
    npcs: [
      { id: 'mjelder', name: '渡口老人', sprite: 8, x: 12, y: 6, dir: 'down', dialogue: 'mj_elder' },
      { id: 'mjfisher', name: '漁夫', sprite: 4, x: 6, y: 11, dir: 'right', dialogue: 'mj_fisher' },
      { id: 'mjmerchant', name: '行商', sprite: 9, x: 16, y: 11, dir: 'left', dialogue: 'mj_merchant' },
      { id: 'mjchild', name: '孩童', sprite: 7, x: 9, y: 15, dir: 'up', dialogue: 'mj_child' },
      { id: 'mjmedic', name: '軍醫', sprite: 10, x: 14, y: 15, dir: 'down', dialogue: 'wc_medic' }
    ],
    objects: []
  },
  sishui: {
    name: '汜水關',
    battleBg: 'grass',
    home: { map: 'suanzao' },
    encounter: { group: 'field9', rate: 0.09, minSteps: 4 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.MMMMMMMMMMMMMMMMMMMM.T',
      'T.MMMMMMMMMMMMMMMMMMMM.T',
      'T......................T',
      'T.MMMM...........MMMM..T',
      'T.MMMM...........MMMM..T',
      'T......................T',
      'T..........f...........T',
      'T......................T',
      'T......................T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T......................T',
      'T..YYY.............YYY.T',
      'T..YYY.............YYY.T',
      'T......................T',
      'T....f.................T',
      'T......................T',
      'T......................T',
      'TT,,TTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [ { once: 'ss_intro_done', dialogue: 'ss_intro' } ],
    warps: [
      { x: 2, y: 19, to: 'world2', tx: 44, ty: 41, dir: 'down' },
      { x: 3, y: 19, to: 'world2', tx: 44, ty: 41, dir: 'down' },
      { x: 0, y: 10, to: 'world2', tx: 44, ty: 41, dir: 'down' },
      { x: 23, y: 10, to: 'world2', tx: 44, ty: 41, dir: 'down' }
    ],
    npcs: [
      { id: 'huaxiong', name: '華雄', sprite: 31, x: 17, y: 10, dir: 'left', dialogue: 'boss_huaxiong', hideIf: 'huaxiong_down' },
      { id: 'ssscout', name: '聯軍斥候', sprite: 9, x: 9, y: 8, dir: 'down', dialogue: 'ss_scout' }
    ],
    objects: []
  },
  inn: {
    name: '酒肆',
    tiles: [
      '############',
      '#__________#',
      '#__________#',
      '#__________#',
      '#__________#',
      '#__________#',
      '#__________#',
      '#####D######'
    ],
    start: { x: 5, y: 6, dir: 'up' },
    warps: [
      { x: 5, y: 7, to: 'zhuoxian', tx: 5, ty: 5, dir: 'down' }
    ],
    events: [
      { need: ['recruited_guanyu'], once: 'oath_done', dialogue: 'oath' }
    ],
    npcs: [
      { id: 'keeper', name: '酒肆老闆', sprite: 4, x: 8, y: 2, dir: 'down', dialogue: 'keeper' }
    ],
    objects: []
  },
  home1: {
    name: '民宅',
    tiles: [
      '##########',
      '#________#',
      '#________#',
      '#________#',
      '#________#',
      '#________#',
      '####D#####'
    ],
    start: { x: 4, y: 5, dir: 'up' },
    warps: [ { x: 4, y: 6, to: 'zhuoxian', tx: 12, ty: 5, dir: 'down' } ],
    npcs: [
      { id: 'granny1', name: '老婦', sprite: 7, x: 3, y: 2, dir: 'down', dialogue: 'granny' },
      { id: 'child2', name: '孩童', sprite: 8, x: 6, y: 3, dir: 'left', dialogue: 'child_home' }
    ],
    objects: []
  },
  home2: {
    name: '民宅',
    tiles: [
      '##########',
      '#________#',
      '#________#',
      '#________#',
      '#________#',
      '#________#',
      '####D#####'
    ],
    start: { x: 4, y: 5, dir: 'up' },
    warps: [ { x: 4, y: 6, to: 'zhuoxian', tx: 21, ty: 5, dir: 'down' } ],
    npcs: [
      { id: 'teacher1', name: '教書先生', sprite: 10, x: 5, y: 2, dir: 'down', dialogue: 'teacher' }
    ],
    objects: []
  }
};
