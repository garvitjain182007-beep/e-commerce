-- ==============================================================================
-- MAKERSMARKET OPTIONAL DEMO SEED FILE (INDIA-FIRST INR CATALOG)
-- ==============================================================================
-- Note: This seed file provides sample marketplace products for presentation.
-- Authentic seller/buyer accounts should be created via the web application (/signup & /onboarding).
-- ==============================================================================

-- Verification query
SELECT count(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public';

-- ------------------------------------------------------------------------------
-- DEMO PRODUCT INSERTIONS (Run if seller profiles exist)
-- ------------------------------------------------------------------------------
-- 1. Electronics
-- INSERT INTO public.products (name, slug, description, price, original_price, category, stock, image_url, is_active)
-- VALUES 
-- ('Wireless Over-Ear Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Features 45mm neodymium drivers, active noise cancellation, and up to 35 hours of battery backup.', 2499, 3499, 'Electronics', 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', true),
-- ('20W Dual Port Fast Wall Charger', '20w-fast-charger', 'Compact Type-C PD wall adapter supporting fast charging for smartphones and tablets.', 899, 1299, 'Electronics', 40, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80', true),
-- ('Portable Waterproof Bluetooth Speaker', 'portable-bluetooth-speaker', 'Delivers 360-degree punchy bass with IPX7 waterproof rating.', 1799, NULL, 'Electronics', 18, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80', true),
-- ('10,000mAh Ultra-Slim Power Bank', '10000mah-power-bank', 'Dual USB output power bank with fast pass-through charging capabilities.', 1299, 1699, 'Electronics', 30, 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80', true);
