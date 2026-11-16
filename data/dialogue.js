// 對話資料。每個條目是一串台詞：{ speaker, text, choices?, set?, act? }。
//   choices：[{ label, set?, act? }] 顯示選項；選了之後把 set 的旗標寫入進度，並在對話結束後執行 act。
//   set：這句顯示後直接寫入旗標。　act：這句結束後執行動作（recruit 入隊、rest 住宿、buy 買道具、battle 戰鬥）。
// 以下全部是步驟 3（戰鬥）的測試用占位台詞，不是正式劇情。
window.DATA = window.DATA || {};
window.DATA.dialogue = {
  villager: [
    { speaker: '村民', text: '（測試）這裡可以測試路線選擇。選了之後不能反悔，只有選擇的路線技能會解鎖。' },
    { speaker: '村民', text: '（測試）你要走哪一條路？',
      choices: [
        { label: '武力路線', set: { route: 'force' } },
        { label: '智力路線', set: { route: 'wit' } },
        { label: '再想想' }
      ] },
    { speaker: '村民', text: '（測試）選擇已記錄。' }
  ],
  villager_done: [
    { speaker: '村民', text: '（測試）你已經選好路線了，無法更改。' }
  ],
  recruit_liubei: [
    { speaker: '劉備', text: '（測試）我願與你同行。', act: { recruit: 'liubei' } }
  ],
  recruit_guanyu: [
    { speaker: '關羽', text: '（測試）關某願效犬馬之勞。', act: { recruit: 'guanyu' } }
  ],
  recruit_zhangfei: [
    { speaker: '張飛', text: '（測試）俺也來！', act: { recruit: 'zhangfei' } }
  ],
  merchant: [
    { speaker: '商人', text: '（測試）要買點什麼？',
      choices: [
        { label: '傷藥 20金', act: { buy: 'herb' } },
        { label: '提神茶 30金', act: { buy: 'tonic' } },
        { label: '煙霧彈 40金', act: { buy: 'smoke' } },
        { label: '不買了' }
      ] }
  ],
  keeper: [
    { speaker: '酒肆老闆', text: '（測試）住一晚 30 金，兵力與戰術點全部恢復。',
      choices: [
        { label: '住宿', act: { rest: true } },
        { label: '不用了' }
      ] }
  ],
  vendor: [ { speaker: '攤販', text: '（測試）新鮮的果子，不買也看看！' } ],
  guard: [ { speaker: '衛兵', text: '（測試）城外有黃巾賊出沒，沒事別走遠。' } ],
  elder: [ { speaker: '老人', text: '（測試）近年天下不太平，連涿縣也常有流民經過。' } ],
  woman: [ { speaker: '婦人', text: '（測試）井水很甜，你也來打一桶吧。' } ],
  child: [ { speaker: '孩童', text: '（測試）我長大要當大將軍！' } ],
  scholar: [ { speaker: '書生', text: '（測試）讀書之餘，我也在留意天下的局勢。' } ],
  farmer: [ { speaker: '農夫', text: '（測試）今年收成不好，稅又重……' } ],
  granny: [ { speaker: '老婦', text: '（測試）外頭冷，進來坐坐吧。' } ],
  child_home: [ { speaker: '孩童', text: '（測試）嘿嘿，你是從哪裡來的？' } ],
  teacher: [ { speaker: '教書先生', text: '（測試）讀書明理，是亂世裡最不會被奪走的東西。' } ],
  boss_test: [
    { speaker: '程遠志', text: '（測試）哪來的小娃兒，敢擋我黃巾大軍的路！' },
    { speaker: '程遠志', text: '（測試）受死吧！', act: { battle: 'boss' } }
  ],
  boss_after: [
    { speaker: '', text: '（測試）擊敗了程遠志！' }
  ],
  lose_after: [
    { speaker: '', text: '你在涿縣醒來，身上的錢少了一半……' }
  ]
};
