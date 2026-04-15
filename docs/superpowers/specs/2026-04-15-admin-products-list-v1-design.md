# Admin Products List V1（Shopify 風格：搜尋＋篩選）

## 目標

在 `/admin/products` 提供 Shopify 風格的 Products 列表（V1）：

- 頂部有搜尋框＋篩選（category / series / sale only）
- Table 有左邊選取框（先做視覺一致，未做批量操作）
- 點擊商品行可進入現有編輯流程（沿用現有 ProductManager 邏輯）
- 因產品數量少於 50，V1 以「一次拉全量 + 前端即時 filter」為主，體感最快

## 非目標

- 不做分頁、排序（下一版再加）
- 不做批量操作（先保留選取框 UI）
- 不重做產品資料表結構

## 頁面位置

- `/admin/products`

## UI 結構

### 1) Filter Bar

- 搜尋框：依 `name`（產品名）filter
- 篩選：
  - category（分類）
  - series（系列）
  - saleOnly（只顯示有 `sale_price` 的商品）
- Clear：一鍵清除搜尋與篩選
- Reload：重新拉取產品列表（方便新增/修改後刷新）

### 2) Table 欄位（由左至右）

- 選取框（暫不提供 bulk actions）
- 商品：縮圖 + 名稱
- 狀態：用 `is_deleted` 映射為「啟用 / 停用」
- 庫存：`stock_quantity`
- 類別：`category`
- 系列：`series`
- 價錢：`price`；若有 `sale_price` 同時顯示（sale 以紅色）

### 3) 狀態顯示

- Loading：skeleton rows
- Empty：顯示「沒有符合條件的商品」
- Error：顯示 toast + 可重試

## 資料策略

### Fetch（初次進入）

- 一次性從 Supabase 拉取所有 products（排除 `is_deleted` 或保留視業務需求）
- 由前端完成搜尋/篩選

### 欄位選擇

優先只取列表需要欄位：

- id, name, price, sale_price, images, stock_quantity, category, series, updated_at, is_deleted

## 整合策略（復用既有功能）

- 現有 `ProductManager` 內含新增/編輯/刪除/上傳等邏輯
- V1 只重構列表呈現與 filter 狀態管理，盡量不改動底層 CRUD 流程

## 驗收

- `/admin/products`：顯示 Shopify 風格列表
- 搜尋：輸入產品名可即時過濾
- 篩選：category/series/saleOnly 可即時過濾，Clear 可重置
- 點擊行：仍可進入原本的編輯流程並保存

