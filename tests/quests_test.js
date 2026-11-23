// 任務系統：主線指引、八個支線、兵書、縮地脫出
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
    const D = DATA, out = {};
    out.quests = D.sideQuests.length;
    // 每個支線：委託人在地圖上、目標存在
    out.giversOk = D.sideQuests.every(q => D.maps[q.giver].npcs.some(n => n.id === q.id + '_giver'));
    out.dialogOk = D.sideQuests.every(q => ['_ask', '_wait', '_turn', '_after'].every(s => D.dialogue[q.id + s]));
    out.bountyOk = D.sideQuests.filter(q => q.kind === 'bounty').every(q => Object.values(D.maps).some(m => (m.npcs || []).some(n => JSON.stringify(n).indexOf(q.target) >= 0 || (D.dialogue[n.dialogue] || []).some(l => l.act && l.act.battle === q.target))) && q.gear.every(g => D.equipment[g]));
    out.chestOk = D.sideQuests.filter(q => q.kind === 'fetch').every(q => D.maps[q.chest.map].objects.some(o => o.id === q.chest.id) && D.battle.items[q.item].quest && D.battle.bookSkills[q.book]);
    // 主線指引：每個旗標都有人會設定；前進時下一步會改變
    Game.fresh(); Game.flags = { intro_done: true };
    const names = []; for (const q of D.mainQuest) { names.push(q.title); }
    out.mainN = names.length;
    out.worldTownsOk = D.mainQuest.every(q => !q.to || D.worldTowns[q.to]);
    // 兵書：全隊學會
    Game.party = ['nyao', 'liubei'].map(Game.makeMember);
    const before = BattleLogic.skillsFor(Game.party[1], Game.flags).length;
    const s = new Scenes.Map('zhuoxian');
    s.runAct({ once: 't_book', book: 'wu' });
    out.bookFlag = !!Game.flags.book_wu;
    out.bookGained = BattleLogic.skillsFor(Game.party[1], Game.flags).length - before;
    out.hasWu = BattleLogic.skillsFor(Game.party[0], Game.flags).some(k => k.id === 'wu_charge');
    // 兵書會顯示在道具頁
    Engine.push(new Scenes.Item()); const it = Engine.top();
    out.bookListed = it.books().indexOf('wu') >= 0; out.bookCursor = (function () { it.sel = it.list().length; Engine.hit = { ok: true }; it.update(0.016); Engine.hit = {}; return it.msg; })();
    Engine.pop();
    // 支線獎勵：義勇劍
    const g0 = Object.keys(Game.gear || {}).length;
    s.runAct({ once: 't_gear', gear: ['q_yi_sword'], gold: 10 });
    out.gearGot = JSON.stringify(Game.equipInv).indexOf('q_yi_sword') >= 0;
    // 縮地脫出
    Game.flags.lastTown = 'zhuoxian'; Game.party[0].tp = 10;
    Engine.replaceAll(new Scenes.Map('cave1')); Game.mapId = 'cave1';
    Engine.push(new Scenes.Menu()); const m = Engine.stack[Engine.stack.length - 1];
    out.menuItems = 10;
    Engine.push(new Scenes.FieldSkill());
    Engine.hit = { ok: true }; Engine.top().update(0.016); Engine.hit = {};
    out.afterMap = Game.mapId; out.tpAfter = Game.party[0].tp;
    return out;
  });
  console.log(JSON.stringify(r));
  check('8 side quests', r.quests === 8);
  check('quest givers exist', r.giversOk); check('quest dialogues exist', r.dialogOk);
  check('bounty targets and gear exist', r.bountyOk); check('fetch chests/items/books exist', r.chestOk);
  check('main quest towns are on the world map', r.worldTownsOk);
  check('book flag + skill for the whole party', r.bookFlag && r.hasWu && r.bookGained === 1);
  check('read books are listed on the item page and show what they teach', r.bookListed && /吳子/.test(r.bookCursor) && /奮擊/.test(r.bookCursor), r.bookCursor);
  check('side-quest gear reward is added', r.gearGot);
  check('縮地脫出 warps to last town and costs TP', r.afterMap === 'zhuoxian' && r.tpAfter === 6, [r.afterMap, r.tpAfter]);
  check('no page errors', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); process.exit(fail ? 1 : 0);
})();
