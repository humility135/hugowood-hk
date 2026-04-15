# Admin Products List V2（分頁＋排序）

## 目標

在 `/admin/products` 的 Shopify 風格列表上加入：

- 簡單分頁（每頁 20，上一頁/下一頁）
- 預設排序：`updated_at` 由新到舊
- 可選排序：created_at、價錢、庫存

## 分頁

- 每頁：20
- 控制：Prev / Next
- 顯示：第 X 頁、總件數

## 排序

- 選單選項：
  - 最新更新（updated_at desc）— 預設
  - 最新新增（created_at desc）
  - 價錢（price asc）
  - 庫存（stock_quantity asc）

## 資料策略（Server-side）

因為有排序與分頁，改用 server-side query：

- `select(..., { count: 'exact' })` 同時取頁面資料 + total count
- `.range(from, to)` 做分頁
- `.order(field, { ascending })` 做排序
- filter 同步套用：
  - is_deleted（如要顯示停用亦可；V2 維持現狀）
  - name/series/category 搜尋（用 ilike）
  - category / series dropdown filter
  - saleOnly（sale_price is not null）

## 行為

- 任一搜尋/篩選/排序變更：自動跳回第 1 頁
- Clear：重置搜尋/篩選/排序，跳回第 1 頁

## 驗收

- `/admin/products` 能翻頁、顯示頁數與總數
- 預設按 updated_at desc
- 切換排序後列表有變化且可翻頁

