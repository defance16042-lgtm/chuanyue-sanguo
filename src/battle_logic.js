// 戰鬥邏輯：不依賴畫面，瀏覽器與 Node 都能執行（方便模擬平衡）。
(function (root) {
  const B = (root.DATA && root.DATA.battle) || null;
  const BL = {};

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (b, lo, hi) => lo + (b.rng() * (hi - lo));
  const pick = (b, arr) => arr[Math.floor(b.rng() * arr.length) % arr.length];

  // 隊員目前可用的技能清單（含路線解鎖）
  BL.skillsFor = function (member, flags) {
    const ids = [];
    const add = function (e) {
      const lv = Array.isArray(e) ? e[0] : 1, id = Array.isArray(e) ? e[1] : e;
      if ((member.level || 1) >= lv && ids.indexOf(id) < 0) ids.push(id);
    };
    (B.charSkills[member.id] || []).forEach(add);
    if (member.id === 'nyao' && flags && flags.route && B.routeSkills[flags.route]) B.routeSkills[flags.route].forEach(add);
    const G0 = root.Game;
    if (G0 && G0.advisor === member.id && B.advisorSkills && B.advisorSkills[member.id]) B.advisorSkills[member.id].forEach(add);   // 軍師專屬計謀
    const gone = {};   // 高階技能取代低階技能
    ids.forEach(function (id) { let r = B.skills[id] && B.skills[id].replaces; while (r && !gone[r]) { gone[r] = 1; r = B.skills[r] && B.skills[r].replaces; } });
    return ids.filter(function (id) { return !gone[id]; }).map(function (id) { return Object.assign({ id: id, adv: /^adv_/.test(id) }, B.skills[id]); });
  };

  function unitFromMember(m, i) {
    const G = root.Game, e = function (k) { return G && G.eff ? G.eff(m, k) : (m[k] || 0); };
    return { side: 'party', idx: i, ref: m, id: m.id, name: m.name, hp: m.hp, hpMax: m.hpMax, tp: Math.min(m.tp, G && G.tpMaxOf ? G.tpMaxOf(m) : m.tpMax), tpMax: G && G.tpMaxOf ? G.tpMaxOf(m) : m.tpMax, wtype: BL.weaponTypeOf(m), isAdvisor: !!(G && G.advisor && G.advisor === m.id),
      terr: (root.DATA.characters[m.id] || {}).terrain || {}, home: (root.DATA.characters[m.id] || {}).home || 'plain', atk: e('atk'), pow: G && G.bonus ? G.bonus(m, 'pow') : 0, int: e('int'), def: e('def'), spd: e('spd'), lead: e('lead'), luck: e('luck'), cha: e('lead'), buffs: {}, confused: 0, defending: false, escaped: false };
  }
  // 武器種類：優先看身上裝備的武器，沒有就用角色本來的武器類別
  BL.weaponTypeOf = function (m) {
    const eq = m.equip && m.equip.weapon, w = eq && root.DATA.equipment && root.DATA.equipment[eq];
    return (w && w.wtype) || (root.DATA.characters[m.id] || {}).weapon || '劍';
  };
  function unitFromEnemy(id, i) {
    const e = B.enemies[id];
    return { side: 'enemy', idx: i, id: id, name: e.name, hp: e.hp, hpMax: e.hp, tp: 0, tpMax: 0,
      terr: e.terrain || {}, home: e.home || 'plain', atk: e.atk, pow: 0, int: e.int != null ? e.int : e.atk, def: e.def, spd: e.spd, lead: e.lead || 0, luck: e.luck || 0, cha: e.lead || 0, exp: e.exp, gold: e.gold, sprite: e.sprite, wtype: e.weapon || '刀', title: e.title, cls: e.cls, weapon: e.weapon, desc: e.desc, boss: !!e.boss, ai: e.ai || 'plain',
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
    const G1 = root.Game;
    BL.applyFormation(b, opts.formation !== undefined ? opts.formation : (G1 && G1.formation) || 'none');
    return b;
  };

  BL.eff = function (u, stat) {
    const bf = u.buffs[stat];
    return u[stat] * (bf ? bf.mult : 1) * ((u.fm && u.fm[stat]) || 1);   // fm＝陣形加成
  };
  // 陣形：誰能擺、套用到戰鬥單位
  BL.formationUsable = function (id, party) {
    const f = root.DATA.formations && root.DATA.formations[id]; if (!f) return false;
    const ny = (party || []).filter(function (m) { return m.id === 'nyao'; })[0];
    if (f.only) { if (!party.some(function (m) { return m.id === f.only; })) return false; }
    return f.unlock <= 0 || (ny ? ny.level >= f.unlock : false);
  };
  BL.applyFormation = function (b, id) {
    const f = root.DATA.formations && root.DATA.formations[id];
    b.formation = null; if (!f || id === 'none') return;
    b.formation = Object.assign({ id: id }, f);
    b.party.forEach(function (u, i) {
      const fm = {}, add = function (o) { Object.keys(o || {}).forEach(function (k) { fm[k] = (fm[k] || 1) * o[k]; }); };
      const r = f.rows ? (f.rows[i] == null ? 1 : f.rows[i]) : 1;   // 站哪一排只看第幾位
      add(f.all); add(f[['front', 'mid', 'back'][r]]);
      u.fm = fm; u.rowKind = r;
    });
    if (f.foe) b.enemies.forEach(function (u) { u.fm = Object.assign({}, f.foe); });
  };
  BL.alive = function (list) { return list.filter(function (u) { return u.hp > 0 && !u.escaped; }); };

  // 出手順序：速度加一點亂數
  BL.order = function (b) {
    return BL.alive(b.party).concat(BL.alive(b.enemies)).map(function (u) { return { u: u, k: BL.eff(u, 'spd') + rnd(b, 0, 4) + (b.formation && b.formation.first && b.round === 1 && u.side === 'party' ? 100 : 0) }; })
      .sort(function (x, y) { return y.k - x.k; }).map(function (o) { return o.u; });
  };

  BL.beginRound = function (b) {
    b.round++;
    b.party.concat(b.enemies).forEach(function (u) { u.defending = false; });
    const f = b.formation, healed = [];
    if (f && f.heal && b.round > 1) b.party.forEach(function (u) {
      if (u.hp > 0 && u.hp < u.hpMax) { const h = Math.max(1, Math.min(u.hpMax - u.hp, Math.round(u.hpMax * f.heal))); u.hp += h; healed.push({ u: u, h: h }); }
    });
    return healed;
  };

  BL.endRound = function (b) {
    b.party.concat(b.enemies).forEach(function (u) {
      Object.keys(u.buffs).forEach(function (k) { if (--u.buffs[k].turns <= 0) delete u.buffs[k]; });
      if (u.confused > 0) u.confused--;
      if (u.stun > 0) u.stun--;
      if (u.taunt > 0) u.taunt--;
    });
    // 每回合回復 1 點戰術點
    b.party.forEach(function (u) { if (u.hp > 0) u.tp = Math.min(u.tpMax, u.tp + 1 + (u.isAdvisor ? 1 : 0) + ((b.formation && b.formation.tp) || 0)); });
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
    const base = BL.eff(a, 'int') * 2.2 * BL.terrMul(b, a) - BL.eff(t, 'def') * 0.6 * BL.terrMul(b, t);
    return Math.max(1, Math.round(base * power * rnd(b, 0.9, 1.1) * lead(b, a)));
  }

  // 附帶效果：打中之後順便削弱對手（水淹七軍會讓敵軍行動遲緩）
  function rider(skill, t, ev) {
    if (!skill || !skill.rider || t.hp <= 0) return;
    t.buffs[skill.rider.stat] = { mult: skill.rider.mult, turns: skill.rider.turns + 1 };
    ev.push({ type: 'status', target: t, text: t.name + ({ spd: '行動遲緩', def: '防禦崩潰', atk: '攻擊下降' }[skill.rider.stat] || '能力下降') });
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
    // 可選單體／全體的計謀：全體模式依技能種類打全敵或補全隊
    if (skill && skill.choice && action.mode === 'all') return BL.alive(skill.kind === 'heal' ? friends : foes);
    if (kind === 'all') return BL.alive(foes);
    if (kind === 'allAlly') return BL.alive(friends);
    if (kind === 'self') return [a];
    if (kind === 'deadAlly') {
      const dead = friends.filter(function (u) { return u.hp <= 0 && !u.escaped; });
      const t = action.target && action.target.hp <= 0 ? action.target : dead[0];
      return t ? [t] : [];
    }
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
      if (it.revive) {
        const dead = b.party.filter(function (u) { return u.hp <= 0 && !u.escaped; });
        const t = action.target && action.target.hp <= 0 ? action.target : dead[0];
        if (!t) { ev.push({ type: 'msg', text: '但是沒有倒下的同伴……' }); if (inv) inv[action.item]++; return ev; }
        const h = Math.max(1, Math.round(t.hpMax * it.revive)); t.hp = h; t.defending = false; t.confused = 0; t.buffs = {};
        ev.push({ type: 'msg', text: t.name + '復活了！' }); ev.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp });
        return ev;
      }
      const t = action.target && action.target.hp > 0 ? action.target : a;
      if (it.hp) { const h = Math.min(it.hp, t.hpMax - t.hp); t.hp += h; ev.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp }); }
      if (it.tp) { const g = Math.min(it.tp, t.tpMax - t.tp); t.tp += g; ev.push({ type: 'tp', target: t, amount: g }); }
      return ev;
    }

    let skill = null, allMode = false;
    if (t0 === 'skill') {
      skill = B.skills[action.skill];
      allMode = !!(skill && skill.choice && action.mode === 'all');
      const cost = skill ? (allMode && skill.allTp ? skill.allTp : skill.tp) : 0;
      if (!skill || a.tp < cost) { ev.push({ type: 'msg', text: a.name + '戰術點不足' }); return ev; }
      a.tp -= cost;
      ev.push({ type: 'msg', text: a.name + '使出' + skill.name + (skill.choice ? (allMode ? '（全體）' : '（單體）') : '') });
    } else {
      if (a.confused > 0) ev.push({ type: 'msg', text: a.name + '陷入混亂！' });
      else ev.push({ type: 'msg', text: a.name + '發動攻擊' });
    }

    ev.push({ type: 'act', actor: a, kind: (!skill || skill.kind === 'phys') ? 'swing' : 'cast' });
    const targets = resolveTargets(b, a, action, skill);
    if (!targets.length) return ev;

    const kind = skill ? skill.kind : 'phys';
    const power0 = skill ? (allMode && skill.allPower ? skill.allPower : skill.power) : 1;
    let fxName = skill ? (skill.fx || (kind === 'tact' ? 'bolt' : kind === 'heal' ? 'heal' : 'slash')) : 'slash';
    if (fxName === 'slash') fxName = BL.weaponFx(a.wtype);
    // 特效等級：計謀／回復看「智力×威力」，越高越強（火焰越高）；物理看威力
    let level = kind === 'tact' ? clamp(1 + Math.floor(a.int * power0 / 22), 1, 5)
      : kind === 'heal' ? clamp(1 + Math.floor(a.int * power0 / 40), 1, 4)
      : clamp(1 + Math.floor((power0 - 0.7) / 0.5), 1, 3);
    const fxEv = [], resEv = [];
    if (skill && skill.fxLevel) level = skill.fxLevel;
    targets.forEach(function (t) {
      fxEv.push({ type: 'fx', fx: fxName, target: t, level: level });
      if (kind === 'phys') {
        const hits = (skill && skill.hits) || 1;
        for (let i = 0; i < hits && t.hp > 0; i++) {
          const hp0 = t.hp, pw = power0 * (1 + ((skill && skill.lowBonus) || 0) * (1 - t.hp / t.hpMax));   // 斬將：對方兵力越少越痛
          hurt(t, physDamage(b, a, t, pw), resEv);
          if (skill && skill.leech && hp0 > t.hp && a.hp > 0) {   // 飲血：把造成傷害的一部分吸回自己
            const g = Math.min(Math.round((hp0 - t.hp) * skill.leech), a.hpMax - a.hp);
            if (g > 0) { a.hp += g; resEv.push({ type: 'heal', target: a, amount: g, hpAfter: a.hp }); }
          }
        }
        rider(skill, t, resEv);
      } else if (kind === 'tact') {
        hurt(t, tactDamage(b, a, t, power0), resEv);
        rider(skill, t, resEv);
      } else if (kind === 'dot') {
        t.dot = { pct: skill.pct, turns: skill.turns };
        resEv.push({ type: 'status', target: t, text: t.name + '中毒了' });
      } else if (kind === 'hot') {
        t.hot = { pct: skill.pct, turns: skill.turns };
        resEv.push({ type: 'status', target: t, text: t.name + '開始持續回復' });
      } else if (kind === 'cleanse') {
        t.confused = 0; t.stun = 0; t.dot = null;
        Object.keys(t.buffs).forEach(function (k) { if (t.buffs[k].mult < 1) delete t.buffs[k]; });
        resEv.push({ type: 'status', target: t, text: t.name + '的異狀被解除了' });
        if (skill.healPct) { const h = Math.min(Math.round(t.hpMax * skill.healPct), t.hpMax - t.hp); if (h > 0) { t.hp += h; resEv.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp }); } }
      } else if (kind === 'stun') {
        const chance = clamp(0.7 + (a.int - t.def) * 0.01 - (t.boss ? 0.4 : 0), 0.15, 0.9);
        if (b.rng() < chance) { t.stun = skill.turns + 1; resEv.push({ type: 'status', target: t, text: t.name + '被震暈了' }); }
        else resEv.push({ type: 'msg', text: t.name + '穩住了身形' });
      } else if (kind === 'taunt') {
        t.taunt = skill.turns + 1;
        if (skill.stat) t.buffs[skill.stat] = { mult: skill.mult, turns: skill.turns + 1 };
        resEv.push({ type: 'status', target: t, text: t.name + '大聲叫陣，敵軍的目光都被吸引過來' });
      } else if (kind === 'heal') {
        const h = Math.min(Math.round(a.int * power0), t.hpMax - t.hp);
        t.hp += h; resEv.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp });
      } else if (kind === 'revive') {
        const h = Math.max(1, Math.round(t.hpMax * skill.pct)); t.hp = h; t.confused = 0; t.buffs = {}; t.defending = false; t.stun = 0; t.dot = null;
        resEv.push({ type: 'msg', text: t.name + '復活了！' }); resEv.push({ type: 'heal', target: t, amount: h, hpAfter: t.hp });
      } else if (kind === 'tpgive') {
        const g = Math.max(1, Math.min(Math.round(a.int * power0), t.tpMax - t.tp)); t.tp += g;
        resEv.push({ type: 'tp', target: t, amount: g });
      } else if (kind === 'buff') {
        t.buffs[skill.stat] = { mult: 1 + (skill.mult - 1) * (1 + (a.cha || 0) / 100), turns: skill.turns + 1 };   // 統率讓鼓舞更有效
        resEv.push({ type: 'status', target: t, text: t.name + ({ atk: '氣勢大振', def: '防禦提升', spd: '行動加快' }[skill.stat] || '能力提升') });
        if (skill.extra) t.buffs[skill.extra.stat] = { mult: skill.extra.mult, turns: skill.turns + 1 };
      } else if (kind === 'debuff') {
        t.buffs[skill.stat] = { mult: Math.max(0.4, 1 - (1 - skill.mult) * (1 + (a.cha || 0) / 100)), turns: skill.turns + 1 };
        resEv.push({ type: 'status', target: t, text: t.name + ({ atk: '被震懾，攻擊下降', def: '防禦崩潰', spd: '行動遲緩' }[skill.stat] || '能力下降') });
      } else if (kind === 'confuse') {
        // 智力越高越容易成功；頭目抵抗較強
        const chance = clamp(0.55 + (a.int - t.def) * 0.02 + (a.cha || 0) * 0.005 - (t.boss ? 0.35 : 0), 0.15, 0.9);
        if (b.rng() < chance) { t.confused = skill.turns + 1; resEv.push({ type: 'status', target: t, text: t.name + '陷入混亂' }); }
        else resEv.push({ type: 'msg', text: t.name + '識破了計謀' });
      }
    });
    // 先同時播放所有目標的特效，等特效演完才結算傷害（扣血跟著命中）
    Array.prototype.push.apply(ev, fxEv);
    ev.push({ type: 'wait', ms: BL.FX_MS[fxName] ? BL.FX_MS[fxName] + (fxName === 'fire' ? level * 70 : 0) : 300 });
    Array.prototype.push.apply(ev, resEv);
    return ev;
  };

  BL.FX_MS = { fire: 620, bolt: 520, heal: 560, slash: 230, chop: 280, thrust: 230, axe: 300, arrow: 260, wave: 320, aura: 520, star: 520, shock: 400 };
  // 武器種類 → 命中特效：劍＝細長斬、刀＝粗重弧斬、矛／槍＝直刺、斧＝劈砍、弓＝箭矢、扇＝氣波
  BL.weaponFx = function (w) { return { '劍': 'slash', '刀': 'chop', '矛': 'thrust', '槍': 'thrust', '斧': 'axe', '弓': 'arrow', '扇': 'wave' }[w] || 'slash'; };

  // 敵方行動決策
  BL.planEnemy = function (b, u) {
    const targets = BL.alive(b.party);
    if (!targets.length) return { type: 'defend' };
    // 傾向攻擊血量較低者，但保留隨機
    let t = pick(b, targets);
    if (b.rng() < 0.4) t = targets.slice().sort(function (x, y) { return x.hp - y.hp; })[0];
    if (u.confused > 0) return { type: 'attack', target: pick(b, BL.alive(b.enemies)) };
    const bait = targets.filter(function (x) { return x.taunt > 0; });
    if (bait.length && b.rng() < 0.85) t = bait[0];   // 被叫陣的敵人多半衝著他來
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
    if (a.stun > 0) return [{ type: 'msg', text: a.name + '被震暈，無法行動！' }];
    if (action.type === 'boss_all') {
      const ev = [{ type: 'msg', text: a.name + '揮軍衝鋒！' }];
      BL.alive(b.party).forEach(function (t) { ev.push({ type: 'fx', fx: 'slash', target: t, level: 1 }); });
      ev.push({ type: 'wait', ms: 230 });
      BL.alive(b.party).forEach(function (t) { hurt(t, Math.max(1, Math.round(physDamage(b, a, t, 0.7))), ev); });
      return ev;
    }
    if (action.type === 'boss_heavy') {
      const ev = [{ type: 'msg', text: a.name + '大喝一聲，使出重斬！' }];
      const t = action.target && action.target.hp > 0 ? action.target : BL.alive(b.party)[0];
      if (t) { ev.push({ type: 'fx', fx: 'slash', target: t, level: 3 }); ev.push({ type: 'wait', ms: 230 }); hurt(t, physDamage(b, a, t, 1.6), ev); }
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
  //   每級增量：2 級 12；3～9 級 10×(n-1)；10 級起 10×(n-1) + (n-1)²/6，一路遞增；改成立方曲線：每級增量 = 23 + 10j + 0.9j² + 0.02j³（j = 級數 - 2），高等級升級要的經驗暴增
  const expCache = [0, 0];
  BL.expFor = function (n) {
    if (n <= 1) return 0;
    for (let k = expCache.length; k <= n; k++) {
      const j = k - 2, d = Math.round(23 + 10 * j + 0.9 * j * j + 0.02 * j * j * j);   // 每一級的增量越來越大（立方曲線）
      expCache[k] = expCache[k - 1] + d;
    }
    return expCache[n];
  };

  // 回合結束：中毒扣兵力、持續回復加兵力
  BL.statusEvents = function (b) {
    const ev = [];
    b.party.concat(b.enemies).forEach(function (u) {
      if (u.hp <= 0 || u.escaped) return;
      if (u.dot) {
        let d = Math.max(1, Math.round(u.hpMax * u.dot.pct)); if (u.boss) d = Math.min(d, u.hp - 1);
        if (d > 0) { u.hp = Math.max(0, u.hp - d); ev.push({ type: 'dmg', target: u, amount: d, dead: u.hp <= 0, hpAfter: u.hp }); }
        if (--u.dot.turns <= 0) u.dot = null;
      }
      if (u.hot && u.hp > 0) {
        const h = Math.min(Math.max(1, Math.round(u.hpMax * u.hot.pct)), u.hpMax - u.hp);
        if (h > 0) { u.hp += h; ev.push({ type: 'heal', target: u, amount: h, hpAfter: u.hp }); }
        if (--u.hot.turns <= 0) u.hot = null;
      }
    });
    return ev;
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
