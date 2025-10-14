'use client';

import Services from '@/components/sections/Services';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getDataForLanguage } from '@/lib/data-loader';

export default function TherapiesPage() {
  const { t, language } = useLanguage();
  const data = getDataForLanguage(language);
  
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          {t('therapies.title')}
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          {t('therapies.subtitle')}
        </p>
      </div>
      <Services services={data.therapies} />
      <div className="container mx-auto px-4 mt-12 text-center">
        <Link
          href="/rezervacija"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {t('hero.cta')}
        </Link>
      </div>
    </div>
  );
}
