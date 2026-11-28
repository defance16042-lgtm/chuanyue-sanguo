// 陣形：每個陣形規定第 1 位～第 5 位各站哪一排（rows：0 前排、1 中排、2 後排）。位置只看「隊伍第幾位」，和人物無關；
// 想讓誰站前排後排，就到「隊伍編成」調整他在隊伍裡的順序。數值是倍率：all 全員、front/mid/back 該排、foe 敵軍。
// heal＝每回合開始回復最大兵力的比例，tp＝每回合多回的戰術點，first＝第一回合我方全員先手
(function () {
  window.DATA.formations = {
    none:     { name: '無陣',   unlock: 0, desc: '不擺陣形，各憑本事。五人並排站在原位。' },
    yulin:    { name: '魚鱗陣', unlock: 3, desc: '前排厚實如鱗甲：前排防禦大增，中、後排依序遞減；全員稍慢。', rows: [0, 0, 1, 1, 2], front: { def: 1.25 }, mid: { def: 1.12 }, back: { def: 1.05 }, all: { spd: 0.95 } },
    fengshi:  { name: '鋒矢陣', unlock: 5, desc: '第 1 位衝在最前當箭頭：前排攻擊大增但防禦下降，中排攻擊小增。', rows: [0, 1, 1, 2, 2], front: { atk: 1.4, def: 0.9 }, mid: { atk: 1.15 }, back: { int: 1.1 } },
    heyi:     { name: '鶴翼陣', unlock: 8, desc: '第 2、4 位如兩翼前張，第 3 位守在最後方指揮：全員更快，後排的計謀威力大增。', rows: [1, 0, 2, 0, 1], all: { spd: 1.15 }, front: { atk: 1.1 }, back: { int: 1.3 } },
    changshe: { name: '長蛇陣', unlock: 12, desc: '首尾呼應，一字長蛇：全員防禦與速度小幅提高。', rows: [0, 1, 1, 1, 2], all: { def: 1.1, spd: 1.1 } },
    yanxing:  { name: '雁行陣', unlock: 16, desc: '前後交錯如雁行：全員攻擊提高，第一回合我方全員先手。', rows: [0, 1, 0, 1, 0], all: { atk: 1.12 }, first: true },
    yanyue:   { name: '偃月陣', unlock: 20, desc: '中央三人在前、兩端稍後如彎月：每回合開始，全員回復 4% 兵力，前排防禦小增。', rows: [1, 0, 0, 0, 1], front: { def: 1.1 }, heal: 0.04 },
    fangyuan: { name: '方圓陣', unlock: 26, desc: '把第 3 位護在中央最後方：全員防禦大增，每回合多回 2 點戰術點，後排智力提高。', rows: [0, 0, 2, 0, 0], all: { def: 1.2 }, back: { int: 1.2 }, tp: 2 },
    jifeng:   { name: '疾風陣', unlock: 32, desc: '輕裝快攻：全員速度大增、攻擊稍降，前排更快。', rows: [0, 0, 1, 0, 0], all: { spd: 1.3, atk: 0.95 }, front: { spd: 1.05 } },
    changqu:  { name: '長驅陣', unlock: 38, desc: '前三位直衝，後兩位壓陣：全員攻擊與速度提高，防禦稍降，第一回合先手。', rows: [0, 0, 0, 1, 1], all: { atk: 1.2, spd: 1.1, def: 0.9 }, first: true },
    xuanwu:   { name: '玄武陣', unlock: 22, desc: '龜蛇守勢：全員防禦大增、速度稍降，中央第 3 位藏在最後。', rows: [0, 0, 2, 0, 1], all: { def: 1.3, spd: 0.92 }, front: { def: 1.1 } },
    longteng: { name: '龍騰陣', unlock: 30, desc: '蛟龍出海：全員攻擊與智力提高，每回合回復 2% 兵力。', rows: [0, 1, 1, 0, 2], all: { atk: 1.15, int: 1.1 }, front: { atk: 1.1 }, heal: 0.02 },
    zhuque:   { name: '朱雀陣', unlock: 34, desc: '火鳥展翅：智力大增，每回合多回 1 點戰術點，後排計謀更猛。', rows: [1, 0, 2, 0, 2], all: { int: 1.25 }, back: { int: 1.15 }, tp: 1 },
    baihu:    { name: '白虎陣', unlock: 36, desc: '猛虎下山：前排攻擊暴增但防禦大降，中排攻擊提高，第一回合先手。', rows: [0, 0, 1, 1, 2], front: { atk: 1.45, def: 0.85 }, mid: { atk: 1.2 }, first: true },
    qinglong: { name: '青龍陣', unlock: 42, desc: '青龍遊走：我方速度大增，敵軍速度下降，先手的人說了算。', rows: [0, 1, 0, 1, 2], all: { spd: 1.2, atk: 1.08 }, foe: { spd: 0.88 } },
    lianhuan: { name: '連環陣', unlock: 48, desc: '五人環環相扣：全員防禦提高，每回合回復 3% 兵力與 1 點戰術點。', rows: [0, 1, 1, 1, 0], all: { def: 1.12 }, heal: 0.03, tp: 1 },
    taiji:    { name: '太極陣', unlock: 52, desc: '陰陽相濟：全員智力提高，每回合回復 3% 兵力與 3 點戰術點，計謀連發不心疼。', rows: [1, 0, 2, 0, 1], all: { int: 1.15, def: 1.05 }, heal: 0.03, tp: 3 },
    pojun:    { name: '破軍陣', unlock: 55, desc: '專破堅陣：敵軍防禦大降，我方攻擊提高，防禦稍降。', rows: [0, 0, 1, 0, 1], all: { atk: 1.15, def: 0.95 }, foe: { def: 0.8 } },
    wuyun:    { name: '烏雲陣', unlock: 58, desc: '烏雲蔽日：敵軍攻擊與速度雙雙下降，我方全員防禦小增。', rows: [1, 1, 2, 0, 1], all: { def: 1.08 }, foe: { atk: 0.85, spd: 0.9 } },
    xingluo:  { name: '星羅陣', unlock: 60, desc: '星斗羅列：全員四項能力小幅提高，每回合回復 2% 兵力與 2 點戰術點。', rows: [0, 1, 2, 1, 0], all: { atk: 1.1, def: 1.1, spd: 1.08, int: 1.1 }, heal: 0.02, tp: 2 },
    bagua:    { name: '八卦陣', unlock: 45, only: 'zhugeliang', desc: '諸葛孔明獨有的最強陣形（孔明在隊伍並擔任軍師時才能擺）：全員攻、防、速、智全面提高，敵軍攻擊下降；每回合回復 5% 兵力與 2 點戰術點，第一回合先手。第 1、5 位在前，第 3 位坐鎮最後。', rows: [0, 1, 2, 1, 0],
                all: { atk: 1.25, def: 1.25, spd: 1.15, int: 1.2 }, front: { def: 1.1 }, back: { int: 1.15 }, foe: { atk: 0.9 }, heal: 0.05, tp: 2, first: true }
  };
  window.DATA.formationOrder = ['none', 'yulin', 'fengshi', 'heyi', 'changshe', 'yanxing', 'yanyue', 'fangyuan', 'jifeng', 'changqu', 'xuanwu', 'longteng', 'zhuque', 'baihu', 'qinglong', 'lianhuan', 'taiji', 'pojun', 'wuyun', 'xingluo', 'bagua'];
})();
