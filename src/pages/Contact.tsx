import React from 'react';
import { Mail, MessageCircle, CreditCard } from 'lucide-react';

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">聯絡我們</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-blue-900" />
            客戶服務
          </h2>
          <p className="text-gray-600 mb-6">
            如有任何疑問或需要協助，歡迎透過以下方式聯繫我們。我們的客服團隊將盡快為您服務。
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="w-5 h-5 mr-3 text-gray-400 mt-1" />
              <div>
                <span className="block font-medium text-gray-900">電郵地址</span>
                <a href="mailto:info@hugowood.com" className="text-blue-600 hover:underline">info@hugowood.com</a>
              </div>
            </div>
            
            <div className="flex items-start">
              <MessageCircle className="w-5 h-5 mr-3 text-gray-400 mt-1" />
              <div>
                <span className="block font-medium text-gray-900">線上客服</span>
                <p className="text-gray-600">週一至週五: 10:00 - 19:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
