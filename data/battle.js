// 戰鬥資料：經驗表、道具、計謀／技能、敵人、敵群。數值為初版，之後依試玩調整。
window.DATA = window.DATA || {};
window.DATA.battle = {
  // 等級沒有上限。升到第 n 級所需的累積經驗由 BattleLogic.expFor(n) 計算，越高級越多
  restPrice: 30,

  items: {
    herb:   { name: '傷藥',   desc: '回復兵力 60', price: 20, hp: 60 },
    tonic:  { name: '提神茶', desc: '回復戰術點 6', price: 30, tp: 6 },
    smoke:  { name: '煙霧彈', desc: '一定能逃離戰鬥', price: 40, escape: true }
  },

  // kind: phys 依武力、tact 依智力；target: one / all / ally / allAlly / self
  // 每個技能：tp 消耗、power 倍率、hits 連擊次數
  skills: {
    // 各角色專屬
    qinglong: { name: '青龍斬', tp: 3, kind: 'phys', target: 'one', power: 1.7 },
    roar:     { name: '怒喝',   tp: 2, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.75, turns: 3 },
    inspire:  { name: '鼓舞',   tp: 3, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.25, turns: 3 },
    mend:     { name: '撫慰',   tp: 3, kind: 'heal', target: 'ally', power: 2.4 },
    // 武力路線
    smash:    { name: '猛擊',   tp: 3, kind: 'phys', target: 'one', power: 1.6 },
    flurry:   { name: '連斬',   tp: 4, kind: 'phys', target: 'one', power: 0.8, hits: 2 },
    breach:   { name: '破陣',   tp: 6, kind: 'phys', target: 'all', power: 0.85 },
    // 智力路線
    fire:     { name: '火計',   tp: 5, kind: 'tact', target: 'all', power: 1.5 },
    discord:  { name: '離間',   tp: 3, kind: 'confuse', target: 'one', turns: 2 },
    rally:    { name: '激勵',   tp: 4, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.3, turns: 3 }
  },
  charSkills: {
    nyao: [],
    liubei: ['inspire', 'mend'],
    guanyu: ['qinglong'],
    zhangfei: ['roar']
  },
  // 選了路線之後才解鎖（只限諸葛貓妖）。每項為 [解鎖等級, 技能]
  routeSkills: {
    force: [[1, 'smash'], [3, 'flurry'], [5, 'breach']],
    wit:   [[1, 'discord'], [3, 'fire'], [5, 'rally']]
  },

  // atk 武力、int 智力；ai: 'plain'（普通攻擊）、'boss'（會用技能）
  enemies: {
    turban:   { name: '黃巾兵',   hp: 50,  atk: 12, def: 6,  spd: 7,  exp: 9,  gold: 8,  sprite: 0 },
    archer:   { name: '黃巾弓手', hp: 42,  atk: 14, def: 4,  spd: 10, exp: 10, gold: 10, sprite: 1 },
    bandit:   { name: '山賊',     hp: 64,  atk: 15, def: 8,  spd: 8,  exp: 13, gold: 14, sprite: 2 },
    captain:  { name: '黃巾小帥', hp: 90,  atk: 17, def: 9,  spd: 9,  exp: 20, gold: 22, sprite: 3 },
    chengyuanzhi: { name: '程遠志', hp: 1100, atk: 30, def: 14, spd: 10, exp: 80, gold: 120, sprite: 4, boss: true, ai: 'boss' },
    qushuai: { name: '黃巾渠帥', hp: 2600, atk: 52, def: 26, spd: 12, exp: 200, gold: 200, sprite: 5, boss: true, ai: 'boss' }
  },
  groups: {
    field1: [ ['turban', 'turban'], ['turban', 'archer'], ['archer', 'turban', 'turban'], ['bandit', 'turban'] ],
    field2: [ ['bandit', 'archer'], ['captain', 'turban'], ['bandit', 'turban', 'archer'], ['captain', 'archer', 'turban'] ],
    boss:   [ ['chengyuanzhi', 'captain', 'archer', 'archer'] ],
    boss2:  [ ['qushuai', 'captain', 'captain', 'archer'] ]
  },
  encounterRate: 0.07   // 每走一步遇敵機率（野外）
};
