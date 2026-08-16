'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  AlertCircle,
  Package,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIES } from '@/data/mockData';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';

export default function NewProductPage() {
  const router = useRouter();
  const { user, sellerProfile } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [isActive, setIsActive] = useState(true);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be smaller than 5MB.');
        return;
      }

      setErrorMsg(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user || !sellerProfile) {
      setErrorMsg('Seller profile required to publish products.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Please enter a valid price.');
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('Please enter a valid stock quantity.');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imageUrlInput.trim();

      // Upload file to Supabase Storage if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadErr) {
          throw new Error(`Image upload failed: ${uploadErr.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // Generate unique slug
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { data: existingSlug } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existingSlug) {
        slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      // Insert product row
      const { error: insertErr } = await supabase
        .from('products')
        .insert({
          seller_id: sellerProfile.id,
          name: name.trim(),
          slug: slug,
          description: description.trim(),
          category: category,
          price: priceNum,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          stock: stockNum,
          image_url: finalImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          is_active: isActive,
        });

      if (insertErr) {
        throw new Error(insertErr.message);
      }

      router.push('/seller/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['seller']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/seller/products"
            className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products Catalog
          </Link>
        </div>

        <div className="bg-surface rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="border-b border-charcoal-100 pb-4 space-y-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900">Add New Product</h1>
            <p className="text-xs text-charcoal-500">
              Publish a new listing to your storefront catalog.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Handmade Ceramic Coffee Mug"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Inventory Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Price (₹ INR) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1499"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Original Price (₹ INR) <span className="text-charcoal-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="1999"
                  className="w-full bg-canvas border border-charcoal-200 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product's craftsmanship, materials, dimensions, and specifications..."
                className="w-full bg-canvas border border-charcoal-200 rounded-xl p-3.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Image Upload / URL */}
            <div className="space-y-3 pt-2 border-t border-charcoal-100">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Product Image
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* Upload Area */}
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-charcoal-200 hover:border-brand-500 rounded-2xl bg-canvas hover:bg-brand-50/20 cursor-pointer transition-all text-center group">
                  <Upload className="w-8 h-8 text-charcoal-400 group-hover:text-brand-500 transition-colors mb-2" />
                  <span className="text-xs font-bold text-charcoal-800">Upload Image File</span>
                  <span className="text-[10px] text-charcoal-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Preview or Image URL Input */}
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-charcoal-200 bg-charcoal-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-charcoal-900/80 text-white text-[10px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-charcoal-500">Or paste image URL:</span>
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-canvas border border-charcoal-200 rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Active Toggle */}
            <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">Listing Status</span>
                <span className="text-[11px] text-charcoal-500">Active products appear publicly in the marketplace.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3">
              <Link
                href="/seller/products"
                className="px-5 py-2.5 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Product</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </RouteGuard>
  );
}
