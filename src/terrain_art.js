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

  // ---------------------------------------------------------------- 高解析版（大地圖用，每格 32x32）
  function buildHD(map, tileAt) {
    const K = 32, w = map.tiles[0].length, h = map.tiles.length;
    const cv = document.createElement('canvas'); cv.width = w * K; cv.height = h * K;
    const c = cv.getContext('2d');
    const px = function (x, y, col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); };
    const rect = function (x, y, ww, hh, col) { c.fillStyle = col; c.fillRect(x, y, ww, hh); };
    const wat = function (x, y) { return isWater(tileAt(x, y)); };
    const groundCol = function (x, y) { return isSand(tileAt(x, y)) ? '#dec88e' : '#5e9e4c'; };
    const DK = '#1a3a80', MD = '#3c70c4', LT = '#74aaec';
    const R = 6;   // 圓角半徑
    // 轉角：角落 R×R 的範圍內，離圓心超出半徑的是岸，半徑內一圈是深色邊、再一圈亮邊
    function cornerOut(X, Y, sx, sy, gcol) {       // 凸角（水往外凸）
      for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
        const dx = (sx > 0 ? R - 1 - i : i) + 0.5, dy = (sy > 0 ? R - 1 - j : j) + 0.5, d = Math.hypot(R - dx, R - dy), x = sx > 0 ? X + K - R + i : X + i, y = sy > 0 ? Y + K - R + j : Y + j;
        if (d > R) px(x, y, gcol); else if (d > R - 1.6) px(x, y, DK); else if (d > R - 2.8) px(x, y, MD);
      }
    }
    function cornerIn(X, Y, sx, sy, gcol) {        // 凹角（兩邊是水、斜角是岸）：岸往水裡伸出一個圓
      const r = 5;
      for (let j = 0; j < r; j++) for (let i = 0; i < r; i++) {
        const d = Math.hypot(i + 0.5, j + 0.5), x = sx > 0 ? X + K - 1 - i : X + i, y = sy > 0 ? Y + K - 1 - j : Y + j;
        if (d < r - 1.8) px(x, y, gcol); else if (d < r - 0.6) px(x, y, DK); else if (d < r + 0.6) px(x, y, MD);
      }
    }
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const id = tileAt(tx, ty), X = tx * K, Y = ty * K;
        if (isWater(id)) {
          const n = wat(tx, ty - 1), s = wat(tx, ty + 1), wv = wat(tx - 1, ty), e = wat(tx + 1, ty);
          const deep = n && s && wv && e && wat(tx, ty - 2) && wat(tx, ty + 2) && wat(tx - 2, ty) && wat(tx + 2, ty);
          if (deep) { c.fillStyle = 'rgba(18,48,128,0.28)'; c.fillRect(X + 2, Y + 2, K - 4, K - 4); }
          // 岸邊：外深、中藍、內亮三層，每隔幾格有一點起伏（浪）
          const wave = function (i, t) { return (Math.sin((tx * K + i + t * 5) * 0.9) > 0.55) ? 1 : 0; };
          if (!n) { for (let i = 0; i < K; i++) { const o = wave(i, ty); rect(X + i, Y, 1, 2 + o, DK); px(X + i, Y + 2 + o, MD); px(X + i, Y + 3 + o, LT); } }
          if (!s) { for (let i = 0; i < K; i++) { const o = wave(i, ty + 3); rect(X + i, Y + K - 2 - o, 1, 2 + o, DK); px(X + i, Y + K - 3 - o, MD); px(X + i, Y + K - 4 - o, LT); } }
          if (!wv) { for (let i = 0; i < K; i++) { const o = wave(i, tx); rect(X, Y + i, 2 + o, 1, DK); px(X + 2 + o, Y + i, MD); px(X + 3 + o, Y + i, LT); } }
          if (!e) { for (let i = 0; i < K; i++) { const o = wave(i, tx + 3); rect(X + K - 2 - o, Y + i, 2 + o, 1, DK); px(X + K - 3 - o, Y + i, MD); px(X + K - 4 - o, Y + i, LT); } }
          if (!n && !wv) cornerOut(X, Y, -1, -1, groundCol(tx - 1, ty - 1)); if (!n && !e) cornerOut(X, Y, 1, -1, groundCol(tx + 1, ty - 1));
          if (!s && !wv) cornerOut(X, Y, -1, 1, groundCol(tx - 1, ty + 1)); if (!s && !e) cornerOut(X, Y, 1, 1, groundCol(tx + 1, ty + 1));
          if (n && wv && !wat(tx - 1, ty - 1)) cornerIn(X, Y, -1, -1, groundCol(tx - 1, ty - 1));
          if (n && e && !wat(tx + 1, ty - 1)) cornerIn(X, Y, 1, -1, groundCol(tx + 1, ty - 1));
          if (s && wv && !wat(tx - 1, ty + 1)) cornerIn(X, Y, -1, 1, groundCol(tx - 1, ty + 1));
          if (s && e && !wat(tx + 1, ty + 1)) cornerIn(X, Y, 1, 1, groundCol(tx + 1, ty + 1));
        } else if (id === 31) {
          const r = hash(tx, ty, 1);
          if (r < 0.15) {
            const f = FLOWERS[Math.floor(hash(tx, ty, 2) * FLOWERS.length)], ox = 6 + Math.floor(hash(tx, ty, 3) * 18), oy = 8 + Math.floor(hash(tx, ty, 4) * 17);
            const flower = function (fx, fy) {
              px(fx, fy + 2, '#2e6a30'); px(fx, fy + 3, '#2e6a30'); px(fx - 1, fy + 3, '#3e7e3a');
              px(fx, fy, f[0]); px(fx - 1, fy, f[1]); px(fx + 1, fy, f[1]); px(fx, fy - 1, f[1]); px(fx, fy + 1, f[1]);
            };
            flower(X + ox, Y + oy);
            if (hash(tx, ty, 12) < 0.6) flower(X + ox + 6, Y + oy + 3); if (hash(tx, ty, 13) < 0.4) flower(X + ox - 5, Y + oy + 5);
          } else if (r < 0.30) {
            const ox = 7 + Math.floor(hash(tx, ty, 5) * 17), oy = 12 + Math.floor(hash(tx, ty, 6) * 14);
            const blades = [[-4, -4], [-2, -6], [0, -7], [2, -6], [4, -4], [-1, -4], [1, -4]];
            blades.forEach(function (b, i) { const sx = Math.sign(b[0]); for (let k = 0; k <= -b[1]; k++) { const t = k / -b[1]; px(X + ox + Math.round(b[0] * t), Y + oy - k, t > 0.7 ? '#4a8e3e' : (t > 0.3 ? '#2e6a30' : '#265a2a')); } });
            if (hash(tx, ty, 8) < 0.3) { px(X + ox + 6, Y + oy - 5, '#7aa8f0'); px(X + ox + 6, Y + oy - 4, '#2e6a30'); px(X + ox + 5, Y + oy - 5, '#bcd4ff'); }
          }
        } else if (id === 20) {
          [[10, 3], [22, 14]].forEach(function (pk, i) {
            if (hash(tx, ty, 9 + i) >= 0.4) return;
            const cx = pk[0], top = pk[1], L = '#8ccc5c', M = '#5a9a3c', D = '#3a7430';
            [[0, 0, L], [-1, 1, L], [0, 1, M], [1, 1, D], [-2, 2, L], [-1, 2, M], [0, 2, M], [1, 2, D], [2, 2, D], [-3, 3, M], [-2, 3, M], [0, 3, D], [2, 3, D], [3, 3, D], [-1, 4, M], [1, 4, D]].forEach(function (d) { px(X + cx + d[0], Y + top + d[1], d[2]); });
          });
        }
      }
    }
    return cv;
  }

  window.TerrainArt = { build: build, buildHD: buildHD, HD_IDS: [1, 2, 3, 19, 20, 31, 32, 33, 34, 35, 45] };
})();
