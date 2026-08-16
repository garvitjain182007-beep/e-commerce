import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-charcoal-100 p-3.5 space-y-3 animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-charcoal-100/70" />
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 bg-charcoal-100 rounded" />
        <div className="h-3 w-12 bg-charcoal-100 rounded" />
      </div>
      <div className="h-4 w-full bg-charcoal-100 rounded" />
      <div className="h-4 w-3/4 bg-charcoal-100 rounded" />
      <div className="pt-2 border-t border-charcoal-100 flex justify-between items-center">
        <div className="h-5 w-16 bg-charcoal-100 rounded" />
        <div className="h-8 w-20 bg-charcoal-100 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
