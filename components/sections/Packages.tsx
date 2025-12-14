'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';

interface Package {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  sessions: number;
  price: number | null;
  regularPrice?: number;
}

export default function Packages({ packages }: { packages: Package[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [serviceIds, setServiceIds] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchServiceIds = async () => {
      const supabase = createClient();
      const slugs = packages.map(pkg => pkg.id);
      
      const { data: services } = await supabase
        .from('services')
        .select('id, slug')
        .in('slug', slugs)
        .eq('active', true);

      if (services) {
        const idMap: Record<string, string> = {};
        services.forEach((service: any) => {
          idMap[service.slug] = service.id;
        });
        setServiceIds(idMap);
      }
    };

    fetchServiceIds();
  }, [packages]);

  const handleBuyNow = async (packageSlug: string, packageName: string) => {
    const serviceId = serviceIds[packageSlug];
    if (!serviceId) {
      toast.error('Storitev ni na voljo');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [packageSlug]: true }));

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          language: 'sl',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Za nakup se morate najprej prijaviti');
          router.push('/prijava');
          return;
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Napaka pri ustvarjanju naročila. Poskusite znova.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [packageSlug]: false }));
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#00B5AD]/20"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-black mb-3">{pkg.name}</h3>
                <p className="text-gray-600 mb-6">{pkg.description}</p>

                <div className="mb-6">
                  {pkg.price ? (
                    <div>
                      {pkg.regularPrice && (
                        <div className="text-sm text-gray-500 line-through mb-1">
                          {t('packages.regularPriceLabel')}: €{pkg.regularPrice}
                        </div>
                      )}
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span className="text-4xl font-bold text-[#00B5AD]">€{pkg.price}</span>
                        {pkg.sessions > 0 && <span className="text-gray-600">/ {pkg.sessions} {t('packages.sessionsUnit')}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600 italic mb-2">{t('packages.priceInquiry')}</div>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  {pkg.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/rezervacija?package=${pkg.id}`}
                    className="flex items-center justify-center w-full py-3 bg-[#00B5AD] hover:bg-[#009891] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    {t('packages.bookPackage')}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
