'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  User, 
  Truck,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { DbOrderItem, FulfillmentStatus } from '@/types';
import { formatINR } from '@/lib/formatters';

export default function SellerOrdersPage() {
  const { sellerProfile } = useAuth();
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSellerOrders = async () => {
    if (!sellerProfile) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // Query order items for this seller strictly
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          seller_id,
          quantity,
          unit_price,
          fulfillment_status,
          created_at,
          products (
            name,
            image_url,
            slug
          ),
          orders (
            id,
            created_at,
            shipping_name,
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_zip
          )
        `)
        .eq('seller_id', sellerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrderItems((data || []) as unknown as DbOrderItem[]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load seller sales orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, [sellerProfile]);

  // Update item-level fulfillment status
  const handleUpdateStatus = async (itemId: string, newStatus: FulfillmentStatus) => {
    if (!sellerProfile) return;
    setUpdatingId(itemId);

    try {
      const { error } = await supabase
        .from('order_items')
        .update({ fulfillment_status: newStatus })
        .eq('id', itemId)
        .eq('seller_id', sellerProfile.id);

      if (error) throw error;

      setOrderItems(orderItems.map(item => item.id === itemId ? { ...item, fulfillment_status: newStatus } : item));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <RouteGuard allowedRoles={['seller']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft space-y-1">
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">Fulfillment & Sales Orders</h1>
          <p className="text-xs text-charcoal-500">
            Manage order item fulfillment statuses for products ordered from {sellerProfile?.store_name || 'your store'}.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2 overflow-x-auto">
          <Link href="/seller" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Overview & Metrics
          </Link>
          <Link href="/seller/products" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Products Catalog
          </Link>
          <Link href="/seller/orders" className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 font-bold text-xs shrink-0">
            Orders & Fulfillment
          </Link>
          <Link href="/seller/store" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Store Management
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 font-medium">Loading sales orders...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : orderItems.length === 0 ? (
          /* Polished Empty State */
          <div className="bg-surface rounded-3xl border border-charcoal-100 p-12 text-center space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-extrabold text-charcoal-900">No customer sales yet</h3>
              <p className="text-xs text-charcoal-500">
                When customers purchase items from your store, your fulfillment items will appear here.
              </p>
            </div>
          </div>
        ) : (
          /* Seller Order Items Table / Cards */
          <div className="space-y-4">
            {orderItems.map((item) => {
              const itemTotal = Number(item.unit_price) * item.quantity;
              const isUpdating = updatingId === item.id;

              return (
                <div key={item.id} className="bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
                  
                  {/* Top Row: Order ID, Date, Amount */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-charcoal-100 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-sm text-charcoal-900">
                        Order #{item.orders?.id.substring(0, 8)}
                      </span>
                      <span className="text-xs text-charcoal-400 font-medium">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs text-charcoal-500 font-medium">Seller Total:</span>
                      <span className="text-sm font-extrabold text-charcoal-900">{formatINR(itemTotal)}</span>
                    </div>
                  </div>

                  {/* Middle Section: Product Details & Customer Shipping Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Product Summary */}
                    <div className="md:col-span-6 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-charcoal-100 border border-charcoal-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.products?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                          alt={item.products?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-charcoal-900">{item.products?.name || 'Item'}</h4>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          Quantity: <strong className="text-charcoal-800">{item.quantity}</strong> × {formatINR(Number(item.unit_price))}
                        </p>
                      </div>
                    </div>

                    {/* Customer Shipping Address */}
                    <div className="md:col-span-6 p-3.5 rounded-2xl bg-canvas border border-charcoal-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-charcoal-800">
                        <User className="w-3.5 h-3.5 text-brand-500" />
                        <span>Customer: {item.orders?.shipping_name || 'Buyer'}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-charcoal-600">
                        <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0 mt-0.5" />
                        <span>
                          {item.orders?.shipping_address}, {item.orders?.shipping_city}, {item.orders?.shipping_state} {item.orders?.shipping_zip}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Row: Item-Level Fulfillment Control */}
                  <div className="pt-3 border-t border-charcoal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-700">Fulfillment Status:</span>
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
                        {item.fulfillment_status}
                      </span>
                    </div>

                    {/* Status Dropdown Selector */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isUpdating && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
                      <span className="text-[11px] font-semibold text-charcoal-500">Update Status:</span>
                      <select
                        disabled={isUpdating}
                        value={item.fulfillment_status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as FulfillmentStatus)}
                        className="bg-canvas border border-charcoal-200 rounded-xl px-3 py-1.5 text-xs font-bold text-charcoal-900 focus:outline-none focus:border-brand-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </RouteGuard>
  );
}
