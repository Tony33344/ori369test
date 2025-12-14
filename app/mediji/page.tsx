'use client';

import { Facebook, Instagram, Youtube, ExternalLink, Newspaper, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { companyData } from '@/lib/companyData';
import Link from 'next/link';

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/ori369therapy',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Sledite nam na Facebooku za novice in dogodke',
    followers: '500+',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/ori369therapy',
    icon: Instagram,
    color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500',
    description: 'Oglejte si naše zgodbe in fotografije',
    followers: '1.2k',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@ori369therapy',
    icon: Youtube,
    color: 'bg-red-600 hover:bg-red-700',
    description: 'Glejte naše video vsebine in izobraževanja',
    followers: '200+',
  },
];

const pressArticles = [
  {
    title: 'ORI 369 - Celostni pristop k zdravju',
    source: 'Večer',
    date: '2024-10-15',
    url: '#',
    excerpt: 'V Mariboru deluje center ORI 369, ki združuje sodobne terapevtske pristope z energijskim zdravljenjem.',
  },
  {
    title: 'Frekvence 3-6-9 in njihov vpliv na zdravje',
    source: 'Delo',
    date: '2024-09-20',
    url: '#',
    excerpt: 'Intervju z ustanoviteljem centra ORI 369 o pomenu frekvenc v terapevtskem procesu.',
  },
  {
    title: 'Nove terapevtske metode v Sloveniji',
    source: 'RTV Slovenija',
    date: '2024-08-10',
    url: '#',
    excerpt: 'Predstavitev inovativnih terapevtskih pristopov, ki jih ponuja center ORI 369.',
  },
];

export default function MediaPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('media.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('media.subtitle')}
            </p>
          </div>

          {/* Social Media Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-8 h-1 bg-[#00B5AD] rounded"></span>
              {t('media.socialMedia')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`${social.color} p-6 text-white`}>
                    <social.icon size={48} className="mb-2" />
                    <h3 className="text-xl font-bold">{social.name}</h3>
                    <p className="text-sm opacity-90">{social.followers} sledilcev</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{social.description}</p>
                    <span className="inline-flex items-center text-[#00B5AD] font-semibold">
                      Sledite nam <ExternalLink size={16} className="ml-2" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Google Reviews Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-8 h-1 bg-[#00B5AD] rounded"></span>
              Google Ocene
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
                    alt="Google" 
                    className="h-8"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="text-yellow-400 fill-current" size={24} />
                      ))}
                    </div>
                    <p className="text-gray-600">5.0 ocena na podlagi 50+ ocen</p>
                  </div>
                </div>
                <a
                  href={companyData.googleMaps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#00B5AD] text-white rounded-lg hover:bg-[#009891] transition-colors flex items-center gap-2"
                >
                  Oglejte si vse ocene
                  <ExternalLink size={18} />
                </a>
              </div>
              
              <p className="text-gray-600">
                Naši klienti nas ocenjujejo z najvišjimi ocenami. Preberite njihove izkušnje in mnenja na Google Maps.
              </p>
            </div>
          </section>

          {/* Press Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-8 h-1 bg-[#00B5AD] rounded"></span>
              {t('media.pressReleases')}
            </h2>
            
            <div className="space-y-6">
              {pressArticles.map((article, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Newspaper className="text-gray-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-[#00B5AD]">{article.source}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(article.date).toLocaleDateString('sl-SI', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600">{article.excerpt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact for Media */}
          <section className="bg-gradient-to-br from-[#00B5AD] to-[#009891] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Medijski stiki</h2>
            <p className="mb-6 opacity-90">
              Za medijske poizvedbe, intervjuje ali sodelovanje nas kontaktirajte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${companyData.email}`}
                className="px-6 py-3 bg-white text-[#00B5AD] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {companyData.email}
              </a>
              <Link
                href="/kontakt"
                className="px-6 py-3 bg-black/20 text-white rounded-lg font-semibold hover:bg-black/30 transition-colors"
              >
                Kontaktni obrazec
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
