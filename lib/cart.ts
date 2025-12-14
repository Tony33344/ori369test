// Shopping cart state management
export interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
  // For services (therapies/packages)
  bookingDate?: string;
  bookingTime?: string;
  duration?: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

const CART_STORAGE_KEY = 'ori369_cart';

export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], updatedAt: new Date().toISOString() };
  }
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
  }
  
  return { items: [], updatedAt: new Date().toISOString() };
}

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;
  
  try {
    cart.updatedAt = new Date().toISOString();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
  }
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1): Cart {
  const cart = getCart();
  
  // Check if item already exists (for products, not services with specific booking times)
  const existingIndex = cart.items.findIndex(
    (i) => i.id === item.id && i.type === item.type && !item.bookingDate
  );
  
  if (existingIndex >= 0 && item.type === 'product') {
    // Update quantity for existing product
    cart.items[existingIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({ ...item, quantity });
  }
  
  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(itemId: string, quantity: number): Cart {
  const cart = getCart();
  
  const index = cart.items.findIndex((i) => i.id === itemId);
  if (index >= 0) {
    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(itemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((i) => i.id !== itemId);
  saveCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const cart = { items: [], updatedAt: new Date().toISOString() };
  saveCart(cart);
  return cart;
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

export function getProductsFromCart(cart: Cart): CartItem[] {
  return cart.items.filter((item) => item.type === 'product');
}

export function getServicesFromCart(cart: Cart): CartItem[] {
  return cart.items.filter((item) => item.type === 'service');
}
