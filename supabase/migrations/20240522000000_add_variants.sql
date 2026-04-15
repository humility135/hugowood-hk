
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
