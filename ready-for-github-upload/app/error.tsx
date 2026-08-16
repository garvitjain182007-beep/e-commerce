'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">Something went wrong</h2>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          {error?.message || 'An unexpected runtime error occurred while loading this page.'}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>

        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-900 font-bold text-xs flex items-center gap-2 transition-all"
        >
          <Home className="w-4 h-4 text-charcoal-500" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
