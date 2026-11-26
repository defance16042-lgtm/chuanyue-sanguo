// 第四章（批次2a）：《三國演義》版——土山降曹、許都贈赤兔、白馬斬顏良、延津誅文丑、官渡辭曹、過五關斬六將、鄴城兄弟重逢。
// 這個檔案改寫 ch4.js 的後半劇情（劉備一行改為在汝南失散，關羽與諸葛貓妖同行），並新增「五關道」五座關隘。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue, nm = D.maps;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  const npc = function (map, id) { return nm[map].npcs.find(function (n) { return n.id === id; }); };

  // ================= 一般敵人（曹軍關兵） =================
  B.enemies.wei_guard = { name: '曹軍關兵', terrain: T('A', 'B', 'B', 'C'), int: 12, lead: 18, luck: 6, title: '曹軍守關', cls: '精兵', weapon: '槍', desc: '曹操留在各處關口的守兵，操練得整整齊齊，只可惜這次要擋的是千里走單騎的關雲長。', hp: 2100, atk: 132, def: 66, spd: 12, exp: 400, gold: 280, sprite: 3 };
  B.enemies.wei_archer = { name: '曹軍弓兵', terrain: T('B', 'A', 'B', 'C'), int: 14, lead: 10, luck: 6, title: '曹軍弓手', cls: '弓兵', weapon: '弓', desc: '關樓上的弓手，箭袋永遠是滿的，因為上一個闖關的人沒走到這裡。', hp: 800, atk: 134, def: 36, spd: 17, exp: 380, gold: 270, sprite: 20 };
  B.enemies.wei_cav = { name: '曹軍騎兵', terrain: T('A', 'C', 'C', 'C'), int: 10, lead: 14, luck: 6, title: '曹軍輕騎', cls: '騎兵', weapon: '槍', desc: '專門追在闖關者後頭的輕騎，馬快，嗓門更快。', hp: 1700, atk: 136, def: 54, spd: 21, exp: 390, gold: 280, sprite: 11 };
  // ================= 六員守將 =================
  const GEN = [
    ['kongxiu', '孔秀', '東嶺關守將', 6, 40000, 204, 94, 20, '東嶺關的守將，鎮守許都東去的第一道關口。他一輩子照規矩辦事，所以這次也一樣——沒有文書就不能過。', 'dragon'],
    ['mengtan', '孟坦', '洛陽太守・韓福副將', 20, 16000, 180, 76, 24, '洛陽的副將，使一口大刀，被關羽的氣勢嚇得手心全是汗，卻還是硬著頭皮上陣。', 'cross'],
    ['hanfu', '韓福', '洛陽太守', 13, 24000, 196, 80, 18, '洛陽太守，鎮守洛陽關。他最擅長的不是武藝，而是設下暗箭，偏偏這次他的暗箭沒能射中關羽的左臂以外的地方。', 'thrust'],
    ['bianxi', '卞喜', '汜水關守將', 22, 37000, 210, 96, 20, '汜水關守將，使一對流星錘，據說他在關前的鎮國寺裡埋伏了二十個刀斧手，結果被一個和尚破了功。', 'axe'],
    ['wangzhi', '王植', '滎陽太守', 26, 27000, 204, 92, 19, '滎陽太守，打算在夜裡放火把關羽一行燒死在驛館裡，他的主意不壞，只可惜消息漏得比火還快。', 'bloodslash'],
    ['qinqi', '秦琪', '夏侯惇部將・黃河渡口守將', 30, 40000, 212, 98, 21, '夏侯惇的部將，鎮守黃河渡口。他最大的優點是服從命令，最大的缺點，也是服從命令。', 'execute']
  ];
  GEN.forEach(function (g) {
    B.enemies[g[0]] = { name: g[1], terrain: T('A', 'B', 'B', 'C'), int: 24, lead: 52, luck: 9, title: g[2], cls: '猛將', weapon: '刀', desc: g[8], hp: g[4], atk: g[5], def: g[6], spd: g[7], exp: 7000, gold: 5200, sprite: g[3], boss: true, ai: 'boss' };
  });
  // 戰鬥群：每關一個頭目戰、兩個守兵戰
  const FORTS = [
    { k: 'wg1', boss: 'kongxiu', esc: ['wei_guard', 'wei_guard', 'wei_archer', 'wei_archer'], name: '東嶺關', g: ['wei_guard', 'wei_guard', 'wei_archer', 'wei_cav'] },
    { k: 'wg2', boss: 'hanfu', esc: ['mengtan', 'wei_guard', 'wei_cav'], name: '洛陽關', g: ['wei_cav', 'wei_cav', 'wei_guard', 'wei_archer', 'wei_archer'] },
    { k: 'wg3', boss: 'bianxi', esc: ['wei_guard', 'wei_guard', 'wei_cav', 'wei_archer'], name: '汜水渡關', g: ['wei_guard', 'wei_guard', 'wei_guard', 'wei_archer', 'wei_archer'] },
    { k: 'wg4', boss: 'wangzhi', esc: ['wei_archer', 'wei_archer', 'wei_cav', 'wei_cav'], name: '滎陽關', g: ['wei_archer', 'wei_archer', 'wei_archer', 'wei_cav', 'wei_guard'] },
    { k: 'wg5', boss: 'qinqi', esc: ['wei_cav', 'wei_cav', 'wei_guard', 'wei_guard', 'wei_archer'], name: '黃河渡口', g: ['wei_cav', 'wei_cav', 'wei_cav', 'wei_guard', 'wei_archer'] }
  ];
  B.enemies.mengtan.boss = false; delete B.enemies.mengtan.ai; B.enemies.mengtan.hp = 9000; B.enemies.mengtan.exp = 900; B.enemies.mengtan.gold = 600;
  FORTS.forEach(function (f) {
    B.groups[f.k + 'boss'] = [[f.boss].concat(f.esc)];
    B.groups[f.k + 'g1'] = [f.g.slice()]; B.groups[f.k + 'g2'] = [f.g.slice().reverse()];
  });
  Object.assign(D.terrainHome, { wei_guard: 'plain', wei_archer: 'forest', wei_cav: 'plain', kongxiu: 'mountain', mengtan: 'plain', hanfu: 'plain', bianxi: 'plain', wangzhi: 'plain', qinqi: 'plain' });
  ['wei_guard', 'wei_archer', 'wei_cav', 'kongxiu', 'mengtan', 'hanfu', 'bianxi', 'wangzhi', 'qinqi'].forEach(function (id) { D.applyTerrain(id, B.enemies[id], !!B.enemies[id].boss); });
  // 戰利品
  E.chitu_boots = { name: '赤兔馬', slot: 'boots', mods: { spd: 16, def: 5, luck: 3 }, price: 0, desc: '曹操贈的赤兔馬，通體如火，據說是呂布生前最愛。關羽收下時只說了一句：「此馬日行千里，若知兄長下落，一日便可相見。」' };
  E.guan_green_robe = { name: '舊綠錦袍', slot: 'armor', mods: { def: 28, lead: 4 }, price: 0, desc: '劉備贈的舊綠錦袍。曹操送的新錦袍，關羽都穿在裡頭，外面一定罩著這件舊的。' };
  E.hanshou_seal = { name: '漢壽亭侯印', slot: 'charm', mods: { lead: 12, luck: 4 }, price: 0, desc: '曹操為關羽請封的亭侯印。關羽說：「這顆印，我要原封不動，退還給丞相。」' };
  E.dongling_blade = { name: '東嶺關刀', slot: 'weapon', wtype: '刀', mods: { pow: 88, grd: 2 }, price: 0, desc: '孔秀的守關刀，刀背上刻著「東嶺」兩個字，不知道是誰刻的，字寫得比刀還認真。' };
  D.drops.kongxiu = ['dongling_blade', 1.0];

  // ================= 五關道（一個入口、五座關隘串起來） =================
  const FW = 24, FH = 26;
  const SOLIDOBJ = {};
  function fortRows() {
    const g = [];
    for (let y = 0; y < FH; y++) { let r = ''; for (let x = 0; x < FW; x++) r += '#'; g.push(r.split('')); }
    const box = function (x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
    box(2, 14, 21, 24, 'g'); box(2, 2, 21, 10, 'g');                  // 南北兩座校場
    box(10, 11, 13, 13, ','); g[12][10] = '#'; g[12][12] = '#'; g[12][13] = '#'; g[11][10] = '#'; g[11][12] = '#'; g[11][13] = '#'; g[13][10] = '#'; g[13][12] = '#'; g[13][13] = '#';   // 隔牆中只留 x=11 一格通道
    box(11, 14, 12, 25, ','); box(11, 0, 12, 10, ',');                // 主路
    box(5, 18, 18, 18, ','); box(5, 6, 18, 6, ',');                   // 橫路
    for (let x = 2; x <= 21; x += 3) { g[14][x] = 'T'; g[10][x] = 'T'; }
    g[14][11] = ','; g[14][12] = ','; g[10][11] = ','; g[10][12] = ',';
    return g.map(function (r) { return r.join(''); });
  }
  const FORT_INFO = {
    wg1: { sp: { id: 'wg1_sp', name: '東嶺關老兵', sprite: 6, x: 18, y: 16, lines: ['老兵：孔將軍管得嚴，連他自己的馬出關也要查文書。……您是關將軍？那您說什麼都對。', '老兵：丞相有令，沿途關隘「不得阻攔」。可我們孔將軍說，丞相的令他沒看到，他只看到眼前的規矩。'] }, c1: { gold: 3200, msg: '關隘軍營的角落，有一袋士兵來不及帶走的餉銀。' }, c2: { item: { herb3: 3, tonic3: 3 }, msg: '關樓上的藥箱，裡頭整整齊齊放著傷藥。' } },
    wg2: { sp: { id: 'wg2_sp', name: '洛陽落魄書生', sprite: 10, x: 6, y: 16, lines: ['書生：我在洛陽讀了二十年書，沒想到最後一次見到名將，是看他一刀砍倒我們太守的暗箭。', '書生：那支箭本來要射的是關將軍的左臂。……可他說，不礙事。'] }, c1: { gold: 3400, msg: '洛陽關門後面堆著的軍餉。' }, c2: { item: { herb3: 4 }, msg: '被丟棄的行軍藥箱。' } },
    wg3: { sp: { id: 'wg3_monk', name: '普靜', sprite: 7, x: 12, y: 8, dialogue: 'wg3_monk', alts: [{ flag: 'wg3_monk_done', dialogue: 'wg3_monk2' }] }, c1: { gold: 3600, msg: '鎮國寺供桌下的香油錢。' }, c2: { item: { herb3: 3, tonic3: 3 }, msg: '寺院的藥房。' } },
    wg4: { sp: { id: 'wg4_hu', name: '胡班', sprite: 9, x: 12, y: 8, dialogue: 'wg4_hu', alts: [{ flag: 'wg4_hu_done', dialogue: 'wg4_hu2' }] }, c1: { gold: 3800, msg: '驛館桌下的一袋財物。' }, c2: { item: { herb3: 4, tonic3: 3 }, msg: '驛館的行李箱。' } },
    wg5: { sp: { id: 'wg5_boatman', name: '老船夫', sprite: 6, x: 18, y: 16, lines: ['船夫：黃河的水，一年比一年涼。聽說有個紅臉大漢要渡河，我船都備好了。', '船夫：可是夏侯將軍說，沒有丞相的令，誰都不能上我的船。……我已經等了三天，他們沒給我渡資。'] }, c1: { gold: 4000, msg: '渡口堆著的行李與財物。' }, c2: { item: { herb3: 5, tonic3: 4 }, msg: '夏侯惇留在渡口的補給。' } }
  };
  const FORT_TEXT = {
    wg1: { boss: ['孔秀', '東嶺關前，一面「曹」字大旗在風中獵獵作響。守將孔秀橫刀立馬，擋在關口正中。', '站住！沒有曹丞相的文書，誰也別想過我的關！', '……罷了，我孔秀照規矩辦事，輸了也服氣。關將軍，請。'] },
    wg2: { boss: ['韓福', '洛陽城門高高掛起，太守韓福和副將孟坦一左一右，守在城門內。', '關雲長？奉丞相之令，在此攔你！', '……暗箭沒射死你，是我韓福命不好。……請。'] },
    wg3: { boss: ['卞喜', '汜水關前的鎮國寺裡，隱隱傳出金屬碰撞的聲音。卞喜站在殿前，笑得有些勉強。', '關將軍遠道而來，我在寺裡備了酒席……（暗中示意）你們都出來吧！', '……我的刀斧手，被一個和尚用戒刀點破了。罷了，關將軍，請。'] },
    wg4: { boss: ['王植', '滎陽城外，王植抱拳而立，臉上堆著笑：「關將軍一路辛苦，驛館已備好，請進。」', '既然你們不上當，那就在此打一場吧！', '……火沒燒成，人沒攔住。這滎陽，我不守也罷。'] },
    wg5: { boss: ['秦琪', '黃河南岸，渡口前一排大旗。夏侯惇的部將秦琪騎在馬上，攔住最後一道去路。', '夏侯將軍有令：關雲長若敢渡河，格殺勿論！你還敢向前？', '……這一刀，我認了。黃河就在你們身後，渡口的船，你們隨便用吧。'] }
  };
  const GATE_LINES = {
    wg1: ['東嶺關哨兵', '站住！這是東嶺關，孔將軍有令，誰都不能過！', '那是……關雲長？你別過來！'],
    wg2: ['洛陽哨兵', '洛陽關重地，閒人止步！', '放箭！……不，等等，先通報韓太守！'],
    wg3: ['汜水關哨兵', '汜水關前，不許靠近！', '你們……你們是不是在往鎮國寺那邊走？'],
    wg4: ['滎陽哨兵', '滎陽驛館就在前面，不過你們最好不要進去。', '什麼？你們說驛館著火了？'],
    wg5: ['渡口哨兵', '黃河渡口，非丞相令，不得上船！', '夏侯將軍就在後面，你們別想走！']
  };
  FORTS.forEach(function (f, i) {
    const k = f.k, info = FORT_INFO[k], tx = FORT_TEXT[k], gl = GATE_LINES[k];
    const g = fortRows();
    const prev = i === 0 ? null : 'wg' + i, next = i === 4 ? null : 'wg' + (i + 2);
    // 隔牆通道上的頭目
    const npcs = [
      { id: k + 'boss', name: tx.boss[0], sprite: B.enemies[f.boss].sprite, x: 11, y: 12, dir: 'down', dialogue: k + '_boss', hideIf: k + '_down' },
      { id: k + '_g1', name: gl[0], sprite: 2, x: 8, y: 20, dir: 'down', dialogue: k + '_g1', hideIf: k + '_g1_down' },
      { id: k + '_g2', name: gl[0], sprite: 2, x: 15, y: 8, dir: 'down', dialogue: k + '_g2', hideIf: k + '_g2_down' }
    ];
    const sp = info.sp;
    if (sp.lines) { S['wg_sp_' + k] = sp.lines.map(function (t) { const m2 = /^([^：]{1,8})：(.*)$/.exec(t); return { speaker: m2 ? m2[1] : sp.name, text: m2 ? m2[2] : t }; }); npcs.push({ id: sp.id, name: sp.name, sprite: sp.sprite, x: sp.x, y: sp.y, dir: 'left', dialogue: 'wg_sp_' + k }); }
    else npcs.push({ id: sp.id, name: sp.name, sprite: sp.sprite, x: sp.x, y: sp.y, dir: 'down', dialogue: sp.dialogue, alts: sp.alts });
    const objects = [
      { type: 'chest', id: k + '_c1', x: 4, y: 22, gold: info.c1.gold, msg: info.c1.msg },
      { type: 'chest', id: k + '_c2', x: 19, y: 4, item: info.c2.item, msg: info.c2.msg },
      { type: 'torch', x: 9, y: 16, text: '一支燒得正旺的火把，把關隘照得像白天。' }, { type: 'torch', x: 14, y: 16, text: '一支燒得正旺的火把。' },
      { type: 'tablet', x: 13, y: 23, text: '「' + f.name + '」——石碑上刻著關口的名字。碑底下，被人用刀尖新刻了一行小字：「某年某月，關某過此。」' }
    ];
    const warps = [
      { x: 11, y: 25, to: prev || 'world4', tx: prev ? 11 : D.ch4Entry.x, ty: prev ? 2 : D.ch4Entry.y + 1, dir: prev ? 'up' : 'down' },
      { x: 12, y: 25, to: prev || 'world4', tx: prev ? 12 : D.ch4Entry.x, ty: prev ? 2 : D.ch4Entry.y + 1, dir: prev ? 'up' : 'down' },
      { x: 11, y: 0, to: next || 'world4', tx: next ? 11 : 58, ty: next ? 23 : 7, dir: next ? 'up' : 'down' },
      { x: 12, y: 0, to: next || 'world4', tx: next ? 12 : 58, ty: next ? 23 : 7, dir: next ? 'up' : 'down' }
    ];
    // 北出口要打倒頭目才通：頭目站在隔牆通道上，擋住唯一一格
    nm[k === 'wg1' ? 'wg1' : k] = { name: f.name, battleBg: 'grass', home: { map: 'world4' }, encounter: { group: 'field16', rate: 0.05, minSteps: 6 }, tiles: g, start: { x: 11, y: 24, dir: 'up' }, events: [], warps: warps, npcs: npcs, objects: objects };
    S[k + '_boss'] = [{ speaker: '', text: tx.boss[1] }, { speaker: tx.boss[0], text: tx.boss[2], act: { battle: k + 'boss', flag: k + '_down', after: k + '_after' } }];
    S[k + '_after'] = [{ speaker: tx.boss[0], text: tx.boss[3] }, { speaker: '關羽', text: '得罪了。' }, { speaker: '', text: '（獲得金 5200。）', act: { gold: 5200 } }];
    S[k + '_g1'] = [{ speaker: gl[0], text: gl[1], act: { battle: k + 'g1', flag: k + '_g1_down', after: k + '_gafter' } }];
    S[k + '_g2'] = [{ speaker: gl[0], text: gl[2], act: { battle: k + 'g2', flag: k + '_g2_down', after: k + '_gafter' } }];
    S[k + '_gafter'] = [{ speaker: '', text: '（守兵被擊退了。）' }];
  });
  // 各關的特別演出
  S.wg1_after = [{ speaker: '孔秀', text: '……罷了，我孔秀照規矩辦事，輸了也服氣。關將軍，請。' }, { speaker: '關羽', text: '得罪了。' }, { speaker: '諸葛貓妖', text: '喵……他其實是個很講理的人，就是講的是「他自己的理」。' }, { speaker: '', text: '（獲得東嶺關刀、金 5200。）', act: { gold: 5200 } }];
  S.wg2_after = [{ speaker: '韓福', text: '……暗箭沒射死你，是我韓福命不好。……請。' }, { speaker: '孟坦', text: '將軍，關羽的左臂，在流血啊。' }, { speaker: '關羽', text: '皮肉小傷，不礙事。繼續走。' }, { speaker: '諸葛貓妖', text: '（喵……我記得這一段。他說「不礙事」，可那是被箭射穿的左臂。）' }, { speaker: '', text: '（獲得金 5200。）', act: { gold: 5200 } }];
  S.wg3_monk = [
    { speaker: '普靜', text: '阿彌陀佛。貧僧乃鎮國寺的老僧，也是將軍的同鄉。卞喜在殿後埋伏了二十個刀斧手，將軍千萬小心。' },
    { speaker: '關羽', text: '多謝大師指點。' },
    { speaker: '諸葛貓妖', text: '喵……大師，您是不是在戒刀上刻了暗號？剛剛那一下，是怎麼「不小心」撞翻了殿後的香爐？' },
    { speaker: '普靜', text: '施主說什麼，貧僧聽不懂。……不過，這個藥，倒是可以拿去。', act: { heal: true, once: 'wg3_monk_done' } }
  ];
  S.wg3_monk2 = [{ speaker: '普靜', text: '施主，一路保重。出家人的戒刀，只用來切素齋。' }];
  S.wg4_after = [{ speaker: '王植', text: '……火沒燒成，人沒攔住。這滎陽，我不守也罷。' }, { speaker: '關羽', text: '得罪了。' }, { speaker: '', text: '（獲得金 5200。）', act: { gold: 5200 } }];
  S.wg4_hu = [
    { speaker: '胡班', text: '關將軍！小的是胡班，是王太守的部下。他今晚打算在驛館四周堆滿柴草，三更放火。' },
    { speaker: '胡班', text: '小的的父親，受過您的恩惠。……這是通行用的火把，還有些路上用的補給，請收下。' },
    { speaker: '諸葛貓妖', text: '喵……胡班，你報信的方式也太直接了。哪有人把「縱火計畫」說得這麼詳細的？' },
    { speaker: '', text: '（獲得補給。）', act: { give: { herb3: 4, tonic3: 3 }, once: 'wg4_hu_done' } }
  ];
  S.wg4_hu2 = [{ speaker: '胡班', text: '關將軍，您快走吧。……我就說我睡過頭了。' }];
  S.wg5_after = [{ speaker: '秦琪', text: '……這一刀，我認了。黃河就在你們身後，渡口的船，你們隨便用吧。' }, { speaker: '關羽', text: '得罪了。' }, { speaker: '諸葛貓妖', text: '喵……五關過完了。六個守將，一個比一個講理，一個比一個倒楣。' }, { speaker: '關羽', text: '關某……只想見兄長一面。' }, { speaker: '', text: '（獲得金 5200。五關道到此結束，前方就是河北。）', act: { gold: 5200 } }];

  // ================= 主線改寫：汝南失散（土山約三事） =================
  S.chezhou_after = [
    { speaker: '車冑', text: '……我輸了。丞相，我對不起您。' },
    { speaker: '', text: '（獲得刺史長槍、金 4200。）', act: { gold: 4200 } },
    { speaker: '', text: '遠處煙塵大起——曹操親率大軍，聞訊東征，轉眼就要殺到汝南。' },
    { speaker: '劉備', text: '雲長，曹軍勢大，備與翼德往北投本初。兩位嫂嫂，就託付給你了。' },
    { speaker: '張飛', text: '二哥，俺先去前面探探路！……等等，大哥，您為什麼拉著俺的袖子？' },
    { speaker: '劉備', text: '三弟，你探路的方式，通常是把對面的探路兵直接打一頓。快走。' },
    { speaker: '諸葛貓妖', text: '（……喵，這一段，我讀過。接下來，雲長會困在土山。我該怎麼辦？）' },
    { speaker: '關羽', text: '貓先生，你不必隨我。' },
    { speaker: '諸葛貓妖', text: '喵？我要是不跟著，誰來吐槽你「降漢不降曹」到底是什麼意思？', set: { ch4_rebel: true } },
    { speaker: '劉備', text: '貓先生……雲長就託付給你了。', act: { leave: 'liubei' } },
    { speaker: '張飛', text: '二哥，俺們在古城等你！', act: { leave: 'zhangfei' } },
    { speaker: '', text: '土山。曹軍層層合圍，關羽護著兩位嫂嫂，把車駕停在山頂。' },
    { speaker: '張遼', text: '雲長兄，別來無恙？遼奉丞相之命，特來問候。' },
    { speaker: '關羽', text: '文遠，你這是來勸降？' },
    { speaker: '張遼', text: '不敢說勸降。只是兄長此刻，上有二嫂的安危，下有兄長的下落不明……何不先安身，再圖後事？' },
    { speaker: '關羽', text: '我有三個條件。一，我降的是漢帝，不是曹操；二，二位嫂嫂的供養，按皇叔的規矩；三，只要得知兄長下落，無論千里萬里，我立即辭去。' },
    { speaker: '張遼', text: '……三條，我都去稟告丞相。' },
    { speaker: '諸葛貓妖', text: '喵，我提醒一下：這三條，聽起來像是「我可以隨時跑路」的合約。' },
    { speaker: '張遼', text: '……貓先生，這個我就沒法替丞相轉達了。' },
    { speaker: '', text: '【關羽降曹。目標：回許都，見曹操。】', set: { ch4_tushan: true, ch4_guan_cao: true } }
  ];
  nm.runan.npcs = nm.runan.npcs.filter(function (n) { return n.id !== 'rn_courier'; });
  P2('runan', { id: 'rn_zhangliao', name: '張遼', sprite: 7, x: 7, y: 12, dir: 'right', dialogue: 'rn_zhangliao', showIf: 'chezhou_down' });
  function P2(map, o) { nm[map].npcs.push(o); }
  S.rn_zhangliao = [{ speaker: '張遼', text: '雲長兄，丞相在許都等您。放心，二位嫂嫂的車駕，我已派人護送。' }];

  // ---- 許都：曹操贈赤兔、錦袍；關羽把舊袍罩在外頭
  const xc = npc('xudu', 'xd_caocao');
  xc.alts = [{ flag: 'xd_chitu', dialogue: 'xd_caocao4' }, { flag: 'ch4_guan_cao', dialogue: 'xd_caocao3' }].concat(xc.alts || []);
  S.xd_caocao3 = [
    { speaker: '曹操', text: '雲長！你終於來了。你我是自己人，我替你上表，封你為漢壽亭侯。' },
    { speaker: '關羽', text: '關某降的是漢帝，不是丞相。這印，我收下，但不是為了丞相。' },
    { speaker: '曹操', text: '好，好。你的袍子舊了，我送你一件新的錦袍。' },
    { speaker: '', text: '（關羽收下新錦袍，卻把它穿在裡面，外面仍罩著劉備送的舊綠袍。）' },
    { speaker: '曹操', text: '雲長，你怎麼把新袍子穿在裡面？' },
    { speaker: '關羽', text: '舊袍是兄長所賜，穿上舊袍，如見兄長。' },
    { speaker: '諸葛貓妖', text: '（喵……他這是在當面說「我心裡想的是別人」。）' },
    { speaker: '曹操', text: '（咳）……我還有一份禮。這匹赤兔馬，是呂布的舊坐騎，送給你。' },
    { speaker: '關羽', text: '（竟然拜了兩拜）此馬日行千里，若知兄長下落，一日便可相見。多謝丞相！' },
    { speaker: '曹操', text: '……我送你金銀美女你都不拜，送一匹馬，你就拜兩拜？' },
    { speaker: '諸葛貓妖', text: '喵，因為馬可以幫他早點離職。' },
    { speaker: '', text: '（獲得赤兔馬、漢壽亭侯印、舊綠錦袍。）', act: { gear: ['chitu_boots', 'hanshou_seal', 'guan_green_robe'], once: 'xd_chitu_gift' } },
    { speaker: '曹操', text: '袁紹派大將顏良圍攻白馬，我軍連連受挫。雲長，你可願去解白馬之圍？', set: { xd_chitu: true } }
  ];
  S.xd_caocao4 = [{ speaker: '曹操', text: '白馬那邊情勢危急。雲長，拜託了。' }];
  // ---- 白馬、延津的人與對白
  npc('baima', 'bm_liuyan').showIf = 'xd_chitu'; npc('baima', 'bm_yanliang').showIf = 'xd_chitu';
  S.bm_liuyan = [
    { speaker: '劉延', text: '是關將軍！太好了，城外顏良帶著大軍，我這座小城快撐不住了。' },
    { speaker: '關羽', text: '劉太守放心，顏良在哪？' },
    { speaker: '劉延', text: '就在城南。他單槍匹馬挑戰我軍三員大將，三員都被他斬了。' }
  ];
  S.boss_yanliang = [
    { speaker: '顏良', text: '又來一個送死的？我顏良的大刀，專砍曹營的人！' },
    { speaker: '關羽', text: '顏將軍，白馬百姓無辜，何不退兵？' },
    { speaker: '顏良', text: '退兵？我家主公十萬大軍在後，這小城，今天就要踏平！' },
    { speaker: '諸葛貓妖', text: '（……喵，歷史上，這一刀要在萬軍之中取顏良首級。關羽，上吧。）' },
    { speaker: '關羽', text: '赤兔，借我一臂之力。' },
    { speaker: '顏良', text: '少廢話！看刀！', act: { battle: 'boss22', flag: 'yanliang_down', after: 'yanliang_after' } }
  ];
  S.yanliang_after = [
    { speaker: '顏良', text: '……我顏良，一生不敗，今日卻輸給了……你……' },
    { speaker: '關羽', text: '顏將軍，你的刀法，確是上品。只是，你選錯了主公。' },
    { speaker: '顏良', text: '……文丑……替我……報仇……' },
    { speaker: '', text: '（獲得河北大刀、金 5000。）', act: { gold: 5000 } },
    { speaker: '劉延', text: '白馬之圍解了！關將軍，大恩不言謝！' },
    { speaker: '諸葛貓妖', text: '喵……文丑，很快就會來了。'}
  ];
  S.boss_wenchou = [
    { speaker: '文丑', text: '就是你殺了顏良？我文丑，和顏良情同手足。今天，你一個也別想走！' },
    { speaker: '關羽', text: '文將軍，顏良之事，關某深感遺憾，可那一戰，是他先動的手。' },
    { speaker: '文丑', text: '廢話少說！我今天就要替顏良報仇！' },
    { speaker: '諸葛貓妖', text: '喵，雲長，他的槍纓是藍的。你記得別用刀去砍纓子，那會讓他更生氣。', act: { battle: 'boss23', flag: 'wenchou_down', after: 'wenchou_after' } }
  ];
  S.wenchou_after = [
    { speaker: '文丑', text: '……顏良，我……來陪你了。' },
    { speaker: '關羽', text: '文將軍，河北雙壁，一世英名，今日同赴黃泉，關某也深感惋惜。' },
    { speaker: '', text: '（獲得河北雙壁槍、金 5200。）', act: { gold: 5200 } },
    { speaker: '諸葛貓妖', text: '喵……河北最強的兩個人，都倒下了。……雲長，你的「報恩」，已經還完了。' },
    { speaker: '', text: '（曹操的軍隊，正駐紮在官渡。關羽決定去官渡見曹操。）' }
  ];
  // ---- 官渡：辭曹
  S.gd_intro = [
    { speaker: '', text: '官渡。黃河南岸的一座糧城，曹操十萬大軍屯在這裡，與袁紹隔河對峙。' },
    { speaker: '', text: '城裡到處是糧車與營帳，士兵連夜修築營壘，整座城像一張拉滿的弓。', set: { gd_intro_done: true } },
    { speaker: '諸葛貓妖', text: '喵……這座城，就是歷史上那場「以少勝多」的地方。可是關羽，你今天來，是為了辭行的吧？' },
    { speaker: '關羽', text: '貓先生，你猜得不錯。' }
  ];
  S.gd_caocao = [
    { speaker: '曹操', text: '雲長！你連斬顏良、文丑，替我解了白馬、延津之圍。這功勞，我要上表天子，再加封你！' },
    { speaker: '關羽', text: '丞相，關某此來，不是為了領賞。……聽說，我兄長在袁紹軍中？' },
    { speaker: '曹操', text: '……你已經知道了？' },
    { speaker: '關羽', text: '袁軍的探子，剛才在營外喊了一句：「劉皇叔在河北！」' },
    { speaker: '曹操', text: '（歎氣）我早知道你要走。我已經把「迴避牌」掛在門口了。' },
    { speaker: '諸葛貓妖', text: '喵，曹丞相，您這招，是「閉門謝客」還是「眼不見為淨」？' },
    { speaker: '關羽', text: '漢壽亭侯印，我封在這裡，原封不動。赤兔馬、金銀，我只帶走馬。……丞相，關某就此別過。', set: { ch4_guan_leave: true, ch4_part1_end: true } },
    { speaker: '', text: '【關羽辭曹。官渡東邊，有一條通往河北的「五關道」——五座關隘，六員守將。】' }
  ];
  S.gd_xunyu = [
    { speaker: '荀彧', text: '關將軍走了。丞相站在城樓上，看了很久。' },
    { speaker: '荀彧', text: '他嘴上說「放他走」，心裡想的卻是「真想把他綁回來」。' }
  ];
  // 官渡 NPC：曹操在關羽辭曹之後仍在（原有 gd_caocao 即為辭曹場景）；荀彧閒談
  // ================= 五關道入口（官渡東邊） =================
  (function () {
    const w4 = nm.world4, en = D.ch4Entry;
    w4.warps.push({ x: en.x, y: en.y, to: 'wg1', tx: 11, ty: 24, dir: 'up', need: 'ch4_guan_leave', deny: 'wg_sealed' });
    S.wg_sealed = [{ speaker: '', text: '這是通往河北的關道，守關的曹軍把路攔得嚴嚴實實。現在還沒有理由闖關。' }];
  })();
  // ================= 鄴城：兄弟重逢 =================
  nm.ye.events = nm.ye.events.filter(function (e) { return e.once !== 'ye_intro_done'; });
  nm.ye.events.push({ once: 'ye_intro_done', dialogue: 'ye_intro', need: ['wg5_down'] });
  S.ye_intro = [
    { speaker: '', text: '鄴城。冀州的大城，城高、兵多、旌旗滿街，整座城像是在說：「我們很有錢。」', set: { ye_intro_done: true } },
    { speaker: '關羽', text: '……兄長，應該就在城裡。' },
    { speaker: '諸葛貓妖', text: '喵……氣象越大，裡面越空。我讀過的書，這樣的故事不少。' }
  ];
  const yy = npc('ye', 'ye_yuanshao'); yy.alts = [{ flag: 'ye_meet', dialogue: 'ye_yuanshao2' }]; yy.showIf = 'wg5_down';
  S.ye_yuanshao = [
    { speaker: '袁紹', text: '關羽！你竟殺了我的顏良、文丑，還敢來見我？來人，把他拿下！' },
    { speaker: '', text: '（劉備與張飛從後堂匆匆趕出。）' },
    { speaker: '劉備', text: '本初兄，且慢！雲長是來投我的，他殺顏良、文丑，只是為了報曹操的恩。' },
    { speaker: '張飛', text: '二哥！俺老張在古城的時候，天天都想你！……等等，你怎麼還帶著一隻貓？' },
    { speaker: '諸葛貓妖', text: '喵，我不是「一隻貓」，我是你們這支隊伍的軍師。' },
    { speaker: '劉備', text: '雲長！貓先生！你們……你們一路闖了五關？！' },
    { speaker: '關羽', text: '兄長，關某來遲了。' },
    { speaker: '袁紹', text: '……罷了。顏良、文丑已死，殺了你也換不回他們。玄德，你兄弟就留下吧。' },
    { speaker: '劉備', text: '本初兄寬宏大量，備感激不盡。……雲長，二位嫂嫂呢？' },
    { speaker: '關羽', text: '兩位嫂嫂在後頭的車上，一路平安。', set: { ye_meet: true, ch4_end: true } },
    { speaker: '', text: '（劉備與張飛再度加入隊伍。）', act: { recruit: 'liubei' } },
    { speaker: '', text: '', act: { recruit: 'zhangfei' } },
    { speaker: '', text: '【第四章　許都風雲　完】（官渡之戰、烏巢火攻與新兵書，將在後續版本登場。）' }
  ];
  S.ye_yuanshao2 = [{ speaker: '袁紹', text: '玄德，你的兄弟都到齊了。……可惜我軍有田豐，不聽我的，現在他還關在牢裡。' }];
  // 張飛／劉備歸隊要用 'recruit'：它只檢查 recruited_ 旗標，所以第一次離隊後還能重新加入
  // ================= 主線任務重排 =================
  D.mainQuest = D.mainQuest.filter(function (q) { return q.world !== 'world4'; });
  D.mainQuest.push(
    { done: 'xd_wine', title: '第四章：從下邳往東，進入許都，與曹操煮酒論英雄', world: 'world4', to: 'xudu', where: '許都', hint: '兗徐大地圖東北角（濮陽東邊）有一道關門，打完高順才會開。' },
    { done: 'xd_belt', title: '在許都城內找董承，接下衣帶詔', world: 'world4', to: 'xudu', where: '許都城內', hint: '董承在城裡的東南角。喝完酒後才會出現。' },
    { done: 'chezhou_down', title: '到汝南，擊敗車冑', world: 'world4', to: 'runan', where: '汝南', hint: '汝南在大地圖西南。車冑守在城裡。' },
    { done: 'xd_chitu', title: '土山降曹之後，回許都見曹操', world: 'world4', to: 'xudu', where: '許都', hint: '汝南東北方向，沿大路回許都。曹操在城裡，會贈赤兔馬。' },
    { done: 'yanliang_down', title: '到白馬，斬顏良，替劉延解圍', world: 'world4', to: 'baima', where: '白馬', hint: '白馬在大地圖東北，顏良守在城南。' },
    { done: 'wenchou_down', title: '到延津，擊敗文丑', world: 'world4', to: 'yanjin', where: '延津', hint: '延津在白馬西邊，文丑守在城南。' },
    { done: 'ch4_guan_leave', title: '到官渡見曹操，辭行', world: 'world4', to: 'guandu', where: '官渡', hint: '官渡在大地圖中央，延津西南。' },
    { done: 'wg5_down', title: '從官渡東邊的五關道出發，過五關斬六將', world: 'world4', to: 'guandu', where: '官渡東邊的五關道入口', hint: '出官渡城東行，路邊有一塊關口圖塊。依序闖過東嶺關、洛陽關、汜水渡關、滎陽關、黃河渡口。' },
    { done: 'ch4_end', title: '渡過黃河，到鄴城與劉備、張飛重逢', world: 'world4', to: 'ye', where: '鄴城', hint: '五關道盡頭就在鄴城南邊，順著大路往北進城。' }
  );
  D.mainQuestEnd = '第四章已完成。官渡之戰、烏巢火攻與新兵書，將在後續版本登場。大地圖上的村莊、洞穴與支線，也可以先去看看。';
  // 城鎮解鎖
  D.worldBackfill.baima = 'xd_chitu'; D.worldBackfill.guandu = 'wenchou_down'; D.worldBackfill.ye = 'ch4_guan_leave';
})();
