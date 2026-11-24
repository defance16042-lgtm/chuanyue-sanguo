// 洞穴、山口、關口的地形變化：翻轉版面、換地面與牆壁圖塊、撒上石塊木箱等障礙。
// 所有改動都會檢查「入口、出口、人物、寶箱還走得到」，走不到就取消那一格。
(function () {
  const D = window.DATA, M = D.maps, solid = {};
  D.solidTiles.forEach(function (t) { solid[t] = true; });
  const isSolid = function (ch) { const t = D.legend[ch]; return t === undefined || !!solid[t]; };
  const FLIPDIR = { left: 'right', right: 'left' }, FLIPDIRY = { up: 'down', down: 'up' };

  // 水平（x）或垂直（y）翻轉一張圖；連到這張圖的傳送點座標也一起改
  function flip(id, axis) {
    const m = M[id]; if (!m) return;
    const H = m.tiles.length, W = m.tiles[0].length;
    const fx = axis === 'x' ? function (x) { return W - 1 - x; } : function (x) { return x; };
    const fy = axis === 'y' ? function (y) { return H - 1 - y; } : function (y) { return y; };
    if (axis === 'x') m.tiles = m.tiles.map(function (r) { return r.split('').reverse().join(''); });
    else m.tiles = m.tiles.slice().reverse();
    const mv = function (o) { if (o.x !== undefined) { o.x = fx(o.x); o.y = fy(o.y); } };
    const df = axis === 'x' ? FLIPDIR : FLIPDIRY;
    (m.npcs || []).forEach(function (n) { mv(n); if (n.dir && df[n.dir]) n.dir = df[n.dir]; });
    (m.objects || []).concat(m.signs || []).forEach(mv);
    (m.warps || []).forEach(function (w) { mv(w); if (w.dir && df[w.dir]) w.dir = df[w.dir]; });
    if (m.start) { m.start.x = fx(m.start.x); m.start.y = fy(m.start.y); if (m.start.dir && df[m.start.dir]) m.start.dir = df[m.start.dir]; }
    Object.keys(M).forEach(function (k) {   // 別張圖通往這裡的傳送點
      (M[k].warps || []).forEach(function (w) { if (w.to === id && w.tx !== undefined) { w.tx = fx(w.tx); w.ty = fy(w.ty); if (w.dir && df[w.dir] && false) w.dir = df[w.dir]; } });
    });
  }
  // 換圖塊：map = { 原字元: 新字元 或 [新字元, 機率] }
  function skin(id, map, seed) {
    const m = M[id]; if (!m) return; let s = seed || 1;
    const rnd = function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    m.tiles = m.tiles.map(function (r) {
      return r.split('').map(function (c) { const v = map[c]; if (!v) return c; return Array.isArray(v) ? (rnd() < v[1] ? v[0] : c) : v; }).join('');
    });
  }
  // 撒障礙物：每放一個就檢查所有重要地點還連得到
  function decorate(id, chars, count, seed, floorSet) {
    const m = M[id]; if (!m) return;
    const H = m.tiles.length, W = m.tiles[0].length, g = m.tiles.map(function (r) { return r.split(''); });
    let s = seed || 7; const rnd = function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const keys = [], keep = {};
    const add = function (x, y, near) { keys.push([x, y]); for (let dy = -(near || 1); dy <= (near || 1); dy++) for (let dx = -(near || 1); dx <= (near || 1); dx++) keep[(x + dx) + ',' + (y + dy)] = 1; };
    add(m.start.x, m.start.y, 2);
    (m.warps || []).forEach(function (w) { add(w.x, w.y, 2); });
    (m.npcs || []).forEach(function (n) { add(n.x, n.y, 1); });
    (m.objects || []).forEach(function (o) { add(o.x, o.y, 1); });
    const reach = function () {
      const seen = {}, q = [[m.start.x, m.start.y]]; seen[m.start.x + ',' + m.start.y] = 1;
      while (q.length) { const p = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        const x = p[0] + d[0], y = p[1] + d[1], k = x + ',' + y; if (x < 0 || y < 0 || x >= W || y >= H || seen[k]) return;
        if (isSolid(g[y][x]) && !keys.some(function (e) { return e[0] === x && e[1] === y; })) return; seen[k] = 1; q.push([x, y]); }); }
      return seen;
    };
    let placed = 0, tries = 0;
    while (placed < count && tries++ < count * 30) {
      const x = 1 + Math.floor(rnd() * (W - 2)), y = 1 + Math.floor(rnd() * (H - 2)), cur = g[y][x];
      if (keep[x + ',' + y] || !floorSet.includes(cur)) continue;
      const ch = chars[Math.floor(rnd() * chars.length)]; g[y][x] = ch;
      const seen = reach();
      const ok = keys.every(function (e) { return seen[e[0] + ',' + e[1]]; });
      if (ok) placed++; else g[y][x] = cur;
    }
    m.tiles = g.map(function (r) { return r.join(''); });
  }

  // ---- 山口：太行山（原樣）、燕山（翻轉＋積雪）、轘轅山（中層翻轉＋林石）----
  ['shankou2', 'shankou2_2', 'shankou2_3'].forEach(function (id) { flip(id, 'x'); skin(id, { J: 'i', L: 'i', Y: 'I' }); decorate(id, ['E', 'U', 'I'], 14, 21, ['i']); });
  flip('shankou3_2', 'x'); ['shankou3', 'shankou3_2', 'shankou3_3'].forEach(function (id, i) { skin(id, { L: ['Y', 0.45] }, 5 + i); decorate(id, ['E', 'U', 'Y', 'Y'], 16, 31 + i, ['J', 'Y']); });
  ['shankou1', 'shankou1_2', 'shankou1_3'].forEach(function (id, i) { decorate(id, ['E', 'U'], 6, 11 + i, ['J']); });
  // ---- 關口：西關（原樣、多些雜物）、成皋東關（左右翻轉、換成軍營風貌）----
  flip('guan_e', 'x'); decorate('guan_e', ['X', 'B', 'F', 'O'], 18, 41, [',']); decorate('guan_w', ['X', 'B', 'F'], 10, 43, [',']);
  skin('guan_e', { '#': ['Q', 0.7] }, 9);
  // ---- 洞穴：每座洞穴的地面、牆壁、版面都不同 ----
  ['cave2', 'cave2_2', 'cave2_3'].forEach(function (id) { skin(id, { c: 'J', w: 'A' }); decorate(id, ['E', 'U'], 10, 51, ['J']); });
  ['cave3', 'cave3_2', 'cave3_3'].forEach(function (id) { flip(id, 'y'); skin(id, { c: 'i', w: '#' }); decorate(id, ['E', 'I'], 10, 61, ['i']); });
  ['cave4', 'cave4_2', 'cave4_3'].forEach(function (id) { flip(id, 'x'); skin(id, { c: 'L' }); decorate(id, ['E', 'U'], 10, 71, ['L']); });
  ['cave5', 'cave5_2', 'cave5_3'].forEach(function (id) { flip(id, 'y'); flip(id, 'x'); skin(id, { c: '_', w: 'Q' }); decorate(id, ['X', 'B', 'O'], 10, 81, ['_']); });
  ['cave1', 'cave1_2', 'cave1_3'].forEach(function (id) { decorate(id, ['E', 'U'], 10, 91, ['c']); });
})();
