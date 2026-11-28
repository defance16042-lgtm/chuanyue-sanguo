// 水軍隨進度成長：各區域等級的水軍與水軍將領，兵力與攻擊逐步提高
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
    const B = DATA.battle, en = B.enemies, o = { hp: [], gen: [], miss: [] };
    for (let t = 1; t <= 18; t++) {
      if (!B.groups['coast_t' + t]) { o.miss.push(t); continue; }
      const id = t <= 4 ? 'shuizei_t' + t : 'shuijun_t' + t; o.hp.push([t, en[id].hp, en[id].atk]);
      if (t >= 7) o.gen.push([t, en['gen_navy_t' + t].hp, en['gen_navy_t' + t].atk]);
    }
    return o;
  });
  const inc = (a, i) => a.every((v, k) => k === 0 || v[i] >= a[k - 1][i] * 0.8);   // 大致遞增（允許章節交界處小幅回落）
  check('每個區域等級都有水軍', r.miss.length === 0, r.miss);
  check('水軍兵力大致隨進度增加', inc(r.hp, 1) && r.hp[r.hp.length - 1][1] > r.hp[0][1] * 20, r.hp.map(x => x.join(':')).join(' '));
  check('水軍將領隨進度增加', inc(r.gen, 1) && r.gen[r.gen.length - 1][1] > 30000, r.gen.map(x => x.join(':')).join(' '));
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
