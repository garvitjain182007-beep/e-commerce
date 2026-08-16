'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  Store, 
  ChevronDown,
  Sparkles,
  LogOut,
  Package,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { CATEGORIES } from '@/data/mockData';

export function Navbar() {
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const { user, profile, sellerProfile, signOut } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isBuyer = profile?.role === 'buyer';
  const isSeller = profile?.role === 'seller';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-charcoal-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-soft group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg tracking-tight text-charcoal-900 leading-none">
                  Makers<span className="text-brand-500">Market</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-medium">
                  Independent Goods
                </span>
              </div>
            </Link>

            {/* Role-Aware Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              
              {/* Common Shop / Marketplace Link */}
              <Link 
                href="/shop" 
                className="text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors"
              >
                {isSeller ? 'Marketplace' : 'Shop'}
              </Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  onMouseEnter={() => setCategoriesOpen(true)}
                  className="flex items-center gap-1 text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors py-2"
                >
                  Categories
                  <ChevronDown className="w-4 h-4 text-charcoal-500 group-hover:rotate-180 transition-transform" />
                </button>

                <div 
                  onMouseLeave={() => setCategoriesOpen(false)}
                  className={`absolute top-full left-0 w-64 bg-surface rounded-2xl shadow-hover border border-charcoal-100 p-2 transition-all duration-200 z-50 ${
                    categoriesOpen ? 'opacity-100 visible translate-y-1' : 'opacity-0 invisible translate-y-2'
                  }`}
                >
                  <div className="grid grid-cols-1 gap-1">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-charcoal-50 transition-colors text-sm text-charcoal-800 group/item"
                      >
                        <span className="group-hover/item:text-brand-500 font-medium">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* SELLER SPECIFIC LINKS */}
              {isSeller && (
                <>
                  <Link 
                    href="/seller" 
                    className="flex items-center gap-1.5 text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    Dashboard
                  </Link>
                  <Link 
                    href="/seller/products" 
                    className="text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors"
                  >
                    Products
                  </Link>
                  <Link 
                    href="/seller/orders" 
                    className="text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors"
                  >
                    Orders
                  </Link>
                  <Link 
                    href="/seller/store" 
                    className="text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors"
                  >
                    Store Settings
                  </Link>
                </>
              )}

              {/* BUYER SPECIFIC LINKS */}
              {isBuyer && (
                <Link 
                  href="/account/orders" 
                  className="flex items-center gap-1.5 text-sm font-medium text-charcoal-800 hover:text-brand-500 transition-colors"
                >
                  <Package className="w-4 h-4 text-brand-500" />
                  My Orders
                </Link>
              )}

            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, stores..."
                className="w-full bg-surface border border-charcoal-100 rounded-full py-2.5 pl-10 pr-4 text-sm text-charcoal-900 placeholder:text-charcoal-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 shadow-sm transition-all"
              />
              <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3" />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Unauthenticated Visitor Options */}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 text-charcoal-700 hover:text-brand-500 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-full border border-charcoal-200 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm"
                >
                  Sign Up
                </Link>
                <Link
                  href="/onboarding"
                  className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Start Selling
                </Link>
              </>
            )}

            {/* Authenticated User Account Icon */}
            {user && (
              <Link
                href={isSeller ? "/seller" : "/account"}
                className="p-2.5 rounded-full text-charcoal-800 hover:bg-charcoal-100/60 transition-colors relative group flex items-center gap-2"
                title="Account Dashboard"
              >
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs border border-brand-200">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                </div>
                {isSeller && (
                  <span className="hidden xl:inline text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Seller
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon & Drawer Trigger */}
            <button
              onClick={openCart}
              className="p-2.5 rounded-full text-charcoal-800 hover:bg-charcoal-100/60 transition-colors relative group"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-fadeIn shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-charcoal-800 hover:bg-charcoal-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-charcoal-100 px-4 pt-2 pb-6 space-y-4 animate-fadeIn">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-canvas border border-charcoal-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-charcoal-900 placeholder:text-charcoal-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3" />
          </form>

          <div className="flex flex-col space-y-2">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-charcoal-900 text-sm"
            >
              Shop Catalog
            </Link>

            {isSeller ? (
              <>
                <Link
                  href="/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-brand-600 text-sm flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Seller Dashboard
                </Link>
                <Link
                  href="/seller/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-charcoal-800 text-sm"
                >
                  Manage Products
                </Link>
                <Link
                  href="/seller/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-charcoal-800 text-sm"
                >
                  Fulfill Orders
                </Link>
                <Link
                  href="/seller/store"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-charcoal-800 text-sm"
                >
                  Store Settings
                </Link>
              </>
            ) : isBuyer ? (
              <>
                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-charcoal-900 text-sm flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-brand-500" />
                  My Orders
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-charcoal-50 font-medium text-charcoal-900 text-sm flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-charcoal-600" />
                  Account Settings
                </Link>
              </>
            ) : (
              <div className="space-y-2 pt-2 border-t border-charcoal-100">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2.5 rounded-xl border border-charcoal-200 text-charcoal-800 font-semibold text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 flex items-center gap-2 pt-2 border-t border-charcoal-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
