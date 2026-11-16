// 地圖資料。tiles 每個字元對應 legend 的圖塊編號（assets/tiles.png 由左至右）。
// solid：不能走的圖塊編號。warps：踩上去換地圖。npcs 的 dialogue 對應 data/dialogue.js。
// 目前兩張地圖只是骨架測試用的臨時地圖，正式的涿縣之後再做。
window.DATA = window.DATA || {};
window.DATA.legend = { '.': 0, ',': 1, '~': 2, 'T': 3, '#': 4, '_': 5, 'R': 6, 'W': 7, 'D': 8 };
window.DATA.solidTiles = [2, 3, 4, 6, 7];
window.DATA.maps = {
  zhuoxian: {
    name: '涿縣（測試地圖）',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T..RRRRR.......RRRRR...T',
      'T..RRRRR.......RRRRR...T',
      'T..WWDWW.......WWDWW...T',
      'T..........,,..........T',
      'T..........,,..........T',
      'T,,,,,,,,,,,,,,,,,,,,,,T',
      'T..........,,..........T',
      'T..TT......,,....TT....T',
      'T..TT......,,....TT....T',
      'T..........,,..........T',
      'T~~~~......,,......~~~~T',
      'T~~~~......,,......~~~~T',
      'T..........,,..........T',
      'T..........,,..........T',
      'T..........,,..........T',
      'TTTTTTTTTTT,,TTTTTTTTTTT'
    ],
    start: { x: 11, y: 8, dir: 'down' },
    warps: [
      { x: 5, y: 4, to: 'inn', tx: 5, ty: 6, dir: 'up' },
      { x: 17, y: 4, to: 'inn', tx: 5, ty: 6, dir: 'up' },
      { x: 11, y: 17, to: 'field', tx: 11, ty: 1, dir: 'down' },
      { x: 12, y: 17, to: 'field', tx: 12, ty: 1, dir: 'down' }
    ],
    npcs: [
      { id: 'villager1', name: '村民', sprite: 4, x: 9, y: 6, dir: 'down', dialogue: 'villager', alt: { flag: 'route', dialogue: 'villager_done' } },
      { id: 'liubei1', name: '劉備', sprite: 1, x: 14, y: 8, dir: 'left', dialogue: 'recruit_liubei', hideIf: 'recruited_liubei' },
      { id: 'guanyu1', name: '關羽', sprite: 2, x: 6, y: 10, dir: 'right', dialogue: 'recruit_guanyu', hideIf: 'recruited_guanyu' },
      { id: 'zhangfei1', name: '張飛', sprite: 3, x: 6, y: 15, dir: 'right', dialogue: 'recruit_zhangfei', hideIf: 'recruited_zhangfei' },
      { id: 'merchant', name: '商人', sprite: 4, x: 14, y: 11, dir: 'left', dialogue: 'merchant' }
    ],
    objects: [
      { type: 'save', x: 14, y: 5 }
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
      { x: 11, y: 0, to: 'zhuoxian', tx: 11, ty: 16, dir: 'up' },
      { x: 12, y: 0, to: 'zhuoxian', tx: 12, ty: 16, dir: 'up' }
    ],
    npcs: [
      { id: 'boss1', name: '程遠志', sprite: 5, x: 11, y: 18, dir: 'up', dialogue: 'boss_test', hideIf: 'boss_down' }
    ],
    objects: []
  },
  inn: {
    name: '酒肆（測試地圖）',
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
  }
};
