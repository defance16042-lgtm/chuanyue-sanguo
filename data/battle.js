// 戰鬥資料：經驗表、道具、計謀／技能、敵人、敵群。
window.DATA = window.DATA || {};
window.DATA.battle = {
  // 等級沒有上限。升到第 n 級所需的累積經驗由 BattleLogic.expFor(n) 計算，越高級越多
  restPrice: 30,

  items: {
    herb:   { name: '傷藥',     desc: '回復兵力 60（少量）', price: 20, hp: 60 },
    herb2:  { name: '上等傷藥', desc: '回復兵力 200（中量）', price: 70, hp: 200 },
    herb3:  { name: '靈丹',     desc: '回復兵力 500（大量）', price: 200, hp: 500 },
    tonic:  { name: '提神茶',   desc: '回復戰術點 6（少量）', price: 30, tp: 6 },
    tonic2: { name: '養神湯',   desc: '回復戰術點 16（中量）', price: 90, tp: 16 },
    tonic3: { name: '玉露瓊漿', desc: '回復戰術點 36（大量）', price: 220, tp: 36 },
    revive: { name: '還魂丹',   desc: '讓倒下的同伴復活，回復一半兵力', price: 150, revive: 0.5 },
    revive2: { name: '九轉金丹', desc: '讓倒下的同伴復活，兵力全滿', price: 400, revive: 1 },
    smoke:  { name: '煙霧彈',   desc: '一定能逃離戰鬥', price: 40, escape: true }
  },

  // kind: phys 依武力、tact 依智力；target: one / all / ally / allAlly / self
  // 每個技能：tp 消耗、power 倍率、hits 連擊次數
  skills: {
    // 各角色專屬
    // choice:true ＝選完技能後可以再選「單體／全體」。單體威力高；全體每人威力較低（allPower），並多耗 TP（allTp）。
    // fx：施放特效（fire 火焰、bolt 奇謀閃電、heal 回復光、slash 斬擊、aura 光環、star 迷惑、shock 震懾）
    qinglong: { name: '青龍斬', tp: 3, kind: 'phys', target: 'one', power: 1.7, fx: 'dragon' },
    roar:     { name: '怒喝',   tp: 2, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.75, turns: 3, fx: 'roar' },
    inspire:  { name: '鼓舞',   tp: 3, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.25, turns: 3, fx: 'up_r' },
    mend:     { name: '撫慰',   tp: 3, allTp: 5, kind: 'heal', target: 'ally', choice: true, power: 2.4, allPower: 1.4, fx: 'heal' },
    strategy: { name: '亂世奇謀', tp: 4, allTp: 6, kind: 'tact', target: 'one', choice: true, power: 2.0, allPower: 1.3, fx: 'bolt' },
    // 武力路線
    smash:    { name: '猛擊',   tp: 3, kind: 'phys', target: 'one', power: 1.6, fx: 'slash' },
    flurry:   { name: '連斬',   tp: 4, kind: 'phys', target: 'one', power: 0.8, hits: 2, fx: 'flurry' },
    breach:   { name: '破陣',   tp: 6, kind: 'phys', target: 'all', power: 0.85, fx: 'cross' },
    // 智力路線
    fire:     { name: '火計',   tp: 5, allTp: 7, kind: 'tact', target: 'one', choice: true, power: 2.5, allPower: 1.5, fx: 'fire' },
    discord:  { name: '離間',   tp: 3, kind: 'confuse', target: 'one', turns: 2, fx: 'confuse' },
    rally:    { name: '激勵',   tp: 4, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.3, turns: 3, fx: 'up_b' },
    // ---- 隨等級進化的計謀（replaces：學會後取代較低階的同系計謀）----
    mend2:    { name: '大撫慰',   tp: 4, allTp: 7, kind: 'heal', target: 'ally', choice: true, power: 3.4, allPower: 2.0, fx: 'heal', replaces: 'mend' },
    mend3:    { name: '仁者無敵', tp: 6, allTp: 10, kind: 'heal', target: 'ally', choice: true, power: 4.6, allPower: 2.8, fx: 'heal', replaces: 'mend2' },
    qinglong2: { name: '偃月斬',  tp: 5, kind: 'phys', target: 'one', power: 2.4, fx: 'dragon', replaces: 'qinglong' },
    wusheng:  { name: '武聖一閃', tp: 8, kind: 'phys', target: 'one', power: 3.4, fx: 'dragon' },
    roar2:    { name: '當陽怒吼', tp: 3, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.6, turns: 3, fx: 'roar', replaces: 'roar' },
    spearstorm: { name: '蛇矛亂舞', tp: 7, kind: 'phys', target: 'all', power: 1.2, fx: 'multithrust' },
    strategy2: { name: '亂世梟雄計', tp: 6, allTp: 9, kind: 'tact', target: 'one', choice: true, power: 2.9, allPower: 1.8, fx: 'bolt', replaces: 'strategy' },
    smash2:   { name: '重擊',     tp: 4, kind: 'phys', target: 'one', power: 2.3, fx: 'slash', replaces: 'smash' },
    flurry2:  { name: '三連斬',   tp: 6, kind: 'phys', target: 'one', power: 0.85, hits: 3, fx: 'flurry', replaces: 'flurry' },
    breach2:  { name: '大破陣',   tp: 9, kind: 'phys', target: 'all', power: 1.25, fx: 'cross', replaces: 'breach' },
    discord2: { name: '連環離間', tp: 5, kind: 'confuse', target: 'all', turns: 2, fx: 'confuse', replaces: 'discord' },
    fire2:    { name: '烈火計',   tp: 7, allTp: 10, kind: 'tact', target: 'one', choice: true, power: 3.4, allPower: 2.0, fx: 'fire', replaces: 'fire' },
    fire3:    { name: '業火計',   tp: 10, allTp: 14, kind: 'tact', target: 'one', choice: true, power: 4.6, allPower: 2.7, fx: 'fire', replaces: 'fire2' },
    // ---- 復活與輔助（kind: revive 讓倒下的同伴站起來；tpgive 補給戰術點）----
    revive:   { name: '復活術',   tp: 8, kind: 'revive', target: 'deadAlly', pct: 0.35, fx: 'revive' },
    revive2:  { name: '起死回生', tp: 14, kind: 'revive', target: 'deadAlly', pct: 0.8, fx: 'revive', replaces: 'revive' },
    tpgive:   { name: '調息',     tp: 3, kind: 'tpgive', target: 'ally', power: 0.4, fx: 'orb' },
    // ---- 新增計謀 ----
    haste:    { name: '疾風令',   tp: 4, kind: 'buff', target: 'allAlly', stat: 'spd', mult: 1.5, turns: 3, fx: 'wind' },
    weaken:   { name: '破甲計',   tp: 4, kind: 'debuff', target: 'all', stat: 'def', mult: 0.7, turns: 3, fx: 'crack' },
    weaken2:  { name: '摧鋒破甲', tp: 6, kind: 'debuff', target: 'all', stat: 'def', mult: 0.5, turns: 4, fx: 'crack', replaces: 'weaken' },
    slowfoe:  { name: '絆馬索',   tp: 4, kind: 'debuff', target: 'all', stat: 'spd', mult: 0.6, turns: 3, fx: 'trap' },
    ambush:   { name: '伏兵',     tp: 7, kind: 'tact', target: 'all', power: 1.2, fx: 'arrowrain' },
    rockfall: { name: '落石計',   tp: 6, kind: 'tact', target: 'one', power: 3.0, fx: 'rock' },
    thunder:  { name: '天雷計',   tp: 9, allTp: 13, kind: 'tact', target: 'one', choice: true, power: 3.8, allPower: 2.2, fx: 'thunder' },
    empty:    { name: '空城計',   tp: 7, kind: 'confuse', target: 'all', turns: 3, fx: 'mist' },
    eight:    { name: '八陣圖',   tp: 7, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.6, turns: 4, fx: 'bagua' },
    whirl:    { name: '旋風斬',   tp: 5, kind: 'phys', target: 'all', power: 0.95, fx: 'whirl' },
    lunge:    { name: '突刺',     tp: 4, kind: 'phys', target: 'one', power: 2.1, fx: 'thrust' },
    // ---- 第二批新計謀：毒、持續回復、解除異狀、震暈、叫陣、吸血、斬將、水火連環 ----
    poison:   { name: '毒煙計',   tp: 5, kind: 'dot', target: 'all', pct: 0.05, turns: 3, chance: 0.6, fx: 'smoke' },
    poison2:  { name: '蝕骨毒霧', tp: 8, kind: 'dot', target: 'all', pct: 0.08, turns: 3, chance: 0.7, fx: 'smoke', replaces: 'poison' },
    cleanse:  { name: '清心訣',   tp: 4, kind: 'cleanse', target: 'ally', healPct: 0.15, fx: 'purify' },
    stun:     { name: '震懾',     tp: 5, kind: 'stun', target: 'one', turns: 1, fx: 'dizzy' },
    stun2:    { name: '雷霆一喝', tp: 8, kind: 'stun', target: 'all', turns: 1, fx: 'dizzy', replaces: 'stun' },
    taunt:    { name: '叫陣',     tp: 3, kind: 'taunt', target: 'self', turns: 2, stat: 'def', mult: 1.5, fx: 'banner' },
    leech:    { name: '飲血刀',   tp: 5, kind: 'phys', target: 'one', power: 1.9, leech: 0.5, fx: 'bloodslash' },
    execute:  { name: '斬將',     tp: 6, kind: 'phys', target: 'one', power: 1.8, lowBonus: 1.2, fx: 'execute' },
    rage:     { name: '狂怒',     tp: 6, kind: 'buff', target: 'self', stat: 'atk', mult: 1.7, turns: 3, extra: { stat: 'spd', mult: 1.3 }, fx: 'rage' },
    flood:    { name: '水淹七軍', tp: 9, kind: 'tact', target: 'all', power: 1.5, rider: { stat: 'spd', mult: 0.6, turns: 3 }, fx: 'water' },
    fireall:  { name: '火燒連營', fxLevel: 5, tp: 11, kind: 'tact', target: 'all', power: 2.1, rider: { stat: 'def', mult: 0.75, turns: 3 }, fx: 'fire' },
    // ---- 軍師專屬計謀：只有被指定為軍師的人才能使用 ----
    adv_nyao_a: { name: '貓步連環計', tp: 9, kind: 'tact', target: 'all', power: 1.7, fx: 'paw' },
    adv_nyao_b: { name: '喵之幻術',   tp: 6, kind: 'confuse', target: 'all', turns: 3, fx: 'confuse' },
    adv_nyao_c: { name: '九命貓息',   tp: 10, kind: 'revive', target: 'deadAlly', pct: 0.6, fx: 'revive' },
    adv_cao_a:  { name: '奸雄令',     tp: 6, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.5, turns: 4, fx: 'up_r' },
    adv_cao_b:  { name: '煮酒論英雄', tp: 5, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.55, turns: 3, fx: 'mist' },
    adv_cao_c:  { name: '魏武一擊',   tp: 9, kind: 'tact', target: 'one', power: 4.0, fx: 'thunder' },
    adv_lu_a:   { name: '圍壘之計',   tp: 6, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.8, turns: 4, fx: 'up_b' },
    adv_lu_b:   { name: '掘塹斷糧',   tp: 5, kind: 'debuff', target: 'all', stat: 'spd', mult: 0.5, turns: 4, fx: 'trap' },
    adv_lu_c:   { name: '長圍困獸',   tp: 8, kind: 'confuse', target: 'all', turns: 3, fx: 'cage' },
    adv_liu_a:  { name: '仁德之師',   tp: 7, kind: 'heal', target: 'allAlly', power: 2.2, fx: 'heal' },
    adv_liu_b:  { name: '三顧求賢',   tp: 8, kind: 'tpgive', target: 'allAlly', power: 0.35, fx: 'orb' },
    adv_liu_c:  { name: '桃園之誓',   tp: 8, kind: 'buff', target: 'allAlly', stat: 'atk', mult: 1.5, turns: 4, fx: 'bloom' },
    adv_guan_a: { name: '春秋大義',   tp: 6, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.5, turns: 4, fx: 'up_b' },
    adv_guan_b: { name: '威震華夏',   tp: 6, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.55, turns: 3, fx: 'roar' },
    adv_zhang_a: { name: '長坂斷喝',  tp: 5, kind: 'debuff', target: 'all', stat: 'spd', mult: 0.5, turns: 3, fx: 'roar' },
    adv_zhang_b: { name: '莽夫奇謀',  tp: 5, kind: 'tact', target: 'one', power: 2.6, fx: 'thunder' }
  },
  // 角色技能：字串＝一開始就會；[等級, 技能]＝到該等級自動習得（有 replaces 的會取代較低階的同系技能）
  charSkills: {
    nyao: [],
    liubei: ['inspire', 'mend', [8, 'mend2'], [12, 'tpgive'], [16, 'mend3'], [18, 'cleanse']],
    guanyu: ['qinglong', [8, 'qinglong2'], [10, 'whirl'], [12, 'execute'], [14, 'wusheng'], [18, 'taunt']],
    zhangfei: ['roar', [6, 'taunt'], [8, 'roar2'], [10, 'lunge'], [12, 'spearstorm'], [14, 'stun'], [18, 'rage'], [22, 'stun2']],
    zoujing: ['roar'],
    caocao: ['strategy', 'inspire', [8, 'weaken'], [10, 'ambush'], [14, 'strategy2'], [12, 'leech'], [16, 'revive'], [18, 'poison'], [20, 'weaken2'], [24, 'fireall']],
    luzhi: ['rally', 'strategy', [6, 'slowfoe'], [8, 'fire'], [10, 'revive'], [14, 'eight'], [16, 'cleanse'], [18, 'flood'], [20, 'revive2']]
  },
  // 軍師專屬計謀：被指定為軍師之後才能用。每項為 [解鎖等級, 技能]
  advisorSkills: {
    nyao: [[1, 'adv_nyao_a'], [6, 'adv_nyao_b'], [12, 'adv_nyao_c']],
    caocao: [[1, 'adv_cao_a'], [8, 'adv_cao_b'], [14, 'adv_cao_c']],
    luzhi: [[1, 'adv_lu_a'], [6, 'adv_lu_b'], [12, 'adv_lu_c']],
    liubei: [[1, 'adv_liu_a'], [10, 'adv_liu_b'], [16, 'adv_liu_c']],
    guanyu: [[1, 'adv_guan_a'], [10, 'adv_guan_b']],
    zhangfei: [[1, 'adv_zhang_a'], [10, 'adv_zhang_b']]
  },

  // 選了路線之後才解鎖（只限諸葛貓妖）。每項為 [解鎖等級, 技能]
  routeSkills: {
    force: [[1, 'smash'], [3, 'flurry'], [5, 'breach'], [7, 'haste'], [8, 'smash2'], [9, 'weaken'], [12, 'flurry2'], [16, 'breach2'], [11, 'taunt'], [14, 'execute'], [18, 'revive'], [20, 'whirl'], [22, 'leech'], [24, 'weaken2'], [26, 'rage'], [28, 'stun']],
    wit:   [[1, 'discord'], [3, 'fire'], [5, 'rally'], [6, 'rockfall'], [7, 'haste'], [8, 'discord2'], [9, 'weaken'], [10, 'fire2'], [10, 'revive'], [14, 'ambush'], [16, 'empty'], [18, 'fire3'], [20, 'revive2'], [11, 'poison'], [13, 'cleanse'], [17, 'stun'], [19, 'flood'], [22, 'thunder'], [24, 'poison2'], [28, 'fireall']]
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
    // ---- 第二章 ----
    heishan_b: { name: '黑山賊', terrain: { plain: 'B', forest: 'A', mountain: 'S', sea: 'C' }, int: 10, lead: 8, luck: 6, title: '黑山賊', cls: '賊兵', weapon: '刀', desc: '盤踞太行山的黑山軍，人數眾多，專挑山路打劫。', hp: 560, atk: 60, def: 30, spd: 12, exp: 90, gold: 70, sprite: 19 },
    heishan_a: { name: '黑山弓手', terrain: { plain: 'B', forest: 'A', mountain: 'A', sea: 'C' }, int: 12, lead: 6, luck: 6, title: '黑山弓手', cls: '弓兵', weapon: '弓', desc: '躲在山岩後面放冷箭的黑山軍弓手。', hp: 240, atk: 56, def: 20, spd: 14, exp: 70, gold: 55, sprite: 20 },
    officer: { name: '官差', terrain: { plain: 'A', forest: 'B', mountain: 'B', sea: 'C' }, int: 8, lead: 8, luck: 4, title: '督郵的差役', cls: '差役', weapon: '槍', desc: '跟著督郵出巡的差役，拿著水火棍，欺負百姓很在行。', hp: 480, atk: 54, def: 28, spd: 10, exp: 70, gold: 50, sprite: 21 },
    duyou: { name: '督郵', terrain: { plain: 'A', forest: 'C', mountain: 'C', sea: 'C' }, int: 40, lead: 20, luck: 6, title: '郡督郵', cls: '官吏', weapon: '扇', desc: '郡裡派下來視察縣官的督郵。專門索賄，靠一張嘴與官印過日子，打起架來倒是虛的。', hp: 18000, atk: 112, def: 46, spd: 12, exp: 1300, gold: 700, sprite: 17, boss: true, ai: 'boss' },
    zhangyan: { name: '張燕', terrain: { plain: 'B', forest: 'A', mountain: 'S', sea: 'C' }, int: 44, lead: 38, luck: 14, title: '黑山軍首領「飛燕」', cls: '大帥', weapon: '刀', desc: '黑山軍的首領，本名褚燕，因行動輕捷如飛燕得名。聚眾百萬，朝廷奈何不得。', hp: 23000, atk: 128, def: 60, spd: 20, exp: 1800, gold: 1200, sprite: 18, boss: true, ai: 'boss' },
    wuhuan: { name: '烏桓騎兵', terrain: { plain: 'S', forest: 'C', mountain: 'B', sea: 'C' }, int: 8, lead: 10, luck: 6, title: '烏桓騎兵', cls: '騎兵', weapon: '槍', desc: '北方烏桓的騎兵，在平地上衝鋒起來沒人擋得住。', hp: 620, atk: 66, def: 30, spd: 16, exp: 130, gold: 90, sprite: 23 },
    xiliang: { name: '西涼兵', terrain: { plain: 'A', forest: 'B', mountain: 'A', sea: 'C' }, int: 8, lead: 10, luck: 5, title: '董卓的西涼兵', cls: '精兵', weapon: '槍', desc: '董卓麾下的西涼精兵，在邊疆打慣了仗，下手很重。', hp: 720, atk: 72, def: 33, spd: 12, exp: 150, gold: 110, sprite: 25 },
    zhangchun: { name: '張純', terrain: { plain: 'S', forest: 'B', mountain: 'B', sea: 'C' }, int: 48, lead: 36, luck: 10, title: '叛將・彌天將軍', cls: '叛將', weapon: '刀', desc: '前漢中山太守，因不滿朝廷勾結烏桓叛亂，自號彌天將軍。', hp: 21000, atk: 126, def: 60, spd: 13, exp: 2400, gold: 1600, sprite: 22, boss: true, ai: 'boss' },
    huaxiong: { name: '華雄', terrain: { plain: 'A', forest: 'B', mountain: 'A', sea: 'C' }, int: 20, lead: 42, luck: 8, title: '西涼大將・都督', cls: '猛將', weapon: '矛', desc: '董卓麾下的第一猛將，守汜水關，力大無窮，連續斬殺聯軍數員將領。', hp: 29000, atk: 142, def: 67, spd: 16, exp: 3200, gold: 2200, sprite: 24, boss: true, ai: 'boss' },
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
    field7: [ ['heishan_b', 'heishan_b', 'heishan_a', 'heishan_a'], ['heishan_b', 'heishan_a', 'heishan_a', 'officer'], ['heishan_b', 'heishan_b', 'heishan_b', 'heishan_a', 'heishan_a'], ['officer', 'officer', 'heishan_b', 'heishan_a', 'heishan_a'] ],
    boss12: [ ['duyou', 'officer', 'officer', 'officer', 'officer'] ],
    boss13: [ ['zhangyan', 'heishan_b', 'heishan_b', 'heishan_a', 'heishan_a', 'heishan_a'] ],
    field8: [ ['wuhuan', 'wuhuan', 'heishan_a', 'heishan_a'], ['wuhuan', 'wuhuan', 'wuhuan', 'heishan_a'], ['wuhuan', 'heishan_b', 'heishan_a', 'heishan_a', 'officer'], ['wuhuan', 'wuhuan', 'heishan_b', 'heishan_b'] ],
    field9: [ ['xiliang', 'xiliang', 'heishan_a', 'heishan_a'], ['xiliang', 'xiliang', 'xiliang', 'heishan_a'], ['xiliang', 'wuhuan', 'wuhuan', 'heishan_a', 'heishan_a'], ['xiliang', 'xiliang', 'wuhuan', 'wuhuan'] ],
    boss14: [ ['zhangchun', 'wuhuan', 'wuhuan', 'wuhuan', 'heishan_a', 'heishan_a'] ],
    boss15: [ ['huaxiong', 'xiliang', 'xiliang', 'xiliang', 'heishan_a', 'heishan_a'] ],
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
  B.rematch = { boss_down: 'chengyuanzhi', boss2_down: 'qushuai', bocai_down: 'bocai', pengtuo_down: 'pengtuo', zhaohong_down: 'zhaohong', hanzhong_down: 'hanzhong', busi_down: 'busi', zhangliang_down: 'zhangliang', zhangbao_down: 'zhangbao', zhangjiao_down: 'zhangjiao', duyou_down: 'duyou', zhangyan_down: 'zhangyan', zhangchun_down: 'zhangchun', huaxiong_down: 'huaxiong' };
  B.rematchRate = 0.10;
  Object.keys(B.rematch).forEach(function (f) {
    const id = B.rematch[f], e = B.enemies[id];
    if (!e) return;
    const r = Object.assign({}, e, { rematchOf: id });   // 能力、經驗、金幣與原本的頭目完全相同
    B.enemies[id + '_r'] = r;
  });
})();
