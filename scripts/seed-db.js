require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log('🚀 Seeding MotioScan and Shop data...');

  try {
    // 1. Create MotioScan page
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'motioscan')
      .single();

    let pageId = page?.id;
    if (!pageId) {
      const { data: newPage } = await supabase
        .from('pages')
        .insert({ slug: 'motioscan', title: 'MotioScan', status: 'published' })
        .select()
        .single();
      pageId = newPage?.id;
      console.log('✅ Created MotioScan page');
    } else {
      console.log('ℹ️  MotioScan page already exists');
    }

    // 2. Create section
    if (pageId) {
      const { data: existingSection } = await supabase
        .from('sections')
        .select('id')
        .eq('page_id', pageId)
        .eq('type', 'richText')
        .single();

      if (!existingSection) {
        const { data: section } = await supabase
          .from('sections')
          .insert({ page_id: pageId, type: 'richText', order_index: 0, visible: true, settings: {} })
          .select()
          .single();

        if (section?.id) {
          // 3. Create block
          const { data: block } = await supabase
            .from('blocks')
            .insert({ section_id: section.id, type: 'text', order_index: 0, content: {} })
            .select()
            .single();

          if (block?.id) {
            // 4. Create translation
            const html = `<h1>MotioScan – 3D Analiza Telesne Drže</h1><p><strong>NE UGIBAJ. IZMERI.</strong></p><p>Odkrij natančno stanje svojega telesa z inovativno 3D tehnologijo, ki v nekaj sekundah razkrije tvoje skrite asimetrije, obremenitve in neravnovesja. MotioScan je prvi korak k optimizaciji tvojega telesa in povratku v naravno ravnovesje.</p><h2>Kaj je MotioScan?</h2><p>MotioScan (Moti Physio) je napredna 3D naprava za natančno oceno telesne drže, ki s pomočjo vizualnih markerjev in računalniške analitike zajame:</p><ul><li>24 ključnih anatomskih točk</li><li>več kot 87 mišičnih asimetrij</li><li>rotacije, nagibe in nepravilne obremenitve</li><li>odstopanja hrbtenice, medenice in lopatic</li><li>statično in dinamično stabilnost</li></ul><p><em>Brez sevanja. Brez bolečin. Brez ugibanja. Samo natančni podatki.</em></p><h2>Zakaj je MotioScan tako učinkovit?</h2><ul><li><strong>Ker ne temelji na občutku ali vizualni oceni:</strong> naprava naredi objektivno, natančno meritev – v številkah in 3D modelu.</li><li><strong>Ker odkrije tisto, česar oko ne opazi:</strong> mikrozasuki, rotacije, kompenzacije, zakasnitve aktivacij, asimetrije.</li><li><strong>Ker omogoča točen terapevtski protokol:</strong> na podlagi rezultatov določimo šibke, preobremenjene in kompenzacijske mišice ter realno stanje sklepov.</li><li><strong>Ker lahko meriš napredek:</strong> pred → po … videno črno na belem.</li></ul><h2>Kako poteka MotioScan analiza?</h2><ol><li><strong>Scan (30–60 sekund)</strong> – snemanje poteka stoje, naravno, brez posebne priprave.</li><li><strong>3D model</strong> – sistem izriše tvojo držo v digitalnem formatu.</li><li><strong>Analiza neravnovesij</strong> – višinske razlike, nagibi, rotacije, zamiki, obremenitve, stabilnost.</li><li><strong>Razlaga rezultatov</strong> – terapevt predstavi stanje telesa.</li><li><strong>Protokol povratka v ravnovesje</strong> – manualna korekcija, somatske vaje, stabilizacija, mobilnost, dihanje, terapija drže, terapije ORI.</li></ol><h2>Komu je namenjen?</h2><ul><li>športnikom</li><li>ljudem z bolečinami (hrbet, vrat, medenica)</li><li>po poškodbah</li><li>sedentarno obremenjenim</li><li>vsem, ki želijo optimizirati držo, dih in gibanje</li></ul><h2>Kaj pridobiš?</h2><ul><li>jasno sliko telesa in skritih težav</li><li>preprečevanje poškodb</li><li>optimizacijo drže in gibanja</li><li>več energije, manj napetosti</li><li>hitrejšo regeneracijo in večjo stabilnost</li><li>individualni terapevtski protokol</li><li>merljiv napredek</li></ul><p><strong>Slogan:</strong> NE UGIBAJ. IZMERI. MotioScan ti pokaže realno stanje tvojega telesa. Mi pa poskrbimo za pot nazaj v ravnovesje.</p><p><a href="/rezervacija?package=motioscan" style="display:inline-block;padding:12px 18px;background:#00B5AD;color:#fff;border-radius:8px;text-decoration:none">Naroči svoj termin</a></p>`;

            await supabase
              .from('block_translations')
              .insert({ block_id: block.id, lang: 'sl', content: { html } });
            console.log('✅ Created MotioScan content');
          }
        }
      } else {
        console.log('ℹ️  MotioScan section already exists');
      }
    }

    // 5. Create MotioScan service
    const { data: existingService } = await supabase
      .from('services')
      .select('id')
      .eq('slug', 'motioscan')
      .single();

    if (!existingService) {
      await supabase.from('services').insert({
        name: 'MotioScan – 3D analiza telesne drže',
        slug: 'motioscan',
        description: 'Napredna 3D analiza telesne drže. Ne ugibaj. Izmeri.',
        duration: 60,
        price: 0,
        is_package: false,
        active: true,
      });
      console.log('✅ Created MotioScan service');
    } else {
      console.log('ℹ️  MotioScan service already exists');
    }

    // 6. Seed Shop categories and products
    const categories = [
      { slug: '4endurance-nduranz-pro', name: '4Endurance / Nduranz Pro', order: 0 },
      { slug: 'medicinske-gobe', name: 'Medicinske gobe', order: 1 },
      { slug: 'homeopatija', name: 'Homeopatija', order: 2 },
      { slug: 'zeliscni-pripravki', name: 'Zeliščni pripravki slovenskih zeliščarjev', order: 3 },
      { slug: 'green-spirit', name: 'Green Spirit – Premium CBD linija', order: 4 },
      { slug: 'svetovanje', name: 'Individualno svetovanje & Personalizirani protokoli', order: 5 },
    ];

    const products = {
      '4endurance-nduranz-pro': [
        'Alpha Male', 'Fusion', 'Immunu', 'Cardio Max', 'Flex', 'Loaded', 'Adaptogene Fuse',
        'Omega 3', 'Cink', 'Vitamin D3', 'Magnezij (bisglicinat, malat)', 'Vitamin C (liposomalni)',
        'Vitamin B kompleks', 'Multivitamini (klasični/liposomalni)', 'Elektroliti', 'Kolagen (tip I & III)',
        'Selen', 'Probiotiki', 'Kalcij+Magnezij+Cink'
      ],
      'medicinske-gobe': ['Reishi', "Lion's Mane", 'Cordyceps', 'Chaga', 'Šiitake', 'Maitake'],
      'homeopatija': ['Homeopatske kapljice', 'Homeopatske pilule', 'Informirana homeopatska voda'],
      'zeliscni-pripravki': ['Zeliščni macerati', 'Tinkture', 'Mazila in terapevtski balzami', 'Oljni ekstrakti', 'Adaptogeni iz slovenskih zelišč'],
      'green-spirit': ['CBD olja (brez THC)', 'CBD izolat (99%)', 'CBD premium praline', 'CBD topikali'],
      'svetovanje': ['Osebno svetovanje'],
    };

    let productCount = 0;
    for (const cat of categories) {
      console.log(`\n📦 Processing category: ${cat.name} (${cat.slug})`);
      const { data: existingCats } = await supabase
        .from('shop_categories')
        .select('id')
        .eq('slug', cat.slug);

      let catId = existingCats?.[0]?.id;
      console.log(`  Existing category ID: ${catId}`);
      
      if (!catId) {
        const { data: newCat, error: insertErr } = await supabase
          .from('shop_categories')
          .insert({ slug: cat.slug, name: cat.name, order_index: cat.order, active: true })
          .select()
          .single();
        if (insertErr) {
          console.error(`  ❌ Error creating category:`, insertErr.message);
        } else {
          catId = newCat?.id;
          console.log(`  ✅ Created new category ID: ${catId}`);
        }
      }

      // Always seed products for this category
      if (catId && products[cat.slug]) {
        console.log(`  ✓ Seeding ${products[cat.slug].length} products for ${cat.name}...`);
        for (const prodName of products[cat.slug]) {
          const slug = prodName.toLowerCase().replace(/\s+/g, '-').replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z');
          const { data: existingProd, error: checkErr } = await supabase
            .from('shop_products')
            .select('id')
            .eq('slug', slug)
            .single();

          if (!existingProd) {
            const { error: insertErr } = await supabase.from('shop_products').insert({
              category_id: catId,
              slug,
              name: prodName,
              description: '',
              price: 0,
              active: true,
              stock: 0,
            });
            if (insertErr) {
              console.error(`    ❌ Error inserting ${prodName}:`, insertErr.message);
            } else {
              productCount++;
            }
          }
        }
      }
    }

    console.log(`✅ Seeded ${productCount} shop products`);
    console.log('✨ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
