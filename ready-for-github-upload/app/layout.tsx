import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import React from 'react';

export const metadata: Metadata = {
  title: {
    default: 'MakersMarket | Independent Goods & Creator Marketplace',
    template: '%s | MakersMarket',
  },
  description: 'A modern two-sided marketplace connecting independent creators, artisans, and small batch studios directly with buyers.',
  keywords: ['marketplace', 'handcrafted', 'independent sellers', 'e-commerce', 'artisan goods', 'small batch'],
  authors: [{ name: 'MakersMarket Team' }],
  openGraph: {
    title: 'MakersMarket | Independent Goods Marketplace',
    description: 'Connect directly with craftsmen, small batch studios, and independent designers.',
    type: 'website',
    locale: 'en_US',
    siteName: 'MakersMarket',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakersMarket | Independent Goods Marketplace',
    description: 'Curated goods from independent creators.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-canvas text-charcoal-900 antialiased selection:bg-brand-100 selection:text-brand-700">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
