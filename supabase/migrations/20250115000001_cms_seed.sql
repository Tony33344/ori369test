-- Seed initial CMS pages matching current site structure

-- Home page
INSERT INTO public.pages (slug, title, status) 
VALUES ('home', 'Home', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Get page ID for home
DO $$
DECLARE
  home_page_id uuid;
  hero_section_id uuid;
  tj_section_id uuid;
  sp_section_id uuid;
  pp_section_id uuid;
  t_section_id uuid;
BEGIN
  SELECT id INTO home_page_id FROM public.pages WHERE slug = 'home';
  
  -- Hero section
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (home_page_id, 'hero', 0, true, '{}'::jsonb)
  RETURNING id INTO hero_section_id;
  
  -- Transformation Journey
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (home_page_id, 'transformationJourney', 1, true, '{}'::jsonb)
  RETURNING id INTO tj_section_id;
  
  -- Services Preview
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (home_page_id, 'servicesPreview', 2, true, '{}'::jsonb)
  RETURNING id INTO sp_section_id;
  
  -- Packages Preview
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (home_page_id, 'packagesPreview', 3, true, '{}'::jsonb)
  RETURNING id INTO pp_section_id;
  
  -- Testimonials
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (home_page_id, 'testimonials', 4, true, '{}'::jsonb)
  RETURNING id INTO t_section_id;
END $$;

-- About page
INSERT INTO public.pages (slug, title, status) 
VALUES ('o-nas', 'O nas', 'published')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  about_page_id uuid;
  rt_section_id uuid;
BEGIN
  SELECT id INTO about_page_id FROM public.pages WHERE slug = 'o-nas';
  
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (about_page_id, 'richText', 0, true, '{}'::jsonb)
  RETURNING id INTO rt_section_id;
END $$;

-- Therapies page
INSERT INTO public.pages (slug, title, status) 
VALUES ('terapije', 'Terapije', 'published')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  therapies_page_id uuid;
  s_section_id uuid;
BEGIN
  SELECT id INTO therapies_page_id FROM public.pages WHERE slug = 'terapije';
  
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (therapies_page_id, 'services', 0, true, '{}'::jsonb)
  RETURNING id INTO s_section_id;
END $$;

-- Packages page
INSERT INTO public.pages (slug, title, status) 
VALUES ('paketi', 'Paketi', 'published')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  packages_page_id uuid;
  p_section_id uuid;
BEGIN
  SELECT id INTO packages_page_id FROM public.pages WHERE slug = 'paketi';
  
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (packages_page_id, 'packages', 0, true, '{}'::jsonb)
  RETURNING id INTO p_section_id;
END $$;

-- Contact page
INSERT INTO public.pages (slug, title, status) 
VALUES ('kontakt', 'Kontakt', 'published')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  contact_page_id uuid;
  rt_section_id uuid;
BEGIN
  SELECT id INTO contact_page_id FROM public.pages WHERE slug = 'kontakt';
  
  INSERT INTO public.sections (page_id, type, order_index, visible, settings)
  VALUES (contact_page_id, 'richText', 0, true, '{}'::jsonb)
  RETURNING id INTO rt_section_id;
END $$;
