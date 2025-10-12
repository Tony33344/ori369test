'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Category Cards Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Black Card - Issues */}
          <div className="bg-black text-white p-6 rounded-lg">
            <div className="space-y-1 text-sm font-medium">
              <div>IZGORELOST / STRES / STRAH</div>
              <div>ANKSIOZNOST / BOLEČINA</div>
              <div>DEPRESIJA / TESNOBA</div>
              <div>PANIKA / NESPEČNOST</div>
            </div>
          </div>

          {/* Lime Card - Therapies */}
          <div className="bg-[#B8D52E] text-black p-6 rounded-lg">
            <div className="space-y-1 text-sm font-medium">
              <div>DIHANJE / ZAVESTNO GIBANJE</div>
              <div>SVETA MEDICINA / MANUALNA TERAPIJA</div>
              <div>TECAR STIMULACIJA / LASER</div>
              <div>MAGNETNA TERAPIJA / SUHA SVETLOBA</div>
              <div>UDARNI VALOVI / TRAKCIJA</div>
              <div>FREKVENČNA TERAPIJA / ZVOK</div>
            </div>
          </div>

          {/* Turquoise Card - Benefits */}
          <div className="bg-[#00B5AD] text-white p-6 rounded-lg">
            <div className="space-y-1 text-sm font-medium">
              <div>POGUM / MIR / ZAUPANJE</div>
              <div>SPROŠČENOST / UGODJE</div>
              <div>VESELJE / RAVNOVESJE</div>
              <div>STABILNOST / SPANEC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & About */}
            <div>
              <Image 
                src="/logo.png" 
                alt="ORI 369" 
                width={220}
                height={90}
                className="h-16 w-auto mb-4"
              />
              <p className="text-sm text-gray-600 mt-4">
                Celostna pot do zdravja in dobrega počutja
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">Kontakt</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-[#00B5AD]" />
                  <a href="mailto:Info@ori369.com" className="hover:text-[#00B5AD] transition-colors">
                    Info@ori369.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-[#00B5AD]" />
                  <a href="tel:+38641458931" className="hover:text-[#00B5AD] transition-colors">
                    +386 41 458 931
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-[#00B5AD]" />
                  <a href="tel:051302206" className="hover:text-[#00B5AD] transition-colors">
                    051 302 206
                  </a>
                </div>
                <div className="flex items-start space-x-2 mt-3">
                  <MapPin size={16} className="mt-1 text-[#00B5AD]" />
                  <span>Šola Maksimilijana Držečnika 11<br />2000 Maribor, Slovenija</span>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">Delovni čas</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-black">Ponedeljek–Petek:</p>
                  <p>07.00–14.00</p>
                  <p>16.00–21.00</p>
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-black">Sobota:</p>
                  <p>08.00–14.00</p>
                </div>
              </div>
            </div>

            {/* Social & Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">Sledite nam</h3>
              <div className="flex space-x-3 mb-6">
                <a
                  href="https://www.facebook.com/profile.php?id=61569699862375"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#00B5AD] text-white rounded-full hover:bg-[#009891] transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.instagram.com/ori_backtolife"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#00B5AD] text-white rounded-full hover:bg-[#009891] transition-colors"
                >
                  <Instagram size={18} />
                </a>
              </div>
              
              <div className="space-y-2 text-sm">
                <Link href="/o-nas" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  O nas
                </Link>
                <Link href="/terapije" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  Terapije
                </Link>
                <Link href="/paketi" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  Paketi
                </Link>
                <Link href="/kontakt" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ORI 369. Vse pravice pridržane.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
