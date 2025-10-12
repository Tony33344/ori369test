'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Clock, ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  shortDescription: string;
  duration: number;
  price: number;
}

export default function Services({ services }: { services: Service[] }) {
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
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-wide">
            Naše terapije
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Odkrijte celoten nabor naših terapevtskih storitev za optimalno zdravje in dobro počutje.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#00B5AD]/20 flex flex-col"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="text-[#00B5AD]" size={28} />
                <h3 className="text-xl font-bold text-black">{service.name}</h3>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed flex-grow">{service.shortDescription}</p>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{service.duration} min</span>
                </div>
                <div className="text-[#00B5AD] font-bold text-lg">€{service.price}</div>
              </div>
              <Link
                href={`/terapije/${service.id}`}
                className="inline-flex items-center justify-center text-[#00B5AD] hover:text-[#009891] font-semibold transition-colors group"
              >
                Več informacij
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
