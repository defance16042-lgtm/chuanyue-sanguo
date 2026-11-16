// 地圖資料。tiles 每個字元對應 legend 的圖塊編號（assets/tiles.png 由左至右）。
// solid：不能走的圖塊編號。warps：踩上去換地圖。npcs 的 dialogue 對應 data/dialogue.js。
// 目前兩張地圖只是骨架測試用的臨時地圖，正式的涿縣之後再做。
window.DATA = window.DATA || {};
window.DATA.legend = { '.': 0, ',': 1, '~': 2, 'T': 3, '#': 4, '_': 5, 'R': 6, 'W': 7, 'D': 8,
  'F': 9, 'O': 10, 'X': 11, 'B': 12, 'f': 13, 'S': 14, 'N': 15, 't': 16, 'H': 17, 'b': 18 };
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
      { x: 15, y: 25, to: 'field', tx: 11, ty: 1, dir: 'down' },
      { x: 16, y: 25, to: 'field', tx: 12, ty: 1, dir: 'down' }
    ],
    npcs: [
      { id: 'villager1', name: '村民', sprite: 4, x: 13, y: 8, dir: 'down', dialogue: 'villager', alt: { flag: 'route', dialogue: 'villager_done' } },
      { id: 'liubei1', name: '劉備', sprite: 1, x: 18, y: 9, dir: 'left', dialogue: 'recruit_liubei', hideIf: 'recruited_liubei' },
      { id: 'guanyu1', name: '關羽', sprite: 2, x: 6, y: 15, dir: 'right', dialogue: 'recruit_guanyu', hideIf: 'recruited_guanyu' },
      { id: 'zhangfei1', name: '張飛', sprite: 3, x: 6, y: 19, dir: 'right', dialogue: 'recruit_zhangfei', hideIf: 'recruited_zhangfei' },
      { id: 'merchant', name: '商人', sprite: 4, x: 5, y: 13, dir: 'left', dialogue: 'merchant' },
      { id: 'vendor2', name: '攤販', sprite: 11, x: 12, y: 13, dir: 'left', dialogue: 'vendor' },
      { id: 'guardL', name: '衛兵', sprite: 9, x: 14, y: 22, dir: 'down', dialogue: 'guard' },
      { id: 'guardR', name: '衛兵', sprite: 9, x: 17, y: 22, dir: 'down', dialogue: 'guard' },
      { id: 'elder1', name: '老人', sprite: 6, x: 8, y: 10, dir: 'down', dialogue: 'elder' },
      { id: 'woman1', name: '婦人', sprite: 7, x: 19, y: 13, dir: 'left', dialogue: 'woman' },
      { id: 'child1', name: '孩童', sprite: 8, x: 21, y: 15, dir: 'down', dialogue: 'child' },
      { id: 'scholar1', name: '書生', sprite: 10, x: 24, y: 9, dir: 'down', dialogue: 'scholar' },
      { id: 'farmer1', name: '農夫', sprite: 11, x: 8, y: 19, dir: 'left', dialogue: 'farmer' }
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
      'T..........,,..........T',
      'T......TT..,,...~~.....T',
      'T..........,,...~~.....T',
      'T..........,,..........T',
      'T..TT......,,..........T',
      'T..........,,....TT....T',
      'T..........,,..........T',
      'T..........,,..........T',
      'T..........,,..~~......T',
      'T..........,,..~~..T...T',
      'T..........,,..........T',
      'T....TT....,,..........T',
      'T..........,,..........T',
      'T..........,,..........T',
      'T..........,,..........T',
      'T..........,,..........T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    start: { x: 11, y: 1, dir: 'down' },
    warps: [
      { x: 11, y: 0, to: 'zhuoxian', tx: 15, ty: 24, dir: 'up' },
      { x: 12, y: 0, to: 'zhuoxian', tx: 16, ty: 24, dir: 'up' }
    ],
    npcs: [
      { id: 'boss1', name: '程遠志', sprite: 5, x: 11, y: 18, dir: 'up', dialogue: 'boss_test', hideIf: 'boss_down' }
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
