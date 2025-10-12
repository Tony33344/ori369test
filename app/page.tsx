import Hero from '@/components/sections/Hero';
import ServicesPreview from '@/components/sections/ServicesPreview';
import Packages from '@/components/sections/Packages';
import Testimonials from '@/components/sections/Testimonials';
import data from '@/public/assets/data.json';

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesPreview services={data.therapies.slice(0, 6)} />
      <Packages packages={data.packages.slice(0, 3)} />
      <Testimonials testimonials={data.testimonials} />
    </>
  );
}
