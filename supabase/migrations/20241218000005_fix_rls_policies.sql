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
