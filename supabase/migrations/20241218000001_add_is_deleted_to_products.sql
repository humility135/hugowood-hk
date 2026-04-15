
-- Add is_deleted column to products table
ALTER TABLE products ADD COLUMN is_deleted BOOLEAN DEFAULT false;

-- Update existing records to have is_deleted = false
UPDATE products SET is_deleted = false WHERE is_deleted IS NULL;
