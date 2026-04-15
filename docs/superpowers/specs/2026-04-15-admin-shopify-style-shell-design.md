# Admin Shopify-style Shell（P0-D 後台骨架）

## 目標

把現有 `/admin` 後台改造成 Shopify 風格的「統一骨架」：

- 左側固定導航（Dashboard / Products / Orders / 網頁設計 / Settings）
- 右側內容區 + Topbar（標題 + 搜尋位）
- 各頁共用一致的版面與狀態（loading/empty/error）
- 先以 UI/架構為主，功能沿用現有實作；之後逐頁補齊 Shopify 級功能

## 非目標

- 不在此階段重做資料庫結構、支付、運費、折扣等業務邏輯
- 不在此階段引入 RBAC（先沿用現有 email guard；下一階段再升級）

## 路由與資訊架構

後台入口保持：

- `/admin` → Dashboard

新增內部分頁：

- `/admin/products`
- `/admin/orders`
- `/admin/site`（網頁設計）
- `/admin/settings`

## Layout 設計

### AdminLayout

- 左側 Sidebar：
  - Logo / 店名
  - 5 個 menu item（對應 routes）
  - Logout（可放底部）
- 右側 Main：
  - Topbar（頁標題 + 搜尋框 placeholder）
  - Content area（渲染 nested route）

### 共用 UI 元件（先做骨架）

- `AdminSidebar`
- `AdminTopbar`
- `AdminPage`（統一 padding / max width / page title）

（DataTable / FilterBar / BulkActions 先留接口，下一階段再逐頁落地）

## 舊功能搬遷策略

現有 `Admin.tsx` 以 tab 切換方式組合多個管理功能。改造後：

- `Admin.tsx` 變成路由入口 + guard
- 既有管理器元件（例如 ProductManager / OrderManager / SiteBuilder）不改核心邏輯，直接搬到對應 route component
- 如有 shared toast/notification，保留現有 `showToast` 方式，改由 layout 提供

## 權限

短期（P0）：

- 沿用現有管理員 email guard（`humility135@gmail.com`）
- 所有 `/admin/*` 路由都受 guard 保護

下一階段（P1）：

- 升級到 `admin_users` / RBAC（Admin/Staff）

## 測試驗收

- 進入 `/admin`：顯示新後台骨架（左側導航 + 右側內容）
- 點擊 sidebar 項目：可以切換到對應頁面
- 原有功能仍可用（商品管理、訂單管理、網頁設計）
- 未登入或非管理員：無法進入 `/admin/*`

