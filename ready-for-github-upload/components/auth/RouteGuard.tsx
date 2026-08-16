'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller' | 'admin')[];
  requireOnboarding?: boolean;
}

export function RouteGuard({
  children,
  allowedRoles,
  requireOnboarding = true,
}: RouteGuardProps) {
  const router = useRouter();
  const { user, profile, loading, isConfigured } = useAuth();

  useEffect(() => {
    if (loading || !isConfigured) return;

    // 1. Unauthenticated -> redirect to /login
    if (!user) {
      router.push('/login');
      return;
    }

    // 2. Onboarding not completed -> redirect to /onboarding
    if (requireOnboarding && profile && !profile.onboarding_completed) {
      router.push('/onboarding');
      return;
    }

    // 3. Role restriction (e.g. Buyer trying to access /seller)
    if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
      if (profile.role === 'buyer') {
        router.push('/');
      } else if (profile.role === 'seller') {
        router.push('/seller');
      }
    }
  }, [user, profile, loading, isConfigured, allowedRoles, requireOnboarding, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-xs text-charcoal-500 font-medium">Verifying authorization...</span>
      </div>
    );
  }

  return <>{children}</>;
}
