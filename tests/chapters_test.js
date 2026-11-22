// 章間封鎖：第二章的區域只能從山口進去，劇情沒到山口不開
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
    const D = DATA, m = D.maps.world, solid = new Set(D.solidTiles), out = {};
    const free = (x, y) => { const c = m.tiles[y] && m.tiles[y][x]; return c !== undefined && !solid.has(D.legend[c]); };
    const ws = new Set(m.warps.map(w => w.x + ',' + w.y));
    const seen = new Set(['38,11']), q = [[38, 11]];
    while (q.length) { const [x, y] = q.shift(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && (free(nx, ny) || ws.has(k))) { seen.add(k); if (!ws.has(k)) q.push([nx, ny]); } } }
    out.leak = [...seen].filter(k => !ws.has(k)).filter(k => { const [x, y] = k.split(',').map(Number); return D.chapterZoneAt(x, y); }).length;
    out.entries = m.warps.filter(w => seen.has(w.x + ',' + w.y)).map(w => w.to).filter(t => /^(shankou|guan_|heishan|cave2|cave3|youbei|pingyuan)/.test(t));
    out.gated = [[22, 23], [20, 23], [61, 13], [59, 13]].map(([x, y]) => { const w = m.warps.find(k => k.x === x && k.y === y); return w && w.need; });
    // 走路測試：沒有旗標時，走進山口會被退回
    Game.fresh(); Game.party = ['nyao', 'liubei'].map(Game.makeMember); Game.flags = { intro_done: true };
    Engine.replaceAll(new Scenes.Map('world', { x: 23, y: 23, dir: 'left' }));
    const s = Engine.top(); s.p.x = 22; s.p.y = 23; s.arrive();
    out.blockedMap = Game.mapId; out.blockedPos = [s.p.x, s.p.y]; out.fade = !!s.fade;
    Game.flags.sanzhang_down = true; s.fade = null; s.p.x = 22; s.p.y = 23; s.arrive();
    out.openFade = !!s.fade && s.fade.warp.to;
    // 舊存檔：人站在尚未開放的太行山以西 -> 送回城外
    Game.flags = { intro_done: true, lastTown: 'zhuoxian' };
    Engine.replaceAll(new Scenes.Map('world', { x: 10, y: 30, dir: 'down' }));
    out.rescue = [Engine.top().p.x, Engine.top().p.y];
    Game.flags = { intro_done: true, sanzhang_down: true };
    Engine.replaceAll(new Scenes.Map('world', { x: 10, y: 30, dir: 'down' }));
    out.stay = [Engine.top().p.x, Engine.top().p.y];
    return out;
  });
  console.log(JSON.stringify(r));
  check('ch1 land cannot walk into either ch2 zone', r.leak === 0, r.leak);
  check('only the pass entrances are reachable from ch1', JSON.stringify(r.entries.sort()) === JSON.stringify(['shankou1_3', 'shankou2'].sort()), r.entries);
  check('all four pass tiles are gated by story flags', r.gated.join() === 'sanzhang_down,sanzhang_down,zhangyan_down,zhangyan_down', r.gated);
  check('pass is closed before the story gets there (bounced back)', r.blockedMap === 'world' && r.blockedPos[0] === 23 && !r.fade, [r.blockedMap, r.blockedPos]);
  check('pass opens once ch1 is finished', r.openFade === 'shankou1_3', r.openFade);
  check('old save standing in a closed zone is moved out', r.rescue[0] > 21, r.rescue);
  check('open zone keeps the player in place', r.stay[0] === 10 && r.stay[1] === 30, r.stay);
  await page.screenshot({ path: '/tmp/chap_a.png' });
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
