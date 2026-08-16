'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  ArrowLeft 
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatINR } from '@/lib/formatters';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'MAKER10') {
      setDiscountAmount(subtotal * 0.1);
      setPromoApplied(true);
    } else {
      alert('Try promo code: MAKER10 for 10% off');
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-charcoal-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-charcoal-500 mt-1">Review your items before proceeding to checkout.</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-charcoal-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-16 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-20 h-20 rounded-full bg-charcoal-50 text-charcoal-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-charcoal-900">Your shopping cart is empty</h2>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              Explore unique items from independent studio makers across India.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Item List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-surface rounded-2xl border border-charcoal-100 p-4 sm:p-6 shadow-soft flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center min-w-0">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-charcoal-100 shrink-0 border border-charcoal-100">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                      {product.store.name}
                    </span>
                    <Link href={`/product/${product.slug}`} className="block font-bold text-base text-charcoal-900 hover:text-brand-500 transition-colors line-clamp-1">
                      {product.title}
                    </Link>
                    <p className="text-xs text-charcoal-500 line-clamp-1">{product.description}</p>
                    <span className="text-xs font-bold text-charcoal-900 block pt-1 sm:hidden">
                      {formatINR(product.price * quantity)}
                    </span>
                  </div>
                </div>

                {/* Controls & Price */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-charcoal-100">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-canvas border border-charcoal-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1.5 hover:bg-surface rounded-lg text-charcoal-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-charcoal-900 px-3">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-1.5 hover:bg-surface rounded-lg text-charcoal-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-base font-extrabold text-charcoal-900 hidden sm:block w-28 text-right">
                    {formatINR(product.price * quantity)}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-charcoal-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Link href="/shop" className="text-xs font-semibold text-charcoal-700 hover:text-brand-500 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Shopping
              </Link>
            </div>
          </div>

          {/* Sticky Order Summary */}
          <div className="lg:col-span-4 bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-charcoal-900 border-b border-charcoal-100 pb-4">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-semibold text-charcoal-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brand-500" />
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Try MAKER10"
                  className="flex-1 bg-canvas border border-charcoal-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-charcoal-900 text-white font-semibold text-xs rounded-xl hover:bg-brand-500 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs font-medium text-emerald-600">✓ 10% Promo Discount Applied!</p>
              )}
            </form>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between text-charcoal-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatINR(subtotal)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount (10%)</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>GST & Taxes</span>
                <span className="font-semibold text-charcoal-900">Included</span>
              </div>

              <div className="border-t border-charcoal-100 pt-3 flex justify-between items-baseline">
                <span className="font-extrabold text-base text-charcoal-900">Total</span>
                <span className="font-extrabold text-2xl text-brand-500">{formatINR(finalTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 text-center"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-xs text-charcoal-500 pt-2 border-t border-charcoal-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct seller fulfillment & Cash on Delivery</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
