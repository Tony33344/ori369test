const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const pagesData = [
  {
    slug: 'home',
    title: 'Home',
    content: `<h1>Dobrodošli v ORI 369</h1>
<p>Vaše zdravje in počutje sta naša prioriteta. Nudimo celovit pristop k fizioterapiji, masaži in wellness storitvam.</p>
<h2>Naše storitve</h2>
<ul>
<li>Fizioterapija</li>
<li>Masaža</li>
<li>MotioScan analiza</li>
<li>Wellness programi</li>
</ul>`
  },
  {
    slug: 'o-nas',
    title: 'O nas',
    content: `<h1>O nas</h1>
<p>ORI 369 je strokovna klinika za fizioterapijo in wellness, ki se osredotoča na individualizirane pristope k zdravljenju.</p>
<h2>Naša misija</h2>
<p>Pomagati ljudem, da dosežejo optimalno zdravje in počutje skozi strokovno fizioterapijo in preventivne programe.</p>
<h2>Naš tim</h2>
<p>Naš tim sestavljajo izkušeni fizioterapevti, masažni terapevti in wellness strokovnjaki.</p>`
  },
  {
    slug: 'terapije',
    title: 'Terapije',
    content: `<h1>Naše terapije</h1>
<h2>Fizioterapija</h2>
<p>Individualizirana fizioterapija za različne poškodbe in stanja.</p>
<h2>Masaža</h2>
<p>Terapevtska masaža za sproščanje napetosti in izboljšanje cirkulacije.</p>
<h2>MotioScan</h2>
<p>Napredna 3D analiza telesne drže za natančno diagnostiko.</p>
<h2>Wellness programi</h2>
<p>Celoviti wellness programi za preventivo in optimizacijo zdravja.</p>`
  },
  {
    slug: 'paketi',
    title: 'Paketi',
    content: `<h1>Naši paketi</h1>
<p>Izberite paket, ki najbolje ustreza vašim potrebam.</p>
<h2>Starter paket</h2>
<p>5 sej fizioterapije - idealno za začetnike</p>
<h2>Standard paket</h2>
<p>10 sej fizioterapije + 2 masaži - najpopularnejši</p>
<h2>Premium paket</h2>
<p>20 sej fizioterapije + 4 masaže + MotioScan analiza - celovit pristop</p>`
  },
  {
    slug: 'kontakt',
    title: 'Kontakt',
    content: `<h1>Kontaktirajte nas</h1>
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
</ul>`
  }
];

async function seedCMS() {
  console.log('🌱 Starting CMS seed...');

  for (const pageData of pagesData) {
    try {
      console.log(`\n📄 Processing page: ${pageData.slug}`);

      // Check if page exists
      const { data: existingPage } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', pageData.slug)
        .single();

      let pageId;

      if (existingPage) {
        pageId = existingPage.id;
        console.log(`  ✓ Page exists: ${pageId}`);
      } else {
        const { data: newPage, error: pageError } = await supabase
          .from('pages')
          .insert({ slug: pageData.slug, title: pageData.title, status: 'published' })
          .select()
          .single();

        if (pageError) {
          console.error(`  ❌ Error creating page: ${pageError.message}`);
          continue;
        }

        pageId = newPage.id;
        console.log(`  ✓ Page created: ${pageId}`);
      }

      // Check if section exists
      const { data: existingSection } = await supabase
        .from('sections')
        .select('id')
        .eq('page_id', pageId)
        .eq('type', 'richText')
        .single();

      let sectionId;

      if (existingSection) {
        sectionId = existingSection.id;
        console.log(`  ✓ Section exists: ${sectionId}`);
      } else {
        const { data: newSection, error: sectionError } = await supabase
          .from('sections')
          .insert({ page_id: pageId, type: 'richText', order_index: 0, visible: true, settings: {} })
          .select()
          .single();

        if (sectionError) {
          console.error(`  ❌ Error creating section: ${sectionError.message}`);
          continue;
        }

        sectionId = newSection.id;
        console.log(`  ✓ Section created: ${sectionId}`);
      }

      // Check if block exists
      const { data: existingBlock } = await supabase
        .from('blocks')
        .select('id')
        .eq('section_id', sectionId)
        .single();

      let blockId;

      if (existingBlock) {
        blockId = existingBlock.id;
        console.log(`  ✓ Block exists: ${blockId}`);
      } else {
        const { data: newBlock, error: blockError } = await supabase
          .from('blocks')
          .insert({ section_id: sectionId, type: 'text', order_index: 0, content: {} })
          .select()
          .single();

        if (blockError) {
          console.error(`  ❌ Error creating block: ${blockError.message}`);
          continue;
        }

        blockId = newBlock.id;
        console.log(`  ✓ Block created: ${blockId}`);
      }

      // Check if translation exists
      const { data: existingTranslation } = await supabase
        .from('block_translations')
        .select('id')
        .eq('block_id', blockId)
        .eq('lang', 'sl')
        .single();

      if (existingTranslation) {
        // Update existing translation
        const { error: updateError } = await supabase
          .from('block_translations')
          .update({ content: { html: pageData.content } })
          .eq('id', existingTranslation.id);

        if (updateError) {
          console.error(`  ❌ Error updating translation: ${updateError.message}`);
        } else {
          console.log(`  ✓ Translation updated`);
        }
      } else {
        // Create new translation
        const { error: translationError } = await supabase
          .from('block_translations')
          .insert({ block_id: blockId, lang: 'sl', content: { html: pageData.content } });

        if (translationError) {
          console.error(`  ❌ Error creating translation: ${translationError.message}`);
        } else {
          console.log(`  ✓ Translation created`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error: ${error.message}`);
    }
  }

  console.log('\n✅ CMS seed completed!');
}

seedCMS().catch(console.error);
