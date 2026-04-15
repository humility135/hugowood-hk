
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

function App() {
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
