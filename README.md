# 穿越三國 諸葛貓妖傳

以三國歷史為背景的像素風 RPG。玩家將跟隨諸葛貓妖與劉備、關羽、張飛等角色，在中原大地圖上探索城鎮、洞穴與戰場，透過回合制戰鬥推進劇情。

> **目前開發版本：v0.26.1**  
> **目前 GitHub 正式 Release：v0.26.0**  
> `main` 分支已包含 v0.26.1 的開發內容；v0.26.1 尚未代表已正式發布的安裝版本。

## 下載與遊玩

### Windows 桌面版

- [前往 GitHub Releases 下載正式版](https://github.com/defance16042-lgtm/chuanyue-sanguo/releases)
- 最新正式 Release：[`v0.26.0`](https://github.com/defance16042-lgtm/chuanyue-sanguo/releases/tag/v0.26.0)
- 在 Release 頁面下載 `ChuanyueSanguo-0.26.0-Setup.exe`，執行安裝程式即可。
- 桌面版使用 Electron，支援啟動時檢查更新；下載更新後依提示重新啟動安裝。

### 從原始碼執行

需要安裝 Node.js 22 或相容版本。

```bash
npm ci
npm start
```

## 操作方式

| 操作 | 按鍵 |
| --- | --- |
| 移動 | 方向鍵或 W、A、S、D |
| 確認、對話、調查 | Z、Enter 或空白鍵 |
| 取消、開啟選單 | X、Esc 或 Backspace |

## 遊戲內容

### 大地圖探索

- 以中原地區為舞台，在城鎮、道路、森林、山地與海域地形之間旅行。
- 可在大地圖上往返各城鎮，並從城鎮入口進入城內場景。
- 城鎮建築與入口具有可互動的門；部分地點包含商店、旅店、NPC 與支線線索。
- 涿縣城堡使用獨立的完整城堡圖片素材 `assets/castle_world.png)，不再只依賴小圖塊拼接外觀。
- 大地圖、洞穴與裝飾資料由 `data/world.js`、`data/world_data.js` 與相關建置工具管理。

### 洞穴與探索事件

- 洞穴採多層探索結構，包含樓梯、守路頭目、特殊 NPC 與存檔水晶。
- 洞穴場景有火把、骨堆、雕像、石碑、陶罐、靈泉、拉桿與石門密室等環境物件。
- 探索時可與場景物件及 NPC 互動，取得線索或推進事件。

### 回合制戰鬥

- 戰鬥開始後，先替隊伍成員選擇行動，再依角色速度決定出手順序。
- 可使用普通攻擊、計謀、道具、防禦與逃跑等指令；部分頭目戰有特殊限制或事件。
- 計謀會消耗戰術點（TP），戰術點會在回合間逐步恢復。
- 角色計謀與技能會依角色及成長路線有所不同。
- 戰鬥包含增益、減益、混亂、暴擊、閃避、地形適性與不同武器的攻擊表現。
- 可使用偵察指令查看敵人資料；部分已擊敗頭目可能在後續野外遭遇中再次出現。

### 角色、隊伍與裝備

- 查看角色稱號、職類、武器種類、特性與能力資料。
- 可調整隊伍順序及軍師配置；軍師會影響隊伍戰術點能力。
- 角色升級時依成長設定提升能力。
- 可取得、裝備專屬武器與其他裝備，並查看裝備帶來的能力差異。

### 城鎮服務與存檔

- 城鎮中有商人、旅店、裝備店與可互動 NPC。
- 旅店可供隊伍住宿；商店可購買冒險所需道具。
- 存檔資料包含隊伍進度、金錢與道具等遊戲資料。
- 存檔使用瀏覽器儲存機制；桌面版資料保存在應用程式的本機資料環境中。請勿在解除安裝或清除應用程式資料前，未備份就假設存檔會保留。

## 目前劇情進度

遊戲已製作第一章「中原篇」及第二章「群雄逐鹿」的部分劇情內容，包含黃巾之亂相關戰役、各地頭目戰，以及群雄勢力登場等事件。劇情仍持續開發，實際可遊玩進度以目前版本內容為準。

## v0.26.1 開發內容

目前 `main` 分支的更新資訊：

- 大地圖涿縣城堡改用完整自創城堡圖，改善原本以小圖塊拼接時外觀不完整的問題。
- 保留原有城鎮座標、道路、地形、城門與進城功能。

> 注意：以上是目前程式分支的版本資訊。正式安裝版仍請以 [GitHub Releases](https://github.com/defance16042-lgtm/chuanyue-sanguo/releases) 顯示的最新正式版本為準。

## 專案結構

```text
.
├── index.html                 遊戲入口頁面
├── package.json               專案資訊、依賴與 Electron 打包設定
├── desktop/                   Electron 主程序、預載入與更新介面
├── src/
│   ├── engine.js              畫面與輸入引擎
│   ├── game.js                遊戲狀態與流程
│   ├── scenes.js              地圖、場景與互動繪製
│   ├── battle_logic.js        戰鬥規則
│   ├── battle_scene.js        戰鬥畫面
│   ├── save.js                存檔處理
│   └── version.js             遊戲版本資訊
├── data/                      角色、地圖、劇情、戰鬥與世界資料
├── assets/                    地圖圖塊、角色圖、頭像、戰鬥圖與城堡素材
├── tools/                     素材及世界資料建置工具
├── tests/                     遊戲流程與系統測試
└── .github/workflows/         Windows 建置與 Release 工作流程
```

## 開發與打包

安裝依賴：

```bash
npm ci
```

啟動桌面版：

```bash
npm start
```

建立 Windows 安裝包（不自動發布）：

```bash
npm run dist:win
```

Windows 安裝包輸出於 `dist/win/`。正式發布需依照 GitHub Actions 的 Tag／Release 流程執行。

## 素材與資料修改

- 地圖、城鎮與世界資料：編輯 `data/` 內對應資料檔。
- 場景與繪製邏輯：主要位於 `src/scenes.js`。
- 戰鬥規則與戰鬥畫面：位於 `src/battle_logic.js`、`src/battle_scene.js`。
- 圖片素材：位於 `assets/`。
- 世界地圖相關素材建置工具：位於 `tools/build_world.py`。

修改版本時，請同步檢查 `package.json`、`src/version.js` 與 `update.json` 的版本號，避免桌面版更新資訊不一致。

## 專案連結

- [GitHub 原始碼](https://github.com/defance16042-lgtm/chuanyue-sanguo)
- [正式版本下載](https://github.com/defance16042-lgtm/chuanyue-sanguo/releases)
- [問題回報](https://github.com/defance16042-lgtm/chuanyue-sanguo/issues)
