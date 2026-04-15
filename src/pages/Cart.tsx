
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCartStore();

  const handleCheckout = () => {
    // Check if user is logged in if required, or just proceed
    // For now, proceed to checkout page
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">購物車是空的</h2>
        <p className="text-gray-500 mb-8">看起來您還沒有選購任何商品。</p>
        <Link
          to="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          繼續購物
        </Link>
      </div>
    );
  }
  
  // Helper to get image URL safely
  const getImageUrl = (product: any) => {
      const img = product.images && product.images.length > 0 ? product.images[0] : null;
      if (!img) return 'https://via.placeholder.com/100';
      
      if (typeof img === 'string') {
        try {
          const parsed = JSON.parse(img);
          return parsed.url || img;
        } catch {
          return img.startsWith('http') ? img : `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(product.name + ' hoodie fashion detail')}&image_size=square`;
        }
      } else if (typeof img === 'object' && img !== null) {
        return img.url || JSON.stringify(img);
      }
      return 'https://via.placeholder.com/100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">購物車</h1>

        <div className="flow-root">
          <ul role="list" className="-my-6 divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={getImageUrl(item.product)}
                    alt={item.product?.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>
                        <Link to={`/products/${item.product_id}`}>{item.product?.name}</Link>
                      </h3>
                      <p className="ml-4">HK$ {((item.product?.price || 0) * item.quantity).toFixed(0)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">尺寸: {item.selected_size}</p>
                    <p className="text-sm text-gray-500">單價: HK$ {item.product?.price}</p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                            -
                        </button>
                        <span className="px-2 py-1 min-w-[2rem] text-center">{item.quantity}</span>
                        <button 
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                            +
                        </button>
                    </div>

                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="font-medium text-red-600 hover:text-red-500 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        移除
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
          <p>小計</p>
          <p>HK$ {totalPrice().toFixed(0)}</p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500 mb-6">
          運費將於結賬時計算。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <Link
                to="/products"
                className="flex-1 flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
                繼續購物
            </Link>
            <button
            onClick={handleCheckout}
            className="flex-1 flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-orange-700"
            >
            前往結賬 <ArrowRight className="w-5 h-5 ml-2" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
