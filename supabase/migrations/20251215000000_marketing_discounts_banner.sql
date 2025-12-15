-- Marketing features: discount codes + global site banner

-- Discount codes
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  percent_off INTEGER NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all','products','services')),
  min_subtotal DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Public can validate only active codes (needed for checkout)
DROP POLICY IF EXISTS "Public can view active discount codes" ON public.discount_codes;
CREATE POLICY "Public can view active discount codes" ON public.discount_codes
  FOR SELECT
  USING (
    active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses)
  );

-- Admin manage discount codes
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;
CREATE POLICY "Admins can manage discount codes" ON public.discount_codes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON public.discount_codes;
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);


-- Global site banner (single row supported)
CREATE TABLE IF NOT EXISTS public.site_banner (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT FALSE,
  message TEXT,
  link_url TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_banner ENABLE ROW LEVEL SECURITY;

-- Ensure there is at least one row
INSERT INTO public.site_banner (id, enabled, message)
VALUES (1, FALSE, NULL)
ON CONFLICT (id) DO NOTHING;

-- Public can view enabled banner during active window
DROP POLICY IF EXISTS "Public can view active site banner" ON public.site_banner;
CREATE POLICY "Public can view active site banner" ON public.site_banner
  FOR SELECT
  USING (
    enabled = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Admin can manage banner
DROP POLICY IF EXISTS "Admins can manage site banner" ON public.site_banner;
CREATE POLICY "Admins can manage site banner" ON public.site_banner
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));


-- Orders: store discount information
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS discount_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);
