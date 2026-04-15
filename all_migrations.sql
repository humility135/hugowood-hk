ALTER TABLE products ADD COLUMN sale_price numeric;

-- Create product_variants table
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  size text not null,
  color text not null,
  stock_quantity integer default 0,
  created_at timestamptz default now(),
  unique(product_id, size, color)
);

create index if not exists idx_product_variants_product_id on product_variants(product_id);

-- Add selected_color to cart_items
alter table cart_items add column if not exists selected_color text;

-- Add selected_color to order_items
alter table order_items add column if not exists selected_color text;
-- Enable read access for everyone to orders (for admin dashboard demo)
create policy "Enable read access for all users" on "public"."orders"
as permissive for select
to public
using (true);

-- Enable insert access for everyone to orders (for guest checkout)
create policy "Enable insert access for all users" on "public"."orders"
as permissive for insert
to public
with check (true);

-- Enable update access for everyone to orders (for admin updating status)
create policy "Enable update access for all users" on "public"."orders"
as permissive for update
to public
using (true);

-- Enable read access for everyone to order_items
create policy "Enable read access for all users" on "public"."order_items"
as permissive for select
to public
using (true);

-- Enable insert access for everyone to order_items
create policy "Enable insert access for all users" on "public"."order_items"
as permissive for insert
to public
with check (true);

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    images JSONB DEFAULT '[]',
    sizes JSONB DEFAULT '[]',
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(50) DEFAULT 'hoodie',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_size VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, selected_size)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    selected_size VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT SELECT ON products TO anon;
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT SELECT ON cart_items TO anon;
GRANT ALL PRIVILEGES ON cart_items TO authenticated;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON orders TO authenticated;
GRANT ALL PRIVILEGES ON order_items TO authenticated;

-- RLS Policies

-- Products: Everyone can view, only authenticated (admins theoretically) can edit. 
-- For now, allowing all authenticated to edit might be unsafe but fits "ALL PRIVILEGES". 
-- Let's restrict edits to none for now via RLS, or just allow read.
CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Cart Items
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Trigger to sync Supabase Auth with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, password_hash)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'New User'), 
    'managed_by_supabase_auth'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid error on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Data
INSERT INTO products (name, description, price, images, sizes, stock_quantity, category) VALUES
('經典連帽衛衣', '100%純棉材質，舒適透氣，經典版型設計', 899.00, '["hoodie1-main.jpg", "hoodie1-detail.jpg"]', '["S", "M", "L", "XL"]', 50, 'hoodie'),
('潮流印花衛衣', '時尚印花設計，街頭風格，寬鬆版型', 1299.00, '["hoodie2-main.jpg", "hoodie2-detail.jpg"]', '["S", "M", "L", "XL"]', 30, 'hoodie'),
('簡約素色衛衣', '極簡設計，多色可選，日常百搭', 699.00, '["hoodie3-main.jpg", "hoodie3-detail.jpg"]', '["S", "M", "L", "XL"]', 80, 'hoodie');

-- Add is_deleted column to products table
ALTER TABLE products ADD COLUMN is_deleted BOOLEAN DEFAULT false;

-- Update existing records to have is_deleted = false
UPDATE products SET is_deleted = false WHERE is_deleted IS NULL;
-- Add 4 new hoodie products
INSERT INTO products (name, description, price, images, sizes, stock_quantity, category) VALUES
(
    '90s Club De Fútbol Hoodie', 
    '白色連帽衛衣，背面印有 "CLUB DE FÚTBOL 90s" 黑色字樣設計。復古風格，簡約時尚。', 
    299.00, 
    '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=White%20hoodie%20back%20view%20studio%20shot%20with%20bold%20black%20text%20CLUB%20DE%20FUTBOL%2090s%20centered%20on%20back&image_size=square"]', 
    '["S", "M", "L", "XL"]', 
    100, 
    'hoodie'
),
(
    '1996 Football Club Tactical Hoodie', 
    '白色連帽衛衣，背面印有戰術板圖案及 "1996 FOOTBALL CLUB" 字樣。足球迷必備。', 
    299.00, 
    '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=White%20hoodie%20back%20view%20studio%20shot%20with%20football%20tactical%20board%20graphic%20and%20text%201996%20FOOTBALL%20CLUB&image_size=square"]', 
    '["S", "M", "L", "XL"]', 
    100, 
    'hoodie'
),
(
    'Hugo Wood Sports Club Hoodie', 
    '白色連帽衛衣，背面印有 "HUGO WOOD SPORTS CLUB" 字樣及小型戰術板圖標。', 
    299.00, 
    '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=White%20hoodie%20back%20view%20studio%20shot%20with%20text%20HUGO%20WOOD%20SPORTS%20CLUB%20bold%20sans%20serif&image_size=square"]', 
    '["S", "M", "L", "XL"]', 
    100, 
    'hoodie'
),
(
    'Number 9 Player Illustration Hoodie', 
    '白色連帽衛衣，背面印有身穿9號紅衣球員的極簡插畫。致敬傳奇射手。', 
    299.00, 
    '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=White%20hoodie%20back%20view%20studio%20shot%20with%20minimalist%20illustration%20of%20football%20player%20number%209%20red%20shirt&image_size=square"]', 
    '["S", "M", "L", "XL"]', 
    100, 
    'hoodie'
);
-- Remove the 4 specific hoodie products added previously
DELETE FROM products 
WHERE name IN (
    '90s Club De Fútbol Hoodie', 
    '1996 Football Club Tactical Hoodie', 
    'Hugo Wood Sports Club Hoodie', 
    'Number 9 Player Illustration Hoodie'
);
-- Remove ALL products from the table
DELETE FROM products;
-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the bucket
-- Allow public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products (already likely allowed, but ensuring it)
CREATE POLICY "Public Read Access" 
ON products FOR SELECT 
USING (true);

-- Allow public insert/update/delete access to products for Admin demo purposes
-- In production, this should be restricted to admin users only
CREATE POLICY "Public Insert Access" 
ON products FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Update Access" 
ON products FOR UPDATE 
USING (true);

CREATE POLICY "Public Delete Access" 
ON products FOR DELETE 
USING (true);

-- Update storage policies to allow public uploads for the admin page
-- Drop existing restricted policies if needed or just add permissive ones
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' );

CREATE POLICY "Public Update Storage Access" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Public Delete Storage Access" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'product-images' );
-- Add colors column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';

ALTER TABLE products ADD COLUMN IF NOT EXISTS series VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_products_series ON products(series);

-- Update existing products with some default series for demonstration
-- We use partial matching because we don't know the exact UUIDs
UPDATE products SET series = 'Basic Essentials' WHERE name LIKE '%素色%';
UPDATE products SET series = 'Street Style' WHERE name LIKE '%潮流%';
UPDATE products SET series = 'Classic Collection' WHERE name LIKE '%經典%';

-- Update specific products to 'Football Collection'
UPDATE products SET series = 'Football Collection' WHERE name IN ('Matt Orr', 'Club de Fútbol', '1996 Football Club', 'HUGOWOOD Sport Club');

-- Update others to 'Classic Collection'
UPDATE products SET series = 'Classic Collection' WHERE name NOT IN ('Matt Orr', 'Club de Fútbol', '1996 Football Club', 'HUGOWOOD Sport Club');
