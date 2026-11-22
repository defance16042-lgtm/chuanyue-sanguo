// 戰鬥畫面：指令選單、目標選擇、行動演出、勝敗結算。規則在 battle_logic.js。
(function () {
  const E = window.Engine, D = window.DATA, G = window.Game, BL = window.BattleLogic, B = D.battle;
  const W = E.W, GOLD = '#ffd668', GREY = '#8a8aa0', RED = '#ff7a6a', GREEN = '#8affa0';
  // 排成兩欄（欄優先）：左 攻擊／計謀／道具，右 全體攻擊／防禦／逃跑
const CMDS = ['攻擊', '計謀', '道具', '全體攻擊', '防禦', '逃跑', '偵察'];
  const MSG_MS = 520, DMG_MS = 480;
  // 戰鬥小人（24×24，有武器與揮砍／施法動作）所在的列；沒有的人暫時用地圖小人
  const BATTLE_ROW = { nyao: 0, liubei: 1, guanyu: 2, zhangfei: 3, caocao: 4, luzhi: 5 };

  class BattleScene {
    // group：敵人 id 陣列；opts：{ boss, canFlee, onEnd(result) }，result 為 'win'|'lose'|'flee'
    constructor(group, opts) {
      opts = opts || {};
      this.opts = opts;
      this.b = BL.newBattle(G.party, group, { flags: G.flags, boss: !!opts.boss, canFlee: opts.canFlee !== false && !opts.boss, terrain: opts.terrain || 'plain', fire: opts.fire });
      this.state = 'msg'; this.queue = []; this.wait = 0; this.after = null;
      this.msgText = ''; this.floats = []; this.fxs = []; this.cur = 0; this.plans = []; this.sel = 0; this.sub = []; this.subSel = 0;
      this.pending = null; this.targets = []; this.targetSel = 0; this.lines = []; this.result = null;
      this.execQueue = []; this.time = 0; this.actor = null; this.bg = opts.bg || 'grass';
      this.layout();
      const names = {}; this.b.enemies.forEach(function (e) { names[e.name] = (names[e.name] || 0) + 1; });
      const txt = Object.keys(names).map(function (n) { return n + (names[n] > 1 ? '×' + names[n] : ''); }).join('、');
      this.say((opts.boss ? '強敵出現！' : '遭遇敵軍！') + txt + (this.b.formation ? '　擺出' + this.b.formation.name : ''), this.startRound);
    }

    // 版面：左邊我方、右邊敵方，各自一列一人，最多 5 對 5（仿紅白機戰鬥畫面），下方是頭像與訊息框
    rowY(i) { return 10 + i * 30; }   // 最多 5 列（5 對 5）
    layout() {
      const self = this;
      // 小人站在兵力條正上方、對齊條的中間。我方條中心 x=70，敵方條中心 x=186
      this.b.enemies.forEach(function (e, i) {
        e.big = !!e.boss; e.size = 16; e.cw = 24; e.top = 0;
        e.dhp = e.hp; e.x = 186 - 12; e.y = self.rowY(i) + 2; e.shake = 0; e.fade = 1; e.row = i;
      });
      this.b.party.forEach(function (u, i) {
        u.dhp = u.hp; u.cw = 24; u.top = 0;   // 戰鬥小人的格是 24×16：身體 16×16，右邊留給武器
        u.x = 70 - 12; u.y = self.rowY(i) + 2; u.shake = 0; u.row = i;
      });
    }

    // ---- 訊息與事件佇列 ----
    say(text, then) { this.msgText = text; this.state = 'msg'; this.wait = MSG_MS; this.after = then || null; }
    unitPos(u) { return { x: u.x + u.cw / 2, y: u.y + u.top }; }
    // 畫面上顯示的兵力：邏輯一次算完整個動作，但血量要等「打到」那一刻才扣（dhp＝畫面兵力）
    H(u) { return u.dhp == null ? u.hp : u.dhp; }
    playEvent(ev) {
      const self = this;
      if (ev.type === 'msg') { this.msgText = ev.text; this.wait = MSG_MS; }
      else if (ev.type === 'act') { ev.actor.anim = { kind: ev.kind, t: 0 }; this.wait = 0; }
      else if (ev.type === 'fx') {
        const p = this.unitPos(ev.target), h = ev.target.ch || 32;
        const dur = { fire: 620 + ev.level * 70, bolt: 520, heal: 560, slash: 230, chop: 280, thrust: 230, axe: 300, arrow: 260, wave: 320, aura: 520, star: 520, shock: 400 }[ev.fx] || 400;
        this.fxs.push({ fx: ev.fx, x: p.x, y: p.y + (ev.target.ch ? ev.target.ch * 0.5 : 14), level: ev.level, t: 0, dur: dur, seed: Math.random() * 1000 });
        this.wait = 0;
      }
      else if (ev.type === 'wait') { this.wait = ev.ms; }
      else if (ev.type === 'status') { this.msgText = ev.text; this.wait = MSG_MS; }
      else if (ev.type === 'dmg') {
        const p = this.unitPos(ev.target);
        ev.target.shake = 260; ev.target.dhp = ev.hpAfter != null ? ev.hpAfter : ev.target.hp;
        this.floats.push({ x: p.x, y: p.y, text: String(ev.amount), color: ev.target.side === 'enemy' ? '#fff' : RED, t: 0 });
        this.wait = DMG_MS;
        if (ev.dead) this.msgText = ev.target.name + (ev.target.side === 'enemy' ? '被擊潰了！' : '倒下了！');
      } else if (ev.type === 'heal' || ev.type === 'tp') {
        if (ev.type === 'heal') ev.target.dhp = ev.hpAfter != null ? ev.hpAfter : ev.target.hp;
        const p = this.unitPos(ev.target);
        this.floats.push({ x: p.x, y: p.y, text: (ev.type === 'tp' ? 'TP+' : '') + ev.amount, color: GREEN, t: 0 });
        this.wait = DMG_MS;
      } else this.wait = 0;
    }

    // ---- 回合流程 ----
    startRound() {
      const healed = BL.beginRound(this.b);
      healed.forEach(function (x) {
        const p = this.unitPos(x.u); x.u.dhp = x.u.hp;
        this.floats.push({ x: p.x, y: p.y, text: String(x.h), color: GREEN, t: 0 });
      }, this);
      this.plans = []; this.cur = -1;
      if (this.auto) {   // 全體攻擊：自動戰鬥到底，直到按鍵取消
        this.b.party.forEach(function (m, i) { if (m.hp > 0) this.plans[i] = { type: 'attack', auto: true }; }, this);
        this.beginExec(); return;
      }
      this.nextCommand();
    }
    nextCommand(back) {
      const party = this.b.party;
      let i = this.cur + (back ? -1 : 1);
      while (i >= 0 && i < party.length && (party[i].hp <= 0 || party[i].confused > 0)) {
        if (!back && party[i].hp > 0 && party[i].confused > 0) this.plans[i] = { type: 'attack' };
        i += back ? -1 : 1;
      }
      if (i < 0) { i = this.cur < 0 ? 0 : this.cur; }
      if (i >= party.length) { this.beginExec(); return; }
      this.cur = i; this.state = 'cmd'; this.sel = 0;
      this.msgText = party[i].name + '要怎麼做？';
    }
    beginExec() {
      this.order = BL.order(this.b); this.oi = 0; this.state = 'exec'; this.queue = []; this.wait = 0;
    }
    stepExec() {
      const b = this.b;
      while (!this.queue.length) {
        const o = BL.outcome(b);
        if (o) return this.finish(o);
        if (this.oi >= this.order.length) {
          const fe = BL.fireEvents(b).concat(BL.statusEvents(b));
          if (fe.length) { this.queue = fe; break; }
          BL.endRound(b);
          const o2 = BL.outcome(b);
          if (o2) return this.finish(o2);
          return this.startRound();
        }
        const u = this.order[this.oi++];
        if (u.hp <= 0 || u.escaped) continue;
        this.actor = u;
        const action = u.side === 'party' ? (this.plans[u.idx] || { type: 'attack' }) : BL.planEnemy(b, u);
        this.queue = BL.perform(b, u, action);
        if (b.fled) { this.queue.push({ type: 'none' }); }
      }
      const ev = this.queue.shift();
      this.playEvent(ev);
      if (b.fled && !this.queue.length) { this.wait = Math.max(this.wait, 300); }
    }

    finish(outcome) {
      const b = this.b, self = this;
      BL.syncBack(b);
      this.lines = [];
      if (outcome === 'win') {
        const v = BL.victory(b);
        G.gold = (G.gold || 0) + v.gold;
        this.lines.push('戰鬥勝利！');
        this.lines.push('獲得 ' + v.share + ' 經驗值、' + v.gold + ' 金');
        BL.drops(b).forEach(function (id) { G.addGear(id); self.lines.push('撿到裝備：' + D.equipment[id].name); });
        b.party.forEach(function (u) {
          if (u.ref.hp <= 0) u.ref.hp = 1;
          else {
            const before = BL.skillsFor(u.ref, G.flags).map(function (k) { return k.id; });
            const ups = BL.gainExp(u.ref, v.share);
            ups.forEach(function (g) {
            let s = g.name + '升到 Lv' + g.level + '！兵力+' + g.hp;
            [['atk', '武力'], ['int', '智力'], ['spd', '速度'], ['lead', '統率'], ['luck', '運氣'], ['grd', '守備'], ['tp', '戰術點']].forEach(function (p) { if (g[p[0]]) s += '、' + p[1] + '+' + g[p[0]]; });
            self.lines.push(s);
            });
            BL.skillsFor(u.ref, G.flags).forEach(function (k) { if (before.indexOf(k.id) < 0) self.lines.push(u.ref.name + '習得計謀「' + k.name + '」！'); });
          }
        });
      } else if (outcome === 'lose') {
        this.lines.push('全軍覆沒……');
      } else {
        this.lines.push('全員逃離了戰場。');
      }
      this.result = outcome; this.li = 0; this.state = 'result'; this.msgText = this.lines[0];
    }

    // ---- 指令選擇 ----
    update(dt) {
      if (this.auto && this.state === 'exec') dt *= 2.3;   // 全體攻擊：動畫與等待整體加快
      this.time += dt;
      const self0 = this; this.b.party.concat(this.b.enemies).forEach(function (u) {
        if (u.shake > 0) u.shake -= dt;
        if (u.side === 'enemy' && self0.H(u) <= 0 && u.fade > 0) u.fade = Math.max(0, u.fade - dt / 400);
      });
      this.b.party.concat(this.b.enemies).forEach(function (u) { if (u.anim) { u.anim.t += dt; if (u.anim.t > 560) u.anim = null; } });
      this.floats.forEach(function (f) { f.t += dt; });
      this.floats = this.floats.filter(function (f) { return f.t < 700; });
      this.fxs.forEach(function (f) { f.t += dt; });
      this.fxs = this.fxs.filter(function (f) { return f.t < f.dur; });

      const s = this.state;
      if (s === 'msg') {
        this.wait -= dt * (E.hit.ok ? 4 : 1);
        if (E.hit.ok) this.wait = 0;
        if (this.wait <= 0) { const a = this.after; this.after = null; if (a) a.call(this); }
      } else if (s === 'exec') {
        this.wait -= dt;
        if (this.auto) {
          if (E.hit.ok || E.hit.cancel) { this.auto = false; this.autoOff = 1200; }   // 再按一下取消，本回合打完後回到指令選單
        } else if (E.hit.ok) this.wait = 0;
        if (this.wait <= 0) this.stepExec();
      } else if (s === 'cmd') this.updateCmd();
      else if (s === 'skill' || s === 'item') this.updateSub();
      else if (s === 'mode') this.updateMode();
      else if (s === 'target') this.updateTarget();
      else if (s === 'scout') this.updateScout();
      else if (s === 'result') this.updateResult();
    }

    updateCmd() {
      const u = this.b.party[this.cur];
      const col = Math.floor(this.sel / 3), row = this.sel % 3, cols = Math.ceil(CMDS.length / 3);
      const inCol = function (k) { return Math.min(3, CMDS.length - k * 3); };
      if (E.hit.up) this.sel = col * 3 + (row + inCol(col) - 1) % inCol(col);
      if (E.hit.down) this.sel = col * 3 + (row + 1) % inCol(col);
      if (E.hit.left || E.hit.right) { const nc = (col + (E.hit.right ? 1 : cols - 1)) % cols; this.sel = nc * 3 + Math.min(row, inCol(nc) - 1); }
      if (E.hit.cancel) { if (this.cur > 0) this.nextCommand(true); return; }
      if (!E.hit.ok) return;
      const c = CMDS[this.sel], enemies = BL.alive(this.b.enemies);
      if (c === '攻擊') this.pickTarget('enemy', { type: 'attack' });
      else if (c === '全體攻擊') {
        // 所有還能動的隊員一起普通攻擊，目標自動選兵力最少的敵人
        this.auto = true;
        this.b.party.forEach(function (m, i) { if (m.hp > 0) this.plans[i] = { type: 'attack', auto: true }; }, this);
        this.beginExec();
      }
      else if (c === '偵察') this.pickTarget('enemy', { type: 'scout' });
      else if (c === '防禦') this.commit({ type: 'defend' });
      else if (c === '逃跑') this.commit({ type: 'flee' });
      else if (c === '計謀') {
        this.sub = BL.skillsFor(u.ref, G.flags).map(function (s) { return { label: (s.adv ? '軍・' : '') + s.name, right: s.tp + 'TP', disabled: u.tp < s.tp, skill: s }; });
        if (!this.sub.length) { this.msgText = '還沒有學會計謀'; return; }
        this.state = 'skill'; this.subSel = 0;
      } else {
        const inv = G.items || {};
        this.sub = Object.keys(B.items).filter(function (k) { return inv[k] > 0; }).map(function (k) {
          return { label: B.items[k].name, right: '×' + inv[k], disabled: false, item: k, def: B.items[k] };
        });
        if (!this.sub.length) { this.msgText = '沒有道具'; return; }
        this.state = 'item'; this.subSel = 0;
      }
    }
    updateSub() {
      const n = this.sub.length;
      if (E.hit.up) this.subSel = (this.subSel + n - 1) % n;
      if (E.hit.down) this.subSel = (this.subSel + 1) % n;
      if (E.hit.cancel) { this.state = 'cmd'; return; }
      if (!E.hit.ok) return;
      const it = this.sub[this.subSel];
      if (it.disabled) return;
      if (it.skill) {
        const k = it.skill.target;
        if (it.skill.choice) {   // 計謀可選單體／全體
          const sk = it.skill, u = this.b.party[this.cur];
          this.modeSkill = sk;
          this.sub2 = [{ label: '單體', right: sk.tp + 'TP', mode: 'one', disabled: u.tp < sk.tp }, { label: '全體', right: (sk.allTp || sk.tp) + 'TP', mode: 'all', disabled: u.tp < (sk.allTp || sk.tp) }];
          this.mode2 = 0; this.state = 'mode'; return;
        }
        if (k === 'one') this.pickTarget('enemy', { type: 'skill', skill: it.skill.id });
        else if (k === 'ally') this.pickTarget('ally', { type: 'skill', skill: it.skill.id });
        else if (k === 'deadAlly') this.pickTarget('dead', { type: 'skill', skill: it.skill.id });
        else this.commit({ type: 'skill', skill: it.skill.id });
      } else {
        if (it.def.escape) this.commit({ type: 'item', item: it.item });
        else if (it.def.revive) this.pickTarget('dead', { type: 'item', item: it.item });
        else this.pickTarget('ally', { type: 'item', item: it.item });
      }
    }
    updateMode() {
      if (E.hit.up || E.hit.down) this.mode2 = 1 - this.mode2;
      if (E.hit.cancel) { this.state = 'skill'; return; }
      if (!E.hit.ok) return;
      const m = this.sub2[this.mode2], sk = this.modeSkill;
      if (m.disabled) return;
      const side = sk.kind === 'heal' ? 'ally' : 'enemy';
      if (m.mode === 'all') this.commit({ type: 'skill', skill: sk.id, mode: 'all' });
      else this.pickTarget(side, { type: 'skill', skill: sk.id, mode: 'one' });
    }
    pickTarget(side, action) {
      this.pending = action;
      this.targets = side === 'dead' ? this.b.party.filter(function (u) { return u.hp <= 0 && !u.escaped; }) : BL.alive(side === 'enemy' ? this.b.enemies : this.b.party);
      if (!this.targets.length) { this.msgText = '沒有倒下的同伴'; return; }
      this.targetSel = 0; this.targetSide = side; this.prevState = this.state; this.state = 'target';
    }
    updateTarget() {
      const n = this.targets.length;
      if (E.hit.up || E.hit.left) this.targetSel = (this.targetSel + n - 1) % n;
      if (E.hit.down || E.hit.right) this.targetSel = (this.targetSel + 1) % n;
      if (E.hit.cancel) { this.state = this.prevState; return; }
      if (E.hit.ok) {
        if (this.pending.type === 'scout') { this.scoutIdx = this.targetSel; this.state = 'scout'; return; }   // 偵察不耗回合
        this.pending.target = this.targets[this.targetSel]; this.commit(this.pending);
      }
    }
    updateScout() {
      const n = this.targets.length;
      if (E.hit.up || E.hit.left) this.scoutIdx = (this.scoutIdx + n - 1) % n;
      if (E.hit.down || E.hit.right) this.scoutIdx = (this.scoutIdx + 1) % n;
      if (E.hit.cancel || E.hit.ok) { this.targetSel = this.scoutIdx; this.state = 'cmd'; }
    }
    commit(action) {
      this.plans[this.cur] = action;
      this.nextCommand();
    }
    updateResult() {
      if (!E.hit.ok) return;
      this.li++;
      if (this.li < this.lines.length) { this.msgText = this.lines[this.li]; return; }
      const r = this.result, cb = this.opts.onEnd;
      E.pop();
      if (cb) cb(r);
    }

    // ---- 繪製 ----
    drawBg(wc) {
      const T = this.b.terrain || 'plain', img = E.images['bg_' + T];
      if (img) {
        wc.drawImage(img, 0, 0);
        wc.fillStyle = '#0b0710'; wc.fillRect(0, 160, W, 64);
        wc.fillStyle = 'rgba(0,0,0,0.55)'; wc.fillRect(98, 2, 60, 11);
        E.text(wc, '地形：' + window.DATA.terrainNames[T], 128, 3, { size: 8, color: '#ffd668', align: 'center' });
        return;
      }
      const sky = { plain: ['#5a8ad0', '#b8d8f0'], forest: ['#4a7a9a', '#a8c8c0'], mountain: ['#7a8aa8', '#d0d8e8'], sea: ['#4a80d0', '#c8e4f8'], desert: ['#6096d6', '#f6e8c4'] }[T];
      const g = wc.createLinearGradient(0, 0, 0, 60);
      g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
      wc.fillStyle = g; wc.fillRect(0, 0, W, 60);
      if (T === 'mountain') {
        wc.fillStyle = '#7a7a90'; [[0, 20, 90], [70, 8, 110], [150, 24, 106]].forEach(function (m) { for (let y = 0; y < 44; y++) wc.fillRect(m[0] + Math.max(0, 44 - y) * 0 + (44 - y) * 0.5 * (m[2] / 90), m[1] + 12 + y, Math.max(2, m[2] - (44 - y) * (m[2] / 45)), 1); });
      } else if (T === 'sea') {
        wc.fillStyle = '#9ac8e8'; wc.fillRect(0, 52, W, 8);
      } else {
        wc.fillStyle = '#6a9a78';
        [[0, 52, 70, 14], [50, 56, 90, 12], [150, 50, 106, 16]].forEach(function (h) { wc.fillRect(h[0], h[1] - h[3] + 12, h[2], h[3]); });
      }
      const ground = { plain: ['#58a838', '#4a9030', '#78c858'], forest: ['#2e7a40', '#246a34', '#46a05a'], mountain: ['#9a8468', '#86725a', '#b49c7c'], sea: ['#2c64b8', '#2456a4', '#6aa4e0'] }[T];
      wc.fillStyle = ground[0]; wc.fillRect(0, 60, W, 100);
      wc.fillStyle = ground[1];
      for (let y = 64; y < 160; y += 8) for (let x = ((y / 8) % 2) * 8; x < W; x += 16) { wc.fillRect(x, y, 3, 1); wc.fillRect(x + 1, y - 1, 1, 1); }
      wc.fillStyle = ground[2];
      for (let y = 68; y < 160; y += 12) for (let x = ((y / 4) % 3) * 6 + 4; x < W; x += 24) wc.fillRect(x, y, 2, 1);
      if (T === 'forest') {   // 遠處的樹冠
        wc.fillStyle = '#1e5a2c'; for (let x = 4; x < W; x += 22) { wc.fillRect(x, 44, 12, 12); wc.fillRect(x + 4, 56, 4, 6); }
      }
      if (T === 'sea') {      // 浪花
        wc.fillStyle = '#d8ecfa'; for (let y = 70; y < 160; y += 14) for (let x = ((y / 7) % 2) * 10; x < W; x += 28) wc.fillRect(x, y, 8, 1);
      }
      wc.fillStyle = '#0b0710'; wc.fillRect(0, 160, W, 64);
      wc.fillStyle = 'rgba(0,0,0,0.55)'; wc.fillRect(98, 2, 60, 11);
      E.text(wc, '地形：' + window.DATA.terrainNames[T], 128, 3, { size: 8, color: '#ffd668', align: 'center' });
    }
    draw(wc) {
      this.drawBg(wc);
      const self = this;
      this.b.enemies.forEach(function (e) {
        if (e.fade <= 0) return;
        const dead = self.H(e) <= 0, hurt = e.shake > 0;
        wc.globalAlpha = dead ? e.fade : 1;
        let dx = hurt ? (Math.floor(e.shake / 40) % 2 ? 2 : -2) : 0;
        let frame = Math.floor(E.time / 500 + e.row * 0.5) % 2;
        const an = e.anim;
        if (an && !dead) {
          if (an.kind === 'swing') { if (an.t < 160) { frame = 3; } else if (an.t < 360) { frame = 4; dx -= 10; } else { frame = 2; dx -= 4; } }
        }
        if (hurt && !dead) frame = 6;
        if (dead) frame = 7;
        wc.drawImage(E.images.benemy16, frame * 24, e.sprite * 16, 24, 16, e.x + dx, e.y, 24, 16);
        wc.globalAlpha = 1;
      });
      this.b.party.forEach(function (u) { self.drawPartyUnit(wc, u); });
    }

    // 我方小人：待命／輪到你／揮砍／施法／受傷／倒下
    drawPartyUnit(wc, u) {
      const cmd = this.state === 'cmd' && this.b.party[this.cur] === u;
      const hurt = u.shake > 0, dead = this.H(u) <= 0;
      const sx = hurt ? (Math.floor(u.shake / 40) % 2 ? 2 : -2) : 0;
      let off = 0, frame = Math.floor(E.time / 500) % 2;
      if (cmd) frame = 2;
      const an = u.anim;
      if (an && !dead) {
        if (an.kind === 'swing') { if (an.t < 160) { frame = 3; off = 0; } else if (an.t < 360) { frame = 4; off = 10; } else { frame = 2; off = 4; } }
        else { frame = 5; off = 2; }
      }
      if (hurt && !dead) frame = 6;
      if (dead) frame = 7;
      const row = BATTLE_ROW[u.id];
      if (row !== undefined) {
        wc.drawImage(E.images.bparty16, frame * 24, row * 16, 24, 16, u.x + sx + off, u.y, 24, 16);
      } else {
        wc.globalAlpha = dead ? 0.35 : 1;
        wc.drawImage(E.images.sprites, ((cmd || an) ? 7 : 6) * 16, u.ref.sprite * 16, 16, 16, u.x + sx + off, u.y, 16, 16);
        wc.globalAlpha = 1;
      }
      if (an && an.kind === 'cast' && !dead) {   // 施法光圈
        const r = 4 + an.t / 60;
        wc.fillStyle = 'rgba(255,255,160,' + Math.max(0, 1 - an.t / 560) + ')';
        const n = Math.max(12, Math.round(r * 5));
        for (let i = 0; i < n; i++) { const a = i / n * 6.2832; wc.fillRect(Math.round(u.x + 12 + off + Math.cos(a) * r), Math.round(u.y + 8 + Math.sin(a) * r), 1, 1); }
      }
    }

    bar(c, x, y, w, ratio, col) {
      c.fillStyle = '#fff'; c.fillRect(x, y, w, 5);
      c.fillStyle = '#d8d0b8'; c.fillRect(x + 1, y + 1, w - 2, 3);
      c.fillStyle = col; c.fillRect(x + 1, y + 1, Math.max(0, Math.round((w - 2) * ratio)), 3);
    }

    drawUI(c) {
      const b = this.b, self = this;
      if (this.autoOff > 0) this.autoOff -= 16;
      if (this.state === 'exec' && (this.auto || this.autoOff > 0))
        E.text(c, this.auto ? '自動戰鬥中　按確定取消' : '已取消，本回合結束後回到指令', 128, 1, { size: 8, color: GOLD, align: 'center' });
      // 兩側名單：名字、兵力數字、兵力條
      b.party.forEach(function (u, i) {
        const y = self.rowY(i), dead = self.H(u) <= 0;
        const sel = self.state === 'cmd' && self.cur === i || (self.state === 'target' && (self.targetSide === 'ally' || self.targetSide === 'dead') && self.targets[self.targetSel] === u);
        E.text(c, u.name, 6, y + 2, { size: 10, color: dead ? GREY : (sel ? GOLD : '#fff') });
        const low = !dead && self.H(u) / u.hpMax < 0.3;
        E.text(c, String(self.H(u)), 8, y + 16, { size: 10, color: dead ? GREY : (low ? RED : '#fff') });
        self.bar(c, 40, y + 19, 60, self.H(u) / u.hpMax, window.DATA.terrainColors[u.home] || '#6ccf4a');
        const bf = [];
        if (u.buffs.atk) bf.push(u.buffs.atk.mult > 1 ? '攻+' : '攻-');
        if (u.buffs.def) bf.push('守+');
        if (u.confused > 0) bf.push('亂');
        if (u.defending) bf.push('守');
        if (bf.length) E.text(c, bf.join(''), 103, y + 17, { size: 8, color: GOLD });
      });
      b.enemies.forEach(function (e, i) {
        if (e.fade <= 0) return;
        const y = self.rowY(i), dead = self.H(e) <= 0;
        const sel = self.state === 'target' && self.targetSide === 'enemy' && self.targets[self.targetSel] === e;
        E.text(c, e.name, 250, y + 2, { size: 10, align: 'right', color: dead ? GREY : (sel ? GOLD : '#fff') });
        E.text(c, String(self.H(e)), 250, y + 16, { size: 10, align: 'right', color: dead ? GREY : '#fff' });
        self.bar(c, 156, y + 19, 60, self.H(e) / e.hpMax, window.DATA.terrainColors[e.home] || '#6ccf4a');
        const bf = [];
        if (e.confused > 0) bf.push('亂');
        if (e.buffs.atk) bf.push('攻-');
        if (bf.length) E.text(c, bf.join(''), 153, y + 17, { size: 8, color: GOLD, align: 'right' });
      });
      // 目標游標
      if (this.state === 'target' || this.state === 'scout') {
        const t = this.state === 'scout' ? this.targets[this.scoutIdx] : this.targets[this.targetSel], p = this.unitPos(t);
        const left = t.side === 'party';
        E.text(c, '▼', p.x, p.y - 11 + (Math.floor(E.time / 250) % 2) * 2, { size: 9, color: GOLD, align: 'center' });
      }
      // 傷害數字
      this.fxs.forEach(function (f) { self.drawFx(c, f); });
      this.floats.forEach(function (f) {
        const y = f.y - 4 - Math.min(f.t, 300) * 0.04;
        E.text(c, f.text, f.x, y, { size: 12, color: f.color, align: 'center' });
      });

      // 下方：頭像框＋訊息框（指令選單會蓋在訊息框上）
      // 選指令／技能／目標時顯示「正在下指令的人」；動作播放時顯示出手的人（我方）
      const choosing = ['cmd', 'skill', 'item', 'mode', 'target', 'scout'].indexOf(this.state) >= 0;
      const who = choosing ? (b.party[Math.max(0, this.cur)] || b.party[0]) : (this.actor && this.actor.side === 'party' ? this.actor : b.party[Math.max(0, this.cur)] || b.party[0]);
      c.fillStyle = '#fff'; c.fillRect(6, 164, 56, 58); c.fillStyle = '#10204a'; c.fillRect(7, 165, 54, 56);
      const pi = who ? G.portraitOf(who.ref) : -1;
      if (pi >= 0) c.drawImage(E.images.portraits, pi * 48, 0, 48, 48, 10, 169, 48, 48);
      else if (who) c.drawImage(E.images.sprites, 0, who.ref.sprite * 16, 16, 16, 26, 185, 16, 16);
      c.fillStyle = '#fff'; c.fillRect(66, 164, 184, 58); c.fillStyle = '#000'; c.fillRect(67, 165, 182, 56);

      if (this.state === 'scout') {
        const t = this.targets[this.scoutIdx], D = window.DATA, tbl = D.drops || {};
        E.text(c, t.name, 74, 168, { size: 10, color: GOLD });
        E.text(c, (t.title && t.title !== t.name ? t.title + '　' : '') + (t.cls || '') + '　武器 ' + (t.weapon || '－'), 74, 181, { size: 8, color: GREY });
        E.text(c, '兵力 ' + this.H(t) + '/' + t.hpMax + '　攻擊力 ' + (t.atk * 2) + '　防禦力 ' + t.def, 74, 192, { size: 8 });
        E.text(c, '智 ' + t.int + '　速 ' + t.spd + '　統 ' + (t.lead || 0) + '　運 ' + (t.luck || 0), 74, 202, { size: 8 });
        E.text(c, '地形 ' + Object.keys(window.DATA.terrainNames).map(function (k) { return window.DATA.terrainNames[k] + ((t.terr && t.terr[k]) || 'B'); }).join(' '), 190, 168, { size: 7, color: GREY });
        E.wrap(c, (t.desc || '') + (tbl[t.id] ? '（身上帶著裝備）' : ''), 7, 172).slice(0, 1).forEach(function (l, i) { E.text(c, l, 74, 212, { size: 7, color: GREY }); });
        this.targetMark = t;
      } else if (this.state === 'cmd') {
        const u = b.party[this.cur];
        E.text(c, u.name + '要怎麼做？', 74, 169, { size: 9, color: GOLD });
        E.text(c, '計 ' + u.tp + '/' + u.tpMax + '　第' + b.round + '回合', 248, 170, { size: 8, color: GREY, align: 'right' });
        CMDS.forEach(function (name, i) {
          const cx = 74 + Math.floor(i / 3) * 58, cy = 183 + (i % 3) * 12, on = i === self.sel;
          if (on) E.text(c, '▶', cx, cy, { size: 9, color: GOLD });
          E.text(c, name, cx + 11, cy, { size: 9, color: on ? GOLD : '#f4f4ff' });
        });
      } else if (this.state === 'skill' || this.state === 'item') {
        E.text(c, this.state === 'skill' ? '計謀' : '道具', 74, 168, { size: 9, color: GOLD });
        this.sub.forEach(function (it, i) {
          const y = 182 + i * 11, sel = i === self.subSel;
          const col = it.disabled ? GREY : (sel ? GOLD : '#f4f4ff');
          if (sel) E.text(c, '▶', 74, y, { size: 9, color: GOLD });
          E.text(c, it.label, 86, y, { size: 9, color: col });
          E.text(c, it.right, 126, y, { size: 9, color: col });
          if (sel) E.text(c, it.skill ? self.skillDesc(it.skill) : it.def.desc, 160, y + 1, { size: 8, color: GREY });
        });
      } else if (this.state === 'mode') {
        const sk = this.modeSkill;
        E.text(c, sk.name, 74, 168, { size: 9, color: GOLD });
        this.sub2.forEach(function (it, i) {
          const y = 182 + i * 11, sel = i === self.mode2, col = it.disabled ? GREY : (sel ? GOLD : '#f4f4ff');
          if (sel) E.text(c, '▶', 74, y, { size: 9, color: GOLD });
          E.text(c, it.label, 86, y, { size: 9, color: col });
          E.text(c, it.right, 126, y, { size: 9, color: col });
          if (sel) E.text(c, it.mode === 'one' ? '集中一人　威力大' : (sk.kind === 'heal' ? '全員回復　每人較少' : '攻擊全敵　每人較輕'), 160, y + 1, { size: 8, color: GREY });
        });
      } else if (this.state === 'target') {
        const t = this.targets[this.targetSel];
        E.text(c, t.name, 74, 172, { size: 10, color: GOLD });
        E.text(c, '兵力 ' + this.H(t) + ' / ' + t.hpMax, 74, 188, { size: 9 });
        E.text(c, '上下選擇　Z 決定　X 返回', 74, 206, { size: 8, color: GREY });
      } else {
        let y = 171;
        E.wrap(c, this.msgText || '', 10, 170).slice(0, 3).forEach(function (line) { E.text(c, line, 74, y, { size: 10 }); y += 13; });
        if (this.state === 'result' && Math.floor(E.time / 350) % 2 === 0) E.text(c, '▼', 238, 209, { size: 8, color: GOLD });
      }
    }

    // 戰鬥特效：像素風小精靈，貼在目標身上，清楚不遮畫面；等級越高，火苗越多越大
    drawFx(c, f) {
      const k = Math.min(1, f.t / f.dur), L = f.level, x = Math.round(f.x), y = Math.round(f.y);
      const rnd = function (i) { const v = Math.sin(f.seed + i * 12.9898) * 43758.5453; return v - Math.floor(v); };
      const R = function (col, px, py, w, h) { c.fillStyle = col; c.fillRect(Math.round(px), Math.round(py), w, h); };
      const PAL = { '1': '#a01000', '2': '#e83810', '3': '#ff9020', '4': '#ffe040', '5': '#fffff0' };
      const blit = function (rows, px, py, sc) {
        for (let r = 0; r < rows.length; r++) for (let q = 0; q < rows[r].length; q++) { const ch = rows[r][q]; if (ch !== '.') R(PAL[ch], px + q * sc, py + r * sc, sc, sc); }
      };
      const FL = [   // 火苗兩幀
        ['...2...', '..22...', '..232..', '.2332.2', '.23432.', '2234322', '2334432', '.23432.', '..222..'],
        ['....2..', '...22..', '.2.232.', '.23332.', '2234322', '2234432', '2334432', '.23432.', '..222..']];
      const FLB = [  // 大火苗
        ['.....2.....', '....22.....', '....232..2.', '...2332.22.', '.2.23332232', '.22233432332', '.2233343432.', '2223344432.2', '22334454432.', '2233445544322', '.233445544332', '..2334444332.', '...23344332..', '....222222...'].map(r => r.slice(0, 11)),
        ['......2....', '.....22....', '.2...232...', '.22.2332.2.', '.2322333222', '.2333343322', '2233344432.2', '2233445443322', '.233445544332', '22334455443.2', '.233445544332', '..2334444332.', '...23344332..', '....222222...'].map(r => r.slice(0, 11))];
      const ring = function (cx, cy, rx, ry, col) {   // 像素點組成的圓環（不用向量曲線，保持像素風）
        const n = Math.max(12, Math.round((rx + ry) * 3)); c.fillStyle = col;
        for (let i = 0; i < n; i++) { const a = i / n * 6.2832; c.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1); }
      };
      c.save();
      if (f.fx === 'fire') {
        const fade = k > 0.8 ? (1 - k) / 0.2 : 1, n = 1 + L, big = L >= 3, rows = big ? FLB : FL, w = rows[0][0].length, hgt = rows[0].length, sc = 1 + (L >= 5 ? 1 : 0) * (big ? 0 : 1);
        c.globalAlpha = fade;
        const fr = Math.floor(f.t / 110) % 2;
        const slots = [[0, 2], [-8, 4], [8, 4], [-4, -6], [4, -6], [0, 8]];
        for (let i = 0; i < n; i++) {
          const o = slots[i % slots.length], bob = Math.floor(Math.sin(f.t / 90 + i * 2) * 1.2), start = Math.min(1, Math.max(0, (k - i * 0.04) * 4));
          if (start <= 0) continue;
          blit(rows[(fr + i) % 2], x + o[0] - Math.floor(w * sc / 2), y + o[1] + 2 - Math.round(hgt * sc * start) + bob, sc);
        }
        for (let i = 0; i < L * 2; i++) {   // 火星
          const t2 = (k * 1.6 + rnd(i + 200)) % 1; c.globalAlpha = (1 - t2) * fade;
          R(i % 2 ? '#ffe040' : '#ff9020', x + (rnd(i + 300) - 0.5) * 24, y + 6 - t2 * (14 + L * 4), 1, 1);
        }
      } else if (f.fx === 'bolt') {
        c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        const n = Math.min(3, 1 + Math.floor(L / 2));
        for (let j = 0; j < n; j++) {
          let px = x + (j - (n - 1) / 2) * 7, py = y - 26;
          for (let i = 0; i < 6; i++) {
            const nx = x + (j - (n - 1) / 2) * 5 + (rnd(i + j * 9 + Math.floor(f.t / 100)) - 0.5) * 8, ny = py + 5 + Math.floor(L / 2);
            R('#fff', Math.min(px, nx), py, Math.abs(nx - px) + 1, ny - py + 1);
            R('#60b0ff', Math.min(px, nx) + 1, py, 1, ny - py + 1);
            px = nx; py = ny;
          }
          R('#fff', px - 2, py, 5, 1); R('#ffe040', px - 1, py + 1, 3, 1);
        }
      } else if (f.fx === 'heal') {
        const fade = k > 0.7 ? (1 - k) / 0.3 : 1;
        for (let i = 0; i < 4 + L * 2; i++) {
          const t2 = (k * 1.3 + rnd(i)) % 1; c.globalAlpha = (1 - t2) * fade;
          const px = x + Math.round((rnd(i + 20) - 0.5) * 20), py = y + 10 - Math.round(t2 * 26);
          R('#fff', px, py, 1, 3); R('#fff', px - 1, py + 1, 3, 1); R('#40e070', px, py + 1, 1, 1);
        }
      } else if (f.fx === 'chop') {   // 刀：粗重的弧形斬，帶橘色刀光與火花
        const w = Math.min(1, k * 2.2); c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        for (let i = 0; i < Math.round(18 * w); i++) {
          const t = i / 18, px = x - 10 + i, py = y - 12 + Math.round(Math.sin(t * 2.2) * 14 + t * 6);
          R('#ffe0a0', px, py, 2, 3); R('#fff', px, py + 1, 1, 1);
        }
        if (k > 0.35) for (let i = 0; i < 5; i++) R(i % 2 ? '#ffd060' : '#ff8030', x + (rnd(i) - 0.5) * 18, y + (rnd(i + 9) - 0.5) * 16, 1, 1);
      } else if (f.fx === 'thrust') {   // 矛／槍：由左向右的直刺，命中處爆出十字星
        const w = Math.min(1, k * 2.6); c.globalAlpha = k < 0.75 ? 1 : (1 - k) / 0.25;
        const len = Math.round(26 * w);
        R('#c8c8d8', x - 16, y, len, 1); R('#fff', x - 16, y - 1, len, 1); R('#8890a8', x - 16, y + 1, len, 1);
        if (w >= 1) { R('#fff', x + 10, y - 3, 1, 7); R('#fff', x + 7, y, 7, 1); R('#ffe070', x + 9, y - 1, 3, 3); }
      } else if (f.fx === 'axe') {   // 斧：由上劈下，落地震出粉塵
        const w = Math.min(1, k * 2.2); c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        for (let i = 0; i < Math.round(20 * w); i++) { R('#fff', x - 2 + Math.round(i * 0.25), y - 16 + i, 3, 1); R('#c07040', x - 3 + Math.round(i * 0.25), y - 16 + i, 1, 1); }
        if (k > 0.45) for (let i = 0; i < 6; i++) R('#d8c8a0', x - 8 + i * 3, y + 6 + ((i * 7) % 3), 2, 1);
      } else if (f.fx === 'arrow') {   // 弓：一支箭由遠處飛來
        const px = x - 40 + Math.round(Math.min(1, k * 1.8) * 38); c.globalAlpha = k < 0.8 ? 1 : (1 - k) / 0.2;
        R('#a07040', px - 8, y, 9, 1); R('#fff', px + 1, y - 1, 2, 3); R('#e0e0e8', px + 3, y, 2, 1); R('#d03030', px - 8, y - 1, 2, 1); R('#d03030', px - 8, y + 1, 2, 1);
        if (k > 0.55) { R('#fff', x - 1, y - 2, 1, 5); R('#fff', x - 3, y, 5, 1); }
      } else if (f.fx === 'wave') {   // 扇：青綠氣波，擴散成環
        c.globalAlpha = 1 - k; ring(x, y, 4 + k * 14, 4 + k * 14, '#80ffd0'); ring(x, y, 2 + k * 8, 2 + k * 8, '#ffffff');
        for (let i = 0; i < 4; i++) { const a = k * 4 + i * 1.57; R('#c8fff0', x + Math.cos(a) * (6 + k * 8), y + Math.sin(a) * (6 + k * 8), 1, 1); }
      } else if (f.fx === 'slash') {
        const w = Math.min(1, k * 2.2); c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        for (let i = 0; i < Math.round(14 * w); i++) { R('#fff', x - 8 + i, y - 8 + i, 1 + (i % 3 === 1 ? 1 : 0), 1); R('#c8c8ff', x - 7 + i, y - 8 + i, 1, 1); }
      } else if (f.fx === 'shock' || f.fx === 'aura' || f.fx === 'star') {
        const col = f.fx === 'shock' ? '#f0e070' : f.fx === 'aura' ? '#ffd060' : '#e090ff';
        c.globalAlpha = 1 - k; ring(x, y + 8, 5 + k * 12, 2 + k * 5, col);
        if (f.fx === 'star') for (let i = 0; i < 4; i++) { const a = f.t / 150 + i * 1.57; R('#fff', x + Math.cos(a) * 9, y - 12 + Math.sin(a) * 3, 2, 2); }
        if (f.fx === 'aura') for (let i = 0; i < 5; i++) { const t2 = (k + i / 5) % 1; R(col, x + (rnd(i) - 0.5) * 16, y + 10 - t2 * 22, 1, 2); }
      }
      c.restore();
    }

    skillDesc(s) {
      if (s.choice) return s.kind === 'heal' ? '回復　可選單體/全體' : '計謀　可選單體/全體';
      if (s.kind === 'heal') return '回復兵力';
      if (s.kind === 'buff') return s.stat === 'atk' ? '全隊武力提升' : '全隊防禦提升';
      if (s.kind === 'debuff') return '全敵攻擊下降';
      if (s.kind === 'confuse') return '使敵混亂';
      if (s.target === 'all') return '攻擊全體';
      if (s.hits > 1) return '連續攻擊';
      return '強力一擊';
    }
  }

  window.Scenes = window.Scenes || {};
  window.Scenes.Battle = BattleScene;
})();
