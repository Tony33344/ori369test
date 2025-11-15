-- Enhanced CMS seed with blocks and translations

-- Clear existing CMS data (optional, for clean re-seed)
-- DELETE FROM public.block_translations;
-- DELETE FROM public.blocks;
-- DELETE FROM public.sections;
-- DELETE FROM public.pages;

-- Insert pages
INSERT INTO public.pages (id, slug, title, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'home', 'Home', 'published'),
  ('00000000-0000-0000-0000-000000000002', 'o-nas', 'O nas', 'published'),
  ('00000000-0000-0000-0000-000000000003', 'terapije', 'Terapije', 'published'),
  ('00000000-0000-0000-0000-000000000004', 'paketi', 'Paketi', 'published'),
  ('00000000-0000-0000-0000-000000000005', 'kontakt', 'Kontakt', 'published')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

-- Home page sections
INSERT INTO public.sections (id, page_id, type, order_index, visible, settings) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'hero', 0, true, '{}'::jsonb),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'transformationJourney', 1, true, '{}'::jsonb),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'servicesPreview', 2, true, '{}'::jsonb),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'packagesPreview', 3, true, '{}'::jsonb),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'testimonials', 4, true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- O nas sections
INSERT INTO public.sections (id, page_id, type, order_index, visible, settings) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'richText', 0, true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Terapije sections
INSERT INTO public.sections (id, page_id, type, order_index, visible, settings) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'services', 0, true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Paketi sections
INSERT INTO public.sections (id, page_id, type, order_index, visible, settings) VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'packages', 0, true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Kontakt sections
INSERT INTO public.sections (id, page_id, type, order_index, visible, settings) VALUES
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'richText', 0, true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Sample blocks for home hero (can be expanded)
INSERT INTO public.blocks (id, section_id, type, order_index, content, settings) VALUES
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'text', 0, '{"title": "Vaš most med znanostjo in energijo"}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Sample translations
INSERT INTO public.block_translations (block_id, lang, content) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'sl', '{"title": "Vaš most med znanostjo in energijo"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000001', 'en', '{"title": "Your bridge between science and energy"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000001', 'de', '{"title": "Ihre Brücke zwischen Wissenschaft und Energie"}'::jsonb)
ON CONFLICT (block_id, lang) DO UPDATE SET content = EXCLUDED.content;
