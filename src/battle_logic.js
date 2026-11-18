// 戰鬥邏輯：不依賴畫面，瀏覽器與 Node 都能執行（方便模擬平衡）。
(function (root) {
  const B = (root.DATA && root.DATA.battle) || null;
  const BL = {};

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (b, lo, hi) => lo + (b.rng() * (hi - lo));
  const pick = (b, arr) => arr[Math.floor(b.rng() * arr.length) % arr.length];

  // 隊員目前可用的技能清單（含路線解鎖）
  BL.skillsFor = function (member, flags) {
    const ids = (B.charSkills[member.id] || []).slice();
    if (member.id === 'nyao' && flags && flags.route && B.routeSkills[flags.route]) {
      B.routeSkills[flags.route].forEach(function (e) { if (member.level >= e[0]) ids.push(e[1]); });
    }
    return ids.map(function (id) { return Object.assign({ id: id }, B.skills[id]); });
  };

  function unitFromMember(m, i) {
    const G = root.Game, e = function (k) { return G && G.eff ? G.eff(m, k) : (m[k] || 0); };
    return { side: 'party', idx: i, ref: m, id: m.id, name: m.name, hp: m.hp, hpMax: m.hpMax, tp: m.tp, tpMax: m.tpMax,
      terr: (root.DATA.characters[m.id] || {}).terrain || {}, atk: e('atk'), pow: G && G.bonus ? G.bonus(m, 'pow') : 0, int: e('int'), def: e('def'), spd: e('spd'), lead: e('lead'), luck: e('luck'), cha: e('lead'), buffs: {}, confused: 0, defending: false, escaped: false };
  }
  function unitFromEnemy(id, i) {
    const e = B.enemies[id];
    return { side: 'enemy', idx: i, id: id, name: e.name, hp: e.hp, hpMax: e.hp, tp: 0, tpMax: 0,
      terr: e.terrain || {}, atk: e.atk, pow: 0, int: e.int != null ? e.int : e.atk, def: e.def, spd: e.spd, lead: e.lead || 0, luck: e.luck || 0, cha: e.lead || 0, exp: e.exp, gold: e.gold, sprite: e.sprite, title: e.title, cls: e.cls, weapon: e.weapon, desc: e.desc, boss: !!e.boss, ai: e.ai || 'plain',
      buffs: {}, confused: 0, defending: false };
  }

  // party：Game.party；group：敵人 id 陣列；opts：{ flags, rng, boss, canFlee }
  BL.newBattle = function (party, group, opts) {
    opts = opts || {};
    const b = {
      party: party.filter(function (m) { return m.hp > 0; }).map(unitFromMember),
      enemies: group.map(unitFromEnemy),
      flags: opts.flags || {}, rng: opts.rng || Math.random, round: 0,
      terrain: opts.terrain || 'plain', fire: opts.fire ? { rounds: opts.fire.rounds.slice(), pct: opts.fire.pct, texts: (opts.fire.texts || []).slice(), n: 0 } : null, canFlee: opts.canFlee !== false, boss: !!opts.boss, allMembers: party
    };
    // 戰死者仍保留在 allMembers，戰鬥結束時同步
    b.party.forEach(function (u, i) { u.idx = i; });
    // 統率：各陣營中最高的統率讓全隊傷害提高（每點 +0.3%）
    const top = function (l) { return l.reduce(function (s, u) { return Math.max(s, u.lead || 0); }, 0) * 0.003; };
    b.leadBonus = top(b.party); b.leadBonusEnemy = top(b.enemies);
    return b;
  };

  BL.eff = function (u, stat) {
    const bf = u.buffs[stat];
    return u[stat] * (bf ? bf.mult : 1);
  };
  BL.alive = function (list) { return list.filter(function (u) { return u.hp > 0 && !u.escaped; }); };

  // 出手順序：速度加一點亂數
  BL.order = function (b) {
    return BL.alive(b.party).concat(BL.alive(b.enemies)).map(function (u) { return { u: u, k: BL.eff(u, 'spd') + rnd(b, 0, 4) }; })
      .sort(function (x, y) { return y.k - x.k; }).map(function (o) { return o.u; });
  };

  BL.beginRound = function (b) {
    b.round++;
    b.party.concat(b.enemies).forEach(function (u) { u.defending = false; });
  };

  BL.endRound = function (b) {
    b.party.concat(b.enemies).forEach(function (u) {
      Object.keys(u.buffs).forEach(function (k) { if (--u.buffs[k].turns <= 0) delete u.buffs[k]; });
      if (u.confused > 0) u.confused--;
    });
    // 每回合回復 1 點戰術點
    b.party.forEach(function (u) { if (u.hp > 0) u.tp = Math.min(u.tpMax, u.tp + 1); });
  };

  BL.outcome = function (b) {
    if (!BL.alive(b.enemies).length) return 'win';
    if (!BL.alive(b.party).length) return 'lose';
    if (b.fled) return 'flee';
    return null;
  };

  // 地形適性：S＋12%、A＋6%、B 不變、C －10%（影響攻擊與防禦）
  const TERR = { S: 1.12, A: 1.06, B: 1, C: 0.9 };
  BL.terrMul = function (b, u) { return TERR[(u.terr && u.terr[b.terrain]) || 'B'] || 1; };
  function lead(b, a) { return 1 + (a.side === 'party' ? (b.leadBonus || 0) : (b.leadBonusEnemy || 0)); }
  function crit(b, a) { return b.rng() < 0.03 + (a.luck || 0) * 0.005 ? 1.5 : 1; }
  let curB = null;
  function physDamage(b, a, t, power) {
    const base = (BL.eff(a, 'atk') * 2 + (a.pow || 0)) * BL.terrMul(b, a) - BL.eff(t, 'def') * BL.terrMul(b, t) * (t.defending ? 1.5 : 1);
    return Math.max(1, Math.round(base * power * rnd(b, 0.9, 1.1) * lead(b, a) * crit(b, a)));
  }
  function tactDamage(b, a, t, power) {
    const base = a.int * 2.2 * BL.terrMul(b, a) - BL.eff(t, 'def') * 0.6 * BL.terrMul(b, t);
    return Math.max(1, Math.round(base * power * rnd(b, 0.9, 1.1) * lead(b, a)));
  }

  function hurt(t, dmg, ev) {
    if (t.luck && curB && curB.rng() < t.luck * 0.003) { ev.push({ type: 'msg', text: t.name + '閃過了攻擊！' }); return; }
    t.hp = Math.max(0, t.hp - dmg);
    ev.push({ type: 'dmg', target: t, amount: dmg, dead: t.hp <= 0, hpAfter: t.hp });
  }

  // 要打誰：若行動者混亂，目標改成隨機（可能打到自己人）
  function resolveTargets(b, a, action, skill) {
    const foes = a.side === 'party' ? b.enemies : b.party;
    const friends = a.side === 'party' ? b.party : b.enemies;
    const kind = skill ? skill.target : 'one';
    if (kind === 'all') return BL.alive(foes);
    if (kind === 'allAlly') return BL.alive(friends);
    if (kind === 'self') return [a];
    if (kind === 'ally') {
      const t = action.target && action.target.hp > 0 ? action.target : BL.alive(friends)[0];
      return t ? [t] : [];
    }
    // 單體敵方
    let t = action.target;
    if (action.auto) t = BL.alive(foes).sort(function (x, y) { return x.hp - y.hp; })[0];   // 全體攻擊：集火兵力最少者
    if (a.confused > 0) t = pick(b, BL.alive(friends));   // 混亂：打自己人
    if (!t || t.hp <= 0 || t.escaped) t = BL.alive(a.confused > 0 ? friends : foes)[0];
    return t ? [t] : [];
  }

  // action：{ type:'attack'|'skill'|'item'|'defend'|'flee', skill:id, item:id, target:unit }
  BL.perform = function (b, a, action) {
    curB = b;
    const ev = [];
    if (a.hp <= 0 || a.escaped) return ev;
    const t0 = action.type;

    if (t0 === 'defend') {
      a.defending = true;
      ev.push({ type: 'msg', text: a.name + '擺出防禦架勢' });
      return ev;
    }

    if (t0 === 'flee') {
      let ok = false;
      if (b.canFlee) {
        const foeSpd = BL.alive(b.enemies).reduce(function (s, u) { return Math.max(s, u.spd); }, 0);
        const chance = clamp(0.5 + (a.spd - foeSpd) * 0.04 + (a.cha || 0) * 0.004, 0.25, 0.9);   // 魅力高的人更容易全身而退
        ok = b.rng() < chance;
      }
      ev.push({ type: 'msg', text: b.canFlee ? (ok ? '成功逃離了！' : '逃不掉！') : '這場戰鬥不能逃跑！' });
      if (ok) b.fled = true;
      return ev;
    }

    if (t0 === 'item') {
      const it = B.items[action.item];
      if (!it) return ev;
      const inv = root.Game && root.Game.items;
      if (inv) { if (!(inv[action.item] > 0)) { ev.push({ type: 'msg', text: '沒有這個道具了' }); return ev; } inv[action.item]--; }
      ev.push({ type: 'msg', text: a.name + '使用' + it.name });
      if (it.escape) {
        if (b.canFlee) { b.fled = true; ev.push({ type: 'msg', text: '煙霧瀰漫，全員逃離了！' }); }
        else ev.push({ type: 'msg', text: '但是沒有效果……' });
        return ev;
      }
      const t = action.target && action.target.hp > 0 ? action.target : a;
      if (it.hp) { const h = Math.min(it.hp, t.hpMax - t.hp); t.hp += h; ev.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp }); }
      if (it.tp) { const g = Math.min(it.tp, t.tpMax - t.tp); t.tp += g; ev.push({ type: 'tp', target: t, amount: g }); }
      return ev;
    }

    let skill = null;
    if (t0 === 'skill') {
      skill = B.skills[action.skill];
      if (!skill || a.tp < skill.tp) { ev.push({ type: 'msg', text: a.name + '戰術點不足' }); return ev; }
      a.tp -= skill.tp;
      ev.push({ type: 'msg', text: a.name + '使出' + skill.name });
    } else {
      if (a.confused > 0) ev.push({ type: 'msg', text: a.name + '陷入混亂！' });
      else ev.push({ type: 'msg', text: a.name + '發動攻擊' });
    }

    ev.push({ type: 'act', actor: a, kind: (!skill || skill.kind === 'phys') ? 'swing' : 'cast' });
    const targets = resolveTargets(b, a, action, skill);
    if (!targets.length) return ev;

    const kind = skill ? skill.kind : 'phys';
    targets.forEach(function (t) {
      if (kind === 'phys') {
        const hits = (skill && skill.hits) || 1, power = skill ? skill.power : 1;
        for (let i = 0; i < hits && t.hp > 0; i++) hurt(t, physDamage(b, a, t, power), ev);
      } else if (kind === 'tact') {
        hurt(t, tactDamage(b, a, t, skill.power), ev);
      } else if (kind === 'heal') {
        const h = Math.min(Math.round(a.int * skill.power), t.hpMax - t.hp);
        t.hp += h; ev.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp });
      } else if (kind === 'buff') {
        t.buffs[skill.stat] = { mult: 1 + (skill.mult - 1) * (1 + (a.cha || 0) / 100), turns: skill.turns + 1 };   // 魅力讓鼓舞更有效
        ev.push({ type: 'status', target: t, text: t.name + (skill.stat === 'atk' ? '氣勢大振' : '防禦提升') });
      } else if (kind === 'debuff') {
        t.buffs[skill.stat] = { mult: Math.max(0.4, 1 - (1 - skill.mult) * (1 + (a.cha || 0) / 100)), turns: skill.turns + 1 };
        ev.push({ type: 'status', target: t, text: t.name + '被震懾，攻擊下降' });
      } else if (kind === 'confuse') {
        // 智力越高越容易成功；頭目抵抗較強
        const chance = clamp(0.55 + (a.int - t.def) * 0.02 + (a.cha || 0) * 0.005 - (t.boss ? 0.35 : 0), 0.15, 0.9);
        if (b.rng() < chance) { t.confused = skill.turns + 1; ev.push({ type: 'status', target: t, text: t.name + '陷入混亂' }); }
        else ev.push({ type: 'msg', text: t.name + '識破了計謀' });
      }
    });
    return ev;
  };

  // 敵方行動決策
  BL.planEnemy = function (b, u) {
    const targets = BL.alive(b.party);
    if (!targets.length) return { type: 'defend' };
    // 傾向攻擊血量較低者，但保留隨機
    let t = pick(b, targets);
    if (b.rng() < 0.4) t = targets.slice().sort(function (x, y) { return x.hp - y.hp; })[0];
    if (u.confused > 0) return { type: 'attack', target: pick(b, BL.alive(b.enemies)) };
    if (u.ai === 'boss') {
      const roll = b.rng();
      if (roll < 0.25) return { type: 'boss_all' };
      if (roll < 0.40 && !u.defending) return { type: 'boss_heavy', target: t };
    }
    return { type: 'attack', target: t };
  };

  // 頭目專屬招式（敵方技能不耗 TP）
  const oldPerform = BL.perform;
  BL.perform = function (b, a, action) {
    curB = b;
    if (action.type === 'boss_all') {
      const ev = [{ type: 'msg', text: a.name + '揮軍衝鋒！' }];
      BL.alive(b.party).forEach(function (t) { hurt(t, Math.max(1, Math.round(physDamage(b, a, t, 0.7))), ev); });
      return ev;
    }
    if (action.type === 'boss_heavy') {
      const ev = [{ type: 'msg', text: a.name + '大喝一聲，使出重斬！' }];
      const t = action.target && action.target.hp > 0 ? action.target : BL.alive(b.party)[0];
      if (t) hurt(t, physDamage(b, a, t, 1.6), ev);
      return ev;
    }
    return oldPerform(b, a, action);
  };

  // 勝利結算：經驗平分給存活隊員，金錢直接加總
  BL.victory = function (b) {
    let exp = 0, gold = 0;
    b.enemies.forEach(function (e) { exp += e.exp; gold += e.gold; });
    const winners = BL.alive(b.party);
    const share = exp;   // 每位存活隊員都拿全額經驗
    return { exp: exp, share: share, gold: gold };
  };

  // 同步戰鬥結果回隊員資料（兵力、戰術點）
  BL.syncBack = function (b) {
    b.party.forEach(function (u) { u.ref.hp = u.hp; u.ref.tp = u.tp; });
  };

  // 升到第 n 級所需的累積經驗：沒有等級上限，越高級每一級需要的經驗越多
  //   每級增量：2 級 12；3～9 級 10×(n-1)；10 級起 10×(n-1) + (n-1)²/6，一路遞增
  const expCache = [0, 0];
  BL.expFor = function (n) {
    if (n <= 1) return 0;
    for (let k = expCache.length; k <= n; k++) {
      const d = k === 2 ? 12 : (10 * (k - 1) + (k > 9 ? Math.floor((k - 1) * (k - 1) / 6) : 0));
      expCache[k] = expCache[k - 1] + d;
    }
    return expCache[n];
  };

  // 戰場事件「縱火」：指定回合結束時，場上所有敵人受到最大兵力一定比例的火燒傷害（可燒死雜兵，頭目最少留 1 兵力）
  BL.fireEvents = function (b) {
    const f = b.fire;
    if (!f || f.rounds.indexOf(b.round) < 0 || f.done === b.round) return [];
    f.done = b.round;
    const ev = [{ type: 'msg', text: f.texts[f.n] || '火勢蔓延，敵軍陷入混亂！' }]; f.n++;
    b.enemies.forEach(function (e) {
      if (e.hp <= 0) return;
      let d = Math.max(1, Math.round(e.hpMax * f.pct));
      if (e.boss) d = Math.min(d, e.hp - 1);
      e.hp = Math.max(0, e.hp - d);
      ev.push({ type: 'dmg', target: e, amount: d, dead: e.hp <= 0, hpAfter: e.hp });
    });
    return ev;
  };

  // 隨機替某項能力 +1（舊存檔的剩餘能力點用）
  const RANDOM_KEYS = ['atk', 'int', 'spd', 'lead', 'luck', 'grd'];
  BL.randomStat = function (m) { const k = RANDOM_KEYS[Math.floor(Math.random() * RANDOM_KEYS.length)]; m[k] = (m[k] || 0) + 1; return k; };

  // 給經驗並處理升級：依成長率自動隨機成長（沒有人手動配點）
  BL.gainExp = function (member, amount, rng) {
    const out = [];
    rng = rng || Math.random;
    member.exp += amount;
    while (member.exp >= BL.expFor(member.level + 1)) {
      member.level++;
      const c = root.DATA.characters[member.id] || {}, g = c.growth || {};
      const gain = { name: member.name, level: member.level, hp: 0, atk: 0, int: 0, spd: 0, lead: 0, luck: 0, grd: 0, tp: 0 };
      gain.hp = Math.round((g.hp || 12) * (0.8 + rng() * 0.4));
      member.hpMax += gain.hp; member.hp = Math.min(member.hpMax, member.hp + gain.hp);
      ['atk', 'int', 'spd', 'lead', 'luck', 'grd', 'tp'].forEach(function (k) {
        const r = g[k] || 0; let n = Math.floor(r); if (rng() < r - n) n++;
        gain[k] = n;
        if (k === 'tp') member.tpMax += n; else member[k] = (member[k] || 0) + n;
      });
      root.Game && root.Game.recalc ? root.Game.recalc(member) : (member.def = Math.round(member.hpMax * 0.08));
      out.push(gain);
    }
    return out;
  };

  // 戰利品：依掉落表擲骰
  BL.drops = function (b, rng) {
    const out = [], tbl = (root.DATA && root.DATA.drops) || {};
    rng = rng || Math.random;
    b.enemies.forEach(function (e) { const d = tbl[e.id]; if (d && rng() < d[1]) out.push(d[0]); });
    return out;
  };

  root.BattleLogic = BL;
  if (typeof module !== 'undefined') module.exports = BL;
})(typeof window !== 'undefined' ? window : globalThis);
