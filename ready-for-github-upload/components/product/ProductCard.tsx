'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Check, Store } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/cartContext';
import { formatINR } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <div className="group bg-surface rounded-2xl border border-charcoal-100/80 p-3.5 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative">
      <div>
        {/* Image Frame */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-charcoal-50 mb-3">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover img-zoom-hover"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.badge && (
              <span className="bg-charcoal-900/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                {product.badge}
              </span>
            )}
            {discountPercent && (
              <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-surface/80 backdrop-blur-md text-charcoal-700 hover:text-red-500 hover:bg-surface transition-all shadow-sm z-10"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Store Name Badge */}
        <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-semibold mb-1.5 truncate">
          <Store className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span className="truncate">{product.store.name}</span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`} className="block group-hover:text-brand-500 transition-colors">
          <h3 className="font-bold text-charcoal-900 text-sm leading-snug line-clamp-2 mb-2">
            {product.title}
          </h3>
        </Link>
      </div>

      {/* Price & Action Row */}
      <div className="pt-2 border-t border-charcoal-100/60 mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-charcoal-900">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-charcoal-500'}`}>
            {product.stock <= 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
          </span>
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock <= 0}
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            product.stock <= 0
              ? 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
              : added
              ? 'bg-emerald-600 text-white'
              : 'bg-charcoal-900 hover:bg-brand-500 text-white'
          }`}
          title={product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
