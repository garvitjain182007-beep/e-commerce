import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-3xl border border-charcoal-100/80 p-4 space-y-4 shadow-soft animate-pulse">
      {/* Aspect Square Image Placeholder */}
      <div className="aspect-square w-full rounded-2xl bg-charcoal-100" />

      {/* Badges Placeholder */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-charcoal-100 rounded-full" />
        <div className="h-4 w-14 bg-charcoal-100 rounded-full" />
      </div>

      {/* Title & Price Placeholder */}
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-charcoal-100 rounded-lg" />
        <div className="h-6 w-1/3 bg-charcoal-100 rounded-lg" />
      </div>

      {/* Button Placeholder */}
      <div className="h-10 w-full bg-charcoal-100 rounded-xl pt-2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
