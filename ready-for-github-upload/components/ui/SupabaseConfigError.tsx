'use client';

import React from 'react';
import { Database, AlertTriangle, ExternalLink, Key, Copy, Check } from 'lucide-react';

export function SupabaseConfigError() {
  const [copied, setCopied] = React.useState(false);

  const envSnippet = `NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-surface rounded-3xl border-2 border-amber-200 shadow-hover space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-charcoal-900">Supabase Credentials Required</h2>
          <p className="text-xs text-charcoal-500">Real Supabase Auth & PostgreSQL Database connection is not yet configured.</p>
        </div>
      </div>

      <div className="bg-canvas p-4 rounded-2xl border border-charcoal-100 space-y-3 text-xs text-charcoal-700">
        <p className="font-bold text-charcoal-900">To enable real authentication and onboarding database persistence:</p>
        <ol className="list-decimal pl-4 space-y-1.5 text-charcoal-600">
          <li>Create a free project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold underline flex-inline items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3 inline" /></a></li>
          <li>Execute the SQL schema in <code className="bg-surface px-1.5 py-0.5 rounded border border-charcoal-200 font-mono">supabase/schema.sql</code> in your Supabase SQL Editor.</li>
          <li>Copy your project API URL & anon key from <strong>Project Settings → API</strong> into <code className="bg-surface px-1.5 py-0.5 rounded border border-charcoal-200 font-mono">.env.local</code>.</li>
        </ol>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700">
          <span>Required Environment Variables (.env.local)</span>
          <button
            onClick={copyToClipboard}
            className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Template'}
          </button>
        </div>
        <pre className="bg-charcoal-900 text-charcoal-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto">
          {envSnippet}
        </pre>
      </div>
    </div>
  );
}
