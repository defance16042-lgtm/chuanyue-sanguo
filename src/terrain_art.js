// 地形美化：在原本的圖塊上面再疊一層細節（湖岸描邊與圓角、深水、草地花叢、山頂青苔）。
// 每張地圖只畫一次，存在一張離屏畫布裡，之後每一格畫面只是貼上去，不會拖慢遊戲。
(function () {
  const T = 16;
  const isWater = function (id) { return id === 2; };
  const isSand = function (id) { return id === 32; };
  // 同一格每次畫出來都一樣（不會閃動）
  function hash(x, y, k) { let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  const FLOWERS = [['#f4e45a', '#fff6b0'], ['#f08cb4', '#ffd0e4'], ['#f4f4f4', '#fff6b0'], ['#8ab4f0', '#d8e8ff']];

  function build(map, tileAt) {
    const w = map.tiles[0].length, h = map.tiles.length;
    const cv = document.createElement('canvas'); cv.width = w * T; cv.height = h * T;
    const c = cv.getContext('2d');
    const px = function (x, y, col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); };
    const rect = function (x, y, ww, hh, col) { c.fillStyle = col; c.fillRect(x, y, ww, hh); };
    const wat = function (x, y) { return isWater(tileAt(x, y)); };
    const ground = function (x, y) { return isSand(tileAt(x, y)) ? '#dec88e' : '#5c9c4a'; };
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const id = tileAt(tx, ty), X = tx * T, Y = ty * T;
        if (isWater(id)) {
          const n = wat(tx, ty - 1), s = wat(tx, ty + 1), wv = wat(tx - 1, ty), e = wat(tx + 1, ty);
          // 深水：離岸兩格以上的水面，顏色再深一階，邊緣做成圓角
          const deep = n && s && wv && e && wat(tx, ty - 2) && wat(tx, ty + 2) && wat(tx - 2, ty) && wat(tx + 2, ty);
          if (deep) rect(X + 1, Y + 1, 14, 14, 'rgba(20,50,130,0.30)');
          // 湖岸：沒有水的那一邊畫兩層描邊（外深內亮），再把凸出的角削成圓角
          const edge = function (side) {
            if (side === 'n') { rect(X, Y, T, 1, '#1c3f86'); rect(X, Y + 1, T, 1, '#4f86d6'); }
            if (side === 's') { rect(X, Y + 14, T, 1, '#4f86d6'); rect(X, Y + 15, T, 1, '#1c3f86'); }
            if (side === 'w') { rect(X, Y, 1, T, '#1c3f86'); rect(X + 1, Y, 1, T, '#4f86d6'); }
            if (side === 'e') { rect(X + 14, Y, 1, T, '#4f86d6'); rect(X + 15, Y, 1, T, '#1c3f86'); }
          };
          if (!n) edge('n'); if (!s) edge('s'); if (!wv) edge('w'); if (!e) edge('e');
          const corner = function (cx, cy, dx, dy, gx, gy) {   // 兩邊都沒有水：削圓角，露出岸上的地面色
            const g = ground(tx + gx, ty + gy), x0 = dx < 0 ? X : X + 15, y0 = dy < 0 ? Y : Y + 15, sx = dx < 0 ? 1 : -1, sy = dy < 0 ? 1 : -1;
            px(x0, y0, g); px(x0 + sx, y0, g); px(x0, y0 + sy, g); px(x0 + sx * 2, y0, g); px(x0, y0 + sy * 2, g);
            px(x0 + sx, y0 + sy, '#1c3f86');
          };
          if (!n && !wv) corner(0, 0, -1, -1, -1, -1); if (!n && !e) corner(0, 0, 1, -1, 1, -1);
          if (!s && !wv) corner(0, 0, -1, 1, -1, 1); if (!s && !e) corner(0, 0, 1, 1, 1, 1);
          // 水面閃光（兩格一組，位置固定）
          if (hash(tx, ty, 7) < 0.5) { px(X + 4 + ((tx * 3 + ty) % 5), Y + 6, '#9cc8f4'); px(X + 5 + ((tx * 3 + ty) % 5), Y + 6, '#9cc8f4'); }
        } else if (id === 31) {
          // 草地：偶爾有一叢花、一撮深色草
          const r = hash(tx, ty, 1);
          if (r < 0.15) {
            const f = FLOWERS[Math.floor(hash(tx, ty, 2) * FLOWERS.length)], ox = 2 + Math.floor(hash(tx, ty, 3) * 9), oy = 3 + Math.floor(hash(tx, ty, 4) * 9);
            px(X + ox, Y + oy + 1, '#3e7a3a'); px(X + ox, Y + oy, f[0]); px(X + ox - 1, Y + oy, f[1]); px(X + ox + 1, Y + oy, f[1]); px(X + ox, Y + oy - 1, f[1]);
            px(X + ox + 3, Y + oy + 2, '#3e7a3a'); px(X + ox + 3, Y + oy + 1, f[0]);
          } else if (r < 0.30) {
            const ox = 3 + Math.floor(hash(tx, ty, 5) * 8), oy = 6 + Math.floor(hash(tx, ty, 6) * 7);
            [[0, 0], [-1, -1], [1, -1], [0, -2], [-2, -2], [2, -2], [-1, 0], [1, 0]].forEach(function (d, i) { px(X + ox + d[0], Y + oy + d[1], i < 2 ? '#2e6a30' : (i < 6 ? '#3e7e3a' : '#2e6a30')); });
            if (hash(tx, ty, 8) < 0.3) { px(X + ox + 2, Y + oy - 3, '#7aa8f0'); px(X + ox + 2, Y + oy - 2, '#2e6a30'); }
          }
        } else if (id === 20) {
          // 山：兩座山峰各有機會在山頂長一頂青苔（左亮右暗）
          [[5, 2, 4], [11, 7, 5]].forEach(function (pk, i) {
            if (hash(tx, ty, 9 + i) >= 0.4) return;
            const cx = pk[0], top = pk[1], L = '#86c458', M = '#5a9a3c', D = '#3e7a30';
            px(X + cx, Y + top, L);
            [-1, 0, 1].forEach(function (d) { px(X + cx + d, Y + top + 1, d < 0 ? L : (d ? D : M)); px(X + cx + d, Y + top + 2, d < 0 ? M : D); });
            px(X + cx - 2, Y + top + 3, M); px(X + cx + 2, Y + top + 3, D); px(X + cx, Y + top + 3, M);
          });
        }
      }
    }
    return cv;
  }
  window.TerrainArt = { build: build };
})();
