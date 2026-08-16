import Link from 'next/link';
import { ShoppingBag, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-sm">
        <ShoppingBag className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">Page Not Found</h2>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          The marketplace page or product listing you are looking for doesn’t exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/shop"
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Shop
        </Link>

        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-900 font-bold text-xs flex items-center gap-2 transition-all"
        >
          <Home className="w-4 h-4 text-charcoal-500" />
          Home
        </Link>
      </div>
    </div>
  );
}
