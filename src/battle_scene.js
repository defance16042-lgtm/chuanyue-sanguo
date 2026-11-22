// 戰鬥畫面：指令選單、目標選擇、行動演出、勝敗結算。規則在 battle_logic.js。
(function () {
  const E = window.Engine, D = window.DATA, G = window.Game, BL = window.BattleLogic, B = D.battle;
  const W = E.W, GOLD = '#ffd668', GREY = '#8a8aa0', RED = '#ff7a6a', GREEN = '#8affa0';
  // 排成兩欄（欄優先）：左 攻擊／計謀／道具，右 全體攻擊／防禦／逃跑
const CMDS = ['攻擊', '計謀', '道具', '全體攻擊', '防禦', '逃跑', '偵察'];
  const MSG_MS = 520, DMG_MS = 480;
  // 戰鬥小人（24×24，有武器與揮砍／施法動作）所在的列；沒有的人暫時用地圖小人
  const BATTLE_ROW = { nyao: 0, liubei: 1, guanyu: 2, zhangfei: 3, caocao: 4, luzhi: 5 };

  const ROW_X = [94, 68, 44];   // 前排、中排、後排的小人 x 座標
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
        u.x = 70 - 12; u.y = self.rowY(i) + 2; u.shake = 0; u.row = i; u.tx = u.x;
        // 陣形：站位只看第幾位。前排衝到場中央，後排退到最左邊（相差約 3 個人身寬）
        const f = self.b.formation;
        if (f && f.rows) u.tx = ROW_X[f.rows[i] == null ? 1 : f.rows[i]];
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
        const dur = { fire: 620 + ev.level * 70, bolt: 520, heal: 560, slash: 230, chop: 280, thrust: 230, axe: 300, arrow: 260, wave: 320, aura: 520, star: 520, shock: 400, rock: 900, thunder: 700, water: 900, smoke: 900, arrowrain: 800, trap: 700, crack: 800, roar: 700, dizzy: 800, banner: 800, rage: 800, wind: 600, bagua: 900, up_r: 700, up_b: 700, up_g: 700, up_y: 700, whirl: 600, flurry: 700, execute: 600, bloodslash: 500, dragon: 520, cross: 520, multithrust: 600, mist: 900, confuse: 800, cage: 800, orb: 800, purify: 800, leaf: 800, revive: 1000, bloom: 900, paw: 900 }[ev.fx] || 400;
        if (window.Audio2) window.Audio2.sfx(ev.fx);
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
      this.b.party.forEach(function (u) { if (u.tx != null && u.x !== u.tx) { u.x += (u.tx - u.x) * Math.min(1, dt / 160); if (Math.abs(u.tx - u.x) < 0.5) u.x = u.tx; } });   // 滑進陣形站位
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
      const n = this.sub.length, PER = 6, pages = Math.ceil(n / PER);
      if (E.hit.up) this.subSel = (this.subSel + n - 1) % n;
      if (E.hit.down) this.subSel = (this.subSel + 1) % n;
      // 左右：同一頁的兩欄之間移動；已在邊緣就翻到上一頁／下一頁
      if (E.hit.left || E.hit.right) {
        const pg = Math.floor(this.subSel / PER), col = Math.floor((this.subSel % PER) / 3);
        if (E.hit.right) {
          if (col === 0 && this.subSel + 3 < n && Math.floor((this.subSel + 3) / PER) === pg) this.subSel += 3;
          else if (pages > 1) this.subSel = ((pg + 1) % pages) * PER;
        } else {
          if (col === 1) this.subSel -= 3;
          else if (pages > 1) this.subSel = ((pg + pages - 1) % pages) * PER;
        }
        this.subSel = Math.min(this.subSel, n - 1);
      }
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

    // 兵力條長度依兵力「範圍」分級（仿吞食天地）：這場戰鬥裡最小的那一級最短，往上每一級加長；全場都破千就從短的開始
    barLen(u) {
      const T = [60, 150, 400, 1000, 2500, 6000, 15000, 40000], rank = function (h) { let r = 0; T.forEach(function (t) { if (h >= t) r++; }); return r; };
      if (this.minRank == null) { const all = this.b.party.concat(this.b.enemies); this.minRank = Math.min.apply(null, all.map(function (x) { return rank(x.hpMax); })); }
      return Math.min(60, 24 + (rank(u.hpMax) - this.minRank) * 9);
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
        self.bar(c, 40, y + 19, self.barLen(u), self.H(u) / u.hpMax, window.DATA.terrainColors[u.home] || '#6ccf4a');
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
        self.bar(c, 216 - self.barLen(e), y + 19, self.barLen(e), self.H(e) / e.hpMax, window.DATA.terrainColors[e.home] || '#6ccf4a');
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
        const PER = 6, nn = this.sub.length, pages = Math.ceil(nn / PER), pg = Math.floor(this.subSel / PER);
        E.text(c, this.state === 'skill' ? '計謀' : '道具', 74, 168, { size: 9, color: GOLD });
        if (pages > 1) E.text(c, '◀ ' + (pg + 1) + '/' + pages + ' ▶　左右翻頁', 248, 169, { size: 8, color: GREY, align: 'right' });
        for (let k = 0; k < PER; k++) {
          const i = pg * PER + k; if (i >= nn) break;
          const it = this.sub[i], sel = i === this.subSel, cx = 74 + Math.floor(k / 3) * 88, y = 178 + (k % 3) * 10;
          const col = it.disabled ? GREY : (sel ? GOLD : '#f4f4ff');
          if (sel) E.text(c, '▶', cx, y, { size: 8, color: GOLD });
          E.text(c, it.label, cx + 9, y, { size: 8, color: col });
          E.text(c, String(it.right).replace('TP', ''), cx + 80, y, { size: 8, color: col, align: 'right' });
        }
        const cs = this.sub[this.subSel];
        if (cs) E.wrap(c, (cs.skill ? BL.skillText(cs.skill) : cs.def.desc) || '', 7, 172).slice(0, 2).forEach(function (l, i) { E.text(c, l, 74, 208 + i * 7.5, { size: 7, color: GREY }); });
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
      } else if (f.fx === 'rock') {   // 落石：幾塊大石頭從天上砸下來，砸出碎石與塵土
        for (let i = 0; i < 3; i++) {
          const t = (k - i * 0.16) / 0.42, bx = x + (i - 1) * 9 + Math.round((rnd(i) - 0.5) * 3), r = i === 1 ? 4 : 3;
          if (t > 0 && t < 1) {
            const by = Math.round(y - 46 + t * t * 52); c.globalAlpha = 1;
            R('#5a4a3c', bx - r, by - r + 1, r * 2 + 1, r * 2 - 1); R('#8a7a68', bx - r + 1, by - r, r * 2 - 1, r * 2 + 1);
            R('#c0b098', bx - r + 1, by - r + 1, 2, 1); R('#4a3c30', bx - r + 1, by + r - 1, r * 2 - 1, 1);
          } else if (t >= 1) {
            const u = Math.min(1, (t - 1) * 1.7); c.globalAlpha = 1 - u;
            ring(bx, y + 9, 3 + u * 11, 1 + u * 3, '#d8c8a0');
            for (let j = 0; j < 6; j++) R(j % 2 ? '#8a7a68' : '#5a4a3c', bx + (rnd(j + i * 7) - 0.5) * u * 26, y + 8 - Math.sin(u * 3.14) * (6 + rnd(j + 5) * 12), 2, 2);
          }
        }
      } else if (f.fx === 'thunder') {   // 天雷：天空劈下粗大的閃電，地面炸出火花
        if (k < 0.18) { c.globalAlpha = (0.18 - k) / 0.18 * 0.55; R('#ffffff', x - 34, y - 60, 68, 90); }
        c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        const n = Math.min(3, 1 + Math.floor(L / 2));
        for (let j = 0; j < n; j++) {
          let px = x + (j - (n - 1) / 2) * 10, py = y - 58;
          const fr = Math.floor(f.t / 70);
          while (py < y + 6) {
            const nx = x + (j - (n - 1) / 2) * 8 + (rnd(py + j * 31 + fr) - 0.5) * 12, ny = py + 6;
            R('#60b0ff', Math.min(px, nx) - 1, py, Math.abs(nx - px) + 3, 7); R('#fff', Math.min(px, nx), py, Math.abs(nx - px) + 1, 7);
            px = nx; py = ny;
          }
        }
        for (let i = 0; i < 8; i++) R(i % 2 ? '#ffe040' : '#fff', x + (rnd(i) - 0.5) * 30, y + 6 - Math.abs(Math.sin(k * 6 + i)) * 9, 2, 1);
      } else if (f.fx === 'water') {   // 水淹七軍：一道大浪從腳下湧起淹過來
        const h = Math.sin(Math.min(1, k * 1.15) * 3.14) * 30, base = y + 14; c.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1;
        for (let i = -16; i <= 16; i++) {
          const top = Math.round(base - h + Math.sin(i * 0.7 + f.t / 70) * 2 + Math.abs(i) * 0.15);
          if (top >= base) continue;
          R(i % 3 === 0 ? '#2060c0' : '#3a80e0', x + i, top, 1, base - top); R('#d8f4ff', x + i, top, 1, 1);
          if (rnd(i + 40) > 0.8) R('#fff', x + i, top - 2 - Math.round(rnd(i) * 3), 1, 1);
        }
      } else if (f.fx === 'smoke') {   // 毒煙：紫綠色毒霧一團團冒出來
        for (let i = 0; i < 9; i++) {
          const t2 = (k * 1.2 + rnd(i)) % 1, sz = 4 + Math.floor(rnd(i + 5) * 4), px = x + (rnd(i + 3) - 0.5) * 20 + Math.sin(t2 * 5 + i) * 3, py = y + 12 - t2 * 32;
          c.globalAlpha = Math.min(0.85, (1 - t2) * 1.2) * (k > 0.85 ? (1 - k) / 0.15 : 1);
          R(i % 2 ? '#5a2a80' : '#3a7a3a', px - sz / 2, py - sz / 2, sz, sz); R(i % 2 ? '#8a50b8' : '#70b050', px - sz / 2 + 1, py - sz / 2 + 1, sz - 2, sz - 2);
        }
        c.globalAlpha = 1; if (k > 0.2) for (let i = 0; i < 3; i++) R('#e0ffc0', x - 5 + i * 5, y - 14 - Math.round(((k * 3 + i) % 1) * 6), 1, 1);
      } else if (f.fx === 'arrowrain') {   // 伏兵：亂箭從天空密密麻麻落下
        for (let i = 0; i < 12; i++) {
          const t = k * 1.5 - i * 0.07, ax = x - 22 + i * 4 + Math.round(rnd(i) * 3);
          if (t <= 0) continue; const ay = Math.min(y + 10, Math.round(y - 44 + t * 54)); c.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1;
          R('#a07040', ax, ay - 7, 1, 7); R('#e8e8f0', ax, ay, 1, 2); R('#d03030', ax - 1, ay - 8, 3, 1);
          if (ay >= y + 10 && t < 0.9) R('#d8c8a0', ax - 1, ay + 2, 3, 1);
        }
      } else if (f.fx === 'trap') {   // 絆馬索：一條繩索橫拉，猛然繃起絆倒
        const w = Math.min(1, k * 3) * 36, lift = Math.max(0, k - 0.4) * 20; c.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1;
        for (let i = 0; i < w; i++) { const yy = y + 10 - Math.round(lift * Math.sin(i / 36 * 3.14)); R('#c8a060', x - 18 + i, yy, 1, 1); R('#7a5028', x - 18 + i, yy + 1, 1, 1); }
        if (k > 0.45) for (let i = 0; i < 6; i++) R(i % 2 ? '#fff' : '#ffe070', x - 14 + i * 5 + Math.round((rnd(i) - 0.5) * 3), y + 4 - Math.round((k - 0.45) * 14 * rnd(i + 4)), 1, 1);
      } else if (f.fx === 'crack') {   // 破甲：盾牌裂成兩半碎開
        const sp = Math.max(0, k - 0.5) * 16, fade = k > 0.8 ? (1 - k) / 0.2 : 1; c.globalAlpha = fade;
        const shield = function (ox) {
          R('#e0e8ff', ox - 6, y - 9, 13, 11); R('#e0e8ff', ox - 5, y + 2, 11, 3); R('#e0e8ff', ox - 3, y + 5, 7, 2); R('#e0e8ff', ox - 1, y + 7, 3, 1);
          R('#7080a8', ox - 5, y - 8, 11, 9); R('#7080a8', ox - 4, y + 1, 9, 3); R('#7080a8', ox - 2, y + 4, 5, 2);
          R('#d0a040', ox - 1, y - 6, 3, 8); R('#d0a040', ox - 4, y - 3, 9, 3);
        };
        c.save(); c.beginPath(); c.rect(x - 20, y - 20, 20, 40); c.clip(); shield(x - Math.round(sp)); c.restore();
        c.save(); c.beginPath(); c.rect(x, y - 20, 20, 40); c.clip(); shield(x + Math.round(sp)); c.restore();
        if (k > 0.25 && k < 0.6) for (let i = 0; i < 8; i++) R('#202030', x - 1 + Math.round((rnd(i) - 0.5) * 4), y - 9 + i * 2, 2, 2);
        if (k > 0.5) for (let i = 0; i < 6; i++) R('#e0e8ff', x + (rnd(i) - 0.5) * 24, y + (k - 0.5) * 30 * (0.5 + rnd(i + 3)) - 4, 2, 2);
      } else if (f.fx === 'roar') {   // 怒吼：一圈圈聲波轟出去，周圍帶放射線
        for (let i = 0; i < 3; i++) {
          const t = k * 1.3 - i * 0.2; if (t <= 0 || t >= 1) continue; c.globalAlpha = 1 - t;
          ring(x, y, 5 + t * 24, 4 + t * 19, i % 2 ? '#ffd060' : '#fff6c0');
        }
        c.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
        for (let i = 0; i < 8; i++) { const a = i * 0.785, rr = 8 + k * 14; R('#fff', x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8, 2, 1); }
      } else if (f.fx === 'dizzy') {   // 震懾：頭上一圈星星打轉
        c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        if (k < 0.2) { R('#fff', x - 1, y - 12, 3, 24); R('#fff', x - 12, y - 1, 25, 3); }
        for (let i = 0; i < 4; i++) { const a = f.t / 130 + i * 1.57, px = x + Math.cos(a) * 9, py = y - 16 + Math.sin(a) * 3; R('#ffe040', px - 1, py, 3, 1); R('#ffe040', px, py - 1, 1, 3); R('#fff', px, py, 1, 1); }
      } else if (f.fx === 'banner') {   // 叫陣：高舉一面紅色戰旗
        const rise = Math.min(1, k * 3); c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        const top = Math.round(y + 12 - 34 * rise); R('#704020', x + 5, top, 1, y + 12 - top);
        for (let i = 0; i < 11; i++) { const wv = Math.round(Math.sin(f.t / 90 + i * 0.6) * 1.5); R('#d02020', x + 6 + i, top + wv, 1, 7 - Math.floor(i / 4)); R('#ffd060', x + 6 + i, top + wv + 3, 1, 1); }
        ring(x, y + 12, 5 + k * 8, 2 + k * 3, '#ff8040');
      } else if (f.fx === 'rage') {   // 狂怒：身上冒出紅色火氣
        c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1; ring(x, y + 10, 6 + Math.sin(f.t / 80) * 2, 3, '#ff3020');
        for (let i = 0; i < 16; i++) { const t2 = (k * 1.8 + rnd(i)) % 1; R(i % 3 === 0 ? '#ffe040' : i % 2 ? '#ff3020' : '#ff8020', x + (rnd(i + 8) - 0.5) * 18, y + 10 - t2 * 30, 2, 3 + (i % 2)); }
      } else if (f.fx === 'wind') {   // 疾風：一道道速度線從身旁掠過
        c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        for (let i = 0; i < 7; i++) { const lx = x - 26 + ((k * 1.7 + rnd(i)) % 1) * 52; R(i % 2 ? '#d0ffe0' : '#ffffff', lx, y - 14 + i * 4, 7 + Math.round(rnd(i + 2) * 6), 1); }
      } else if (f.fx === 'bagua') {   // 八陣圖：地上浮出轉動的八卦陣
        c.globalAlpha = k < 0.2 ? k / 0.2 : k > 0.8 ? (1 - k) / 0.2 : 1; const rot = f.t / 260;
        ring(x, y + 8, 16, 7, '#ffd060'); ring(x, y + 8, 10, 4.5, '#ffe9a0'); ring(x, y + 8, 3, 1.5, '#fff');
        for (let i = 0; i < 8; i++) {
          const a = rot + i * 0.785, px = x + Math.cos(a) * 16, py = y + 8 + Math.sin(a) * 7, v = (i * 5 + 3) & 7;
          for (let b = 0; b < 3; b++) { if ((v >> b) & 1) R('#fff0b0', px - 2, py - 3 + b * 2, 5, 1); else { R('#fff0b0', px - 2, py - 3 + b * 2, 2, 1); R('#fff0b0', px + 1, py - 3 + b * 2, 2, 1); } }
        }
      } else if (f.fx.slice(0, 3) === 'up_') {   // 強化：三枚箭頭往上飄（紅＝攻擊、藍＝防禦、綠＝速度）
        const col = { r: '#ff6040', b: '#60a0ff', g: '#60ff90', y: '#ffd060' }[f.fx[3]], fade = k > 0.75 ? (1 - k) / 0.25 : 1; c.globalAlpha = fade;
        ring(x, y + 10, 5 + k * 9, 2 + k * 4, col);
        for (let i = 0; i < 3; i++) {
          const t2 = (k * 1.4 + i / 3) % 1, px = x + (i - 1) * 8, py = Math.round(y + 10 - t2 * 26); c.globalAlpha = (1 - t2) * fade + 0.15;
          R(col, px, py, 1, 1); R(col, px - 1, py + 1, 3, 1); R(col, px - 2, py + 2, 5, 1); R('#fff', px, py + 3, 1, 4); R(col, px - 1, py + 3, 1, 3); R(col, px + 1, py + 3, 1, 3);
        }
      } else if (f.fx === 'whirl') {   // 旋風斬：刀光繞著身體轉一圈
        for (let i = 0; i < 14; i++) {
          const a = f.t / 55 - i * 0.28; c.globalAlpha = (1 - i / 14) * (k > 0.8 ? (1 - k) / 0.2 : 1);
          R(i < 2 ? '#fff' : '#a0c8ff', x + Math.cos(a) * 15 - 1, y + Math.sin(a) * 9 - 1, i < 3 ? 3 : 2, i < 3 ? 3 : 2);
        }
        c.globalAlpha = 1; if (k > 0.5) { R('#fff', x - 1, y - 5, 3, 11); R('#fff', x - 5, y - 1, 11, 3); }
      } else if (f.fx === 'flurry') {   // 連斬：三道刀光接連劈出
        const dirs = [[1, 1], [-1, 1], [1, 0]];
        for (let j = 0; j < 3; j++) {
          const t = Math.min(1, Math.max(0, k * 3 - j) * 1.8); if (t <= 0) continue; c.globalAlpha = k * 3 - j > 1.2 ? 0.4 : 1;
          for (let i = 0; i < Math.round(14 * t); i++) { const d = dirs[j]; R('#fff', x - 7 * d[0] + i * d[0], y - 7 + i * d[1] + (d[1] ? 0 : 7 + (j - 1) * 3), 2, 1); R('#c8c8ff', x - 7 * d[0] + i * d[0], y - 6 + i * d[1] + (d[1] ? 0 : 7 + (j - 1) * 3), 1, 1); }
        }
      } else if (f.fx === 'execute') {   // 斬將：一道豎直重斬，把人劈成兩半
        const w = Math.min(1, k * 3); c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        if (k < 0.2) { c.globalAlpha = 0.4; R('#fff', x - 22, y - 26, 44, 44); c.globalAlpha = 1; }
        const hh = Math.round(40 * w); R('#ff3030', x - 3, y - 24, 7, hh); R('#fff', x - 1, y - 24, 3, hh); R('#ffe0a0', x - 2, y - 24, 1, hh);
        if (w >= 1) for (let i = 0; i < 8; i++) R(i % 2 ? '#ffe040' : '#ff6030', x + (rnd(i) - 0.5) * 28, y + (rnd(i + 5) - 0.5) * 30, 2, 1);
      } else if (f.fx === 'bloodslash') {   // 飲血刀：紅色刀光，血珠飛向使用者
        const w = Math.min(1, k * 2.4); c.globalAlpha = k < 0.75 ? 1 : (1 - k) / 0.25;
        for (let i = 0; i < Math.round(16 * w); i++) { R('#c01020', x - 8 + i, y - 8 + i, 3, 2); R('#fff', x - 8 + i, y - 8 + i, 1, 1); }
        if (k > 0.3) for (let i = 0; i < 6; i++) { const t2 = Math.min(1, (k - 0.3) * 1.5); R('#ff3040', x - t2 * 30 * (0.4 + rnd(i)), y + (rnd(i + 3) - 0.5) * 12 - t2 * 10, 2, 2); }
      } else if (f.fx === 'dragon') {   // 青龍偃月：弧形的青綠色大刀光
        const w = Math.min(1, k * 2.2); c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        for (let i = 0; i <= Math.round(22 * w); i++) {
          const a = -2.5 + i * 0.14, px = x + Math.cos(a) * 17, py = y + 4 + Math.sin(a) * 15;
          R('#28c070', px - 1, py - 1, 3, 3); R('#d8fff0', px, py, 1, 1);
        }
        if (w >= 1) for (let i = 0; i < 5; i++) R('#a0ffd0', x + (rnd(i) - 0.5) * 24, y + (rnd(i + 4) - 0.5) * 20, 1, 2);
      } else if (f.fx === 'cross') {   // 破陣：叉形交錯的兩道劈斬加衝擊波
        const w = Math.min(1, k * 2.6); c.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        for (let i = 0; i < Math.round(16 * w); i++) { R('#fff', x - 8 + i, y - 8 + i, 2, 1); R('#fff', x + 8 - i, y - 8 + i, 2, 1); R('#ff9040', x - 8 + i, y - 7 + i, 1, 1); R('#ff9040', x + 8 - i, y - 7 + i, 1, 1); }
        if (k > 0.5) ring(x, y, 4 + (k - 0.5) * 30, 3 + (k - 0.5) * 20, '#ffd060');
      } else if (f.fx === 'multithrust') {   // 蛇矛亂舞：數道槍影連刺
        for (let j = 0; j < 4; j++) {
          const t = Math.min(1, Math.max(0, k * 3.2 - j * 0.55) * 2.2); if (t <= 0) continue; c.globalAlpha = 1;
          const yy = y - 9 + j * 6, len = Math.round(26 * t);
          R('#8890a8', x - 18, yy + 1, len, 1); R('#fff', x - 18, yy, len, 1); if (t >= 1) { R('#fff', x + 8, yy - 2, 1, 5); R('#ffe070', x + 7, yy, 3, 1); }
        }
      } else if (f.fx === 'mist') {   // 空城計：濃霧飄過，頭上冒出問號
        c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        for (let i = 0; i < 9; i++) { const px = x - 24 + ((k * 0.9 + rnd(i)) % 1) * 48, py = y - 6 + (rnd(i + 5) - 0.5) * 24; c.globalAlpha *= 1; R('#d0d4e0', px, py, 8, 3); R('#f0f2f8', px + 1, py, 5, 1); }
        c.globalAlpha = 1; R('#fff', x - 1, y - 24, 4, 1); R('#fff', x + 2, y - 23, 1, 3); R('#fff', x, y - 20, 2, 1); R('#fff', x, y - 19, 1, 2); R('#fff', x, y - 16, 1, 1);
      } else if (f.fx === 'confuse') {   // 離間：問號與星星繞著腦袋打轉
        c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        for (let i = 0; i < 4; i++) { const a = f.t / 110 + i * 1.57, px = x + Math.cos(a) * 10, py = y - 14 + Math.sin(a) * 4; R('#e090ff', px - 1, py, 3, 1); R('#e090ff', px, py - 1, 1, 3); R('#fff', px, py, 1, 1); }
        R('#fff', x - 1, y - 26, 3, 1); R('#fff', x + 1, y - 25, 1, 2); R('#fff', x, y - 23, 1, 2); R('#fff', x, y - 20, 1, 1);
        ring(x, y + 8, 5 + k * 10, 2 + k * 4, '#c070ff');
      } else if (f.fx === 'cage') {   // 長圍困獸：木柵欄從天而降圍住
        const t = Math.min(1, k * 2.2); c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        for (let i = 0; i < 5; i++) { const bx = x - 9 + i * 4.5, top = Math.round(y - 30 + t * 12); R('#8a6030', bx, top, 2, 30); R('#d8b070', bx, top, 1, 30); R('#fff', bx, top, 2, 1); }
        if (t >= 1) { R('#6a4020', x - 11, y - 14, 24, 2); R('#6a4020', x - 11, y + 4, 24, 2); }
      } else if (f.fx === 'orb') {   // 調息：藍色光球往身上匯聚
        for (let i = 0; i < 6; i++) {
          const t = Math.min(1, Math.max(0, k * 1.3 - i * 0.07)), a = i * 1.05 + t * 3, rr = 24 * (1 - t); c.globalAlpha = t < 1 ? 1 : 0;
          R('#3090e0', x + Math.cos(a) * rr - 1, y + Math.sin(a) * rr * 0.7 - 1, 3, 3); R('#d8f4ff', x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7, 1, 1);
        }
        if (k > 0.75) { c.globalAlpha = (1 - k) / 0.25; ring(x, y, 4 + (k - 0.75) * 40, 4 + (k - 0.75) * 30, '#80d0ff'); }
      } else if (f.fx === 'purify') {   // 清心訣：白藍色的亮光閃閃升起
        c.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1; ring(x, y + 10, 6 + k * 6, 2 + k * 3, '#a0e8ff');
        for (let i = 0; i < 7; i++) { const t2 = (k * 1.3 + rnd(i)) % 1, px = x + (rnd(i + 9) - 0.5) * 20, py = y + 10 - t2 * 28; R('#fff', px - 1, py, 3, 1); R('#fff', px, py - 1, 1, 3); R('#80d8ff', px, py, 1, 1); }
      } else if (f.fx === 'leaf') {   // 養息：綠色葉片盤旋飄升
        c.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
        for (let i = 0; i < 9; i++) { const t2 = (k * 1.2 + rnd(i)) % 1, px = x + Math.sin(t2 * 6 + i) * 9, py = y + 12 - t2 * 30; R('#40c050', px, py, 3, 2); R('#a0ff90', px, py, 1, 1); }
      } else if (f.fx === 'revive') {   // 復活：一道光柱從天降下，羽毛般的光點升起
        const lw = 8 + Math.round(Math.sin(f.t / 90) * 2); c.globalAlpha = (k < 0.2 ? k / 0.2 : k > 0.8 ? (1 - k) / 0.2 : 1) * 0.55;
        R('#fff8c0', x - lw / 2, y - 50, lw, 66); c.globalAlpha = (k < 0.2 ? k / 0.2 : k > 0.8 ? (1 - k) / 0.2 : 1) * 0.9; R('#ffffff', x - 2, y - 50, 4, 66);
        for (let i = 0; i < 8; i++) { const t2 = (k * 1.2 + rnd(i)) % 1; R('#ffe9a0', x + (rnd(i + 3) - 0.5) * 20, y + 12 - t2 * 40, 1, 2); }
        ring(x, y + 12, 8 + k * 6, 3 + k * 2, '#fff0b0');
      } else if (f.fx === 'bloom') {   // 桃園之誓：桃花瓣紛紛飄落
        c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        for (let i = 0; i < 16; i++) { const t2 = (k * 1.2 + rnd(i)) % 1, px = x + (rnd(i + 8) - 0.5) * 30 + Math.sin(t2 * 6 + i) * 4, py = y - 28 + t2 * 44; R(i % 2 ? '#ff90b8' : '#ffc8dc', px, py, 2, 2); R('#fff', px, py, 1, 1); }
        ring(x, y + 12, 6 + k * 10, 2 + k * 4, '#ff90b8');
      } else if (f.fx === 'paw') {   // 貓步連環計：一個個貓掌印踩下，最後炸開
        const paw = function (px, py, col) { R(col, px - 1, py + 2, 4, 3); R(col, px - 3, py, 1, 2); R(col, px - 1, py - 1, 1, 2); R(col, px + 1, py - 1, 1, 2); R(col, px + 3, py, 1, 2); };
        for (let i = 0; i < 3; i++) { const t = k * 3.2 - i * 0.7; if (t < 0) continue; c.globalAlpha = t > 1.3 ? Math.max(0, 1 - (t - 1.3)) : 1; paw(x - 12 + i * 12, y - 8 + (i % 2) * 8, '#fff'); paw(x - 12 + i * 12, y - 7 + (i % 2) * 8, '#ff90c0'); }
        if (k > 0.75) { c.globalAlpha = (1 - k) / 0.25; ring(x, y, 4 + (k - 0.75) * 50, 4 + (k - 0.75) * 40, '#ff90c0'); }
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
