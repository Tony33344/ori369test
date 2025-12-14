"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Packages from "@/components/sections/Packages";
import Testimonials from "@/components/sections/Testimonials";
import TransformationJourney from "@/components/sections/TransformationJourney";
import ServicesPreview from "@/components/sections/ServicesPreview";
import PackagesPreview from "@/components/sections/PackagesPreview";

function SectionRenderer({ section, blocks, lang }: any) {
  const bySection = (blocks || []).filter((b: any) => b?.section_id === section.id);
  const tFor = (block: any) => {
    if (!block) return {} as any;
    const translations = (block as any).block_translations || [];
    const tr =
      translations.find((x: any) => x?.lang === lang) ||
      translations.find((x: any) => x?.lang === "sl");
    return (tr && tr.content) || block.content || {};
  };

  switch (section.type) {
    case "hero":
      return <Hero {...(section.settings || {})} {...tFor(bySection[0])} />;
    case "transformationJourney":
      return <TransformationJourney />;
    case "services":
      return <Services services={(tFor(bySection[0]) as any)?.services || []} />;
    case "servicesPreview":
      return <ServicesPreview services={(tFor(bySection[0]) as any)?.services || []} />;
    case "packages":
      return <Packages packages={(tFor(bySection[0]) as any)?.packages || []} />;
    case "packagesPreview":
      return <PackagesPreview packages={(tFor(bySection[0]) as any)?.packages || []} />;
    case "testimonials":
      return <Testimonials testimonials={(tFor(bySection[0]) as any)?.items || []} />;
    case "richText":
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="prose prose-lg max-w-none">
            {(bySection || []).map((b: any) => (
              <div
                key={b.id}
                dangerouslySetInnerHTML={{
                  __html: (tFor(b) as any).html || (tFor(b) as any).text || "",
                }}
              />
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function AboutPage() {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/pages?slug=o-nas")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page not found</h1>
          <p className="text-gray-600">The About page is not configured in the CMS.</p>
        </div>
      </div>
    );
  }

  const { sections, blocks } = data;

  return (
    <div className="min-h-screen bg-white">
      {(sections || [])
        .filter((s: any) => s.visible)
        .map((section: any) => (
          <SectionRenderer
            key={section.id}
            section={section}
            blocks={blocks || []}
            lang={language}
          />
        ))}
    </div>
  );
}
