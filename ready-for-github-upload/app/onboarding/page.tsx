'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Store, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ArrowLeft,
  Rocket,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES } from '@/data/mockData';
import { useAuth } from '@/lib/authContext';
import { SupabaseConfigError } from '@/components/ui/SupabaseConfigError';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, completeBuyerOnboarding, completeSellerOnboarding, isConfigured } = useAuth();

  // Wizard state: Step 1 = Role, Step 2 = Branch Step 1, Step 3 = Branch Step 2, Step 4 = Complete
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);

  // Buyer Form State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budgetPreference, setBudgetPreference] = useState<string>('₹500–₹2,000');

  // Seller Form State
  const [storeName, setStoreName] = useState<string>('');
  const [storeCategory, setStoreCategory] = useState<string>('Electronics');
  const [storeBio, setStoreBio] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user has already completed onboarding, redirect them
  React.useEffect(() => {
    if (user && profile?.onboarding_completed) {
      if (profile.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/shop');
      }
    }
  }, [user, profile, router]);

  if (!isConfigured) {
    return <SupabaseConfigError />;
  }

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const handleRoleSelection = (selectedRole: 'buyer' | 'seller') => {
    setRole(selectedRole);
    setErrorMsg(null);
    setStep(2);
  };

  // Submit Buyer Onboarding
  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedCategories.length === 0) {
      setErrorMsg('Please select at least one category of interest.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await completeBuyerOnboarding(selectedCategories, budgetPreference);
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save buyer onboarding preferences.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Seller Onboarding
  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!storeName.trim()) {
      setErrorMsg('Store name cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await completeSellerOnboarding(
        storeName.trim(),
        storeCategory,
        storeBio.trim()
      );
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/seller');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create seller storefront.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = role === 'seller' ? 4 : 3;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      
      {/* Progress Indicator */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 max-w-md mx-auto">
          <span>Step {step} of {totalSteps}</span>
          <span>
            {step === 1 ? 'Role Selection' : role === 'buyer' ? (step === 2 ? 'Interests' : 'Budget') : (step === 2 ? 'Store Name' : step === 3 ? 'Category' : 'Bio')}
          </span>
        </div>
        <div className="w-full bg-charcoal-100 h-2 rounded-full overflow-hidden max-w-md mx-auto">
          <div 
            className="bg-brand-500 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Mandatory Role Selection */}
      {step === 1 && (
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-8 shadow-soft space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Welcome to MakersMarket
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              How do you want to use the marketplace?
            </h1>
            <p className="text-xs text-charcoal-500">
              Select your account role to customize your experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option A: Buyer */}
            <button
              type="button"
              onClick={() => handleRoleSelection('buyer')}
              className="group p-6 rounded-2xl border-2 border-charcoal-100 hover:border-brand-500 bg-surface hover:bg-brand-50/20 text-left transition-all space-y-3 shadow-soft hover:shadow-hover"
            >
              <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900">I’m a Buyer</h3>
                <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                  Discover and purchase products from independent sellers.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform pt-1">
                <span>Continue as Buyer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Option B: Seller */}
            <button
              type="button"
              onClick={() => handleRoleSelection('seller')}
              className="group p-6 rounded-2xl border-2 border-charcoal-100 hover:border-brand-500 bg-surface hover:bg-brand-50/20 text-left transition-all space-y-3 shadow-soft hover:shadow-hover"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900">I’m a Seller</h3>
                <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                  Create a store, publish products and manage customer orders.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform pt-1">
                <span>Open Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* BUYER BRANCH */}
      {role === 'buyer' && step >= 2 && (
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-8 shadow-soft space-y-6 animate-fadeIn">
          
          <button
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else setStep(2);
            }}
            className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* BUYER STEP 2: Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-charcoal-900">What are you interested in?</h2>
                <p className="text-xs text-charcoal-500">
                  Select at least one category to customize your marketplace recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.slug);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`p-4 rounded-2xl border text-center transition-all text-xs font-bold flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 text-brand-700 shadow-sm ring-2 ring-brand-500/20'
                          : 'border-charcoal-100 bg-canvas text-charcoal-700 hover:border-charcoal-300'
                      }`}
                    >
                      <span className="text-2xl">
                        {cat.slug === 'electronics' ? '🎧' : cat.slug === 'home' ? '🪴' : cat.slug === 'fashion' ? '🧥' : cat.slug === 'beauty' ? '✨' : cat.slug === 'gaming' ? '🎮' : cat.slug === 'books' ? '📚' : cat.slug === 'fitness' ? '🏋️' : '⌚'}
                      </span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={selectedCategories.length === 0}
                onClick={() => {
                  if (selectedCategories.length > 0) setStep(3);
                }}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                Continue to Budget
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* BUYER STEP 3: Budget & Finish */}
          {step === 3 && (
            <form onSubmit={handleBuyerSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-charcoal-900">What is your usual shopping budget?</h2>
                <p className="text-xs text-charcoal-500">
                  Select your typical price preference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Under ₹500', '₹500–₹2,000', '₹2,000–₹5,000', '₹5,000+'].map((option) => (
                  <label
                    key={option}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between text-sm font-bold ${
                      budgetPreference === option
                        ? 'border-brand-500 bg-brand-50/40 text-brand-700'
                        : 'border-charcoal-100 bg-canvas text-charcoal-800 hover:border-charcoal-200'
                    }`}
                  >
                    <span>{option}</span>
                    <input
                      type="radio"
                      name="budget"
                      value={option}
                      checked={budgetPreference === option}
                      onChange={() => setBudgetPreference(option)}
                      className="accent-brand-500"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Onboarding</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      )}

      {/* SELLER BRANCH */}
      {role === 'seller' && step >= 2 && (
        <div className="bg-surface rounded-3xl border border-charcoal-100 p-8 shadow-soft space-y-6 animate-fadeIn">
          
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* SELLER STEP 2: Store Name */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-charcoal-900">What is your store called?</h2>
                <p className="text-xs text-charcoal-500">
                  This will be your brand identity visible to buyers across the marketplace.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Nova Studio / Kanso Living"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-3 text-base text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <button
                type="button"
                disabled={!storeName.trim()}
                onClick={() => {
                  if (storeName.trim()) setStep(3);
                }}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                Next: Select Category
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SELLER STEP 3: Category */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-charcoal-900">What do you sell?</h2>
                <p className="text-xs text-charcoal-500">
                  Choose the primary category for your store.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...CATEGORIES.map((c) => c.name), 'Other'].map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setStoreCategory(catName)}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      storeCategory === catName
                        ? 'border-brand-500 bg-brand-50/60 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-charcoal-100 bg-canvas text-charcoal-800 hover:border-charcoal-300'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                Next: Store Description
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SELLER STEP 4: Bio & Submit */}
          {step === 4 && (
            <form onSubmit={handleSellerSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-charcoal-900">Tell us about your store</h2>
                <p className="text-xs text-charcoal-500">
                  Provide a brief tagline or bio describing your craftsmanship and products.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">Store Description</label>
                <textarea
                  rows={4}
                  required
                  value={storeBio}
                  onChange={(e) => setStoreBio(e.target.value)}
                  placeholder="e.g. Handcrafted wooden audio gear and minimalist desk accessories designed in small batches."
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl p-3.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Storefront...</span>
                  </>
                ) : (
                  <>
                    <span>Create Store & Launch Dashboard</span>
                    <Rocket className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
