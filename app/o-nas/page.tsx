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

const FALLBACK_ABOUT_HTML = `
  <h1>O nas</h1>
  <p>Spoznajte ORI 369 - Vaš most med znanostjo in energijo</p>
  <p>V ORI 369 združujemo vrhunske terapevtske pristope, najnovejše tehnologije in globoko razumevanje frekvenc 3-6-9, da vam pomagamo doseči ravnovesje telesa, uma in duha. Naš cilj je izboljšati kakovost vašega življenja skozi celostni pristop k zdravljenju.</p>
  <h2>Naša misija</h2>
  <p>Pomagati vam doseči optimalno zdravje in dobro počutje z uporabo najnovejših tehnologij in holistične terapevtske pristope.</p>
  <h2>Naša vizija</h2>
  <p>Postati vodilni center za celostno zdravje in wellness v regiji, kjer znanost sreča duhovno rast.</p>
  <h2>Naše vrednote</h2>
  <p>Sočutje, strokovnost, integriteta in predanost vašemu osebnem razvoju in zdravju.</p>
  <h2>Naša ekipa</h2>
  <p>Tim certificiranih terapevtov z bogatimi izkušnjami na področju fizioterapije, manualnih tehnik in celostnega pristopa.</p>
  <h2>Frekvence 3-6-9</h2>
  <p>Naše delo temelji na razumevanju univerzalnih frekvenc 3-6-9, ki jih je raziskoval Nikola Tesla. Te frekvence predstavljajo ključ do razumevanja vesolja in naše lastne energije. V naših terapijah jih uporabljamo za harmonizacijo telesa in uma.</p>
`;

function isNonEmptyString(v: unknown) {
  return typeof v === "string" && v.replace(/<[^>]+>/g, " ").trim().length > 0;
}

function cmsHasMeaningfulRichText(data: any) {
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
  const visibleSectionIds = new Set(sections.filter((s: any) => s?.visible).map((s: any) => s.id));

  for (const b of blocks) {
    if (!b) continue;
    if (b.section_id && visibleSectionIds.size > 0 && !visibleSectionIds.has(b.section_id)) continue;

    const translations = (b as any).block_translations || [];
    const candidates = [b?.content, ...translations.map((t: any) => t?.content)].filter(Boolean);
    for (const c of candidates) {
      if (isNonEmptyString((c as any)?.html) || isNonEmptyString((c as any)?.text)) return true;
    }
  }

  return false;
}

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

  const hasCms = !!data?.page && Array.isArray(data?.sections) && data.sections.length > 0;
  const useFallback = !hasCms || !cmsHasMeaningfulRichText(data);
  const sections = useFallback ? [{ id: 'fallback', type: 'richText', visible: true, settings: {} }] : data.sections;
  const blocks = useFallback
    ? [{ id: 'fallback-block', section_id: 'fallback', block_translations: [{ lang: 'sl', content: { html: FALLBACK_ABOUT_HTML } }] }]
    : data.blocks;

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
