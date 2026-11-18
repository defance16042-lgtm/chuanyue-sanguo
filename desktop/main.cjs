const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let updateDownloaded = false;

function reportUpdate(status, message, percent = null) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('app:update-status', { status, message, percent });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 896,
    minWidth: 768,
    minHeight: 672,
    title: '穿越三國 諸葛貓妖傳',
    backgroundColor: '#0b0710',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function configureUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on('checking-for-update', () => {
    reportUpdate('checking', '正在檢查更新…');
  });
  autoUpdater.on('update-available', (info) => {
    reportUpdate('available', `發現新版本 ${info.version}，正在背景下載…`);
  });
  autoUpdater.on('update-not-available', () => {
    reportUpdate('current', '已是最新版本');
  });
  autoUpdater.on('download-progress', (progress) => {
    reportUpdate('downloading', `正在下載更新 ${Math.floor(progress.percent)}%`, progress.percent);
  });
  autoUpdater.on('update-downloaded', (info) => {
    updateDownloaded = true;
    reportUpdate('downloaded', `新版 ${info.version} 已下載完成；重新啟動即可安裝。`);
  });
  autoUpdater.on('error', (error) => {
    reportUpdate('error', `暫時無法檢查更新，仍可繼續遊戲。${error?.message ? ` (${error.message})` : ''}`);
  });

  // 遊戲內「檢查更新」按鈕
  ipcMain.handle('app:check-update', async () => {
    if (!app.isPackaged || process.platform !== 'win32') {
      reportUpdate('error', '開發模式／非 Windows 安裝版不提供自動更新。');
      return false;
    }
    try { await autoUpdater.checkForUpdates(); return true; } catch (error) {
      reportUpdate('error', `暫時無法檢查更新，仍可繼續遊戲。${error?.message ? ` (${error.message})` : ''}`);
      return false;
    }
  });

  ipcMain.on('app:install-update', () => {
    if (updateDownloaded) autoUpdater.quitAndInstall(true, true);
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    createWindow();
    configureUpdater();

    // 開發模式不查詢正式更新；已安裝的 Windows 版本在啟動時檢查。
    if (app.isPackaged && process.platform === 'win32') {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch((error) => {
          reportUpdate('error', `暫時無法檢查更新，仍可繼續遊戲。${error?.message ? ` (${error.message})` : ''}`);
        });
      }, 1200);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
