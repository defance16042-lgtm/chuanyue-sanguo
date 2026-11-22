// 引擎：畫面（256x224 邏輯解析度、整數倍放大）、鍵盤輸入、場景堆疊、文字與面板繪製。
(function () {
  const W = 256, H = 224, T = 16;
  const FONT = '"Microsoft JhengHei","PingFang TC","Noto Sans CJK TC","Noto Sans CJK HK","Noto Sans CJK JP","Noto Sans TC","Heiti TC",sans-serif';
  const KEYS = {
    ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
    Enter: 'ok', z: 'ok', Z: 'ok', ' ': 'ok', Escape: 'cancel', x: 'cancel', X: 'cancel', Backspace: 'cancel'
  };
  const DIRS = ['up', 'down', 'left', 'right'];

  const E = { W, H, T, S: 3, stack: [], held: {}, hit: {}, dirStack: [], images: {}, time: 0 };

  E.init = function (canvasId) {
    E.canvas = document.getElementById(canvasId);
    E.ctx = E.canvas.getContext('2d');
    E.world = document.createElement('canvas');
    E.world.width = W; E.world.height = H;
    E.wctx = E.world.getContext('2d');
    E.wctx.imageSmoothingEnabled = false;
    E.resize();
    window.addEventListener('resize', E.resize);
    window.addEventListener('keydown', function (ev) {
      const a = KEYS[ev.key];
      if (!a) return;
      ev.preventDefault();
      if (ev.repeat) return;
      E.held[a] = true; E.hit[a] = true;
      if (DIRS.indexOf(a) >= 0) { E.dirStack = E.dirStack.filter(function (d) { return d !== a; }); E.dirStack.push(a); }
    });
    window.addEventListener('keydown', function (ev) {   // F：全螢幕
      if ((ev.key === 'f' || ev.key === 'F') && !ev.repeat) { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) { /* 不支援就算了 */ } }
    });
    window.addEventListener('keyup', function (ev) {
      const a = KEYS[ev.key];
      if (!a) return;
      E.held[a] = false;
      E.dirStack = E.dirStack.filter(function (d) { return d !== a; });
    });
    window.addEventListener('blur', function () { E.held = {}; E.dirStack = []; });
  };

  E.resize = function () {
    E.S = Math.max(1, Math.min(window.innerWidth / W, window.innerHeight / H));   // 依視窗大小自動放到最大（可以是小數倍）
    E.canvas.width = Math.round(W * E.S); E.canvas.height = Math.round(H * E.S);
    E.canvas.style.width = E.canvas.width + 'px'; E.canvas.style.height = E.canvas.height + 'px';
  };

  E.load = function (list) {
    return Promise.all(Object.keys(list).map(function (name) {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { E.images[name] = img; resolve(); };
        img.onerror = function () { reject(new Error('找不到圖檔：' + list[name])); };
        img.src = list[name];
      });
    }));
  };

  // 場景：{ update(dt), draw(wctx), drawUI(ctx) }；堆疊最上層才會 update，所有場景由下往上繪製。
  E.push = function (s) { E.stack.push(s); if (s.enter) s.enter(); };
  E.pop = function () { const s = E.stack.pop(); if (s && s.exit) s.exit(); };
  E.replaceAll = function (s) { E.stack = []; E.push(s); };
  E.top = function () { return E.stack[E.stack.length - 1]; };
  E.heldDir = function () { return E.dirStack.length ? E.dirStack[E.dirStack.length - 1] : null; };

  E.start = function () {
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(100, now - last); last = now; E.time += dt;
      const top = E.top();
      if (top && top.update) top.update(dt);
      E.hit = {};
      draw();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  function draw() {
    const wc = E.wctx, c = E.ctx;
    wc.setTransform(1, 0, 0, 1, 0, 0);
    wc.fillStyle = '#000'; wc.fillRect(0, 0, W, H);
    E.stack.forEach(function (s) { if (s.draw) s.draw(wc); });
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.drawImage(E.world, 0, 0, E.canvas.width, E.canvas.height);
    c.setTransform(E.S, 0, 0, E.S, 0, 0);
    E.stack.forEach(function (s) { if (s.drawUI) s.drawUI(c); });
  }

  // ---- 文字與面板（以邏輯座標繪製，放大後仍是向量字，維持清晰） ----
  E.text = function (c, str, x, y, o) {
    o = o || {};
    const size = o.size || 9;
    c.font = size + 'px ' + FONT;
    c.textBaseline = 'top';
    c.textAlign = o.align || 'left';
    c.fillStyle = 'rgba(0,0,0,0.75)';
    c.fillText(str, x + 0.6, y + 0.6);
    c.fillStyle = o.color || '#f4f4ff';
    c.fillText(str, x, y);
  };

  E.measure = function (c, str, size) {
    c.font = (size || 9) + 'px ' + FONT;
    return c.measureText(str).width;
  };

  E.wrap = function (c, str, size, maxW) {
    const lines = [];
    String(str).split('\n').forEach(function (para) {
      let line = '';
      Array.from(para).forEach(function (ch) {
        if (E.measure(c, line + ch, size) > maxW) { lines.push(line); line = ch; } else { line += ch; }
      });
      lines.push(line);
    });
    return lines;
  };

  E.panel = function (c, x, y, w, h) {
    c.fillStyle = 'rgba(12,16,48,0.94)'; c.fillRect(x, y, w, h);
    c.strokeStyle = '#e8e8f8'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    c.strokeStyle = '#4a5ab0'; c.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  };

  // 垂直選單；回傳目前選到的項目索引。
  E.menuList = function (c, items, sel, x, y, lineH, opt) {
    opt = opt || {};
    items.forEach(function (it, i) {
      const disabled = typeof it === 'object' && it.disabled;
      const label = typeof it === 'object' ? it.label : it;
      if (i === sel) E.text(c, '▶', x, y + i * lineH, { color: '#ffd668', size: opt.size });
      E.text(c, label, x + 10, y + i * lineH, { color: disabled ? '#8a8aa0' : (i === sel ? '#ffd668' : '#f4f4ff'), size: opt.size });
    });
  };

  window.Engine = E;
})();
