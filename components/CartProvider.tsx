'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, getCart, addToCart as addToCartLib, removeFromCart as removeFromCartLib, updateCartItemQuantity as updateQuantityLib, clearCart as clearCartLib, getCartTotal, getCartItemCount } from '@/lib/cart';

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: '' });
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getCart());
  }, []);

  // Listen for cart updates from other tabs/components
  useEffect(() => {
    const handleCartUpdate = (e: CustomEvent<Cart>) => {
      setCart(e.detail);
    };

    window.addEventListener('cart-updated', handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
    };
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const updatedCart = addToCartLib(item, quantity);
    setCart(updatedCart);
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    const updatedCart = removeFromCartLib(itemId);
    setCart(updatedCart);
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const updatedCart = updateQuantityLib(itemId, quantity);
    setCart(updatedCart);
  }, []);

  const clearCart = useCallback(() => {
    const updatedCart = clearCartLib();
    setCart(updatedCart);
  }, []);

  const total = getCartTotal(cart);
  const itemCount = getCartItemCount(cart);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
