'use client';

import { useLanguage } from '@/lib/i18n';

export default function CategoryCards() {
  const { t } = useLanguage();
  
  const categories = [
    {
      titleKey: "categories.pathTitle",
      color: "black",
      bgColor: "bg-black",
      textColor: "text-white",
      itemKeys: [
        "categories.symptoms.burnout",
        "categories.symptoms.stress",
        "categories.symptoms.fear",
        "categories.symptoms.anxiety",
        "categories.symptoms.pain",
        "categories.symptoms.depression",
        "categories.symptoms.distress",
        "categories.symptoms.panic",
        "categories.symptoms.insomnia"
      ]
    },
    {
      titleKey: "",
      color: "lime",
      bgColor: "bg-[#B8D52E]",
      textColor: "text-black",
      itemKeys: [
        "categories.methods.breathing",
        "categories.methods.movement",
        "categories.methods.medicine",
        "categories.methods.manual",
        "categories.methods.tecar",
        "categories.methods.laser",
        "categories.methods.magnetic",
        "categories.methods.dryLight",
        "categories.methods.shockwave",
        "categories.methods.traction",
        "categories.methods.frequency",
        "categories.methods.sound"
      ]
    },
    {
      titleKey: "",
      color: "turquoise",
      bgColor: "bg-[#00B5AD]",
      textColor: "text-white",
      itemKeys: [
        "categories.outcomes.courage",
        "categories.outcomes.peace",
        "categories.outcomes.trust",
        "categories.outcomes.relaxation",
        "categories.outcomes.comfort",
        "categories.outcomes.joy",
        "categories.outcomes.balance",
        "categories.outcomes.stability",
        "categories.outcomes.sleep"
      ]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`${category.bgColor} ${category.textColor} p-8 rounded-lg shadow-lg`}
            >
              {category.titleKey && (
                <h3 className="text-xl md:text-2xl font-bold mb-6 leading-tight">
                  {t(category.titleKey)}
                </h3>
              )}
              <div className="space-y-2">
                {category.itemKeys.map((itemKey: string, idx: number) => (
                  <div key={idx} className="text-sm md:text-base font-medium">
                    {t(itemKey)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
