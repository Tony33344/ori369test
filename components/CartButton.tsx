'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartProvider';

export default function CartButton() {
  const { itemCount, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Odpri košarico"
    >
      <ShoppingCart size={24} className="text-gray-700" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#00B5AD] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
