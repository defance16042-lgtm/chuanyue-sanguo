// 補給品：藥鋪商店（少／中／大量的兵力藥、戰術點藥、復活藥）與寶箱追加的藥品。最後才載入。
(function () {
  const D = window.DATA;
  // ---- 藥鋪：越後面的章節賣越好的藥 ----
  D.shopNames.medic1 = '藥鋪（初級）'; D.shopNames.medic2 = '藥鋪'; D.shopNames.medic3 = '名醫的藥鋪';
  D.shops.medic1 = ['herb', 'tonic', 'smoke'];
  D.shops.medic2 = ['herb', 'herb2', 'tonic', 'tonic2', 'revive', 'smoke'];
  D.shops.medic3 = ['herb2', 'herb3', 'tonic2', 'tonic3', 'revive', 'revive2', 'smoke'];
  // 既有的軍醫／藥鋪掌櫃：改成開藥鋪商店（依所在城鎮的進度決定賣什麼）
  const EARLY = { zhuoxian: 1, guangyang: 1, youbei: 1, heishan: 1 };
  const CH2 = { sishui: 1, hulao: 1, luoyang: 1, mengjin: 1, pingyuan: 1, suanzao: 1 };
  Object.keys(D.dialogue).forEach(function (key) {
    const m = /^h_([a-z0-9]+)_\d+_\d+_\d+$/.exec(key); if (!m) return;
    D.dialogue[key].forEach(function (line) {
      if (!line.choices || !line.choices.some(function (c) { return c.act && c.act.buy; })) return;
      const shop = EARLY[m[1]] ? 'medic1' : (CH2[m[1]] ? 'medic3' : 'medic2');
      line.choices = [{ label: '看看藥品', act: { shop: shop } }, { label: '不買了' }];
    });
  });
  // ---- 寶箱追加的藥品 ----
  const ADD = {
    c1b: { herb2: 1 }, c1e: { tonic2: 1 }, cave1_s1: { tonic2: 1 }, c1f: { herb2: 2 },
    c2c: { herb2: 2 }, c2e: { tonic2: 2 }, c2a: { herb2: 2 }, c2g: { tonic2: 2, herb2: 2 }, cave2_s1: { revive: 1 },
    c3e: { herb2: 2, tonic2: 2 }, c3a: { herb2: 3 }, cave3_s1: { revive: 1 }, c3g: { herb3: 1 },
    c4e: { herb2: 3, tonic2: 2 }, c4a: { herb3: 1 }, cave4_s1: { revive: 1, tonic3: 1 }, c4g: { herb3: 2, tonic3: 1 },
    c5e: { herb3: 2, tonic2: 3 }, c5a: { herb3: 2, revive: 1 }, cave5_s1: { revive2: 1, tonic3: 2 }, c5h: { herb3: 3, tonic3: 2, revive2: 1 },
    gw_c2: { herb2: 3, tonic2: 2 }, ge_c2: { herb3: 2, tonic3: 2, revive: 1 }, ge_c4: { herb2: 3 },
    shankou1_c3: { herb2: 3, tonic2: 2 }, shankou2_c3: { herb3: 2, tonic2: 3, revive: 1 },
    shankou3_c3: { herb3: 3, tonic3: 2, revive2: 1 }, shankou3_c4: { revive: 1 },
    h_ss_a: { herb2: 2 }, h_ss_b: { tonic2: 2 }, h_hl_a: { herb2: 2 }, h_ly_a: { herb3: 1, tonic2: 2 },
    h_mj_a: { tonic2: 1 }, h_mj_b: { herb2: 2 }, h_py_a: { tonic2: 2, revive: 1 }, h_sz_a: { herb2: 3 },
    h_cs_a: { tonic: 2 }, h_gz_a: { herb2: 2 }, h_gc_a: { tonic2: 1 }, h_dj_a: { herb2: 2 }, h_wc_b: { herb2: 2, tonic2: 1 }
  };
  Object.keys(D.maps).forEach(function (mid) {
    (D.maps[mid].objects || []).forEach(function (o) {
      if (o.type !== 'chest' || !ADD[o.id]) return;
      o.item = Object.assign({}, o.item);
      Object.keys(ADD[o.id]).forEach(function (k) { o.item[k] = (o.item[k] || 0) + ADD[o.id][k]; });
    });
  });
})();
