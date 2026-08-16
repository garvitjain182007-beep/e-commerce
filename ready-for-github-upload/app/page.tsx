'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  ShoppingBag,
  Store,
  Loader2
} from 'lucide-react';
import { CATEGORIES, MOCK_PRODUCTS } from '@/data/mockData';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/ProductCardSkeleton';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';

export default function HomePage() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            description,
            price,
            original_price,
            category,
            image_url,
            stock,
            is_active,
            seller_profiles (
              id,
              store_name,
              store_slug
            )
          `)
          .eq('is_active', true)
          .gt('stock', 0)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => {
            const seller = Array.isArray(item.seller_profiles) ? item.seller_profiles[0] : item.seller_profiles;
            return {
              id: item.id,
              slug: item.slug,
              title: item.name,
              description: item.description || '',
              price: Number(item.price),
              originalPrice: item.original_price ? Number(item.original_price) : undefined,
              category: item.category,
              images: [item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
              store: {
                id: seller?.id || 'store-1',
                name: seller?.store_name || 'Independent Artisan',
                slug: seller?.store_slug || 'artisan',
                verified: true,
              },
              stock: item.stock,
            };
          });

          const realIds = new Set(mapped.map(p => p.id));
          const combined = [...mapped, ...MOCK_PRODUCTS.filter(m => !realIds.has(m.id))];
          setProducts(combined);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.error('Failed to fetch public products:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProducts();
  }, []);

  // Filter Picked for You based on buyer categories if set
  const buyerCategories = profile?.buyer_categories || [];
  const pickedForYouProducts = buyerCategories.length > 0
    ? products.filter(p => buyerCategories.includes(p.category.toLowerCase()))
    : products.slice(0, 4);

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas via-surface to-canvas border-b border-charcoal-100/80 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold tracking-wide animate-fadeIn">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>The Two-Sided Artisan Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.1]">
                Curated goods from <span className="text-brand-500 underline decoration-brand-200 decoration-wavy">independent</span> creators.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl leading-relaxed">
                Connect directly with craftsmen, small batch studios, and independent designers. Authentic products, transparent pricing, and zero corporate markup.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-hover flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Marketplace</span>
                </Link>

                <Link
                  href="/onboarding"
                  className="px-6 py-3.5 rounded-2xl bg-surface border-2 border-charcoal-200 hover:border-brand-500 text-charcoal-900 font-bold text-sm transition-all shadow-soft hover:shadow-hover flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-brand-500" />
                  <span>Open Your Store</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-charcoal-100/80 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-xs text-charcoal-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>Verified Sellers</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-600 font-medium">
                  <Truck className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>Express Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-600 font-medium">
                  <RotateCcw className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>Direct Guarantee</span>
                </div>
              </div>

            </div>

            {/* Hero Banner Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft border border-charcoal-100/80 bg-charcoal-100">
                  <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80"
                    alt="Artisan Craftsmanship"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-white/40 shadow-soft">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Featured Store</span>
                    <h3 className="text-base font-extrabold text-charcoal-900 mt-1">Luminary Audio Studio</h3>
                    <p className="text-xs text-charcoal-500">Handcrafted acoustic gear from Stockholm</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-charcoal-100 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-charcoal-900">Explore by Category</h2>
            <p className="text-xs text-charcoal-500 mt-1">Discover handcrafted goods by department</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group p-4 rounded-2xl bg-surface border border-charcoal-100/80 hover:border-brand-500 text-center transition-all shadow-soft hover:shadow-hover flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {cat.slug === 'electronics' ? '🎧' : cat.slug === 'home' ? '🪴' : cat.slug === 'fashion' ? '🧥' : cat.slug === 'beauty' ? '✨' : cat.slug === 'gaming' ? '🎮' : cat.slug === 'books' ? '📚' : cat.slug === 'fitness' ? '🏋️' : '⌚'}
              </div>
              <span className="text-xs font-bold text-charcoal-800 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* PICKED FOR YOU SECTION */}
      {pickedForYouProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-brand-500" />
                Personalized Selection
              </div>
              <h2 className="text-2xl font-extrabold text-charcoal-900">Picked for You</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pickedForYouProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS MARKETPLACE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-charcoal-100 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-charcoal-900">Live Marketplace Listings</h2>
            <p className="text-xs text-charcoal-500 mt-1">Real products published by independent sellers</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1">
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : featuredProducts.length === 0 ? (
          /* Polished Empty State */
          <div className="bg-surface rounded-3xl border border-charcoal-100 p-12 text-center space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-extrabold text-charcoal-900">No active products yet</h3>
              <p className="text-xs text-charcoal-500">
                Be the first seller to publish a product on MakersMarket!
              </p>
            </div>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Store className="w-4 h-4" />
              Publish First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
