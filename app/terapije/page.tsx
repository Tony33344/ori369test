import Services from '@/components/sections/Services';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { getDataForLanguage } from '@/lib/data-loader';

export default async function TherapiesPage() {
  const supabase = createClient();
  
  // Fetch therapies from Supabase
  const { data: supabaseTherapies } = await supabase
    .from('services')
    .select('id, name, slug, description, duration, price, active')
    .eq('active', true)
    .eq('is_package', false)
    .order('name');

  // Get content from JSON (for descriptions, benefits, etc.)
  const jsonData = getDataForLanguage('sl'); // Default to Slovenian for content

  // Merge Supabase data with JSON content
  const therapies = (supabaseTherapies || []).map((service: any) => {
    const jsonTherapy = jsonData.therapies.find((t: any) => t.id === service.slug);
    return {
      id: service.slug,
      name: service.name,
      shortDescription: jsonTherapy?.shortDescription || service.description || '',
      duration: service.duration,
      price: service.price,
    };
  });

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Terapije
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          Odkrijte našo ponudbo vrhunskih terapevtskih storitev
        </p>
      </div>
      <Services services={therapies} />
      <div className="container mx-auto px-4 mt-12 text-center">
        <Link
          href="/rezervacija"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Rezerviraj zdaj
        </Link>
      </div>
    </div>
  );
}
