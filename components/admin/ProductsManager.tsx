'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Save, X, Plus, Upload, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  active: boolean;
  category_id: string;
  image_url: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Product>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase
        .from('shop_categories')
        .select('*')
        .order('order_index');
      setCategories(cats || []);

      const { data: prods } = await supabase
        .from('shop_products')
        .select('*')
        .order('name');
      setProducts(prods || []);
    } catch (error) {
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditingData(product);
  };

  const saveProduct = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('shop_products')
        .update({
          name: editingData.name,
          description: editingData.description,
          price: editingData.price,
          stock: editingData.stock,
          active: editingData.active,
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Product updated');
      setEditingId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  const deleteProduct = async (id: string, imageUrl: string | null) => {
    if (!confirm('Delete this product? This will also remove the product page.')) return;

    try {
      // Delete image from storage if exists
      if (imageUrl) {
        const imagePath = imageUrl.split('/').pop();
        if (imagePath) {
          await supabase.storage.from('product-images').remove([imagePath]);
        }
      }

      // Delete product
      const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Product and page deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const uploadImage = async (file: File, productId: string) => {
    try {
      console.log('📤 Starting upload for:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      const response = await fetch('/api/upload-product-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Upload successful:', result);
      toast.success('Image uploaded successfully!');
      loadData();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('shop_products')
        .update({ active: !product.active })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(product.active ? 'Product hidden' : 'Product visible');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter(p => p.category_id === filterCategory);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-semibold text-gray-700">Filter by category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price (€)</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                {editingId === product.id ? (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center space-y-2">
                        {editingData.image_url ? (
                          <img src={editingData.image_url} alt={editingData.name} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon size={24} className="text-gray-400" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                uploadImage(e.target.files[0], product.id);
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">Upload</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.price || 0}
                        onChange={(e) => setEditingData({ ...editingData, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editingData.stock || 0}
                        onChange={(e) => setEditingData({ ...editingData, stock: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingData.active || false}
                          onChange={(e) => setEditingData({ ...editingData, active: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{editingData.active ? 'Active' : 'Hidden'}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={saveProduct}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">€{Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id, product.image_url)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
