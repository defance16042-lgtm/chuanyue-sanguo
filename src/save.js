// 存檔：存在瀏覽器的 localStorage，共 3 個欄位。無法使用時（例如隱私模式）會安全地回報失敗。
(function () {
  const KEY = 'chuanyue-sanguo-v1-slot';
  const Save = {
    SLOTS: 3,
    read: function (i) {
      try {
        const raw = localStorage.getItem(KEY + i);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    write: function (i, data) {
      try { localStorage.setItem(KEY + i, JSON.stringify(data)); return true; } catch (e) { return false; }
    },
    clear: function (i) {
      try { localStorage.removeItem(KEY + i); } catch (e) { /* ignore */ }
    }
  };
  window.Save = Save;
})();
