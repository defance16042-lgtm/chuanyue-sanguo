// 由 tools/build_portraits_art.py 產生：每位武將自創畫像的索引（portraits.png 第 116 格起），蓋過舊的裁切頭像
(function () {
  const D = window.DATA;
  const R = {"zoujing": 116, "caocao": 117, "luzhi": 118, "chengyuanzhi": 119, "qushuai": 120, "bocai": 121, "pengtuo": 122, "zhaohong": 123, "hanzhong": 124, "busi": 125, "zhangliang": 126, "zhangbao": 127, "zhangjiao": 128, "duyou": 129, "zhangyan": 130, "zhangchun": 131, "huaxiong": 132, "lubu": 133, "xurong": 134, "dianwei": 169, "chengong": 170, "gaoshun": 171, "taoqian": 172, "mizhu": 173, "zhangkai": 174}, N = {"鄒靖": 116, "曹操": 117, "盧植": 118, "程遠志": 119, "黃巾渠帥": 120, "波才": 121, "彭脫": 122, "趙弘": 123, "韓忠": 124, "卜巳": 125, "張梁": 126, "張寶": 127, "張角": 128, "督郵": 129, "張燕": 130, "張純": 131, "華雄": 132, "呂布": 133, "徐榮": 134, "皇甫嵩": 135, "朱儁": 136, "簡雍": 137, "孫堅": 138, "公孫瓚": 139, "袁紹": 140, "左豐": 141, "樊稠": 142, "關口守將": 142, "郭汜": 143, "管亥": 144, "周倉": 145, "趙大壯": 146, "劉辟": 147, "何儀": 148, "李大目": 149, "眭固": 150, "于毒": 151, "烏延": 152, "蘇僕延": 153, "難樓": 154, "裴元紹": 155, "張濟": 156, "李傕": 157, "孫輕": 158, "王當": 159, "黃龍": 160, "樓班": 161, "閻柔": 162, "鮮于輔": 163, "趙岑": 164, "胡軫": 165, "白繞": 166, "丘力居": 167, "胡才": 168, "典韋": 169, "陳宮": 170, "高順": 171, "陶謙": 172, "糜竺": 173, "張闓": 174};
  Object.keys(R).forEach(function (id) { if (D.characters[id]) D.characters[id].portrait = R[id]; });
  D.npcPortraits = Object.assign(D.npcPortraits || {}, N);
  D.artPortraits = { ids: R, names: N };
})();
