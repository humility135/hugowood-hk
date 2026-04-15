
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSiteStore } from '../lib/store';

const Layout = () => {
  const hydrateFromRemote = useSiteStore((s) => s.hydrateFromRemote);

  useEffect(() => {
    hydrateFromRemote();
  }, [hydrateFromRemote]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
