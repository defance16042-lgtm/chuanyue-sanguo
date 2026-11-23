// 招收系統：野外將領組隊、戰勝投降與招收、招收館存取（含劉關張與主角）、存檔
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
    const D = DATA, o = {};
    const ids = Object.values(D.battle.rematch).filter(id => D.battle.enemies[id + '_r']);
    o.count = ids.length;
    o.defs = ids.every(id => D.characters[id] && D.characters[id].recruit && D.battle.enemies[id + '_r'].recruit === id && !D.battle.enemies[id].recruit);
    o.mainNo = ids.every(id => !D.battle.enemies[id].recruit);
    o.rate = D.battle.surrenderMax <= 0.25 && D.battle.surrenderBase <= 0.1;
    // 每座城鎮都有招賢官，站得到、走得到
    const towns = Object.keys(D.worldTowns);
    o.officers = towns.every(t => D.maps[t].npcs.some(n => n.id === 'hall_officer'));
    o.officerOk = towns.every(t => { const m = D.maps[t], n = m.npcs.find(x => x.id === 'hall_officer'); return !m.npcs.some(x => x !== n && x.x === n.x && x.y === n.y); });
    // 招收：隊伍有空位入隊，滿了進招收館
    Game.fresh(); Game.flags = { intro_done: true };
    Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember);
    ['zhangliang', 'zhangbao', 'duyou'].forEach(i => Game.addRecruit(i));
    o.add1 = Game.addRecruit('zhangjiao'); o.partyLen = Game.party.length;
    o.add2 = Game.addRecruit('lubu'); o.rosterLen = Game.roster.length;
    o.flag = !!Game.flags.recruited_zhangjiao;
    // 存取：主角與劉關張也能寄放；至少留一人；滿了不能領
    o.dep1 = Game.deposit(0); o.leaderNow = Game.party[0].id;
    o.depLiu = Game.deposit(Game.party.findIndex(m => m.id === 'liubei'));
    o.wd = Game.withdraw(0); o.partyAfter = Game.party.length;
    while (Game.party.length < 8 && Game.roster.length) Game.withdraw(0);
    o.full = Game.roster.length ? Game.withdraw(0) : 'n/a';
    while (Game.party.length > 1) Game.deposit(Game.party.length - 1);
    o.last = Game.deposit(0);
    // 8 人隊伍：出戰只有前 5 位
    Game.fresh(); Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei', 'zhangjiao', 'lubu', 'xurong', 'huaxiong'].map(id => { Game.makeMember.call(null, id); return Game.makeMember(id); });
    o.fight = BattleLogic.newBattle(Game.party, ['turban'], {}).party.length;
    Game.party[0].hp = 0; o.fightDead = BattleLogic.newBattle(Game.party, ['turban'], {}).party.map(u => u.id).join();
    Game.fresh(); Game.flags = { intro_done: true };
    Game.party = ['nyao', 'liubei', 'guanyu', 'zhangfei'].map(Game.makeMember); Game.roster = [];
    // 存檔往返
    const snap = Game.snapshot(); Game.fresh(); const ok = Game.restore(snap);
    o.restore = ok && Game.roster.length === snap.roster.length && Game.party.length === snap.party.length;
    // 戰鬥勝利後投降：把機率鎖成 0 → 一定投降
    Game.fresh(); Game.flags = { intro_done: true }; Game.party = ['nyao', 'liubei'].map(Game.makeMember);
    const old = Math.random; Math.random = () => 0;
    Engine.replaceAll(new Scenes.Map('zhuoxian')); Engine.top().banner = 0;
    Engine.top().startBattle(['zhangjiao_r', 'lubu_r'], false);
    Math.random = old;
    return o;
  });
  console.log(JSON.stringify(r));
  check('主線打倒過的頭目殘部都能招收，主線頭目本人不能', r.count >= 14 && r.defs && r.mainNo, r.count);
  check('投降機率不高（基本 10%、上限 25%）', r.rate);
  check('每座城鎮都有招賢官且不重疊', r.officers && r.officerOk);
  check('招收：有空位入隊、滿了進招收館', r.add1 === 'party' && r.partyLen === 8 && r.add2 === 'hall' && r.rosterLen === 1 && r.flag);
  check('主角、劉備可寄放，隊首換人', r.dep1 === null && r.leaderNow === 'liubei' && r.depLiu === null);
  check('領人入隊、滿了不能領、至少留一人', r.wd === null && (r.full === 'n/a' || typeof r.full === 'string') && typeof r.last === 'string');
  check('存檔含招收館', r.restore);
  check('隊伍 8 人，出戰前 5 位活著的', r.fight === 5 && r.fightDead === 'liubei,guanyu,zhangfei,zhangjiao,lubu', [r.fight, r.fightDead]);
  // 實際打一場：全員一擊倒下，檢查投降與選擇畫面
  await page.evaluate(() => { const b = Engine.top() && Engine.stack ? null : null; });
  const st = await page.evaluate(async () => {
    const sc = Engine.top(); if (!sc.b) return 'nobattle';
    sc.b.enemies.forEach(e => { e.hp = 0; });
    return 'ok';
  });
  check('戰鬥場景建立', st === 'ok', st);
  await page.waitForTimeout(300);
  const cn = await page.evaluate(() => {
    const sc = Engine.top(); Math.random = () => 0;
    sc.finish('win'); return { lines: sc.lines.filter(l => /歸順/.test(l)).length, offers: (sc.offers || []).length };
  });
  check('戰勝後兩位都願意投降', cn.lines === 2 && cn.offers === 2, cn);
  const fl = await page.evaluate(async () => {
    const sc = Engine.top(); sc.result = 'win'; sc.li = sc.lines.length;
    Engine.hit.ok = true; sc.updateResult(); Engine.hit.ok = false;
    const top = Engine.top(); const isOffer = top.constructor.name;
    top.sel = 0; Engine.hit.ok = true; top.update(16); Engine.hit.ok = false;      // 招收
    Engine.hit.ok = true; top.update(16); Engine.hit.ok = false;                   // 下一位
    top.sel = 1; Engine.hit.ok = true; top.update(16); Engine.hit.ok = false;      // 放走
    Engine.hit.ok = true; top.update(16); Engine.hit.ok = false;
    return { isOffer, got: Game.hasMember('zhangjiao'), left: !Game.hasMember('lubu'), top: Engine.top().constructor.name };
  });
  check('出現招收選擇，招收一位、放走一位', fl.isOffer === 'RecruitOfferScene' && fl.got && fl.left && fl.top !== 'RecruitOfferScene', fl);
  const hall = await page.evaluate(() => {
    Engine.replaceAll(new Scenes.Map('zhuoxian')); Engine.top().banner = 0;
    Engine.push(new Scenes.Hall()); const h = Engine.top();
    Engine.hit.ok = true; h.update(16); Engine.hit.ok = false;
    return { msg: h.msg, roster: Game.roster.length };
  });
  check('招收館畫面可寄放', hall.roster === 1, hall);
  check('沒有 JS 錯誤', errors.length === 0, errors);
  console.log(pass + ' passed, ' + fail + ' failed');
  await br.close(); process.exit(fail ? 1 : 0);
})();
