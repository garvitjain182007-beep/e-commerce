'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ArrowLeft, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { DbOrder } from '@/types';
import { formatINR } from '@/lib/formatters';

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuyerOrders() {
      if (!user) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            buyer_id,
            total_amount,
            status,
            payment_method,
            shipping_name,
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_zip,
            created_at,
            order_items (
              id,
              quantity,
              unit_price,
              fulfillment_status,
              products (
                name,
                image_url,
                slug
              )
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders((data || []) as unknown as DbOrder[]);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    }

    fetchBuyerOrders();
  }, [user]);

  return (
    <RouteGuard requireOnboarding={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account Overview
          </Link>
        </div>

        <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft space-y-2">
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">My Order History</h1>
          <p className="text-xs text-charcoal-500">
            Track fulfillment status for your marketplace purchases.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 font-medium">Fetching order history...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : orders.length === 0 ? (
          /* Polished Empty State */
          <div className="bg-surface rounded-3xl border border-charcoal-100 p-12 text-center space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-extrabold text-charcoal-900">No orders placed yet</h3>
              <p className="text-xs text-charcoal-500">
                You haven’t placed any marketplace orders. Explore artisan listings to get started!
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Marketplace
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-charcoal-100 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-extrabold text-charcoal-900">
                        Order #{order.id.substring(0, 8)}
                      </span>
                      <span className="text-xs text-charcoal-400 font-medium">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Shipping to: <strong className="text-charcoal-800">{order.shipping_name}</strong> ({order.shipping_city}, {order.shipping_state} - PIN {order.shipping_zip})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-sm font-extrabold text-charcoal-900">
                      {formatINR(Number(order.total_amount))}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : order.payment_method}
                    </span>
                  </div>
                </div>

                {/* Items List with Item-Level Fulfillment Status */}
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-canvas border border-charcoal-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-charcoal-100 border border-charcoal-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.products?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                            alt={item.products?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-charcoal-900 block">{item.products?.name || 'Item'}</span>
                          <span className="text-[11px] text-charcoal-500">Qty: {item.quantity} × {formatINR(Number(item.unit_price))}</span>
                        </div>
                      </div>

                      {/* Item-Level Status Badge */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-[10px] text-charcoal-400 font-medium">Item Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          item.fulfillment_status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.fulfillment_status === 'Shipped'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.fulfillment_status === 'Confirmed'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : item.fulfillment_status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.fulfillment_status || 'Pending'}
                        </span>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </RouteGuard>
  );
}
