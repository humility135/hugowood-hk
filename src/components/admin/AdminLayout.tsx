import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Layout, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  onLogout: () => void;
  children: React.ReactNode;
};

const itemBase =
  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors';

const SIDEBAR_COLLAPSED_KEY = 'adminSidebarCollapsed';

type SidebarProps = {
  collapsed: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
  mobile: boolean;
};

const Sidebar = ({ collapsed, onLogout, onNavigate, onClose, mobile }: SidebarProps) => {
  const linkClass = (isActive: boolean) =>
    `${itemBase} ${
      collapsed && !mobile ? 'sm:justify-center sm:px-2' : ''
    } ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`;

  const labelClass = collapsed && !mobile ? 'sm:hidden' : '';

  return (
    <aside
      className={`bg-white border-r border-gray-200 min-h-screen flex flex-col ${
        mobile ? 'w-64' : collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`border-b border-gray-100 ${collapsed && !mobile ? 'px-3 py-5' : 'px-4 py-5'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              className={`text-lg font-black tracking-widest ${collapsed && !mobile ? 'sm:hidden' : ''}`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              HUGOWOOD
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${collapsed && !mobile ? 'sm:hidden' : ''}`}>Admin</div>
            <div className={`text-lg font-black tracking-widest hidden ${collapsed && !mobile ? 'sm:block' : ''}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
              H
            </div>
          </div>

          {mobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        <NavLink
          to="/admin"
          end
          title="Dashboard"
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive)}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className={labelClass}>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          title="Products"
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive)}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span className={labelClass}>Products</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          title="Orders"
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive)}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span className={labelClass}>Orders</span>
        </NavLink>
        <NavLink
          to="/admin/site"
          title="網頁設計"
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive)}
        >
          <Layout className="w-4 h-4 shrink-0" />
          <span className={labelClass}>網頁設計</span>
        </NavLink>
        <NavLink
          to="/admin/settings"
          title="Settings"
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive)}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className={labelClass}>Settings</span>
        </NavLink>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors ${
            collapsed && !mobile ? 'sm:justify-center sm:px-2' : 'justify-center'
          }`}
          title="登出"
        >
          <LogOut className="w-4 h-4" />
          <span className={labelClass}>登出</span>
        </button>
      </div>
    </aside>
  );
};

const AdminLayout = ({ title, onLogout, children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const value = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      setCollapsed(value === 'true');
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
    }
  }, [collapsed]);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setMobileOpen((v) => !v);
      return;
    }
    setCollapsed((v) => !v);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sm:hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            collapsed={false}
            mobile
            onLogout={onLogout}
            onClose={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </div>

      <div className="flex">
        <div className="hidden sm:block sticky top-0 h-screen">
          <Sidebar collapsed={collapsed} mobile={false} onLogout={onLogout} />
        </div>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <span className="sm:hidden">
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </span>
                  <span className="hidden sm:inline">
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </span>
                </button>
                <div className="text-lg font-bold text-gray-900 truncate">{title}</div>
              </div>
              <div className="hidden md:block w-80 max-w-full">
                <input
                  type="search"
                  placeholder="搜尋（稍後加入功能）"
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-black focus:ring-black"
                />
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
