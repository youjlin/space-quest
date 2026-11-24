# 太空任務出發站

青年百億申請用的繁體中文太空教育展示原型，主要對象為國小高年級至國中生。透過「衛星用途 → 任務所需功能 → 任務安排」三關，展示教學構想與目前的前端實作。

目前內容是在申請階段完成的原型，並非已完成海外學習後的成果，也未宣稱完成課程、參訪、研究、實體教學或學習成效驗證。若獲選並完成海外學習，預計依實際所學修訂內容及規劃試玩；詳見 [PROJECT_BRIEF.md](./PROJECT_BRIEF.md)。

本階段停止擴充，保留首頁、任務路線與三關，只修復阻止操作、內容裁切或導覽失效的問題。不新增題庫、模式、資源頁或後端。

## 本機啟動

技術為 Vue 3、TypeScript、Vite。請使用 Node.js 24，既有測試使用 Node.js 原生 TypeScript 載入。Windows PowerShell 使用 `npm.cmd`，不需修改系統執行原則。

第一次取得原始碼時：

```powershell
npm.cmd ci
npm.cmd run dev
```

以終端機實際印出的 Local 網址為準，網站子路徑為 `/space-quest/`，通常是 `http://127.0.0.1:5173/space-quest/`，僅監聽本機。既有依賴已安裝時，直接執行 `npm.cmd run dev` 即可；不需要 .env、API key 或帳號。

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run preview
```

正式建置輸出到 `dist/`，`build` 已包含型別檢查；`preview` 用於本機查看建置成果，實際網址以終端機輸出為準。停止伺服器請在該終端機按 `Ctrl+C`。

## 現有功能

| 畫面 | 原型內容 |
| --- | --- |
| 首頁、任務路線 | SVG 衛星主視覺、三關入口與關卡銜接，各關可自由試玩。 |
| 第一關：這件事，可以請衛星幫忙嗎？ | 六個生活情境，認識觀察地球、傳遞訊息、定位；一次一題，答錯提示重選，答對後手動前進。 |
| 第二關：幫衛星準備出任務 | 五步選擇，認識相機、電力、儲存、通訊與姿態控制；答對時對應功能亮起。 |
| 第三關：執行衛星任務 | 安排充電、拍照、傳送與等待，將海岸及森林照片送回地面；包含教學、照片狀態、短動畫、操作紀錄及成功／失敗回饋。 |

第一、二關完成旗標使用 localStorage 的 `space-quest:progress:v1` 保存，重玩保留曾完成紀錄。儲存不可用時仍可遊玩；不保存答案、重試歷程或個人資料。第三關不保存進行中的回合，重新整理或離開關卡後會開始新的一局。

網站只有前端，無登入、後端、排行榜、分析追蹤或資料提交服務。延伸閱讀資源頁尚未製作；畫面中的「內容準備中」不代表已有可用資源頁。

## 第三關規則與教學模型限制

- 共8次行動，初始電量50、上限100，衛星最多存2張照片。
- 充電增加30電量，拍照消耗20，傳回1張照片消耗15。
- 第3、4、7、8回合地面站可接收；每回合均假設有日照與拍攝機會。
- 第一次拍海岸、第二次拍森林，不需要另選目標；後續交替拍攝，每張有獨立ID。重複區域不增加兩個目標的完成數。
- 兩個區域皆送達且衛星內照片全部傳回才成功。額外拍下的照片也必須傳回。
- 有效操作使用1次行動，等待不改變電量與照片；無效操作不消耗行動。最後一次行動先判成功，再判回合耗盡。

這是回合制教學模型，電量與回合數是遊戲設定，並非真實衛星工程數值。將操作分開是為了練習安排資源，真實衛星可能同時執行多項功能。通聯時段是預設情境，未計算真實軌道，也不模擬姿態動力學。

照片、衛星結構、場景移動與訊號路徑均為簡化示意；照片是自行製作的 SVG 插圖，並非真實衛星影像。第二關只介紹部分功能，真實衛星還需要其他系統配合。第一關說明定位與通訊的區別、通訊所需設備及服務，以及影像觀察的限制。

## 維護入口

| 位置 | 用途 |
| --- | --- |
| `src/data/satelliteUses.ts` | 第一關題目、選項、提示、解說與查核來源。 |
| `src/data/satellitePreparation.ts` | 第二關五步內容、完成文案與查核來源。 |
| `src/game/mission.ts` | 第三關參數、照片資料、操作驗證與狀態更新。 |
| `src/game/missionExperience.ts` | 第三關教學、接收倒數與白話回饋。 |
| `src/game/learningProgress.ts`、`src/composables/useLearningProgress.ts` | 第一、二關完成旗標的讀寫與共用狀態。 |
| `src/views/`、`src/components/`、`src/styles/` | 頁面、SVG 圖解與響應式樣式。 |
| `tests/` | Node.js 內建測試，涵蓋三關、儲存降級、照片、動畫鎖與重設。 |

## 驗證範圍

本次原型收斂檢查：56項既有測試、TypeScript檢查及正式建置全部通過。本次僅調整說明文件與忽略規則，未修改頁面、遊戲或導覽程式。

既有測試涵蓋三關作答、重試與連點防護、第一／二關進度保存及儲存失敗降級，以及第三關資源邊界、實際照片移動、等待、最後回合判定、成功／失敗、減少動畫及重設。

先前已透過 Chrome 響應式模式檢查第三關 1366×633、1920×945 的網頁內容區與 390×700 手機模擬，並實際走完成功及失敗流程、資訊面板 Esc 關閉與焦點返回。第二關五步、前往第三關及重新整理後保留完成狀態也已有實際操作紀錄。

尚未完成實體手機、放大文字、其他瀏覽器及完整三關連續操作的全面驗證；未進行目標年齡使用者研究或學習成效評估。程式測試及開發者試玩不等同這些驗證已完成。

## GitHub Pages 部署

指定儲存庫為 [youjlin/space-quest](https://github.com/youjlin/space-quest)，預期網站網址為 https://youjlin.github.io/space-quest/ 。使用者已授權上傳與發布目前展示原型；本節說明部署設定，實際是否發布成功以儲存庫 Actions 與公開網站回應為準。

- `vite.config.ts` 的 `base` 為 `/space-quest/`。圖解與照片主要為元件內 SVG，HTML 的 favicon、入口及產生的 JS／CSS 路徑由 Vite 建置處理。
- 保留 `createWebHashHistory()`，例如 `/space-quest/#/missions/3`，無須後端路由重寫。
- build 腳本使用跨平台的 `npm run typecheck && vite build`；Windows 終端機仍使用 `npm.cmd run build`。
- `.github/workflows/deploy.yml` 在 push 至 main 或手動執行時，於 Ubuntu／Node.js 24 執行 `npm ci`、既有測試、型別檢查及正式建置，再透過官方 Pages Actions 上傳與部署 `dist/`。
- Actions 固定完整提交版本。建置工作只有 `contents: read` 與 Pages 設定讀取權限；部署工作只有 `pages: write` 與 `id-token: write`，使用內建工作流程身分，不需個人存取 token，也不向儲存庫回寫產物。
- `.gitignore` 排除 `node_modules/`、`dist/`、`.env` 系列、本機紀錄、暫存及快取。提交前需核對實際 staged 檔案與敏感資訊。

首次啟用：開啟儲存庫 **Settings → Pages → Build and deployment → Source**，選擇 **GitHub Actions**。若首次工作流程因 Pages 尚未啟用而失敗，完成設定後至 **Actions → Deploy prototype to GitHub Pages**，重新執行該工作流程。

本機查看正式建置時執行 `npm.cmd run preview`，再開啟終端機顯示網址下的 `/space-quest/`；不要直接用檔案總管開啟 `dist/index.html`。公開網站的三關網址依序為 `/space-quest/#/missions/1`、`/space-quest/#/missions/2`、`/space-quest/#/missions/3`。

部署行為依據：[Vite 的 GitHub Pages 指引](https://vite.dev/guide/static-deploy.html#github-pages)、[Vite 公開基底路徑](https://vite.dev/guide/build.html#public-base-path)、[Vue Router hash 模式](https://router.vuejs.org/guide/essentials/history-mode.html#hash-mode)。
