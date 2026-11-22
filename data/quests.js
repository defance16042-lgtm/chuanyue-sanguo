// 任務系統：主線目標（選單「任務」會告訴你下一步要去哪裡）與八個支線。
// 支線獎勵不是補藥：五個討伐令給專屬裝備，三個尋物給「兵書」（全隊學會一招新計謀）。
(function () {
  const D = window.DATA, B = D.battle, E = D.equipment, S = D.dialogue;

  // ---------- 主線：依順序，第一個還沒完成的就是「現在的目標」 ----------
  // done：完成旗標（字串）或函式；world：目標所在的大地圖；to：大地圖上的入口（地圖 id）；hint：補充說明
  D.mainQuest = [
    { done: 'boss_down',      title: '討伐涿縣的黃巾首領程遠志', world: 'world', to: 'zhuoxian', where: '涿縣南郊的黃巾營寨', hint: '先在涿縣備好傷藥，再往南走進黃巾營寨。' },
    { done: 'boss2_down',     title: '收復被黃巾佔領的廣陽', world: 'world', to: 'guangyang', where: '廣陽', hint: '廣陽在涿縣的東邊。' },
    { done: 'bocai_down',     title: '趕往潁川長社，支援皇甫嵩對抗波才', world: 'world', to: 'changshe', where: '長社', hint: '長社在大地圖最南邊，沿路會經過潁川道。' },
    { done: 'pengtuo_down',   title: '到汝南討伐水賊彭脫', world: 'world', to: 'runan', where: '汝南', hint: '汝南在長社的東邊，水鄉地形，海軍與水賊較多。' },
    { done: 'zhaohong_down',  title: '前往宛城，擊敗黃巾趙弘', world: 'world', to: 'wancheng', where: '宛城', hint: '宛城在大地圖西南。' },
    { done: 'hanzhong_down',  title: '繼續攻打宛城裡的韓忠', world: 'world', to: 'wancheng', where: '宛城', hint: '趙弘倒下後，韓忠還守在城裡。' },
    { done: 'busi_down',      title: '到東郡倉亭打敗黃河邊的卜巳', world: 'world', to: 'dongjun', where: '東郡・倉亭', hint: '東郡在大地圖東邊靠海。' },
    { done: 'zhangliang_down',title: '前往廣宗，會合盧植並擊敗張梁', world: 'world', to: 'guangzong', where: '廣宗', hint: '廣宗在冀州，位於大地圖中偏東。' },
    { done: 'zhangbao_down',  title: '到下曲陽討伐張寶', world: 'world', to: 'xiaquyang', where: '下曲陽', hint: '張寶據山用妖術起霧。' },
    { done: 'zhangjiao_down', title: '進入廣宗城內，面對張角', world: 'world', to: 'gzcity', where: '廣宗城內', hint: '最後的大戰，隊伍與道具都要準備好。' },
    { done: 'sanzhang_down',  title: '擊敗張角、張寶、張梁三兄弟', world: 'world', to: 'gzcity', where: '廣宗城內', hint: '三兄弟同時出戰，用全力！' },
    { done: 'duyou_down',     title: '第二章：到安喜縣，處理督郵的刁難', world: 'world', to: 'anxi', where: '安喜縣', hint: '安喜在大地圖西北方。' },
    { done: 'zhangyan_down',  title: '翻過太行山口，到太行山道擊敗黑山軍張燕', world: 'world', to: 'anxi', where: '太行山口（山口東邊入口）', hint: '大地圖中間偏西的太行山口，要等安喜的事件結束才會開。山口要爬三層山，守將都要打倒才過得去，翻過去就是太行山道。' },
    { done: 'zhangchun_down', title: '北上幽州，打敗張純與烏桓騎兵', world: 'world', to: 'youbei', where: '幽州北境', hint: '要穿過燕山口（打完太行山道的張燕才會開）。' },
    { done: 'py_news',        title: '到平原縣接任縣令，等待天下消息', world: 'world', to: 'pingyuan', where: '平原縣', hint: '平原在大地圖東邊。' },
    { done: function (f) { return f.ch2_arrived; }, title: '渡過黃河，前往關東', world: 'world', to: 'pingyuan', where: '平原東邊的渡口，或西邊的西關', hint: '到平原東邊的渡口付 300 金搭船最省事；也可以走太行山口到西邊，再從西關打倒守將過關。' },
    { done: 'sz_meeting',     title: '到酸棗聯軍大營參加會盟', world: 'world2', to: 'suanzao', where: '酸棗・聯軍大營', hint: '酸棗在關東地圖的東邊。' },
    { done: 'huaxiong_down',  title: '前往汜水關，擊敗華雄', world: 'world2', to: 'sishui', where: '汜水關', hint: '關羽的名場面就在這裡。' },
    { done: 'lubu_down',      title: '到虎牢關，三英戰呂布', world: 'world2', to: 'hulao', where: '虎牢關', hint: '呂布非常強，隊伍等級要夠，記得裝備陣形與備好復活藥。' },
    { done: 'xurong_down',    title: '到洛陽廢墟，擊敗徐榮', world: 'world2', to: 'luoyang', where: '洛陽廢墟', hint: '要翻過轘轅山口才到得了洛陽。' }
  ];
  D.mainQuestEnd = '第二章主線已全部完成。第三章敬請期待！可以去解支線任務、挑戰洞穴裡的將領，把隊伍練得更強。';

  // ---------- 支線 ----------
  // kind 'bounty'：打倒某將領；'fetch'：到洞穴裡找東西。giver：委託人所在地圖
  const GEAR = {
    q_yi_sword:  { name: '義勇劍',   slot: 'weapon', wtype: '劍', mods: { pow: 32, int: 3 }, price: 0, desc: '涿縣鄉親湊錢打的劍，劍柄刻著「保鄉衛土」四個字。' },
    q_yu_armor:  { name: '黑山藤甲', slot: 'armor', mods: { def: 17, spd: 1 }, price: 0, desc: '黑山藤條編成的輕甲，擋刀不擋風，穿起來意外靈活。' },
    q_nan_boots: { name: '草原快靴', slot: 'boots', mods: { spd: 6, def: 3 }, price: 0, desc: '烏桓牧人縫的快靴，跑起來連馬都追不上。' },
    q_guan_spear:{ name: '破浪槍',   slot: 'weapon', wtype: '槍', mods: { pow: 60, spd: 1 }, price: 0, desc: '管亥當年在海上用過的長槍，槍頭還有鹽花的痕跡。' },
    q_li_helm:   { name: '西涼狼盔', slot: 'helm', mods: { def: 11, lead: 4 }, price: 0, desc: '西涼狼騎的頭盔，戴上去連脖子都挺直了。' }
  };
  Object.keys(GEAR).forEach(function (k) { E[k] = GEAR[k]; });
  B.items.relic_jade = { name: '家傳玉佩', desc: '廣陽老婦遺失的玉佩，要拿回去還給她。', price: 0, quest: true };
  B.items.relic_blank = { name: '劍胚', desc: '宛城鐵匠世家的傳家劍胚，要拿回去交給鐵匠。', price: 0, quest: true };
  B.items.relic_bamboo = { name: '尉繚子竹簡', desc: '平原老學究遺失的兵書竹簡，要拿回去給他。', price: 0, quest: true };

  // 兵書：交付任務後，全隊學會一招新計謀（旗標 book_<id>）
  B.skills.wu_charge   = { name: '吳子・奮擊', tp: 8, kind: 'phys', target: 'all', power: 1.9, fx: 'cross' };
  B.skills.liutao_wits = { name: '六韜・奇正', tp: 7, kind: 'tact', target: 'one', power: 3.4, fx: 'thunder' };
  B.skills.weiliao_war = { name: '尉繚・死戰', tp: 9, kind: 'phys', target: 'one', power: 3.3, fx: 'execute' };
  B.bookSkills = { wu: 'wu_charge', liutao: 'liutao_wits', weiliao: 'weiliao_war' };
  B.bookNames = { wu: '吳子', liutao: '六韜', weiliao: '尉繚子' };

  const SIDE = [
    { id: 'q1', kind: 'bounty', giver: 'zhuoxian', npc: { x: 16, y: 4, name: '鄉長', sprite: 4 }, target: 'gen_cave1_3', targetName: '黃巾遺洞的渠帥何儀', where: '黃巾遺洞（涿縣西北）最深處', gear: ['q_yi_sword'], gold: 500,
      ask: '黃巾遺洞裡有個叫何儀的渠帥，三天兩頭帶人出來搶糧。要是有人能去收拾他，鄉親們願意把湊的錢和這把劍都送上。', done: '何儀倒了？！太好了！這把義勇劍請收下，是全鄉的一點心意。' },
    { id: 'q2', kind: 'bounty', giver: 'anxi', npc: { x: 4, y: 6, name: '縣衙小吏', sprite: 27 }, target: 'gen_cave2_3', targetName: '黑山盜窟的于毒', where: '黑山盜窟（太行山西）最深處', gear: ['q_yu_armor'], gold: 800,
      ask: '黑山盜窟裡的于毒，專劫往來商旅。縣裡出了討伐令，可惜沒人敢接，聽說你們很能打？', done: '于毒的人頭……不，于毒被打敗了！這件黑山藤甲是賞金之外的謝禮。' },
    { id: 'q3', kind: 'bounty', giver: 'youbei', npc: { x: 4, y: 7, name: '亭長', sprite: 32 }, target: 'gen_cave3_3', targetName: '烏桓洞的難樓', where: '烏桓洞（幽州北境）最深處', gear: ['q_nan_boots'], gold: 1200,
      ask: '烏桓洞裡的難樓仗著洞深路險，常出來擄牲口。誰能收拾了他，邊境的牧人都要感謝你。', done: '難樓被打敗了！牧人們送來這雙快靴，說這是草原上最好的。' },
    { id: 'q4', kind: 'bounty', giver: 'dongjun', npc: { x: 7, y: 10, name: '倉亭小吏', sprite: 12 }, target: 'gen_cave4_3', targetName: '太平祕窟的管亥', where: '太平祕窟（大地圖東南）最深處', gear: ['q_guan_spear'], gold: 1500,
      ask: '太平祕窟的管亥，原本在海上劫船，如今窩進洞裡。官府缺人手，你們願意去一趟嗎？', done: '管亥被打敗了！這支破浪槍是他的舊物，留在官府也是浪費，請你們收下。' },
    { id: 'q5', kind: 'bounty', giver: 'suanzao', npc: { x: 4, y: 7, name: '營中參軍', sprite: 29 }, target: 'gen_cave5_3', targetName: '邙山古墓的李傕', where: '邙山古墓（關東地圖）最深處', gear: ['q_li_helm'], gold: 2500,
      ask: '董卓的部下李傕帶人在邙山古墓裡盜掘皇陵，連軍費都想挖出來。聯軍分不出兵，你們能去一趟嗎？', done: '李傕被趕走了？！這頂西涼狼盔請收下，算是聯軍的一點心意。' },
    { id: 'q6', kind: 'fetch', giver: 'guangyang', npc: { x: 8, y: 4, name: '老婦', sprite: 12 }, chest: { map: 'cave1_2', x: 12, y: 18, id: 'q_jade' }, item: 'relic_jade', itemName: '家傳玉佩', where: '黃巾遺洞二層的深處', book: 'wu', gold: 300,
      ask: '我的家傳玉佩，逃難時掉在黃巾遺洞裡了。那是我兒子留下的唯一念想……能幫我找回來嗎？我這把年紀，只剩一卷祖傳的《吳子》能謝你們。', done: '就是它！就是它！謝謝你們。這卷《吳子》請收下，願它護你們平安。' },
    { id: 'q7', kind: 'fetch', giver: 'wancheng', npc: { x: 4, y: 7, name: '鐵匠之子', sprite: 12 }, chest: { map: 'cave4_2', x: 16, y: 3, id: 'q_blank' }, item: 'relic_blank', itemName: '劍胚', where: '太平祕窟二層的深處', book: 'liutao', gold: 600,
      ask: '宛城被圍的時候，我家傳的劍胚被黃巾搶走，聽說藏進了太平祕窟。找回來的話，我把父親留下的《六韜》送給你們。', done: '劍胚！我爹的劍胚找回來了！《六韜》請收下，我爹說過，這書要送給懂它的人。' },
    { id: 'q8', kind: 'fetch', giver: 'pingyuan', npc: { x: 4, y: 6, name: '老學究', sprite: 27 }, chest: { map: 'cave3_2', x: 20, y: 21, id: 'q_bamboo' }, item: 'relic_bamboo', itemName: '尉繚子竹簡', where: '烏桓洞二層的深處', book: 'weiliao', gold: 900,
      ask: '我那卷《尉繚子》竹簡，前年被烏桓人搶走，據說藏在烏桓洞。找得回來的話，我把整部書的心得都傳給你們。', done: '竹簡！是我的竹簡！好，這部書的精華我今天就傳給你們——《尉繚子》，記牢了。' }
  ];
  D.sideQuests = SIDE;
  // 共用的地圖計謀：任何洞穴、山口裡都能用，回到最近去過的城鎮
  D.fieldSkill = { name: '縮地脫出', tp: 4, desc: ['在洞穴或山口裡使用，', '立刻回到最近去過的城鎮。', '（不用走回頭路；', '用完要重新進洞穴／山口）'] };

  SIDE.forEach(function (q) {
    const id = q.id, nm = q.npc.name, map = D.maps[q.giver];
    const ready = q.kind === 'bounty' ? q.target + '_down' : q.chest.id.replace(/^/, 'chest_');   // 打倒將領／打開藏物箱
    const rewardAct = { once: id + '_reward', gold: q.gold };
    if (q.gear) rewardAct.gear = q.gear;
    if (q.book) rewardAct.book = q.book;
    S[id + '_ask'] = [{ speaker: nm, text: q.ask, set: (function () { const o = {}; o[id + '_start'] = true; return o; })() },
      { speaker: '', text: '【支線任務】' + (q.kind === 'bounty' ? '討伐' + q.targetName + '。' : '找回' + q.itemName + '。') + '地點：' + q.where + '。可在選單「任務」查看。' }];
    S[id + '_wait'] = [{ speaker: nm, text: q.kind === 'bounty' ? '拜託你們了。' + q.targetName + '還在' + q.where + '裡。' : '拜託你們了。' + q.itemName + '在' + q.where + '。' }];
    S[id + '_turn'] = [{ speaker: nm, text: q.done, act: rewardAct, set: (function () { const o = {}; o[id + '_done'] = true; return o; })() }];
    S[id + '_after'] = [{ speaker: nm, text: '真的很感謝你們。' }];
    map.npcs.push({ id: id + '_giver', name: nm, sprite: q.npc.sprite, x: q.npc.x, y: q.npc.y, dir: 'down', dialogue: id + '_ask',
      alts: [{ flag: id + '_done', dialogue: id + '_after' }, { flag: ready, dialogue: id + '_turn' }, { flag: id + '_start', dialogue: id + '_wait' }] });
    if (q.kind === 'fetch') {
      const items = {}; items[q.item] = 1;
      D.maps[q.chest.map].objects.push({ type: 'chest', id: q.chest.id, x: q.chest.x, y: q.chest.y, item: items, msg: '在角落裡找到了' + q.itemName + '！' });
    }
  });
})();
