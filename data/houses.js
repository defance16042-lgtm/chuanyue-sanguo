// 城裡的房子：每一扇門都能進去。裡面有 NPC（閒聊、線索、送東西、賣東西）和隱藏寶箱。
// 寫法：states 由「進度最前面」的往後排，帶 flag 的是進度後的對話，不帶 flag 的是預設對話。
(function () {
  const D = window.DATA, E = D.equipment, S = D.dialogue;
  E.sunzi_scroll = { name: '孫子兵法殘卷', slot: 'charm', mods: { int: 6, lead: 4 }, price: 0, desc: '油漬斑斑的殘卷，字跡倒是很清楚。' };
  E.smith_blade = { name: '百煉鋼刀', slot: 'weapon', wtype: '刀', mods: { pow: 30, spd: 1 }, price: 0, desc: '東郡鐵匠壓箱底的好刀，打了三個月。' };
  E.old_helm = { name: '老兵舊盔', slot: 'helm', mods: { def: 5, grd: 2 }, price: 0, desc: '凹了幾處的舊盔，替主人擋過不少刀。' };
  E.villager_boots = { name: '獵戶麻鞋', slot: 'boots', mods: { spd: 3, def: 1 }, price: 0, desc: '走山路穿的麻鞋，腳底紮實。' };
  E.monk_amulet = { name: '老道平安符', slot: 'charm', mods: { grd: 6, luck: 3 }, price: 0, desc: '老道人隨手畫的符，據說比張角的靈。' };
  E.wine_gourd = { name: '酒葫蘆', slot: 'charm', mods: { lead: 3, luck: 4 }, price: 0, desc: '裝過好酒的葫蘆，拿著莫名有底氣。' };

  const HOUSES = {
    yingchuan: [
      { door: [6, 13], name: '空無一人的民宅', size: 'small',
        chest: { id: 'h_yc_a', gold: 80, item: { herb: 2 }, msg: '灶台旁的米缸底下，藏著主人匆忙間沒帶走的錢和藥。' },
        npcs: [{ name: '躲在屋裡的老人', sprite: 6, states: [
          { flag: 'h_yc_gift', lines: ['老人：他們都往南邊逃了。你們是官軍的人吧？替我們多殺幾個賊。'] },
          { lines: ['老人：我走不動了，索性躲在家裡。賊兵來了兩次，都嫌我家窮，沒搶。窮也有窮的好處。', '老人：這碗乾糧你拿去，我一個老頭子吃不了多少。'], act: { give: { herb: 1 }, once: 'h_yc_gift' } }] }] }
,
      { door: [17, 7], name: '潰兵借住的農舍', size: 'small',
        chest: { id: 'h_yc_b', gold: 120, msg: '灶房的罐子裡，是農婦存下的幾串錢。' },
        npcs: [{ name: '農婦', sprite: 6, states: [
          { lines: ['農婦：有幾個官軍的潰兵借住在這兒，吃了我兩天的飯，連句謝都沒說。'] }] }] }
    ],
    changshe: [
      { door: [5, 5], name: '老學究的書房', size: 'small',
        npcs: [{ name: '老學究', sprite: 10, states: [
          { flag: 'h_sunzi_done', lines: ['老學究：自從拿回那卷書，我連吃飯都捧著讀。對了，皇甫將軍的火攻之計，用的就是裡頭的「火攻篇」。'] },
          { flag: 'q_sunzi_found', lines: ['老學究：這、這是我的《孫子》！連封面上的油漬都是我當年吃餅留下的！', '老學究：這卷殘卷送你，你這樣的人，用得上。'], act: { gear: ['sunzi_scroll'], once: 'h_sunzi_done' } },
          { flag: 'q_sunzi_ask', lines: ['老學究：還沒找到嗎？聽說宛城那邊的工匠拿竹簡當墊腳板，千萬別讓他們劈了啊！'] },
          { lines: ['老學究：嗚嗚，老夫的《孫子兵法》被潰兵拿去當柴火啦！……不，應該說被拿去當墊子了。', '老學究：聽說有人在宛城的工匠帳裡見過類似的竹簡。你們要去宛城的話，替我留意一下？'], set: { q_sunzi_ask: true } }] }] },
      { door: [18, 5], name: '軍糧倉庫', size: 'small',
        chest: { id: 'h_cs_a', gold: 250, msg: '糧袋後面塞著一小袋軍餉，大概是哪個小吏私藏的。' },
        npcs: [{ name: '守倉小吏', sprite: 9, states: [
          { flag: 'h_cs_tonic', lines: ['小吏：明天一把火燒起來，這倉庫就沒了。皇甫將軍真是……不拘小節。'] },
          { lines: ['小吏：噓，別說出去。皇甫將軍打算明晚火攻，倉裡的糧草反正要燒掉，倒不如送你。', '小吏：提神茶，你拿去，記得別讓我長官看見。'], act: { give: { tonic: 2 }, once: 'h_cs_tonic' } }] }] },
      { door: [4, 14], name: '煮粥的民宅', size: 'small',
        npcs: [{ name: '煮粥的老婦', sprite: 7, states: [
          { flag: 'cave1_down', lines: ['老婦：聽說黃巾遺洞的鄧茂被打敗了！我兒子就是被他們抓去的，總算有點盼頭了。', '老婦：這點東西是我的心意。'], act: { gold: 300, once: 'h_cs_cave1' } },
          { lines: ['老婦：城裡來了好多士兵，一鍋粥怎麼夠分啊。', '老婦：城北有個黃巾遺洞，聽說殘黨盤踞在那兒，我兒子就被他們抓去當挑夫……要是有人能去看看就好了。'] }] }] },
      { door: [19, 14], name: '傷兵所', size: 'small',
        npcs: [{ name: '軍醫', sprite: 10, states: [{ lines: ['軍醫：傷兵太多，我手上只剩這些藥了。要買就快，明天可能還要更多傷兵。'], choices: [
          { label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] }
    ],
    wancheng: [
      { door: [5, 3], name: '工匠帳', size: 'small',
        chest: { id: 'h_wc_sunzi', flag: 'q_sunzi_found', msg: '工匠的墊腳板底下壓著一捲油漬斑斑的竹簡，封面寫著「孫子」二字。老學究要找的，應該就是這個。' },
        npcs: [{ name: '攻城工匠', sprite: 11, states: [{ lines: ['工匠：雲梯都快造不完了，哪有空管什麼竹簡！……那個墊腳的竹簡？拿走拿走，反正腳都踩出印子了。'] }] }] },
      { door: [16, 3], name: '糧草帳', size: 'small',
        npcs: [{ name: '糧官', sprite: 9, states: [
          { flag: 'h_wc_tonic', lines: ['糧官：孫堅將軍那一衝鋒，我倉裡的酒都空了一半，我自己也沒喝到……'] },
          { lines: ['糧官：孫將軍第一個爬上城牆，大夥兒士氣高漲，連糧官我也跟著熱血沸騰。', '糧官：拿去，這是慶功預備的茶，先分你一些。'], act: { give: { tonic: 2 }, once: 'h_wc_tonic' } }] }] },
      { door: [4, 14], name: '傷兵營', size: 'small',
        chest: { id: 'h_wc_b', gold: 180, msg: '傷兵床邊的木箱，裡頭是同袍湊的撫卹金。' },
        npcs: [{ name: '傷兵', sprite: 9, states: [{ lines: ['傷兵：韓忠的箭真準，我這條胳膊就是被他射穿的。', '傷兵：不過我命大，躺幾天就好了。你們打贏之後，記得來告訴我一聲。'] }] }] },
      { door: [21, 14], name: '城外農舍', size: 'small',
        npcs: [{ name: '農婦', sprite: 7, states: [
          { flag: 'h_wc_gift', lines: ['農婦：南陽的亂事總會過去的。到時候這地還得種。'] },
          { lines: ['農婦：官軍和黃巾輪流來，我們家的雞已經被借走三次了。唉，借了也不還。', '農婦：這捲布衣是我男人留下的，你穿去打仗吧。'], act: { gear: ['cloth'], once: 'h_wc_gift' } }] }] }
    ],
    dongjun: [
      { door: [5, 6], name: '鐵匠鋪', size: 'small',
        npcs: [{ name: '鐵匠', sprite: 11, states: [
          { flag: 'h_smith', lines: ['鐵匠：那把刀好好待它，它跟了你，就是打過三個月的緣分。'] },
          { lines: ['鐵匠：我壓箱底有一把百煉鋼刀，打了三個月，不輕易賣人。', '鐵匠：不過看你們是替朝廷出力的，四百金，一口價。'], choices: [
            { label: '買下 400金', act: { pay: 400, gear: ['smith_blade'], once: 'h_smith' } }, { label: '再想想' }] }] }] },
      { door: [20, 15], name: '糧商的宅子', size: 'small',
        chest: { id: 'h_dj_a', gold: 200, msg: '米缸夾層裡藏著一袋碎銀。糧商果然不會把錢放在明處。' },
        npcs: [{ name: '糧商', sprite: 14, states: [
          { flag: 'cave2_down', lines: ['糧商：什麼？黑山盜窟的于氐根被你們打趴了？太好了，我的商隊終於能走太行道了！', '糧商：這是商隊的謝禮。'], act: { gold: 500, once: 'h_dj_cave2' } },
          { lines: ['糧商：往北過太行山的商道，被黑山的盜窟擋住好幾年了。聽說他們的頭領于氐根號稱「劈天」，連官軍都不敢招惹。', '糧商：太行山深處有座黑山盜窟，據說裡頭堆滿了搶來的財貨，要是有人能剿了他們就好了。'] }] }] }
    ],
    guangzong: [
      { door: [5, 3], name: '士兵營房', size: 'small',
        chest: { id: 'h_gz_a', gold: 300, msg: '營房角落的箱子，似乎是哪位將領托人保管的軍餉。' },
        npcs: [{ name: '值夜士兵', sprite: 9, states: [{ lines: ['士兵：盧植將軍明明快攻下廣宗了，朝廷卻派個左豐來視察。', '士兵：聽說那位天使大人，是來要「好處」的。'] }] }] },
      { door: [16, 3], name: '書吏房', size: 'small',
        npcs: [{ name: '老書吏', sprite: 10, states: [
          { flag: 'h_gz_helm', lines: ['老書吏：我替盧將軍抄了三十年書，沒想到他老人家這麼倒楣。'] },
          { lines: ['老書吏：盧將軍清廉，不肯送禮給左豐，朝廷怕是要降罪了。', '老書吏：這頂舊盔是盧將軍年輕時戴的，他說有緣人才給。我看你們就是有緣人。'], act: { gear: ['old_helm'], once: 'h_gz_helm' } }] }] },
      { door: [4, 15], name: '傷兵屋', size: 'small',
        npcs: [{ name: '老兵', sprite: 9, states: [{ lines: ['老兵：我見過張角的人馬，沒有想像中凶。他們也是餓著肚子在拚命。', '老兵：不過仗打起來可不管這些。你們自己也小心。'] }] }] },
      { door: [17, 15], name: '老道人的住處', size: 'small',
        npcs: [{ name: '老道人', sprite: 8, states: [
          { flag: 'h_gz_amulet', lines: ['老道人：符你拿著，靈不靈就看你的運氣。'] },
          { flag: 'cave4_down', lines: ['老道人：于吉那傢伙被你們收拾了？哈，他早該被收拾了，天天裝仙人。', '老道人：這張符是老道我畫的，比于吉的靈多了。'], act: { gear: ['monk_amulet'], once: 'h_gz_amulet' } },
          { lines: ['老道人：在東南邊的山裡有個太平祕窟，裡頭住著于吉方士，據說得了太平道的真傳。', '老道人：他每天裝神弄鬼，騙了不少人。你們要是路過，替我教訓教訓他。'] }] }] }
    ],
    gzcity: [
      { door: [5, 3], name: '信徒的家', size: 'small',
        chest: { id: 'h_gc_a', gold: 150, item: { herb: 2 }, msg: '床底下的小木匣，是一個母親留給孩子的口糧和碎錢。' },
        npcs: [{ name: '黃巾信徒的妻子', sprite: 7, states: [{ lines: ['婦人：我丈夫去投了大賢良師，說是要「替天行道」。他走的時候，我們家只剩半袋米。', '婦人：你們是官軍吧？求你們……別傷他。'] }] }] },
      { door: [16, 3], name: '城中民宅', size: 'small',
        npcs: [{ name: '老人', sprite: 6, states: [{ lines: ['老人：大賢良師醫術是真的好，我年輕時被他治過病。可惜後來，他想救的不只是病人。'] }] }] },
      { door: [4, 14], name: '孩子們的家', size: 'small',
        npcs: [{ name: '孩童', sprite: 8, states: [
          { flag: 'h_gc_gift', lines: ['孩童：叔叔，你們是壞人還是好人？'] },
          { lines: ['孩童：我爹說黃巾軍是英雄，我娘說他們是壞人，到底誰才對呀？', '孩童：這個給你，是我最喜歡的玉墜。你要打壞人，就帶著它。'], act: { gear: ['jade'], once: 'h_gc_gift' } }] }] },
      { door: [17, 14], name: '藥鋪', size: 'small',
        npcs: [{ name: '藥師', sprite: 10, states: [{ lines: ['藥師：城裡的藥都快賣空了，也不管是誰家的傷兵，我一視同仁。'], choices: [
          { label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] }
    ],
    anxi: [
      { door: [[11, 3], [12, 3]], name: '縣衙', size: 'big',
        chest: { id: 'h_ax_a', gold: 150, msg: '案卷底下壓著一小袋公帑，大概是縣吏忘了報的零頭。' },
        npcs: [{ name: '縣衙老文書', sprite: 10, states: [{ lines: ['老文書：督郵每次來巡查，縣衙上下都要多備一份「孝敬」。我寫了三十年公文，頭一回覺得字寫得太多。'] }] }] },
      { door: [4, 9], name: '縣民的家', size: 'small',
        npcs: [{ name: '縣民', sprite: 7, states: [{ lines: ['縣民：新來的縣尉大人，聽說是個織蓆販履的？……不對，劉縣尉做事實在，我們看在眼裡。'] }] }] },
      { door: [19, 9], name: '獵戶的小屋', size: 'small',
        npcs: [{ name: '獵戶', sprite: 11, states: [
          { flag: 'h_ax_boots', lines: ['獵戶：山路好走了，多虧你們。'] },
          { flag: 'cave3_down', lines: ['獵戶：烏桓洞的蹋頓被打敗了！往後山裡的路好走多了。', '獵戶：送你一雙我穿舊了的麻鞋，走山路特別好用。'], act: { gear: ['villager_boots'], once: 'h_ax_boots' } },
          { lines: ['獵戶：幽州北邊山裡有個烏桓人的洞穴，我進山打獵時遠遠見過，裡頭有火光。', '獵戶：烏桓大人蹋頓據說藏了很多寶貝在裡面。我可不敢進去。'] }] }] },
      { door: [5, 14], name: '酒家', size: 'small',
        npcs: [{ name: '醉客', sprite: 4, states: [
          { flag: 'h_ax_riddle', lines: ['醉客：嘿嘿，我這謎題，還沒人答得出第二次。'] },
          { lines: ['醉客：來來來，猜個謎！什麼東西越洗越髒？', '醉客：猜對了，我這葫蘆就送你。'], choices: [
            { label: '水', act: { gear: ['wine_gourd'], once: 'h_ax_riddle' } }, { label: '衣服' }, { label: '貓' }] }] }] },
      { door: [18, 14], name: '藥鋪', size: 'small',
        npcs: [{ name: '掌櫃', sprite: 14, states: [{ lines: ['掌櫃：縣尉大人要出門辦事？買點藥帶著。'], choices: [
          { label: '傷藥 20金', act: { buy: 'herb' } }, { label: '煙霧彈 40金', act: { buy: 'smoke' } }, { label: '不買了' }] }] }] }
    ],
    sishui: [
      { door: [5, 8], name: '關前民宅', size: 'small',
        chest: { id: 'h_ss_a', item: { herb: 3, tonic: 2 }, msg: '米缸後面藏著幾包藥，是老農留著過冬的。' },
        npcs: [{ name: '老農', sprite: 8, states: [
          { flag: 'huaxiong_down', lines: ['老農：華雄倒了？那就好，我的田終於不用給人當戰場了。'] },
          { lines: ['老農：華雄那莽夫天天在關前罵陣，我的莊稼都被馬蹄踩光了。'] }] }] },
      { door: [19, 8], name: '聯軍傷兵帳', size: 'small',
        npcs: [{ name: '軍醫', sprite: 10, states: [{ lines: ['軍醫：被華雄砍傷的人，一個接一個抬回來。要藥就快買。'], choices: [
          { label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] },
      { door: [5, 16], name: '關下糧倉', size: 'small',
        chest: { id: 'h_ss_b', gold: 500, msg: '糧倉角落的軍餉箱，不知道是哪一路諸侯忘了帶走。' },
        npcs: [{ name: '糧官', sprite: 9, states: [{ lines: ['糧官：十八路的糧草都要從這兒過，我的帳本都快寫成天書了。'] }] }] },
      { door: [19, 16], name: '鐵匠鋪', size: 'small',
        npcs: [{ name: '鐵匠', sprite: 21, states: [{ lines: ['鐵匠：這幾天打的都是修補的活，刀砍卷了刃，槍折了桿。你們的兵器還好嗎？'] }] }] }
    ],
    hulao: [
      { door: [5, 16], name: '降卒營房', size: 'small',
        chest: { id: 'h_hl_a', gold: 600, msg: '床底下的錢袋，是西涼兵逃跑時沒來得及帶走的。' },
        npcs: [{ name: '降卒', sprite: 25, states: [
          { flag: 'lubu_down', lines: ['降卒：呂布都輸了，我們這些小兵還打什麼？我想回家種田。'] },
          { lines: ['降卒：將軍說關下有十八路人馬，我數了數，每路都比我們人多。'] }] }] },
      { door: [19, 16], name: '關下茶棚', size: 'small',
        npcs: [{ name: '茶棚老闆', sprite: 4, states: [{ lines: ['老闆：虎牢關下的茶，一碗三文。呂布一來，客人全跑光了，現在只剩你們還敢坐。'] }] }] }
    ],
    luoyang: [
      { door: [8, 16], name: '半毀的民宅', size: 'small',
        chest: { id: 'h_ly_a', item: { herb: 4, tonic: 3 }, msg: '牆角的陶罐沒被燒壞，裡面還留著藥草。' },
        npcs: [{ name: '難民', sprite: 6, states: [{ lines: ['難民：大火燒了三天三夜，我的家只剩下這半面牆。'] }] }] },
      { door: [15, 16], name: '太倉殘屋', size: 'small',
        npcs: [{ name: '老吏', sprite: 8, states: [{ lines: ['老吏：太倉的糧，被董卓搬空了。連皇宮的銅人，都被他融去鑄錢。'] }] }] }
    ],
    zhuoxian: [
      { door: [28, 4], name: '張世平的貨棧', size: 'small',
        chest: { id: 'h_zx_a', gold: 150, msg: '貨架後的小匣子，裝著夥計偷偷攢下的零錢。' },
        npcs: [{ name: '夥計', sprite: 9, states: [
          { lines: ['夥計：東家去北邊買馬了，這批貨是給劉備他們留的，不收錢……啊，我什麼都沒說。'] }] }] }
    ],
    guangyang: [
      { door: [4, 5], name: '衙役的家', size: 'small',
        chest: { id: 'h_gy_a', gold: 120, msg: '床板下的錢袋，是衙役沒來得及帶走的月俸。' },
        npcs: [{ name: '躲起來的衙役', sprite: 21, states: [
          { flag: 'boss2_down', lines: ['躲起來的衙役：渠帥倒了？那我明天就去縣衙，把腰牌找回來！'] },
          { lines: ['躲起來的衙役：黃巾進城的那天，我把官服塞進灶裡燒了。現在想起來，真丟人。'] }] }] },
      { door: [18, 5], name: '城南藥鋪', size: 'small',
        npcs: [{ name: '藥鋪掌櫃', sprite: 4, states: [
          { lines: ['藥鋪掌櫃：黃巾來的時候，我把值錢的藥都藏起來了。你們要藥，我賣給你們便宜點。'], choices: [{ label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] },
      { door: [5, 11], name: '倖存者的家', size: 'small',
        chest: { id: 'h_gy_b', item: { herb: 3 }, msg: '灶台上的小包袱，裡頭是老婦預備給兒子的藥草。' },
        npcs: [{ name: '老婦', sprite: 6, states: [
          { flag: 'boss2_down', lines: ['老婦：聽說渠帥被打倒了……我兒子，會不會回來？'] },
          { lines: ['老婦：我兒子被黃巾抓去當兵，到現在沒回來。你們要是遇到，請告訴他，娘還在等他。'] }] }] },
      { door: [19, 11], name: '糧鋪', size: 'small',
        npcs: [{ name: '糧鋪夥計', sprite: 8, states: [
          { lines: ['糧鋪夥計：城裡的米價一天三漲，黃巾占了倉，我只能偷偷賣一點。'] }] }] }
    ],
    youbei: [
      { door: [15, 7], name: '牧羊人的小屋', size: 'small',
        chest: { id: 'h_yb_a', item: { herb: 2 }, msg: '床邊的草藥袋，牧羊人自己都捨不得用。' },
        npcs: [{ name: '牧羊人', sprite: 8, states: [
          { lines: ['牧羊人：烏桓人的馬跑得比風還快，我這群羊，看到他們都不敢叫。'] }] }] },
      { door: [19, 14], name: '驛站', size: 'small',
        npcs: [{ name: '驛卒', sprite: 9, states: [
          { lines: ['驛卒：公孫將軍的軍報一天來三趟，我的馬都累瘦了。'] }] }] }
    ],
    heishan: [
      { door: [17, 7], name: '獵戶的屋子', size: 'small',
        chest: { id: 'h_hs_a', item: { herb: 3, smoke: 1 }, msg: '牆上掛著獵戶備著的藥草和煙霧彈。' },
        npcs: [{ name: '獵戶', sprite: 8, states: [
          { lines: ['獵戶：太行山上的飛燕，一半是人、一半是鳥，你們小心他的刀。'] }] }] },
      { door: [5, 9], name: '客商的歇腳處', size: 'small',
        npcs: [{ name: '客商', sprite: 4, states: [
          { lines: ['客商：這條山路我走了十年，今年第一次被人攔路，還給我留了回家的盤纏。'] }] }] }
    ],
    xiaquyang: [
      { door: [17, 7], name: '道觀', size: 'small',
        chest: { id: 'h_xq_a', item: { tonic: 2, herb: 2 }, msg: '供桌下的藥包，是道士平常給鄉人看病用的。' },
        npcs: [{ name: '老道人', sprite: 10, states: [
          { lines: ['老道人：符水治不了病，我早說過。可惜沒有人聽老道的話。'] }] }] },
      { door: [5, 9], name: '傷兵營', size: 'small',
        npcs: [{ name: '軍醫', sprite: 10, states: [
          { lines: ['軍醫：皇甫將軍的兵一路攻山，傷兵都往這兒送。要藥就快買。'], choices: [{ label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] }
    ],
    jizhou: [
      { door: [16, 4], name: '盧植的傳令所', size: 'small',
        npcs: [{ name: '傳令兵', sprite: 9, states: [
          { lines: ['傳令兵：盧中郎在廣宗築圍，每天都要我送三份軍報。他說，等圍成了，黃巾自己就會餓倒。'] }] }] },
      { door: [5, 13], name: '難民的草棚', size: 'small',
        chest: { id: 'h_jz_a', gold: 100, msg: '草棚角落的破布包，是難民僅剩的一點錢。' },
        npcs: [{ name: '難民', sprite: 6, states: [
          { lines: ['難民：我們從廣宗逃出來的，路上沒有一口熱飯。你們要是有餘糧，分給孩子吧。'] }] }] }
    ],
    runan: [
      { door: [5, 5], name: '漁夫的竹屋', size: 'small',
        chest: { id: 'h_rn_a', item: { herb: 2, tonic: 1 }, msg: '竹屋樑上吊著的藥包，漁夫說是治風濕的。' },
        npcs: [{ name: '漁夫', sprite: 8, states: [
          { lines: ['漁夫：汝南的水我最熟，彭脫熟得比我還熟，這就是他不好打的原因。'] }] }] },
      { door: [16, 6], name: '米行', size: 'small',
        npcs: [{ name: '米行掌櫃', sprite: 4, states: [
          { lines: ['米行掌櫃：彭脫的人來買過米，付的是現錢。我也搞不清楚他們到底算不算賊。'] }] }] }
    ],
    mengjin: [
      { door: [[11, 3], [12, 3]], name: '渡口官倉', size: 'big',
        chest: { id: 'h_mj_a', gold: 400, msg: '官倉最裡面的箱子，裝著本該發給船工的工錢，大概是被人遺忘了。' },
        npcs: [{ name: '倉吏', sprite: 21, states: [{ lines: ['倉吏：洛陽的糧車再不來，我這倉就只剩老鼠了。'] }] }] },
      { door: [4, 9], name: '船工之家', size: 'small',
        npcs: [{ name: '老船工', sprite: 8, states: [{ lines: ['老船工：黃河的水脾氣壞，夏天發怒、冬天結冰。想走水路，記得先問問我們。'] }] }] },
      { door: [19, 9], name: '雜貨鋪', size: 'small',
        chest: { id: 'h_mj_b', item: { herb: 3, tonic: 2 }, msg: '貨架下的暗格裡塞著幾包藥。' },
        npcs: [{ name: '掌櫃', sprite: 4, states: [{ lines: ['掌櫃：生意難做啊，洛陽的人一跑，渡口就冷清了。'] }] }] },
      { door: [5, 14], name: '渡口酒家', size: 'small',
        npcs: [{ name: '酒客', sprite: 7, states: [{ lines: ['酒客：聯軍十八路，我數過了，有一半是來混飯吃的。'] }] }] },
      { door: [18, 14], name: '民宅', size: 'small',
        npcs: [{ name: '老婦', sprite: 6, states: [{ lines: ['老婦：我兒子被抓去當兵了，希望聯軍的大人們，能讓他活著回來。'] }] }] }
    ],
    pingyuan: [
      { door: [[11, 3], [12, 3]], name: '縣衙', size: 'big',
        chest: { id: 'h_py_a', gold: 300, msg: '縣庫角落的一袋錢，是劉備省下來打算賑濟百姓的。' },
        npcs: [{ name: '縣衙差役', sprite: 21, states: [{ lines: ['差役：玄德公來了之後，縣衙的飯從一天一頓變成兩頓。'] }] }] },
      { door: [4, 9], name: '民宅', size: 'small',
        npcs: [{ name: '縣民', sprite: 7, states: [{ lines: ['縣民：玄德公剛來就替我們修了水渠。我家那三畝地，今年終於有水了。'] }] }] },
      { door: [19, 9], name: '鐵匠鋪', size: 'small',
        npcs: [{ name: '鐵匠', sprite: 11, states: [
          { flag: 'h_py_scale', lines: ['鐵匠：那副甲穿著還行吧？下次我給你打更好的。'] },
          { lines: ['鐵匠：我這兒有副鐵札甲，兩百金，不二價。'], choices: [
            { label: '買下 200金', act: { pay: 200, gear: ['scale'], once: 'h_py_scale' } }, { label: '不買了' }] }] }] },
      { door: [5, 14], name: '酒家', size: 'small',
        npcs: [{ name: '酒客', sprite: 4, states: [{ lines: ['酒客：公孫將軍的白馬義從，可真威風。我們平原的小孩都想當騎兵。', '酒客：不過玄德公說，要先學會種地，再學會打仗。'] }] }] },
      { door: [18, 14], name: '藥鋪', size: 'small',
        npcs: [{ name: '掌櫃', sprite: 14, states: [{ lines: ['掌櫃：平原新辦了義倉，藥材也歸官家管。不過賣你們，照樣算便宜價。'], choices: [
          { label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] }
    ],
    suanzao: [
      { door: [5, 5], name: '曹軍營帳', size: 'small',
        chest: { id: 'h_sz_a', gold: 350, msg: '帳裡的箱子，似乎是曹操的親兵放軍餉的。' },
        npcs: [{ name: '曹軍親兵', sprite: 9, states: [{ lines: ['親兵：我家主公說，天下大亂，正是英雄出頭之時。你們這些人，看起來也不像普通人。'] }] }] },
      { door: [20, 5], name: '袁軍營帳', size: 'small',
        npcs: [{ name: '袁軍謀士', sprite: 10, states: [{ lines: ['謀士：盟主講排場，營裡的旗幟都要加金邊。但打仗的事嘛，唉，大家各看各的。'] }] }] },
      { door: [4, 15], name: '補給營', size: 'small',
        npcs: [{ name: '補給官', sprite: 9, states: [
          { flag: 'h_sz_smoke', lines: ['補給官：用煙霧彈逃跑不丟人，活著才能再打。'] },
          { lines: ['補給官：各路諸侯的補給都堆在這兒。你們來得巧，送你幾顆煙霧彈。'], act: { give: { smoke: 3 }, once: 'h_sz_smoke' } }] }] },
      { door: [19, 15], name: '軍醫帳', size: 'small',
        npcs: [{ name: '軍醫', sprite: 10, states: [{ lines: ['軍醫：十八路諸侯，傷藥卻都是我一個人配的。要買就快。'], choices: [
          { label: '傷藥 20金', act: { buy: 'herb' } }, { label: '提神茶 30金', act: { buy: 'tonic' } }, { label: '不買了' }] }] }] }
    ]
  };

  const SLOTS = [[3, 2], [6, 2], [2, 4], [7, 4]];
  Object.keys(HOUSES).forEach(function (town) {
    const tm = D.maps[town];
    HOUSES[town].forEach(function (h, i) {
      const doors = Array.isArray(h.door[0]) ? h.door : [h.door];
      const big = h.size === 'big', w = big ? 12 : 10, ht = 7, dx = Math.floor(w / 2) - 1;
      const rows = [];
      for (let y = 0; y < ht; y++) {
        let r = '';
        for (let x = 0; x < w; x++) {
          if (y === 0 || x === 0 || x === w - 1) r += '#';
          else if (y === ht - 1) r += '#';
          else r += '_';
        }
        rows.push(r);
      }
      const put = function (x, y, ch) { rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); };
      put(1, 1, 'X'); put(2, 1, 'B'); put(1, 5, 'B'); if (big) put(w - 2, 5, 'X');
      put(dx, ht - 1, 'D'); if (doors.length > 1) put(dx + 1, ht - 1, 'D');
      const id = town + '_h' + i;
      const npcs = [];
      (h.npcs || []).forEach(function (n, j) {
        const slot = SLOTS[j] || SLOTS[0], alts = [];
        let def = null;
        n.states.forEach(function (st, k) {
          const key = 'h_' + town + '_' + i + '_' + j + '_' + k;
          S[key] = st.lines.map(function (t, li) {
            const m = /^([^：]{1,8})：(.*)$/.exec(t);
            const line = { speaker: m ? m[1] : n.name, text: m ? m[2] : t };
            if (li === st.lines.length - 1) { if (st.act) line.act = st.act; if (st.set) line.set = st.set; if (st.choices) line.choices = st.choices; }
            return line;
          });
          if (st.flag) alts.push({ flag: st.flag, dialogue: key }); else def = key;
        });
        npcs.push({ id: id + '_n' + j, name: n.name, sprite: n.sprite, x: slot[0] + (big ? 1 : 0), y: slot[1], dir: 'down', dialogue: def || alts[alts.length - 1].dialogue, alts: alts });
      });
      const objects = h.chest ? [Object.assign({ type: 'chest', x: w - 2, y: 1 }, h.chest)] : [];
      D.maps[id] = { name: h.name, tiles: rows, start: { x: dx, y: ht - 2, dir: 'up' },
        warps: [{ x: dx, y: ht - 1, to: town, tx: doors[0][0], ty: doors[0][1] + 1, dir: 'down' }].concat(doors.length > 1 ? [{ x: dx + 1, y: ht - 1, to: town, tx: doors[1][0], ty: doors[1][1] + 1, dir: 'down' }] : []),
        npcs: npcs, objects: objects };
      doors.forEach(function (d) { tm.warps.push({ x: d[0], y: d[1], to: id, tx: dx, ty: ht - 2, dir: 'up' }); });
    });
  });
})();
