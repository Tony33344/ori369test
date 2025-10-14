'use client';

import { Mail, Phone, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { getDataForLanguage } from '@/lib/data-loader';

export default function ContactPage() {
  const { t, translations, language } = useLanguage();
  const data = getDataForLanguage(language);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            {t('contact.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('footer.contactInfo')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('contact.email')}</h3>
                    <a href={`mailto:${data.site.email}`} className="text-blue-600 hover:underline">
                      {data.site.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('contact.phone')}</h3>
                    {translations.site?.phone?.map((phone: string, idx: number) => (
                      <div key={idx}>
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
                          {phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('contact.address')}</h3>
                    <a 
                      href="https://www.google.com/maps/place/ORI+369+Only+right+information+therapy+center/@46.5598601,15.647895,793m/data=!3m2!1e3!4b1!4m6!3m5!1s0x476f770077b610ad:0x56dd118d4f3d3dca!8m2!3d46.5598564!4d15.6504699!16s%2Fg%2F11x3988330?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {translations.site?.address}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('contact.hours')}</h3>
                    <p className="text-gray-700"><strong>{t('contact.weekdays')}:</strong> {translations.site?.hours?.weekdays}</p>
                    <p className="text-gray-700"><strong>{t('contact.saturday')}:</strong> {translations.site?.hours?.saturday}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Družbeni mediji</h3>
                <div className="flex space-x-4">
                  <a
                    href={data.site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                  <a
                    href={data.site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.location')}</h2>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2756.0!2d15.6458!3d46.5547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDbCsDMzJzE2LjkiTiAxNcKwMzgnNDQuOSJF!5e0!3m2!1sen!2ssi!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-6">
                <a
                  href="https://www.google.com/maps/place/ORI+369+Only+right+information+therapy+center/@46.5598601,15.647895,793m/data=!3m2!1e3!4b1!4m6!3m5!1s0x476f770077b610ad:0x56dd118d4f3d3dca!8m2!3d46.5598564!4d15.6504699!16s%2Fg%2F11x3988330?entry=ttu&g_ep=EgoyMDI1MTAwOC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('contact.openInMaps')}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 mb-4">
              {t('contact.bookMessage')}
            </p>
            <a
              href="/rezervacija"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {t('contact.bookNow')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
