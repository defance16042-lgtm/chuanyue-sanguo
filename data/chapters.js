// 章間封鎖：北方大地圖上，第二章的區域（太行山以西、燕山以北東）用山脈圍起來，
// 第一章的人走不進去，只能經過山口（山口要等劇情走到才開）。這份資料在 world.js 之後執行，直接改大地圖的地形與傳送點，
// 所以 tools/build_world.py 重新產生 world.js 時，這裡不需要跟著改。
(function () {
  const D = window.DATA, m = D.maps.world, S = D.dialogue, WALL = 'Q';
  const solid = new Set(D.solidTiles), grid = m.tiles.map(function (r) { return r.split(''); });
  const H = grid.length, W = grid[0].length;
  const warpAt = {}; m.warps.forEach(function (w) { warpAt[w.x + ',' + w.y] = 1; });
  const wall = function (x, y) {
    if (x < 1 || y < 1 || x > W - 2 || y > H - 2) return;
    if (warpAt[x + ',' + y]) return;
    if (solid.has(D.legend[grid[y][x]])) return;   // 本來就擋路的（水、山壁、城）不必再蓋
    grid[y][x] = WALL;
  };
  // 太行山脈：整條 x=21 的南北向山牆（山口在 y=23）
  for (let y = 1; y < H - 1; y++) wall(21, y);
  // 燕山：x=60 的山牆往北、往南補齊，再沿 y=28 往東封到海邊
  for (let y = 1; y <= 28; y++) wall(60, y);
  for (let x = 60; x < W - 1; x++) wall(x, 28);
  m.tiles = grid.map(function (r) { return r.join(''); });
  m.chapterZones = [
    { name: '太行山以西', rect: [1, 1, 20, H - 2], need: 'sanzhang_down' },
    { name: '燕山以北東', rect: [61, 1, W - 2, 27], need: 'zhangyan_down' }
  ];
  // 山口要等劇情走到才開：太行山口＝第一章結束（安喜縣尉），燕山口＝打完太行山道的張燕
  const gate = function (x, y, need, deny, bx, by) {
    const w = m.warps.find(function (k) { return k.x === x && k.y === y; });
    if (w) { w.need = need; w.deny = deny; w.bx = bx; w.by = by; }
  };
  gate(22, 23, 'sanzhang_down', 'pass_sealed1', 23, 23); gate(20, 23, 'sanzhang_down', 'pass_sealed1', 19, 23);
  gate(61, 13, 'zhangyan_down', 'pass_sealed2', 62, 13); gate(59, 13, 'zhangyan_down', 'pass_sealed2', 58, 13);
  S.pass_sealed1 = [{ speaker: '', text: '太行山口被官軍的路障封住了。守軍說：「黃巾之亂還沒平，山口不開，回去！」' }];
  S.pass_sealed2 = [{ speaker: '', text: '燕山口緊閉，哨兵搖頭：「太行山道的黑山軍還沒擺平，這條路不安全，不准過。」' }];
  // 這兩片區域在城鎮與劇情上屬於第二章。找得出哪一片裡面的函式（給任務與測試用）
  D.chapterZoneAt = function (x, y) { return D.maps.world.chapterZones.find(function (z) { return x >= z.rect[0] && y >= z.rect[1] && x <= z.rect[2] && y <= z.rect[3]; }); };
})();
