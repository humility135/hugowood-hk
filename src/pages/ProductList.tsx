import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, Layers, X, ChevronDown, ChevronUp } from 'lucide-react';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  // Initialize from URL param if present
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [saleOnly, setSaleOnly] = useState<boolean>(searchParams.get('filter') === 'sale');
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for collapsible filter sections
  const [openSections, setOpenSections] = useState({
    sort: true,
    category: true,
    series: true
  });

  const toggleSection = (section: 'sort' | 'category' | 'series') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    // Update state when URL param changes
    setSelectedCategory(categoryParam || 'all');

    const sortParam = searchParams.get('sort');
    if (sortParam === 'newest') setSortBy('newest');

    const filterParam = searchParams.get('filter');
    setSaleOnly(filterParam === 'sale');
  }, [searchParams]);

  // Fetch available series and categories
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('series, category')
          .eq('is_deleted', false);
        
        if (error) throw error;
        
        const uniqueSeries = Array.from(new Set(
          data
            ?.map(p => p.series)
            .filter((s): s is string => !!s)
        )).sort();
        setSeriesList(uniqueSeries);

        const uniqueCategories = Array.from(new Set(
          data
            ?.map(p => p.category)
            .filter((s): s is string => !!s)
        ))
        .filter(cat => cat !== 'hoodie') // Filter out 'hoodie'
        .sort();
        setCategoryList(uniqueCategories);

      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*').eq('is_deleted', false);

        // Apply Series Filter
        if (selectedSeries !== 'all') {
          query = query.eq('series', selectedSeries);
        }

        // Apply Category Filter
        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        // Apply Sale Filter
        if (saleOnly) {
          query = query.not('sale_price', 'is', null);
        }

        // Apply Sorting
        if (sortBy === 'price-asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price-desc') {
          query = query.order('price', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!controller.signal.aborted) {
            setProducts(data || []);
        }
      } catch (error: any) {
        if (!controller.signal.aborted) {
          console.error('Error fetching products:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [sortBy, selectedSeries, selectedCategory, saleOnly]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {saleOnly ? '特價商品 (SALE)' : (selectedCategory !== 'all' ? selectedCategory : '所有商品')}
          </h1>
          <p className="text-gray-500">
              {saleOnly ? '限時優惠，把握機會！' : '探索我們最新、最潮的服飾系列'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-wrap justify-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium tracking-wide">FILTER</span>
          </button>
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterOpen(false)}
          ></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-900 tracking-wide uppercase">篩選依據</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Sort Section */}
              <div className="border-b border-gray-100 pb-6">
                <button 
                  onClick={() => toggleSection('sort')}
                  className="w-full flex justify-between items-center font-bold text-gray-900 mb-4"
                >
                  <span>排序方式</span>
                  {openSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {openSections.sort && (
                  <div className="space-y-3 pl-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="sort" 
                        checked={sortBy === 'newest'} 
                        onChange={() => setSortBy('newest')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className={`text-sm ${sortBy === 'newest' ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>最新上架</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="sort" 
                        checked={sortBy === 'price-asc'} 
                        onChange={() => setSortBy('price-asc')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className={`text-sm ${sortBy === 'price-asc' ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>價格: 低至高</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="sort" 
                        checked={sortBy === 'price-desc'} 
                        onChange={() => setSortBy('price-desc')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className={`text-sm ${sortBy === 'price-desc' ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>價格: 高至低</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Category Section */}
              <div className="border-b border-gray-100 pb-6">
                <button 
                  onClick={() => toggleSection('category')}
                  className="w-full flex justify-between items-center font-bold text-gray-900 mb-4"
                >
                  <span>產品分類</span>
                  {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {openSections.category && (
                  <div className="space-y-3 pl-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={selectedCategory === 'all'} 
                        onChange={() => setSelectedCategory('all')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className={`text-sm ${selectedCategory === 'all' ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>全部</span>
                    </label>
                    {categoryList.map((cat) => (
                      <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="category" 
                          checked={selectedCategory === cat} 
                          onChange={() => setSelectedCategory(cat)}
                          className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                        />
                        <span className={`text-sm capitalize ${selectedCategory === cat ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Series Section */}
              <div className="border-b border-gray-100 pb-6">
                <button 
                  onClick={() => toggleSection('series')}
                  className="w-full flex justify-between items-center font-bold text-gray-900 mb-4"
                >
                  <span>產品系列</span>
                  {openSections.series ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {openSections.series && (
                  <div className="space-y-3 pl-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="series" 
                        checked={selectedSeries === 'all'} 
                        onChange={() => setSelectedSeries('all')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className={`text-sm ${selectedSeries === 'all' ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>全部系列</span>
                    </label>
                    {seriesList.map((series) => (
                      <label key={series} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="series" 
                          checked={selectedSeries === series} 
                          onChange={() => setSelectedSeries(series)}
                          className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                        />
                        <span className={`text-sm ${selectedSeries === series ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {series === 'Football Collection' ? '港足系列' : (series === 'Other' ? '其他' : series)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-black text-white py-4 rounded-none font-bold tracking-widest hover:bg-gray-900 transition-colors uppercase flex justify-between px-6"
              >
                <span>應用</span>
                <span>({products.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Series Tags (Quick Filter) - Optional visual enhancement */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedSeries('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedSeries === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {seriesList.map((series) => (
          <button
            key={series}
            onClick={() => setSelectedSeries(series)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSeries === series
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {series === 'Football Collection' ? '港足系列' : (series === 'Other' ? '其他' : series)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
              <div className="h-64 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {selectedCategory !== 'all' ? `${selectedCategory} 系列` : '在這個系列中'}暫時沒有商品。
          </p>
          <p className="text-gray-400 mt-2">Coming Soon</p>
          <button 
            onClick={() => {
                setSelectedSeries('all');
                setSelectedCategory('all');
                setSaleOnly(false);
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            查看所有商品
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
