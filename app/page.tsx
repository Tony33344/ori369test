'use client';

import Hero from '@/components/sections/Hero';
import TransformationJourney from '@/components/sections/TransformationJourney';
import ServicesPreview from '@/components/sections/ServicesPreview';
import PackagesPreview from '@/components/sections/PackagesPreview';
import Testimonials from '@/components/sections/Testimonials';
import { useLanguage } from '@/lib/i18n';
import { getDataForLanguage } from '@/lib/data-loader';

export default function Home() {
  const { language } = useLanguage();
  const data = getDataForLanguage(language);
  
  return (
    <>
      <Hero />
      <TransformationJourney />
      <ServicesPreview services={data.therapies.slice(0, 6)} />
      <PackagesPreview packages={data.packages.slice(0, 3)} />
      <Testimonials testimonials={data.testimonials} />
    </>
  );
}
