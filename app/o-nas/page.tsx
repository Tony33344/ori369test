import { Heart, Target, Sparkles, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6">
            O nas
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Spoznajte ORI 369 - Vaš most med znanostjo in energijo
          </p>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              V ORI 369 združujemo vrhunske terapevtske pristope, najnovejše tehnologije in globoko razumevanje 
              frekvenc 3-6-9, da vam pomagamo doseči ravnovesje telesa, uma in duha. Naš cilj je izboljšati 
              kakovost vašega življenja skozi celostni pristop k zdravljenju.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              With compassion, expertise, and a focus on your unique needs, we're committed to helping you 
              thrive—mind, body, and spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#00B5AD]/10 to-[#00B5AD]/5 p-8 rounded-xl border border-[#00B5AD]/20">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="text-[#00B5AD]" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Naša misija</h3>
              </div>
              <p className="text-gray-700">
                Pomagati vam doseči optimalno zdravje in dobro počutje z uporabo najnovejših tehnologij 
                in holistične terapevtske pristope.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#B8D52E]/10 to-[#B8D52E]/5 p-8 rounded-xl border border-[#B8D52E]/20">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="text-[#B8D52E]" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Naša vizija</h3>
              </div>
              <p className="text-gray-700">
                Postati vodilni center za celostno zdravje in wellness v regiji, kjer znanost sreča 
                duhovno rast.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#00B5AD]/10 to-[#B8D52E]/10 p-8 rounded-xl border border-[#00B5AD]/20">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="text-[#00B5AD]" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Naše vrednote</h3>
              </div>
              <p className="text-gray-700">
                Sočutje, strokovnost, integriteta in predanost vašemu osebnem razvoju in zdravju.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#B8D52E]/10 to-[#00B5AD]/10 p-8 rounded-xl border border-[#B8D52E]/20">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="text-[#B8D52E]" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Naša ekipa</h3>
              </div>
              <p className="text-gray-700">
                Tim certificiranih terapevtov z bogatimi izkušnjami na področju fizioterapije, 
                energijske medicine in holistične zdravilstva.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#00B5AD] to-[#00B5AD]/80 text-white p-8 rounded-2xl text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Frekvence 3-6-9</h3>
            <p className="text-lg leading-relaxed">
              Naše delo temelji na razumevanju univerzalnih frekvenc 3-6-9, ki jih je raziskoval Nikola Tesla. 
              Te frekvence predstavljajo ključ do razumevanja vesolja in naše lastne energije. V naših terapijah 
              jih uporabljamo za harmonizacijo telesa in uma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
