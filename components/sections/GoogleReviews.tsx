'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { companyData } from '@/lib/companyData';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
}

export default function GoogleReviews() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      if (data.reviews) {
        setReviews(data.reviews.slice(0, 6)); // Show max 6 reviews
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
              alt="Google" 
              className="h-6"
            />
            <span className="text-gray-600 font-medium">Ocene</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#00B5AD]/5 to-[#B8D52E]/5 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <Quote className="text-[#00B5AD] mb-4" size={32} />
              <p className="text-gray-700 mb-6 italic line-clamp-4">{review.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{review.author_name}</p>
                  {review.relative_time_description && (
                    <p className="text-sm text-gray-500">{review.relative_time_description}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Link to Google Maps */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href={companyData.googleMaps.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#00B5AD] text-[#00B5AD] font-semibold rounded-lg hover:bg-[#00B5AD] hover:text-white transition-colors"
          >
            <span>Oglejte si vse ocene na Google</span>
            <ExternalLink size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
