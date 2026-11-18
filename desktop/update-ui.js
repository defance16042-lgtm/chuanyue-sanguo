// 桌面版（Electron）的更新事件 → 交給遊戲內的更新畫面顯示（不再用網頁上的浮動視窗）
(() => {
  if (!window.desktopApp || !window.desktopApp.onUpdateStatus) return;
  window.desktopApp.onUpdateStatus((event) => {
    if (event && typeof event.status === 'string' && window.Updater && window.Updater.setDesktop) window.Updater.setDesktop(event);
  });
})();
