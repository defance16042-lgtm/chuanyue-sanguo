// 店家招牌：屋子外面的門上寫「武器店／防具店／雜貨店／客棧」，不用走進去才知道裡面賣什麼。
// 由「哪個室內地圖裡有商人 NPC」反推，所以新增店家時不用另外設定。
(function () {
  const D = window.DATA, kindName = { weapon: '武器店', armor: '防具店', general: '雜貨店' };
  const inside = {};   // 室內地圖 id → 招牌文字
  Object.keys(D.maps).forEach(function (mid) {
    if (D.worldTowns && D.worldTowns[mid]) return;   // 大地圖上的城鎮本身不是「屋子」
    if (D.maps[mid].world) return;
    (D.maps[mid].npcs || []).forEach(function (n) {
      const keys = [n.dialogue].concat((n.alts || []).map(function (a) { return a.dialogue; }), n.alt ? [n.alt.dialogue] : []);
      keys.forEach(function (k) {
        const j = JSON.stringify(D.dialogue[k] || '');
        const m = j.match(/"shop":"([a-z0-9_]+)"/);
        if (m && D.shopKinds && D.shopKinds[m[1]] && !inside[mid]) inside[mid] = kindName[D.shopKinds[m[1]]] || '商店';
      });
    });
    if (/(^|_)inn\d*$/.test(mid) && !inside[mid]) inside[mid] = '客棧';
  });
  D.doorLabels = {};
  Object.keys(D.maps).forEach(function (mid) {
    const src = D.maps[mid]; if (src.world) return;
    (src.warps || []).forEach(function (w) {
      const t = inside[w.to]; if (!t || w.to === mid) return;
      (D.doorLabels[mid] = D.doorLabels[mid] || []).push({ x: w.x, y: w.y, text: t });
    });
  });
})();
