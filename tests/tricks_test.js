// 新計謀種類：策反（defect）、離間（discord）、暗殺（assassinate）
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
    const B = DATA.battle, BL = window.BattleLogic, o = {};
    B.skills.t_defect = { name: '策反', tp: 1, kind: 'defect', target: 'one', chance: 0.99 };
    B.skills.t_discord = { name: '離間', tp: 1, kind: 'discord', target: 'all', chance: 0.99, turns: 2 };
    B.skills.t_assa = { name: '暗殺', tp: 1, kind: 'assassinate', target: 'one', chance: 0.99, bossPct: 0.2 };
    const run = (skill, group, mod) => {
      Game.fresh(); Game.party = ['nyao'].map(Game.makeMember); Game.party[0].int = 999; Game.party[0].spd = 999;
      const b = BL.newBattle(Game.party, group, { rng: () => 0.01 });
      const a = b.party[0]; a.tp = 9; a.int = 999; a.spd = 999; if (mod) mod(b);
      const ev = BL.perform(b, a, { type: 'skill', skill: skill, target: b.enemies[0] });
      return { b, ev };
    };
    const g = B.groups.field1[0].slice(0, 3);
    let x = run('t_defect', g); o.defectOut = !!x.b.enemies[0].escaped && x.b.enemies[0].hp > 0; o.defectCount = x.b.defected;
    x = run('t_defect', ['zhangwu'].concat(g.slice(0, 2)), b => { b.enemies[0].boss = true; }); o.defectBoss = !x.b.enemies[0].escaped;
    x = run('t_discord', g); o.discordAll = x.b.enemies.every(e => e.confused > 0);
    x = run('t_assa', g); o.assaDead = x.b.enemies[0].hp <= 0;
    x = run('t_assa', g, b => { b.enemies[0].boss = true; }); o.assaBoss = x.b.enemies[0].hp > 0 && x.b.enemies[0].hp < x.b.enemies[0].hpMax;
    // 全部策反後算勝利
    Game.fresh(); Game.party = ['nyao'].map(Game.makeMember);
    const b = BL.newBattle(Game.party, g.slice(0, 1), { rng: () => 0.01 }); b.enemies[0].escaped = true; o.win = BL.outcome(b);
    o.text = ['defect', 'discord', 'assassinate'].every(k => BL.skillText(Object.values(B.skills).find(s => s.kind === k)).length > 8);
    return o;
  });
  check('策反：敵兵離陣但沒死', r.defectOut, r); check('策反：頭目不吃', r.defectBoss);
  check('離間：全體混亂', r.discordAll); check('暗殺：一般敵兵斃命', r.assaDead); check('暗殺：頭目只受重創', r.assaBoss);
  check('全部策反即勝利', r.win === 'win', r.win); check('計謀說明文字', r.text);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
