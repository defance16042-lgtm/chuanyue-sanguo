// 存檔與招收人物只在城鎮的驛館：驛館掌櫃（或沒有驛館的城鎮裡的驛吏）負責住宿、存檔、招收人物。
// 洞穴、山口、關隘裡不再有存檔點，寶箱／陶罐／開關／泉水都是實體障礙。
(function () {
  const D = window.DATA, S = D.dialogue, solid = {};
  D.solidTiles.forEach(function (t) { solid[t] = true; });
  // 1. 關隘軍營地圖標記為「內部」，物件變成障礙
  Object.keys(D.maps).forEach(function (id) { if (/^(wg\d|wuchao)$/.test(id)) D.maps[id].fort = true; });
  // 2. 野外與城鎮地圖上的存檔水晶全部拿掉
  Object.keys(D.maps).forEach(function (id) {
    const m = D.maps[id]; if (m.objects) m.objects = m.objects.filter(function (o) { return o.type !== 'save'; });
  });
  // 3. 驛館掌櫃：住宿之外加上「存檔」「招收人物」
  const extra = function () { return [{ label: '存檔（免費休息）', act: { save: true } }, { label: '招收人物（寄放與領人）', act: { hall: true } }]; };
  const isInn = function (k) { return k === 'keeper' || /^inn_/.test(k); };
  const patch = function (k) {
    (S[k] || []).forEach(function (l) {
      if (!l.choices || !l.choices.some(function (c) { return c.act && c.act.rest; }) || l.choices.some(function (c) { return c.act && c.act.save; })) return;
      const keep = l.choices.filter(function (c) { return !(c.act && c.act.rest) && c.label !== '不住了' && c.label !== '不用了'; });
      const rest = l.choices.filter(function (c) { return c.act && c.act.rest; });
      l.choices = rest.concat(extra(), keep, [{ label: '不用了' }]);
    });
  };
  Object.keys(S).filter(isInn).forEach(patch);
  // 4. 沒有驛館房子的城鎮：站一位驛吏（放在原本存檔點／招賢官的位置附近）
  S.inn_clerk = [{ speaker: '驛吏', text: '這裡是驛館。住宿、存檔、招收人物，都由我辦理。', choices: [{ label: '住宿 30金', act: { rest: true } }].concat(extra(), [{ label: '不用了' }]) }];
  const hasInn = function (id) {
    const seen = { [id]: 1 }, q = [id];
    while (q.length) {
      const m = D.maps[q.shift()]; if (!m) continue;
      if ((m.npcs || []).some(function (n) { return isInn(n.dialogue) || n.dialogue === 'inn_clerk'; })) return true;
      (m.warps || []).forEach(function (w) { if (w.to && !seen[w.to] && w.to !== 'world' && !D.worldTowns[w.to] && D.maps[w.to]) { seen[w.to] = 1; q.push(w.to); } });
    }
    return false;
  };
  D.townHasInn = hasInn;
  Object.keys(D.worldTowns || {}).forEach(function (id) {
    const m = D.maps[id]; if (!m || hasInn(id)) return;
    const used = {}; (m.npcs || []).concat(m.objects || [], m.signs || [], m.warps || []).forEach(function (o) { used[o.x + ',' + o.y] = true; });
    used[m.start.x + ',' + m.start.y] = true;
    const at = function (x, y) { const ch = (m.tiles[y] || '')[x]; return ch === undefined ? -1 : D.legend[ch]; };
    let best = null, bd = 1e9;
    for (let y = 2; y < m.tiles.length - 2; y++) for (let x = 2; x < m.tiles[y].length - 2; x++) {
      const t = at(x, y); if (t !== 1 && t !== 5 && t !== 0 && t !== 31) continue;
      let ok = !used[x + ',' + y];
      for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) { const q = at(x + dx, y + dy); if (q < 0 || solid[q] || q === 8 || q === 40 || q === 41 || used[(x + dx) + ',' + (y + dy)]) ok = false; }
      if (!ok) continue;
      const d = Math.abs(x - m.start.x) + Math.abs(y - m.start.y) + (Math.abs(x - m.start.x) + Math.abs(y - m.start.y) < 3 ? 40 : 0);
      if (d < bd) { bd = d; best = { x: x, y: y }; }
    }
    if (best) m.npcs.push({ id: 'inn_clerk', name: '驛吏', sprite: 29, x: best.x, y: best.y, dir: 'down', dialogue: 'inn_clerk' });
  });
})();
