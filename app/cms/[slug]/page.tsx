'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Packages from '@/components/sections/Packages';
import Testimonials from '@/components/sections/Testimonials';
import TransformationJourney from '@/components/sections/TransformationJourney';
import ServicesPreview from '@/components/sections/ServicesPreview';
import PackagesPreview from '@/components/sections/PackagesPreview';

function SectionRenderer({ section, blocks, lang }: any) {
  const bySection = blocks.filter((b: any) => b.section_id === section.id);
  const tFor = (block: any) => {
    const tr = (block.block_translations || []).find((x: any) => x.lang === lang)
      || (block.block_translations || []).find((x: any) => x.lang === 'sl');
    return tr?.content || block.content || {};
  };

  switch (section.type) {
    case 'hero':
      return <Hero {...section.settings} {...tFor(bySection[0])} />;
    case 'transformationJourney':
      return <TransformationJourney />;
    case 'services':
      return <Services services={tFor(bySection[0])?.services || []} />;
    case 'servicesPreview':
      return <ServicesPreview services={tFor(bySection[0])?.services || []} />;
    case 'packages':
      return <Packages packages={tFor(bySection[0])?.packages || []} />;
    case 'packagesPreview':
      return <PackagesPreview packages={tFor(bySection[0])?.packages || []} />;
    case 'testimonials':
      return <Testimonials testimonials={tFor(bySection[0])?.items || []} />;
    case 'richText':
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-base leading-relaxed space-y-4">
            {(bySection || []).map((b: any) => {
              const content = tFor(b);
              const htmlContent = content.html || content.text || '';
              
              return (
                <div 
                  key={b.id} 
                  className="cms-content"
                  dangerouslySetInnerHTML={{ __html: htmlContent }} 
                />
              );
            })}
          </div>
        </div>
      );
    case 'imageBanner':
      return (
        <div className="relative w-full">
          <img src={section.settings?.imageUrl} alt={section.settings?.alt || ''} className="w-full h-auto" />
        </div>
      );
    default:
      return null;
  }
}

export default function CmsPage({ params }: { params: { slug: string } }) {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const slug = params.slug;

  useEffect(() => {
    fetch(`/api/cms/pages?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        console.log('CMS Page loaded:', { slug, hasSections: !!d.sections, sectionCount: d.sections?.length, hasBlocks: !!d.blocks });
        if (d.blocks?.[0]?.block_translations?.[0]?.content?.html) {
          const html = d.blocks[0].block_translations[0].content.html;
          console.log('HTML content length:', html.length, 'has figures:', html.includes('<figure'));
        }
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading page:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data === null || data.page === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page not found</h1>
          <p className="text-gray-600">The page you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const { page, sections, blocks } = data;
  
  return (
    <div className="min-h-screen bg-white">
      {(sections || []).filter((s: any) => s.visible).map((section: any) => (
        <SectionRenderer key={section.id} section={section} blocks={blocks || []} lang={language} />
      ))}
    </div>
  );
}
