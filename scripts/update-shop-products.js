const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_SLUG = '4endurance-nduranz-pro';
const CATEGORY_NAME = '4Endurance / Nduranz Pro';

/**
 * Real products (from your provided list)
 * Prices are EUR.
 */
const PRODUCTS = [
  { name: '4Endurance Pro Creatine Monohydrate 250 g', price: 17.99 },
  { name: '4Endurance Pro Restful 60 caps', price: 39.99 },
  { name: '4Endurance Pro Collagen+ 90 caps', price: 19.99 },
  { name: '4Endurance Pro Fusion 90 caps', price: 39.99 },
  { name: '4Endurance Pro Absolute 84 caps', price: 49.99 },
  { name: '4Endurance Pro Hydro BCAA (Raspberry/Tropical) 300 g', price: 19.99 },
  { name: 'Nduranz Whey Protein 820 g', price: 39.99 },
  { name: 'Nduranz Regen 920 g', price: 39.99 },
  { name: '4Energy Whey Protein Formula 700 g', price: 24.99 },
  { name: '4Energy Recovery Whey Formula 900 g', price: 24.99 },
  { name: '4Endurance Pro Magnesium Direct 30 sachets', price: 14.99 },
  { name: '4Endurance Pro Immuno 60 caps', price: 29.99 },
  { name: '4Endurance Pro Vit+Min 90 caps', price: 9.99 },
  { name: '4Endurance Pro Loaded 90 caps', price: 39.99 },
  { name: '4Endurance Pro Cardio Max 60 caps', price: 49.99 },
  { name: '4Endurance Pro Nitro Boost 180 g Fruit Punch', price: 29.99 },
  { name: '4Endurance Pro Pro Flex 400 g (Peach/Tropical)', price: 39.99 },
  { name: '4Endurance Pro Nitrates+ 90 caps', price: 24.99 },
  { name: '4Endurance Pro Meltdown 84 caps', price: 39.99 },
  { name: '4Endurance Pro Alpha Boost 126 caps', price: 59.99 },
  { name: '4Endurance Pro Vitamin D3+ (with Coconut Oil) 90 caps', price: 9.99 },
  { name: '4Endurance Pro Natural Vitamin C 60 caps', price: 14.99 },
  { name: '4Endurance Pro Vitamin C 500 mg 90 caps', price: 7.99 },
  { name: '4Endurance Pro Zinc 60 caps', price: 9.99 },
  { name: '4Endurance Pro Iron+ 60 caps', price: 14.99 },
  { name: '4Endurance Pro Vitamin B Complex 90 caps', price: 14.99 },
  { name: '4Endurance Pro TG Omega 3 60 softgels', price: 24.99 },
  { name: '4Endurance Pro Omega 3 60 softgels', price: 9.99 },
  { name: '4Endurance Pro Cordyceps 60 caps', price: 19.99 },
  { name: '4Endurance Pro Potassium Citrate 90 caps', price: 9.99 },
  { name: '4Endurance Pro Glutamine', price: 24.99 },
  { name: '4Endurance Pro Sea Magnesium 60 caps', price: 14.99 },
  { name: '4Endurance Pro Calcium Zinc Magnesium 60 caps', price: 9.99 },
  { name: '4Endurance Pro Creatine HCL 60 caps', price: 19.99 },
  { name: 'Nduranz Nrgy Drink 45 1200 g (Watermelon)', price: 24.99 },
  { name: 'Nduranz Nrgy Drink 90 Limited 1200 g (Cucumber Lime)', price: 24.99 },
  { name: '4Endurance Pro Adaptogen Fuse 60 caps', price: 29.99 },
];

async function ensureCategory() {
  const { data: cat, error } = await supabase
    .from('shop_categories')
    .upsert({ slug: CATEGORY_SLUG, name: CATEGORY_NAME, order_index: 0, active: true }, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error) throw error;
  return cat;
}

async function upsertProducts(categoryId) {
  const desired = PRODUCTS.map((p) => ({
    slug: slugify(p.name),
    name: p.name,
    price: p.price,
  }));

  const desiredSlugSet = new Set(desired.map((p) => p.slug));

  const { data: existing, error: existingErr } = await supabase
    .from('shop_products')
    .select('id, slug, stock, description, image_url, currency')
    .eq('category_id', categoryId);
  if (existingErr) throw existingErr;

  const existingBySlug = new Map((existing || []).map((p) => [p.slug, p]));

  let upserted = 0;
  for (const p of desired) {
    const prev = existingBySlug.get(p.slug);
    const payload = {
      category_id: categoryId,
      slug: p.slug,
      name: p.name,
      price: p.price,
      currency: 'EUR',
      active: true,
      stock: prev?.stock ?? 0,
      description: prev?.description ?? '',
      image_url: prev?.image_url ?? null,
    };

    const { error } = await supabase
      .from('shop_products')
      .upsert(payload, { onConflict: 'slug' });
    if (error) throw error;
    upserted++;
  }

  const slugsToDisable = (existing || [])
    .filter((p) => !desiredSlugSet.has(p.slug))
    .map((p) => p.slug);

  if (slugsToDisable.length) {
    const { error } = await supabase
      .from('shop_products')
      .update({ active: false })
      .eq('category_id', categoryId)
      .in('slug', slugsToDisable);
    if (error) throw error;
  }

  return { upserted, disabled: slugsToDisable.length };
}

async function main() {
  console.log(`Updating shop products for category '${CATEGORY_SLUG}'...`);

  const category = await ensureCategory();
  const result = await upsertProducts(category.id);

  console.log('Done.');
  console.log(result);
}

main().catch((e) => {
  console.error('Failed to update products:', e);
  process.exit(1);
});
