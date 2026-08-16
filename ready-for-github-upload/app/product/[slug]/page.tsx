'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Store, 
  Minus, 
  Plus, 
  Check, 
  Truck, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';
import { formatINR } from '@/lib/formatters';
import { MOCK_PRODUCTS } from '@/data/mockData';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : '';

  const { addToCart } = useCart();
  const { sellerProfile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        // Query product row cleanly
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          const mockMatch = MOCK_PRODUCTS.find(p => p.slug === slug);
          if (mockMatch) {
            setProduct(mockMatch);
            return;
          }
          setErrorMsg('The requested product listing could not be found.');
          setProduct(null);
          return;
        }

        // Fetch seller profile separately if seller_id exists
        let sellerInfo = { id: data.seller_id, store_name: 'Independent Store', store_slug: 'store' };
        if (data.seller_id) {
          const { data: sellerData } = await supabase
            .from('seller_profiles')
            .select('id, store_name, store_slug')
            .eq('id', data.seller_id)
            .maybeSingle();

          if (sellerData) {
            sellerInfo = sellerData;
          }
        }

        const isOwner = sellerProfile?.id && (data.seller_id === sellerProfile.id);

        if (!data.is_active && !isOwner) {
          setErrorMsg('This product listing has been deactivated by the seller.');
          setProduct(null);
          return;
        }

        const mapped: Product = {
          id: data.id,
          slug: data.slug,
          title: data.name,
          description: data.description || '',
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          category: data.category,
          images: [data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
          store: {
            id: sellerInfo.id,
            name: sellerInfo.store_name,
            slug: sellerInfo.store_slug,
            verified: true,
          },
          stock: data.stock,
          isActive: data.is_active,
        };

        setProduct(mapped);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setErrorMsg(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug, sellerProfile]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-xs text-charcoal-500 font-medium">Loading product listing...</span>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-charcoal-900">Listing Unavailable</h2>
        <p className="text-xs text-charcoal-500">{errorMsg || 'The requested product could not be found.'}</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-sm hover:bg-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button & Preview Badge */}
      <div className="flex items-center justify-between">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {!product.isActive && (
          <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
            Inactive Preview (Owner Mode)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Product Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-surface border border-charcoal-100 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {discountPercent && (
              <span className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Store Info */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-brand-500" />
              {product.store.name}
            </span>
            <span className="text-xs text-charcoal-400 font-medium">Category: {product.category}</span>
          </div>

          {/* Title & Price */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-charcoal-900">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-charcoal-400 line-through font-semibold">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                product.stock <= 0
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : product.stock <= 5
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {product.stock <= 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} units available` : 'In Stock & Ready to Ship'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 border-t border-b border-charcoal-100 py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Product Description</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided by seller.'}
            </p>
          </div>

          {/* Quantity Clamping & Action CTAs */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Quantity</span>
                <div className="flex items-center border border-charcoal-200 rounded-xl bg-canvas p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-lg hover:bg-charcoal-100 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-charcoal-700" />
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-charcoal-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1.5 rounded-lg hover:bg-charcoal-100 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-charcoal-700" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-charcoal-900 hover:bg-brand-500 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Buy Now with COD</span>
                </button>
              </div>
            </div>
          )}

          {/* Guarantees */}
          <div className="p-4 rounded-2xl bg-canvas border border-charcoal-100 space-y-2 text-xs text-charcoal-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>Cash on Delivery available nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>Direct seller fulfillment & quality guarantee</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
