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
      E.text(c, 'v' + (window.GAME_VERSION || '') + '　方向鍵/WASD 移動　Z 確認　X 取消', W / 2, 206, { size: 7, align: 'center', color: GREY });
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
      const items = 10;
      if (E.hit.up) this.sel = (this.sel + items - 1) % items;
      if (E.hit.down) this.sel = (this.sel + 1) % items;
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.ok) {
        const k = this.sel;
        if (k === 0) E.push(new StatusScene());
        else if (k === 1) E.push(new FormationScene());
        else if (k === 2) E.push(new BattleFormScene());
        else if (k === 3) E.push(new EquipScene());
        else if (k === 4) E.push(new ItemScene());
        else if (k === 5) E.push(new FieldSkillScene());
        else if (k === 6) E.push(new QuestScene());
        else if (k === 7) E.push(new SaveScene('load'));
        else if (k === 8) E.replaceAll(new TitleScene());
        else E.pop();
      }
    }
    drawUI(c) {
      E.panel(c, 168, 8, 80, 172);
      E.menuList(c, ['角色資料', '隊伍編成', '陣形', '裝備', '道具', '計謀', '任務', '讀取', '回標題', '關閉'], this.sel, 178, 16, 13);
      E.text(c, '金 ' + (G.gold || 0), 178, 152, { size: 9, color: GOLD });
      E.text(c, '存檔請到', 178, 164, { size: 7, color: GREY });
      E.text(c, '藍色水晶旁', 178, 172, { size: 7, color: GREY });
    }
  }

  // ------------------------------------------------------------ 計謀（地圖上用）：縮地脫出
  function isDungeon(id) { return /^(cave|shankou)/.test(id); }
  class FieldSkillScene {
    constructor() { this.msg = ''; this.sel = 0; }
    update() {
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.ok) {
        const cost = D.fieldSkill.tp, lead = G.party[0];
        if (!isDungeon(G.mapId)) { this.msg = '這裡不是洞穴或山口，用不上。'; return; }
        if (lead.tp < cost) { this.msg = lead.name + '的戰術點不夠（需要 ' + cost + '）。'; return; }
        const town = G.flags.lastTown || 'zhuoxian', tm = D.maps[town];
        lead.tp -= cost;
        E.replaceAll(new MapScene(town, tm.start));
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(16, 16, 224, 192);
      E.panel(c, 16, 16, 224, 192);
      E.text(c, '計謀（地圖上使用）', 28, 24, { size: 11, color: GOLD });
      const f = D.fieldSkill, ok = isDungeon(G.mapId);
      E.text(c, '▶ ' + f.name + '　TP ' + f.tp, 28, 46, { size: 9, color: ok ? GOLD : '#6a6a80' });
      f.desc.forEach(function (ln, i) { E.text(c, ln, 36, 62 + i * 12, { size: 8, color: '#f4f4ff' }); });
      const t = G.flags.lastTown && D.maps[G.flags.lastTown] ? D.maps[G.flags.lastTown].name : '';
      E.text(c, '目前可回到的城鎮：' + (t || '涿縣'), 28, 120, { size: 8, color: GREY });
      E.text(c, '消耗：' + G.party[0].name + ' 的戰術點（現有 ' + G.party[0].tp + '）', 28, 134, { size: 8, color: GREY });
      E.text(c, ok ? '按決定鍵使用' : '（要在洞穴或山口裡才能用）', 28, 154, { size: 8, color: ok ? '#9ef59e' : GREY });
      if (this.msg) E.text(c, this.msg, 28, 176, { size: 8, color: '#ff9a9a' });
      E.text(c, '其他戰鬥用的計謀，請到「角色資料」查看說明。', 28, 192, { size: 7, color: GREY });
    }
  }

  // ------------------------------------------------------------ 任務：主線下一步 + 支線清單
  const DIRS = ['東', '東南', '南', '西南', '西', '西北', '北', '東北'];
  function compass(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y, a = Math.atan2(dy, dx), k = (Math.round(a / (Math.PI / 4)) + 8) % 8;
    const d = Math.abs(dx) + Math.abs(dy);
    return DIRS[k] + '方，約 ' + d + ' 步';
  }
  function mainStep() {
    const fl = G.flags;
    for (let i = 0; i < D.mainQuest.length; i++) { const q = D.mainQuest[i]; if (!(typeof q.done === 'function' ? q.done(fl) : fl[q.done])) return q; }
    return null;
  }
  function questDirection(q) {
    const t = D.worldTowns && D.worldTowns[q.to];
    if (!t) return '';
    const cur = D.maps[G.mapId];
    if (cur && cur.world && G.mapId === t.world && G.pos) return '從這裡往' + compass(G.pos, t);
    if (G.mapId !== t.world) return t.world === 'world' ? '（目標在北方大地圖）' : '（目標在關東大地圖）';
    return '';
  }
  function wrap(text, n) { const out = []; for (let i = 0; i < text.length; i += n) out.push(text.slice(i, i + n)); return out; }
  class QuestScene {
    constructor() { this.tab = 0; this.sel = 0; }
    sideState(q) {
      const fl = G.flags;
      if (fl[q.id + '_done']) return 2;
      if (fl[q.id + '_start']) return fl[q.kind === 'bounty' ? q.target + '_down' : 'chest_' + q.chest.id] ? 3 : 1;
      return 0;
    }
    update() {
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.left || E.hit.right) this.tab = 1 - this.tab;
      if (this.tab === 1) {
        const n = D.sideQuests.length;
        if (E.hit.up) this.sel = (this.sel + n - 1) % n;
        if (E.hit.down) this.sel = (this.sel + 1) % n;
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      E.text(c, '任務', 20, 16, { size: 11, color: GOLD });
      E.text(c, '主線', 90, 18, { size: 9, color: this.tab === 0 ? GOLD : GREY });
      E.text(c, '支線', 130, 18, { size: 9, color: this.tab === 1 ? GOLD : GREY });
      E.text(c, '左右鍵切換', 190, 19, { size: 7, color: GREY });
      if (this.tab === 0) {
        const q = mainStep();
        if (!q) { wrap(D.mainQuestEnd, 22).forEach(function (ln, i) { E.text(c, ln, 20, 44 + i * 14, { size: 9, color: '#f4f4ff' }); }); return; }
        E.text(c, '現在的目標', 20, 38, { size: 8, color: GREY });
        wrap(q.title, 22).forEach(function (ln, i) { E.text(c, ln, 20, 52 + i * 14, { size: 10, color: GOLD }); });
        let y = 52 + wrap(q.title, 22).length * 14 + 8;
        E.text(c, '去哪裡：' + q.where, 20, y, { size: 9, color: '#9ef59e' }); y += 14;
        const dir = questDirection(q);
        if (dir) { E.text(c, dir, 20, y, { size: 9, color: '#9ef59e' }); y += 14; }
        y += 6;
        wrap(q.hint || '', 22).forEach(function (ln, i) { E.text(c, ln, 20, y + i * 12, { size: 8, color: '#f4f4ff' }); });
        const n = D.mainQuest.indexOf(q);
        E.text(c, '主線進度：' + n + ' / ' + D.mainQuest.length, 20, 196, { size: 8, color: GREY });
      } else {
        const names = ['未接受', '進行中', '已完成', '可回報'], cols = [GREY, '#f4f4ff', '#6ac86a', GOLD];
        D.sideQuests.forEach(function (q, i) {
          const st = this.sideState(q), y = 34 + i * 12, sel = i === this.sel, known = st > 0;
          E.text(c, (sel ? '▶ ' : '　') + (known ? (q.kind === 'bounty' ? '討伐' + q.targetName : '尋找' + q.itemName) : '？？？（到' + D.maps[q.giver].name + '找人）'), 16, y, { size: 7, color: sel ? GOLD : '#f4f4ff' });
          E.text(c, names[st], 214, y, { size: 7, color: cols[st], align: 'right' });
        }, this);
        const q = D.sideQuests[this.sel], st = this.sideState(q);
        c.strokeStyle = '#4a5a9a'; c.strokeRect(14.5, 136.5, 227, 74);
        if (st === 0) { E.text(c, '委託人在' + D.maps[q.giver].name + '。', 20, 142, { size: 8, color: GREY }); }
        else {
          E.text(c, '地點：' + q.where, 20, 142, { size: 8, color: '#9ef59e' });
          const rw = (q.gear ? q.gear.map(function (g) { return D.equipment[g].name; }).join('、') : '兵書《' + D.battle.bookNames[q.book] + '》') + '＋' + q.gold + '金';
          E.text(c, '報酬：' + rw, 20, 154, { size: 8, color: GOLD });
          E.text(c, st === 3 ? '目標已完成，回去找委託人（' + D.maps[q.giver].name + '）。' : st === 2 ? '已經領過報酬。' : '委託人：' + D.maps[q.giver].name, 20, 166, { size: 8, color: '#f4f4ff' });
          const eq = q.gear ? D.equipment[q.gear[0]] : null;
          if (eq) wrap(eq.desc, 24).forEach(function (ln, i) { E.text(c, ln, 20, 180 + i * 10, { size: 7, color: GREY }); });
          else { const sk = D.battle.skills[D.battle.bookSkills[q.book]]; E.text(c, '學會：' + sk.name, 20, 180, { size: 7, color: GREY }); }
        }
      }
    }
  }

  // ------------------------------------------------------------ 陣形：選擇戰鬥時擺的陣
  class BattleFormScene {
    constructor() { this.sel = Math.max(0, D.formationOrder.indexOf(G.formation || 'none')); this.msg = ''; }
    update() {
      const n = D.formationOrder.length;
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.up) this.sel = (this.sel + n - 1) % n;
      if (E.hit.down) this.sel = (this.sel + 1) % n;
      if (E.hit.ok) {
        const id = D.formationOrder[this.sel], f = D.formations[id];
        if (!window.BattleLogic.formationUsable(id, G.party)) this.msg = f.only ? '只有諸葛孔明在隊伍裡、且達到 Lv' + f.unlock + '，才能擺這個陣。' : '諸葛貓妖到 Lv' + f.unlock + ' 才會這個陣形。';
        else { G.formation = id; this.msg = f.name + (id === 'none' ? '：不擺陣形' : '：下一場戰鬥開始就會擺出') + '。'; }
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      E.text(c, '陣形', 20, 16, { size: 11, color: GOLD });
      E.text(c, '目前：' + D.formations[G.formation || 'none'].name, 150, 18, { size: 8, color: GOLD });
      D.formationOrder.forEach(function (id, i) {
        const f = D.formations[id], ok = window.BattleLogic.formationUsable(id, G.party), sel = i === this.sel, y = 34 + i * 12;
        E.text(c, (sel ? '▶ ' : '　') + f.name, 20, y, { size: 8, color: sel ? GOLD : ok ? '#f4f4ff' : '#6a6a80' });
        E.text(c, (G.formation || 'none') === id ? '使用中' : ok ? '' : (f.only ? '僅孔明' : 'Lv' + f.unlock), 82, y, { size: 7, color: GREY });
      }, this);
      const f = D.formations[D.formationOrder[this.sel]];
      // 站位示意：左邊是後排、右邊是前排（敵人在更右邊）；位置只看「隊伍第幾位」
      c.fillStyle = '#10204a'; c.fillRect(108, 30, 132, 136); c.strokeStyle = '#4a5a9a'; c.strokeRect(108.5, 30.5, 131, 135);
      ['後排', '中排', '前排'].forEach(function (nm, k) { E.text(c, nm, 130 + k * 43, 33, { size: 7, color: GREY, align: 'center' }); });
      E.text(c, '敵軍 ▶', 238, 158, { size: 7, color: GREY, align: 'right' });
      for (let i = 0; i < 5; i++) {
        const r = f.rows ? (f.rows[i] == null ? 1 : f.rows[i]) : 1, bx = f.rows ? 111 + (2 - r) * 43 : 154, by = 44 + i * 23, m = G.party[i];
        c.fillStyle = f.rows ? (r === 0 ? '#7a2a2a' : r === 1 ? '#6a5a20' : '#2a4a7a') : '#3a3a50'; c.fillRect(bx, by, 40, 19);
        c.strokeStyle = '#fff'; c.strokeRect(bx + 0.5, by + 0.5, 39, 18);
        E.text(c, '第' + (i + 1) + '位', bx + 3, by + 2, { size: 7, color: GOLD });
        E.text(c, m ? m.name : '－', bx + 3, by + 10, { size: 7, color: m ? '#fff' : GREY });
      }
      E.wrap(c, f.desc, 8, 216).slice(0, 3).forEach(function (l, i) { E.text(c, l, 20, 172 + i * 10, { size: 8, color: f.only ? GOLD : '#f4f4ff' }); });
      E.text(c, this.msg || 'Z 選擇　X 返回　（站位依隊伍順序，到「隊伍編成」調整）', 20, 204, { size: 7, color: this.msg ? GOLD : GREY });
    }
  }

  // ------------------------------------------------------------ 隊伍編成：排列順序、指定軍師
  class FormationScene {
    constructor() { this.sel = 0; this.mode = 'browse'; this.sub = 0; this.msg = ''; }
    subItems() {
      const m = G.party[this.sel], isAdv = G.advisor === m.id;
      return [{ k: 'move', t: '移動順序' }, isAdv ? { k: 'unadv', t: '解除軍師' } : { k: 'adv', t: '任命軍師' }, { k: 'cancel', t: '取消' }];
    }
    update() {
      const n = G.party.length;
      if (this.mode === 'browse') {
        if (E.hit.up) this.sel = (this.sel + n - 1) % n;
        if (E.hit.down) this.sel = (this.sel + 1) % n;
        if (E.hit.cancel) { E.pop(); return; }
        if (E.hit.ok) { this.mode = 'menu'; this.sub = 0; this.msg = ''; }
      } else if (this.mode === 'menu') {
        const it = this.subItems();
        if (E.hit.up) this.sub = (this.sub + it.length - 1) % it.length;
        if (E.hit.down) this.sub = (this.sub + 1) % it.length;
        if (E.hit.cancel) { this.mode = 'browse'; return; }
        if (E.hit.ok) {
          const k = it[this.sub].k, m = G.party[this.sel];
          if (k === 'move') { this.mode = 'move'; }
          else if (k === 'adv') { G.advisor = m.id; this.msg = m.name + '成為軍師：全隊最大 TP 增加，本人每回合多回 1 TP'; this.mode = 'browse'; G.party.forEach(function (x) { x.tp = Math.min(x.tp, G.tpMaxOf(x)); }); }
          else if (k === 'unadv') { G.advisor = null; this.msg = '已解除軍師'; this.mode = 'browse'; G.party.forEach(function (x) { x.tp = Math.min(x.tp, G.tpMaxOf(x)); }); }
          else this.mode = 'browse';
        }
      } else {   // move：上下移動這個人的位置
        if (E.hit.up && this.sel > 0) { const t = G.party[this.sel]; G.party[this.sel] = G.party[this.sel - 1]; G.party[this.sel - 1] = t; this.sel--; }
        if (E.hit.down && this.sel < n - 1) { const t = G.party[this.sel]; G.party[this.sel] = G.party[this.sel + 1]; G.party[this.sel + 1] = t; this.sel++; }
        if (E.hit.ok || E.hit.cancel) { this.mode = 'browse'; this.msg = '隊伍順序已調整（戰鬥中依這個順序排列）'; }
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(16, 16, 224, 192);
      E.panel(c, 16, 16, 224, 192);
      E.text(c, '隊伍編成', 28, 24, { size: 11, color: GOLD });
      G.party.forEach(function (m, i) {
        const y = 46 + i * 20, sel = i === this.sel, moving = sel && this.mode === 'move';
        E.text(c, (moving ? '＞ ' : sel ? '▶ ' : '　') + (i + 1) + '. ' + m.name, 28, y, { color: moving ? '#80e0ff' : sel ? GOLD : '#f4f4ff' });
        E.text(c, 'Lv' + m.level + '　計 ' + m.tp + '/' + G.tpMaxOf(m), 108, y + 1, { size: 8, color: sel ? GOLD : '#f4f4ff' });
        if (G.advisor === m.id) E.text(c, '【軍師】', 200, y + 1, { size: 8, color: '#ffd24a' });
      }, this);
      const adv = G.advisorOf();
      E.text(c, adv ? '軍師：' + adv.name + '（全隊 TP +' + G.tpBonusFromAdvisor() + '）' : '尚未指定軍師（智力高的角色很適合）', 28, 150, { size: 8, color: adv ? '#ffd24a' : GREY });
      if (this.mode === 'menu') {
        E.panel(c, 150, 100, 80, 52);
        this.subItems().forEach(function (it, i) { E.text(c, (i === this.sub ? '▶ ' : '　') + it.t, 156, 108 + i * 13, { size: 9, color: i === this.sub ? GOLD : '#f4f4ff' }); }, this);
      }
      E.text(c, this.msg || (this.mode === 'move' ? '上下鍵移動位置　Z 確定' : 'Z 選擇　X 返回'), 28, 194, { size: 8, color: this.msg ? GOLD : GREY });
    }
  }

  // ------------------------------------------------------------ 道具（地圖上使用）
  class ItemScene {
    constructor() { this.sel = 0; this.target = -1; this.msg = ''; }
    list() { const inv = G.items || {}, B = D.battle; return Object.keys(B.items).filter(function (k) { return inv[k] > 0 && !B.items[k].escape && !B.items[k].quest; }); }
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
          if (it.revive) { if (m.hp <= 0) { m.hp = Math.max(1, Math.round(m.hpMax * it.revive)); G.items[k]--; this.msg = m.name + '復活了！'; } else this.msg = '沒有效果'; }
          else if (it.hp && m.hp > 0 && m.hp < m.hpMax) { m.hp = Math.min(m.hpMax, m.hp + it.hp); G.items[k]--; this.msg = m.name + '回復了兵力'; }
          else if (it.tp && m.tp < G.tpMaxOf(m)) { m.tp = Math.min(G.tpMaxOf(m), m.tp + it.tp); G.items[k]--; this.msg = m.name + '回復了戰術點'; }
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
          E.text(c, '兵 ' + m.hp + '/' + m.hpMax + '　計 ' + m.tp + '/' + G.tpMaxOf(m), 100, y + 1, { size: 8, color: sel ? GOLD : '#f4f4ff' });
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
  const STATUS_PAGES = ['能力', '地形', '計謀', '軍師計', '裝備'];
  class StatusScene {
    constructor() { this.idx = 0; this.page = 0; this.cur = 0; }
    update() {
      if (E.hit.cancel) { E.pop(); return; }
      const n = G.party.length, np = STATUS_PAGES.length;
      const skillPage = this.page === 2 || this.page === 3;
      if (E.hit.left || E.hit.right) this.cur = 0;
      if (n > 1) {
        if (E.hit.left) this.idx = (this.idx + n - 1) % n;
        if (E.hit.right) this.idx = (this.idx + 1) % n;
      }
      if (skillPage) {   // 計謀頁：上下移動游標看說明，Z 換下一頁
        const cnt = this.skillList().length;
        if (cnt) { if (E.hit.down) this.cur = (this.cur + 1) % cnt; if (E.hit.up) this.cur = (this.cur + cnt - 1) % cnt; }
        if (E.hit.ok) { this.page = (this.page + 1) % np; this.cur = 0; }
        return;
      }
      if (E.hit.down || E.hit.ok) { this.page = (this.page + 1) % np; this.cur = 0; }
      if (E.hit.up) { this.page = (this.page + np - 1) % np; this.cur = 0; }
    }
    // 計謀頁 / 軍師計頁要列出的計謀：[{ sk, got, lv }]
    skillList() {
      const m = G.party[this.idx], BL = window.BattleLogic;
      if (this.page === 2) return BL.skillsFor(m, G.flags).filter(function (x) { return !x.adv; }).map(function (x) { return { sk: x, got: true }; });
      return (((D.battle.advisorSkills || {})[m.id]) || []).map(function (e) { return { sk: D.battle.skills[e[1]], got: m.level >= e[0], lv: e[0] }; });
    }
    drawUI(c) {
      const m = G.party[this.idx], ch = D.characters[m.id] || {}, eq = m.equip || {};
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      drawFace(c, m, 196, 16);
      E.text(c, m.name + (m.guest ? '（助戰）' : ''), 20, 16, { size: 12, color: GOLD });
      E.text(c, (ch.zi ? '字' + ch.zi + '　' : '') + (ch.title || ''), 20, 32, { size: 8, color: GREY });
      E.text(c, 'Lv ' + m.level + '　經驗 ' + m.exp + ' / ' + window.BattleLogic.expFor(m.level + 1), 20, 44, { size: 8 });
      // 分頁標籤
      STATUS_PAGES.forEach(function (name, i) {
        const x = 20 + i * 43, on = i === this.page;
        c.fillStyle = on ? '#3a3f8a' : '#171b44'; c.fillRect(x, 62, 41, 12);
        E.text(c, name, x + 4, 64, { size: 8, color: on ? GOLD : GREY });
      }, this);
      const y0 = 82;
      if (this.page === 0) {
        E.text(c, '兵力 ' + m.hp + ' / ' + m.hpMax, 20, y0, { size: 9 });
        E.text(c, '戰術點 ' + m.tp + ' / ' + G.tpMaxOf(m), 130, y0, { size: 9 });
        STAT_ROWS.forEach(function (r, i) { statCell(c, m, r[0], r[1], 20 + (i % 2) * 110, y0 + 18 + Math.floor(i / 2) * 15); });
        E.text(c, '綠色數字表示裝備加成，紅色表示減少', 20, y0 + 84, { size: 7, color: GREY });
      } else if (this.page === 1) {
        E.text(c, '職類 ' + (ch.cls || '－') + '　武器種類 ' + (ch.weapon || '－'), 20, y0, { size: 8 });
        E.text(c, '專屬地形：' + (D.terrainNames[ch.home] || '平地'), 20, y0 + 14, { size: 9, color: D.terrainColors[ch.home] || '#6ccf4a' });
        Object.keys(D.terrainNames).forEach(function (k, i) {
          const g = (ch.terrain && ch.terrain[k]) || 'B';
          E.text(c, D.terrainNames[k] + ' ' + g, 20 + (i % 3) * 70, y0 + 30 + Math.floor(i / 3) * 12, { size: 8, color: D.terrainColors[k] || '#f4f4ff' });
        });
        if (ch.trait) {
          E.text(c, '特性：' + ch.trait.name, 20, y0 + 62, { size: 9, color: GOLD });
          E.wrap(c, ch.trait.desc, 8, 216).slice(0, 4).forEach(function (l, i) { E.text(c, l, 20, y0 + 76 + i * 11, { size: 8 }); });
        } else E.text(c, '沒有特別的特性', 20, y0 + 62, { size: 8, color: GREY });
      } else if (this.page === 2 || this.page === 3) {
        const list = this.skillList(), isAdv = G.advisor === m.id, self = this;
        if (this.page === 3) E.text(c, !list.length ? m.name + '沒有專屬的軍師計謀。' : isAdv ? '現任軍師：以下計謀戰鬥中可用' : '被任命為軍師後，才能用這些專屬計謀（選單「隊伍編成」任命）', 20, y0 - 2, { size: 7, color: isAdv ? GOLD : GREY });
        else if (!list.length) E.text(c, '還沒有學會計謀', 20, y0, { size: 8, color: GREY });
        const top = this.page === 3 ? y0 + 9 : y0, ROWS = this.page === 3 ? 6 : 7, off = Math.max(0, Math.min(this.cur - ROWS + 1, list.length - ROWS));
        list.slice(off, off + ROWS).forEach(function (e, k) {
          const i = off + k, y = top + k * 11, on = i === self.cur;
          if (on) { c.fillStyle = '#3a3f8a'; c.fillRect(18, y - 1, 212, 11); }
          E.text(c, e.sk.name, 22, y, { size: 8, color: !e.got ? GREY : on ? GOLD : '#f4f4ff' });
          E.text(c, e.sk.tp + 'TP', 112, y, { size: 7, color: GREY });
          E.text(c, e.got ? '' : 'Lv' + e.lv + ' 解鎖', 150, y, { size: 7, color: GREY });
        });
        if (list.length > ROWS) E.text(c, (off > 0 ? '▲' : '　') + ((off + ROWS) < list.length ? '▼' : ''), 224, top, { size: 7, color: GREY, align: 'right' });
        const cs = list[this.cur];
        if (cs) E.wrap(c, window.BattleLogic.skillText(cs.sk), 7, 212).slice(0, 3).forEach(function (l, i) { E.text(c, l, 20, 164 + i * 9, { size: 7, color: '#d8d8f0' }); });
      } else {
        Object.keys(D.slots).forEach(function (k, i) {
          const it = eq[k] ? D.equipment[eq[k]] : null;
          E.text(c, D.slots[k], 20, y0 + i * 12, { size: 8, color: GREY });
          E.text(c, it ? it.name : '－', 56, y0 + i * 12, { size: 8 });
        });
        if (ch.bio) E.wrap(c, ch.bio, 7, 216).slice(0, 4).forEach(function (l, i) { E.text(c, l, 20, y0 + 70 + i * 10, { size: 7, color: GREY }); });
      }
      E.text(c, (G.party.length > 1 ? '左右換人　' : '') + ((this.page === 2 || this.page === 3) ? '上下看說明　Z 下一頁　X 返回' : '上下／Z 換頁　X 返回'), 20, 204, { size: 7, color: GREY });
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
  // 商店：武器店、防具店、雜貨店各自分開，每間都能買也能賣（賣價是原價的一半）
  const SELL_SLOTS = { weapon: ['weapon'], armor: ['armor', 'helm', 'boots', 'charm'] };
  class ShopScene {
    constructor(shopId) {
      this.shopId = shopId; this.stock = D.shops[shopId] || [];
      this.kind = (D.shopKinds && D.shopKinds[shopId]) || 'general';
      this.title = (D.shopNames && D.shopNames[shopId]) || '貨攤';
      this.mode = 'menu'; this.msel = 0; this.sel = 0; this.msg = '';
    }
    sellList() {
      if (this.kind === 'general') return Object.keys(G.items || {}).filter(function (id) { return G.items[id] > 0 && D.battle.items[id] && D.battle.items[id].price > 0; }).map(function (id) { return { id: id, item: true, price: Math.floor(D.battle.items[id].price / 2), count: G.items[id], name: D.battle.items[id].name }; });
      const slots = SELL_SLOTS[this.kind] || [];
      return Object.keys(G.equipInv).filter(function (id) { const e = D.equipment[id]; return G.equipInv[id] > 0 && e && e.price > 0 && slots.indexOf(e.slot) >= 0; }).map(function (id) { const e = D.equipment[id]; return { id: id, item: false, price: Math.floor(e.price / 2), count: G.equipInv[id], name: e.name }; });
    }
    list() { return this.mode === 'sell' ? this.sellList() : this.stock.map(function (id) { return { id: id, item: !!D.battle.items[id] }; }); }
    update() {
      if (this.mode === 'menu') {
        if (E.hit.cancel) { E.pop(); return; }
        if (E.hit.up) this.msel = (this.msel + 2) % 3;
        if (E.hit.down) this.msel = (this.msel + 1) % 3;
        if (E.hit.ok) { if (this.msel === 2) { E.pop(); return; } this.mode = this.msel === 0 ? 'buy' : 'sell'; this.sel = 0; this.msg = ''; }
        return;
      }
      const rows = this.list(), n = rows.length;
      if (E.hit.cancel) { this.mode = 'menu'; this.msg = ''; return; }
      if (!n) return;
      if (this.sel >= n) this.sel = n - 1;
      if (E.hit.up) this.sel = (this.sel + n - 1) % n;
      if (E.hit.down) this.sel = (this.sel + 1) % n;
      if (!E.hit.ok) return;
      const r = rows[this.sel];
      if (this.mode === 'buy') {
        const it = r.item ? D.battle.items[r.id] : D.equipment[r.id];
        if ((G.gold || 0) < it.price) this.msg = '金錢不足。';
        else if (r.item) { G.gold -= it.price; G.items[r.id] = (G.items[r.id] || 0) + 1; this.msg = '買了' + it.name + '（持有 ' + G.items[r.id] + '）。'; }
        else { G.gold -= it.price; G.addGear(r.id); this.msg = '買了' + it.name + '，到「裝備」裡裝上。'; }
      } else {
        G.gold = (G.gold || 0) + r.price;
        if (r.item) G.items[r.id]--; else { G.equipInv[r.id]--; if (G.equipInv[r.id] <= 0) delete G.equipInv[r.id]; }
        this.msg = '賣掉了' + r.name + '，得到 ' + r.price + ' 金。';
      }
    }
    drawUI(c) {
      c.fillStyle = '#0c1030'; c.fillRect(8, 8, 240, 208);
      E.panel(c, 8, 8, 240, 208);
      E.text(c, this.title, 20, 16, { size: 11, color: GOLD });
      E.text(c, '持有金 ' + (G.gold || 0), 150, 18, { size: 8, color: GOLD });
      if (this.mode === 'menu') {
        E.menuList(c, ['買東西', '賣東西', '離開'], this.msel, 20, 60, 16);
        E.text(c, { weapon: '這裡賣武器，也收武器。', armor: '這裡賣護甲、頭盔、鞋靴和飾品，也收這些。', general: '這裡賣藥品和雜貨，也收藥品。' }[this.kind], 20, 130, { size: 8, color: GREY });
        E.text(c, 'Z 決定　X 離開', 20, 200, { size: 7, color: GREY });
        return;
      }
      const rows = this.list(), n = rows.length;
      E.text(c, this.mode === 'buy' ? '【買】' : '【賣】', 20, 30, { size: 8, color: GREY });
      if (!n) E.text(c, '沒有可以賣的東西。', 20, 60, { size: 8, color: GREY });
      const top = Math.max(0, Math.min(this.sel - 5, n - 10));
      rows.slice(top, top + 10).forEach(function (r, k) {
        const i = top + k, sel = i === this.sel, y = 42 + k * 13, col = sel ? GOLD : '#f4f4ff';
        const it = r.item ? D.battle.items[r.id] : D.equipment[r.id];
        E.text(c, (sel ? '▶ ' : '　') + it.name + (it.wtype ? '(' + it.wtype + ')' : ''), 20, y, { size: 8, color: col });
        E.text(c, (this.mode === 'buy' ? it.price : r.price) + '金', 92, y, { size: 8, color: col });
        if (this.mode === 'sell') E.text(c, '×' + r.count, 130, y, { size: 8, color: col });
        else E.text(c, r.item ? '持有' + (G.items[r.id] || 0) : Object.keys(it.mods).map(function (k2) { return ({ pow: '攻', atk: '武', int: '智', def: '防', spd: '速', lead: '統', luck: '運', grd: '守' })[k2] + (it.mods[k2] > 0 ? '+' : '') + it.mods[k2]; }).join(' '), 130, y, { size: 8, color: col });
      }, this);
      const cur = rows[this.sel], curIt = cur && (cur.item ? D.battle.items[cur.id] : D.equipment[cur.id]);
      E.text(c, this.msg || (curIt ? curIt.desc : ''), 20, 184, { size: 8, color: this.msg ? GOLD : GREY });
      E.text(c, 'Z ' + (this.mode === 'buy' ? '購買' : '賣出') + '　X 返回', 20, 200, { size: 7, color: GREY });
    }
  }

  // ------------------------------------------------------------ 地圖
  // 洞穴裡的物件：火把、骨堆、雕像、石碑、陶罐、靈泉、拉桿、石門（全部用方塊畫的像素圖）
  function drawCaveObj(c, x, y, o) {
    const r = function (col, a, b, w, h) { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    const t = Math.floor(E.time / 160) % 3;
    const K = '#1a1220';
    if (o.type === 'boat') {
      // 自繪像素帆船 16x16：K 外框 m 桅杆 s/S 帆(亮/暗) r 紅條 b/B/d 船身(亮/中/暗) w 水花
      const ROWS = ['.......K........', '.......mK.......', '.......msKK.....', '...K...mssSK....', '..KsK..msssSK...', '.KssK..mssssSK..',
        '.KsSK..msrrrSK..', 'KsSSSK.mssssSK..', 'KKKKKK.mSSSSKK..', '.......mK.KKK...', 'KKKKKKKmKKKKKKKK', 'KbbbbbbmbbbbbbbK',
        '.KBBBBBBBBBBBBK.', '..KddddddddddK..', 'wW.KKKKKKKKK.Ww.', '..w.........w...'];
      const PAL = { K: K, m: '#6a4428', s: '#f4ecd4', S: '#c8bea0', r: '#b03030', b: '#c08848', B: '#8a5a34', d: '#5a3820', w: '#d8f0ff', W: '#9ccae8' };
      const dy = t === 1 ? 1 : 0;
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        const ch = ROWS[j][i]; if (ch === '.') continue;
        r(PAL[ch], i, j + (j < 14 ? dy : 0), 1, 1);
      }
    } else if (o.type === 'torch') {
      r(K, 6, 6, 4, 9); r('#7a5232', 7, 7, 2, 7); r('#4a3020', 5, 13, 6, 2);
      r(K, 5, 1 + (t === 1 ? 1 : 0), 6, 6);
      r(t === 2 ? '#ffb030' : '#ff8820', 6, 2 + (t === 1 ? 1 : 0), 4, 4);
      r('#ffe070', 7, 3 + (t === 1 ? 1 : 0), 2, 2);
    } else if (o.type === 'bones') {
      r('#2a2230', 2, 9, 12, 5);
      r('#e8e2d0', 3, 11, 10, 2); r('#e8e2d0', 4, 9, 2, 2); r('#e8e2d0', 10, 10, 2, 2);
      r(K, 6, 5, 6, 6); r('#f0ead8', 7, 5, 4, 5); r(K, 8, 7, 1, 1); r(K, 10, 7, 1, 1); r('#c8c2b0', 8, 9, 3, 1);
    } else if (o.type === 'statue') {
      r(K, 3, 12, 10, 3); r('#8a8694', 4, 12, 8, 2);
      r(K, 5, 4, 6, 9); r('#a8a4b2', 6, 5, 4, 7); r('#7a7686', 9, 5, 1, 7);
      r(K, 6, 0, 4, 5); r('#b8b4c2', 7, 1, 2, 3);
      r('#6a5a44', 11, 3, 1, 10); r('#d8d0b0', 11, 2, 1, 2);
    } else if (o.type === 'tablet') {
      r(K, 3, 2, 10, 13); r('#8e8a9c', 4, 3, 8, 11); r('#aaa6b8', 4, 3, 8, 2);
      for (let i = 0; i < 4; i++) r('#5c586a', 5, 6 + i * 2, 6 - (i % 2) * 2, 1);
    } else if (o.type === 'urn') {
      const broken = !!G.flags['urn_' + o.id];
      if (broken) { r('#5a3a28', 3, 12, 3, 2); r('#7a5238', 8, 11, 4, 3); r('#5a3a28', 6, 13, 2, 1); }
      else { r(K, 4, 3, 8, 12); r('#9a5c3a', 5, 4, 6, 10); r('#b87850', 5, 4, 2, 9); r('#6a3c24', 9, 5, 2, 9); r(K, 5, 2, 6, 2); r('#c08860', 6, 2, 4, 1); }
    } else if (o.type === 'spring') {
      r(K, 1, 5, 14, 10); r('#8a8694', 2, 6, 12, 8); r('#2a6ac8', 3, 7, 10, 6); r('#58a8f0', 4, 8, 5, 2);
      if (t === 0) r('#e8f8ff', 10, 9, 1, 1); if (t === 1) r('#e8f8ff', 6, 11, 1, 1); if (t === 2) r('#e8f8ff', 11, 8, 1, 1);
    } else if (o.type === 'lever') {
      const on = !!G.flags[o.flag];
      r(K, 3, 10, 10, 5); r('#8a8694', 4, 11, 8, 3);
      for (let i = 0; i < 6; i++) r('#c0b8a0', on ? 4 + i : 11 - i, 9 - i, 2, 2);
      r('#d84838', on ? 9 : 4, 3, 3, 3);
    } else if (o.type === 'gate') {
      r(K, 0, 0, 16, 16); r('#7a768a', 1, 1, 14, 14); r('#9a96aa', 1, 1, 14, 2);
      r('#5c586a', 7, 3, 2, 12); r('#5c586a', 1, 8, 14, 1);
      [[3, 4], [12, 4], [3, 11], [12, 11]].forEach(function (p) { r('#c8c0a0', p[0], p[1], 1, 1); });
    }
  }
  // 寶箱：用方塊畫的像素寶箱（關著／打開）
  function drawChest(c, x, y, open) {
    const r = function (col, a, b, w, h) { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    r('#1a1220', 2, 5, 12, 10);
    r(open ? '#4a3626' : '#a8702c', 3, 6, 10, 8);
    r(open ? '#2a2018' : '#c88c3c', 3, open ? 3 : 6, 10, open ? 3 : 3);
    r('#5a3a14', 3, 10, 10, 1);
    r('#f0d060', 7, 8, 2, 3);
    if (open) r('#f0d060', 5, 7, 6, 2);
  }
  class MapScene {
    constructor(mapId, spawn) { this.fade = null; this.loadMap(mapId, spawn); }
    loadMap(mapId, spawn) {
      const m = D.maps[mapId];
      this.mapId = mapId; this.map = m; this.w = m.tiles[0].length; this.h = m.tiles.length;
      this.npcs = m.npcs.map(function (n) { return Object.assign({}, n); });
      spawn = spawn || m.start;
      if (mapId === 'world' && D.chapterZoneAt) {   // 舊存檔：人還站在尚未開放的第二章區域裡，送回最近去過的城鎮外面
        const z = D.chapterZoneAt(spawn.x, spawn.y);
        if (z && !G.flags[z.need]) { const t = D.worldTowns[G.flags.lastTown] || D.worldTowns.zhuoxian; spawn = { x: t.x, y: t.y + 1, dir: 'down' }; }
      }
      this.p = { x: spawn.x, y: spawn.y, dir: spawn.dir || 'down', moving: false, t: 0, tx: 0, ty: 0, step: 0 };
      this.banner = 2000; this.evCheck = true;
      G.mapId = mapId; this.syncPos();
      if (mapId === 'world2') G.flags.ch2_arrived = true;
      if (D.townIds && D.townIds.indexOf(mapId) >= 0) { G.flags['seen_' + mapId] = true; G.flags.lastTown = mapId; }
      if (m.world && !G.flags['world_init_' + mapId] && !(mapId === 'world' && G.flags.world_init)) {   // 舊存檔：已經走過的城，大地圖上也進得去
        G.flags['world_init_' + mapId] = true; if (mapId === 'world') G.flags.world_init = true;
        const bf = D.worldBackfill || {};
        Object.keys(bf).forEach(function (t) { if (G.flags[bf[t]]) G.flags['seen_' + t] = true; });
      }
    }
    syncPos() { G.pos = { x: this.p.x, y: this.p.y, dir: this.p.dir }; }
    tileAt(x, y) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
      return D.legend[this.map.tiles[y][x]];
    }
    terrainHere() { return D.terrainOf[this.tileAt(this.p.x, this.p.y)] || 'plain'; }
    visible(n) { return !(n.hideIf && G.flags[n.hideIf]) && !(n.showIf && !G.flags[n.showIf]); }
    npcAt(x, y) { return this.npcs.find(function (n) { return n.x === x && n.y === y && this.visible(n); }, this); }
    objAt(x, y) { return this.map.objects.find(function (o) { return o.x === x && o.y === y && !(o.type === 'gate' && G.flags[o.flag]) && !(o.type === 'urn' && G.flags['urn_' + o.id]); }); }
    blocked(x, y) {
      const t = this.tileAt(x, y);
      return t < 0 || D.solidTiles.indexOf(t) >= 0 || !!this.npcAt(x, y) || !!this.objAt(x, y);
    }
    interact() {
      const p = this.p, v = DIRV[p.dir], tx = p.x + v[0], ty = p.y + v[1];
      const npc = this.npcAt(tx, ty), obj = this.objAt(tx, ty);
      if (npc) {
        npc.dir = OPP[p.dir];
        let key = npc.alt && G.flags[npc.alt.flag] ? npc.alt.dialogue : npc.dialogue;
        const hit = (npc.alts || []).find(function (a) { return G.flags[a.flag]; });   // alts：由進度最前面的往後找，第一個成立的
        if (hit) key = hit.dialogue;
        E.push(new DialogScene(D.dialogue[key]));
      }
      else if (obj && obj.type === 'save') E.push(new SaveScene('save'));
      else if (obj && obj.type === 'chest') this.openChest(obj);
      else if (obj && obj.type === 'urn') this.openUrn(obj);
      else if (obj && obj.type === 'spring') { G.party.forEach(function (m) { m.hp = m.hpMax; G.fullTp(m); }); this.say('清涼的泉水洗去了疲勞。隊伍的兵力與戰術點全部恢復了。'); }
      else if (obj && obj.type === 'lever') {
        if (G.flags[obj.flag]) this.say('拉桿已經扳下去了。');
        else { G.flags[obj.flag] = true; this.say('喀啦——拉桿扳了下去，遠處傳來沉重的石門滑開的聲音。'); }
      }
      else if (obj && obj.type === 'gate') this.say('一道沉重的石門擋住去路，附近一定有開啟的機關。');
      else if (obj && obj.text) this.say(obj.text);
      else {
        const sign = (this.map.signs || []).find(function (k) { return k.x === tx && k.y === ty; });
        if (sign) E.push(new DialogScene(D.dialogue[sign.dialogue]));
      }
    }
    openUrn(o) {
      const key = 'urn_' + o.id;
      if (G.flags[key]) { this.say('陶罐已經碎了，裡面什麼都沒有。'); return; }
      G.flags[key] = true;
      const got = [];
      if (o.gold) { G.gold = (G.gold || 0) + o.gold; got.push(o.gold + '金'); }
      Object.keys(o.item || {}).forEach(function (id) { G.items[id] = (G.items[id] || 0) + o.item[id]; got.push(D.battle.items[id].name + '×' + o.item[id]); });
      this.say(got.length ? '打破了陶罐！裡面有：' + got.join('、') + '。' : '打破了陶罐，裡面是空的，只有一股霉味。');
    }
    openChest(o) {
      const key = 'chest_' + o.id;
      if (G.flags[key]) { this.say('箱子已經空了。'); return; }
      G.flags[key] = true; if (o.flag) G.flags[o.flag] = true;
      const got = [];
      if (o.gold) { G.gold = (G.gold || 0) + o.gold; got.push(o.gold + '金'); }
      (o.gear || []).forEach(function (id) { G.addGear(id); got.push(D.equipment[id].name); });
      Object.keys(o.item || {}).forEach(function (id) { G.items[id] = (G.items[id] || 0) + o.item[id]; got.push(D.battle.items[id].name + '×' + o.item[id]); });
      this.say(o.msg ? o.msg + (got.length ? '（得到：' + got.join('、') + '）' : '') : '打開了寶箱！得到：' + got.join('、') + '。');
    }
    arrive() {
      const p = this.p;
      const w = this.map.warps.find(function (k) { return k.x === p.x && k.y === p.y; });
      const opened = w && this.map.world && D.worldBackfill && D.worldBackfill[w.to] && G.flags[D.worldBackfill[w.to]];   // 大地圖：打通該城的關卡，城門就開了
      if (w && w.need && !G.flags[w.need] && !opened) {      // 條件未達成：不能過去，退回一格
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
      let enc = this.map.encounter;
      if (this.map.zoneGrid) {   // 大地圖：依所在區域（離哪座城最近）決定遇到誰
        const row = this.map.zoneGrid[Math.floor(this.p.y / 4)] || '', ch = row[Math.floor(this.p.x / 4)] || '0';
        const tier = this.map.zoneTiers[parseInt(ch, 16)] || 1;
        enc = Object.assign({}, enc, { group: 'field' + tier });
        this._forceTerr = null;
        if (this.terrainHere() === 'desert') {   // 海岸邊的沙灘：遇到水軍（偶爾是水軍將領），在海上作戰
          const gen = Math.random() < 0.22 ? (tier >= 9 ? 'coastG2' : (tier >= 7 ? 'coastG1' : null)) : null;
          enc.group = gen || (tier <= 4 ? 'coastA' : (tier <= 8 ? 'coastB' : 'coastC'));
          this._forceTerr = 'sea';
        }
      }
      this.steps = (this.steps || 0) + 1;
      if (this.steps < (enc.minSteps || 4) || Math.random() >= enc.rate) return;
      this.steps = 0;
      const groups = D.battle.groups[enc.group];
      let g = groups[Math.floor(Math.random() * groups.length)].slice();
      // 打倒過的頭目，有機會帶殘部再度出現（捲土重來）
      const rm = D.battle.rematch || {}, done = Object.keys(rm).filter(function (f) { return G.flags[f] && D.battle.enemies[rm[f] + '_r']; });
      if (!this._forceTerr && done.length && Math.random() < (D.battle.rematchRate || 0)) {
        const id = rm[done[Math.floor(Math.random() * done.length)]] + '_r';
        g[0] = id;   // 取代隊伍裡的第一名雜兵
        if (g.length > 4) g.pop();   // 殘部很壯，少一個雜兵
      }
      this.startBattle(g, false);
      this._forceTerr = null;
    }
    startBattle(group, boss) {
      const self = this;
      this.hidden = true;
      E.push(new Scenes.Battle(group, { boss: !!boss, bg: this.map.battleBg, terrain: this._forceTerr || this.terrainHere(), fire: boss && boss.fire, onEnd: function (r) { self.hidden = false; self.afterBattle(r, boss); } }));
    }
    afterBattle(r, boss) {
      if (r === 'lose') {
        G.gold = Math.floor((G.gold || 0) / 2);
        G.party.forEach(function (m) { m.hp = m.hpMax; G.fullTp(m); });
        const lt = G.flags.lastTown, home = this.map.home || { map: D.maps[lt] ? lt : 'zhuoxian' };
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
      // once：這個動作只會做一次（旗標名）。pay：要先付的金錢（不夠就不做、也不算用掉）
      if (a.pay && (G.gold || 0) < a.pay) { this.say('金錢不足（需要 ' + a.pay + ' 金）。'); return; }
      if (a.once) { if (G.flags[a.once]) return; G.flags[a.once] = true; }
      if (a.pay) G.gold -= a.pay;
      // 獎勵類動作可以和其他動作寫在同一個 act 裡
      const got = [];
      if (a.gold) { G.gold = (G.gold || 0) + a.gold; got.push(a.gold + '金'); }
      if (a.gear) a.gear.forEach(function (id) { G.addGear(id); got.push(D.equipment[id].name); });
      if (a.book) { G.flags['book_' + a.book] = true; const bs = D.battle.skills[D.battle.bookSkills[a.book]]; got.push('兵書《' + D.battle.bookNames[a.book] + '》（全隊學會「' + bs.name + '」）'); }
      if (a.give) Object.keys(a.give).forEach(function (id) { G.items[id] = (G.items[id] || 0) + a.give[id]; got.push(D.battle.items[id].name + '×' + a.give[id]); });
      if (a.heal) { G.party.forEach(function (m) { m.hp = m.hpMax; G.fullTp(m); }); this.say('隊伍的兵力與戰術點全部恢復了。'); }
      if (got.length) this.say((a.pay ? '付出 ' + a.pay + ' 金。' : '') + '獲得：' + got.join('、') + '。');
      if (a.recruit) {
        if (G.flags['recruited_' + a.recruit]) return;
        const m = G.makeMember(a.recruit), lv = G.party[0].level;
        if (G.party.length >= 5) { this.say('隊伍已滿（最多 5 人）。'); return; }
        if (lv > 1) window.BattleLogic.gainExp(m, window.BattleLogic.expFor(lv));
        m.hp = m.hpMax; G.fullTp(m);
        G.party.push(m); G.flags['recruited_' + a.recruit] = true;
        this.say(m.name + '加入了隊伍！');
      } else if (a.guest) {
        if ((G.flags['guest_' + a.guest] && !a.again) || G.party.length >= 5 || G.party.some(function (m) { return m.id === a.guest; })) return;
        const m = G.makeMember(a.guest), lv = G.party[0].level;
        if (lv > 1) window.BattleLogic.gainExp(m, window.BattleLogic.expFor(lv));
        m.hp = m.hpMax; G.fullTp(m);
        G.party.push(m); G.flags['guest_' + a.guest] = true;
        this.say(m.name + '助戰，暫時加入了隊伍！（劇情結束就會離隊）');
      } else if (a.warp) {
        const w = a.warp; E.replaceAll(new MapScene(w.map, { x: w.x, y: w.y, dir: w.dir || 'down' })); return;
      } else if (a.leave) {
        const k = G.party.findIndex(function (m) { return m.id === a.leave; });
        if (k > 0) {
          const m = G.party.splice(k, 1)[0];
          Object.keys(m.equip || {}).forEach(function (s) { G.addGear(m.equip[s]); });   // 裝備退回背包
          this.say(m.name + '離隊了。（身上的裝備已放回背包）');
        }
      } else if (a.item) {
        G.items[a.item] = (G.items[a.item] || 0) + (a.n || 1);
      } else if (a.shop) {
        E.push(new ShopScene(a.shop));
      } else if (a.rest) {
        const price = D.battle.restPrice;
        if ((G.gold || 0) < price) { this.say('金錢不足（需要 ' + price + ' 金）'); return; }
        G.gold -= price;
        G.party.forEach(function (m) { m.hp = m.hpMax; G.fullTp(m); });
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
    // 大地圖上，依故事被敵軍佔據的城：城頭插敵旗；打倒頭目後換成我方的旗
    groundFor(x, y) {
      const o = [[-2, 0], [2, 0], [0, 2], [0, -2], [-2, -1], [2, -1], [-2, 1], [2, 1]];
      for (let i = 0; i < o.length; i++) { const t = this.tileAt(x + o[i][0], y + o[i][1]); if (t === 31 || t === 33 || t === 32) return t; }
      return 31;
    }
    drawBanners(c, cam) {
      const gar = D.worldGarrison || {}, cols = { yellow: '#f0d020', purple: '#9a40c8', black: '#303038', blue: '#3a6ad8', darkred: '#8a1820', own: '#38b860' };
      const here = this.mapId;
      Object.keys(gar).forEach(function (t) {
        const pos = D.worldTowns[t], held = !G.flags[gar[t].flag];
        if (!pos || pos.world !== here) return;
        if (!held && !G.flags['seen_' + t]) return;
        const x = pos.x * T - cam.x + 8, y = (pos.y - 2) * T - cam.y - 8;
        if (x < -16 || y < -20 || x > W + 16 || y > H + 16) return;
        const col = held ? cols[gar[t].banner] : cols.own;
        c.fillStyle = '#1a1220'; c.fillRect(x - 1, y - 1, 2, 12);
        c.fillStyle = '#1a1220'; c.fillRect(x + 1, y - 1, 9, 7);
        c.fillStyle = col; c.fillRect(x + 1, y, 8, 5);
        if (held) { c.fillStyle = '#1a1220'; c.fillRect(x + 4, y + 1, 2, 3); }
        else { c.fillStyle = '#e8fff0'; c.fillRect(x + 3, y + 1, 4, 1); c.fillRect(x + 4, y + 2, 2, 2); }
      });
    }
    draw(wc) {
      const cam = this.camera(), self = this;
      if (this.hidden) return;
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const sx = x * T - cam.x, sy = y * T - cam.y;
          if (sx < -T || sy < -T || sx > W || sy > H) continue;
          const tid = this.tileAt(x, y);
          if (tid >= 26 && tid <= 30 || tid === 22 || tid >= 37 && tid <= 39) wc.drawImage(E.images.tiles, this.groundFor(x, y) * 16, 0, 16, 16, sx, sy, 16, 16);   // 城堡圖塊底下先鋪地面
          wc.drawImage(E.images.tiles, tid * 16, 0, 16, 16, sx, sy, 16, 16);
        }
      }
      if (window.TerrainArt) {   // 地形細節：湖岸、深水、花叢、青苔
        if (!this.map._art) this.map._art = TerrainArt.build(this.map, this.tileAt.bind(this));
        const ax = Math.max(0, Math.round(cam.x)), ay = Math.max(0, Math.round(cam.y));
        wc.drawImage(this.map._art, ax, ay, W, H, ax - Math.round(cam.x), ay - Math.round(cam.y), W, H);
      }
      if (this.map.world) {
        this.drawBanners(wc, cam);
      }
      const items = [];
      this.npcs.forEach(function (n) {
        if (!self.visible(n)) return;
        items.push({ y: n.y * T, draw: function () { drawSprite(wc, n.sprite, n.dir, 0, n.x * T - cam.x, n.y * T - cam.y); } });
      });
      this.map.objects.forEach(function (o) {
        if ((o.type === 'gate' && G.flags[o.flag]) || (o.type === 'urn' && G.flags['urn_' + o.id])) return;   // 開了的石門、碎了的陶罐都消失
        if (o.type !== 'save' && o.type !== 'chest' && o.type && drawCaveObj) { items.push({ y: o.y * T, draw: function () { drawCaveObj(wc, o.x * T - cam.x, o.y * T - cam.y, o); } }); return; }
        if (o.type === 'chest') { items.push({ y: o.y * T, draw: function () { drawChest(wc, o.x * T - cam.x, o.y * T - cam.y, !!G.flags['chest_' + o.id]); } }); return; }
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
      if (this.map.labels) {   // 大地圖上的城名
        const cam = this.camera(), self = this;
        this.map.labels.forEach(function (l) {
          const sx = l.x * T - cam.x + 8, sy = (l.y - 2) * T - cam.y - 9;
          if (sx < -30 || sy < -10 || sx > W + 30 || sy > H) return;
          const seen = G.flags['seen_' + l.name], gr = (D.worldGarrison || {})[l.name], held = gr && !G.flags[gr.flag];
          const nm = seen ? D.maps[l.name].name : '？？？';
          E.text(c, nm, sx + 1, sy + 1, { size: 7, align: 'center', color: '#101018' });
          E.text(c, nm, sx, sy, { size: 7, align: 'center', color: held ? '#ffb4a0' : (seen ? '#fff6c8' : '#b0b0c0') });
        });
      }
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
  window.Scenes = { Title: TitleScene, Map: MapScene, Dialog: DialogScene, Menu: MenuScene, Status: StatusScene, Save: SaveScene, Item: ItemScene, Equip: EquipScene, Shop: ShopScene, Formation: FormationScene, BattleForm: BattleFormScene, FieldSkill: FieldSkillScene, Quest: QuestScene };
})();
