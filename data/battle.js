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
    rally:    { name: '激勵',   tp: 4, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.3, turns: 3, fx: 'aura' },
    // ---- 隨等級進化的計謀（replaces：學會後取代較低階的同系計謀）----
    inspire2: { name: '仁德鼓舞', tp: 4, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.4, turns: 4, fx: 'aura', replaces: 'inspire' },
    mend2:    { name: '大撫慰',   tp: 4, allTp: 7, kind: 'heal', target: 'ally', choice: true, power: 3.4, allPower: 2.0, fx: 'heal', replaces: 'mend' },
    mend3:    { name: '仁者無敵', tp: 6, allTp: 10, kind: 'heal', target: 'ally', choice: true, power: 4.6, allPower: 2.8, fx: 'heal', replaces: 'mend2' },
    qinglong2: { name: '偃月斬',  tp: 5, kind: 'phys', target: 'one', power: 2.4, fx: 'slash', replaces: 'qinglong' },
    wusheng:  { name: '武聖一閃', tp: 8, kind: 'phys', target: 'one', power: 3.4, fx: 'slash' },
    roar2:    { name: '當陽怒吼', tp: 3, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.6, turns: 3, fx: 'shock', replaces: 'roar' },
    spearstorm: { name: '蛇矛亂舞', tp: 7, kind: 'phys', target: 'all', power: 1.2, fx: 'slash' },
    strategy2: { name: '亂世梟雄計', tp: 6, allTp: 9, kind: 'tact', target: 'one', choice: true, power: 2.9, allPower: 1.8, fx: 'bolt', replaces: 'strategy' },
    smash2:   { name: '重擊',     tp: 4, kind: 'phys', target: 'one', power: 2.3, fx: 'slash', replaces: 'smash' },
    flurry2:  { name: '三連斬',   tp: 6, kind: 'phys', target: 'one', power: 0.85, hits: 3, fx: 'slash', replaces: 'flurry' },
    breach2:  { name: '大破陣',   tp: 9, kind: 'phys', target: 'all', power: 1.25, fx: 'slash', replaces: 'breach' },
    discord2: { name: '連環離間', tp: 5, kind: 'confuse', target: 'all', turns: 2, fx: 'star', replaces: 'discord' },
    fire2:    { name: '烈火計',   tp: 7, allTp: 10, kind: 'tact', target: 'one', choice: true, power: 3.4, allPower: 2.0, fx: 'fire', replaces: 'fire' },
    fire3:    { name: '業火計',   tp: 10, allTp: 14, kind: 'tact', target: 'one', choice: true, power: 4.6, allPower: 2.7, fx: 'fire', replaces: 'fire2' },
    rally2:   { name: '全軍激勵', tp: 5, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.45, turns: 4, fx: 'aura', replaces: 'rally' }
  },
  // 角色技能：字串＝一開始就會；[等級, 技能]＝到該等級自動習得（有 replaces 的會取代較低階的同系技能）
  charSkills: {
    nyao: [],
    liubei: ['inspire', 'mend', [8, 'mend2'], [10, 'inspire2'], [16, 'mend3']],
    guanyu: ['qinglong', [8, 'qinglong2'], [14, 'wusheng']],
    zhangfei: ['roar', [8, 'roar2'], [12, 'spearstorm']],
    zoujing: ['roar'],
    caocao: ['strategy', 'inspire', [14, 'strategy2']],
    luzhi: ['rally', 'strategy', [8, 'fire'], [12, 'rally2']]
  },

  // 選了路線之後才解鎖（只限諸葛貓妖）。每項為 [解鎖等級, 技能]
  routeSkills: {
    force: [[1, 'smash'], [3, 'flurry'], [5, 'breach'], [8, 'smash2'], [12, 'flurry2'], [16, 'breach2']],
    wit:   [[1, 'discord'], [3, 'fire'], [5, 'rally'], [8, 'discord2'], [10, 'fire2'], [12, 'rally2'], [18, 'fire3']]
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
    qushuai: { name: '黃巾渠帥', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' }, int: 28, lead: 22, luck: 10, title: '黃巾渠帥', cls: '渠帥', weapon: '刀', desc: '廣陽黃巾的首領，兵力雄厚，會全體衝鋒與重斬。', hp: 2600, atk: 52, def: 26, spd: 12, exp: 200, gold: 200, sprite: 5, boss: true, ai: 'boss' },
    veteran: { name: '黃巾悍卒', terrain: { plain: 'B', forest: 'B', mountain: 'A', sea: 'C' }, int: 10, lead: 6, luck: 5, title: '黃巾悍卒', cls: '精兵', weapon: '刀', desc: '身經百戰的黃巾老卒，穿著鐵甲，打起來像一堵牆。', hp: 170, atk: 28, def: 16, spd: 10, exp: 40, gold: 40, sprite: 11 },
    zhangliang: { name: '張梁', terrain: { plain: 'A', forest: 'B', mountain: 'A', sea: 'C' }, int: 44, lead: 34, luck: 10, title: '人公將軍', cls: '大帥', weapon: '刀', desc: '張角的三弟，自稱人公將軍，守在廣宗城外。黃巾軍中最有章法的一股，不會輕易亂陣。', hp: 5300, atk: 88, def: 48, spd: 12, exp: 760, gold: 640, sprite: 13, boss: true, ai: 'boss' },
    zhangbao: { name: '張寶', terrain: { plain: 'B', forest: 'A', mountain: 'S', sea: 'B' }, int: 56, lead: 34, luck: 12, title: '地公將軍', cls: '大帥', weapon: '扇', desc: '張角的二弟，自稱地公將軍，據守下曲陽。精通妖術，在山地作戰特別強。', hp: 4100, atk: 82, def: 44, spd: 13, exp: 900, gold: 760, sprite: 14, boss: true, ai: 'boss' },
    zhangjiao: { name: '張角', terrain: { plain: 'A', forest: 'A', mountain: 'A', sea: 'B' }, int: 64, lead: 40, luck: 14, title: '天公將軍・大賢良師', cls: '教主', weapon: '扇', desc: '太平道的教主，自稱天公將軍。以符水治病聚集百萬信徒，黃巾之亂的起點。', hp: 5200, atk: 87, def: 46, spd: 12, exp: 1100, gold: 900, sprite: 15, boss: true, ai: 'boss' },
    busi: { name: '卜巳', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'B' }, int: 28, lead: 30, luck: 8, title: '東郡黃巾渠帥', cls: '渠帥', weapon: '刀', desc: '東郡黃巾的首領，駐紮在倉亭，人多勢眾、力氣很大，但不太會用腦。', hp: 10200, atk: 95, def: 44, spd: 12, exp: 620, gold: 520, sprite: 12, boss: true, ai: 'boss' },
    pengtuo: { name: '彭脫', terrain: { plain: 'A', forest: 'S', mountain: 'B', sea: 'C' }, int: 34, lead: 26, luck: 9, title: '汝南黃巾渠帥', cls: '渠帥', weapon: '刀', desc: '汝南黃巾的首領，熟悉山林水澤，在森林裡特別難纏。', hp: 6300, atk: 76, def: 35, spd: 13, exp: 440, gold: 380, sprite: 7, boss: true, ai: 'boss' },
    zhaohong: { name: '趙弘', terrain: { plain: 'B', forest: 'B', mountain: 'A', sea: 'C' }, int: 30, lead: 28, luck: 8, title: '宛城黃巾大帥', cls: '大帥', weapon: '槍', desc: '宛城黃巾的大帥，聚眾十餘萬，佔據宛城。', hp: 8000, atk: 86, def: 40, spd: 12, exp: 480, gold: 420, sprite: 8, boss: true, ai: 'boss' },
    hanzhong: { name: '韓忠', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' }, int: 36, lead: 30, luck: 9, title: '宛城黃巾新帥', cls: '大帥', weapon: '刀', desc: '趙弘戰死後接下宛城的大帥。守城很頑強，打不贏就會求降。', hp: 7100, atk: 82, def: 38, spd: 12, exp: 540, gold: 460, sprite: 9, boss: true, ai: 'boss' },
    sunxia: { name: '孫夏', terrain: { plain: 'B', forest: 'A', mountain: 'B', sea: 'C' }, int: 30, lead: 20, luck: 10, title: '黃巾渠帥', cls: '渠帥', weapon: '弓', desc: '韓忠的副手，在宛城一同死守。', hp: 2800, atk: 58, def: 24, spd: 15, exp: 300, gold: 240, sprite: 10, boss: true, ai: 'boss' }
  },
  groups: {
    field1: [ ['turban', 'turban'], ['turban', 'archer'], ['archer', 'turban', 'turban'], ['bandit', 'turban'] ],
    field2: [ ['bandit', 'archer'], ['captain', 'turban'], ['bandit', 'turban', 'archer'], ['captain', 'archer', 'turban'], ['bandit', 'captain', 'turban', 'archer', 'archer'] ],
    boss:   [ ['chengyuanzhi', 'captain', 'archer', 'archer'] ],
    field3: [ ['turban', 'elite', 'archer'], ['elite', 'elite', 'archer'], ['captain', 'elite', 'turban', 'archer'], ['elite', 'elite', 'archer', 'archer', 'bandit'], ['captain', 'captain', 'elite'] ],
    boss2:  [ ['qushuai', 'captain', 'captain', 'archer', 'archer'] ],
    boss3:  [ ['bocai', 'elite', 'elite', 'archer', 'archer'] ],
    field4: [ ['veteran', 'elite', 'archer'], ['veteran', 'veteran', 'archer'], ['captain', 'veteran', 'elite', 'archer'], ['veteran', 'veteran', 'elite', 'archer', 'bandit'], ['captain', 'captain', 'veteran'] ],
    field5: [ ['veteran', 'veteran', 'elite', 'archer'], ['veteran', 'captain', 'archer', 'archer'], ['elite', 'elite', 'veteran', 'bandit', 'archer'], ['captain', 'veteran', 'veteran', 'veteran'] ],
    field6: [ ['veteran', 'veteran', 'elite', 'archer'], ['captain', 'veteran', 'archer', 'archer'], ['elite', 'elite', 'veteran', 'veteran', 'archer'], ['captain', 'captain', 'veteran', 'elite'] ],
    boss8:  [ ['zhangliang', 'elite', 'elite', 'elite', 'elite', 'archer'] ],
    boss9:  [ ['zhangbao', 'elite', 'elite', 'elite', 'elite', 'archer'] ],
    boss10: [ ['zhangjiao', 'elite', 'elite', 'elite', 'archer', 'archer'] ],
    boss11: [ ['zhangjiao', 'zhangbao', 'zhangliang', 'elite', 'archer'] ],
    boss4:  [ ['pengtuo', 'veteran', 'veteran', 'archer', 'archer'] ],
    boss5:  [ ['zhaohong', 'veteran', 'veteran', 'elite', 'archer'] ],
    boss7:  [ ['busi', 'veteran', 'veteran', 'elite', 'elite', 'archer'] ],
    boss6:  [ ['hanzhong', 'sunxia', 'veteran', 'veteran', 'archer'] ]
  },
  encounterRate: 0.07   // 每走一步遇敵機率（野外）
};

// 「捲土重來」：打倒過的頭目，之後在野外遇敵時有機會帶著殘部再度出現（能力與原本完全相同）。
// rematch：旗標 → 敵人 id；rematchRate：每次遇敵時，有任一頭目被打倒的話，出現殘部的機率。
(function () {
  const B = window.DATA.battle;
  B.rematch = { boss_down: 'chengyuanzhi', boss2_down: 'qushuai', bocai_down: 'bocai', pengtuo_down: 'pengtuo', zhaohong_down: 'zhaohong', hanzhong_down: 'hanzhong', busi_down: 'busi', zhangliang_down: 'zhangliang', zhangbao_down: 'zhangbao', zhangjiao_down: 'zhangjiao' };
  B.rematchRate = 0.05;
  Object.keys(B.rematch).forEach(function (f) {
    const id = B.rematch[f], e = B.enemies[id];
    if (!e) return;
    const r = Object.assign({}, e, { rematchOf: id });   // 能力、經驗、金幣與原本的頭目完全相同
    B.enemies[id + '_r'] = r;
  });
})();
