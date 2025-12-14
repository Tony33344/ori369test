-- Seed CMS pages with content blocks for all pages

-- 1. HOME PAGE
INSERT INTO pages (slug, title, status) 
VALUES ('home', 'Home', 'published')
ON CONFLICT (slug) DO NOTHING;

WITH home_page AS (
  SELECT id FROM pages WHERE slug = 'home'
),
home_section AS (
  INSERT INTO sections (page_id, type, order_index, visible, settings)
  SELECT (SELECT id FROM home_page), 'richText', 0, true, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM sections WHERE page_id = (SELECT id FROM home_page))
  RETURNING id
),
home_block AS (
  INSERT INTO blocks (section_id, type, order_index, content)
  SELECT (SELECT id FROM home_section), 'text', 0, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE section_id = (SELECT id FROM home_section))
  RETURNING id
)
INSERT INTO block_translations (block_id, lang, content)
SELECT (SELECT id FROM home_block), 'sl', jsonb_build_object('html', 
'<h1>Dobrodošli v ORI 369</h1>
<p>Vaše zdravje in počutje sta naša prioriteta. Nudimo celovit pristop k fizioterapiji, masaži in wellness storitvam.</p>
<h2>Naše storitve</h2>
<ul>
<li>Fizioterapija</li>
<li>Masaža</li>
<li>MotioScan analiza</li>
<li>Wellness programi</li>
</ul>')
WHERE NOT EXISTS (SELECT 1 FROM block_translations WHERE block_id = (SELECT id FROM home_block));

-- 2. O NAS PAGE
INSERT INTO pages (slug, title, status) 
VALUES ('o-nas', 'O nas', 'published')
ON CONFLICT (slug) DO NOTHING;

WITH onas_page AS (
  SELECT id FROM pages WHERE slug = 'o-nas'
),
onas_section AS (
  INSERT INTO sections (page_id, type, order_index, visible, settings)
  SELECT (SELECT id FROM onas_page), 'richText', 0, true, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM sections WHERE page_id = (SELECT id FROM onas_page))
  RETURNING id
),
onas_block AS (
  INSERT INTO blocks (section_id, type, order_index, content)
  SELECT (SELECT id FROM onas_section), 'text', 0, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE section_id = (SELECT id FROM onas_section))
  RETURNING id
)
INSERT INTO block_translations (block_id, lang, content)
SELECT (SELECT id FROM onas_block), 'sl', jsonb_build_object('html',
'<h1>O nas</h1>
<p>ORI 369 je strokovna klinika za fizioterapijo in wellness, ki se osredotoča na individualizirane pristope k zdravljenju.</p>
<h2>Naša misija</h2>
<p>Pomagati ljudem, da dosežejo optimalno zdravje in počutje skozi strokovno fizioterapijo in preventivne programe.</p>
<h2>Naš tim</h2>
<p>Naš tim sestavljajo izkušeni fizioterapevti, masažni terapevti in wellness strokovnjaki.</p>')
WHERE NOT EXISTS (SELECT 1 FROM block_translations WHERE block_id = (SELECT id FROM onas_block));

-- 3. TERAPIJE PAGE
INSERT INTO pages (slug, title, status) 
VALUES ('terapije', 'Terapije', 'published')
ON CONFLICT (slug) DO NOTHING;

WITH terapije_page AS (
  SELECT id FROM pages WHERE slug = 'terapije'
),
terapije_section AS (
  INSERT INTO sections (page_id, type, order_index, visible, settings)
  SELECT (SELECT id FROM terapije_page), 'richText', 0, true, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM sections WHERE page_id = (SELECT id FROM terapije_page))
  RETURNING id
),
terapije_block AS (
  INSERT INTO blocks (section_id, type, order_index, content)
  SELECT (SELECT id FROM terapije_section), 'text', 0, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE section_id = (SELECT id FROM terapije_section))
  RETURNING id
)
INSERT INTO block_translations (block_id, lang, content)
SELECT (SELECT id FROM terapije_block), 'sl', jsonb_build_object('html',
'<h1>Naše terapije</h1>
<h2>Fizioterapija</h2>
<p>Individualizirana fizioterapija za različne poškodbe in stanja.</p>
<h2>Masaža</h2>
<p>Terapevtska masaža za sproščanje napetosti in izboljšanje cirkulacije.</p>
<h2>MotioScan</h2>
<p>Napredna 3D analiza telesne drže za natančno diagnostiko.</p>
<h2>Wellness programi</h2>
<p>Celoviti wellness programi za preventivo in optimizacijo zdravja.</p>')
WHERE NOT EXISTS (SELECT 1 FROM block_translations WHERE block_id = (SELECT id FROM terapije_block));

-- 4. PAKETI PAGE
INSERT INTO pages (slug, title, status) 
VALUES ('paketi', 'Paketi', 'published')
ON CONFLICT (slug) DO NOTHING;

WITH paketi_page AS (
  SELECT id FROM pages WHERE slug = 'paketi'
),
paketi_section AS (
  INSERT INTO sections (page_id, type, order_index, visible, settings)
  SELECT (SELECT id FROM paketi_page), 'richText', 0, true, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM sections WHERE page_id = (SELECT id FROM paketi_page))
  RETURNING id
),
paketi_block AS (
  INSERT INTO blocks (section_id, type, order_index, content)
  SELECT (SELECT id FROM paketi_section), 'text', 0, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE section_id = (SELECT id FROM paketi_section))
  RETURNING id
)
INSERT INTO block_translations (block_id, lang, content)
SELECT (SELECT id FROM paketi_block), 'sl', jsonb_build_object('html',
'<h1>Naši paketi</h1>
<p>Izberite paket, ki najbolje ustreza vašim potrebam.</p>
<h2>Starter paket</h2>
<p>5 sej fizioterapije - idealno za začetnike</p>
<h2>Standard paket</h2>
<p>10 sej fizioterapije + 2 masaži - najpopularnejši</p>
<h2>Premium paket</h2>
<p>20 sej fizioterapije + 4 masaže + MotioScan analiza - celovit pristop</p>')
WHERE NOT EXISTS (SELECT 1 FROM block_translations WHERE block_id = (SELECT id FROM paketi_block));

-- 5. KONTAKT PAGE
INSERT INTO pages (slug, title, status) 
VALUES ('kontakt', 'Kontakt', 'published')
ON CONFLICT (slug) DO NOTHING;

WITH kontakt_page AS (
  SELECT id FROM pages WHERE slug = 'kontakt'
),
kontakt_section AS (
  INSERT INTO sections (page_id, type, order_index, visible, settings)
  SELECT (SELECT id FROM kontakt_page), 'richText', 0, true, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM sections WHERE page_id = (SELECT id FROM kontakt_page))
  RETURNING id
),
kontakt_block AS (
  INSERT INTO blocks (section_id, type, order_index, content)
  SELECT (SELECT id FROM kontakt_section), 'text', 0, '{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE section_id = (SELECT id FROM kontakt_section))
  RETURNING id
)
INSERT INTO block_translations (block_id, lang, content)
SELECT (SELECT id FROM kontakt_block), 'sl', jsonb_build_object('html',
'<h1>Kontaktirajte nas</h1>
<p>Veseli smo, da se želite povezati z nami.</p>
<h2>Naslov</h2>
<p>ORI 369<br/>Ljubljana, Slovenija</p>
<h2>Telefon</h2>
<p>+386 1 234 5678</p>
<h2>Email</h2>
<p>info@ori369.si</p>
<h2>Delovni čas</h2>
<ul>
<li>Ponedeljek - Petek: 8:00 - 20:00</li>
<li>Sobota: 9:00 - 14:00</li>
<li>Nedelja: Zaprto</li>
</ul>')
WHERE NOT EXISTS (SELECT 1 FROM block_translations WHERE block_id = (SELECT id FROM kontakt_block));
