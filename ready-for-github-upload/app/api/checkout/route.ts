import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables are missing.' },
        { status: 500 }
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore?.get?.(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore?.set?.({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore?.set?.({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    });

    // 1. Authenticate user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to place an order.' },
        { status: 401 }
      );
    }

    // 2. Parse request payload (minimal: items [{ productId, quantity }], shippingDetails)
    const body = await request.json();
    const { items, shippingDetails } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.address || !shippingDetails.city || !shippingDetails.state || !shippingDetails.zip) {
      return NextResponse.json(
        { error: 'Please provide complete shipping details.' },
        { status: 400 }
      );
    }

    // Prepare JSONB p_items parameter
    const p_items = items.map((item: { productId: string; quantity: number }) => ({
      product_id: item.productId,
      quantity: Number(item.quantity),
    }));

    // 3. Invoke atomic PostgreSQL transaction RPC: place_marketplace_order
    const { data: orderId, error: rpcErr } = await supabase.rpc('place_marketplace_order', {
      p_items,
      p_shipping_name: shippingDetails.fullName.trim(),
      p_shipping_phone: (shippingDetails.phone || '').trim(),
      p_shipping_address: shippingDetails.address.trim(),
      p_shipping_city: shippingDetails.city.trim(),
      p_shipping_state: shippingDetails.state.trim(),
      p_shipping_zip: shippingDetails.zip.trim(),
    });

    if (rpcErr) {
      return NextResponse.json(
        { error: rpcErr.message || 'Failed to place order.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during checkout.' },
      { status: 500 }
    );
  }
}
