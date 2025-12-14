import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function ensureCategory(slug: string, name: string, description?: string, image_url?: string, order_index = 0) {
  const { data: existing } = await supabase
    .from('shop_categories')
    .select('*')
    .eq('slug', slug)
    .single();
  if (existing) return existing;
  const { data } = await supabase
    .from('shop_categories')
    .insert({ slug, name, description, image_url, order_index, active: true })
    .select()
    .single();
  return data;
}

async function ensureProduct(category_id: string | null, name: string, description?: string, price = 0, image_url?: string) {
  const slug = slugify(name);
  const { data: existing } = await supabase
    .from('shop_products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (existing) return existing;
  const { data } = await supabase
    .from('shop_products')
    .insert({ slug, name, description, category_id, price, image_url, active: true, stock: 0 })
    .select()
    .single();
  return data;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // 1) Categories
  const catEndurance = await ensureCategory('4endurance-nduranz-pro', '4Endurance / Nduranz Pro', 'Najmočnejše formule za energijo, vzdržljivost, hormonsko ravnovesje in optimalno delovanje telesa.', undefined, 0);
  const catGobe = await ensureCategory('medicinske-gobe', 'Medicinske gobe', 'Moč funkcionalnih gob za imunsko stabilnost, fokus, dihanje in regeneracijo.', undefined, 1);
  const catHomeo = await ensureCategory('homeopatija', 'Homeopatija', 'Subtilna, a močna naravna podpora biološkemu ravnovesju telesa.', undefined, 2);
  const catZelisca = await ensureCategory('zeliscni-pripravki', 'Zeliščni pripravki slovenskih zeliščarjev', 'Moč lokalne tradicije, ročnega znanja in čistih slovenskih zelišč.', undefined, 3);
  const catCBD = await ensureCategory('green-spirit', 'Green Spirit – Premium CBD linija', 'Lokalno, laboratorijsko preverjeno in najvišje kakovosti.', undefined, 4);
  const catSvet = await ensureCategory('svetovanje', 'Individualno svetovanje & Personalizirani protokoli', 'Osebno svetovanje in protokoli po meri.', undefined, 5);

  // 2) Products from outline
  const enduranceProducts = [
    ['Alpha Male', 'Hormonska moč, libido, vitalnost'],
    ['Fusion', 'Napredna regeneracija po fizični in mentalni obremenitvi'],
    ['Immunu', 'Močan imunski super-booster'],
    ['Cardio Max', 'Podpora srcu, ožilju in pretoku'],
    ['Flex', 'Sklepi, hrustanec, vezivna tkiva'],
    ['Loaded', 'Energijski kompleks za visoko zmogljivost'],
    ['Adaptogene Fuse', 'Fokus, stresna odpornost, adaptacija'],
    ['Omega 3', 'Čiste EPA/DHA maščobne kisline'],
    ['Cink', 'Hormoni, celice, imunski sistem'],
    ['Vitamin D3', 'Temelj hormonske in imunske stabilnosti'],
    ['Magnezij (bisglicinat, malat)', 'Regeneracija, mišice, živčni sistem'],
    // Popular extras
    ['Vitamin C (liposomalni)', 'Močan antioksidant in imunska podpora'],
    ['Vitamin B kompleks', 'Energija in živčni sistem'],
    ['Multivitamini (klasični/liposomalni)', 'Celostna podpora'],
    ['Elektroliti', 'Hidracija in ravnovesje elektrolitov'],
    ['Kolagen (tip I & III)', 'Podpora tkivom in koži'],
    ['Selen', 'Antioksidant, imunomodulacija'],
    ['Probiotiki', 'Črevesni mikrobiom'],
    ['Kalcij+Magnezij+Cink', 'Mineralni kompleks']
  ];
  for (const [name, desc] of enduranceProducts) {
    await ensureProduct(catEndurance?.id || null, String(name), String(desc));
  }

  const gobe = [
    ['Reishi', 'Ravnovesje, imunska modulacija'],
    ["Lion's Mane", 'Fokus, spomin, nevroregeneracija'],
    ['Cordyceps', 'Vzdržljivost, energija, pljuča'],
    ['Chaga', 'Antioksidativna zaščita'],
    ['Šiitake', 'Presnova, vitalnost'],
    ['Maitake', 'Presnova, vitalnost']
  ];
  for (const [name, desc] of gobe) {
    await ensureProduct(catGobe?.id || null, String(name), String(desc));
  }

  const homeo = [
    ['Homeopatske kapljice', 'Za hormonski red, stres in stabilnost'],
    ['Homeopatske pilule', 'Za subtilne uravnotežitve'],
    ['Informirana homeopatska voda', 'Nežna podpora biološkim procesom']
  ];
  for (const [name, desc] of homeo) {
    await ensureProduct(catHomeo?.id || null, String(name), String(desc));
  }

  const zelisca = [
    ['Zeliščni macerati', 'Ročno izdelano, energijsko bogato'],
    ['Tinkture', 'Tradicionalni izvlečki slovenskih zelišč'],
    ['Mazila in terapevtski balzami', 'Podpora regeneraciji in koži'],
    ['Oljni ekstrakti', 'Visoka biološka uporabnost'],
    ['Adaptogeni iz slovenskih zelišč', 'Stresna odpornost in fokus']
  ];
  for (const [name, desc] of zelisca) {
    await ensureProduct(catZelisca?.id || null, String(name), String(desc));
  }

  const cbd = [
    ['CBD olja (brez THC)', 'Različne koncentracije, premium kvaliteta'],
    ['CBD izolat (99%)', 'Čista, natančna podpora'],
    ['CBD premium praline', 'Gourmet praline z vrhunskim CBD-jem'],
    ['CBD topikali', 'Mazila, balzami in kreme']
  ];
  for (const [name, desc] of cbd) {
    await ensureProduct(catCBD?.id || null, String(name), String(desc));
  }

  await ensureProduct(catSvet?.id || null, 'Osebno svetovanje', 'Personalizirani protokoli in prilagojene kombinacije');

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  // Convenience in dev
  return POST(request);
}
