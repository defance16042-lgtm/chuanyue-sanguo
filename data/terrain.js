// 專屬地形：每位將領、每種敵兵都有自己最拿手的地形（平地／森林／山／海／沙漠）。
// 戰鬥中的兵力條顏色代表專屬地形：平地＝綠、森林＝深綠、山＝銅、海＝藍、沙漠＝淡黃。
// 在專屬地形作戰，適性至少是 A（主將、頭目是 S），所以「地利」是看得見的優勢。
(function () {
  const D = window.DATA, B = D.battle;
  D.terrainNames.desert = '沙漠';
  D.terrainColors = { plain: '#6ccf4a', forest: '#2e8b4a', mountain: '#c9843a', sea: '#3f93e8', desert: '#ecdc94' };
  D.terrainOf[32] = 'desert';   // 沙灘（海岸邊）
  // ---- 水軍：海邊（沙灘）遇敵 ----
  const T = function (p, f, m, s, d) { return { plain: p, forest: f, mountain: m, sea: s, desert: d || 'B' }; };
  const en = B.enemies;
  en.shuizei = { name: '水賊', terrain: T('C', 'B', 'C', 'A'), int: 9, lead: 4, luck: 5, title: '水賊', cls: '賊兵', weapon: '刀', desc: '在海邊討生活的水賊，上了岸就搶，搶完就划船跑。', hp: 150, atk: 26, def: 13, spd: 11, exp: 40, gold: 38, sprite: 2 };
  en.shuijun = { name: '水軍兵', terrain: T('C', 'C', 'C', 'S'), int: 10, lead: 10, luck: 5, title: '水軍', cls: '水兵', weapon: '矛', desc: '慣於水戰的水軍兵，腳一沾水就特別穩。', hp: 460, atk: 56, def: 28, spd: 12, exp: 110, gold: 90, sprite: 25 };
  en.baibo = { name: '白波賊', terrain: T('C', 'B', 'B', 'A'), int: 10, lead: 10, luck: 5, title: '黃河白波軍', cls: '賊兵', weapon: '刀', desc: '盤踞黃河兩岸的白波賊，是黃巾的餘黨，專劫船隻。', hp: 760, atk: 74, def: 34, spd: 13, exp: 160, gold: 120, sprite: 19 };
  en.guanhai = { name: '管亥', terrain: T('B', 'C', 'C', 'S'), int: 24, lead: 30, luck: 9, title: '渤海黃巾水軍', cls: '水軍將', weapon: '刀', desc: '黃巾在青、徐沿海的首領，帶著一支船隊橫行渤海。', hp: 9500, atk: 94, def: 42, spd: 16, exp: 900, gold: 800, sprite: 7, ai: 'boss' };
  en.guotai = { name: '郭太', terrain: T('B', 'C', 'C', 'S'), int: 30, lead: 34, luck: 10, title: '白波軍首領', cls: '水軍將', weapon: '矛', desc: '白波軍的頭領，河東一帶的水路都得看他臉色。', hp: 17000, atk: 124, def: 56, spd: 18, exp: 2000, gold: 1500, sprite: 18, ai: 'boss' };
  B.groups.coastA = [['shuizei', 'shuizei', 'shuizei'], ['shuizei', 'shuizei', 'captain', 'shuizei']];
  B.groups.coastB = [['shuijun', 'shuijun', 'shuizei', 'shuizei'], ['shuijun', 'shuijun', 'shuijun', 'shuizei']];
  B.groups.coastC = [['baibo', 'baibo', 'shuijun', 'shuijun'], ['baibo', 'baibo', 'baibo', 'shuijun']];
  B.groups.coastG1 = [['guanhai', 'shuijun', 'shuijun', 'shuizei', 'shuizei']];
  B.groups.coastG2 = [['guotai', 'baibo', 'baibo', 'shuijun', 'shuijun']];
  D.drops.guanhai = ['sea_blade', 0.5]; D.drops.guotai = ['river_spear', 0.5];
  D.equipment.sea_blade = { name: '管亥海刀', slot: 'weapon', wtype: '刀', mods: { pow: 50, spd: 1 }, price: 0, desc: '管亥的佩刀，刀背上還有海鹽的白漬。' };
  D.equipment.river_spear = { name: '白波河槍', slot: 'weapon', wtype: '槍', mods: { pow: 62 }, price: 0, desc: '郭太的長槍，槍纓被河水泡得發灰。' };
  // ---- 專屬地形表 ----
  const HOME = {
    // 我方
    nyao: 'forest', liubei: 'plain', guanyu: 'mountain', zhangfei: 'plain', zoujing: 'plain', caocao: 'plain', luzhi: 'forest',
    // 黃巾與賊
    turban: 'plain', archer: 'forest', bandit: 'mountain', captain: 'plain', chengyuanzhi: 'plain', elite: 'plain', bocai: 'plain', qushuai: 'plain',
    veteran: 'mountain', zhangliang: 'mountain', zhangbao: 'mountain', zhangjiao: 'plain', heishan_b: 'mountain', heishan_a: 'mountain', officer: 'plain',
    duyou: 'plain', zhangyan: 'mountain', busi: 'plain', pengtuo: 'forest', zhaohong: 'mountain', hanzhong: 'plain', sunxia: 'forest', dengmao: 'mountain', yudigen: 'mountain', yuji: 'forest',
    // 北方與西涼
    wuhuan: 'desert', tadun: 'desert', zhangchun: 'plain', xiliang: 'desert', huaxiong: 'desert', lubu: 'plain', langqi: 'plain', xurong: 'desert', guosi: 'desert', guanjiang: 'mountain',
    // 水軍
    shuizei: 'sea', shuijun: 'sea', baibo: 'sea', guanhai: 'sea', guotai: 'sea'
  };
  const RANK = { S: 3, A: 2, B: 1, C: 0 };
  function apply(id, o, hero) {
    const base = id.replace(/_r$/, ''), home = HOME[base];
    if (!o.terrain) o.terrain = {};
    if (!o.terrain.desert) o.terrain.desert = 'B';
    if (!home) { const ks = Object.keys(D.terrainNames); let best = ks[0]; ks.forEach(function (k) { if ((RANK[o.terrain[k] || 'B']) > RANK[o.terrain[best] || 'B']) best = k; }); o.home = best; return; }
    o.home = home;
    const want = hero ? 'S' : 'A';
    if (RANK[o.terrain[home] || 'B'] < RANK[want]) o.terrain[home] = want;
  }
  Object.keys(D.characters).forEach(function (k) { apply(k, D.characters[k], true); });
  D.characters.guanyu.terrain.sea = 'A';   // 史實：關羽擅長水戰（水淹七軍、荊州水師）
  Object.keys(en).forEach(function (k) { apply(k, en[k], !!en[k].boss || /^(guanhai|guotai)$/.test(k)); });
})();
