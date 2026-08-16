'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-slate-900 font-sans">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold">Application Error</h2>
          <p className="text-xs text-slate-500">{error?.message || 'An unhandled application error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
