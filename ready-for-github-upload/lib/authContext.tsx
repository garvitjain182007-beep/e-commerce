'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export interface UserProfileData {
  id: string;
  full_name: string;
  role: 'buyer' | 'seller' | 'admin' | null;
  onboarding_completed: boolean;
  buyer_categories: string[];
  buyer_budget: string | null;
}

export interface SellerProfileData {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  sellerProfile: SellerProfileData | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  completeBuyerOnboarding: (categories: string[], budget: string) => Promise<{ error: Error | null }>;
  completeSellerOnboarding: (storeName: string, category: string, bio: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function slugifyStoreName(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return baseSlug || 'store-' + Math.floor(1000 + Math.random() * 9000);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const supabase = createSupabaseBrowserClient();

  const fetchProfileAndStore = async (userId: string) => {
    if (!isConfigured) return;
    try {
      // Fetch User Profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profData) {
        setProfile(profData as UserProfileData);
      }

      // Fetch Seller Profile if applicable
      const { data: sellerData } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (sellerData) {
        setSellerProfile(sellerData as SellerProfileData);
      } else {
        setSellerProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfileAndStore(currentSession.user.id);
        }
      } catch (e) {
        console.error('Error initializing auth session:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfileAndStore(newSession.user.id);
      } else {
        setProfile(null);
        setSellerProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndStore(user.id);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase credentials are not configured.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      setUser(data.user);
      await fetchProfileAndStore(data.user.id);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase credentials are not configured.') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      setUser(data.user);
      await fetchProfileAndStore(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSellerProfile(null);
  };

  const completeBuyerOnboarding = async (categories: string[], budget: string) => {
    if (!user || !isConfigured) {
      return { error: new Error('Authenticated user required.') };
    }

    // Try update first (if trigger created row upon auth signup)
    const { data, error: updateErr } = await supabase
      .from('profiles')
      .update({
        role: 'buyer',
        buyer_categories: categories,
        buyer_budget: budget,
        onboarding_completed: true,
      })
      .eq('id', user.id)
      .select();

    if (updateErr) return { error: updateErr };

    // If no row updated, fallback to upsert
    if (!data || data.length === 0) {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          role: 'buyer',
          buyer_categories: categories,
          buyer_budget: budget,
          onboarding_completed: true,
        });

      if (upsertErr) return { error: upsertErr };
    }

    await refreshProfile();
    return { error: null };
  };

  const completeSellerOnboarding = async (storeName: string, category: string, bio: string) => {
    if (!user || !isConfigured) {
      return { error: new Error('Authenticated user required.') };
    }

    let slug = slugifyStoreName(storeName);

    // Check slug collision
    const { data: existing } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('store_slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 1. Update or upsert user profile role to 'seller'
    const { data: profData, error: updateErr } = await supabase
      .from('profiles')
      .update({
        role: 'seller',
        onboarding_completed: true,
      })
      .eq('id', user.id)
      .select();

    if (updateErr) return { error: updateErr };

    if (!profData || profData.length === 0) {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          role: 'seller',
          onboarding_completed: true,
        });

      if (upsertErr) return { error: upsertErr };
    }

    // 2. Insert Seller Profile
    const { error: storeErr } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: user.id,
        store_name: storeName.trim(),
        store_slug: slug,
        category: category,
        description: bio.trim(),
      });

    if (storeErr) return { error: storeErr };

    await refreshProfile();
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        sellerProfile,
        loading,
        isConfigured,
        signUp,
        signIn,
        signOut,
        completeBuyerOnboarding,
        completeSellerOnboarding,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
