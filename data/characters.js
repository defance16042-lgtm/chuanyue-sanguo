// 角色資料（1 級初始能力與每級成長，依設計文件「數值設計」）。
// 劉備、關羽、張飛的能力固定，依史書評價編排；諸葛貓妖由玩家配點（allocatable）。
// 五項能力：atk＝武力、int＝智力、spd＝速度、hp＝兵力、cha＝魅力。
// 防禦不是獨立能力，由兵力換算（兵力上限 × 0.08）；tp＝戰術點是計謀用的資源。
window.DATA = window.DATA || {};
window.DATA.characters = {
  nyao: {
    id: 'nyao', name: '諸葛貓妖', sprite: 0, allocatable: true, startPoints: 6, pointsPerLevel: 3,
    hp: 110, atk: 12, int: 12, spd: 14, cha: 10, tp: 8,
    growth: { hp: 14 }   // 諸葛貓妖每級只長兵力，其餘靠能力點
  },
  liubei: {
    id: 'liubei', name: '劉備', sprite: 1, allocatable: false,
    hp: 120, atk: 12, int: 16, spd: 9, cha: 20, tp: 14,
    growth: { hp: 16, atk: 1, int: 2, cha: 2 }
  },
  guanyu: {
    id: 'guanyu', name: '關羽', sprite: 2, allocatable: false,
    hp: 150, atk: 20, int: 10, spd: 11, cha: 12, tp: 6,
    growth: { hp: 20, atk: 3, int: 1, cha: 1 }
  },
  zhangfei: {
    id: 'zhangfei', name: '張飛', sprite: 3, allocatable: false,
    hp: 170, atk: 19, int: 4, spd: 8, cha: 6, tp: 4,
    growth: { hp: 24, atk: 3, int: 0, cha: 0 }
  }
};
