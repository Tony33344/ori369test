import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Euro, Calendar } from 'lucide-react';
import { getTherapyBySlug, getAllTherapySlugs } from '@/lib/therapyContent';

export async function generateStaticParams() {
  const slugs = getAllTherapySlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export default function TherapyDetailPage({ params }: { params: { slug: string } }) {
  const therapy = getTherapyBySlug(params.slug);

  if (!therapy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link 
            href="/terapije"
            className="inline-flex items-center text-[#00B5AD] hover:text-[#009891] mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Nazaj na vse terapije
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            {therapy.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-8">
            {therapy.shortDescription}
          </p>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm">
              <Clock className="text-[#00B5AD]" size={20} />
              <span className="text-gray-700"><strong>{therapy.duration} min</strong></span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm">
              <Euro className="text-[#00B5AD]" size={20} />
              <span className="text-gray-700"><strong>€{therapy.price}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed">
              {therapy.fullContent.introduction}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {therapy.fullContent.sections.map((section, index) => (
              <div key={index} className="border-l-4 border-[#00B5AD] pl-6">
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                  {section.title}
                </h2>
                <div className="prose prose-lg max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => {
                    // Check if paragraph starts with a bullet point indicator
                    if (paragraph.trim().startsWith('-')) {
                      const items = paragraph.split('\n').filter(line => line.trim().startsWith('-'));
                      return (
                        <ul key={pIndex} className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                          {items.map((item, iIndex) => (
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
                        {paragraph.split('**').map((part, i) => 
                          i % 2 === 0 ? part : <strong key={i} className="font-semibold text-black">{part}</strong>
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

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
                <Link
                  href="/rezervacija"
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
