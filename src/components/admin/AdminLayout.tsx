import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Layout, Settings, LogOut } from 'lucide-react';

type Props = {
  title: string;
  onLogout: () => void;
  children: React.ReactNode;
};

const itemBase =
  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors';

const AdminLayout = ({ title, onLogout, children }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-white min-h-screen sticky top-0">
          <div className="px-4 py-5 border-b border-gray-100">
            <div className="text-lg font-black tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              HUGOWOOD
            </div>
            <div className="text-xs text-gray-500 mt-1">Admin</div>
          </div>

          <nav className="p-3 space-y-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `${itemBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `${itemBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Package className="w-4 h-4" />
              Products
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `${itemBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <ShoppingBag className="w-4 h-4" />
              Orders
            </NavLink>
            <NavLink
              to="/admin/site"
              className={({ isActive }) =>
                `${itemBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Layout className="w-4 h-4" />
              網頁設計
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${itemBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          </nav>

          <div className="p-3 border-t border-gray-100 mt-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="h-16 px-6 flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">{title}</div>
              <div className="w-80 max-w-full">
                <input
                  type="search"
                  placeholder="搜尋（稍後加入功能）"
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-black focus:ring-black"
                />
              </div>
            </div>
          </header>

          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

