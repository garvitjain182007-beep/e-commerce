'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { formatINR, INDIAN_STATES, validateIndianMobile, validateIndianPIN } from '@/lib/formatters';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { profile } = useAuth();

  // Form State - India Ready
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !locality.trim() || !city.trim() || !state.trim() || !pinCode.trim()) {
      setErrorMsg('Please complete all required Indian delivery address fields.');
      return;
    }

    if (!validateIndianMobile(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (!validateIndianPIN(pinCode)) {
      setErrorMsg('Please enter a valid 6-digit PIN Code (e.g. 560001).');
      return;
    }

    setLoading(true);

    try {
      // Build MINIMAL payload (only productId and requested quantity)
      const payloadItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const fullShippingAddress = `${addressLine1.trim()}${addressLine2.trim() ? `, ${addressLine2.trim()}` : ''}, ${locality.trim()}`;

      // Call secure server API route which runs PostgreSQL transaction RPC: place_marketplace_order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: payloadItems,
          shippingDetails: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: fullShippingAddress,
            city: city.trim(),
            state: state.trim(),
            zip: pinCode.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Checkout failed.');
      }

      // Success! Clear cart and display order confirmation
      clearCart();
      setOrderSuccessId(data.orderId);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccessId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-extrabold text-charcoal-900">Thank you for your order!</h1>
          <p className="text-xs text-charcoal-500 max-w-md mx-auto">
            Order Reference ID: <code className="font-mono font-bold text-charcoal-900">{orderSuccessId}</code>
          </p>
          <p className="text-xs text-charcoal-600 pt-1">
            Your order has been submitted to the seller for fulfillment via <strong>Cash on Delivery (₹ INR)</strong>.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/account/orders"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Track Order History
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-charcoal-200 text-charcoal-800 hover:bg-charcoal-50 font-bold text-xs rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard requireOnboarding={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Cart
        </Link>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-charcoal-900">Checkout</h1>
          <p className="text-xs text-charcoal-500">
            Complete your Cash on Delivery shipping details for delivery across India.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Shipping Details Form */}
          <div className="lg:col-span-7 bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft space-y-6">
            <div className="border-b border-charcoal-100 pb-3 flex items-center justify-between">
              <h2 className="font-extrabold text-base text-charcoal-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-500" />
                Delivery Address (India)
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                Cash on Delivery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Address Line 1 (House/Flat No., Building) *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat 402, Sunshine Apartments"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Address Line 2 (Street, Landmark - Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Near Metro Station"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Locality / Area *</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Indiranagar"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">State *</label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">PIN Code (6 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="560001"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

            </div>
          </div>

          {/* Order Summary & Submit Button */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
              <h2 className="font-extrabold text-base text-charcoal-900 border-b border-charcoal-100 pb-3">
                Order Items ({cart.length})
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="font-bold text-charcoal-900 line-clamp-1">{item.product.title}</span>
                      <span className="text-charcoal-400">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-charcoal-900">
                      {formatINR(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-charcoal-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-charcoal-900 pt-2 border-t border-charcoal-100">
                  <span>Estimated Total</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Cash on Delivery Order</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-canvas border border-charcoal-100 flex items-center gap-3 text-xs text-charcoal-600">
              <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0" />
              <span>All orders are verified server-side directly against seller database inventory.</span>
            </div>
          </div>

        </form>

      </div>
    </RouteGuard>
  );
}
