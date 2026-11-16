// 進入點：載入圖檔後顯示標題畫面。
window.addEventListener('load', function () {
  Engine.init('screen');
  Engine.load({ tiles: 'assets/tiles.png', sprites: 'assets/sprites.png', objects: 'assets/objects.png', enemies: 'assets/enemies.png', bparty: 'assets/battle_party.png', benemy: 'assets/battle_enemy.png', mparty: 'assets/map_party.png', bparty2: 'assets/battle_party2.png', portraits: 'assets/portraits.png' })
    .then(function () {
      Engine.replaceAll(new Scenes.Title());
      Engine.start();
    })
    .catch(function (err) {
      const box = document.createElement('div');
      box.style.cssText = 'position:fixed;left:16px;top:16px;color:#ffd668;font:16px sans-serif;max-width:80vw';
      box.textContent = '遊戲載入失敗：' + err.message + '。請確認 assets 資料夾與 index.html 在同一層。';
      document.body.appendChild(box);
    });
});
