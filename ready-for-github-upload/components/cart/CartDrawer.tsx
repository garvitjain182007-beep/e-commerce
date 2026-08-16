'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatINR } from '@/lib/formatters';

export function CartDrawer() {
  const { isCartOpen, closeCart, cart, updateQuantity, removeFromCart, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop overlay */}
      <div 
        onClick={closeCart} 
        className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface shadow-drawer border-l border-charcoal-100 flex flex-col animate-slideInRight">
          
          {/* Header */}
          <div className="p-6 border-b border-charcoal-100 flex items-center justify-between bg-canvas/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-charcoal-900">Your Cart</h2>
              <span className="text-xs bg-brand-50 text-brand-600 font-semibold px-2 py-0.5 rounded-full">
                {cart.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 rounded-xl text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-charcoal-50 text-charcoal-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-charcoal-900">Your cart is empty</h3>
                  <p className="text-xs text-charcoal-500 mt-1">Discover handcrafted goods from independent creators across India.</p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-all"
                >
                  Explore Shop
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 p-3 bg-canvas/60 rounded-2xl border border-charcoal-100/80 hover:border-charcoal-200 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-charcoal-100 shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link 
                          href={`/product/${product.slug}`} 
                          onClick={closeCart}
                          className="font-medium text-sm text-charcoal-900 hover:text-brand-500 line-clamp-1 transition-colors"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-charcoal-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[11px] text-charcoal-500 block">
                        Sold by {product.store.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-charcoal-900">
                        {formatINR(product.price * quantity)}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-surface border border-charcoal-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:bg-charcoal-50 rounded text-charcoal-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-2 text-charcoal-900">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 hover:bg-charcoal-50 rounded text-charcoal-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout actions */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-charcoal-100 bg-surface space-y-4 shadow-soft">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-charcoal-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-charcoal-900 text-base">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout (Free Delivery)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-3 rounded-xl border border-charcoal-200 text-charcoal-800 font-semibold text-sm hover:bg-charcoal-50 transition-colors text-center"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors text-center shadow-sm flex items-center justify-center gap-1.5"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
