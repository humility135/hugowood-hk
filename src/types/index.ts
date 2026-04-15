
export interface ProductImage {
  url: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price?: number;
  images: (string | ProductImage)[];
  sizes: string[];
  colors?: string[];
  stock_quantity: number;
  category: string;
  series?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  product_variants?: {
    size: string;
    color: string;
    stock_quantity: number;
  }[];
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string;
  selected_color?: string;
  created_at: string;
  updated_at: string;
  product?: Product; // For joined queries
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selected_size: string;
  selected_color?: string;
  created_at: string;
}
