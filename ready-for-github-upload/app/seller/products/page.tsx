'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Search, 
  Loader2, 
  AlertCircle,
  Package,
  CheckCircle2,
  XCircle,
  Edit3
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { DbProduct } from '@/types';
import { formatINR } from '@/lib/formatters';

export default function SellerProductsPage() {
  const { sellerProfile } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    if (!sellerProfile) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load seller products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sellerProfile]);

  // Toggle Active Status
  const handleToggleActive = async (prod: DbProduct) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !prod.is_active })
        .eq('id', prod.id)
        .eq('seller_id', sellerProfile?.id);

      if (error) throw error;

      setProducts(products.map(p => p.id === prod.id ? { ...p, is_active: !p.is_active } : p));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Delete Product
  const handleDeleteConfirm = async () => {
    if (!deletingProduct || !sellerProfile) return;
    setDeleteLoading(true);

    try {
      // If product has an image stored in Supabase Storage, attempt removal
      if (deletingProduct.image_url && deletingProduct.image_url.includes('product-images')) {
        try {
          const urlParts = deletingProduct.image_url.split('/product-images/');
          if (urlParts[1]) {
            await supabase.storage.from('product-images').remove([urlParts[1]]);
          }
        } catch (e) {}
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id)
        .eq('seller_id', sellerProfile.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err: any) {
      alert(`Failed to delete product: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.is_active : !p.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <RouteGuard allowedRoles={['seller']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Bar */}
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">Products Catalog</h1>
            <p className="text-xs text-charcoal-500">
              Manage inventory, pricing, and active listings for {sellerProfile?.store_name || 'your store'}.
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-charcoal-100 shadow-soft">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or category..."
              className="w-full bg-canvas border border-charcoal-200 rounded-xl pl-9 pr-4 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all' ? 'bg-charcoal-900 text-white' : 'bg-canvas text-charcoal-600 hover:bg-charcoal-100'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-canvas text-charcoal-600 hover:bg-charcoal-100'
              }`}
            >
              Active ({products.filter(p => p.is_active).length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'inactive' ? 'bg-amber-600 text-white' : 'bg-canvas text-charcoal-600 hover:bg-charcoal-100'
              }`}
            >
              Inactive ({products.filter(p => !p.is_active).length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 font-medium">Fetching seller inventory...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Polished Empty State */
          <div className="bg-surface rounded-3xl border border-charcoal-100 p-12 text-center space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-extrabold text-charcoal-900">No products found</h3>
              <p className="text-xs text-charcoal-500">
                {search ? 'No products match your search query.' : 'You haven’t added any products to your store catalog yet.'}
              </p>
            </div>
            {!search && (
              <Link
                href="/seller/products/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Mobile Responsive Cards (Visible on screens < 768px) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="bg-surface rounded-2xl border border-charcoal-100 p-4 shadow-soft space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-charcoal-100 border border-charcoal-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm text-charcoal-900 truncate block">{prod.name}</span>
                      <span className="text-[11px] font-semibold text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-charcoal-100/80 text-xs">
                    <div>
                      <span className="font-extrabold text-sm text-charcoal-900">{formatINR(prod.price)}</span>
                      <span className="text-charcoal-500 font-medium block">{prod.stock} units in stock</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          prod.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {prod.is_active ? 'Active' : 'Inactive'}
                      </button>

                      <Link
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl text-charcoal-600 bg-canvas border border-charcoal-200"
                        title="View Public Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setDeletingProduct(prod)}
                        className="p-2 rounded-xl text-red-600 bg-red-50 border border-red-200"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Visible on screens >= 768px) */}
            <div className="hidden md:block bg-surface rounded-3xl border border-charcoal-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-charcoal-800">
                  <thead className="bg-canvas border-b border-charcoal-100 text-charcoal-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-charcoal-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-charcoal-100 border border-charcoal-200 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prod.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-sm text-charcoal-900 block line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-charcoal-400 font-mono">Slug: {prod.slug}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-charcoal-700">
                          <span className="px-2.5 py-1 bg-charcoal-100 text-charcoal-800 rounded-full text-[11px] font-bold">
                            {prod.category}
                          </span>
                        </td>

                        <td className="p-4 font-extrabold text-charcoal-900">
                          {formatINR(prod.price)}
                          {prod.original_price && (
                            <span className="block text-[10px] text-charcoal-400 line-through font-normal">
                              {formatINR(prod.original_price)}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={`font-bold ${prod.stock <= 5 ? 'text-red-600' : 'text-charcoal-900'}`}>
                            {prod.stock} units
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(prod)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                              prod.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {prod.is_active ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-amber-600" />}
                            <span>{prod.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/product/${prod.slug}`}
                              target="_blank"
                              className="p-2 rounded-xl text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
                              title="View Public Listing"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeletingProduct(prod)}
                              className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && (
          <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl border border-charcoal-100 max-w-md w-full p-6 shadow-xl space-y-4 animate-scaleUp">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-charcoal-900">Delete Product?</h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-charcoal-900">{deletingProduct.name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeletingProduct(null)}
                  className="w-full py-2.5 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteConfirm}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Permanently</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </RouteGuard>
  );
}
