'use client';

import Packages from '@/components/sections/Packages';
import { useLanguage } from '@/lib/i18n';
import { getDataForLanguage } from '@/lib/data-loader';

export default function PackagesPage() {
  const { t, language } = useLanguage();
  const data = getDataForLanguage(language);
  
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          {t('packages.title')}
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          {t('packages.subtitle')}
        </p>
      </div>
      <Packages packages={data.packages} />
    </div>
  );
}
