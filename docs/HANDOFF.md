# 穿越三國・諸葛貓妖傳 — 開發交接（v0.53.2 開發中）

> 本文件已依目前 `main` 的 v0.53.2 開發進度更新。若舊版本紀錄與本文「目前狀態」衝突，以目前狀態、程式碼及測試為準。

## 專案概要
- 原創 PC RPG，HTML5 Canvas 256×224，Electron 桌面版。
- 使用者以繁體中文溝通；主角諸葛貓妖是**男性**。
- 美術使用原創像素素材；不可使用 emoji 代替人物／武器圖，不要擅自改成 SVG 感圖像。
- 遊戲內文字是正式遊戲內容，不應出現「測試版／測試戰鬥／製作中」等提示。
- 專案以電腦版為主。

## 目前版本與發布
- 開發版本：**v0.53.2（待測試／發布狀態待確認）**
- 最新已發布版本：**v0.53.0**
- 版本檔案需同步：`package.json`、`package-lock.json`、`src/version.js`、`update.json`；`tests/update_test.js` 會檢查版本。
- Release 頁面：https://github.com/defance16042-lgtm/chuanyue-sanguo/releases
- Windows 安裝包由 `.github/workflows/windows-release.yml` 建置並上傳至對應 tag。

## 已完成劇情

### 第一章：黃巾之亂
涿縣桃園結義、廣陽、潁川／長社、汝南、宛城、東郡倉亭、冀州廣宗、下曲陽、鉅鹿張角三兄弟最終戰；劉備受命安喜縣尉。含多座洞穴、城鎮房屋、機關與密室。

### 第二章：群雄逐鹿
安喜督郵、太行山道張燕、幽州北境、平原、酸棗會盟、汜水關華雄、虎牢關呂布、洛陽徐榮；第二章在洛陽段落結束。含關口、山口、渡船、水軍與洞穴。

### 第三章：兗州風雲
- world3 與陳留、東阿、濮陽、小沛、徐州、下邳六城。
- 主線含陶謙、張闓、侯成、宋憲、高順等事件；典韋依劇情助戰後離隊。
- 第三章第二批已加入己吾村、梁父村、華縣、泰山寨、沂蒙山洞、鉅野山口、四條支線與兵書《三略》。
- 支線數為 12 條（基礎八條＋第三章新增四條）。

### 第四章：許都風雲（v0.53.0 批次 1）
- world4（80×60）與六城：許都、汝南、官渡、延津、白馬、鄴城。
- 新增第四章敵群、車冑／顏良／文丑頭目、殘部再戰與招收資料。
- 主線目前涵蓋煮酒論英雄、衣帶詔、車冑事件、袁紹陣營及顏良／文丑戰役，進度至官渡前半段。
- 主線結尾明確標示第四章前半完成。

## 第四章尚待製作（下一批工作）
依 `docs/CHAPTER4_PLAN.md`：
1. 三個村莊。
2. 兩座洞穴。
3. 五個關口（關羽過五關的關卡）。
4. 四條支線與一本新兵書。
5. 關羽與諸葛貓妖同行的過五關流程；關羽為篇章核心，主角全程參與。若需要暫時調整隊伍，須保證隊伍與存檔旗標正確還原。
6. 關羽辭曹、千里走單騎、烏巢與官渡之戰後續主線。
7. 袁紹、曹操等對話潤飾與戰鬥平衡模擬。

下一個內容版本規劃為 **v0.54.0（第四章批次 2）**。開始前先向使用者確認劇情大綱與地圖規劃，分批實作。

## 架構與資料
- `index.html` 依序載入 classic scripts；沒有 bundler。資料放在 `window.DATA`。
- `src/scenes.js`：場景、地圖、對話、warp 與主要探索流程。
- `src/battle_logic.js`、`src/battle_scene.js`：戰鬥規則與畫面。
- `src/game.js`：隊伍、存檔、招收館、裝備／兵書等遊戲狀態。
- `data/`：角色、地圖、章節、敵人、計謀、商店、任務等資料。
- `tools/`：世界地圖、角色、頭像、特效與高清素材產生器；若輸出由工具產生，應修改工具後重新生成。
- `docs/CHAPTER4_PLAN.md`：第四章企劃與批次狀態。

## 已實作的主要系統
- 多章節大地圖、地形、城鎮／村莊／洞穴／關口／山口與章節封鎖。
- 角色自動成長、裝備、道具、兵書裝備、陣形、8 人隊伍（最多 5 人出戰）。
- 招收館與主線頭目殘部招收。
- 主線／支線任務、兵書計謀、軍師專屬計謀、敵方將領計謀。
- 高清地形與角色素材、原創戰鬥特效圖集、WebAudio 音樂與音效。
- Electron 安裝包與桌面自動更新。

## 測試與建置

本專案的測試檔為 `tests/*_test.js`，其中包含 Playwright Chromium 端到端測試與不需瀏覽器的邏輯／資料測試。重要測試包含：
- 遊玩、劇情、戰鬥、世界地圖、章節、地形、關口與山口。
- 裝備、商店、房屋、任務、招收、陣形、計謀、背包溢出與文字框超界。
- 第三章／第四章資料與主線流程。
- 更新版本與更新資訊檢查。

本次文件同步將 Windows GitHub Actions 加入完整回歸測試步驟：安裝 Playwright 與 Chromium，依序執行所有 `*_test.js`；任一測試失敗即停止後續建置。測試通過後才建置 Windows 安裝包。

本機基本指令：
```bash
npm ci
npm start
npm run dist:win
```

CI 使用 Node.js 22。Playwright 需安裝 Chromium 才能執行瀏覽器測試。

## 使用者已確認的設計規則
- 主角諸葛貓妖是男性，對白／稱呼不得女性化。
- 遊戲正式文字不顯示測試或製作中標籤。
- 原創人物與武器美術；不使用 emoji 代替角色／武器。
- 每批內容完成需同步版本檔案、更新 README 與交接、跑測試，再打包／發布。
- 若使用者提出不同的下一步，優先遵照當前對話中的明確指示。

## 開發注意事項
- `data/gens.js` 中 enemy.sprite 是戰鬥圖列；NPC.sprite 是地圖圖列，兩者不可混用。
- 角色加入／離隊、招收、兵書裝備、陣形及舊存檔 restore 都有相應測試；修改時一併檢查存檔相容。
- 章節地圖生成工具會重建輸出檔；請確認修改位於生成器或 runtime patch 的正確位置。
- Boss 數值調整後，使用對應 `tools/sim_ch*.js` 模擬，再以實際遊戲測試確認。


## 使用者最新確認：關羽辭曹／過五關劇情（規劃，未實作）
- 故事採《三國演義》戲劇性版本：曹操攻打徐州，劉備戰敗失散，關羽被曹軍擒獲，後暫時降曹；得知劉備下落後辭曹尋兄。
- 「過五關斬六將／千里走單騎」由關羽作為篇章核心，**諸葛貓妖一路同行**，參與劇情、探索和戰鬥。不得把貓妖留在袁紹另一線，也不要把玩法規劃成關羽完全單人而主角缺席。
- 劇情要有搞笑戲份：關羽嚴肅反差、曹操招降對話、守將誇張反應、諸葛貓妖吐槽與誤會笑點；但不能破壞關羽忠義形象和主線戲劇性。
- 五關需各自有不同守將／事件與戰鬥或突圍玩法，完成後銜接兄弟重逢及後續官渡劇情。
- 以上是使用者已確認的設計決策，尚未寫入遊戲程式、尚未完成或發布。下一次換帳號／接續開發時，先讀 docs/RE_REPORT.md 與 docs/CHAPTER4_PLAN.md。


## 新增長線劇情總企劃（規劃，尚未實作）
- 使用者要求依《三國志》史實骨架與《三國演義》戲劇演出規劃整體主線。
- 已新增 [docs/STORY_MASTER_PLAN.md](STORY_MASTER_PLAN.md)，暫定十章長線方向：黃巾、討董、兗州／下邳、許都／官渡、赤壁、荊州入蜀、漢中與荊州危局、蜀漢與夷陵、南中北伐、三國終局至 280 年歸晉。
- 歷史事件、演義橋段、遊戲原創內容需分別標示；諸葛貓妖全程作為玩家主角參與，但不取代主要歷史人物的核心功績。
- 第四章批次 2 需校正官渡、關羽過五關與汝南會合的時間及地理銜接。
- 第五章優先規劃赤壁事件與角色登場；後續依總企劃逐章補地圖、對話、戰鬥、支線和主角參與方式。
- 長線終章是否採歷史結局或改寫歷史結局仍待使用者確認。
- 本次僅新增／更新企劃文件，遊戲程式未修改，版本維持 v0.53.0，未發布新版本。

## 最新劇情規劃：史實年代細分為 39 篇（未實作）
- 使用者認為原本 10 個大章太少，要求按三國史實細分。已更新 docs/STORY_MASTER_PLAN.md 為 39 篇，從 184 年黃巾起義到 280 年西晉滅吳。
- 分篇包括：黃巾與東漢崩壞、討董、河北與徐州兗州、下邳、許都與官渡、袁氏敗亡、三顧茅廬、荊州赤壁、入蜀、漢中與荊州失守、魏蜀吳建立、夷陵、南中、北伐、姜維、蜀亡、晉代魏與滅吳。
- 史實年代／主要事件以《三國志》等史料核對；《三國演義》戲劇橋段標 ROMANCE；諸葛貓妖原創內容標 GAME_ORIGINAL。
- 諸葛貓妖仍是玩家主角，參與故事與戰鬥但不取代歷史人物核心功績。長篇跨度的主角年齡／身世需要另作合理化。
- 已完成的第一至第四章程式內容保持不動；此 39 篇是長線劇情目錄，不是遊戲已完成內容。
- 第四章批次 2 優先做關羽辭曹／過五關，貓妖全程同行，並校正與官渡事件的時間順序。
- 本次只更新企劃與交接，程式未改、版本仍 v0.53.0、未發布。


## 最新使用者需求：戰鬥敵將偵察情報多分頁（規劃，未實作）
- 戰鬥中選取敵方武將後可開啟「偵察」情報面板，使用多分頁＋頁內捲動呈現，不限單頁長度。
- 必須涵蓋：人物身勢／生平、完整能力值、裝備槽與加成、武技／特性、敵將計謀、軍師與軍師計謀、兵種／部隊／陣形、戰場狀態、弱點與戰術應對。
- 敵將計謀和軍師計謀分頁分開；各計謀顯示效果、目標、消耗、成功率／限制、冷卻、狀態效果與可破解方式（依現有資料欄位）。
- 情報面板切頁／捲動／關閉不得消耗戰鬥回合或重置戰鬥；文字不可裁切。
- 所有數值應連結既有遊戲資料與戰鬥即時值；史實／演義／原創描述需標記來源，缺資料不可虛構。
- 詳細規格見 [docs/ENEMY_GENERAL_SCOUTING.md](ENEMY_GENERAL_SCOUTING.md)。此需求尚未實作，版本仍 v0.53.0。


## 最新需求：支線任務目的地／方向指引（規劃，未實作）
- 所有支線接取後需明確指示玩家前往何處、從目前地點往哪個方向、到哪個入口／樓層／地標找誰或做什麼。
- 任務追蹤欄顯示目前階段、目的地、方向、位置、目標對象、完成條件與下一步。
- 大地圖以支線標記定位；城內、洞穴、多層地圖要標到正確入口／樓層／區域。尚未解鎖時顯示前置條件及最近可抵達路線；隱藏位置須先取得線索才揭露。
- 多階段支線每一步完成後，任務文字、方向與地圖標記同步更新。
- 詳細規格見 [docs/SIDE_QUEST_NAVIGATION.md](SIDE_QUEST_NAVIGATION.md)。此項尚未實作，版本仍 v0.53.0。


## v0.53.1 已寫入程式（尚待完整測試）
- `src/scout_info.js`：新增敵將偵察八分頁 renderer，並由 `index.html` 載入。
- `src/battle_scene.js`：偵察切頁／切換敵將／返回操作；偵察不消耗回合。
- `src/scenes.js`：支線任務詳情顯示目的地、方向、位置、NPC 座標；大地圖委託城鎮與支線洞穴入口／藏物有標記。
- 敵將實際裝備槽、完整軍師編制、弱點與陣形目前資料庫尚未全面配置；面板標示缺資料，不會捏造。
- 討伐支線若地圖沒有敵將座標，標記目標洞穴入口，並在任務追蹤說明敵將位於深處。
- 版本檔案已同步 v0.53.1；尚未跑完整 Playwright 測試、未建置安裝包、未發布。Release 仍是 v0.53.0。


## v0.53.2 地圖碰撞／樓梯修正
- `src/scenes.js`：場景物件不再預設全部阻擋；只有 solid tile、NPC、gate、boat 或明確 `solid:true` 擋路。火把、骸骨、石碑、存檔點、拉桿、泉水與雕像可穿越。
- `tools/build_world.py`：洞穴樓層 warps 直接落在下一／上一層的樓梯 tile；洞穴入口落在樓梯 tile，出口落在大地圖洞口標記。
- `data/world.js`：同步修正 25 條洞穴轉層／入口 warp，已用座標檢查確認落點符合樓梯方向。
- 汜水關、虎牢關、太行山道的固體地形與守將阻擋保留；守將倒下後 NPC 隱藏，原路可通。
- 尚未完成完整實機路線回歸；請查看 GitHub Actions 最新 Windows／測試工作結果。版本 v0.53.2。

## v0.52.0（第三章 批次2：村莊、洞穴、山口、支線、兵書）
- 村莊：jiwu 己吾村（陳留旁，解鎖旗 xurong_down→backfill 'cl_meet' 見 D.worldBackfill）、liangfu 梁父村、huaxian 華縣（小沛旁）。皆為 tools/build_ch3.py 的 'V' 模板；房屋在 data/ch3.js HOUSES.*（民宅＋雜貨店 tier3＋客棧 id 'inn'）。
- 洞穴：cave6 泰山寨（臧霸）、cave7 沂蒙山洞（昌豨），各 3 層；build_ch3.py 以 exec 方式重用 build_world.py 的 gen_floor/find_choke/add_decor/floors_of。輸出 data/ch3caves.js。
- 山口：shankou4 鉅野山口（守將徐和），用 D.passKit.climb（passes.js 新增匯出）。
- data/ch3b.js：臧霸/昌豨/徐和敵人、各洞穴的 GENS 部下、新裝備（taishan_*、yimeng_*、q_*）、道具 relic_*、計謀 sanlue_soft、兵書 sanlue、支線 q9–q12。
- 支線：q9 徐州糧官（取 cave6_2 帳冊）、q10 東阿縣尉（討伐 gen_cave6_3 孫觀）、q11 濮陽喪家婦人（取鎖）、q12 下邳圯橋老人（取 cave7_2 兵書《三略》）。任務清單可捲動（scenes.js，ROWS=8）。
- 數值：houcheng 26000/142/64、songxian 27000/138/65、gaoshun 30000/142/68、zangba 24000/140/62、changxi 34000/156/70、xuhe 22000/138/60；sim（tools/sim_ch3.js）顯示 Lv48–54 可過。
- 測試：tests/ch3b_test.js（22 項）；gens_test、quests_test 已改成 12 條支線、洞穴數 ≥24。
- 待辦：第四章規劃；陳宮／陶謙／糜竺閒談對白潤飾；洞穴頭目殘部招收非必要。

## v0.53.0（第四章 批次1：許都風雲 主線）
- 企劃：docs/CHAPTER4_PLAN.md（批次2＝村莊、洞穴、五關口、支線、新兵書、關羽單獨隊「過五關」）。
- tools/build_ch4.py → data/ch4world.js：world4（80×60；黃河橫貫北方）＋六城 xudu/runan/guandu/yanjin/baima/ye（城鎮模板用 exec 重用 build_ch3.py 的「城鎮模板」區段，TOWN_SPEC 另設）。D.ch4Doors 記門序；進入 world4 的關門在 data/ch4.js 內改 world3 圖塊（(61..78, 13) 一條路＋關門，warp need 'ch3_end'，deny 'pass_sealed4'），world4 西邊 (2,35) 回 world3 (76,13)。
- data/ch4.js：敵人 yu_bandit/yuan_infantry/yuan_crossbow/hebei_cav/yuan_elite、頭目 chezhou/yanliang/wenchou（battle 圖列 56/57/58；招收用地圖列 62/63/64）、field14–16、boss21–23、殘部 *_r 與 rematch 旗（chezhou_down/yanliang_down/wenchou_down）、裝備 G5、商店（tier 5＝W5/A5）、房屋（HOUSES，門序要與模板對應：T1 第一間是 big 雙門，T2 第二間是 big）、NPC、對話、主線 mainQuest(world4)、worldBackfill。
- 流程旗：xd_intro_done → xd_wine（煮酒，送 1500 金）→ xd_belt（衣帶詔，送玉帶佩）→ chezhou_down + ch4_rebel → ye_meet → yanliang_down → wenchou_down → ch4_part1_end（官渡，關羽辭曹，下一版接過五關）。mainQuestEnd 暫時寫「前半完成」。
- 美術：tools/recruit_chars.py 新增 xunyu/dongcheng/chezhou/yanliang/wenchou/yuanshao（map 60–65、battle 54–59，要依序跑 build_recruits.py → build_char_hd.py），char_styles.py 加造型；build_portraits_art.py 加 6 張自畫像（portraits.png 177–182）。recruit.js INFO、recruit_skills.js T 各加 3 位。
- 數值：chezhou 38000/190/88、yanliang 42000/194/92、wenchou 44000/200/92；sim_ch3.js：Lv50 約 35%、Lv53 車冑 100%、顏良 Lv53 16%/Lv56 98%、文丑 Lv56 93%/Lv58 100%。
- 測試：tests/ch4_test.js（25 項）；ch3b 之後 gens/quests 測試已放寬數量限制。
- 待辦（批次2）：村莊 3、洞穴 2、關口 5（過五關各一）、支線 4、新兵書、關羽分隊機制、袁紹/曹操閒談潤飾、官渡之戰（烏巢）。

## v0.53.1（名將畫像、計謀與能力獨立設計）
- 畫像：tools/portrait_art.py 新增 head（pheasant 雉尾冠／chi 赤幘／taoist 黃巾道士／tiger 虎首盔／fu 朝官冠）、body（fur 毛皮／beast 獸面吞肩／taoist）、eye（phoenix 丹鳳眼／tiger／droop）、brow（sword／knit／long）、nose（hawk／flat）、beard（three／forked／mutton）、stache（pencil／handle／none）、jowl 雙下巴，以及 pre/post 繪圖掛鉤。tools/hist_specs.py 放 30 位名將的專屬設定與背景圖案（方天畫戟、大刀、雙戟、光芒、法杖、羽扇…）；build_portraits_art.py 載入後覆蓋同鍵設定，並把其他人的鼻、鬍、眉輪替。新增董卓（dongzhuo|董卓）。
- 計謀：data/recruit_skills.js 的 KIT（個人 4 招＋軍師 2 招）與 LATE（Lv26／36／48 三招）逐人設計，效果組合（hits／rider／leech／lowBonus／dot／hot／cleanse／confuse／stun／extra）各不相同；data/skills_late.js 遇到有 _La 技能的人就不再產生共用範本版。
- 能力：data/recruit.js 的 PROF 逐人設定 [兵力, 戰術點, 武力, 智力, 速度, 統率, 運氣, 防禦]、成長與專屬特性（猛將重武力、智將重智力與統率、張燕重速度、徐榮／高順／韓忠重統率與防禦）。
- 新增招收將領時，請同步加：recruit.js INFO + PROF、recruit_skills.js T + KIT + LATE、hist_specs.py（或 build_portraits_art.py）畫像。

## 武將頭像高解析度更新（僅頭像，已確認範圍）
- 使用者明確要求：先只改善武將頭像／大頭像，讓臉部五官、鬍鬚、頭盔與表情更清楚。
- **禁止修改戰鬥人物大小、原有人物比例、站位、動畫、戰鬥畫面尺寸或人物圖集格尺寸。** 不做戰鬥人物放大。
- 以原本頭像在各介面的顯示尺寸為基準；製作更高解析度的原創頭像來源，供大頭像與小頭像使用，顯示大小維持原設定。
- 同一武將的大小頭像共用同一套原創設計，辨識特徵一致。
- 畫風維持遊戲原本的人物設計，不改 Q 版；不使用其他遊戲、動漫、漫畫或商業作品的圖像，所有頭像重新自創。
- 本項目前為已確認規格；尚未完成整批頭像繪製或整合。正式修改前需盤點目前頭像圖集尺寸、角色索引與介面呼叫，並只替換頭像素材／來源，不動戰鬥人物資產。

- 註：v0.53.1 的名將畫像仍是 48×48 格（portraits.png 第 116 格起，由 tools/portrait_art.py＋hist_specs.py 產生），沒有動戰鬥人物大小或圖集格尺寸；上面「頭像高解析度」規格若要實作，請以 portrait_art.py 的 G／SS 繪圖座標（96 格、8 倍超取樣）為基礎放大輸出，讓同一套設計共用大小頭像。

## v0.54.0 第四章批次2a（《演義》主線＋五關道）
- data/ch4b.js：改寫 chezhou_after（劉備、張飛北上，關羽土山約三事降曹，flag ch4_guan_cao）、許都 xd_caocao3 贈赤兔馬／漢壽亭侯印／舊綠錦袍（flag xd_chitu）、白馬／延津／官渡辭曹（ch4_guan_leave）。
- 五關道：地圖 wg1–wg5（24×26，頭目站在隔牆唯一通道上擋路，南出口進、北出口出），入口為 world4 的 D.ch4Entry（need ch4_guan_leave），wg5 北出口回 world4 (58,7) 通鄴城；頭目戰群 wgNboss／wgNg1／wgNg2。
- 鄴城需 wg5_down 才觸發袁紹重逢（recruit liubei／zhangfei、flag ye_meet、ch4_end）。
- 孟坦為一般護衛（非 boss 旗標）；兩個 boss 旗標同戰會讓 sim 卡住，之後設計請避免。
- 測試：tests/ch4b_test.js、ch4_test.js 已改成新流程。
- 待做（批次2b）：三個村莊、兩個洞穴、四個支線（附導航資訊）、新兵書《孫子》。

## v0.55.0 第四章批次2b（村莊、洞穴、支線、《孫子》）
- tools/build_ch4.py：新增 VILLAGES（zhongmu 中牟村、gepo 葛陂村、liyang 黎陽渡村；模板 'V'：小屋、雜貨店、大客棧三扇門）與 CAVES4（cave8 黃河洞窟 眭固、cave9 葛陂洞 劉辟），用固定做法放置，不動亂數，原本六城地圖不變；洞穴由 build_world.py 的洞穴產生程式產生，輸出到 data/ch4caves.js。
- data/ch4c.js：頭目 suigu／liupi、每層守將 gen_cave8(_2,_3)／gen_cave9(_2,_3)、洞穴對話、村莊房屋與村民（spotNear 自動找空地放人）、支線 q13–q16（官渡押運官討伐張白騎、曹府主簿取孫子注竹簡、汝南亭長討伐黃邵、白馬倉曹取軍糧帳冊）、兵書 sun（B.skills.sun_gui）。
- 支線導航沿用 scenes.js 的 sideQuestGuide（以 gen_caveN_x 與 chest.map 推出目的地地圖），給任務座標是 spotNear／freeSpot 算出來的，不要手改。
- 測試：tests/ch4c_test.js（18 項）。模擬：cave8boss Lv62 約 87%、cave9boss Lv62 約 100%（Lv58 約 30–36%），屬選擇性高難度內容。
- 待做：第五章（官渡之戰、烏巢火攻）；第四章敵將偵察資料可再補。
