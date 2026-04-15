
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getDisplayImageUrl = () => {
    if (!product.images || product.images.length === 0) return 'https://via.placeholder.com/300';
    
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      try {
        // Try parsing just in case it's a JSON string
        const parsed = JSON.parse(firstImage);
        return parsed.url || firstImage;
      } catch {
        return firstImage;
      }
    } else if (typeof firstImage === 'object' && firstImage !== null) {
      return (firstImage as any).url || JSON.stringify(firstImage);
    }
    return 'https://via.placeholder.com/300';
  };

  const imageUrl = getDisplayImageUrl();
    
  // Use a placeholder image generator if the image is just a filename
  const displayImage = imageUrl.startsWith('http') 
    ? imageUrl 
    : `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(product.name + ' ' + (product.category || 'fashion') + ' studio shot')}&image_size=square`;

  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow relative">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative">
          <img
            src={displayImage}
            alt={product.name}
            className="h-64 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
          />
          {product.sale_price && discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          {product.series && (
            <p className="text-xs text-orange-500 font-medium mb-1 uppercase tracking-wider">
              {product.series === 'Football Collection' ? '港足系列' : (product.series === 'Other' ? '其他' : product.series)}
            </p>
          )}
          <h3 className="text-sm text-gray-700 font-medium">{product.name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <p className={`text-lg font-bold ${product.sale_price ? 'text-gray-400 line-through text-sm' : 'text-gray-900'}`}>HK$ {product.price}</p>
            {product.sale_price && (
                <p className="text-lg font-bold text-red-600">HK$ {product.sale_price}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
