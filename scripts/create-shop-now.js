require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createShop() {
  console.log('🚀 Creating shop tables and seeding data...\n');

  try {
    // 1. Create categories table
    console.log('📦 Creating shop_categories table...');
    const { error: catErr } = await supabase.rpc('exec_sql', {
      sql: `
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
        CREATE INDEX IF NOT EXISTS idx_shop_categories_active ON public.shop_categories(active);
        CREATE INDEX IF NOT EXISTS idx_shop_categories_order ON public.shop_categories(order_index);
      `
    });

    if (catErr && !catErr.message.includes('already exists')) {
      console.error('❌ Error creating categories table:', catErr.message);
    } else {
      console.log('✅ Categories table ready');
    }

    // 2. Create products table
    console.log('📦 Creating shop_products table...');
    const { error: prodErr } = await supabase.rpc('exec_sql', {
      sql: `
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
        CREATE INDEX IF NOT EXISTS idx_shop_products_category ON public.shop_products(category_id);
        CREATE INDEX IF NOT EXISTS idx_shop_products_active ON public.shop_products(active);
      `
    });

    if (prodErr && !prodErr.message.includes('already exists')) {
      console.error('❌ Error creating products table:', prodErr.message);
    } else {
      console.log('✅ Products table ready');
    }

    // 3. Seed categories and products
    console.log('\n📥 Seeding categories and products...\n');

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

    let totalProducts = 0;
    for (const cat of categories) {
      const { data: catData } = await supabase
        .from('shop_categories')
        .upsert({ slug: cat.slug, name: cat.name, order_index: cat.order, active: true }, { onConflict: 'slug' })
        .select()
        .single();

      if (!catData?.id) {
        console.error(`❌ Failed to create category: ${cat.name}`);
        continue;
      }

      console.log(`✅ ${cat.name}`);

      // Seed products
      if (products[cat.slug]) {
        const prods = products[cat.slug].map(name => ({
          category_id: catData.id,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z'),
          name,
          description: '',
          price: 0,
          active: true,
          stock: 0,
        }));

        const { error: insertErr } = await supabase
          .from('shop_products')
          .upsert(prods, { onConflict: 'slug' });

        if (!insertErr) {
          totalProducts += prods.length;
        }
      }
    }

    console.log(`\n✨ Done! Seeded ${totalProducts} products across ${categories.length} categories`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createShop();
