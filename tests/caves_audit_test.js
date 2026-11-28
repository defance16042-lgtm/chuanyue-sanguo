// 全章節洞穴總檢查：樓梯成對、出入口正確、不通到別的洞、支線寶箱座標吻合、寶箱／NPC id 不重複
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  await page.goto(URL); await page.waitForTimeout(500);
  const out = await page.evaluate(() => {
    const D = DATA, e = [], solid = new Set(D.solidTiles);
    const ok = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid.has(D.legend[ch]); };
    const base = id => id.replace(/_\d+$/, '');
    const caveIds = Object.keys(D.maps).filter(k => D.maps[k].cave), names = {};
    caveIds.filter(i => !/_\d+$/.test(i)).forEach(b => names[b] = D.maps[b].name.split('・')[0]);
    const entr = {};
    Object.keys(D.maps).filter(k => /^world/.test(k)).forEach(w => (D.maps[w].warps || []).forEach(wp => { if (D.maps[wp.to] && D.maps[wp.to].cave) (entr[wp.to] = entr[wp.to] || []).push({ w, x: wp.x, y: wp.y, tx: wp.tx, ty: wp.ty }); }));
    Object.keys(names).forEach(b => {
      const en = entr[b] || [], f1 = D.maps[b];
      if (en.length !== 1) e.push(b + ' 世界入口數 ' + en.length);
      const back = (f1.warps || []).filter(w => /^world/.test(w.to));
      if (back.length !== 1) e.push(b + ' 回世界出口數 ' + back.length);
      else if (en[0] && (back[0].to !== en[0].w || Math.abs(back[0].tx - en[0].x) + Math.abs(back[0].ty - en[0].y) > 2 || !ok(D.maps[back[0].to], back[0].tx, back[0].ty))) e.push(b + ' 出口落點錯誤');
      if (en[0] && !ok(f1, en[0].tx, en[0].ty)) e.push(b + ' 入口落點在牆裡');
    });
    caveIds.forEach(id => {
      const b = base(id), m = D.maps[id];
      (m.warps || []).forEach(w => {
        if (/^world/.test(w.to)) return;
        const t = D.maps[w.to]; if (!t) { e.push(id + ' warp 到不存在 ' + w.to); return; }
        if (base(w.to) !== b) e.push(id + ' 樓梯通到別的洞 ' + w.to);
        if (!ok(t, w.tx, w.ty)) e.push(id + '→' + w.to + ' 落點在牆裡');
        const rev = (t.warps || []).find(x => x.to === id);
        if (!rev) e.push(w.to + ' 沒有回 ' + id + ' 的樓梯'); else if (Math.abs(rev.x - w.tx) + Math.abs(rev.y - w.ty) > 1) e.push(id + '→' + w.to + ' 落點不在對向樓梯旁');
      });
      (m.npcs || []).forEach(n => { if (!D.dialogue[n.dialogue]) e.push(id + ' NPC ' + n.id + ' 缺對話'); const t = JSON.stringify(D.dialogue[n.dialogue] || ''); Object.keys(names).forEach(o => { if (o !== b && t.includes(names[o])) e.push(id + ' NPC ' + n.id + ' 提到別洞 ' + names[o]); }); });
      if (m.name.split('・')[0] !== names[b]) e.push(id + ' 名稱與第一層不同');
    });
    (D.sideQuests || []).forEach(q => {
      if (q.kind === 'fetch') {
        const m = D.maps[q.chest.map], o = m && (m.objects || []).find(x => x.id === q.chest.id);
        if (!o) e.push(q.id + ' 找不到箱子 ' + q.chest.id); else if (o.x !== q.chest.x || o.y !== q.chest.y) e.push(q.id + ' 箱子座標與任務資料不符');
        if (m && m.cave && !(q.where || '').includes(names[base(q.chest.map)])) e.push(q.id + ' where 與洞名不符');
      }
    });
    const dup = (list, label) => { const c = {}; list.forEach(([k, m]) => { (c[k] = c[k] || []).push(m); }); Object.keys(c).forEach(k => { if (c[k].length > 1) e.push(label + ' 重複 ' + k + ' @ ' + c[k]); }); };
    const ch = [], nn = [];
    Object.keys(D.maps).forEach(k => { (D.maps[k].objects || []).forEach(o => { if (o.id && (o.type === 'chest' || o.type === 'urn')) ch.push([o.type + o.id, k]); }); (D.maps[k].npcs || []).forEach(n => { if (/^(gen_|cave)/.test(n.id)) nn.push([n.id, k]); }); });
    dup(ch, '寶箱／陶罐 id'); dup(nn, '洞穴 NPC id');
    return { e, caves: Object.keys(names).length, maps: caveIds.length };
  });
  check('洞穴 ' + out.caves + ' 座／' + out.maps + ' 張地圖，全部正確', out.e.length === 0, out.e);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
