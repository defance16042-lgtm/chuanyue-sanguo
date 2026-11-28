// 第六章批次 1：world6、三座城、徐庶與諸葛亮、三顧茅廬劇情的可達性與旗標流程
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x).slice(0, 600) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const D = DATA, nm = D.maps, o = {};
    const solid = {}; D.solidTiles.forEach(t => solid[t] = 1);
    const walk = (m, x, y) => { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid[D.legend[ch]]; };
    const reach = (m, sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const k = (x + a) + ',' + (y + b); if (!seen.has(k) && walk(m, x + a, y + b)) { seen.add(k); q.push([x + a, y + b]); } }); } return seen; };
    // 關門
    const w5 = nm.world5, w6 = nm.world6, gate = w5.warps.find(w => w.to === 'world6');
    o.gate = !!gate && gate.need === 'ch6_xushu_rec';
    const xy = D.worldTowns.xiangyang, r5 = reach(w5, xy.x, xy.y + 1);
    o.gateReach = r5.has((gate.x - 1) + ',' + gate.y);
    const back = w6.warps.find(w => w.to === 'world5'); o.back = !!back && back.tx === gate.x - 1 && back.ty === gate.y;
    const r6 = reach(w6, w6.start.x, w6.start.y); o.towns = ['fancheng', 'longzhong', 'shuijing'].map(t => r6.has(D.worldTowns[t].x + ',' + (D.worldTowns[t].y + 1)));
    // 城內人物
    const bad = [];
    ['fancheng', 'longzhong', 'shuijing', 'xinye', 'longzhong_h0', 'shuijing_h0'].forEach(id => {
      const m = nm[id], rr = reach(m, m.start.x, m.start.y), seen = {};
      m.npcs.concat(m.objects || []).forEach(n => { const k = n.x + ',' + n.y; if (seen[k]) bad.push([id, 'overlap', k]); seen[k] = 1; if (!rr.has(k) && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => rr.has((n.x + a) + ',' + (n.y + b)))) bad.push([id, 'unreach', n.name || n.type]); if (!walk(m, n.x, n.y)) bad.push([id, 'solid', n.name]); });
      m.npcs.forEach(n => { [n.dialogue].concat((n.alts || []).map(a => a.dialogue)).forEach(d => { if (!D.dialogue[d]) bad.push([id, 'nodialogue', d]); }); });
    });
    o.bad = bad;
    // 角色
    Game.fresh(); const members = ['xushu', 'zhugeliang'].map(Game.makeMember); members.forEach(m => { m.level = 30; Game.recalc && Game.recalc(m); });
    o.skills = members.map(m => BattleLogic.skillsFor(m, {}).map(s => s.id));
    o.skillKinds = Object.keys(D.battle.skills).filter(k => /^(xushu|zhuge|adv_xushu|adv_zhuge)/.test(k)).every(k => D.battle.skills[k].kind);
    o.noBagua = !o.skills[1].some(s => /bagua|八卦/.test(s + D.battle.skills[s].name));
    // 旗標流程：從 ch5_end 起，所有 ch6_* 任務旗標都要能依序取得
    const flags = { ch5_end: true, caimao_down: true }; let changed = true, guard = 0;
    const picks = (n) => { let d = n.dialogue; (n.alts || []).some(a => { if (flags[a.flag]) { d = a.dialogue; return true; } return false; }); return d; };
    while (changed && guard++ < 40) {
      changed = false;
      ['xinye', 'fancheng', 'longzhong', 'shuijing', 'longzhong_h0', 'shuijing_h0'].forEach(id => nm[id].npcs.forEach(n => {
        if (n.showIf && !flags[n.showIf]) return; if (n.hideIf && flags[n.hideIf]) return;
        if (id === 'fancheng' || id === 'longzhong' || id === 'shuijing' || /_h0$/.test(id)) { if (!flags.ch6_xushu_rec) return; }
        (D.dialogue[picks(n)] || []).forEach(l => { if (l.set) Object.keys(l.set).forEach(k => { if (!flags[k]) { flags[k] = true; changed = true; } }); if (l.act && l.act.flag && !flags[l.act.flag]) { flags[l.act.flag] = true; changed = true; } });
      }));
    }
    o.flags = Object.keys(flags).filter(k => /^ch6_/.test(k));
    o.quests = D.mainQuest.filter(q => /^ch6_/.test(q.done)).every(q => flags[q.done]);
    o.questMaps = D.mainQuest.filter(q => /^ch6_/.test(q.done)).every(q => nm[q.to] || D.worldTowns[q.to]);
    o.sprites = [70, 71].every(i => i < 80);
    return o;
  });
  check('關門與回程', r.gate && r.back); check('關門可從襄陽走到', r.gateReach); check('三座城可達', r.towns.every(Boolean), r.towns);
  check('城內人物不重疊、可達、對話存在', r.bad.length === 0, r.bad); check('技能齊全', r.skills[0].includes('xushu_b') && r.skills[1].includes('zhuge_f') && r.skills[1].includes('sx_reflect'), r.skills);
  check('技能種類', r.skillKinds); check('諸葛亮無八卦陣', r.noBagua);
  check('旗標可依序取得', r.flags.includes('ch6_zhuge_join') && r.flags.length === 7, r.flags); check('任務旗標全部可達', r.quests); check('任務目的地存在', r.questMaps);
  check('無錯誤', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
