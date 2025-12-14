-- Shop tables: categories, products, product_images
-- UUID generation uses gen_random_uuid(); ensure pgcrypto extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Categories
CREATE TABLE IF NOT EXISTS public.shop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.shop_categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product Images (optional, multi-image)
CREATE TABLE IF NOT EXISTS public.shop_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.shop_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_shop_categories_active ON public.shop_categories(active);
CREATE INDEX IF NOT EXISTS idx_shop_categories_order ON public.shop_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON public.shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON public.shop_products(active);

-- Disable RLS for admin simplicity (we can add policies later)
ALTER TABLE public.shop_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_product_images DISABLE ROW LEVEL SECURITY;
