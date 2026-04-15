
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useSiteStore } from '../lib/store';

// Define the admin email
const ADMIN_EMAIL = 'humility135@gmail.com';

const Navbar = () => {
  const navigate = useNavigate();
  const { globalSettings } = useSiteStore();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileClothingOpen, setIsMobileClothingOpen] = useState(false);
  const cartCount = useCartStore((state) => state.totalItems());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [categoryList, setCategoryList] = useState<string[]>([]);
  
  // Check if current user is admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .eq('is_deleted', false);
        
        if (error) throw error;
        
        const uniqueCategories = Array.from(new Set(
          data
            ?.map(p => p.category)
            .filter((s): s is string => !!s)
        ));
        
        // Merge with defaults to match Admin options
        const defaults = ['衛衣', '上衣', '外套', '褲子', '飾品'];
        const merged = Array.from(new Set([...defaults, ...uniqueCategories]))
          .filter(cat => cat !== 'hoodie') // Filter out 'hoodie'
          .sort();
        
        setCategoryList(merged);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();

    return () => subscription.unsubscribe();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
        setIsDropdownOpen(false);
    }, 100);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* Announcement Bar */}
      {globalSettings?.announcement?.isVisible && (
        <div className="bg-black text-white text-center py-2 px-4 text-xs font-medium tracking-wide">
          {globalSettings.announcement.link ? (
            <Link to={globalSettings.announcement.link} className="hover:underline">
              {globalSettings.announcement.text}
            </Link>
          ) : (
            <span>{globalSettings.announcement.text}</span>
          )}
        </div>
      )}
      
      <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pt-4 pb-2">
            {/* Logo Centered Top */}
            <div className="flex-shrink-0 flex items-center mb-4">
              <Link to="/">
                {globalSettings?.siteIdentity?.logoUrl ? (
                   <img 
                      src={globalSettings.siteIdentity.logoUrl} 
                      alt={globalSettings.siteIdentity.siteName} 
                      className="object-contain"
                      style={{ height: `${globalSettings?.siteIdentity?.logoSize || 80}px` }}
                   />
                ) : (
                   <span className="text-3xl font-black text-blue-900 tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                     {globalSettings?.siteIdentity?.siteName || "HUGOWOOD"}
                   </span>
                )}
              </Link>
            </div>

            <div className="flex justify-between w-full relative items-center">
                <div className="flex items-center">
                    {/* Mobile menu button - Left */}
                    <div className="flex items-center sm:hidden mr-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Desktop Navigation - Centered Horizontal */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-2 lg:space-x-8 whitespace-nowrap overflow-x-auto no-scrollbar">
                    <Link
                        to="/"
                        className="text-gray-900 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap"
                    >
                        首頁
                    </Link>

                    <Link
                        to="/products?sort=newest"
                        className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center whitespace-nowrap"
                    >
                        NEW ARRIVAL
                    </Link>

                    <Link
                        to="/products?filter=sale"
                        className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center whitespace-nowrap"
                    >
                        SALE
                    </Link>
                    
                    {/* Dropdown Menu */}
                    <div 
                        className="relative flex items-center"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        ref={dropdownRef}
                    >
                        <button
                            className="text-gray-900 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center outline-none whitespace-nowrap"
                            onClick={() => {
                                // Toggle dropdown on click instead of navigating
                                if (isDropdownOpen) {
                                    setIsDropdownOpen(false);
                                } else {
                                    setIsDropdownOpen(true);
                                }
                            }}
                        >
                            服飾
                            <ChevronDown className="ml-1 h-4 w-4" />
                        </button>
                        
                        {isDropdownOpen && (
                            <div 
                                className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Link
                                    to="/products"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500 font-bold border-b border-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    全部商品
                                </Link>
                                {categoryList.map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/products?category=${encodeURIComponent(cat)}`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500 capitalize"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        to="/about"
                        className="text-gray-900 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap"
                    >
                        關於我們
                    </Link>

                    {isAdmin && (
                        <Link
                        to="/admin"
                        className="text-gray-900 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap"
                        >
                        後台管理
                        </Link>
                    )}
                    </div>
                </div>
          
                <div className="flex items-center">
                    <div className="hidden sm:flex sm:items-center space-x-4">
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-500 rounded-full">
                            {cartCount}
                            </span>
                        )}
                        </Link>
                        
                        {user ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/orders" className="text-sm text-gray-700 hover:text-orange-600 font-medium">
                            我的訂單
                            </Link>
                            <span className="text-sm text-gray-300">|</span>
                            <span className="text-sm text-gray-700">Hi, {user.user_metadata?.name || user.email?.split('@')[0]}</span>
                            <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                            title="登出"
                            >
                            <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                        ) : (
                        <Link
                            to="/login"
                            className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors"
                        >
                            <User className="h-5 w-5" />
                            <span className="text-sm font-medium">登入</span>
                        </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
              onClick={() => setIsMenuOpen(false)}
            >
              首頁
            </Link>
            <Link
              to="/products?sort=newest"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-gray-50 hover:border-red-500 hover:text-red-700"
              onClick={() => setIsMenuOpen(false)}
            >
              NEW ARRIVAL
            </Link>
            <Link
              to="/products?filter=sale"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-gray-50 hover:border-red-500 hover:text-red-700"
              onClick={() => setIsMenuOpen(false)}
            >
              SALE
            </Link>
            <div>
              <button
                onClick={() => setIsMobileClothingOpen(!isMobileClothingOpen)}
                className="w-full flex justify-between items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
              >
                服飾
                {isMobileClothingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {isMobileClothingOpen && (
                <div className="bg-gray-50">
                  <Link
                    to="/products"
                    className="block pl-8 pr-4 py-2 text-sm text-gray-600 hover:text-orange-700 border-l-4 border-transparent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    全部商品
                  </Link>
                  {categoryList.map((cat) => (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className="block pl-8 pr-4 py-2 text-sm text-gray-600 hover:text-orange-700 capitalize border-l-4 border-transparent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/about"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
              onClick={() => setIsMenuOpen(false)}
            >
              關於我們
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
                onClick={() => setIsMenuOpen(false)}
              >
                後台管理
              </Link>
            )}
            {user && (
              <Link
                to="/orders"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
                onClick={() => setIsMenuOpen(false)}
              >
                我的訂單
              </Link>
            )}
            <Link
              to="/cart"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
              onClick={() => setIsMenuOpen(false)}
            >
              購物車 ({cartCount})
            </Link>
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-gray-50 hover:border-red-500"
              >
                登出
              </button>
            ) : (
              <Link
                to="/login"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-700"
                onClick={() => setIsMenuOpen(false)}
              >
                登入
              </Link>
            )}
          </div>
        </div>
      )}
      </nav>
    </>
  );
};

export default Navbar;
