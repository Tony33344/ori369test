'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/therapies/IMG_5779-2048x1367.webp"
          alt="ORI 369 Center"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90"></div>
      </div>
      
      {/* Animated background elements - ORI 369 Brand Colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00B5AD]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#00B5AD]/15 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-[#B8D52E]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00B5AD]/10 backdrop-blur-sm rounded-full border border-[#00B5AD]/30">
              <Sparkles className="text-[#00B5AD]" size={20} />
              <span className="text-sm font-medium text-[#00B5AD] tracking-wide">Vaš most med znanostjo in energijo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-black leading-tight tracking-wider">
              ORI 369
            </h1>
            
            <div className="text-xl md:text-2xl font-medium text-[#00B5AD] tracking-[0.15em] uppercase">
              Kakovostno življenje
            </div>

            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
              V ORI 369 združujemo vrhunske terapevtske pristope, najnovejše tehnologije in globoko razumevanje frekvenc 3-6-9, da vam pomagamo doseči ravnovesje telesa, uma in duha.
            </p>

            <p className="text-lg text-gray-600 italic">
              With compassion, expertise, and a focus on your unique needs, we're committed to helping you thrive—mind, body, and spirit.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <Link
                href="/rezervacija"
                className="px-8 py-4 bg-[#00B5AD] hover:bg-[#009891] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Rezervirajte termin
              </Link>
              <Link
                href="/terapije"
                className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Raziščite terapije
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-gray-400 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
