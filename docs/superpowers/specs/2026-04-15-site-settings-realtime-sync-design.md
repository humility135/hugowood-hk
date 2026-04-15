# Site Settings Realtime Sync（P0 穩定性：多裝置同步）

## 背景 / 問題

現時「Logo / 網頁設計」設定曾經存喺瀏覽器 LocalStorage，導致：

- A 裝置改咗 Logo，B 裝置（手機）睇唔到
- 用戶感覺「冇同步」

目前已經建立 Supabase `site_settings` 表作為雲端來源，但仍需要「自動即時同步」能力，令其他裝置無需 refresh 亦可見到更新。

## 目標（成功標準）

- 管理員於後台更新 Logo / 網頁設計後，其他裝置（手機）在 1–3 秒內自動更新畫面（無需手動 refresh）。
- 任何裝置首次進站會自動由 Supabase 讀取 `site_settings/global`，不依賴本機 LocalStorage。
- 寫入權限維持：只有已登入且 email = `humility135@gmail.com` 先可寫入；其他人只讀。
- 後台顯示「最後同步時間」以便快速 debug。

## 非目標

- 不處理自訂 domain / CDN 圖片最佳化。
- 不改動產品/訂單資料流程。

## 資料模型

### Supabase table

- `public.site_settings`
  - `id text primary key`（固定用 `global`）
  - `settings jsonb`：
    - `globalSettings`（包含 siteIdentity / announcement / footer）
    - `sections`（首頁 sections，含 hero slides）
  - `updated_at timestamptz`

### RLS

- `SELECT`：所有人可讀
- `INSERT/UPDATE/DELETE`：只限 authenticated 且 `(auth.jwt() ->> 'email') = 'humility135@gmail.com'`

## 系統行為設計

### 1) 初次載入（Hydrate）

- App/Layot mount 時：
  - 呼叫 `hydrateFromRemote()`：
    - `select site_settings where id='global'`
    - 若有資料 → 更新 Zustand store
    - 若無資料/出錯 → fallback 到 DEFAULT 設定

### 2) 後台更新（Save）

- 當管理員在後台改 `updateGlobalSettings / updateSection`：
  - 透過 debounce（約 600ms）做 `upsert site_settings(id='global')`
  - 非管理員（無 session / email 唔係管理員）只更新本地畫面，不會寫入遠端

### 3) Realtime 同步（訂閱更新）

- Layout mount 後建立 Supabase Realtime 訂閱：
  - 監聽 `site_settings` table 上，`id='global'` 的 `UPDATE` 事件
- 收到更新事件後：
  - 再次呼叫 `hydrateFromRemote()` 拉最新 settings
  - 更新 Zustand store，令前台畫面自動更新
- Layout unmount 時：
  - unsubscribe，避免 memory leak / 重複訂閱

## UI 變更

- 後台「網頁設計」頁面顯示：
  - 最後同步時間（來源：`site_settings.updated_at`）
  - （可選）顯示「同步中… / 已同步」狀態

## 需要改動的檔案（預計）

- [store.ts](file:///workspace/src/lib/store.ts)
  - 新增：`hydrateFromRemote`、realtime subscribe helper、儲存 debounce、記錄 `lastSyncedAt`
  - 調整：移除/降低 LocalStorage 依賴（避免多裝置不一致）
- [Layout.tsx](file:///workspace/src/components/Layout.tsx)
  - mount 時 hydrate + 訂閱；unmount 時 unsubscribe
- [Admin.tsx](file:///workspace/src/pages/Admin.tsx)
  - 顯示 lastSyncedAt（可選）

## 測試方案

- **同步測試**：電腦（管理員）改 Logo → 手機同一時間開住首頁 → 1–3 秒內自動更新
- **權限測試**：未登入用戶嘗試改後台（應該無法進 admin；就算改 store 都唔會寫入）
- **回退測試**：Supabase 暫時失效（斷網）→ 網站仍可用 default 設定載入

## 風險與緩解

- Realtime 訂閱重複建立：確保 Layout 層只建立一次、並在 unmount 時清理
- 過度寫入：debounce + 只對 admin 寫入

