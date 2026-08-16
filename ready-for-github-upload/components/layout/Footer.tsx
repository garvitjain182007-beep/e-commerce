'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-charcoal-100 text-charcoal-800 mt-20">
      {/* Value props banner */}
      <div className="border-b border-charcoal-100/60 bg-canvas/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900">Verified Sellers</h4>
              <p className="text-xs text-charcoal-500">Curated independent creators & artisans</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900">Tracked Shipping</h4>
              <p className="text-xs text-charcoal-500">Real-time order tracking & updates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900">30-Day Guarantees</h4>
              <p className="text-xs text-charcoal-500">Easy returns direct to store owners</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900">Craftsmanship First</h4>
              <p className="text-xs text-charcoal-500">Authentic materials & premium finish</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
                M
              </div>
              <span className="font-semibold text-xl tracking-tight text-charcoal-900">
                Makers<span className="text-brand-500">Market</span>
              </span>
            </Link>
            <p className="text-sm text-charcoal-600 leading-relaxed max-w-sm">
              The two-sided marketplace empowering independent makers, artisans, and boutique designers to launch stores and reach intentional buyers worldwide.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="pt-2">
              <label className="text-xs font-semibold text-charcoal-700 block mb-2">
                Subscribe to curated product drops
              </label>
              <div className="flex items-center max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-canvas border border-charcoal-100 rounded-l-xl px-3.5 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-r-xl font-medium text-sm transition-colors flex items-center shrink-0"
                >
                  Join
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Shop Marketplace</h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li><Link href="/shop" className="hover:text-brand-500 transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=electronics" className="hover:text-brand-500 transition-colors">Electronics & Audio</Link></li>
              <li><Link href="/shop?category=home" className="hover:text-brand-500 transition-colors">Home & Ceramics</Link></li>
              <li><Link href="/shop?category=fashion" className="hover:text-brand-500 transition-colors">Fashion & Leather</Link></li>
              <li><Link href="/shop?category=beauty" className="hover:text-brand-500 transition-colors">Beauty & Botanical</Link></li>
            </ul>
          </div>

          {/* Column 3: Sell Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Sell & Create</h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li><Link href="/onboarding" className="hover:text-brand-500 transition-colors">Open a Store</Link></li>
              <li><Link href="/seller" className="hover:text-brand-500 transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/seller/products/new" className="hover:text-brand-500 transition-colors">List a Product</Link></li>
              <li><Link href="/seller/orders" className="hover:text-brand-500 transition-colors">Fulfill Orders</Link></li>
              <li><Link href="/seller/store" className="hover:text-brand-500 transition-colors">Store Settings</Link></li>
            </ul>
          </div>

          {/* Column 4: Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Company & Help</h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li><Link href="/account" className="hover:text-brand-500 transition-colors">Your Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-brand-500 transition-colors">Order Tracking</Link></li>
              <li><span className="hover:text-brand-500 cursor-pointer transition-colors">About MakersMarket</span></li>
              <li><span className="hover:text-brand-500 cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-brand-500 cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} MakersMarket Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-charcoal-800 cursor-pointer">Privacy</span>
            <span className="hover:text-charcoal-800 cursor-pointer">Terms</span>
            <span className="hover:text-charcoal-800 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
