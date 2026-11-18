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
    // choice:true ＝選完技能後可以再選「單體／全體」。單體威力高；全體每人威力較低（allPower），並多耗 TP（allTp）。
    // fx：施放特效（fire 火焰、bolt 奇謀閃電、heal 回復光、slash 斬擊、aura 光環、star 迷惑、shock 震懾）
    qinglong: { name: '青龍斬', tp: 3, kind: 'phys', target: 'one', power: 1.7, fx: 'slash' },
    roar:     { name: '怒喝',   tp: 2, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.75, turns: 3, fx: 'shock' },
    inspire:  { name: '鼓舞',   tp: 3, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.25, turns: 3, fx: 'aura' },
    mend:     { name: '撫慰',   tp: 3, allTp: 5, kind: 'heal', target: 'ally', choice: true, power: 2.4, allPower: 1.4, fx: 'heal' },
    strategy: { name: '亂世奇謀', tp: 4, allTp: 6, kind: 'tact', target: 'one', choice: true, power: 2.0, allPower: 1.3, fx: 'bolt' },
    // 武力路線
    smash:    { name: '猛擊',   tp: 3, kind: 'phys', target: 'one', power: 1.6, fx: 'slash' },
    flurry:   { name: '連斬',   tp: 4, kind: 'phys', target: 'one', power: 0.8, hits: 2, fx: 'slash' },
    breach:   { name: '破陣',   tp: 6, kind: 'phys', target: 'all', power: 0.85, fx: 'slash' },
    // 智力路線
    fire:     { name: '火計',   tp: 5, allTp: 7, kind: 'tact', target: 'one', choice: true, power: 2.5, allPower: 1.5, fx: 'fire' },
    discord:  { name: '離間',   tp: 3, kind: 'confuse', target: 'one', turns: 2, fx: 'star' },
    rally:    { name: '激勵',   tp: 4, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.3, turns: 3, fx: 'aura' }
  },
  charSkills: {
    nyao: [],
    liubei: ['inspire', 'mend'],
    guanyu: ['qinglong'],
    zhangfei: ['roar'],
    zoujing: ['roar'],
    caocao: ['strategy', 'inspire']
  },
  // 選了路線之後才解鎖（只限諸葛貓妖）。每項為 [解鎖等級, 技能]
  routeSkills: {
    force: [[1, 'smash'], [3, 'flurry'], [5, 'breach']],
    wit:   [[1, 'discord'], [3, 'fire'], [5, 'rally']]
  },

  // atk 武力、int 智力；ai: 'plain'（普通攻擊）、'boss'（會用技能）
  enemies: {
    turban:   { name: '黃巾兵', terrain: { plain: 'B', forest: 'B', mountain: 'B', sea: 'C' }, int: 6, lead: 0, luck: 3, title: '黃巾兵', cls: '步兵', weapon: '刀', desc: '頭纏黃巾的農民兵，人多勢眾，個體不強。',   hp: 50,  atk: 12, def: 6,  spd: 7,  exp: 9,  gold: 8,  sprite: 0 },
    archer:   { name: '黃巾弓手', terrain: { plain: 'B', forest: 'A', mountain: 'B', sea: 'C' }, int: 12, lead: 0, luck: 8, title: '黃巾弓手', cls: '弓兵', weapon: '弓', desc: '站得遠，速度快，但很脆弱。', hp: 42,  atk: 14, def: 4,  spd: 10, exp: 10, gold: 10, sprite: 1 },
    bandit:   { name: '山賊', terrain: { plain: 'C', forest: 'A', mountain: 'A', sea: 'C' }, int: 8, lead: 2, luck: 5, title: '山賊', cls: '賊兵', weapon: '斧', desc: '趁亂打劫的山賊，下手比黃巾兵狠。',     hp: 64,  atk: 15, def: 8,  spd: 8,  exp: 13, gold: 14, sprite: 2 },
    captain:  { name: '黃巾小帥', terrain: { plain: 'B', forest: 'B', mountain: 'B', sea: 'B' }, int: 10, lead: 8, luck: 5, title: '黃巾小帥', cls: '小隊長', weapon: '刀', desc: '統領十餘人的小頭目，兵力和防禦較高。', hp: 90,  atk: 17, def: 9,  spd: 9,  exp: 20, gold: 22, sprite: 3 },
    chengyuanzhi: { name: '程遠志', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' }, int: 16, lead: 15, luck: 8, title: '黃巾將領', cls: '將領', weapon: '刀', desc: '涿郡黃巾的首領，會全體衝鋒與重斬。', hp: 1100, atk: 30, def: 14, spd: 10, exp: 80, gold: 120, sprite: 4, boss: true, ai: 'boss' },
    elite:    { name: '黃巾精兵', terrain: { plain: 'B', forest: 'B', mountain: 'B', sea: 'C' }, int: 10, lead: 4, luck: 5, title: '黃巾精兵', cls: '精兵', weapon: '刀', desc: '波才麾下的老兵，穿著搶來的官軍皮甲，比雜兵難纏得多。', hp: 120, atk: 22, def: 12, spd: 10, exp: 30, gold: 30, sprite: 3 },
    bocai: { name: '波才', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' }, int: 40, lead: 30, luck: 10, title: '潁川黃巾大帥', cls: '大帥', weapon: '刀', desc: '潁川黃巾的大帥，數萬之眾的統領。曾擊敗朱儁並圍困皇甫嵩，兵多而營草，最怕火。', hp: 5000, atk: 71, def: 32, spd: 13, exp: 360, gold: 320, sprite: 6, boss: true, ai: 'boss' },
    qushuai: { name: '黃巾渠帥', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' }, int: 28, lead: 22, luck: 10, title: '黃巾渠帥', cls: '渠帥', weapon: '刀', desc: '廣陽黃巾的首領，兵力雄厚，會全體衝鋒與重斬。', hp: 2600, atk: 52, def: 26, spd: 12, exp: 200, gold: 200, sprite: 5, boss: true, ai: 'boss' }
  },
  groups: {
    field1: [ ['turban', 'turban'], ['turban', 'archer'], ['archer', 'turban', 'turban'], ['bandit', 'turban'] ],
    field2: [ ['bandit', 'archer'], ['captain', 'turban'], ['bandit', 'turban', 'archer'], ['captain', 'archer', 'turban'], ['bandit', 'captain', 'turban', 'archer', 'archer'] ],
    boss:   [ ['chengyuanzhi', 'captain', 'archer', 'archer'] ],
    field3: [ ['turban', 'elite', 'archer'], ['elite', 'elite', 'archer'], ['captain', 'elite', 'turban', 'archer'], ['elite', 'elite', 'archer', 'archer', 'bandit'], ['captain', 'captain', 'elite'] ],
    boss2:  [ ['qushuai', 'captain', 'captain', 'archer', 'archer'] ],
    boss3:  [ ['bocai', 'elite', 'elite', 'archer', 'archer'] ]
  },
  encounterRate: 0.07   // 每走一步遇敵機率（野外）
};
