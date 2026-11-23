# 穿越三國 諸葛貓妖傳：交接文件（v0.32.0）

給接手的 Claude 或開發者。請先讀完本文件和 README.md，再繼續開發。

## 專案
- NES《吞食天地II 孔明傳》風格的獨立 PC 遊戲。HTML5 Canvas 256x224，Electron 打包，electron-updater 更新。
- 美術全部原創手繪像素風。使用者明確要求：不要 emoji、不要 SVG 感的圖。
- 劇情混合《三國演義》與正史，語氣搞笑與嚴肅交錯。主角是穿越成貓妖軍師的諸葛貓妖。
- 使用者以繁體中文溝通，每個批次打包成 zip 給他試玩並收回饋。

## 已定下的設計決定
- 成長自動隨機，不手動配點。
- 武器分類：劍、刀、矛、槍、扇。
- 地形系統：平地、森林、山、海、沙漠；每個武將都有專屬地形（home），等級 S/A/B/C；兵力條顏色依地形：草地綠、森林深綠、山銅、海藍、沙漠淡黃。英雄與 Boss 皆為 S。
- 助戰角色劇情結束就離隊。
- Boss 再戰：5% 機率，同名、原始完整能力。
- 第一章最終戰：張角、張寶、張梁同時出戰。
- 每章有獨立大地圖（第一章北方、第二章關東），含劇情洞穴與村莊；章間靠渡口（船）或關口通過。
- 關口可進入，內部有自創門樓與守將；山口是三層爬山地圖（山峰、山徑、岩坡、石階、深谷吊橋、巨石）。
- 海岸沙地遇敵為水軍。
- 遊戲內不得出現「測試戰鬥／測試版」字樣。

## 程式結構
- index.html 依序載入 data/*.js、src/*.js（classic script，沒有 bundler），資料放在 window.DATA。
- src/scenes.js（場景、大地圖、對話、warp）、src/battle_logic.js、src/battle_scene.js、src/main.js。
- data/：maps.js、world.js（由工具產生）、characters.js、ch2c.js（虎牢關、洛陽）、ch2d.js（船、關口、洞穴五）、passes.js（關口與山口的 runtime 建構）、terrain.js、houses.js。
- tools/：build_world.py（產生兩張大地圖、洞穴、渡口；patch_gates.py 讀其常數）、build_assets.py（tiles.png，52 格，每格 16px）、build_portrait_guest.py（portraits.png，57 格）、build_battle_bg.py。
- 版本號必須同步：package.json、package-lock.json（第 3、9 行）、src/version.js、update.json；tests/update_test.js 會檢查。
- 測試：在專案根目錄執行 `timeout N node tests/X_test.js`（Playwright）。目前全部通過：play、story、battle、formation、equip、houses、world、yingchuan、ch2c、ch2d、terrain、update、passes。較重的測試放背景跑；平行跑有時不穩，單獨重跑即可。
- 發布流程：測試、zip 打包、推送 GitHub。我的環境建 GitHub Release 會 403，使用者要自己到 GitHub 手動發布。

## 劇情進度
### 第一章 黃巾之亂（184）
1. 涿縣桃園結義，程遠志（黃巾營寨）。
2. 廣宗之前的廣陽：黃巾渠帥，鄒靖離隊，三人專屬武器覺醒。
3. 潁川、長社：波才，曹操首度加入。
4. 汝南：彭脫，掉落水澤符。
5. 宛城：趙弘、韓忠與孫夏，孫堅登場。
6. 東郡倉亭：卜巳，曹操離隊。
7. 冀州廣宗：張梁，得人公黃巾。
8. 下曲陽張寶（地公羽扇）、鉅鹿張角，三兄弟同時最終戰。結尾劉備授安喜縣尉。
另有四個洞穴、三十多間可進入的房子與機關密室，藏專屬護符。

### 第二章 群雄逐鹿
- （一）安喜督郵事件，劉備棄官；太行山道張燕（飛燕刀）；幽北張純與烏桓，劉備授平原令；平原簡雍與傳令兵檄文，之後坐船（300 金）或打關口到關東；回程 200 金。
- （二）酸棗會盟（袁紹、曹操再入隊、孫堅、公孫瓚）；汜水關華雄（西涼長戟，3500 金）。
- （三）虎牢關呂布（三英戰呂布，方天畫戟與赤兔馬，4500 金）；洛陽徐榮，傳國玉璽線索，曹操離隊，3000 金。第二章在此結束。
- 其他：洞穴五（隱藏蟬玉）、各關口與山口的守將、水軍。

## 待辦
- 關口守將依劇情階段更換：已做到兩個階段（官軍關尉、守將），可再細分。
- 平衡：已用 tools/sim_ch2.js 模擬第二章 Boss、水軍與關口山口 Boss（呂布約 30000 HP，約 64 級可穩定取勝；模擬不含裝備，實際較容易）。
- 第一、二章的所有城鎮與野外村落房子已補齊（v0.30.4）。
- 第三章：需獨立大地圖、洞穴與村莊、章間渡河。
- 使用者要手動發布 GitHub Releases（發最新版 v0.32.0 即可）。

## 下一步（接手者請照這個順序做）
目前進度：第一、二章完成；第一、二章所有城鎮房子已補齊；Boss 平衡已模擬調整；藥品、復活、軍師專屬計謀、分店與賣出、分頁角色資料、陣形（含八卦陣）、第二批計謀已加入（詳見 docs/REPORT_v0.32.0.md）。
1. 先跑一遍全部測試，確認目前版本（v0.32.0）是綠的。
2. 開發第三章：獨立大地圖、洞穴與村莊、章間渡河（或關口），沿用 tools/build_world.py 的流程；先給使用者看劇情大綱與地圖規劃，再分批做。
3. 第三章的房子、Boss 平衡模擬（tools/sim_ch2.js 可改成 sim_ch3）也要一起補。
4. 每完成一批：更新版本號（四處同步）、更新 update.json 與 README、跑測試、打包 zip、推送，並請使用者試玩給回饋。
使用者若在對話裡指定了別的下一步，以使用者的指示為準。

## 補充設定（務必遵守）
- 主角諸葛貓妖是**男生**。台詞、稱呼、簡介一律用男性稱呼，不可用姑娘、小妹、貓妹、姊姊等。
- 遊戲內所有文字都當正式遊戲，不可出現「測試」「製作中」之類字樣。

## 道具、復活與計謀系統（v0.31.0）
- 藥品三階與復活藥在 data/battle.js 的 items；藥鋪商店與寶箱追加藥品在 data/supplies.js（最後載入）。
- 計謀：kind 有 phys、tact、heal、buff、debuff、confuse、revive（target 'deadAlly'）、tpgive。buff／debuff 的 stat 可用 atk、def、spd。
- 復活術學習者：諸葛貓妖（智力路線 10 級、武力路線 18 級）、曹操 16 級、盧植 10 級（20 級起死回生）。
- 軍師專屬計謀：data/battle.js 的 advisorSkills；只有被指定為軍師的角色才有，id 以 adv_ 開頭，戰鬥選單以「軍・」標示。
- 全體攻擊（自動戰鬥）時 BattleScene.update 的 dt 乘 2.3，所以動畫與等待整體加快。
- 測試：tests/supplies_test.js（不開瀏覽器，直接測 BattleLogic）。

## 店鋪、陣形與第二批計謀（v0.32.0）
- 店鋪：data/shops.js（最後載入之一）。makeShop(地圖, 類型, 階級, 店名, 掌櫃, 精靈, 戶外NPC名) 把一間屋子或街上 NPC 變成武器／防具／雜貨店；**不要把有任務或寶箱的屋子拿來當店**（長社老學究書房、宛城工匠帳曾因此壞掉）。
- 陣形：data/formations.js；BL.formationUsable / BL.applyFormation；Game.formation 會存檔；選單「陣形」。八卦陣 only:'nyao'，貓妖 45 級。
- 新計謀 kind：dot（毒）、hot（持續回復）、cleanse、stun、taunt；phys 可帶 leech、lowBonus；tact 可帶 rider；buff 可帶 extra。回合結束由 BL.statusEvents 結算毒與回復。
- 測試：tests/skills2_test.js、tests/formations_test.js（機制）；舊的 tests/formation_test.js 是隊伍編成。

## 特效與音樂（v0.33.0）
- 特效：src/battle_scene.js 的 drawFx 依 fx 名稱各畫專屬像素動畫（rock、thunder、water、smoke、arrowrain、trap、crack、roar、dizzy、banner、rage、wind、bagua、up_r/b/g、whirl、flurry、execute、bloodslash、dragon、cross、multithrust、mist、confuse、cage、orb、purify、leaf、revive、bloom、paw 等）。新增計謀時在 data/battle.js 指定 fx，並在 playEvent 的 dur 表補持續時間。skill.fxLevel 可強制火焰等級。
- 音樂：src/audio.js（window.Audio2），WebAudio 即時合成，曲目是 TRACKS 裡的音符記譜（每首 8 小節 128 格）。場景→曲目由 decide() 每 200ms 判斷：標題 title、城鎮／房屋 village、world* 大地圖 world、cave* 洞穴 cave、一般戰鬥 battle、boss 戰 boss、勝利 victory、戰敗 defeat。M 鍵靜音（存於 localStorage）。計謀音效 Audio2.sfx(fx名)，FXMAP/SFX 表對應。
- 測試：tests/audio_test.js。新增曲目要讓每個聲部長度一致（128 格）。

## 畫面縮放與選單翻頁（v0.34.0）
- Engine.resize 依視窗取小數倍率（不再整數倍）；F 鍵全螢幕。
- 戰鬥計謀／道具選單：每頁 6 項（兩欄×3），左右鍵換欄或翻頁，上下鍵逐項（跨頁）。測試：tests/paging_test.js。

## 站位、兵力條、守關將領、升級曲線（v0.35.0）
- 陣形 rows：data/formations.js 每個陣形 5 個位置各自前/中/後排（0/1/2），只看隊伍第幾位；battle_scene.js ROW_X=[94,68,44] 是三排的 x 座標，單位會滑進站位。效果倍率用 front/mid/back/all。
- 兵力條：BattleScene.barLen 依 hpMax 分級（60/150/400/1000/2500/6000/15000/40000），以全場最小級為最短。
- 守關將領：data/gens.js，24 張洞穴／山口各一名（gen_<地圖id>），兵力約為該區頭目 2～5 成，帶該區小兵。座標由工具算出，可手調。測試 tests/gens_test.js。
- 升級經驗：BL.expFor 增量 = 23 + 10j + 0.9j² + 0.02j³（j=級數-2）。若覺得太難或太易，調這條公式。

## 任務系統與縮地脫出（v0.36.0）
- data/quests.js（在 gens.js 之後載入）：D.mainQuest 主線目標清單（依序，第一個 done 旗標未成立者就是「現在的目標」；to＝D.worldTowns 的城鎮 id，用來算大地圖方向）；D.sideQuests 八個支線（bounty 討伐／fetch 尋物），自動把委託人 NPC（id＝<qid>_giver，alts 依序：完成、可回報、進行中）、對話與藏物寶箱加進地圖。
- 獎勵：討伐給專屬裝備（q_ 開頭，data 裡加進 D.equipment）；尋物給兵書。兵書：act `book`→旗標 book_<id>→BL.skillsFor 全隊加入 D.battle.bookSkills[id]。任務道具 quest:true，不顯示在道具選單。
- 選單：角色資料／隊伍編成／陣形／裝備／道具／計謀／任務／讀取／回標題／關閉（共 10 項）。FieldSkillScene＝縮地脫出（D.fieldSkill，cave*/shankou* 地圖內使用，回 G.flags.lastTown）；QuestScene 有主線、支線兩頁。進入 world2 時設 ch2_arrived 旗標。
- 山口：守將站在山腳往前 warp 的唯一通道格 (10,2)，無法旁繞。大地圖山脈整段封牆「未做」（會把地圖切成兩半），若要做需另行規劃。
- 計謀精簡：移除 regen、cleanse2、rally2、tpgive2、inspire2；BL.skillText 自動產生說明。
- 測試：tests/quests_test.js。

## 章間封鎖（v0.37.0）
- data/chapters.js（在 quests.js 之後）：執行時直接改 D.maps.world 的 tiles，把 x=21（太行）整條、x=60（燕山）y1-28、y=28 往東到海邊補成 'Q' 山牆（已是水或山壁的格子不動）；D.maps.world.chapterZones 兩片第二章區域：太行山以西 x1-20（need sanzhang_down）、燕山以北東 x61+ y1-27（need zhangyan_down）。D.chapterZoneAt(x,y) 查所在區域。
- 山口傳送點加 need/deny/bx/by：(20,23)(22,23) 需 sanzhang_down，(59,13)(61,13) 需 zhangyan_down；對話 pass_sealed1/2。
- 舊存檔：MapScene.loadMap 進 world 時若落點在尚未開放的區域，改送到 lastTown 城外。
- 第二章的區域含：黑山(heishan)、cave2、西關 guan_w、燕山北的幽州(youbei)、平原(pingyuan)、cave3。第一章陸地無法繞進去（tests/chapters_test.js 用 BFS 驗證）。
- 因為是執行時修改，tools/build_world.py 重新產生 world.js 時不必跟著改。

## 地形美化（v0.38.0）
- src/terrain_art.js：TerrainArt.build(map, tileAt) 依水（圖塊 2）的鄰格畫湖岸兩層描邊、圓角、深水、閃光；草地（31）依格座標雜湊畫花叢／草叢；山（20）的兩座山峰各有 40% 機會長青苔。結果存在 map._art（離屏畫布），MapScene.draw 在圖塊層之後整張貼上。不改 tiles.png。

## 高解析地形（v0.39.0）
- tools/build_hd_tiles.py 產生 assets/tiles_hd.png（每格 32px，編號與 tiles.png 相同，只做了 1,2,3,19,20,31,32,33,34,35,45；其餘留空）。TerrainArt.HD_IDS 列出有高清版的編號。MapScene.draw：map.world 為真時用高清圖塊＋TerrainArt.buildHD（32px 疊圖：湖岸三層描邊、浪、圓角／凹角、花叢、草叢、青苔）；城鎮與洞穴仍用 16px 圖塊與 TerrainArt.build。
- Engine：E.K=2，世界畫布是 512x448，每幀 setTransform(K)，所以所有舊的繪圖程式照邏輯座標畫、自動放大兩倍；高清圖塊以 32px 來源畫到 16 邏輯格。
- 要為其他圖塊（城堡、村莊）做高清版，就在 build_hd_tiles.py 加生成函式並把編號加到 HD_IDS。

## 對話存檔：目前進度與下一步（2026-11-23 07:45，換帳號前）
- 已發佈到 v0.39.0（最新 commit 1fef9cf 已推上 GitHub，壓縮檔已傳給使用者；Release 要使用者手動發佈）。
- 使用者最新要求：畫質要像他貼的參考圖那樣高解析、不要太 8-bit。大地圖地形已做（v0.39.0）。使用者說「照著順序做」，順序＝① 城堡（大地圖城鎮圖示）② 村莊房屋與城鎮地面 ③ 角色。
- ① 城堡：現有 tools/build_assets.py 的 castle_big()（48x48，3x3 格，tile 26-30、22、37-39 由 _castle_part 切出）。要做 96x96 的高清版（光從左上、磚縫、翹角歇山頂、鐵釘城門），輸出進 assets/tiles_hd.png 對應編號（q26 k27 p28 / e37 u38 j39 / l29 C22 r30），並把這些編號加進 TerrainArt.HD_IDS（src/terrain_art.js）。MapScene.draw 目前對城堡格會先鋪 groundFor() 的地面再貼城堡圖塊，高清圖塊同理（透明底）。注意 tools/build_hd_tiles.py 目前是 32px 一格；城堡每格也是 32px，所以只要畫 96x96 再切 9 塊。
- ② 村莊：城鎮與洞穴仍是 16px 圖塊，Engine 世界畫布已是 2 倍解析（E.K=2），所以只要照同樣方式加 32px 圖塊並讓 MapScene.draw 對城鎮也啟用 hd（目前條件是 this.map.world）。
- ③ 角色：sprites.png 16px；高清化要同步改 drawSprite 與戰鬥 bparty16/benemy16，工作量最大，建議最後做。
- 每批做完照慣例：跑 tests（/tmp/run3.sh 的清單：tests/*_test.js 除 yingchuan，yingchuan 另跑背景約 5 分鐘）、升版本（package.json、package-lock.json 第 3、9 行、src/version.js、update.json）、更新 HANDOFF、推送（/tmp/pushcheck 複製 data src tests tools docs assets 與 index.html package*.json update.json README.md，commit 附署名行，git push origin HEAD:main）、打包 zip 傳給使用者。
- 其他未完成：第三章（大綱還沒給使用者看，使用者尚未回覆）。長期規則見本檔前面各節（主角男性、不用 emoji、無「測試/製作中」字樣等）。

## v0.40.0：高清城堡（已完成）
- tools/build_hd_tiles.py 新增 castle_hd()（96x96，切成 9 格存入 tiles_hd.png：26 27 28 / 37 38 39 / 29 22 30），這些編號已加入 TerrainArt.HD_IDS。下一步：② 村莊房屋與城鎮地面（讓 MapScene.draw 的 hd 條件擴大到城鎮，並替城鎮用到的圖塊做 32px 版），③ 角色。
- 同版（v0.40.0）也完成了 ② 村莊：build_hd_tiles.py 新增 town_grass/floor_planks/stone_wall_interior/roof_tiles/plaster_wall(門)/thatch_roof 與桶、箱、花、圍欄、灌木、草堆、攤位、告示牌、水井（編號 0 4-18）；擺設圖塊是透明底，MapScene.draw 先用 decorGround() 鋪地板（旁邊是 5＝室內木地板就鋪地板，否則草地）。MapScene 的 hd 現在對所有地圖啟用（有 HD 版的編號才用 32px，其餘仍是 16px）。尚未做：③ 角色（sprites.png、戰鬥 bparty16/benemy16、肖像），以及洞穴／山口／關口的專用圖塊（cave*、stairs、cliff 等）。
