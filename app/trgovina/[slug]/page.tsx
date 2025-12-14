'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/components/CartProvider';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  active: boolean;
  image_url: string | null;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data: prod, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error || !prod) {
        toast.error('Product not found');
        return;
      }

      setProduct(prod);

      // Load category
      const { data: cat } = await supabase
        .from('shop_categories')
        .select('*')
        .eq('id', prod.category_id)
        .single();

      setCategory(cat);
    } catch (error) {
      toast.error('Failed to load product');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <Link href="/trgovina" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft size={20} />
            <span>Back to Shop</span>
          </Link>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">This product is no longer available.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error('Ni dovolj zaloge');
      return;
    }
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: Number(product.price),
      image: product.image_url || undefined,
      slug: product.slug,
    }, quantity);
    toast.success(`Dodano v košarico: ${quantity}x ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/trgovina" className="hover:text-blue-600">Shop</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/trgovina?category=${category.slug}`} className="hover:text-blue-600">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link href="/trgovina" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft size={20} />
          <span>Back to Shop</span>
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="flex items-center justify-center bg-white rounded-lg shadow-lg p-8">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto max-h-96 object-contain"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                <ImageIcon size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {category && (
                <p className="text-gray-600">
                  Category: <span className="font-medium">{category.name}</span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">Price</p>
              <p className="text-4xl font-bold text-blue-600">
                €{Number(product.price).toFixed(2)}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Stock Status */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Availability</p>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={product.stock > 0 ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
              </div>
            )}

            {product.stock === 0 && (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-4 rounded-lg font-semibold cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Shopping</h2>
          <Link
            href="/trgovina"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
