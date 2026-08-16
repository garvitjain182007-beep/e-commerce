import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from './config';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  if (!isSupabaseConfigured()) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      {
        cookies: {
          get(name: string) {
            return cookieStore?.get?.(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get?.(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore?.set?.({ name, value, ...options });
          } catch (error) {
            // Cookie modification allowed only in Server Actions / Route Handlers
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore?.set?.({ name, value: '', ...options });
          } catch (error) {
            // Cookie modification allowed only in Server Actions / Route Handlers
          }
        },
      },
    }
  );
}
