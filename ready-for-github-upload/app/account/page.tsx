'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { DbOrder } from '@/types';

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const name = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  const [recentOrders, setRecentOrders] = useState<DbOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchAccountOrders() {
      if (!user) return;
      setLoadingOrders(true);

      try {
        const { data } = await supabase
          .from('orders')
          .select(`
            id,
            buyer_id,
            total_amount,
            status,
            payment_method,
            created_at,
            order_items (
              id
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (data) {
          setRecentOrders(data as unknown as DbOrder[]);
        }
      } catch (err) {
        console.error('Failed to load account orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchAccountOrders();
  }, [user]);

  return (
    <RouteGuard requireOnboarding={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Account Header */}
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-500 bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl shrink-0">
              {name ? name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-charcoal-900">{name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-100">
                  {profile?.role === 'seller' ? 'Seller Account' : 'Buyer Profile'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500">{email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 bg-surface rounded-3xl border border-charcoal-100 p-4 shadow-soft space-y-1">
            <Link
              href="/account"
              className="flex items-center justify-between p-3 rounded-2xl bg-brand-50 text-brand-700 font-semibold text-sm"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-500" />
                <span>Profile & Overview</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/account/orders"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-charcoal-50 text-charcoal-800 font-medium text-sm transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-charcoal-500" />
                <span>My Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal-400" />
            </Link>
          </div>

          {/* Account Dashboard Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Orders Quick Summary */}
            <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                <h3 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-500" />
                  Recent Orders
                </h3>
                <Link href="/account/orders" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
                  View All Orders
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-6 text-center text-xs text-charcoal-500">
                  <Loader2 className="w-5 h-5 text-brand-500 animate-spin mx-auto mb-1" />
                  <span>Loading recent orders...</span>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-charcoal-500 space-y-2">
                  <p>You haven’t placed any marketplace orders yet.</p>
                  <Link href="/shop" className="inline-block font-bold text-brand-600 hover:underline">
                    Browse Marketplace →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl bg-canvas border border-charcoal-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-charcoal-900">
                            #{order.id.substring(0, 8)}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.order_items?.length || 1} items
                        </p>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <span className="font-bold text-sm text-charcoal-900">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                        <Link
                          href="/account/orders"
                          className="px-3.5 py-1.5 bg-surface border border-charcoal-200 rounded-xl text-xs font-semibold text-charcoal-800 hover:bg-charcoal-100 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Preferences */}
            {profile?.buyer_categories && profile.buyer_categories.length > 0 && (
              <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-3">
                <h3 className="font-bold text-base text-charcoal-900">Saved Category Preferences</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.buyer_categories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-100 capitalize">
                      {cat}
                    </span>
                  ))}
                  {profile.buyer_budget && (
                    <span className="px-3 py-1 bg-charcoal-100 text-charcoal-800 text-xs font-bold rounded-full">
                      Budget: {profile.buyer_budget}
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
