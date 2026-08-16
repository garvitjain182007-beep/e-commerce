'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ShoppingBag, Loader2 } from 'lucide-react';
import { CATEGORIES, MOCK_PRODUCTS } from '@/data/mockData';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/ProductCardSkeleton';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
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
            created_at,
            seller_profiles (
              id,
              store_name,
              store_slug
            )
          `)
          .eq('is_active', true)
          .gt('stock', 0);

        if (sortBy === 'price-low') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price-high') {
          query = query.order('price', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
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

          // Combine real DB products with MOCK_PRODUCTS (avoiding duplicates)
          const realIds = new Set(mapped.map(p => p.id));
          const combined = [...mapped, ...MOCK_PRODUCTS.filter(m => !realIds.has(m.id))];
          setProducts(combined);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.error('Failed to load shop products:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [sortBy]);

  // Client-side filtering for category & search keyword
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.store.name.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-surface rounded-3xl border border-charcoal-100 p-8 shadow-soft space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          Marketplace Catalog
        </h1>
        <p className="text-sm text-charcoal-500 max-w-xl">
          Browse real listings published by independent creators and artisan storefronts.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-charcoal-100 shadow-soft">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product title or seller..."
            className="w-full bg-canvas border border-charcoal-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
          />
        </div>

        {/* Category Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-canvas border border-charcoal-200 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-800 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-charcoal-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-canvas border border-charcoal-200 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-800 focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Grid & Loading State */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : filteredProducts.length === 0 ? (
        /* Polished Empty State */
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-extrabold text-charcoal-900">No products found</h3>
            <p className="text-xs text-charcoal-500">
              No products match your current search or category filter. Try clearing your filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-charcoal-900 text-white font-bold text-xs hover:bg-brand-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-xs text-charcoal-500 font-medium">Loading catalog...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
