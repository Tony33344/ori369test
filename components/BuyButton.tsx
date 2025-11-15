'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface BuyButtonProps {
  serviceId: string;
  serviceName: string;
  price: number;
  className?: string;
}

export default function BuyButton({ serviceId, serviceName, price, className = '' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuyNow = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuyNow}
      disabled={loading}
      className={`inline-flex items-center justify-center px-8 py-4 bg-[#00B5AD] text-white font-semibold rounded-lg hover:bg-[#009891] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingCart size={20} className="mr-2" />
      {loading ? 'Preusmerjanje...' : `Kupi zdaj - €${price.toFixed(2)}`}
    </button>
  );
}
