import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = 'No products found matching your search.' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-charcoal-100 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-charcoal-50 text-charcoal-400 flex items-center justify-center mx-auto text-xl">
          🔍
        </div>
        <h3 className="text-base font-semibold text-charcoal-900">No matching products</h3>
        <p className="text-xs text-charcoal-500 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
