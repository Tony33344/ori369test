'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, Package, Clock, Euro } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { getDataForLanguage } from '@/lib/data-loader';

export default function PricingPage() {
  const { language } = useLanguage();
  const data = getDataForLanguage(language);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 tracking-wide">
            Cenik storitev
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Transparentne cene za vse naše terapevtske storitve in pakete
          </p>
        </motion.div>

        {/* Introduction Session */}
        {data.pricing?.intro_session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 bg-gradient-to-r from-[#00B5AD] to-[#00B5AD]/80 text-white rounded-2xl p-8"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {data.pricing.intro_session.name}
              </h2>
              <p className="text-white/90 text-lg mb-6">
                {data.pricing.intro_session.description}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Euro size={32} />
                <span className="text-4xl font-bold">{data.pricing.intro_session.price}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ORI 369 Packages Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
              ORI 369 – Cenik
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Energetsko poravnan v 3/6/9
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.pricing?.packages?.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#00B5AD]/20"
              >
                <div className="bg-gradient-to-r from-[#00B5AD] to-[#00B5AD]/80 text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-white/90">
                    <Package size={18} />
                    <span>{pkg.sessions} obravnav</span>
                  </div>
                  {pkg.vibration && (
                    <div className="mt-2 inline-block bg-white/20 text-xs px-3 py-1 rounded-full">
                      Vibracija {pkg.vibration}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Ključne koristi:
                    </h4>
                    <div className="space-y-2">
                      {pkg.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Check className="text-green-500 flex-shrink-0 mt-1" size={18} />
                          <span className="text-gray-700 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <Euro className="text-[#00B5AD]" size={24} />
                        <span className="text-3xl font-bold text-[#00B5AD]">
                          {pkg.total_price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Cena na obravnavo: €{pkg.price_per_session}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/rezervacija"
                    className="block w-full py-3 bg-[#00B5AD] hover:bg-[#009891] text-white font-semibold rounded-lg text-center transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Naroči se na termin
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explanation Section */}
          {data.pricing?.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16 bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-black mb-6">Zakaj te številke delujejo</h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                {data.pricing.explanation.why_numbers_work}
              </p>
              
              <div className="bg-[#B8D52E]/10 rounded-xl p-6 mb-8">
                <h4 className="text-xl font-bold text-black mb-4">Zakaj ORI 369 deluje</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {data.pricing.explanation.why_ori369_works}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {data.pricing.explanation.simple_comparison}
                </p>
              </div>

              {/* Technologies Section */}
              {data.pricing.technologies && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h5 className="font-bold text-black mb-3">Regeneracija in biostimulacija</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {data.pricing.technologies.regeneration_and_biostimulation.map((tech, idx) => (
                        <li key={idx}>• {tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-black mb-3">Podpora hrbtenici</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {data.pricing.technologies.spine_and_structure_support.map((tech, idx) => (
                        <li key={idx}>• {tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-black mb-3">Frekvenčna harmonizacija</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {data.pricing.technologies.frequency_and_energy_harmonization.map((tech, idx) => (
                        <li key={idx}>• {tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-black mb-3">Nevroreset in integracija</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {data.pricing.technologies.neuroreset_relaxation_and_integration.map((tech, idx) => (
                        <li key={idx}>• {tech}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Legacy Individual Therapies Section */}
        {data.therapies && data.therapies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center space-x-3 mb-8">
              <Zap className="text-[#00B5AD]" size={32} />
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                Dodatne terapije
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.therapies.map((therapy, index) => (
                <motion.div
                  key={therapy.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-black mb-2">
                    {therapy.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {therapy.shortDescription}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">{therapy.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Euro className="text-[#00B5AD]" size={20} />
                      <span className="text-2xl font-bold text-[#00B5AD]">
                        {therapy.price}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/terapije/${therapy.id}`}
                    className="block w-full py-2 text-center bg-gray-100 hover:bg-[#00B5AD] hover:text-white text-gray-700 rounded-lg transition-all duration-200 text-sm font-semibold"
                  >
                    Več informacij
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Legacy Packages Section (if any) */}
        {data.packages && data.packages.length > 0 && data.pricing?.packages?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Package className="text-[#00B5AD]" size={32} />
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                Terapevtski paketi
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {data.packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#00B5AD]/20"
                >
                  <div className="bg-gradient-to-r from-[#00B5AD] to-[#00B5AD]/80 text-white p-6">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                      {pkg.name}
                    </h3>
                    {pkg.sessions > 0 && (
                      <p className="text-white/90 text-sm">
                        {pkg.sessions} seans
                      </p>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Ključne koristi:
                      </h4>
                      <div className="space-y-2">
                        {pkg.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <Check className="text-green-500 flex-shrink-0 mt-1" size={18} />
                            <span className="text-gray-700 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {pkg.price ? (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        {pkg.regularPrice && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm">Redna cena:</span>
                            <span className="text-gray-400 line-through text-lg">
                              €{pkg.regularPrice}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Cena:</span>
                          <div className="flex items-center space-x-1">
                            <Euro className="text-[#00B5AD]" size={24} />
                            <span className="text-3xl font-bold text-[#00B5AD]">
                              {pkg.price}
                            </span>
                          </div>
                        </div>
                        {pkg.regularPrice && (
                          <div className="mt-2 text-right">
                            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                              Prihranek: €{pkg.regularPrice - pkg.price}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#B8D52E]/10 rounded-xl p-4 mb-4 text-center">
                        <span className="text-gray-700 font-semibold">
                          Cena na poizvedbo
                        </span>
                      </div>
                    )}

                    <Link
                      href="/rezervacija"
                      className="block w-full py-3 bg-[#00B5AD] hover:bg-[#009891] text-white font-semibold rounded-lg text-center transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Rezervirajte paket
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-black mb-4">
            Imate vprašanja o cenah ali storitvah?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Naša ekipa je na voljo za odgovore na vaša vprašanja in pomoč pri izbiri 
            najprimernejše terapije ali paketa za vaše potrebe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/kontakt"
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Kontaktirajte nas
            </Link>
            <Link
              href="/rezervacija"
              className="px-8 py-3 bg-[#00B5AD] hover:bg-[#009891] text-white font-semibold rounded-lg transition-all duration-200"
            >
              Rezervirajte termin
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
