import React from 'react';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

const ServicePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center" id="terms">服務條款</h1>
      
      <div className="space-y-8">
        {/* Currency & Payment */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">貨幣與付款</h2>
          <div className="text-gray-700 space-y-4">
            <p>
              <span className="font-bold block mb-1">貨幣</span>
              我們以港幣 (HKD) 顯示價格並處理所有訂單。網站上顯示的其他貨幣價格僅供參考，實際匯率將取決於您的信用卡發卡銀行。
            </p>
            <p>
              <span className="font-bold block mb-1">付款方式</span>
              我們接受 VISA、MASTER、AMERICAN EXPRESS 及 PAYPAL 等多種付款方式。
            </p>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">配送與運送</h2>
          <p className="text-gray-700">
            確認付款後，我們將在 7-14 個工作天內處理並發貨（除非另有說明）。有關最新的標準配送或運費資訊，請參閱配送及運送頁面。
          </p>
        </div>

        {/* Cancel, Return & Refund */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            取消、退貨與退款
          </h2>
          <div className="text-gray-700 space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                訂單確認前
              </h3>
              <p className="text-sm">
                下單時，請仔細檢查每件商品的尺碼表及您提供的資訊。如在確認訂單後發現任何錯誤，請<strong>立即</strong>引用訂單編號聯繫我們。
                一旦訂單發貨，我們將無法更改，亦不對因客戶提供錯誤資訊而造成的損失負責。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">換貨政策</h3>
              <p className="mb-2">
                如需更換任何商品，請在收到貨物後 <strong>7 天內</strong> 先聯繫我們。
                僅接受未使用且保持原始狀態及包裝的商品進行更換。請注意，更換商品可能需要支付額外的運費。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">瑕疵與退款</h3>
              <p>
                如發現收到的商品有瑕疵，請<strong>立即</strong>通知我們。我們將視庫存情況安排更換或退款。
                除商品瑕疵外，我們恕不接受其他原因的退款申請。
              </p>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
              如有任何相關問題，請發送電子郵件至 info@hugowood.com 聯繫我們。
            </p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white rounded-lg shadow-sm p-8" id="privacy">
          <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2" />
            隱私政策
          </h2>
          <div className="text-gray-700 space-y-4 text-sm">
            <p>
              我們致力於保護您的隱私。您提供的任何個人資訊（如地址、電子郵件及客戶識別資料）將不會被披露、分享、出售或提供給任何外部組織或未經授權的第三方。
            </p>
            <p>
              為了尊重和保護您的隱私，收集的任何個人資訊僅用於廣泛的統計分析，不會披露個人詳細資訊。
              所有通過互聯網傳輸的信用卡資訊均採用 SSL (Secure Socket Layer) 加密技術，並在高安全性電腦系統下受保護。交易完成後，信用卡資訊將在固定時間後刪除。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePolicy;
