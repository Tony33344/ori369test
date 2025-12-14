import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * One-click setup: creates shop tables and seeds all data
 * GET /api/setup-shop
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Setting up shop tables and seeding data...');

    // 1. Create shop_categories table if not exists
    const { error: catTableErr } = await supabase.rpc('exec_sql', {
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

    // 2. Create shop_products table if not exists
    const { error: prodTableErr } = await supabase.rpc('exec_sql', {
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

    // If RPC doesn't work, use direct table operations instead
    // 3. Seed categories
    const categories = [
      { slug: '4endurance-nduranz-pro', name: '4Endurance / Nduranz Pro', order: 0 },
      { slug: 'medicinske-gobe', name: 'Medicinske gobe', order: 1 },
      { slug: 'homeopatija', name: 'Homeopatija', order: 2 },
      { slug: 'zeliscni-pripravki', name: 'Zeliščni pripravki slovenskih zeliščarjev', order: 3 },
      { slug: 'green-spirit', name: 'Green Spirit – Premium CBD linija', order: 4 },
      { slug: 'svetovanje', name: 'Individualno svetovanje & Personalizirani protokoli', order: 5 },
    ];

    const products: Record<string, string[]> = {
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
      // Upsert category
      const { data: catData, error: catErr } = await supabase
        .from('shop_categories')
        .upsert({ slug: cat.slug, name: cat.name, order_index: cat.order, active: true }, { onConflict: 'slug' })
        .select()
        .single();

      if (catErr) {
        console.error(`Error upserting category ${cat.slug}:`, catErr.message);
        continue;
      }

      const catId = catData?.id;
      if (!catId) continue;

      // Seed products for this category
      if (products[cat.slug]) {
        for (const prodName of products[cat.slug]) {
          const slug = prodName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/č/g, 'c')
            .replace(/š/g, 's')
            .replace(/ž/g, 'z');

          const { error: prodErr } = await supabase
            .from('shop_products')
            .upsert(
              {
                category_id: catId,
                slug,
                name: prodName,
                description: '',
                price: 0,
                active: true,
                stock: 0,
              },
              { onConflict: 'slug' }
            );

          if (!prodErr) productCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Shop setup complete',
      stats: {
        categories: categories.length,
        products: productCount,
      },
    });
  } catch (error: any) {
    console.error('❌ Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
