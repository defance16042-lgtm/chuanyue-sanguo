const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  onUpdateStatus(callback) {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('app:update-status', listener);
    return () => ipcRenderer.removeListener('app:update-status', listener);
  },
  installUpdate() {
    ipcRenderer.send('app:install-update');
  },
  checkUpdate() {
    return ipcRenderer.invoke('app:check-update');
  }
});
