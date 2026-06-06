import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { CookieSerializeOptions } from 'cookie';
import type { Cookies } from '@sveltejs/kit';

type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieSerializeOptions;
};

export function createSupabaseServerClient(cookies: Cookies) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesToSet: SupabaseCookie[]) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...options, path: options.path ?? '/' });
        });
      }
    }
  });
}
