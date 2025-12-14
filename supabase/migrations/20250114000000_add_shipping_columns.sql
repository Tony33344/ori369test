-- Add shipping columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add product_id column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES shop_products(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update metadata column to JSONB if not already
ALTER TABLE orders ALTER COLUMN metadata TYPE JSONB USING metadata::JSONB;

-- Allow null user_id for guest checkout
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow guest orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
