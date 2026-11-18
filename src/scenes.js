// 場景：標題、地圖、對話、選單、狀態（含主角配點）、存讀檔。
(function () {
  const E = window.Engine, D = window.DATA, G = window.Game, Save = window.Save;
  const T = E.T, W = E.W, H = E.H;
  const MOVE_MS = 130, FADE_MS = 180;
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const FRAME0 = { down: 0, up: 2, left: 4, right: 6 };
  const GOLD = '#ffd668', GREY = '#8a8aa0';

  function drawSprite(c, row, dir, step, x, y) {
    c.drawImage(E.images.sprites, (FRAME0[dir] + (step ? 1 : 0)) * 16, row * 16, 16, 16, Math.round(x), Math.round(y), 16, 16);
  }
  function fmtTime(ms) {
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function startGame(spawn) {
    E.replaceAll(new MapScene(G.mapId, spawn || G.pos));
  }

  // ------------------------------------------------------------ 更新檢查
  // 兩種環境：
  //  ‧ Windows 安裝版（Electron）：背景自動下載，下載完成後在遊戲內按「重新啟動並安裝」。
  //  ‧ 瀏覽器版（雙擊 index.html）：從 GitHub 讀 update.json 比對版本，有新版就開啟下載頁。
  const Update = {
    state: 'idle',        // 瀏覽器版：idle / checking / latest / newer / error
    latest: '',
    notes: [],
    desk: null,           // 桌面版事件：{ status, message, percent }
    isDesktop: !!(window.desktopApp && window.desktopApp.onUpdateStatus),
    newer: function (a, b) {   // a 是否比 b 新
      const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
      for (let i = 0; i < 3; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0; }
      return false;
    },
    setDesktop: function (ev) { this.desk = ev; },
    // 統一的狀態：kind = idle / checking / latest / newer / downloading / downloaded / error
    info: function () {
      if (this.isDesktop && this.desk) {
        const d = this.desk, kind = { checking: 'checking', available: 'downloading', downloading: 'downloading', downloaded: 'downloaded', current: 'latest', error: 'error' }[d.status] || 'idle';
        return { kind: kind, text: d.message || '', percent: Math.max(0, Math.min(100, Number(d.percent) || 0)) };
      }
      const text = { idle: '尚未檢查更新。', checking: '正在檢查更新…', latest: '已是最新版本。', newer: '發現新版本 ' + this.latest + '！', error: '無法連線檢查更新。' }[this.state];
      return { kind: this.state, text: text, percent: 0 };
    },
    check: function () {
      if (this.isDesktop) {
        this.desk = { status: 'checking', message: '正在檢查更新…' };
        try { Promise.resolve(window.desktopApp.checkUpdate && window.desktopApp.checkUpdate()).catch(function () {}); } catch (e) { /* 忽略 */ }
        return;
      }
      if (this.state === 'checking') return;
      const self = this; this.state = 'checking';
      const repo = window.GAME_REPO || '';
      const ctl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
      fetch('https://raw.githubusercontent.com/' + repo + '/main/update.json?t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
        .then(function (j) {
          clearTimeout(timer);
          self.latest = String(j.version || '');
          self.notes = Array.isArray(j.notes) ? j.notes.map(String) : [];
          self.state = self.newer(self.latest, window.GAME_VERSION || '0') ? 'newer' : 'latest';
        })
        .catch(function () { clearTimeout(timer); self.state = 'error'; });
    },
    open: function () {
      const url = 'https://github.com/' + (window.GAME_REPO || '') + '/archive/refs/heads/main.zip';
      try { window.open(url, '_blank'); } catch (e) { /* 被擋住就算了 */ }
    },
    install: function () { if (this.isDesktop) window.desktopApp.installUpdate(); }
  };
  window.Updater = Update;

  // ------------------------------------------------------------ 更新畫面（遊戲內）
  class UpdateScene {
    constructor() { this.sel = 0; if (Update.info().kind === 'idle') Update.check(); }
    actions() {
      const k = Update.info().kind, a = [{ t: '檢查更新', f: function () { Update.check(); } }];
      if (k === 'downloaded') a.unshift({ t: '重新啟動並安裝', f: function () { Update.install(); } });
      else if (k === 'newer' && !Update.isDesktop) a.unshift({ t: '下載新版本', f: function () { Update.open(); } });
      a.push({ t: '返回', f: function () { E.pop(); } });
      return a;
    }
    update() {
      const a = this.actions();
      if (this.sel >= a.length) this.sel = a.length - 1;
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.up) this.sel = (this.sel + a.length - 1) % a.length;
      if (E.hit.down) this.sel = (this.sel + 1) % a.length;
      if (E.hit.ok) a[this.sel].f();
    }
    drawUI(c) {
      const inf = Update.info(), col = inf.kind === 'downloaded' || inf.kind === 'newer' ? GOLD : inf.kind === 'error' ? '#ff9a8a' : '#f4f4ff';
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      E.text(c, '遊戲更新', 20, 16, { size: 12, color: GOLD });
      E.text(c, '目前版本  ' + (window.GAME_VERSION || '?'), 20, 36, { size: 9 });
      const newest = Update.isDesktop ? (inf.kind === 'downloaded' || inf.kind === 'downloading' ? '已有新版本' : '－') : (Update.latest || '－');
      E.text(c, '最新版本  ' + newest, 20, 49, { size: 9 });
      E.wrap(c, inf.text, 8, 216).slice(0, 3).forEach(function (l, i) { E.text(c, l, 20, 66 + i * 10, { size: 8, color: col }); });
      if (inf.kind === 'downloading') {
        c.fillStyle = '#222a50'; c.fillRect(20, 100, 216, 8);
        c.fillStyle = '#8affa0'; c.fillRect(20, 100, Math.round(216 * inf.percent / 100), 8);
        E.text(c, Math.floor(inf.percent) + '%', 128, 111, { size: 7, align: 'center', color: GREY });
      }
      if (Update.notes.length && (inf.kind === 'newer' || inf.kind === 'downloaded' || inf.kind === 'downloading')) {
        E.text(c, '更新內容', 20, 118, { size: 8, color: GOLD });
        Update.notes.slice(0, 4).forEach(function (n, i) { E.text(c, '‧' + n, 20, 129 + i * 10, { size: 7, color: GREY }); });
      }
      const a = this.actions();
      E.menuList(c, a.map(function (x) { return x.t; }), this.sel, 150, 146, 14);
      E.text(c, Update.isDesktop ? '新版本會在背景自動下載，完成後按「重新啟動並安裝」。' : '瀏覽器版：下載新版本後，覆蓋原本的資料夾即可（存檔不會消失）。', 20, 205, { size: 6, color: GREY });
    }
  }

  // ------------------------------------------------------------ 標題
  class TitleScene {
    constructor() { this.sel = 0; this.prompted = false; Update.check(); }
    label() {
      const k = Update.info().kind;
      return k === 'downloaded' ? '重新啟動更新' : (k === 'newer' || k === 'downloading') ? '更新（有新版）' : '檢查更新';
    }
    update() {
      if (E.hit.up) this.sel = (this.sel + 2) % 3;
      if (E.hit.down) this.sel = (this.sel + 1) % 3;
      // 桌面版的新版本下載完成：自動跳出更新畫面（只提示一次）
      if (!this.prompted && Update.isDesktop && Update.info().kind === 'downloaded') { this.prompted = true; E.push(new UpdateScene()); return; }
      if (E.hit.ok) {
        if (this.sel === 0) { G.fresh(); startGame(); }
        else if (this.sel === 1) E.push(new SaveScene('load'));
        else E.push(new UpdateScene());
      }
    }
    draw(wc) {
      const g = wc.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#3a2048');
      wc.fillStyle = g; wc.fillRect(0, 0, W, H);
      wc.fillStyle = '#ffe8a8';
      [[30, 24], [200, 40], [120, 18], [60, 70], [230, 90], [170, 64]].forEach(function (s) { wc.fillRect(s[0], s[1], 1, 1); });
      drawSprite(wc, 0, 'down', Math.floor(E.time / 500) % 2, 120, 96);
    }
    drawUI(c) {
      E.text(c, '穿越三國', W / 2, 34, { size: 22, align: 'center', color: GOLD });
      E.text(c, '諸葛貓妖傳', W / 2, 62, { size: 16, align: 'center' });
      E.panel(c, 80, 124, 96, 60);
      E.menuList(c, ['開始遊戲', '讀取存檔', this.label()], this.sel, 90, 132, 16);
      const inf = Update.info(), hot = inf.kind === 'newer' || inf.kind === 'downloaded' || inf.kind === 'downloading';
      const msg = { idle: '', checking: '正在檢查更新…', latest: '已是最新版', newer: '有新版本 ' + Update.latest + '！到「更新」查看', downloading: '新版本下載中 ' + Math.floor(inf.percent) + '%', downloaded: '新版本已下載完成！', error: '無法連線檢查更新' }[inf.kind] || '';
      E.text(c, msg, W / 2, 191, { size: 7, align: 'center', color: hot ? GOLD : GREY });
      E.text(c, '戰鬥測試版 ' + (window.GAME_VERSION || '') + '　方向鍵/WASD 移動　Z 確認　X 取消', W / 2, 206, { size: 7, align: 'center', color: GREY });
    }
  }

  // ------------------------------------------------------------ 存檔／讀檔
  class SaveScene {
    constructor(mode) { this.mode = mode; this.sel = 0; this.msg = ''; }
    update() {
      if (E.hit.up) this.sel = (this.sel + Save.SLOTS - 1) % Save.SLOTS;
      if (E.hit.down) this.sel = (this.sel + 1) % Save.SLOTS;
      if (E.hit.cancel) { E.pop(); return; }
      if (!E.hit.ok) return;
      if (this.mode === 'save') {
        this.msg = Save.write(this.sel, G.snapshot()) ? '已存檔到欄位 ' + (this.sel + 1) : '存檔失敗：瀏覽器不允許儲存資料';
      } else {
        const d = Save.read(this.sel);
        if (!d) this.msg = '這個欄位沒有存檔';
        else if (G.restore(d)) startGame(G.pos);
        else this.msg = '存檔已損毀或版本不符，無法讀取';
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(16, 16, 224, 192);
      E.panel(c, 16, 16, 224, 192);
      E.text(c, this.mode === 'save' ? '存檔' : '讀取', 28, 24, { size: 11, color: GOLD });
      for (let i = 0; i < Save.SLOTS; i++) {
        const y = 48 + i * 40, d = Save.read(i);
        if (i === this.sel) { c.fillStyle = 'rgba(255,214,104,0.12)'; c.fillRect(24, y - 4, 208, 36); }
        E.text(c, (i === this.sel ? '▶ ' : '　') + '欄位 ' + (i + 1), 28, y, { color: i === this.sel ? GOLD : '#f4f4ff' });
        if (d && d.party && d.party[0] && D.maps[d.mapId]) {
          E.text(c, D.maps[d.mapId].name + '　Lv' + d.party[0].level + '　' + fmtTime(d.playtime || 0), 48, y + 12, { size: 8 });
          E.text(c, new Date(d.savedAt).toLocaleString('zh-TW', { hour12: false }), 48, y + 22, { size: 7, color: GREY });
        } else {
          E.text(c, '（空）', 48, y + 14, { size: 8, color: GREY });
        }
      }
      E.text(c, this.msg || 'Z 選擇　X 返回', 28, 184, { size: 8, color: this.msg ? GOLD : GREY });
    }
  }

  // ------------------------------------------------------------ 對話
  class DialogScene {
    constructor(lines, done) {
      this.lines = lines; this.i = 0; this.shown = 0; this.done = done;
      this.choosing = false; this.choiceSel = 0; this.acts = [];
    }
    line() { return this.lines[this.i]; }
    next() {
      const l = this.line();
      if (l.set) Object.assign(G.flags, l.set);
      if (l.act) this.acts.push(l.act);
      this.i++; this.shown = 0; this.choosing = false;
      if (this.i >= this.lines.length) {
        E.pop(); if (this.done) this.done();
        const top = E.top(), acts = this.acts;
        if (top && top.runAct) acts.forEach(function (a) { top.runAct(a); });
      }
    }
    update(dt) {
      const l = this.line(), full = Array.from(l.text).length;
      if (!this.choosing) {
        this.shown = Math.min(full, this.shown + dt * 0.04);
        if (E.hit.ok) {
          if (this.shown < full) this.shown = full;
          else if (l.choices) { this.choosing = true; this.choiceSel = 0; }
          else this.next();
        }
      } else {
        const n = l.choices.length;
        if (E.hit.up) this.choiceSel = (this.choiceSel + n - 1) % n;
        if (E.hit.down) this.choiceSel = (this.choiceSel + 1) % n;
        if (E.hit.ok) {
          const ch = l.choices[this.choiceSel];
          Object.assign(G.flags, ch.set || {});
          if (ch.act) this.acts.push(ch.act);
          this.next();
        }
      }
    }
    drawUI(c) {
      const l = this.line();
      E.panel(c, 8, 152, 240, 64);
      if (l.speaker) {
        // 說話者有大頭像（主角、劉關張、助戰角色）就顯示在對話框上方
        const sc = Object.keys(D.characters).map(function (k) { return D.characters[k]; }).find(function (x) { return x.name === l.speaker && typeof x.portrait === 'number'; });
        const pi = sc ? sc.portrait : (D.npcPortraits || {})[l.speaker];
        if (typeof pi === 'number' && E.images.portraits) {
          c.fillStyle = '#fff'; c.fillRect(10, 88, 52, 52); c.fillStyle = '#10204a'; c.fillRect(11, 89, 50, 50);
          c.drawImage(E.images.portraits, pi * 48, 0, 48, 48, 12, 90, 48, 48);
        }
        const w = E.measure(c, l.speaker, 9) + 16;
        E.panel(c, 14, 142, w, 16);
        E.text(c, l.speaker, 22, 145, { color: GOLD });
      }
      let left = Math.floor(this.shown);
      E.wrap(c, l.text, 9, 220).slice(0, 4).forEach(function (line, k) {
        const n = Array.from(line).length;
        E.text(c, Array.from(line).slice(0, Math.max(0, left)).join(''), 18, 162 + k * 12);
        left -= n;
      });
      const full = this.shown >= Array.from(l.text).length;
      if (full && !l.choices && Math.floor(E.time / 350) % 2 === 0) E.text(c, '▼', 232, 204, { size: 8, color: GOLD });
      if (this.choosing) {
        const h = l.choices.length * 14 + 12;
        E.panel(c, 150, 148 - h, 98, h);
        E.menuList(c, l.choices.map(function (x) { return x.label; }), this.choiceSel, 158, 154 - h, 14);
      }
    }
  }

  // ------------------------------------------------------------ 選單
  class MenuScene {
    constructor() { this.sel = 0; }
    update() {
      const items = 6;
      if (E.hit.up) this.sel = (this.sel + items - 1) % items;
      if (E.hit.down) this.sel = (this.sel + 1) % items;
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.ok) {
        if (this.sel === 0) E.push(new StatusScene());
        else if (this.sel === 1) E.push(new EquipScene());
        else if (this.sel === 2) E.push(new ItemScene());
        else if (this.sel === 3) E.push(new SaveScene('load'));
        else if (this.sel === 4) E.replaceAll(new TitleScene());
        else E.pop();
      }
    }
    drawUI(c) {
      E.panel(c, 168, 8, 80, 140);
      E.menuList(c, ['角色資料', '裝備', '道具', '讀取', '回標題', '關閉'], this.sel, 178, 18, 16);
      E.text(c, '金 ' + (G.gold || 0), 178, 118, { size: 9, color: GOLD });
      E.text(c, '存檔請到', 178, 114, { size: 7, color: GREY });
      E.text(c, '藍色水晶旁', 178, 122, { size: 7, color: GREY });
    }
  }

  // ------------------------------------------------------------ 道具（地圖上使用）
  class ItemScene {
    constructor() { this.sel = 0; this.target = -1; this.msg = ''; }
    list() { const inv = G.items || {}, B = D.battle; return Object.keys(B.items).filter(function (k) { return inv[k] > 0 && !B.items[k].escape; }); }
    update() {
      const list = this.list();
      if (this.target < 0) {
        if (!list.length) { if (E.hit.cancel || E.hit.ok) E.pop(); return; }
        this.sel = Math.min(this.sel, list.length - 1);
        if (E.hit.up) this.sel = (this.sel + list.length - 1) % list.length;
        if (E.hit.down) this.sel = (this.sel + 1) % list.length;
        if (E.hit.cancel) { E.pop(); return; }
        if (E.hit.ok) { this.target = 0; this.msg = ''; }
      } else {
        const n = G.party.length;
        if (E.hit.up) this.target = (this.target + n - 1) % n;
        if (E.hit.down) this.target = (this.target + 1) % n;
        if (E.hit.cancel) { this.target = -1; return; }
        if (E.hit.ok) {
          const k = list[this.sel], it = D.battle.items[k], m = G.party[this.target];
          if (it.hp && m.hp > 0 && m.hp < m.hpMax) { m.hp = Math.min(m.hpMax, m.hp + it.hp); G.items[k]--; this.msg = m.name + '回復了兵力'; }
          else if (it.tp && m.tp < m.tpMax) { m.tp = Math.min(m.tpMax, m.tp + it.tp); G.items[k]--; this.msg = m.name + '回復了戰術點'; }
          else this.msg = '沒有效果';
          if (!(G.items[k] > 0)) this.target = -1;
        }
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(16, 16, 224, 192);
      E.panel(c, 16, 16, 224, 192);
      E.text(c, '道具', 28, 24, { size: 11, color: GOLD });
      const list = this.list(), B = D.battle;
      if (!list.length) E.text(c, '沒有可以在這裡使用的道具', 32, 52, { color: GREY });
      list.forEach(function (k, i) {
        const y = 48 + i * 16, sel = i === this.sel && this.target < 0;
        E.text(c, (sel ? '▶ ' : '　') + B.items[k].name, 32, y, { color: sel ? GOLD : '#f4f4ff' });
        E.text(c, '×' + G.items[k], 110, y, { color: sel ? GOLD : '#f4f4ff' });
        E.text(c, B.items[k].desc, 140, y + 1, { size: 8, color: GREY });
      }, this);
      if (this.target >= 0) {
        G.party.forEach(function (m, i) {
          const y = 120 + i * 18, sel = i === this.target;
          E.text(c, (sel ? '▶ ' : '　') + m.name, 32, y, { color: sel ? GOLD : '#f4f4ff' });
          E.text(c, '兵 ' + m.hp + '/' + m.hpMax + '　計 ' + m.tp + '/' + m.tpMax, 100, y + 1, { size: 8, color: sel ? GOLD : '#f4f4ff' });
        }, this);
      }
      E.text(c, this.msg || '金 ' + (G.gold || 0) + '　Z 選擇　X 返回', 32, 194, { size: 8, color: this.msg ? GOLD : GREY });
    }
  }

  // ------------------------------------------------------------ 角色資料（唯讀）
  const STAT_ROWS = [['pow', '攻擊力'], ['def', '防禦力'], ['atk', '武力'], ['int', '智力'], ['spd', '速度'], ['lead', '統率'], ['luck', '運氣'], ['grd', '守備']];
  function statCell(c, m, key, label, x, y, col) {
    const base = key === 'def' ? m.def : key === 'pow' ? 2 * G.eff(m, 'atk') : (m[key] || 0), b = key === 'pow' ? G.bonus(m, 'pow') : G.bonus(m, key);
    E.text(c, label, x, y, { color: col || '#f4f4ff' });
    E.text(c, String(base + b), x + 34, y, { color: b > 0 ? '#8affa0' : b < 0 ? '#ff7a6a' : (col || '#f4f4ff') });
  }
  function drawFace(c, m, x, y) {
    if (G.portraitOf(m) >= 0 && E.images.portraits) c.drawImage(E.images.portraits, G.portraitOf(m) * 48, 0, 48, 48, x, y, 48, 48);
    else c.drawImage(E.images.sprites, 0, m.sprite * 16, 16, 16, x + 16, y + 16, 16, 16);
  }
  class StatusScene {
    constructor() { this.idx = 0; }
    update() {
      if (E.hit.cancel) { E.pop(); return; }
      const n = G.party.length;
      if (n > 1) {
        if (E.hit.left) this.idx = (this.idx + n - 1) % n;
        if (E.hit.right) this.idx = (this.idx + 1) % n;
      }
    }
    drawUI(c) {
      const m = G.party[this.idx], ch = D.characters[m.id] || {};
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      drawFace(c, m, 196, 16);
      E.text(c, m.name + (m.guest ? '（助戰）' : ''), 20, 16, { size: 12, color: GOLD });
      E.text(c, (ch.zi ? '字' + ch.zi + '　' : '') + (ch.title || ''), 20, 32, { size: 8, color: GREY });
      E.text(c, '職類 ' + (ch.cls || '－') + '　武器種類 ' + (ch.weapon || '－'), 20, 44, { size: 8 });
      E.text(c, 'Lv ' + m.level + '　經驗 ' + m.exp + ' / 下一級 ' + window.BattleLogic.expFor(m.level + 1), 20, 58, { size: 8 });
      E.text(c, '兵力 ' + m.hp + ' / ' + m.hpMax + '　戰術點 ' + m.tp + ' / ' + m.tpMax, 20, 70, { size: 8 });
      STAT_ROWS.forEach(function (r, i) { statCell(c, m, r[0], r[1], 20 + (i % 2) * 96, 82 + Math.floor(i / 2) * 12); });
      if (ch.trait) E.text(c, '特性：' + ch.trait.name + '（' + ch.trait.desc + '）', 20, 141, { size: 8, color: GOLD });
      const sk = window.BattleLogic.skillsFor(m, G.flags).map(function (x) { return x.name; });
      E.text(c, '計謀：' + (sk.join('、') || '無'), 20, 151, { size: 8 });
      const eq = m.equip || {};
      E.text(c, '地形：' + Object.keys(D.terrainNames).map(function (k) { return D.terrainNames[k] + ((ch.terrain && ch.terrain[k]) || 'B'); }).join('　'), 20, 131, { size: 8 });
      E.text(c, '裝備：' + Object.keys(D.slots).map(function (k) { return eq[k] ? D.equipment[eq[k]].name : '－'; }).join(' / '), 20, 161, { size: 7, color: GREY });
      if (ch.bio) E.wrap(c, ch.bio, 7, 216).slice(0, 3).forEach(function (l, i) { E.text(c, l, 20, 171 + i * 9, { size: 7, color: GREY }); });
      E.text(c, (G.party.length > 1 ? '左右換人　' : '') + 'X 返回　（升級時能力自動隨機成長）', 20, 204, { size: 7, color: GREY });
    }
  }

  // ------------------------------------------------------------ 裝備
  class EquipScene {
    constructor() { this.idx = 0; this.slot = 0; this.mode = 'slot'; this.sel = 0; }
    slots() { return Object.keys(D.slots); }
    cands() {
      const slot = this.slots()[this.slot], m = G.party[this.idx];
      const out = Object.keys(G.equipInv).filter(function (id) { return G.equipInv[id] > 0 && D.equipment[id].slot === slot && G.canEquip(m, id); });
      return out;
    }
    update() {
      const m = G.party[this.idx], n = G.party.length, ns = this.slots().length;
      if (this.mode === 'slot') {
        if (E.hit.cancel) { E.pop(); return; }
        if (E.hit.up) this.slot = (this.slot + ns - 1) % ns;
        if (E.hit.down) this.slot = (this.slot + 1) % ns;
        if (n > 1 && E.hit.left) this.idx = (this.idx + n - 1) % n;
        if (n > 1 && E.hit.right) this.idx = (this.idx + 1) % n;
        if (E.hit.ok) { this.mode = 'pick'; this.sel = 0; }
      } else {
        const list = this.cands(), total = list.length + 1;   // 最後一項＝卸下
        if (E.hit.cancel) { this.mode = 'slot'; return; }
        if (E.hit.up) this.sel = (this.sel + total - 1) % total;
        if (E.hit.down) this.sel = (this.sel + 1) % total;
        if (E.hit.ok) {
          const slot = this.slots()[this.slot];
          if (this.sel < list.length) G.equip(m, slot, list[this.sel]); else G.equip(m, slot, null);
          this.mode = 'slot';
        }
      }
    }
    drawUI(c) {
      const m = G.party[this.idx], slots = this.slots();
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      E.text(c, m.name + ' 的裝備', 20, 16, { size: 11, color: GOLD });
      const eq = m.equip || {};
      slots.forEach(function (k, i) {
        const sel = i === this.slot, y = 36 + i * 14, it = eq[k] && D.equipment[eq[k]];
        E.text(c, (sel ? '▶ ' : '　') + D.slots[k], 20, y, { size: 9, color: sel ? GOLD : '#f4f4ff' });
        E.text(c, it ? it.name : '－', 68, y, { size: 9, color: sel ? GOLD : '#f4f4ff' });
      }, this);
      STAT_ROWS.forEach(function (r, i) { statCell(c, m, r[0], r[1], 150, 34 + i * 11, '#f4f4ff'); });
      if (this.mode === 'pick') {
        const list = this.cands(), slot = slots[this.slot], cur = eq[slot] && D.equipment[eq[slot]];
        E.text(c, '背包（' + D.slots[slot] + '）', 20, 112, { size: 8, color: GOLD });
        const rows = list.map(function (id) { return { id: id, name: D.equipment[id].name + ' ×' + G.equipInv[id] }; }).concat([{ id: null, name: '卸下' }]);
        const top = Math.max(0, Math.min(this.sel - 3, rows.length - 6));
        rows.slice(top, top + 6).forEach(function (r, k) {
          const i = top + k, sel = i === this.sel, y = 124 + k * 11;
          E.text(c, (sel ? '▶ ' : '　') + r.name, 20, y, { size: 8, color: sel ? GOLD : '#f4f4ff' });
        }, this);
        // 預覽：與目前裝備的能力差
        const pick = rows[this.sel], nw = pick && pick.id ? D.equipment[pick.id] : null;
        const diffs = [];
        STAT_ROWS.forEach(function (r) { const d = ((nw && nw.mods[r[0]]) || 0) - ((cur && cur.mods[r[0]]) || 0); if (d) diffs.push({ t: r[1] + (d > 0 ? '+' : '') + d, up: d > 0 }); });
        diffs.forEach(function (d, i) { E.text(c, d.t, 150, 124 + i * 11, { size: 8, color: d.up ? '#8affa0' : '#ff7a6a' }); });
        if (nw) E.text(c, (nw.wtype ? '【' + nw.wtype + '】' : '') + nw.desc, 20, 192, { size: 7, color: GREY });
        E.text(c, 'Z 裝上　X 返回', 150, 196, { size: 7, color: GREY });
      } else {
        const inv = Object.keys(G.equipInv).filter(function (id) { return G.equipInv[id] > 0; }).length;
        E.text(c, '上下選欄位　Z 更換　' + (G.party.length > 1 ? '左右換人　' : '') + 'X 返回', 20, 196, { size: 7, color: GREY });
        E.text(c, '背包裡有 ' + inv + ' 種裝備', 20, 112, { size: 8, color: GREY });
      }
    }
  }

  // ------------------------------------------------------------ 裝備店
  class ShopScene {
    constructor(shopId) { this.ids = D.shops[shopId] || []; this.title = (D.shopNames && D.shopNames[shopId]) || '貨攤'; this.sel = 0; this.msg = ''; }
    update() {
      const n = this.ids.length;
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.up) this.sel = (this.sel + n - 1) % n;
      if (E.hit.down) this.sel = (this.sel + 1) % n;
      if (E.hit.ok) {
        const id = this.ids[this.sel], it = D.equipment[id];
        if ((G.gold || 0) < it.price) this.msg = '金錢不足。';
        else { G.gold -= it.price; G.addGear(id); this.msg = '買了' + it.name + '，到「裝備」裡裝上。'; }
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      E.text(c, this.title, 20, 16, { size: 11, color: GOLD });
      const top = Math.max(0, Math.min(this.sel - 5, this.ids.length - 11));
      this.ids.slice(top, top + 11).forEach(function (id, k) {
        const i = top + k, it = D.equipment[id], sel = i === this.sel, y = 34 + k * 13, col = sel ? GOLD : '#f4f4ff';
        E.text(c, (sel ? '▶ ' : '　') + it.name + (it.wtype ? '(' + it.wtype + ')' : ''), 20, y, { size: 8, color: col });
        E.text(c, it.price + '金', 90, y, { size: 8, color: col });
        E.text(c, Object.keys(it.mods).map(function (k2) { return ({ pow: '攻', atk: '武', int: '智', def: '防', spd: '速', lead: '統', luck: '運', grd: '守' })[k2] + (it.mods[k2] > 0 ? '+' : '') + it.mods[k2]; }).join(' '), 130, y, { size: 8, color: col });
      }, this);
      const it = D.equipment[this.ids[this.sel]];
      E.text(c, this.msg || it.desc, 20, 184, { size: 8, color: this.msg ? GOLD : GREY });
      E.text(c, '持有金 ' + (G.gold || 0) + '　Z 購買　X 離開', 20, 200, { size: 7, color: GREY });
    }
  }

  // ------------------------------------------------------------ 地圖
  class MapScene {
    constructor(mapId, spawn) { this.fade = null; this.loadMap(mapId, spawn); }
    loadMap(mapId, spawn) {
      const m = D.maps[mapId];
      this.mapId = mapId; this.map = m; this.w = m.tiles[0].length; this.h = m.tiles.length;
      this.npcs = m.npcs.map(function (n) { return Object.assign({}, n); });
      spawn = spawn || m.start;
      this.p = { x: spawn.x, y: spawn.y, dir: spawn.dir || 'down', moving: false, t: 0, tx: 0, ty: 0, step: 0 };
      this.banner = 2000; this.evCheck = true;
      G.mapId = mapId; this.syncPos();
    }
    syncPos() { G.pos = { x: this.p.x, y: this.p.y, dir: this.p.dir }; }
    tileAt(x, y) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
      return D.legend[this.map.tiles[y][x]];
    }
    terrainHere() { return D.terrainOf[this.tileAt(this.p.x, this.p.y)] || 'plain'; }
    visible(n) { return !(n.hideIf && G.flags[n.hideIf]) && !(n.showIf && !G.flags[n.showIf]); }
    npcAt(x, y) { return this.npcs.find(function (n) { return n.x === x && n.y === y && this.visible(n); }, this); }
    objAt(x, y) { return this.map.objects.find(function (o) { return o.x === x && o.y === y; }); }
    blocked(x, y) {
      const t = this.tileAt(x, y);
      return t < 0 || D.solidTiles.indexOf(t) >= 0 || !!this.npcAt(x, y) || !!this.objAt(x, y);
    }
    interact() {
      const p = this.p, v = DIRV[p.dir], tx = p.x + v[0], ty = p.y + v[1];
      const npc = this.npcAt(tx, ty), obj = this.objAt(tx, ty);
      if (npc) {
        npc.dir = OPP[p.dir];
        const key = npc.alt && G.flags[npc.alt.flag] ? npc.alt.dialogue : npc.dialogue;
        E.push(new DialogScene(D.dialogue[key]));
      }
      else if (obj && obj.type === 'save') E.push(new SaveScene('save'));
      else {
        const sign = (this.map.signs || []).find(function (k) { return k.x === tx && k.y === ty; });
        if (sign) E.push(new DialogScene(D.dialogue[sign.dialogue]));
      }
    }
    arrive() {
      const p = this.p;
      const w = this.map.warps.find(function (k) { return k.x === p.x && k.y === p.y; });
      if (w && w.need && !G.flags[w.need]) {      // 條件未達成：不能過去，退回一格
        if (w.deny) E.push(new DialogScene(D.dialogue[w.deny]));
        p.x = w.bx !== undefined ? w.bx : p.x; p.y = w.by !== undefined ? w.by : p.y - 1; p.dir = 'up';
      }
      else if (w) this.fade = { phase: 'out', t: 0, warp: w };
      else if (this.map.encounter) this.stepEncounter();
      this.syncPos();
    }
    update(dt) {
      G.playtime += dt;
      if (this.banner > 0) this.banner -= dt;
      const f = this.fade;
      if (f) {
        f.t += dt;
        if (f.t >= FADE_MS) {
          if (f.phase === 'out') {
            this.loadMap(f.warp.to, { x: f.warp.tx, y: f.warp.ty, dir: f.warp.dir });
            this.fade = { phase: 'in', t: 0 };
          } else this.fade = null;
        }
        return;
      }
      const p = this.p;
      if (p.moving) {
        p.t += dt / MOVE_MS;
        if (p.t < 1) return;
        p.x = p.tx; p.y = p.ty; p.moving = false; p.t = 0; p.step ^= 1;
        this.arrive();
        if (this.fade) return;
      }
      if (this.evCheck) {   // 進入地圖時的劇情事件：條件達成且還沒看過才觸發
        this.evCheck = false;
        const ev = (this.map.events || []).find(function (e) {
          return !G.flags[e.once] && (e.need || []).every(function (f) { return G.flags[f]; });
        });
        if (ev) { E.push(new DialogScene(D.dialogue[ev.dialogue])); return; }
      }
      if (E.hit.cancel) { E.push(new MenuScene()); return; }
      if (E.hit.ok) { this.interact(); return; }
      const d = E.heldDir();
      if (d) {
        p.dir = d;
        const v = DIRV[d], nx = p.x + v[0], ny = p.y + v[1];
        if (!this.blocked(nx, ny)) { p.moving = true; p.t = 0; p.tx = nx; p.ty = ny; }
        this.syncPos();
      }
    }
    // ---- 遇敵與劇情動作 ----
    stepEncounter() {
      const enc = this.map.encounter;
      this.steps = (this.steps || 0) + 1;
      if (this.steps < (enc.minSteps || 4) || Math.random() >= enc.rate) return;
      this.steps = 0;
      const groups = D.battle.groups[enc.group], g = groups[Math.floor(Math.random() * groups.length)];
      this.startBattle(g, false);
    }
    startBattle(group, boss) {
      const self = this;
      this.hidden = true;
      E.push(new Scenes.Battle(group, { boss: !!boss, bg: this.map.battleBg, terrain: this.terrainHere(), fire: boss && boss.fire, onEnd: function (r) { self.hidden = false; self.afterBattle(r, boss); } }));
    }
    afterBattle(r, boss) {
      if (r === 'lose') {
        G.gold = Math.floor((G.gold || 0) / 2);
        G.party.forEach(function (m) { m.hp = m.hpMax; m.tp = m.tpMax; });
        const home = this.map.home || { map: 'zhuoxian' };
        this.loadMap(home.map, D.maps[home.map].start);
        E.push(new DialogScene(D.dialogue.lose_after));
      } else if (r === 'win' && boss) {
        const info = typeof boss === 'object' ? boss : {};
        G.flags[info.flag || 'boss_down'] = true;
        E.push(new DialogScene(D.dialogue[info.after || 'boss_after']));
      }
    }
    say(text) { E.push(new DialogScene([{ speaker: '', text: text }])); }
    runAct(a) {
      // 獎勵類動作可以和其他動作寫在同一個 act 裡
      if (a.gold) G.gold = (G.gold || 0) + a.gold;
      if (a.gear) a.gear.forEach(function (id) { G.addGear(id); });
      if (a.recruit) {
        if (G.flags['recruited_' + a.recruit]) return;
        const m = G.makeMember(a.recruit), lv = G.party[0].level;
        if (G.party.length >= 5) { this.say('隊伍已滿（最多 5 人）。'); return; }
        if (lv > 1) window.BattleLogic.gainExp(m, window.BattleLogic.expFor(lv));
        m.hp = m.hpMax; m.tp = m.tpMax;
        G.party.push(m); G.flags['recruited_' + a.recruit] = true;
        this.say(m.name + '加入了隊伍！');
      } else if (a.guest) {
        if (G.flags['guest_' + a.guest] || G.party.length >= 5) return;
        const m = G.makeMember(a.guest), lv = G.party[0].level;
        if (lv > 1) window.BattleLogic.gainExp(m, window.BattleLogic.expFor(lv));
        m.hp = m.hpMax; m.tp = m.tpMax;
        G.party.push(m); G.flags['guest_' + a.guest] = true;
        this.say(m.name + '助戰，暫時加入了隊伍！（劇情結束就會離隊）');
      } else if (a.leave) {
        const k = G.party.findIndex(function (m) { return m.id === a.leave; });
        if (k > 0) {
          const m = G.party.splice(k, 1)[0];
          Object.keys(m.equip || {}).forEach(function (s) { G.addGear(m.equip[s]); });   // 裝備退回背包
          this.say(m.name + '離隊了。（身上的裝備已放回背包）');
        }
      } else if (a.item) {
        if (a.once && G.flags[a.once]) return;
        if (a.once) G.flags[a.once] = true;
        G.items[a.item] = (G.items[a.item] || 0) + (a.n || 1);
      } else if (a.shop) {
        E.push(new ShopScene(a.shop));
      } else if (a.rest) {
        const price = D.battle.restPrice;
        if ((G.gold || 0) < price) { this.say('金錢不足（需要 ' + price + ' 金）'); return; }
        G.gold -= price;
        G.party.forEach(function (m) { m.hp = m.hpMax; m.tp = m.tpMax; });
        this.say('好好睡了一覺，兵力與戰術點全部恢復了。（-' + price + '金）');
      } else if (a.buy) {
        const it = D.battle.items[a.buy];
        if ((G.gold || 0) < it.price) { this.say('金錢不足。'); return; }
        G.gold -= it.price; G.items[a.buy] = (G.items[a.buy] || 0) + 1;
        this.say('買了' + it.name + '。（-' + it.price + '金，剩 ' + G.gold + '金）');
      } else if (a.battle) {
        const isBoss = a.battle === 'boss' || !!a.flag;
        this.startBattle(D.battle.groups[a.battle][0], isBoss ? a : false);
      }
    }
    camera() {
      const p = this.p, mw = this.w * T, mh = this.h * T;
      let px = p.x * T, py = p.y * T;
      if (p.moving) { px += (p.tx - p.x) * T * p.t; py += (p.ty - p.y) * T * p.t; }
      const clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
      return {
        x: mw <= W ? Math.round((mw - W) / 2) : clamp(Math.round(px + 8 - W / 2), 0, mw - W),
        y: mh <= H ? Math.round((mh - H) / 2) : clamp(Math.round(py + 8 - H / 2), 0, mh - H),
        px: px, py: py
      };
    }
    draw(wc) {
      const cam = this.camera(), self = this;
      if (this.hidden) return;
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const sx = x * T - cam.x, sy = y * T - cam.y;
          if (sx < -T || sy < -T || sx > W || sy > H) continue;
          wc.drawImage(E.images.tiles, this.tileAt(x, y) * 16, 0, 16, 16, sx, sy, 16, 16);
        }
      }
      const items = [];
      this.npcs.forEach(function (n) {
        if (!self.visible(n)) return;
        items.push({ y: n.y * T, draw: function () { drawSprite(wc, n.sprite, n.dir, 0, n.x * T - cam.x, n.y * T - cam.y); } });
      });
      this.map.objects.forEach(function (o) {
        items.push({ y: o.y * T, draw: function () {
          wc.drawImage(E.images.objects, (Math.floor(E.time / 450) % 2) * 16, 0, 16, 16, o.x * T - cam.x, o.y * T - cam.y, 16, 16);
        } });
      });
      items.push({ y: cam.py, draw: function () {
        drawSprite(wc, 0, self.p.dir, self.p.moving ? self.p.step ^ 1 : 0, cam.px - cam.x, cam.py - cam.y);
      } });
      items.sort(function (a, b) { return a.y - b.y; }).forEach(function (i) { i.draw(); });
    }
    drawUI(c) {
      if (this.hidden) return;
      if (this.banner > 0) {
        const w = E.measure(c, this.map.name, 10) + 24;
        E.panel(c, Math.round((W - w) / 2), 6, w, 20);
        E.text(c, this.map.name, W / 2, 11, { size: 10, align: 'center' });
      }
      if (this.fade) {
        const a = Math.min(1, this.fade.t / FADE_MS);
        c.fillStyle = 'rgba(0,0,0,' + (this.fade.phase === 'out' ? a : 1 - a) + ')';
        c.fillRect(0, 0, W, H);
      }
    }
  }

  window.Updater = Update;
  window.Scenes = { Title: TitleScene, Map: MapScene, Dialog: DialogScene, Menu: MenuScene, Status: StatusScene, Save: SaveScene, Item: ItemScene, Equip: EquipScene, Shop: ShopScene };
})();
