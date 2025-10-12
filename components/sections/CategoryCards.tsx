'use client';

export default function CategoryCards() {
  const categories = [
    {
      title: "CELOSTNA POT DO ZDRAVJA IN DOBREGA POČUTJA",
      color: "black",
      bgColor: "bg-black",
      textColor: "text-white",
      items: [
        "IZGORELOST",
        "STRES",
        "STRAH",
        "ANKSIOZNOST",
        "BOLEČINA",
        "DEPRESIJA",
        "TESNOBA",
        "PANIKA",
        "NESPEČNOST"
      ]
    },
    {
      title: "",
      color: "lime",
      bgColor: "bg-[#B8D52E]",
      textColor: "text-black",
      items: [
        "DIHANJE",
        "ZAVESTNO GIBANJE",
        "SVETA MEDICINA",
        "MANUALNA TERAPIJA",
        "TECAR STIMULACIJA",
        "LASER",
        "MAGNETNA TERAPIJA",
        "SUHA SVETLOBA",
        "UDARNI VALOVI",
        "TRAKCIJA",
        "FREKVENČNA TERAPIJA",
        "ZVOK"
      ]
    },
    {
      title: "",
      color: "turquoise",
      bgColor: "bg-[#00B5AD]",
      textColor: "text-white",
      items: [
        "POGUM",
        "MIR",
        "ZAUPANJE",
        "SPROŠČENOST",
        "UGODJE",
        "VESELJE",
        "RAVNOVESJE",
        "STABILNOST",
        "SPANEC"
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
              {category.title && (
                <h3 className="text-xl md:text-2xl font-bold mb-6 leading-tight">
                  {category.title}
                </h3>
              )}
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div key={idx} className="text-sm md:text-base font-medium">
                    {item}
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
