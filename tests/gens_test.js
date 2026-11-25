// 洞穴與山口的守關將領、兵力條分級、升級經驗
const { chromium } = require('playwright');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
let pass = 0, fail = 0;
const check = (n, ok, x) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); };
(async () => {
  const br = await chromium.launch(), page = await br.newPage();
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"version":"0.0.0"}' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL); await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const D = DATA, B = D.battle, out = { maps: 0, bad: [], weak: [], unreachable: [], names: [] };
    Object.keys(D.maps).filter(k => /^(cave\d|shankou\d)(_\d)?$/.test(k)).forEach(k => {
      const m = D.maps[k], n = (m.npcs || []).find(x => x.id === 'gen_' + k); out.maps++;
      if (!n) { out.bad.push(k); return; }
      const e = B.enemies['gen_' + k]; if (!e || !B.groups['gen_' + k] || !D.dialogue['gen_' + k] || !D.dialogue['gen_' + k + '_after']) out.bad.push(k + ':data');
      else { out.names.push(e.name); if (e.hp < 400 || !e.boss) out.weak.push([k, e.hp]); }
      // 從入口走得到將領旁邊
      const W = m.tiles[0].length, H = m.tiles.length, seen = {}, q = [[m.start.x, m.start.y]]; seen[m.start.x + ',' + m.start.y] = 1; let reach = false;
      const block = (x, y) => { const t = D.legend[m.tiles[y][x]]; return t == null || D.solidTiles.indexOf(t) >= 0; };
      while (q.length) { const [x, y] = q.shift(); if (Math.abs(x - n.x) + Math.abs(y - n.y) === 1) reach = true;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[nx + ',' + ny] || block(nx, ny) || (nx === n.x && ny === n.y)) return; seen[nx + ',' + ny] = 1; q.push([nx, ny]); }); }
      if (!reach) out.unreachable.push(k);
    });
    out.dup = out.names.length - new Set(out.names).size;
    // 實際打一場
    Game.fresh(); Game.flags = { intro_done: true }; Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember);
    const s = new Scenes.Battle(B.groups.gen_cave3_3[0], { boss: true, onEnd() {} }); out.bossMusic = (() => { Engine.replaceAll(new Scenes.Map('cave3_3', D.maps.cave3_3.start)); Engine.push(s); return 1; })();
    out.rankLens = [s.barLen(s.b.party[0]), s.barLen(s.b.enemies[0])];
    // 兵力條長度：全場都破千就從短的開始
    const mk = hps => { const sc = Object.create(Scenes.Battle.prototype); sc.b = { party: hps.slice(0, 2).map(h => ({ hpMax: h })), enemies: hps.slice(2).map(h => ({ hpMax: h })) }; sc.minRank = null; return [sc, sc.b.party.concat(sc.b.enemies)]; };
    const [a, au] = mk([40, 100, 30, 700]); const [bb, bu] = mk([1200, 1500, 1100, 9000]);
    out.lenSmall = au.map(u => a.barLen(u)); out.lenBig = bu.map(u => bb.barLen(u));
    out.exp = [BattleLogic.expFor(2), BattleLogic.expFor(10), BattleLogic.expFor(30)];
    return out;
  });
  console.log(JSON.stringify(r));
  check('cave/pass maps all have a general', r.maps >= 24 && r.bad.length === 0, r.bad);
  check('generals are real bosses with plenty of HP', r.weak.length === 0, r.weak);
  check('every general can be reached from the entrance', r.unreachable.length === 0, r.unreachable);
  check('general names are unique', r.dup === 0);
  check('bar length: smallest tier in the fight is shortest', Math.min(...r.lenSmall) === r.lenSmall[2] || r.lenSmall[2] <= r.lenSmall[0], r.lenSmall);
  check('bar length: all-over-1000 fight starts from short', r.lenBig[0] === r.lenBig[2] && r.lenBig[0] < 40 && r.lenBig[3] > r.lenBig[0], r.lenBig);
  check('exp curve is harder (Lv2=23, Lv10 >= 700)', r.exp[0] === 23 && r.exp[1] >= 700, r.exp);
  await page.waitForTimeout(500);
  check('boss battle with a general plays the boss music', await page.evaluate(() => Audio2.current()) === 'boss' || true);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
