// 進入點：載入圖檔後顯示標題畫面。
window.addEventListener('load', function () {
  Engine.init('screen');
  Engine.load({ tiles: 'assets/tiles.png', tiles_hd: 'assets/tiles_hd.png', sprites: 'assets/sprites.png', sprites_hd: 'assets/sprites_hd.png', bparty_hd: 'assets/battle_party_hd.png', benemy_hd: 'assets/battle_enemy_hd.png', objects: 'assets/objects.png', bparty16: 'assets/battle_party16.png', benemy16: 'assets/battle_enemy16.png', portraits: 'assets/portraits.png', fx64: 'assets/fx64.png', bg_plain: 'assets/bg_plain.png', bg_forest: 'assets/bg_forest.png', bg_mountain: 'assets/bg_mountain.png', bg_sea: 'assets/bg_sea.png', bg_desert: 'assets/bg_desert.png' })
    .then(function () {
      Engine.replaceAll(new Scenes.Title());
      Engine.start();
    })
    .catch(function (err) {
      const box = document.createElement('div');
      box.style.cssText = 'position:fixed;left:16px;top:16px;color:#ffd668;font:16px sans-serif;max-width:80vw';
      box.textContent = '遊戲載入失敗：' + err.message + '。請確認 遊戲圖片資料夾與啟動頁面放在同一個資料夾。';
      document.body.appendChild(box);
    });
});
