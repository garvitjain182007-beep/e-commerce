-- ==============================================================================
-- MAKERSMARKET SUPABASE SCHEMA & RLS MIGRATION (PHASE 3: ATOMIC CHECKOUT & ITEM FULFILLMENT)
-- Production-ready PostgreSQL relational schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT CHECK (role IN ('buyer', 'seller', 'admin')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  buyer_categories TEXT[] DEFAULT '{}'::TEXT[],
  buyer_budget TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. SELLER PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_seller_user UNIQUE(user_id)
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. ORDERS & ORDER ITEMS TABLES (WITH ITEM-LEVEL FULFILLMENT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  fulfillment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (fulfillment_status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add fulfillment_status column safely if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'fulfillment_status'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN fulfillment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (fulfillment_status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 5. INDEXES FOR FAST QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user ON public.seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_slug ON public.seller_profiles(store_slug);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON public.order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_fulfillment ON public.order_items(fulfillment_status);

-- ------------------------------------------------------------------------------
-- 6. SECURE AUTOMATIC USER CREATION TRIGGER
-- Uses SECURITY DEFINER with search_path = '' and fully qualified names
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, onboarding_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_seller_modtime ON public.seller_profiles;
CREATE TRIGGER update_seller_modtime BEFORE UPDATE ON public.seller_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_products_modtime ON public.products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_orders_modtime ON public.orders;
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 8. ATOMIC MARKETPLACE CHECKOUT FUNCTION (RPC: place_marketplace_order)
-- Fully atomic single-transaction order placement with row-locking and validation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.place_marketplace_order(
  p_items JSONB,
  p_shipping_name TEXT,
  p_shipping_phone TEXT,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_shipping_state TEXT,
  p_shipping_zip TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_buyer_id UUID;
  v_buyer_role TEXT;
  v_order_id UUID;
  v_calculated_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_price NUMERIC(10,2);
  v_stock INT;
  v_is_active BOOLEAN;
  v_seller_id UUID;
BEGIN
  -- 1. Identify & authenticate buyer
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.';
  END IF;

  SELECT role INTO v_buyer_role FROM public.profiles WHERE id = v_buyer_id;
  IF v_buyer_role IS NULL OR v_buyer_role NOT IN ('buyer', 'admin') THEN
    RAISE EXCEPTION 'Only buyer accounts can place marketplace orders.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty.';
  END IF;

  -- 2. Validate all products, stock, active state, and calculate real server total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid product quantity specified.';
    END IF;

    -- Lock product row FOR UPDATE to prevent race conditions & overselling
    SELECT price, stock, is_active, seller_id
    INTO v_price, v_stock, v_is_active, v_seller_id
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF v_price IS NULL THEN
      RAISE EXCEPTION 'Product does not exist.';
    END IF;

    IF NOT v_is_active THEN
      RAISE EXCEPTION 'Product is no longer active.';
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock available.';
    END IF;

    v_calculated_total := v_calculated_total + (v_price * v_quantity);
  END LOOP;

  -- 3. Insert Parent Order
  INSERT INTO public.orders (
    buyer_id,
    total_amount,
    status,
    payment_method,
    shipping_name,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_zip
  ) VALUES (
    v_buyer_id,
    v_calculated_total,
    'Pending',
    'cash_on_delivery',
    p_shipping_name,
    p_shipping_address || ' (Phone: ' || p_shipping_phone || ')',
    p_shipping_city,
    p_shipping_state,
    p_shipping_zip
  )
  RETURNING id INTO v_order_id;

  -- 4. Insert Order Items & Decrement Inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    SELECT price, seller_id INTO v_price, v_seller_id
    FROM public.products
    WHERE id = v_product_id;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      seller_id,
      quantity,
      unit_price,
      fulfillment_status
    ) VALUES (
      v_order_id,
      v_product_id,
      v_seller_id,
      v_quantity,
      v_price,
      'Pending'
    );

    -- Decrement stock safely
    UPDATE public.products
    SET stock = stock - v_quantity
    WHERE id = v_product_id;
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Grant execute privilege to authenticated users
GRANT EXECUTE ON FUNCTION public.place_marketplace_order TO authenticated;

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 9.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.profiles;

CREATE POLICY "Public read profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 9.2 SELLER PROFILES POLICIES
DROP POLICY IF EXISTS "Public read seller profiles" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can insert own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can update own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can delete own seller profile" ON public.seller_profiles;

CREATE POLICY "Public read seller profiles"
  ON public.seller_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own seller profile"
  ON public.seller_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own seller profile"
  ON public.seller_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own seller profile"
  ON public.seller_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 9.3 PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public read active products" ON public.products;
DROP POLICY IF EXISTS "Sellers insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers delete own products" ON public.products;

CREATE POLICY "Public read active products"
  ON public.products FOR SELECT
  TO public
  USING (
    is_active = true OR
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Sellers insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Sellers update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Sellers delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

-- 9.4 ORDERS POLICIES
DROP POLICY IF EXISTS "Buyers read own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers read orders containing their products" ON public.orders;

CREATE POLICY "Buyers read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Buyers insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers read orders containing their products"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT order_id FROM public.order_items 
      WHERE seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    )
  );

-- 9.5 ORDER ITEMS POLICIES (SELLER ITEM-LEVEL FULFILLMENT UPDATE)
DROP POLICY IF EXISTS "Buyers read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Buyers insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Sellers update own order items status" ON public.order_items;

CREATE POLICY "Buyers read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()) OR
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Buyers insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
  );

CREATE POLICY "Sellers update own order items status"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 10. SUPABASE STORAGE BUCKET & USER-FOLDER SCOPED RLS POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers upload own product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers delete own product images" ON storage.objects;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Sellers upload own product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Sellers update own product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Sellers delete own product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
