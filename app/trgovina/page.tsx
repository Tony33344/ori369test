'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Star, Package, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/components/CartProvider';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

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
    
    // Show added animation
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
    
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

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const byCategory: Record<string, any[]> = {};
  filteredProducts.forEach((p) => {
    const key = p.category_id || 'uncategorized';
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(p);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Nalagam izdelke...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            Premium Izdelki za Vaše Zdravje
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-4">
            Trgovina
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prehranska dopolnila, funkcionalne gobe, homeopatija, zeliščni pripravki in premium CBD izdelki.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Išči izdelke..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  !selectedCategory 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Vse
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-teal-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'izdelek' : 'izdelkov'}
            {searchQuery && ` za "${searchQuery}"`}
          </div>
        </div>

        {/* Products Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Ni kategorij. Seeding v teku...</p>
          </div>
        ) : (
          (selectedCategory ? [categories.find(c => c.id === selectedCategory)].filter(Boolean) : categories).map((cat) => (
            <section key={cat.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-green-500 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{cat.name}</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {(byCategory[cat.id] || []).length} izdelkov
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(byCategory[cat.id] || []).length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <Package size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">Ni izdelkov v tej kategoriji</p>
                  </div>
                ) : (
                  (byCategory[cat.id] || []).map((p) => (
                    <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <Link href={`/trgovina/${p.slug}`}>
                        <div className="relative">
                          {p.image_url ? (
                            <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={p.image_url} 
                                alt={p.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          ) : (
                            <div className="h-56 w-full bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center">
                              <Package size={48} className="text-teal-300" />
                            </div>
                          )}
                          
                          {/* Badge for stock status */}
                          {p.stock_quantity !== null && p.stock_quantity <= 5 && p.stock_quantity > 0 && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Samo še {p.stock_quantity}!
                            </div>
                          )}
                          {p.stock_quantity === 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Razprodano
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="p-5">
                        <Link href={`/trgovina/${p.slug}`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                            {p.name}
                          </h3>
                        </Link>
                        
                        {p.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-teal-600">
                              €{Number(p.price || 0).toFixed(2)}
                            </span>
                            {p.compare_at_price && p.compare_at_price > p.price && (
                              <span className="text-sm text-gray-400 line-through">
                                €{Number(p.compare_at_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(p);
                            }}
                            disabled={p.stock_quantity === 0}
                            className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                              addedProducts.has(p.id)
                                ? 'bg-green-500 text-white'
                                : p.stock_quantity === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:shadow-lg hover:scale-105'
                            }`}
                            title="Dodaj v košarico"
                          >
                            {addedProducts.has(p.id) ? (
                              <>
                                <Check size={18} />
                                Dodano!
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                V košarico
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))
        )}

        {filteredProducts.length === 0 && searchQuery && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Ni rezultatov za "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-teal-600 font-medium hover:underline"
            >
              Počisti iskanje
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
