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

  // ------------------------------------------------------------ 標題
  class TitleScene {
    constructor() { this.sel = 0; }
    update() {
      if (E.hit.up || E.hit.down) this.sel = 1 - this.sel;
      if (E.hit.ok) {
        if (this.sel === 0) { G.fresh(); startGame(); } else E.push(new SaveScene('load'));
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
      E.panel(c, 88, 136, 80, 44);
      E.menuList(c, ['開始遊戲', '讀取存檔'], this.sel, 98, 146, 16);
      E.text(c, '戰鬥測試版 0.10　方向鍵/WASD 移動　Z 確認　X 取消', W / 2, 206, { size: 7, align: 'center', color: GREY });
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
      const items = 5;
      if (E.hit.up) this.sel = (this.sel + items - 1) % items;
      if (E.hit.down) this.sel = (this.sel + 1) % items;
      if (E.hit.cancel) { E.pop(); return; }
      if (E.hit.ok) {
        if (this.sel === 0) E.push(new StatusScene());
        else if (this.sel === 1) E.push(new ItemScene());
        else if (this.sel === 2) E.push(new SaveScene('load'));
        else if (this.sel === 3) E.replaceAll(new TitleScene());
        else E.pop();
      }
    }
    drawUI(c) {
      E.panel(c, 168, 8, 80, 124);
      E.menuList(c, ['狀態', '道具', '讀取', '回標題', '關閉'], this.sel, 178, 18, 16);
      E.text(c, '金 ' + (G.gold || 0), 178, 102, { size: 9, color: GOLD });
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

  // ------------------------------------------------------------ 狀態與主角配點
  class StatusScene {
    constructor() { this.idx = 0; this.sel = 0; }
    member() { return G.party[this.idx]; }
    update() {
      const m = this.member();
      if (E.hit.cancel) { E.pop(); return; }
      if (G.party.length > 1) {
        if (E.hit.left) this.idx = (this.idx + G.party.length - 1) % G.party.length;
        if (E.hit.right) this.idx = (this.idx + 1) % G.party.length;
      }
      if (m.allocatable && m.points > 0) {
        if (E.hit.up) this.sel = (this.sel + 4) % 5;
        if (E.hit.down) this.sel = (this.sel + 1) % 5;
        if (E.hit.ok) {
          // 1 點：武力／智力／速度／魅力 +1；兵力 +8
          if (this.sel === 0) m.atk++; else if (this.sel === 1) m.int++; else if (this.sel === 2) m.spd++;
          else if (this.sel === 3) { m.hpMax += 8; m.hp += 8; G.recalc(m); } else m.cha++;
          m.points--;
        }
      }
    }
    drawUI(c) {
      const m = this.member();
      c.fillStyle = '#0c1030'; c.fillRect(16, 16, 224, 192);
      E.panel(c, 16, 16, 224, 192);
      if (m.sprite < 4 && E.images.portraits) c.drawImage(E.images.portraits, m.sprite * 48, 0, 48, 48, 184, 24, 48, 48);
      else c.drawImage(E.images.sprites, 0, m.sprite * 16, 16, 16, 28, 24, 16, 16);
      E.text(c, m.name, 32, 26, { size: 12, color: GOLD });
      const rows = [
        ['等級', String(m.level)], ['戰術點', m.tp + ' / ' + m.tpMax],
        ['武力', String(m.atk)], ['智力', String(m.int)], ['速度', String(m.spd)], ['兵力', m.hp + ' / ' + m.hpMax], ['魅力', String(m.cha)]
      ];
      const canAlloc = m.allocatable && m.points > 0;
      rows.forEach(function (r, i) {
        const y = 50 + i * 15, picked = canAlloc && i >= 2 && this.sel === i - 2;
        E.text(c, (picked ? '▶ ' : '　') + r[0], 32, y, { color: picked ? GOLD : '#f4f4ff' });
        E.text(c, r[1], 120, y, { color: picked ? GOLD : '#f4f4ff' });
        if (picked) E.text(c, i === 5 ? 'Z 兵力+8' : 'Z 加 1 點', 168, y + 1, { size: 8, color: GOLD });
      }, this);
      const sk = window.BattleLogic.skillsFor(m, G.flags).map(function (x) { return x.name; });
      if (m.allocatable) {
        E.text(c, '能力點　' + m.points + (m.points > 0 ? '（防禦由兵力換算：' + m.def + '）' : '　防禦 ' + m.def + '（由兵力換算）'), 32, 158, { color: m.points > 0 ? GOLD : GREY });
        const rn = { force: '武力路線', wit: '智力路線' }[G.flags.route];
        E.text(c, rn ? rn + '：' + (sk.join('、') || '無') : '路線尚未選擇，路線技能未解鎖', 32, 172, { size: 8, color: rn ? '#f4f4ff' : GREY });
      } else {
        E.text(c, '計謀：' + (sk.join('、') || '無'), 32, 172, { size: 8 });
      }
      E.text(c, (canAlloc ? '上下選擇　Z 加點　' : '') + (G.party.length > 1 ? '左右換人　' : '') + 'X 返回', 32, 194, { size: 7, color: GREY });
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
      E.push(new Scenes.Battle(group, { boss: !!boss, bg: this.map.battleBg, onEnd: function (r) { self.hidden = false; self.afterBattle(r, boss); } }));
    }
    afterBattle(r, boss) {
      if (r === 'lose') {
        G.gold = Math.floor((G.gold || 0) / 2);
        G.party.forEach(function (m) { m.hp = m.hpMax; m.tp = m.tpMax; });
        this.loadMap('zhuoxian', D.maps.zhuoxian.start);
        E.push(new DialogScene(D.dialogue.lose_after));
      } else if (r === 'win' && boss) {
        const info = typeof boss === 'object' ? boss : {};
        G.flags[info.flag || 'boss_down'] = true;
        E.push(new DialogScene(D.dialogue[info.after || 'boss_after']));
      }
    }
    say(text) { E.push(new DialogScene([{ speaker: '', text: text }])); }
    runAct(a) {
      if (a.recruit) {
        if (G.flags['recruited_' + a.recruit]) return;
        const m = G.makeMember(a.recruit), lv = G.party[0].level;
        if (lv > 1) window.BattleLogic.gainExp(m, window.BattleLogic.expFor(lv));
        m.hp = m.hpMax; m.tp = m.tpMax;
        G.party.push(m); G.flags['recruited_' + a.recruit] = true;
        this.say(m.name + '加入了隊伍！');
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

  window.Scenes = { Title: TitleScene, Map: MapScene, Dialog: DialogScene, Menu: MenuScene, Status: StatusScene, Save: SaveScene, Item: ItemScene };
})();
