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

        {/* Therapies Section */}
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
              Posamične terapije
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

        {/* Packages Section */}
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
                        <span className="text-gray-700 font-semibold">Akcijska cena:</span>
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
