import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">隱私政策</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center mb-6">
          <ShieldCheck className="w-8 h-8 mr-3 text-blue-900" />
          <h2 className="text-xl font-bold text-gray-900">個人資料保護聲明</h2>
        </div>
        
        <div className="text-gray-700 space-y-6">
          <div className="bg-gray-50 p-6 rounded-md border border-gray-100 text-center text-gray-500">
             <p>隱私政策內容更新中...</p>
             <p className="text-sm mt-2">我們正在編寫詳細的隱私政策條款，以確保您的權益。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
