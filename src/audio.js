// 音樂與音效：全部用 WebAudio 即時合成（方波／三角波／噪音），曲子都是原創，以 MIDI 音符的方式寫成。
// 場景決定曲目：標題、村莊、大地圖、洞穴、一般戰鬥、將領戰（高潮）、勝利、戰敗；計謀特效各有專屬音效。按 M 鍵可靜音。
(function () {
  const A = window.Audio2 = {};
  let ctx = null, master = null, muted = false, wantTrack = null, cur = null, noiseBuf = null;
  try { muted = localStorage.getItem('chuanyue-muted') === '1'; } catch (e) { /* 沒有儲存空間也沒關係 */ }

  // ---------- 記譜：音名 → MIDI ----------
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function n(name) { const m = /^([A-G])([#b]?)(\d)$/.exec(name); return (Number(m[3]) + 1) * 12 + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
  const T = function (s) { return s.trim().split(/\s+/); };
  // 琶音：chords＝每小節一組和弦音（音名），pat＝每個音取和弦第幾個音（3＝高八度的根音）
  function arp(chords, pat) {
    const out = [];
    chords.forEach(function (ch) { const m = ch.map(n); pat.forEach(function (i) { out.push(i === 3 ? m[0] + 12 : m[i]); }); });
    return out;
  }
  // 低音：roots＝每小節根音，pat＝每格：0 根音、1 高八度、'.' 休息
  function bass(roots, pat) {
    const out = [];
    roots.forEach(function (r) { const m = n(r); pat.forEach(function (i) { out.push(i === '.' || i === '-' ? i : i === 1 ? m + 12 : m); }); });
    return out;
  }
  const rep = function (s, k) { return new Array(k + 1).join(s); };   // 鼓譜：不含空白
  const B = function (bars) { return T(bars.join(' ')); };          // 每小節一串記號，合併成整首

  // ---------- 曲目 ----------
  // voice：wave（pulse 的 duty 或 'tri'）、vol、res（每個記號佔幾個十六分音符）、notes（音名／MIDI 數字／'.' 休息／'-' 延長）
  // drums：每格一個字元 K 底鼓 S 小鼓 H 踩鈸 .
  const TRACKS = {};

  // 村莊：五聲音階，輕鬆安穩
  TRACKS.village = { bpm: 92, loop: true, voices: [
    { wave: 0.25, vol: 0.5, res: 2, notes: B(['E5 - G5 - A5 - G5 -', 'E5 - D5 - C5 - . -', 'D5 - E5 - G5 - E5 -', 'D5 - C5 - A4 - . -', 'E5 - G5 - A5 - C6 -', 'A5 - G5 - E5 - G5 -', 'A5 - G5 - E5 - D5 -', 'C5 - - - . - . -']) },
    { wave: 0.5, vol: 0.28, res: 2, notes: arp([['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4']], [0, 1, 2, 1, 0, 1, 2, 1]) },
    { wave: 'tri', vol: 0.55, res: 2, notes: bass(['C3', 'A2', 'C3', 'G2', 'F2', 'C3', 'F2', 'C3'], [0, '.', 1, '.', 0, '.', 1, '.']) },
    { drums: rep('H...............', 8), vol: 0.12 }
  ] };

  // 大地圖：英氣昂揚的行軍曲
  TRACKS.world = { bpm: 118, loop: true, voices: [
    { wave: 0.25, vol: 0.5, res: 2, notes: B(['D5 - . D5 F5 - A5 -', 'G5 - F5 - E5 - D5 -', 'D5 - . D5 F5 - A5 -', 'C6 - A5 - G5 - . -', 'A5 - A5 G5 F5 - G5 -', 'A5 - D6 - C6 - A5 -', 'G5 - F5 E5 D5 - E5 F5', 'D5 - - - . . . .']) },
    { wave: 0.5, vol: 0.26, res: 2, notes: arp([['D4', 'F4', 'A4'], ['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['C4', 'E4', 'G4'], ['Bb3', 'D4', 'F4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['D4', 'F4', 'A4']], [0, 2, 1, 2, 0, 2, 1, 2]) },
    { wave: 'tri', vol: 0.6, res: 2, notes: bass(['D3', 'C3', 'D3', 'C3', 'Bb2', 'F2', 'C3', 'D3'], [0, 0, 1, 0, 0, 0, 1, 0]) },
    { drums: rep('K...H...S...H...', 8), vol: 0.14 }
  ] };

  // 洞穴：低沉、稀疏，偶有水滴
  TRACKS.cave = { bpm: 66, loop: true, voices: [
    { wave: 0.125, vol: 0.32, res: 4, notes: B(['A4 - . .', 'Bb4 - . .', 'E4 - . .', '. . . .', 'A4 . C5 .', 'B4 - . .', 'Bb4 . E4 .', 'D4 - . .']) },
    { wave: 'tri', vol: 0.5, res: 4, notes: B(['A2 - - -', 'A2 - - -', 'E2 - - -', 'E2 - - -', 'A2 - - -', 'A2 - - -', 'D2 - E2 -', 'D2 - E2 -']) },
    { drums: ['................', '..............H.', '................', '......H.........', '................', '.........H......', '................', '..............H.'].join(''), vol: 0.1 }
  ] };

  // 一般戰鬥：緊湊的小調
  TRACKS.battle = { bpm: 168, loop: true, voices: [
    { wave: 0.25, vol: 0.5, res: 2, notes: B(['E5 - E5 G5 B5 - A5 G5', 'F#5 - E5 - D5 - . -', 'E5 - E5 G5 B5 - C6 B5', 'A5 - G5 - E5 - . -', 'C6 - C6 B5 A5 - G5 -', 'A5 - B5 - G5 - E5 -', 'F#5 G5 A5 B5 C6 B5 A5 G5', 'B5 - - - . . B5 -']) },
    { wave: 0.5, vol: 0.24, res: 1, notes: arp([['E4', 'G4', 'B4'], ['D4', 'F#4', 'A4'], ['E4', 'G4', 'B4'], ['A3', 'C4', 'E4'], ['C4', 'E4', 'G4'], ['D4', 'F#4', 'A4'], ['B3', 'D4', 'F#4'], ['E4', 'G4', 'B4']], [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1]) },
    { wave: 'tri', vol: 0.65, res: 2, notes: bass(['E2', 'D2', 'E2', 'A2', 'C3', 'D3', 'B2', 'E2'], [0, 0, 1, 0, 0, 0, 1, 0]) },
    { drums: rep('K.H.S.H.K.HKS.H.', 8), vol: 0.16 }
  ] };

  // 將領戰：更快、更高亢的和聲小調，彈跳的十六分琶音與奔馳的低音
  TRACKS.boss = { bpm: 184, loop: true, voices: [
    { wave: 0.25, vol: 0.52, res: 2, notes: B(['D5 - A5 - D6 - C#6 D6', 'E6 - D6 - Bb5 - A5 -', 'D5 - A5 - D6 - E6 F6', 'E6 - C#6 - A5 - . -', 'Bb5 - D6 - F6 - E6 D6', 'C#6 - E6 - G6 - F6 E6', 'D6 - F6 - A6 - G6 F6', 'E6 - C#6 A5 - . A5 C#6']) },
    { wave: 0.125, vol: 0.2, res: 1, notes: arp([['D4', 'F4', 'A4'], ['G3', 'Bb3', 'D4'], ['D4', 'F4', 'A4'], ['A3', 'C#4', 'E4'], ['Bb3', 'D4', 'F4'], ['A3', 'C#4', 'E4'], ['G3', 'Bb3', 'D4'], ['A3', 'C#4', 'E4']], [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3]) },
    { wave: 'tri', vol: 0.7, res: 1, notes: bass(['D3', 'G2', 'D3', 'A2', 'Bb2', 'A2', 'G2', 'A2'], [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0]) },
    { drums: rep('K.HKS.HKK.HKS.SH', 8), vol: 0.2 }
  ] };

  // 標題：悠遠莊重
  TRACKS.title = { bpm: 76, loop: true, voices: [
    { wave: 0.25, vol: 0.46, res: 2, notes: B(['A4 - - - C5 - E5 -', 'D5 - - - C5 - - -', 'A4 - - - C5 - E5 -', 'G5 - - - E5 - - -', 'A5 - - - G5 - E5 -', 'D5 - - - C5 - - -', 'E5 - D5 - C5 - A4 -', 'A4 - - - - - - -']) },
    { wave: 0.5, vol: 0.24, res: 2, notes: arp([['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['A3', 'C4', 'E4'], ['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4']], [0, 1, 2, 1, 0, 1, 2, 1]) },
    { wave: 'tri', vol: 0.55, res: 2, notes: bass(['A2', 'F2', 'A2', 'C3', 'F2', 'G2', 'A2', 'A2'], [0, '-', '-', '-', 0, '-', '-', '-']) }
  ] };

  // 勝利與戰敗：短樂句，不循環
  TRACKS.victory = { bpm: 150, loop: false, voices: [
    { wave: 0.25, vol: 0.5, res: 2, notes: T('C5 E5 G5 C6 - . G5 C6 - - - - . . . .') },
    { wave: 0.5, vol: 0.26, res: 2, notes: T('E4 G4 C5 E5 - . C5 E5 - - - - . . . .') },
    { wave: 'tri', vol: 0.6, res: 2, notes: T('C3 - C3 - G2 - C3 - - - - - . . . .') }
  ] };
  TRACKS.defeat = { bpm: 70, loop: false, voices: [
    { wave: 0.25, vol: 0.42, res: 4, notes: T('E5 - - - D5 - - - C5 - - - A4 - - - - - - - . . . .') },
    { wave: 'tri', vol: 0.5, res: 4, notes: T('A2 - - - G2 - - - F2 - - - E2 - - - - - - - . . . .') }
  ] };
  A.TRACKS = TRACKS;
  A.lengths = function (id) { const c = compile(TRACKS[id]); return c.vs.map(function (v) { return v.v.drums ? v.v.drums.length : v.ev.length ? v.ev[v.ev.length - 1].s + v.ev[v.ev.length - 1].l : 0; }).concat([c.len]); };

  // ---------- 合成 ----------
  const waves = {};
  function pulseWave(duty) {
    if (waves[duty]) return waves[duty];
    const N = 32, re = new Float32Array(N), im = new Float32Array(N);
    for (let k = 1; k < N; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty);   // 方波的傅立葉級數
    return (waves[duty] = ctx.createPeriodicWave(re, im));
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function note(bus, v, midi, t, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    if (v.wave === 'tri') o.type = 'triangle'; else o.setPeriodicWave(pulseWave(v.wave));
    o.frequency.value = hz(midi);
    const a = v.vol, rel = Math.min(0.06, dur * 0.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(a, t + 0.008);
    if (v.wave !== 'tri') g.gain.exponentialRampToValueAtTime(a * 0.55, t + Math.min(dur, 0.25));
    g.gain.setValueAtTime(g.gain.value || a * 0.55, t + Math.max(0.01, dur - rel)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function noiseHit(bus, t, dur, vol, hp, lp) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
    s.buffer = noise(); s.loop = true; f.type = 'highpass'; f.frequency.value = hp; f2.type = 'lowpass'; f2.frequency.value = lp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(f2); f2.connect(g); g.connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function drum(bus, ch, t, vol) {
    if (ch === 'K') {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(vol * 3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.16);
    } else if (ch === 'S') noiseHit(bus, t, 0.12, vol * 2.2, 1200, 9000);
    else if (ch === 'H') noiseHit(bus, t, 0.04, vol * 1.4, 7000, 16000);
  }

  // ---------- 曲目排程 ----------
  function compile(tr) {
    if (tr._c) return tr._c;
    let len = 0;
    const vs = tr.voices.map(function (v) {
      const ev = [];
      if (v.drums) { v.drums.split('').forEach(function (ch, i) { if (ch !== '.') ev.push({ s: i, l: 1, d: ch }); }); len = Math.max(len, v.drums.length); return { v: v, ev: ev }; }
      let pos = 0, last = null; const r = v.res;
      v.notes.forEach(function (tok) {
        if (tok === '.') { last = null; }
        else if (tok === '-') { if (last) last.l += r; }
        else { last = { s: pos, l: r, m: typeof tok === 'number' ? tok : /^\d+$/.test(tok) ? Number(tok) : n(tok) }; ev.push(last); }
        pos += r;
      });
      len = Math.max(len, pos); return { v: v, ev: ev };
    });
    return (tr._c = { vs: vs, len: len });
  }
  function startTrack(id) {
    stopTrack();
    const tr = TRACKS[id]; if (!tr || !ctx) return;
    const c = compile(tr), bus = ctx.createGain(), step = 60 / tr.bpm / 4;
    bus.gain.value = 1; bus.connect(master);
    const st = { id: id, bus: bus, t0: ctx.currentTime + 0.08, pass: 0, idx: c.vs.map(function () { return 0; }), c: c, step: step, loop: tr.loop, done: false };
    cur = st; pump(st); st.timer = setInterval(function () { pump(st); }, 40);
  }
  function pump(st) {
    if (st.done) return;
    const horizon = ctx.currentTime + 0.25;
    for (;;) {
      let any = false;
      st.c.vs.forEach(function (vo, vi) {
        const ev = vo.ev;
        while (st.idx[vi] < ev.length) {
          const e = ev[st.idx[vi]], t = st.t0 + (st.pass * st.c.len + e.s) * st.step;
          if (t > horizon) break;
          if (t >= ctx.currentTime - 0.05) { if (vo.v.drums) drum(st.bus, e.d, t, vo.v.vol); else note(st.bus, vo.v, e.m, t, Math.max(0.05, e.l * st.step * 0.92)); }
          st.idx[vi]++;
        }
      });
      // 這一輪全部排完：進入下一輪（或結束）
      const endT = st.t0 + (st.pass + 1) * st.c.len * st.step;
      if (st.idx.every(function (i, vi) { return i >= st.c.vs[vi].ev.length; })) {
        if (endT - 0.1 > horizon) break;
        if (!st.loop) { if (ctx.currentTime > endT + 0.5) { clearInterval(st.timer); st.done = true; } break; }
        st.pass++; st.idx = st.idx.map(function () { return 0; }); any = true;
      }
      if (!any) break;
    }
  }
  function stopTrack() {
    if (!cur) return; const st = cur; cur = null; clearInterval(st.timer); st.done = true;
    try { st.bus.gain.cancelScheduledValues(ctx.currentTime); st.bus.gain.setValueAtTime(st.bus.gain.value, ctx.currentTime); st.bus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25); setTimeout(function () { try { st.bus.disconnect(); } catch (e) { /* 已斷開 */ } }, 400); } catch (e) { /* 忽略 */ }
  }

  // ---------- 對外介面 ----------
  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.3; master.connect(ctx.destination);
    if (wantTrack) startTrack(wantTrack);
  };
  A.play = function (id) { if (id === wantTrack) return; wantTrack = id; if (ctx && ctx.state === 'running') startTrack(id); else if (ctx) { ctx.resume(); startTrack(id); } };
  A.current = function () { return wantTrack; };
  A.setMuted = function (m) { muted = m; try { localStorage.setItem('chuanyue-muted', m ? '1' : '0'); } catch (e) { /* 忽略 */ } if (master) master.gain.value = m ? 0 : 0.3; };
  A.isMuted = function () { return muted; };

  // ---------- 計謀與攻擊音效（依特效名稱） ----------
  function tone(t, f0, f1, dur, vol, type) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  const arpUp = function (t, base, steps, gap, vol, type) { steps.forEach(function (s, i) { tone(t + i * gap, hz(base + s), 0, 0.16, vol, type || 'triangle'); }); };
  const SFX = {
    hit: function (t) { noiseHit(master, t, 0.09, 0.25, 800, 6000); tone(t, 220, 80, 0.08, 0.18); },
    blade: function (t) { noiseHit(master, t, 0.12, 0.22, 3000, 12000); tone(t, 900, 300, 0.1, 0.1, 'sawtooth'); },
    thrust: function (t) { tone(t, 300, 1200, 0.1, 0.12, 'sawtooth'); noiseHit(master, t + 0.08, 0.07, 0.2, 1500, 8000); },
    heavy: function (t) { noiseHit(master, t, 0.2, 0.35, 200, 3000); tone(t, 140, 40, 0.2, 0.3, 'sine'); },
    arrow: function (t) { tone(t, 1800, 700, 0.14, 0.08, 'sawtooth'); noiseHit(master, t + 0.12, 0.05, 0.15, 2000, 9000); },
    fire: function (t) { noiseHit(master, t, 0.6, 0.3, 300, 2500); tone(t, 200, 500, 0.5, 0.08, 'sawtooth'); },
    thunder: function (t) { noiseHit(master, t, 0.08, 0.5, 2000, 14000); noiseHit(master, t + 0.06, 0.5, 0.35, 80, 900); tone(t + 0.04, 90, 35, 0.45, 0.3, 'sine'); },
    rock: function (t) { [0, 0.16, 0.32].forEach(function (d) { noiseHit(master, t + d + 0.1, 0.18, 0.35, 100, 1200); tone(t + d + 0.1, 100, 35, 0.16, 0.3, 'sine'); }); tone(t, 900, 150, 0.1, 0.05, 'sawtooth'); },
    water: function (t) { noiseHit(master, t, 0.8, 0.22, 400, 3500); for (let i = 0; i < 5; i++) tone(t + i * 0.1, 500 + i * 140, 0, 0.08, 0.06, 'sine'); },
    smoke: function (t) { noiseHit(master, t, 0.7, 0.18, 150, 1500); tone(t, 180, 90, 0.6, 0.06, 'sawtooth'); },
    rain: function (t) { for (let i = 0; i < 8; i++) { tone(t + i * 0.07, 1500 - i * 80, 600, 0.07, 0.05, 'sawtooth'); noiseHit(master, t + i * 0.07 + 0.05, 0.03, 0.1, 3000, 9000); } },
    crack: function (t) { noiseHit(master, t, 0.05, 0.4, 1500, 9000); noiseHit(master, t + 0.1, 0.05, 0.3, 1500, 9000); tone(t, 500, 120, 0.25, 0.1, 'square'); },
    roar: function (t) { tone(t, 90, 60, 0.5, 0.2, 'sawtooth'); tone(t, 135, 90, 0.5, 0.12, 'sawtooth'); noiseHit(master, t, 0.5, 0.12, 200, 2500); },
    dizzy: function (t) { arpUp(t, 84, [0, 4, 7, 4, 0, 4], 0.07, 0.08, 'square'); },
    banner: function (t) { arpUp(t, 60, [0, 7, 12], 0.09, 0.14, 'square'); noiseHit(master, t + 0.2, 0.3, 0.1, 500, 3000); },
    rage: function (t) { tone(t, 70, 160, 0.5, 0.2, 'sawtooth'); noiseHit(master, t, 0.5, 0.2, 200, 2500); },
    wind: function (t) { noiseHit(master, t, 0.5, 0.2, 1200, 7000); tone(t, 400, 1600, 0.45, 0.05, 'sine'); },
    bagua: function (t) { arpUp(t, 62, [0, 3, 7, 10, 14, 10, 7, 3], 0.08, 0.1, 'triangle'); },
    buff: function (t) { arpUp(t, 72, [0, 4, 7, 12], 0.07, 0.13, 'triangle'); },
    heal: function (t) { arpUp(t, 76, [0, 4, 7, 11, 14], 0.08, 0.12, 'sine'); },
    revive: function (t) { arpUp(t, 60, [0, 7, 12, 16, 19, 24], 0.1, 0.14, 'triangle'); tone(t, 523, 0, 0.9, 0.06, 'sine'); },
    orb: function (t) { for (let i = 0; i < 6; i++) tone(t + i * 0.08, 1200 - i * 120, 0, 0.09, 0.07, 'sine'); arpUp(t + 0.5, 79, [0, 7], 0.08, 0.1, 'sine'); },
    mist: function (t) { noiseHit(master, t, 0.8, 0.12, 300, 2200); arpUp(t, 70, [0, 6, 3], 0.18, 0.08, 'sine'); },
    confuse: function (t) { for (let i = 0; i < 6; i++) tone(t + i * 0.08, 600 + (i % 2) * 300, 0, 0.08, 0.07, 'square'); },
    cage: function (t) { for (let i = 0; i < 5; i++) { tone(t + i * 0.07, 200 - i * 10, 90, 0.1, 0.15, 'square'); noiseHit(master, t + i * 0.07, 0.05, 0.12, 400, 3000); } },
    trap: function (t) { tone(t, 250, 900, 0.25, 0.08, 'sawtooth'); noiseHit(master, t + 0.25, 0.1, 0.25, 600, 6000); },
    paw: function (t) { [0, 0.18, 0.36].forEach(function (d, i) { tone(t + d, 520 + i * 90, 0, 0.1, 0.12, 'triangle'); noiseHit(master, t + d, 0.04, 0.1, 1000, 5000); }); noiseHit(master, t + 0.6, 0.3, 0.2, 400, 5000); },
    bloom: function (t) { arpUp(t, 79, [0, 2, 4, 7, 9, 12], 0.09, 0.09, 'sine'); },
    purify: function (t) { arpUp(t, 84, [0, 7, 12, 16], 0.06, 0.1, 'sine'); },
    leaf: function (t) { arpUp(t, 72, [0, 4, 9, 7], 0.09, 0.1, 'sine'); }
  };
  const FXMAP = { slash: 'blade', chop: 'blade', flurry: 'blade', whirl: 'blade', cross: 'blade', dragon: 'blade', bloodslash: 'blade', thrust: 'thrust', multithrust: 'thrust', axe: 'heavy', execute: 'heavy', arrow: 'arrow', arrowrain: 'rain', wave: 'wind', bolt: 'thunder', shock: 'crack', star: 'confuse', aura: 'buff', up_r: 'buff', up_b: 'buff', up_g: 'buff', up_y: 'buff', inferno: 'fire' };
  A.sfx = function (name) {
    if (!ctx || muted || ctx.state !== 'running') return;
    const f = SFX[FXMAP[name] || name] || SFX.hit; try { f(ctx.currentTime + 0.01); } catch (e) { /* 音效失敗不影響遊戲 */ }
  };

  // ---------- 依場景自動換曲 ----------
  function decide() {
    const st = window.Engine ? window.Engine.stack : []; let map = null, title = false;
    for (let i = st.length - 1; i >= 0; i--) {
      const s = st[i], nm = s.constructor && s.constructor.name;
      if (nm === 'BattleScene') {
        if (s.result === 'win') return 'victory';
        if (s.result === 'lose') return 'defeat';
        return (s.opts && s.opts.boss) || (s.b && s.b.enemies.some(function (e) { return e.boss; })) ? 'boss' : 'battle';   // 遇到敵將（含野外捲土重來的頭目）就換激昂的曲子
      }
      if (nm === 'MapScene' && !map) map = s;
      if (nm === 'TitleScene') title = true;
    }
    if (map) { const id = map.mapId || ''; return /^world/.test(id) ? 'world' : /^cave/.test(id) ? 'cave' : 'village'; }
    return title ? 'title' : wantTrack;
  }
  function first() { A.init(); }
  ['keydown', 'pointerdown', 'touchstart'].forEach(function (e) { window.addEventListener(e, first, { passive: true }); });
  window.addEventListener('keydown', function (ev) { if ((ev.key === 'm' || ev.key === 'M') && !ev.repeat) A.setMuted(!muted); });
  setInterval(function () { const id = decide(); if (id && id !== wantTrack) A.play(id); }, 200);
})();
