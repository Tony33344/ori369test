'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

export default function TransformationJourney() {
  const { t } = useLanguage();

  const symptoms = [
    'burnout', 'stress', 'fear', 'anxiety', 'pain', 
    'depression', 'distress', 'panic', 'insomnia'
  ];

  const methods = [
    'breathing', 'movement', 'medicine', 'manual', 'tecar',
    'laser', 'magnetic', 'dryLight', 'shockwave', 'traction',
    'frequency', 'sound'
  ];

  const outcomes = [
    'courage', 'peace', 'trust', 'relaxation', 'comfort',
    'joy', 'balance', 'stability', 'sleep'
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-4 tracking-wider uppercase">
            {t('categories.pathTitle')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-2xl">
          {/* BLACK BOX - Symptoms */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-black text-white p-8 md:p-10"
          >
            <div className="h-full flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 uppercase tracking-wide border-b-4 border-white pb-4">
                Kaj vas pripelje
              </h3>
              <div className="flex-grow">
                <div className="space-y-3">
                  {symptoms.map((symptom, index) => (
                    <motion.div
                      key={symptom}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                      className="text-base md:text-lg font-semibold tracking-wider uppercase"
                    >
                      {t(`categories.symptoms.${symptom}`)}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* YELLOW-GREEN BOX - Methods */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#B8D52E] text-black p-8 md:p-10"
          >
            <div className="h-full flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 uppercase tracking-wide border-b-4 border-black pb-4">
                Kako delujemo skupaj
              </h3>
              <div className="flex-grow">
                <div className="space-y-3">
                  {methods.map((method, index) => (
                    <motion.div
                      key={method}
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.04 }}
                      className="text-base md:text-lg font-semibold tracking-wider uppercase"
                    >
                      {t(`categories.methods.${method}`)}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* TURQUOISE BOX - Outcomes */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#00B5AD] text-white p-8 md:p-10"
          >
            <div className="h-full flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 uppercase tracking-wide border-b-4 border-white pb-4">
                Kam vas vodimo
              </h3>
              <div className="flex-grow">
                <div className="space-y-3">
                  {outcomes.map((outcome, index) => (
                    <motion.div
                      key={outcome}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                      className="text-base md:text-lg font-semibold tracking-wider uppercase"
                    >
                      {t(`categories.outcomes.${outcome}`)}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto">
            Vsaka pot se začne s prvim korakom. Skupaj bomo našli pravo pot do vašega ravnovesja.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
