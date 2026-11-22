// 陣形：選了陣形，整場戰鬥都有效果。解鎖看諸葛貓妖（軍師）的等級；八卦陣只有諸葛孔明（諸葛貓妖）在隊伍裡才能擺。
// front＝隊伍順序的前兩位，back＝第三位以後；all＝全員；foe＝敵軍。數值是倍率。
// heal＝每回合開始回復最大兵力的比例，tp＝每回合多回的戰術點，first＝第一回合我方全員先手
(function () {
  window.DATA.formations = {
    none:     { name: '無陣',   unlock: 0, desc: '不擺陣形，各憑本事。' },
    yulin:    { name: '魚鱗陣', unlock: 3, desc: '前排防禦大增，後排稍增；全員稍慢。', front: { def: 1.25 }, back: { def: 1.05 }, all: { spd: 0.95 } },
    fengshi:  { name: '鋒矢陣', unlock: 5, desc: '前排攻擊大增，但防禦下降。', front: { atk: 1.3, def: 0.92 } },
    heyi:     { name: '鶴翼陣', unlock: 8, desc: '全員更快，後排的計謀威力提高。', all: { spd: 1.15 }, back: { int: 1.2 } },
    changshe: { name: '長蛇陣', unlock: 12, desc: '首尾呼應，全員防禦與速度小幅提高。', all: { def: 1.1, spd: 1.1 } },
    yanxing:  { name: '雁行陣', unlock: 16, desc: '全員攻擊提高，第一回合我方全員先手。', all: { atk: 1.12 }, first: true },
    yanyue:   { name: '偃月陣', unlock: 20, desc: '每回合開始，全員回復 4% 兵力。', heal: 0.04 },
    fangyuan: { name: '方圓陣', unlock: 26, desc: '全員防禦大增，每回合多回 2 點戰術點。', all: { def: 1.2 }, tp: 2 },
    jifeng:   { name: '疾風陣', unlock: 32, desc: '全員速度大增，攻擊稍微降低。', all: { spd: 1.3, atk: 0.95 } },
    changqu:  { name: '長驅陣', unlock: 38, desc: '全員攻擊與速度提高，防禦稍降，第一回合先手。', all: { atk: 1.2, spd: 1.1, def: 0.9 }, first: true },
    bagua:    { name: '八卦陣', unlock: 45, only: 'nyao', desc: '諸葛孔明獨有的最強陣形：全員攻、防、速、智全面提高，敵軍攻擊下降；每回合回復 5% 兵力與 2 點戰術點，第一回合先手。',
                all: { atk: 1.25, def: 1.25, spd: 1.15, int: 1.2 }, foe: { atk: 0.9 }, heal: 0.05, tp: 2, first: true }
  };
  window.DATA.formationOrder = ['none', 'yulin', 'fengshi', 'heyi', 'changshe', 'yanxing', 'yanyue', 'fangyuan', 'jifeng', 'changqu', 'bagua'];
})();
