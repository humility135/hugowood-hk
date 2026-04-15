
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import Delivery from './pages/Delivery';
import ServicePolicy from './pages/ServicePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import { supabaseConfigured } from './lib/supabase';

function App() {
  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-xl font-bold text-gray-900">需要設定 Supabase</div>
          <div className="mt-2 text-sm text-gray-700">
            目前缺少環境變數 <span className="font-mono">VITE_SUPABASE_URL</span> 同{' '}
            <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>，所以網站暫時無法連接資料庫。
          </div>
          <div className="mt-4 text-sm text-gray-700">
            請建立 <span className="font-mono">/workspace/.env</span>，內容例如：
          </div>
          <pre className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
          </pre>
          <div className="mt-4 text-sm text-gray-700">儲存後重啟 dev server（停止再重新執行 npm run dev）。</div>
        </div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="admin/*" element={<Admin />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="service-policy" element={<ServicePolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-conditions" element={<TermsConditions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
