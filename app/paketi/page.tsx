import Packages from '@/components/sections/Packages';
import { createClient } from '@/lib/supabase';
import { getDataForLanguage } from '@/lib/data-loader';

export default async function PackagesPage() {
  const supabase = createClient();
  
  // Fetch packages from Supabase
  const { data: supabasePackages } = await supabase
    .from('services')
    .select('id, name, slug, description, duration, price, sessions, active')
    .eq('active', true)
    .eq('is_package', true)
    .order('name');

  // Get content from JSON (for descriptions, benefits, etc.)
  const jsonData = getDataForLanguage('sl'); // Default to Slovenian for content

  // Merge Supabase data with JSON content
  const packages = (supabasePackages || []).map((service: any) => {
    const jsonPackage = jsonData.packages.find((p: any) => p.id === service.slug);
    return {
      id: service.slug,
      name: service.name,
      description: jsonPackage?.description || service.description || '',
      benefits: jsonPackage?.benefits || [],
      sessions: service.sessions || 1,
      price: service.price,
      regularPrice: jsonPackage?.regularPrice,
    };
  });
  
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Paketi
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          Izberite paket, ki vam najbolje ustreza
        </p>
      </div>
      <Packages packages={packages} />
    </div>
  );
}
