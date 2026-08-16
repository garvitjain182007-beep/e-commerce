'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Check, Settings, ShieldCheck, Loader2, AlertCircle, Package } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { DbProduct, Product } from '@/types';

export default function SellerStorePage() {
  const { user, sellerProfile, refreshProfile } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadStoreDetails() {
      if (!sellerProfile) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        setStoreName(sellerProfile.store_name || '');
        setDescription(sellerProfile.description || '');
        setCategory(sellerProfile.category || 'General Store');

        // Fetch seller's real products from database
        const { data: prodsData, error: prodsErr } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerProfile.id)
          .order('created_at', { ascending: false });

        if (prodsErr) throw prodsErr;

        if (prodsData) {
          const mapped: Product[] = prodsData.map((item: DbProduct) => ({
            id: item.id,
            slug: item.slug,
            title: item.name,
            description: item.description || '',
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : undefined,
            category: item.category,
            images: [item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
            store: {
              id: sellerProfile.id,
              name: sellerProfile.store_name,
              slug: sellerProfile.store_slug,
              verified: true,
            },
            stock: item.stock,
          }));

          setSellerProducts(mapped);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load store settings.');
      } finally {
        setLoading(false);
      }
    }

    loadStoreDetails();
  }, [sellerProfile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerProfile) return;

    setErrorMsg(null);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: storeName.trim(),
          description: description.trim(),
          category: category.trim(),
        })
        .eq('id', sellerProfile.id);

      if (error) throw error;

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['seller']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">Store Management</h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Configure your real storefront details, bio, category, and preview live customer layout.
            </p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2 overflow-x-auto">
          <Link href="/seller" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Overview & Metrics
          </Link>
          <Link href="/seller/products" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Products Catalog ({sellerProducts.length})
          </Link>
          <Link href="/seller/orders" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Orders & Fulfillment
          </Link>
          <Link href="/seller/store" className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 font-bold text-xs shrink-0">
            Store Management
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 font-medium">Loading store details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Store Settings Form */}
            <div className="lg:col-span-6 bg-surface rounded-3xl border border-charcoal-100 p-8 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
                <h3 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-brand-500" />
                  Store Settings & Details
                </h3>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-charcoal-700">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-canvas border border-charcoal-200 rounded-xl px-3.5 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-charcoal-700">Primary Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Handmade Ceramics / Audio Gear"
                    className="w-full bg-canvas border border-charcoal-200 rounded-xl px-3.5 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-charcoal-700">Store Description / Bio</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a description of your craftsmanship and products..."
                    className="w-full bg-canvas border border-charcoal-200 rounded-xl p-3.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                    saved ? 'bg-emerald-600 text-white' : 'bg-charcoal-900 hover:bg-brand-500 text-white'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Store Settings Saved</span>
                    </>
                  ) : (
                    <span>Save Store Changes</span>
                  )}
                </button>
              </form>
            </div>

            {/* Right Live Storefront Preview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-surface rounded-3xl border border-charcoal-100 shadow-soft overflow-hidden">
                
                {/* Banner */}
                <div className="relative aspect-[3/1] w-full bg-gradient-to-r from-brand-500 to-charcoal-900 flex items-center justify-center p-6 text-white text-center">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">{storeName || 'Storefront'}</h2>
                    <p className="text-xs text-white/80 mt-1">{category || 'Independent Marketplace Store'}</p>
                  </div>
                </div>

                {/* Header */}
                <div className="p-6 space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Storefront
                    </span>
                    <span className="text-xs text-charcoal-400 font-mono">
                      Slug: {sellerProfile?.store_slug}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-charcoal-900">{storeName || 'Store Name'}</h3>
                    <p className="text-xs text-charcoal-600 mt-2 leading-relaxed whitespace-pre-line">
                      {description || 'No store description provided yet.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Store Items Catalog Preview */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-charcoal-900">Your Store Listings ({sellerProducts.length})</h4>
                
                {sellerProducts.length === 0 ? (
                  <div className="bg-surface rounded-2xl border border-charcoal-100 p-8 text-center space-y-2">
                    <Package className="w-8 h-8 text-charcoal-400 mx-auto" />
                    <p className="text-xs text-charcoal-500">No products published under this store yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sellerProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </RouteGuard>
  );
}
