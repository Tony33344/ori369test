import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { getTherapyBySlug, getAllTherapySlugs } from '@/lib/therapyContent';
import { createClient } from '@/lib/supabase';
import { getDataForLanguage } from '@/lib/data-loader';
import BuyButton from '@/components/BuyButton';

// Map therapy slugs to their images
const therapyImages: Record<string, string> = {
  'elektrostimulacija': '/images/therapies/IMG_5926-768x513.webp',
  'manualna-terapija': '/images/therapies/IMG_5929-768x513.webp',
  'tecar-terapija': '/images/therapies/IMG_5931-768x513.webp',
  'magnetna-terapija': '/images/therapies/IMG_5935-768x513.webp',
  'mis': '/images/therapies/IMG_5938-768x513.webp',
  'laserska-terapija': '/images/therapies/IMG_5947-768x513.webp',
  'media-taping': '/images/therapies/IMG_5953-768x513.webp',
  'cupping': '/images/therapies/IMG_5955-768x513.webp',
  'dryneedeling': '/images/therapies/IMG_5991-768x513.webp',
  'iteracare': '/images/therapies/IMG_5993-768x513.webp',
  'ao-scan': '/images/therapies/IMG_5997-768x513.webp',
  'trakcijska-miza': '/images/therapies/IMG_6004-768x513.webp',
  'skalarni-valovi': '/images/therapies/IMG_6009-Copy-768x513.webp',
  'vodeno-dihanje': '/images/therapies/IMG_5779-768x513.webp',
};

export async function generateStaticParams() {
  const slugs = getAllTherapySlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function TherapyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient();
  
  // Fetch therapy from Supabase (single source of truth)
  const { data: service } = await supabase
    .from('services')
    .select('id, name, slug, description, duration, price, active')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!service) {
    notFound();
  }

  // Get content from JSON for full descriptions
  const jsonData = getDataForLanguage('sl');
  const jsonTherapy = jsonData.therapies.find((t: any) => t.id === slug) as any;

  const therapyImage = therapyImages[slug] || '/images/therapies/IMG_5779-768x513.webp';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={therapyImage}
            alt={service.name}
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Link 
            href="/terapije"
            className="inline-flex items-center text-[#00B5AD] hover:text-[#009891] mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Nazaj na vse terapije
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            {service.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-8">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm">
              <Clock className="text-[#00B5AD]" size={20} />
              <span className="text-gray-700"><strong>{service.duration} min</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          {jsonTherapy?.fullContent && (
            <div className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                {jsonTherapy.fullContent.introduction}
              </p>
            </div>
          )}

          {/* Sections */}
          {jsonTherapy?.fullContent?.sections && (
            <div className="space-y-12">
              {jsonTherapy.fullContent.sections.map((section: any, index: number) => (
                <div key={index} className="border-l-4 border-[#00B5AD] pl-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                    {section.title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    {section.content.split('\n\n').map((paragraph: string, pIndex: number) => {
                      // Check if paragraph starts with a bullet point indicator
                      if (paragraph.trim().startsWith('-')) {
                        const items = paragraph.split('\n').filter((line: string) => line.trim().startsWith('-'));
                        return (
                          <ul key={pIndex} className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                            {items.map((item: string, iIndex: number) => (
                              <li key={iIndex} className="ml-4">
                                {item.replace(/^-\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      
                      // Regular paragraph
                      return (
                        <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph.split('**').map((part: string, i: number) => 
                            i % 2 === 0 ? part : <strong key={i} className="font-semibold text-black">{part}</strong>
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-[#00B5AD] to-[#009891] rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">
                Naredite prvi korak k bolj zdravemu in uravnoteženemu življenju
              </h3>
              <p className="text-lg mb-8 opacity-90">
                Rezervirajte svoj termin še danes in začnite svojo pot do boljšega počutja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {service && (
                  <BuyButton
                    serviceId={service.id}
                    serviceName={service.name}
                    price={service.price}
                  />
                )}
                <Link
                  href={`/rezervacija?service=${service.id}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#00B5AD] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Calendar size={20} className="mr-2" />
                  Rezerviraj termin
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Kontaktirajte nas
                </Link>
              </div>
            </div>
          </div>

          {/* Related Therapies */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-black mb-6">
              Odkrijte tudi druge terapije
            </h3>
            <Link
              href="/terapije"
              className="inline-block px-6 py-3 border-2 border-[#00B5AD] text-[#00B5AD] font-semibold rounded-lg hover:bg-[#00B5AD] hover:text-white transition-colors"
            >
              Vsi terapije →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
