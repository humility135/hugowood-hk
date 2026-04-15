
ALTER TABLE products ADD COLUMN IF NOT EXISTS series VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_products_series ON products(series);

-- Update existing products with some default series for demonstration
-- We use partial matching because we don't know the exact UUIDs
UPDATE products SET series = 'Basic Essentials' WHERE name LIKE '%素色%';
UPDATE products SET series = 'Street Style' WHERE name LIKE '%潮流%';
UPDATE products SET series = 'Classic Collection' WHERE name LIKE '%經典%';
