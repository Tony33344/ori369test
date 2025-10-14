'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t, translations } = useLanguage();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Category Cards Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Black Card - Issues */}
          <div className="bg-black text-white p-6 rounded-lg">
            <div className="space-y-1 text-sm font-medium">
              <div>{t('categories.symptoms.burnout')} / {t('categories.symptoms.stress')} / {t('categories.symptoms.fear')}</div>
              <div>{t('categories.symptoms.anxiety')} / {t('categories.symptoms.pain')}</div>
              <div>{t('categories.symptoms.depression')} / {t('categories.symptoms.distress')}</div>
              <div>{t('categories.symptoms.panic')} / {t('categories.symptoms.insomnia')}</div>
            </div>
          </div>

          {/* Lime Card - Therapies */}
          <div className="bg-[#B8D52E] text-black p-6 rounded-lg">
            <div className="space-y-1 text-sm font-medium">
              <div>{t('categories.methods.breathing')} / {t('categories.methods.movement')}</div>
              <div>{t('categories.methods.medicine')} / {t('categories.methods.manual')}</div>
              <div>{t('categories.methods.tecar')} / {t('categories.methods.laser')}</div>
              <div>{t('categories.methods.magnetic')} / {t('categories.methods.dryLight')}</div>
              <div>{t('categories.methods.shockwave')} / {t('categories.methods.traction')}</div>
              <div>{t('categories.methods.frequency')} / {t('categories.methods.sound')}</div>
            </div>
          </div>

          {/* Turquoise Card - Benefits */}
          <div className="bg-[#00B5AD] text-white p-6 rounded-lg">
            <div className="space-y-1 text-sm font-medium">
              <div>{t('categories.outcomes.courage')} / {t('categories.outcomes.peace')} / {t('categories.outcomes.trust')}</div>
              <div>{t('categories.outcomes.relaxation')} / {t('categories.outcomes.comfort')}</div>
              <div>{t('categories.outcomes.joy')} / {t('categories.outcomes.balance')}</div>
              <div>{t('categories.outcomes.stability')} / {t('categories.outcomes.sleep')}</div>
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
                {t('footer.tagline')}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">{t('footer.contactInfo')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-[#00B5AD]" />
                  <a href="mailto:Info@ori369.com" className="hover:text-[#00B5AD] transition-colors">
                    Info@ori369.com
                  </a>
                </div>
                {translations.site?.phone?.map((phone: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Phone size={16} className="text-[#00B5AD]" />
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-[#00B5AD] transition-colors">
                      {phone}
                    </a>
                  </div>
                ))}
                <div className="flex items-start space-x-2 mt-3">
                  <MapPin size={16} className="mt-1 text-[#00B5AD]" />
                  <a 
                    href="https://www.google.com/maps/place/ORI+369+Only+right+information+therapy+center/@46.5598601,15.647895,793m/data=!3m2!1e3!4b1!4m6!3m5!1s0x476f770077b610ad:0x56dd118d4f3d3dca!8m2!3d46.5598564!4d15.6504699!16s%2Fg%2F11x3988330?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00B5AD] transition-colors"
                  >
                    {translations.site?.address}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">{t('contact.hours')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-black">{t('contact.weekdays')}:</p>
                  <p>{translations.site?.hours?.weekdays}</p>
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-black">{t('contact.saturday')}:</p>
                  <p>{translations.site?.hours?.saturday}</p>
                </div>
              </div>
            </div>

            {/* Social & Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">{t('footer.followUs')}</h3>
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
                  {t('nav.about')}
                </Link>
                <Link href="/terapije" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  {t('nav.therapies')}
                </Link>
                <Link href="/paketi" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  {t('nav.packages')}
                </Link>
                <Link href="/kontakt" className="block text-gray-600 hover:text-[#00B5AD] transition-colors">
                  {t('nav.contact')}
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ORI 369. {t('footer.rights')}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
