
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Check, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import ZoomableImage from '../components/ZoomableImage';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_deleted', false)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch variants
        const { data: variantsData } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id);
        
        if (variantsData) setVariants(variantsData);

      } catch (error) {
        console.error('Error fetching product:', error);
        setError('找不到該商品');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">哎呀！</h2>
        <p className="text-gray-600 mb-8">{error || '找不到商品'}</p>
        <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-800 font-medium"
        >
            &larr; 返回商品列表
        </button>
      </div>
    );
  }
  
  return <ProductContent product={product} variants={variants} addToCart={addToCart} navigate={navigate} />;
};

const AccordionItem = ({ title, children, isOpen, onClick }: { title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-t border-gray-200">
      <button 
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className="font-bold text-sm uppercase tracking-wider text-gray-900 group-hover:text-gray-600 transition-colors">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}
      >
        <div className="text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

const ProductContent = ({ product, variants, addToCart, navigate }: { product: Product, variants: any[], addToCart: any, navigate: any }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  
  // Get current variant stock
  const normalizeColor = (c: string | null | undefined) => c || '';
  
  const currentVariant = variants.find(v => 
      v.size === selectedSize && 
      normalizeColor(v.color) === normalizeColor(selectedColor)
  );
  
  // If variants exist, use variant stock, otherwise fallback to product stock
  const currentStock = variants.length > 0 
      ? (currentVariant ? Number(currentVariant.stock_quantity) : 0) 
      : Number(product.stock_quantity);

  // Accordion state
  const [openSection, setOpenSection] = useState<string | null>('description');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  useEffect(() => {
    // Default select first size if available
    if (product.sizes && product.sizes.length > 0) {
         // Handle case where sizes might be JSON string or array
         const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
         if (sizes.length > 0) setSelectedSize(sizes[0]);
    }

    // Default select first color if available
    if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
        alert('請選擇尺寸');
        return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
        alert('請選擇顏色');
        return;
    }
    
    if (currentStock <= 0) {
        alert('此商品暫時缺貨');
        return;
    }

    setAdding(true);
    // Simulate network delay for better UX feel
    setTimeout(() => {
        addToCart(product, selectedSize, selectedColor, quantity);
        setAdding(false);
        // Simply show feedback and let user decide next step
        alert('商品已加入購物車！');
    }, 500);
  };

  // Helper to get image URL safely
  const getImageUrl = (img: any) => {
      if (!img) return 'https://via.placeholder.com/300';
      if (typeof img === 'string') {
        try {
          const parsed = JSON.parse(img);
          return parsed.url || img;
        } catch {
          return img.startsWith('http') ? img : `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(product?.name + ' ' + (product?.category || 'fashion') + ' detail')}&image_size=square`;
        }
      }
      return img?.url || 'https://via.placeholder.com/300';
  };

  // Helper to get image Color safely
  const getImageColor = (img: any) => {
      if (typeof img === 'string') {
        try {
          const parsed = JSON.parse(img);
          return parsed.color;
        } catch {
          return null;
        }
      }
      return img?.color;
  };

  const images = product?.images || [];
  const displayImages = images.length > 0 ? images : ['placeholder'];
  
  // Filter images by selected color if any
  const filteredImages = selectedColor 
    ? displayImages.filter((img: any) => {
        const color = getImageColor(img);
        return !color || color === selectedColor; // Show if matches color or has no color
      })
    : displayImages;
    
  // If filtered images is empty (shouldn't happen if logic is correct), fallback to all
  const finalImages = filteredImages.length > 0 ? filteredImages : displayImages;

  const sizes = typeof product?.sizes === 'string' ? JSON.parse(product.sizes) : (product?.sizes || []);
  const colors = product?.colors || [];

  return (
    <div className="bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex text-sm text-gray-500 mb-6 space-x-2">
        <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">首頁</button>
        <span>/</span>
        <button onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)} className="hover:text-gray-900 transition-colors">{product.category}</button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery - Grid Layout */}
        <div className="grid grid-cols-2 gap-1">
          {finalImages.map((img: any, idx: number) => (
             <div key={idx} className={`bg-gray-100 overflow-hidden ${idx === 0 && finalImages.length % 2 !== 0 ? 'col-span-2' : ''}`}>
                <ZoomableImage
                    src={getImageUrl(img)}
                    alt={`${product?.name} ${idx}`}
                    className="w-full h-full"
                />
             </div>
          ))}
        </div>

        {/* Product Info */}
        <div className="md:pl-8">
          <div className="flex justify-between items-start">
             <div>
                <span className="text-gray-500 text-sm block mb-1">{product.category} / <span className="font-bold text-orange-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>{product.series || 'HUGO WOOD'}</span></span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{product.name}</h1>
             </div>
             {/* Removed non-functional shopping cart icon */}
          </div>
          
          <div className="mb-6 flex items-baseline gap-4">
            <p className={`text-xl font-bold ${product.sale_price ? 'text-gray-400 line-through' : 'text-gray-900'}`}>HK$ {product.price.toFixed(2)}</p>
            {product.sale_price && (
                <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-red-600">HK$ {product.sale_price.toFixed(2)}</p>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                    </span>
                </div>
            )}
          </div>
          
          <div className="space-y-8">
            {/* Color Selector */}
            {colors.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{colors.length} 種顏色供選擇</h3>
                    <div className="flex space-x-2 mb-2">
                        {colors.map((color: string) => {
                            // Find first image of this color
                            const colorImg = displayImages.find((img: any) => getImageColor(img) === color) || displayImages[0];
                            return (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-16 h-16 border-b-2 overflow-hidden ${selectedColor === color ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={getImageUrl(colorImg)} alt={color} className="w-full h-full object-cover" />
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-sm text-gray-500">{selectedColor}</p>
                </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-900">選擇 尺碼</h3>
                  <button onClick={() => setShowSizeModal(true)} className="text-sm text-gray-500 underline">尺碼表</button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {sizes.map((size: string) => {
                  // Check stock availability for this size (considering selected color)
                  const isOutOfStock = variants.length > 0 
                    ? (() => {
                        const v = variants.find(v => 
                            v.size === size && 
                            normalizeColor(v.color) === normalizeColor(selectedColor)
                        );
                        // If variant exists, check stock. If not exists, it's unavailable.
                        return v ? Number(v.stock_quantity) <= 0 : true; 
                      })()
                    : false;

                  return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={isOutOfStock}
                    className={`
                      py-3 text-sm font-medium transition-colors relative
                      ${selectedSize === size
                        ? 'bg-black text-white'
                        : isOutOfStock 
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                            : 'bg-white border border-gray-200 text-gray-900 hover:border-black'
                      }
                    `}
                  >
                    {size}
                    {isOutOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-px bg-gray-300 rotate-45 transform scale-75"></div>
                        </span>
                    )}
                  </button>
                )})}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={adding || currentStock === 0}
                className={`w-full flex items-center justify-center px-8 py-4 text-base font-bold text-white uppercase tracking-wider
                    ${currentStock === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800'
                    } transition-colors`}
              >
                {currentStock === 0 ? (
                    <>
                        <AlertCircle className="w-5 h-5 mr-2" />
                        缺貨中
                    </>
                ) : adding ? (
                    '加入中...'
                ) : (
                    <>
                        加入購物車 &rarr;
                    </>
                )}
              </button>
            </div>
             
             {currentStock > 0 && currentStock < 10 && (
                 <p className="text-red-500 text-sm mt-2 flex items-center">
                     <AlertCircle className="w-4 h-4 mr-1" />
                     庫存緊張，僅剩 {currentStock} 件！
                 </p>
             )}

             <div className="mt-12 border-b border-gray-200">
                <AccordionItem 
                    title="產品描述" 
                    isOpen={openSection === 'description'} 
                    onClick={() => toggleSection('description')}
                >
                    <p>{product.description || '暫無描述。'}</p>
                </AccordionItem>
                
                <AccordionItem 
                    title="尺碼指南" 
                    isOpen={openSection === 'sizing'} 
                    onClick={() => toggleSection('sizing')}
                >
                    <p>標準剪裁，建議選擇平時穿著的尺碼。如喜歡寬鬆風格，建議選大一碼。</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>S: 胸圍 96cm / 衣長 68cm</div>
                        <div>M: 胸圍 102cm / 衣長 70cm</div>
                        <div>L: 胸圍 108cm / 衣長 72cm</div>
                        <div>XL: 胸圍 114cm / 衣長 74cm</div>
                    </div>
                </AccordionItem>
                
                <AccordionItem 
                    title="配送與退貨" 
                    isOpen={openSection === 'shipping'} 
                    onClick={() => toggleSection('shipping')}
                >
                    <p className="mb-2"><strong className="text-gray-900">配送時間：</strong> 確認付款後，我們將在 7 天內發貨（除非另有說明）。</p>
                    <p className="mb-2"><strong className="text-gray-900">運費：</strong> 購物滿指定金額可享免運費。</p>
                    <p className="mb-2"><strong className="text-gray-900">本地配送選項：</strong></p>
                    <ul className="list-disc pl-4 space-y-1 mb-2">
                        <li>送貨上門</li>
                        <li>順豐網點自取</li>
                    </ul>
                    <p className="text-xs text-gray-400 mt-2">* 如有任何疑問，請聯繫我們。</p>
                </AccordionItem>
             </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowSizeModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6 shadow-xl overflow-y-auto max-h-[90vh]">
                <button 
                    onClick={() => setShowSizeModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-bold mb-6 text-center">尺碼對照表</h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">尺碼</th>
                                <th className="px-6 py-3">胸圍 (cm)</th>
                                <th className="px-6 py-3">衣長 (cm)</th>
                                <th className="px-6 py-3">肩寬 (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900">S</td>
                                <td className="px-6 py-4">96</td>
                                <td className="px-6 py-4">68</td>
                                <td className="px-6 py-4">42</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900">M</td>
                                <td className="px-6 py-4">102</td>
                                <td className="px-6 py-4">70</td>
                                <td className="px-6 py-4">44</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900">L</td>
                                <td className="px-6 py-4">108</td>
                                <td className="px-6 py-4">72</td>
                                <td className="px-6 py-4">46</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900">XL</td>
                                <td className="px-6 py-4">114</td>
                                <td className="px-6 py-4">74</td>
                                <td className="px-6 py-4">48</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-6 text-xs text-gray-500">
                    <p className="mb-2 font-bold">測量指南：</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>胸圍：測量胸部最豐滿處的周長。</li>
                        <li>衣長：從肩部最高點量至下擺。</li>
                        <li>手工測量可能存在 1-2cm 誤差。</li>
                    </ul>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
