'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/components/CartProvider';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      type: 'product',
      image: product.image_url,
    }, 1);
    toast.success(`${product.name} dodan v košarico`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase
        .from('shop_categories')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      const { data: prods } = await supabase
        .from('shop_products')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      setCategories(cats || []);
      setProducts(prods || []);
    } catch (error) {
      console.error('Failed to load shop data:', error);
    }
    setLoading(false);
  };

  const byCategory: Record<string, any[]> = {};
  (products || []).forEach((p) => {
    const key = p.category_id || 'uncategorized';
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(p);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Trgovina</h1>
          <p className="text-lg text-gray-600">
            Prehranska dopolnila, funkcionalne gobe, homeopatija, zeliščni pripravki in premium CBD.
          </p>
        </div>

        {(categories || []).length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p>Ni kategorij. Seeding v teku...</p>
          </div>
        ) : (
          (categories || []).map((cat) => (
            <section key={cat.id} className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{cat.name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(byCategory[cat.id] || []).length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Ni izdelkov v tej kategoriji
                  </div>
                ) : (
                  (byCategory[cat.id] || []).map((p) => (
                    <Link key={p.id} href={`/trgovina/${p.slug}`}>
                      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                        {p.image_url ? (
                          <div className="relative h-48 w-full bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-48 w-full bg-gradient-to-br from-[#00B5AD]/10 to-[#B8D52E]/10 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Brez slike</span>
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.name}</h3>
                          {p.description && (
                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{p.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-[#00B5AD] font-bold">€{Number(p.price || 0).toFixed(2)}</div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(p);
                              }}
                              className="px-4 py-2 text-sm font-semibold text-white bg-[#00B5AD] rounded-lg hover:bg-[#009891] transition-colors flex items-center gap-1"
                              title="Dodaj v košarico"
                            >
                              <ShoppingCart size={16} />
                              Kupi
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          ))
        )}

        {(!categories || categories.length === 0) && (
          <div className="text-center text-gray-600">
            Ni kategorij. Kot admin lahko zaženete seed: <code>/api/shop/seed</code>
          </div>
        )}
      </div>
    </div>
  );
}
