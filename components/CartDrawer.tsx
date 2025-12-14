'use client';

import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-[#00B5AD]" size={24} />
            <h2 className="text-xl font-bold">Košarica</h2>
            <span className="bg-[#00B5AD] text-white text-sm px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Vaša košarica je prazna</p>
              <Link
                href="/trgovina"
                onClick={() => setIsOpen(false)}
                className="inline-block mt-4 text-[#00B5AD] hover:underline"
              >
                Nadaljuj z nakupovanjem →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={`${item.id}-${item.bookingDate || ''}`}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    
                    {/* Service booking details */}
                    {item.type === 'service' && item.bookingDate && (
                      <p className="text-sm text-gray-500">
                        {item.bookingDate} ob {item.bookingTime}
                      </p>
                    )}
                    
                    <p className="text-[#00B5AD] font-bold mt-1">
                      €{item.price.toFixed(2)}
                    </p>

                    {/* Quantity controls (only for products) */}
                    {item.type === 'product' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors self-start"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Skupaj:</span>
              <span className="text-[#00B5AD]">€{total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 bg-[#00B5AD] text-white text-center font-bold rounded-lg hover:bg-[#009891] transition-colors"
            >
              Nadaljuj na blagajno
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
