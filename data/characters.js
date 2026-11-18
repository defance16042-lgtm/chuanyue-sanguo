// 角色資料：初始能力、每級隨機成長、人物檔案（字、稱號、職類、武器種類、特性）。
// 沒有人手動配點：每次升級依「成長率」自動隨機成長（成長率 1.4 ＝ 每級至少 +1，有 40% 機率 +2）。
// 八項能力：hp 兵力、tp 戰術點、atk 武力、int 智力、spd 速度、lead 統率、luck 運氣、grd 守備。
//  統率：隊伍中最高的統率，替全隊增加傷害（每點 +0.3%）。
//  運氣：暴擊率（每點 +0.5%，另有基本 3%）與閃避率（每點 +0.3%）。
//  守備：與兵力共同決定防禦（防禦＝兵力×8%＋守備÷4＋裝備）。
// weapon：武器種類（劍／刀／矛／槍／扇），只能裝備同種類的武器。
// trait：特性，固定加成（mods）。guest：true 的是「助戰」角色，故事結束就離隊。
window.DATA = window.DATA || {};
window.DATA.characters = {
  nyao: {
    id: 'nyao', name: '諸葛貓妖', sprite: 0, zi: '（自稱孔明）', title: '穿越的貓妖', cls: '軍師', weapon: '扇',
    hp: 110, tp: 8, atk: 13, int: 13, spd: 14, lead: 8, luck: 14, grd: 6,
    growth: { hp: 14, atk: 0.6, int: 0.6, spd: 0.15, lead: 0.5, luck: 0.5, grd: 0.4, tp: 0.5 },
    trait: { name: '貓的直覺', desc: '運氣 +4', mods: { luck: 4 } },
    bio: '不知為何穿越到漢末的貓妖，自稱諸葛孔明。能力成長完全隨機，是隊伍裡最難預測的人。'
  },
  liubei: {
    id: 'liubei', name: '劉備', sprite: 1, zi: '玄德', title: '漢室宗親', cls: '君主', weapon: '劍',
    hp: 120, tp: 14, atk: 12, int: 16, spd: 9, lead: 20, luck: 12, grd: 10,
    growth: { hp: 16, atk: 0.8, int: 1.6, spd: 0.2, lead: 1.6, luck: 0.6, grd: 0.6, tp: 0.5 },
    trait: { name: '仁德', desc: '統率 +3，鼓舞更有效', mods: { lead: 3 } },
    bio: '中山靖王之後，賣草鞋為生。胸懷大志，待人以誠，身邊的人都願意為他賣命。'
  },
  guanyu: {
    id: 'guanyu', name: '關羽', sprite: 2, zi: '雲長', title: '亡命的猛將', cls: '猛將', weapon: '刀',
    hp: 150, tp: 6, atk: 20, int: 10, spd: 11, lead: 12, luck: 10, grd: 12,
    growth: { hp: 20, atk: 2.4, int: 0.7, spd: 0.3, lead: 0.8, luck: 0.4, grd: 0.9, tp: 0.5 },
    trait: { name: '義薄雲天', desc: '武力 +3', mods: { atk: 3 } },
    bio: '河東解縣人，因故亡命涿郡。面如重棗，寡言重義，最看不慣欺壓百姓的人。'
  },
  zhangfei: {
    id: 'zhangfei', name: '張飛', sprite: 3, zi: '益德', title: '賣肉的壯漢', cls: '猛將', weapon: '矛',
    hp: 170, tp: 4, atk: 19, int: 4, spd: 8, lead: 8, luck: 8, grd: 14,
    growth: { hp: 24, atk: 2.2, int: 0.2, spd: 0.2, lead: 0.5, luck: 0.4, grd: 1.2, tp: 0.4 },
    trait: { name: '燕人怒吼', desc: '守備 +4', mods: { grd: 4 } },
    bio: '涿郡人，家中頗有田莊，賣酒屠豬。性子急，嗓門大，一吼能嚇退一排敵人。'
  },
  // ---- 助戰（別陣營，劇情結束就離隊）
  zoujing: {
    id: 'zoujing', name: '鄒靖', sprite: 13, zi: '', title: '幽州校尉', cls: '武官', weapon: '槍', guest: true,
    hp: 140, tp: 6, atk: 17, int: 9, spd: 9, lead: 15, luck: 9, grd: 13,
    growth: { hp: 18, atk: 1.8, int: 0.6, spd: 0.2, lead: 1.0, luck: 0.4, grd: 0.9, tp: 0.4 },
    trait: { name: '官軍紀律', desc: '統率 +2', mods: { lead: 2 } },
    bio: '幽州校尉，奉命討伐黃巾。與劉備一行只是暫時並肩作戰，任務一結束就會回營。'
  }
};
