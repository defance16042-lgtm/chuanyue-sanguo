// 地圖資料。tiles 每個字元對應 legend 的圖塊編號（assets/tiles.png 由左至右）。
// solid：不能走的圖塊編號。warps：踩上去換地圖。npcs 的 dialogue 對應 data/dialogue.js。
// 目前兩張地圖只是骨架測試用的臨時地圖，正式的涿縣之後再做。
window.DATA = window.DATA || {};
window.DATA.legend = { '.': 0, ',': 1, '~': 2, 'T': 3, '#': 4, '_': 5, 'R': 6, 'W': 7, 'D': 8,
  'F': 9, 'O': 10, 'X': 11, 'B': 12, 'f': 13, 'S': 14, 'N': 15, 't': 16, 'H': 17, 'b': 18,
  'Y': 19, 'M': 20, 'Z': 21 };   // Y 森林、M 山、Z 海：都可以走過去
// 地形：圖塊編號 → 地形（沒列出的都是平地）。戰鬥會依踩著的地形改變背景與適性
window.DATA.terrainOf = { 19: 'forest', 20: 'mountain', 21: 'sea' };
window.DATA.terrainNames = { plain: '平地', forest: '森林', mountain: '山', sea: '海' };
window.DATA.solidTiles = [2, 3, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18];
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
      'TTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTT'
    ],
    start: { x: 15, y: 9, dir: 'down' },
    warps: [
      { x: 5, y: 4, to: 'inn', tx: 5, ty: 6, dir: 'up' },
      { x: 12, y: 4, to: 'home1', tx: 4, ty: 5, dir: 'up' },
      { x: 21, y: 4, to: 'home2', tx: 4, ty: 5, dir: 'up' },
      { x: 15, y: 25, to: 'field', tx: 11, ty: 1, dir: 'down', need: 'oath_done', deny: 'gate_closed' },
      { x: 16, y: 25, to: 'field', tx: 12, ty: 1, dir: 'down', need: 'oath_done', deny: 'gate_closed' }
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
    name: '野外（戰鬥測試地圖）',
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
      { x: 11, y: 0, to: 'zhuoxian', tx: 15, ty: 24, dir: 'up' },
      { x: 12, y: 0, to: 'zhuoxian', tx: 16, ty: 24, dir: 'up' },
      { x: 11, y: 19, to: 'guangyang', tx: 11, ty: 1, dir: 'down', need: 'boss_down', deny: 'path_blocked' },
      { x: 12, y: 19, to: 'guangyang', tx: 12, ty: 1, dir: 'down', need: 'boss_down', deny: 'path_blocked' }
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
      'TTTTTTTTTTT,,TTTTTTTTTTT'
    ],
    start: { x: 11, y: 1, dir: 'down' },
    warps: [
      { x: 11, y: 0, to: 'field', tx: 11, ty: 18, dir: 'up' },
      { x: 12, y: 0, to: 'field', tx: 12, ty: 18, dir: 'up' },
      { x: 11, y: 19, to: 'yingchuan', tx: 13, ty: 1, dir: 'down', need: 'boss2_down', deny: 'path_blocked2' },
      { x: 12, y: 19, to: 'yingchuan', tx: 14, ty: 1, dir: 'down', need: 'boss2_down', deny: 'path_blocked2' }
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
      'TTTTTTTTTTTTT,,TTTTTTTTTTTTT'
    ],
    start: { x: 13, y: 1, dir: 'down' },
    events: [
      { once: 'yc_intro_done', dialogue: 'yc_intro' }
    ],
    signs: [
      { x: 15, y: 4, dialogue: 'yc_sign' }
    ],
    warps: [
      { x: 13, y: 0, to: 'guangyang', tx: 11, ty: 18, dir: 'up' },
      { x: 14, y: 0, to: 'guangyang', tx: 12, ty: 18, dir: 'up' },
      { x: 13, y: 23, to: 'changshe', tx: 11, ty: 1, dir: 'down' },
      { x: 14, y: 23, to: 'changshe', tx: 12, ty: 1, dir: 'down' },
      { x: 27, y: 12, to: 'runan', tx: 1, ty: 10, dir: 'right', need: 'bocai_down', deny: 'path_blocked3' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 11, y: 1, dir: 'down' },
    warps: [
      { x: 11, y: 0, to: 'yingchuan', tx: 13, ty: 22, dir: 'up' },
      { x: 12, y: 0, to: 'yingchuan', tx: 14, ty: 22, dir: 'up' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'rn_intro_done', dialogue: 'rn_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'yingchuan', tx: 26, ty: 12, dir: 'left' },
      { x: 23, y: 10, to: 'wancheng', tx: 1, ty: 10, dir: 'right', need: 'pengtuo_down', deny: 'path_blocked4' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'wc_intro_done', dialogue: 'wc_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'runan', tx: 22, ty: 10, dir: 'left' },
      { x: 23, y: 10, to: 'dongjun', tx: 1, ty: 10, dir: 'right', need: 'hanzhong_down', deny: 'path_blocked5' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'dj_intro_done', dialogue: 'dj_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'wancheng', tx: 22, ty: 10, dir: 'left' },
      { x: 23, y: 10, to: 'jizhou', tx: 1, ty: 10, dir: 'right', need: 'busi_down', deny: 'path_blocked6' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'jz_intro_done', dialogue: 'jz_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'dongjun', tx: 22, ty: 10, dir: 'left' },
      { x: 23, y: 10, to: 'guangzong', tx: 1, ty: 10, dir: 'right' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'gz_intro_done', dialogue: 'gz_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'jizhou', tx: 22, ty: 10, dir: 'left' },
      { x: 23, y: 10, to: 'xiaquyang', tx: 1, ty: 10, dir: 'right', need: 'zuofeng_done', deny: 'path_blocked7' }
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
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'xq_intro_done', dialogue: 'xq_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'guangzong', tx: 22, ty: 10, dir: 'left' },
      { x: 23, y: 10, to: 'gzcity', tx: 1, ty: 10, dir: 'right', need: 'zhangbao_down', deny: 'path_blocked8' }
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
      ',,,,,,,,,,,,,,,,,,,,,,,T',
      'T......................T',
      'T..RRRR........RRRR....T',
      'T..RRRR........RRRR....T',
      'T..WDWW........WWDW....T',
      'T......................T',
      'T......................T',
      'T..f...........f.......T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 1, y: 10, dir: 'right' },
    events: [
      { once: 'gc_intro_done', dialogue: 'gc_intro' }
    ],
    warps: [
      { x: 0, y: 10, to: 'xiaquyang', tx: 22, ty: 10, dir: 'left' }
    ],
    npcs: [
      { id: 'zhangjiao', name: '張角', sprite: 23, x: 12, y: 5, dir: 'down', dialogue: 'boss_zhangjiao', hideIf: 'zhangjiao_down' },
      { id: 'gcdisciple', name: '黃巾信徒', sprite: 8, x: 7, y: 8, dir: 'right', dialogue: 'gc_disciple' },
      { id: 'gchuangfu', name: '皇甫嵩', sprite: 16, x: 8, y: 15, dir: 'right', dialogue: 'gc_huangfu' }
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
