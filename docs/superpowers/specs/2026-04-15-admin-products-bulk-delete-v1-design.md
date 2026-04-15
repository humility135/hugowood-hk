# Admin Products Bulk Delete V1（只刪本頁已選）

## 目標

在 `/admin/products` 提供 Shopify 風格的批量刪除（永久 delete），並保持安全：

- 只影響「當前頁面」已勾選的產品
- 有明確提示選中數量
- 有二次確認避免誤刪

## 行為

- Table header checkbox 支援「全選本頁」
- 當 `selectedProductIds.size > 0` 顯示 Bulk bar：
  - 顯示：已選 X 件
  - 操作：批量刪除（danger）
- 點擊批量刪除：
  - 第一次 confirm：`確定要永久刪除 X 件嗎？`
  - 第二次 confirm：要求輸入 `DELETE`（或再次 confirm）
- 成功後：
  - 清空選取
  - 重新拉取當前頁資料

## 範圍

- 僅刪除當前頁（pageSize=20）中已選的產品
- 不支持「跨頁刪除」或「刪除所有篩選結果」

## Supabase 操作

- `delete from products where id in (...)`
- 如有 variants：依資料庫 FK 設計處理（若需 cascade，後續補；V1 可先只刪 products）

## 驗收

- 可勾選多個產品
- 可一鍵全選本頁
- Bulk bar 正確顯示數量
- 批量刪除會做二次確認
- 成功後列表更新且選取清空

