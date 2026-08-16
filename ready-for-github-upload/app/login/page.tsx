'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SupabaseConfigError } from '@/components/ui/SupabaseConfigError';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured, user, profile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user is logged in, handle redirection based on onboarding state & role
  React.useEffect(() => {
    if (user && profile) {
      if (!profile.onboarding_completed) {
        router.push('/onboarding');
      } else if (profile.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/shop');
      }
    }
  }, [user, profile, router]);

  if (!isConfigured) {
    return <SupabaseConfigError />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error.message);
      }
      // Effect hook will handle redirection once profile is populated
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface rounded-3xl border border-charcoal-100 p-8 shadow-soft space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 font-bold text-2xl flex items-center justify-center mx-auto mb-3">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-charcoal-500">Sign in to manage your orders, wishlist, or store.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-canvas border border-charcoal-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-charcoal-700">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-canvas border border-charcoal-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-charcoal-100 text-xs text-charcoal-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-brand-500 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
