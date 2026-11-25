// 第三章 批次2：洞穴（泰山寨、沂蒙山洞）、山口（鉅野山口）、守關將領、四條支線與兵書《三略》
// 洞穴地圖在 data/ch3caves.js（由 tools/build_ch3.py 產生）。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;
  const T = function (p, f, m, s) { return { plain: p, forest: f, mountain: m, sea: s }; };
  const en = B.enemies;

  // ================= 洞穴與山口的頭目 =================
  en.zangba = { name: '臧霸', terrain: T('B', 'B', 'A', 'C'), int: 40, lead: 52, luck: 10, title: '泰山賊首領', cls: '山賊將', weapon: '刀', desc: '泰山寨的寨主。他的父親被官府害死，他拉了幾千人上山，要與官府拼個你死我活。後來歸順了曹操，成為一代名將。', hp: 24000, atk: 140, def: 62, spd: 19, exp: 3600, gold: 2800, sprite: 58, boss: true, ai: 'boss' };
  en.changxi = { name: '昌豨', terrain: T('B', 'B', 'A', 'C'), int: 30, lead: 40, luck: 9, title: '沂蒙山賊首', cls: '山賊將', weapon: '刀', desc: '沂蒙山裡的老山賊，歸順過曹操又叛，叛了又降，一輩子都在「降」與「反」之間來回，直到最後一次被于禁處決。', hp: 34000, atk: 156, def: 70, spd: 20, exp: 5200, gold: 4000, sprite: 47, boss: true, ai: 'boss' };
  en.xuhe = { name: '徐和', terrain: T('B', 'A', 'S', 'C'), int: 28, lead: 38, luck: 9, title: '青州黃巾餘黨', cls: '山賊將', weapon: '刀', desc: '青州黃巾的餘黨首領，帶著幾千殘部流竄在兗州，專劫過往的客商。', hp: 22000, atk: 138, def: 60, spd: 18, exp: 3200, gold: 2400, sprite: 3, boss: true, ai: 'boss' };
  B.groups.cave6boss = [['zangba', 'yanzhou_thug', 'qingzhou_vet', 'bz_archer', 'xuzhou_rebel']];
  B.groups.cave7boss = [['changxi', 'xuzhou_rebel', 'xuzhou_rebel', 'qingzhou_vet', 'bz_archer']];
  B.groups.sk4boss = [['xuhe', 'yanzhou_thug', 'yanzhou_thug', 'qingzhou_vet', 'bz_archer']];
  B.groups.cave6g1 = [['yanzhou_thug', 'yanzhou_thug', 'qingzhou_vet', 'bz_archer']]; B.groups.cave6g2 = [['qingzhou_vet', 'qingzhou_vet', 'yanzhou_thug', 'bz_archer', 'bz_archer']];
  B.groups.cave7g1 = [['xuzhou_rebel', 'xuzhou_rebel', 'qingzhou_vet', 'bz_archer']]; B.groups.cave7g2 = [['xianzhen', 'xuzhou_rebel', 'qingzhou_vet', 'bz_archer', 'bz_archer']];
  B.groups.sk4g1 = [['yanzhou_thug', 'yanzhou_thug', 'qingzhou_vet']]; B.groups.sk4g2 = [['qingzhou_vet', 'qingzhou_vet', 'yanzhou_thug', 'bz_archer']];

  // 守關將領：每層一名，兵力約為該區頭目的 2～5 成，帶四名小兵（取自該區平常遇到的敵人）
  const GENS = [
    { k: 'cave6', boss: 'zangba', field: 'field12', title: '泰山賊將領', where: '泰山寨', names: ['吳敦', '尹禮', '孫觀'], sprites: [3, 12, 19], atk: 105, def: 47, spd: 17,
      says: ['這是泰山寨的地盤，擅闖者，留下命來！', '寨主說了，今天誰進了這個洞，誰就得把腰上的銀子交出來！', '孫某鎮守這道洞口多年，還沒人能不留下買路錢就過去的！'] },
    { k: 'cave7', boss: 'changxi', field: 'field13', title: '沂蒙山賊將領', where: '沂蒙山洞', names: ['管承', '司馬俱', '王度'], sprites: [19, 3, 12], atk: 111, def: 50, spd: 18,
      says: ['這山洞我住了十年，從沒有人不問我就進來的。', '黃巾雖散，我們這些人，還得吃飯！', '想過去？先看你們有沒有那本事。'] },
    { k: 'shankou4', boss: 'xuhe', field: 'field11', title: '青州黃巾將領', where: '鉅野山口', names: ['張饒', '劉石', '左髭丈八'], sprites: [12, 19, 3], atk: 100, def: 44, spd: 16,
      says: ['此山是我開，此路是我栽，過山口先交過路費！', '青州黃巾的旗還沒倒，我們還在！', '山路窄，一人一刀，看誰先倒下！'] }
  ];
  const FRAC = [0.22, 0.32, 0.45];
  GENS.forEach(function (g) {
    const bs = en[g.boss];
    g.names.forEach(function (nmn, i) {
      const id = 'gen_' + g.k + (i ? '_' + (i + 1) : '');
      en[id] = { name: nmn, terrain: T('B', 'B', 'A', 'C'), int: 22, lead: 30, luck: 8, title: g.title, cls: '將領', weapon: '刀', desc: '鎮守' + g.where + '的將領，兵多將廣，比尋常守衛難纏得多。',
        hp: Math.round(bs.hp * FRAC[i] / 10) * 10, atk: g.atk, def: g.def, spd: g.spd, exp: Math.round(bs.exp * FRAC[i]), gold: Math.round(bs.gold * FRAC[i]), sprite: g.sprites[i], boss: true, ai: 'boss' };
      B.groups[id] = [[id].concat(B.groups[g.field][0].slice(0, 4))];
      S[id] = [{ speaker: nmn, text: g.says[i] }, { speaker: '', text: nmn + '擺開架勢，身後的兵卒也圍了上來。', act: { battle: id, flag: id + '_down', after: id + '_after' } }];
      S[id + '_after'] = [{ speaker: nmn, text: '……好身手。算我技不如人，路給你們讓開。' }];
    });
  });
  // 專屬地形與專屬計謀（敵將計謀由 skills_late.js 依 boss／將領自動配；這裡先補地形）
  ['zangba', 'changxi', 'xuhe'].forEach(function (id) { D.terrainHome[id] = 'mountain'; });
  GENS.forEach(function (g) { g.names.forEach(function (_, i) { D.terrainHome['gen_' + g.k + (i ? '_' + (i + 1) : '')] = 'mountain'; }); });
  Object.keys(en).filter(function (k) { return /^(zangba|changxi|xuhe|gen_(cave6|cave7|shankou4))/.test(k); }).forEach(function (k) { D.applyTerrain(k, en[k], true); });

  // ================= 裝備、道具、兵書 =================
  Object.assign(E, {
    taishan_helm: { name: '泰山寨盔', slot: 'helm', mods: { def: 12, grd: 4, lead: 1 }, price: 0, desc: '泰山賊的頭盔，盔頂插著一根山雞毛。' },
    taishan_blade: { name: '泰山斬馬刀', slot: 'weapon', wtype: '刀', mods: { pow: 70, spd: 1 }, price: 0, desc: '泰山寨打鐵匠自己鍛出來的刀，刃口比官軍的還鋒利。' },
    taishan_jade: { name: '泰山玉符', slot: 'charm', mods: { lead: 7, luck: 4, grd: 2 }, price: 0, desc: '泰山寨主的信物，據說持有它的人，山賊都要賣個面子。' },
    yimeng_boots: { name: '沂蒙山靴', slot: 'boots', mods: { spd: 7, def: 3 }, price: 0, desc: '沂蒙山裡的獵人穿的靴，爬山不打滑。' },
    yimeng_spear: { name: '沂蒙獵槍', slot: 'weapon', wtype: '槍', mods: { pow: 74, spd: 1 }, price: 0, desc: '山裡獵戶打野豬用的長槍，槍頭很沉，槍桿很韌。' },
    yimeng_jade: { name: '沂蒙山玉', slot: 'charm', mods: { int: 8, grd: 4, luck: 3 }, price: 0, desc: '沂蒙山洞深處的玉，握在手裡會想起很安靜的事情。' },
    q_grain_helm: { name: '糧官銅盔', slot: 'helm', mods: { def: 11, grd: 3, lead: 2 }, price: 0, desc: '徐州糧官戴的銅盔。他說，守糧的人，頭不能比糧貴。' },
    q_sun_cloak: { name: '泰山披風', slot: 'armor', mods: { def: 21, spd: 1 }, price: 0, desc: '孫觀的披風，沾過泰山上的雪與霜，很重，也很暖。' },
    q_fire_charm: { name: '火場平安符', slot: 'charm', mods: { grd: 5, int: 4, luck: 3 }, price: 0, desc: '濮陽火場裡找回來的平安符，邊角燒焦了，卻依然完整。' }
  });
  B.items.relic_ledger = { name: '糧草帳冊', desc: '徐州糧官被搶走的糧草帳冊，要拿回去交給他。', price: 0, quest: true };
  B.items.relic_lock = { name: '長命鎖', desc: '濮陽婦人遺落在火場的長命鎖，要拿回去還給她。', price: 0, quest: true };
  B.items.relic_sanlue = { name: '三略竹簡', desc: '沂蒙山洞裡隱士收著的《三略》竹簡，要拿回去交給圯橋老人。', price: 0, quest: true };
  // 兵書《三略》：柔能制剛。全隊防禦提升，持續四回合
  B.skills.sanlue_soft = { name: '三略・柔剛', tp: 7, kind: 'buff', target: 'allAlly', stat: 'def', mult: 1.4, turns: 4, fx: 'up_b' };
  B.bookSkills.sanlue = 'sanlue_soft'; B.bookNames.sanlue = '三略';

  // ================= 洞穴的對話 =================
  const sold = function (n, t) { return [{ speaker: n, text: t }]; };
  S.cave6_g1 = [{ speaker: '泰山寨哨長', text: '站住！泰山寨的地盤，沒有寨主的令牌，誰也不能過！' }, { speaker: '張飛', text: '令牌？俺的丈八蛇矛就是令牌！', act: { battle: 'cave6g1', flag: 'cave6_g1_down', after: 'cave6_g1_after' } }];
  S.cave6_g1_after = sold('泰山寨哨長', '……好，你們進去吧，但裡面比我強的人，多得很。');
  S.cave6_g2 = [{ speaker: '寨中總管', text: '寨主說了，這洞裡的東西，誰也不准帶走一分一毫。' }, { speaker: '關羽', text: '我們只拿該拿的，不拿不該拿的。', act: { battle: 'cave6g2', flag: 'cave6_g2_down', after: 'cave6_g2_after' } }];
  S.cave6_g2_after = sold('寨中總管', '……你們走吧。寨主就在最深處，自己去對他說。');
  S.cave6_sp = [{ speaker: '被擄的商人', text: '我是被泰山賊抓來的，他們說要用我換三百石糧，結果我在這兒幫他們記帳記了三個月。' },
    { speaker: '被擄的商人', text: '這點藥草是我藏的，給你們帶著吧。你們若是遇到寨主臧霸，替我跟他說，帳我算錯了，不是我的錯。', choices: [{ label: '收下藥草', act: { give: { herb3: 2, tonic3: 2 }, once: 'cave6_sp_done' } }, { label: '不用了' }] }];
  S.cave6_sp_after = sold('被擄的商人', '你們小心。寨主那個人，看起來嚇人，其實講理。');
  S.cave6_boss = [
    { speaker: '臧霸', text: '來了。我臧霸在這泰山寨，等的就是這一天。' },
    { speaker: '劉備', text: '臧壯士，我們不是官府的人，只想請你們別再劫徐州的糧。' },
    { speaker: '臧霸', text: '糧？我們泰山人，一年到頭也吃不飽。官府要我們交租，卻從沒給過我們一口飯。' },
    { speaker: '諸葛貓妖', text: '……喵，這人講的話，很有道理，可是打還是要打。' },
    { speaker: '臧霸', text: '說得不錯！想要我讓路，拿本事來換！', act: { battle: 'cave6boss', flag: 'cave6_down', after: 'cave6_after' } }];
  S.cave6_after = [
    { speaker: '臧霸', text: '……好。你們打贏了我，這寨子今天算是我臧霸輸了。' },
    { speaker: '臧霸', text: '我臧霸不是壞人。你們日後若是遇到曹孟德，就說泰山還有一個人，不想再當賊。' }];
  S.cave7_g1 = [{ speaker: '山洞哨探', text: '喂！誰讓你們進來的？這是我們昌大哥的洞！' }, { speaker: '張飛', text: '你們的昌大哥是哪號人物？俺老張倒想會會他！', act: { battle: 'cave7g1', flag: 'cave7_g1_down', after: 'cave7_g1_after' } }];
  S.cave7_g1_after = sold('山洞哨探', '……過去吧。後面還有人等著你們。');
  S.cave7_g2 = [{ speaker: '洞中巡守', text: '再往裡走就是大哥歇息的地方了，看你們的樣子，不像是來交朋友的。' }, { speaker: '關羽', text: '得罪了。', act: { battle: 'cave7g2', flag: 'cave7_g2_down', after: 'cave7_g2_after' } }];
  S.cave7_g2_after = sold('洞中巡守', '……你們贏了。大哥就在前面。');
  S.cave7_sp = [{ speaker: '隱居的書生', text: '我在這洞裡避禍，每天讀書，有時候山賊還拿吃的給我，大概是怕我罵他們。' },
    { speaker: '隱居的書生', text: '書？你們說《三略》？……我的確藏了一卷。可惜那是別人託我保管的，只能給原主，不能給外人。', choices: [{ label: '收下乾糧', act: { give: { herb3: 2, tonic3: 2 }, once: 'cave7_sp_done' } }, { label: '不用了' }] }];
  S.cave7_sp_after = sold('隱居的書生', '讀書人最怕的就是書被燒了。你們要是見到那位老先生，替我說一聲，書我保管得很好。');
  S.cave7_boss = [
    { speaker: '昌豨', text: '喔？終於有人來沂蒙山洞找我了。我昌豨降過曹操，也反過曹操，降降反反，也沒什麼不好意思的。' },
    { speaker: '劉備', text: '昌將軍，兗州不太平，大家都想平安過日子。你何必……' },
    { speaker: '昌豨', text: '平安？平安值多少錢？我手下三千人要吃要穿，不比誰都不容易。' },
    { speaker: '關羽', text: '強詞奪理。放下刀，我們還能談。' },
    { speaker: '昌豨', text: '談？打贏我再談！', act: { battle: 'cave7boss', flag: 'cave7_down', after: 'cave7_after' } }];
  S.cave7_after = [{ speaker: '昌豨', text: '……罷了，又輸了一次。反正降也是我，反也是我，下次再見面，說不定又是朋友。' }];

  // ================= 山口：鉅野山口 =================
  D.passKit.SK.shankou4 = {
    boss: ['徐和', 'sk4boss', 'xuhe_down', '山口的崖壁上，青州黃巾的黃旗被風吹得獵獵作響。', '此山是我開，此路是我栽。要過山口，先給青州黃巾一點面子！', '……罷了，你們的本事，比我見過的官兵強。這山口，讓給你們。'],
    g1: ['黃巾哨兵', '站住！誰讓你們走這條路的？'], g2: ['黃巾旗頭', '前面就是徐和大帥，別再往前走了！'],
    tab: '「鉅野山口」——山路兩旁插著殘破的黃旗，風一吹，嘩啦啦響。', sp: ['挑夫', '這條山路我挑了十年的貨，頭一次遇到這麼多賊。這點乾糧給你們，路上用得上。']
  };
  (function () {
    const o = D.passKit.SK.shankou4, k = 'shankou4';
    S[k + '_boss'] = [{ speaker: '', text: o.boss[3] }, { speaker: o.boss[0], text: o.boss[4], act: { battle: o.boss[1], flag: o.boss[2], after: k + '_after' } }];
    S[k + '_after'] = [{ speaker: o.boss[0], text: o.boss[5] }];
    S[k + '_g1'] = [{ speaker: o.g1[0], text: o.g1[1], act: { battle: 'sk4g1', flag: k + '_g1_down', after: k + '_gafter' } }];
    S[k + '_g2'] = [{ speaker: o.g2[0], text: o.g2[1], act: { battle: 'sk4g2', flag: k + '_g2_down', after: k + '_gafter' } }];
    S[k + '_gafter'] = [{ speaker: '', text: '（敵人敗退了。）' }];
    S[k + '_sp'] = [{ speaker: o.sp[0], text: o.sp[1], choices: [{ label: '收下', act: { give: { herb3: 3, tonic3: 3 }, once: k + '_sp_done' } }, { label: '不用了' }] }];
    S[k + '_sp_after'] = [{ speaker: o.sp[0], text: '一路小心，山上的路不好走。' }];
    E.xuhe_blade = { name: '徐和長刀', slot: 'weapon', wtype: '刀', mods: { pow: 62 }, price: 0, desc: '徐和的刀，刀柄上纏著黃巾的布條。' };
    D.drops.xuhe = ['xuhe_blade', 1.0];
    D.passKit.climb(k, '鉅野山口', { sprite: 3, c1: { gold: 2200, msg: '山賊藏在石縫裡的贓物。' }, c2: { gold: 2800, gear: ['cliff_boots'], msg: '石龕裡供著的一雙鐵釘靴。' }, c3: { item: { herb3: 4, tonic3: 3 }, msg: '採藥人留在岩縫裡的藥包。' } }, 12);
    // 與 passes.js 一樣：山口兩端接回大地圖（南端回到西側，北端出到東側）
    (D.maps.world3.shankou || []).forEach(function (sk) {
      [sk.id, sk.id + '_2', sk.id + '_3'].forEach(function (mid) {
        const m = D.maps[mid]; if (!m) return; m.home = { map: 'world3' };
        m.warps.forEach(function (wp) { if (wp.to === 'WORLD') { wp.to = 'world3'; wp.tx = wp.y >= 26 ? sk.x - 2 : sk.x + 2; wp.ty = sk.y; } });
      });
    });
  })();

  // ================= 守關將領的位置：沿通道約六成路程 =================
  const solid = {}; D.solidTiles.forEach(function (t) { solid[t] = 1; });
  const walk = function (m, x, y) { const ch = (m.tiles[y] || '')[x]; return ch !== undefined && !solid[D.legend[ch]]; };
  const SOLIDOBJ = { chest: 1, torch: 1, bones: 1, statue: 1, tablet: 1, urn: 1, spring: 1, lever: 1, gate: 1, save: 1 };
  function blockedSet(m, withNpc) {
    const b = {};
    (m.objects || []).forEach(function (o) { if (SOLIDOBJ[o.type]) b[o.x + ',' + o.y] = 1; });
    if (withNpc) (m.npcs || []).forEach(function (n) { b[n.x + ',' + n.y] = 1; });
    return b;
  }
  function bfs(m, from, blocked) {
    const dist = {}, prev = {}; dist[from.x + ',' + from.y] = 0; const q = [[from.x, from.y]];
    while (q.length) {
      const c = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        const nx = c[0] + d[0], ny = c[1] + d[1], key = nx + ',' + ny;
        if (dist[key] !== undefined || !walk(m, nx, ny) || blocked[key]) return;
        dist[key] = dist[c[0] + ',' + c[1]] + 1; prev[key] = c[0] + ',' + c[1]; q.push([nx, ny]);
      });
    }
    return { dist: dist, prev: prev };
  }
  function placeGen(mapId, genId, target) {
    const m = D.maps[mapId], blocked = blockedSet(m, true), r = bfs(m, m.start, blockedSet(m, false)), tk = target.x + ',' + target.y;
    const path = []; let cur = r.dist[tk] !== undefined ? tk : null;
    if (!cur) { // 目標被擋住（例如頭目站的格子）：改走到它旁邊
      [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { const k2 = (target.x + d[0]) + ',' + (target.y + d[1]); if (r.dist[k2] !== undefined) { cur = k2; return true; } return false; });
    }
    while (cur) { path.unshift(cur); cur = r.prev[cur]; }
    const wp = {}; (m.warps || []).forEach(function (w) { wp[w.x + ',' + w.y] = 1; });
    const near = function (x, y) { return Object.keys(blocked).some(function (k) { const p = k.split(','); return Math.abs(p[0] - x) + Math.abs(p[1] - y) <= 1; }) || Object.keys(wp).some(function (k) { const p = k.split(','); return Math.abs(p[0] - x) + Math.abs(p[1] - y) <= 1; }); };
    if (path.length < 4) throw new Error("placeGen path too short: " + mapId + " " + genId + " " + JSON.stringify(target) + " start " + JSON.stringify(m.start));
    const start = Math.floor(path.length * 0.6);
    let pick = null;
    for (let d = 0; d < path.length && !pick; d++) {
      [start + d, start - d].some(function (i) { if (i < 2 || i >= path.length - 1) return false; const p = path[i].split(','); if (!near(+p[0], +p[1])) { pick = { x: +p[0], y: +p[1] }; return true; } return false; });
    }
    if (!pick) { const p = path[Math.max(2, start)].split(','); pick = { x: +p[0], y: +p[1] }; }
    const e = en[genId];
    m.npcs.push({ id: genId, name: e.name, sprite: e.sprite, x: pick.x, y: pick.y, dir: 'down', dialogue: genId, hideIf: genId + '_down' });
  }
  GENS.forEach(function (g) {
    [0, 1, 2].forEach(function (i) {
      const mapId = i ? g.k + '_' + (i + 1) : g.k, m = D.maps[mapId], gid = 'gen_' + g.k + (i ? '_' + (i + 1) : '');
      let target;
      if (g.k === 'shankou4') {
        const w = m.warps.find(function (w2) { return w2.to === g.k + '_' + (i + 2) || (i === 2 && w2.to === 'world3'); });
        target = w ? { x: w.x, y: w.y } : { x: m.start.x, y: m.start.y };
      } else if (i < 2) {
        const w = m.warps.find(function (w2) { return w2.to === g.k + '_' + (i + 2); }); target = { x: w.x, y: w.y };
      } else { const bn = m.npcs.find(function (n) { return n.id === g.k + 'boss'; }); target = { x: bn.x, y: bn.y }; }
      placeGen(mapId, gid, target);
    });
  });

  // ================= 支線 =================
  // 找一格「周圍八格都能走」的房間內部空地（放箱子不會擋路）：取離起點最遠的
  function freeSpot(mapId) {
    const m = D.maps[mapId], blocked = blockedSet(m, true), r = bfs(m, m.start, blockedSet(m, false)), wp = {};
    (m.warps || []).forEach(function (w) { wp[w.x + ',' + w.y] = 1; });
    let best = null;
    Object.keys(r.dist).forEach(function (k) {
      const p = k.split(','), x = +p[0], y = +p[1];
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { if (!walk(m, x + dx, y + dy) || blocked[(x + dx) + ',' + (y + dy)] || wp[(x + dx) + ',' + (y + dy)]) return; }
      if (!best || r.dist[k] > best.d) best = { x: x, y: y, d: r.dist[k] };
    });
    return best;
  }
  const c6 = freeSpot('cave6_2'), c7 = freeSpot('cave7_2');
  const SIDE = [
    { id: 'q9', kind: 'fetch', giver: 'xuzhou', npc: { x: 14, y: 11, name: '徐州糧官', sprite: 10 }, chest: { map: 'cave6_2', x: c6.x, y: c6.y, id: 'q_ledger' }, item: 'relic_ledger', itemName: '糧草帳冊', where: '泰山寨二層的深處', gear: ['q_grain_helm'], gold: 1500,
      ask: '徐州的糧草，這陣子老被泰山賊劫。最要命的是糧草帳冊也被搶走了，沒有它，我這個糧官連誰欠誰的都算不清。聽說藏在泰山寨裡，能幫我找回來嗎？', done: '帳冊！就是這本！我算了三個月都算不出來的帳，總算有頭緒了。這頂銅盔請收下，是我當官時發的。' },
    { id: 'q10', kind: 'bounty', giver: 'dongah', npc: { x: 13, y: 11, name: '東阿縣尉', sprite: 12 }, target: 'gen_cave6_3', targetName: '泰山寨的孫觀', where: '泰山寨（大地圖東邊的泰山）最深處的前一道關', gear: ['q_sun_cloak'], gold: 2200,
      ask: '泰山寨的孫觀，帶著人在東阿一帶燒殺搶掠。縣裡剛籌了點賞銀，只是沒人敢去。你們願意試試嗎？', done: '孫觀被打敗了！這件披風是縣裡備的賞物，不太華麗，但很暖。' },
    { id: 'q11', kind: 'fetch', giver: 'puyang', npc: { x: 16, y: 9, name: '喪家婦人', sprite: 12 }, chest: { map: 'puyang', x: 20, y: 15, id: 'q_lock' }, item: 'relic_lock', itemName: '長命鎖', where: '濮陽城內東南角被燒毀的廢墟', gear: ['q_fire_charm'], gold: 1800,
      ask: '那天夜裡，濮陽城裡一把大火，我的孩子被人救出來了，可是孩子脖子上的長命鎖，掉在廢墟裡了。那是他爹留給他的唯一念想……能幫我找回來嗎？', done: '就是它！燒焦了一角，不過還是它！我替孩子謝謝你們。這個平安符是我縫的，不值錢，請收下。' },
    { id: 'q12', kind: 'fetch', giver: 'xiapi', npc: { x: 9, y: 11, name: '圯橋老人', sprite: 8 }, chest: { map: 'cave7_2', x: c7.x, y: c7.y, id: 'q_sanlue' }, item: 'relic_sanlue', itemName: '三略竹簡', where: '沂蒙山洞二層的深處', book: 'sanlue', gold: 3000,
      ask: '年輕人，老夫那卷《三略》，早年託給一位避禍的讀書人保管，聽說他躲進了沂蒙山洞。你們若能取回來，老夫就把這部書的心法，傳給你們。', done: '竹簡……是它！老夫年輕時在橋上丟過一隻鞋，教了一個少年三次。如今這部書，也要傳給懂它的人。《三略》，柔能制剛，記牢了。' }
  ];
  SIDE.forEach(function (q) { D.sideQuests.push(q); });
  SIDE.forEach(function (q) {
    const id = q.id, nmn = q.npc.name, map = D.maps[q.giver];
    const ready = q.kind === 'bounty' ? q.target + '_down' : 'chest_' + q.chest.id;
    const rewardAct = { once: id + '_reward', gold: q.gold };
    if (q.gear) rewardAct.gear = q.gear;
    if (q.book) rewardAct.book = q.book;
    const st = function (k) { const o = {}; o[k] = true; return o; };
    S[id + '_ask'] = [{ speaker: nmn, text: q.ask, set: st(id + '_start') },
      { speaker: '', text: '【支線任務】' + (q.kind === 'bounty' ? '討伐' + q.targetName + '。' : '找回' + q.itemName + '。') + '地點：' + q.where + '。可在選單「任務」查看。' }];
    S[id + '_wait'] = [{ speaker: nmn, text: q.kind === 'bounty' ? '拜託你們了。' + q.targetName + '還在' + q.where + '。' : '拜託你們了。' + q.itemName + '在' + q.where + '。' }];
    S[id + '_turn'] = [{ speaker: nmn, text: q.done, act: rewardAct, set: st(id + '_done') }];
    S[id + '_after'] = [{ speaker: nmn, text: '真的很感謝你們。' }];
    map.npcs.push({ id: id + '_giver', name: nmn, sprite: q.npc.sprite, x: q.npc.x, y: q.npc.y, dir: 'down', dialogue: id + '_ask',
      alts: [{ flag: id + '_done', dialogue: id + '_after' }, { flag: ready, dialogue: id + '_turn' }, { flag: id + '_start', dialogue: id + '_wait' }] });
    if (q.kind === 'fetch') {
      const items = {}; items[q.item] = 1;
      D.maps[q.chest.map].objects.push({ type: 'chest', id: q.chest.id, x: q.chest.x, y: q.chest.y, item: items, msg: '找到了' + q.itemName + '！' });
    }
  });
})();
