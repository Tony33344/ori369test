-- ============================================
-- CONSOLIDATED MIGRATIONS FOR HOSTED DATABASE
-- Apply this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Extend profiles with contact fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal TEXT;

-- 2. Update profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, address, city, postal)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postal'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Admin RLS policies for orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 4. Admin RLS policies for order_items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all order items" ON public.order_items;
CREATE POLICY "Admins can update all order items" ON public.order_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 5. Fix ecommerce order_items for product purchases
-- Some hosted DBs were created with order_items.service_id as NOT NULL, which breaks product orders.
ALTER TABLE public.order_items
  ALTER COLUMN service_id DROP NOT NULL;

-- Ensure product_id exists (for older deployments)
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_id UUID;

-- Ensure FK exists (best-effort; safe if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'order_items_product_id_fkey'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.shop_products(id);
  END IF;
END $$;

-- Ensure each order item is either a service OR a product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'order_items_requires_item'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_requires_item
      CHECK (service_id IS NOT NULL OR product_id IS NOT NULL);
  END IF;
END $$;

-- Done! Refresh your app after applying.
