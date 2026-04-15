import React from 'react';
import { Truck, Package, Clock } from 'lucide-react';

const Delivery = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">配送及運送</h1>
      
      <div className="space-y-8">
        {/* Delivery Time */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 mr-3 text-blue-900" />
            <h2 className="text-xl font-bold text-gray-900">發貨時間</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            確認付款後，我們將在 <span className="font-bold">7 個工作天內</span> 寄出訂單（除非另有說明）。
            <br />
            一旦您的訂單發貨，您將收到一封包含追蹤號碼的確認電子郵件。
          </p>
        </div>

        {/* Shipping Fee */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-4">
            <Truck className="w-6 h-6 mr-3 text-blue-900" />
            <h2 className="text-xl font-bold text-gray-900">運費說明</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            購物滿指定金額（HK$500）即可享有免費標準配送服務。未滿指定金額的訂單將收取固定運費。
          </p>
        </div>

        {/* Local Delivery Options */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-4">
            <Package className="w-6 h-6 mr-3 text-blue-900" />
            <h2 className="text-xl font-bold text-gray-900">本地配送選項</h2>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-900 pl-4">
              <h3 className="font-bold text-lg mb-1">選項 1 : 送貨上門</h3>
              <p className="text-gray-600">
                直接送達您指定的住宅或工商地址。
              </p>
            </div>
            
            <div className="border-l-4 border-blue-900 pl-4">
              <h3 className="font-bold text-lg mb-1">選項 2 : 順豐網點自取</h3>
              <p className="text-gray-600">
                您可以在結帳時選擇附近的順豐智能櫃或順豐站取件，方便快捷。
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            * 如有任何疑問，請通過電子郵件 info@hugowood.com 聯繫我們。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
