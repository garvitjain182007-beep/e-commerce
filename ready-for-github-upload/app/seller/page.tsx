'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Settings, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { DbProduct, DbOrderItem } from '@/types';
import { formatINR } from '@/lib/formatters';

export default function SellerDashboardPage() {
  const { sellerProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<DbProduct[]>([]);
  const [recentOrderItems, setRecentOrderItems] = useState<DbOrderItem[]>([]);
  const [deliveredRevenue, setDeliveredRevenue] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      if (!sellerProfile) return;
      setLoading(true);

      try {
        // 1. Fetch Products metrics
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerProfile.id);

        if (productsData) {
          setTotalProducts(productsData.length);
          setActiveProducts(productsData.filter(p => p.is_active).length);
          setLowStockProducts(productsData.filter(p => p.stock <= 5));
        }

        // 2. Fetch Order Items metrics
        const { data: orderItemsData } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            quantity,
            unit_price,
            fulfillment_status,
            created_at,
            products (
              name,
              image_url
            ),
            orders (
              id,
              shipping_name
            )
          `)
          .eq('seller_id', sellerProfile.id)
          .order('created_at', { ascending: false });

        if (orderItemsData) {
          const items = orderItemsData as unknown as DbOrderItem[];
          setTotalSalesCount(items.length);
          setRecentOrderItems(items.slice(0, 5));

          // Calculate revenue from Delivered order items only (unit_price * quantity)
          const totalRev = items
            .filter((item: DbOrderItem) => item.fulfillment_status === 'Delivered')
            .reduce((sum: number, item: DbOrderItem) => sum + (Number(item.unit_price) * item.quantity), 0);

          setDeliveredRevenue(totalRev);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardMetrics();
  }, [sellerProfile]);

  const storeName = sellerProfile?.store_name || 'My Storefront';
  const storeSlug = sellerProfile?.store_slug || 'store';

  return (
    <RouteGuard allowedRoles={['seller']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Seller Header Bar */}
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">{storeName}</h1>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Storefront
              </span>
            </div>
            <p className="text-xs text-charcoal-500">
              Slug: <code className="font-mono text-charcoal-700">{storeSlug}</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/seller/store"
              className="px-4 py-2.5 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-800 hover:bg-charcoal-50 transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-charcoal-600" />
              Store Settings
            </Link>
            <Link
              href="/seller/products/new"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Seller Hub Nav Links */}
        <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2 overflow-x-auto">
          <Link href="/seller" className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 font-bold text-xs shrink-0">
            Overview & Metrics
          </Link>
          <Link href="/seller/products" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Products Catalog ({totalProducts})
          </Link>
          <Link href="/seller/orders" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Orders & Fulfillment ({totalSalesCount})
          </Link>
          <Link href="/seller/store" className="px-4 py-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50 font-medium text-xs shrink-0">
            Store Management
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 font-medium">Computing live store metrics...</p>
          </div>
        ) : (
          <>
            {/* Realized Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-surface p-5 rounded-2xl border border-charcoal-100 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                  <span>Realized Revenue</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold">
                    ₹
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900">{formatINR(deliveredRevenue)}</div>
                <span className="text-[10px] text-charcoal-400">From delivered items</span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-charcoal-100 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                  <span>Total Sales Items</span>
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900">{totalSalesCount}</div>
                <span className="text-[10px] text-charcoal-400">Ordered products</span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-charcoal-100 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                  <span>Active Listings</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900">{activeProducts} / {totalProducts}</div>
                <span className="text-[10px] text-charcoal-400">Public listings</span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-charcoal-100 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500">
                  <span>Low Stock Warnings</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-charcoal-900">{lowStockProducts.length}</div>
                <span className="text-[10px] text-charcoal-400">Stock ≤ 5 units</span>
              </div>

            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Low Stock Inventory Warning</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map((p) => (
                    <Link
                      key={p.id}
                      href="/seller/products"
                      className="px-3 py-1.5 bg-surface border border-amber-200 rounded-xl text-xs font-bold text-charcoal-800 hover:bg-amber-100 transition-colors flex items-center gap-2"
                    >
                      <span>{p.name}</span>
                      <span className="text-red-600 font-extrabold">({p.stock} left)</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Section */}
            <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-charcoal-900">Recent Store Orders</h3>
                  <p className="text-xs text-charcoal-500">Real customer sales items for your store.</p>
                </div>
                <Link href="/seller/orders" className="text-xs font-bold text-brand-500 hover:text-brand-600">
                  View All Orders
                </Link>
              </div>

              {recentOrderItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-charcoal-500 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-charcoal-300 mx-auto" />
                  <p>No customer orders placed yet for your products.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-charcoal-800">
                    <thead className="bg-canvas border-b border-charcoal-100 text-charcoal-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Qty × Price</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100">
                      {recentOrderItems.map((item) => (
                        <tr key={item.id} className="hover:bg-charcoal-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-charcoal-900">
                            #{item.orders?.id.substring(0, 8)}
                          </td>
                          <td className="p-3 font-semibold">{item.orders?.shipping_name || 'Buyer'}</td>
                          <td className="p-3 max-w-xs truncate font-medium">{item.products?.name || 'Product'}</td>
                          <td className="p-3 text-charcoal-600">{item.quantity} × {formatINR(Number(item.unit_price))}</td>
                          <td className="p-3 font-bold text-charcoal-900">{formatINR(item.quantity * Number(item.unit_price))}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}

      </div>
    </RouteGuard>
  );
}
