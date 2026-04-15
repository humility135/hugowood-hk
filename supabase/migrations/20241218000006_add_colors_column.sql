-- Add colors column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';
