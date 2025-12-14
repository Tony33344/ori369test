"use client";

import { CheckCircle, Zap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function MotioScanPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#00B5AD] to-[#00B5AD]/80 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">MotioScan</h1>
          <p className="text-2xl md:text-3xl font-semibold mb-6">3D Analiza Telesne Drže</p>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            <strong>NE UGIBAJ. IZMERI.</strong>
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-95">
            Odkrij natančno stanje svojega telesa z inovativno 3D tehnologijo, ki v nekaj sekundah razkrije tvoje skrite asimetrije, obremenitve in neravnovesja.
          </p>
          <Link
            href="/rezervacija?package=motioscan"
            className="inline-block px-8 py-4 bg-white text-[#00B5AD] font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Naroči svoj termin
          </Link>
        </div>
      </section>

      {/* What is MotioScan */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Kaj je MotioScan?</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              MotioScan (Moti Physio) je napredna 3D naprava za natančno oceno telesne drže, ki s pomočjo vizualnih markerjev in računalniške analitike zajame:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                "24 ključnih anatomskih točk",
                "več kot 87 mišičnih asimetrij",
                "rotacije, nagibe in nepravilne obremenitve",
                "odstopanja hrbtenice, medenice in lopatic",
                "statično in dinamično stabilnost"
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckCircle className="text-[#00B5AD] flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-lg font-semibold text-gray-900 p-4 bg-white rounded-lg border-2 border-[#00B5AD]">
              Brez sevanja. Brez bolečin. Brez ugibanja. Samo natančni podatki.
            </p>
          </div>
        </div>
      </section>

      {/* Why MotioScan */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Zakaj je MotioScan tako učinkovit?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Zap className="text-[#B8D52E]" size={32} />,
                title: "Objektivna meritev",
                desc: "Naprava naredi objektivno, natančno meritev – v številkah in 3D modelu, ne na občutku."
              },
              {
                icon: <TrendingUp className="text-[#00B5AD]" size={32} />,
                title: "Odkrije skrite probleme",
                desc: "Mikrozasuki, rotacije, kompenzacije, zakasnitve aktivacij, asimetrije – vse vidno črno na belem."
              },
              {
                icon: <Users className="text-[#B8D52E]" size={32} />,
                title: "Točen terapevtski protokol",
                desc: "Na podlagi rezultatov določimo šibke, preobremenjene in kompenzacijske mišice ter realno stanje sklepov."
              },
              {
                icon: <CheckCircle className="text-[#00B5AD]" size={32} />,
                title: "Merljiv napredek",
                desc: "Pred → po … videno črno na belem. Motivacija postane realnost."
              }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Kako poteka MotioScan analiza?</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { step: 1, title: "Scan (30–60 sekund)", desc: "Snemanje poteka stoje, naravno, brez posebne priprave." },
              { step: 2, title: "3D model", desc: "Sistem izriše tvojo držo v digitalnem formatu." },
              { step: 3, title: "Analiza neravnovesij", desc: "Višinske razlike, nagibi, rotacije, zamiki, obremenitve, stabilnost." },
              { step: 4, title: "Razlaga rezultatov", desc: "Terapevt predstavi stanje telesa jasno in razumljivo." },
              { step: 5, title: "Protokol povratka", desc: "Manualna korekcija, somatske vaje, stabilizacija, mobilnost, dihanje, terapija drže, terapije ORI." }
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#00B5AD] text-white font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Komu je namenjen?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              "Športnikom (rekreativnim in profesionalnim)",
              "Ljudem z bolečinami v hrbtu, vratu, medenici",
              "Osebam po poškodbah",
              "Sedentarno obremenjenim posameznikom",
              "Vsem, ki želijo optimizirati držo, dih in gibanje",
              "Vsakomur, ki želi profesionalno oceno telesnega stanja"
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-[#00B5AD]/10 to-[#B8D52E]/10 p-6 rounded-lg border border-[#00B5AD]/20">
                <p className="text-gray-900 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-br from-[#00B5AD]/5 to-[#B8D52E]/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Kaj pridobiš?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              "Jasno sliko svojega telesa",
              "Identifikacijo skritih težav",
              "Preprečevanje prihodnjih poškodb",
              "Optimizacijo drže in gibanja",
              "Več energije in manj napetosti",
              "Hitrejšo regeneracijo in večjo stabilnost",
              "Individualni terapevtski protokol",
              "Merljiv napredek"
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                <CheckCircle className="text-[#00B5AD] flex-shrink-0" size={24} />
                <span className="text-gray-900 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#00B5AD] to-[#00B5AD]/80 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">NE UGIBAJ. IZMERI.</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            MotioScan ti pokaže realno stanje tvojega telesa. Mi pa poskrbimo za pot nazaj v ravnovesje.
          </p>
          <Link
            href="/rezervacija?package=motioscan"
            className="inline-block px-10 py-4 bg-white text-[#00B5AD] font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Naroči svoj termin zdaj
          </Link>
        </div>
      </section>
    </div>
  );
}
