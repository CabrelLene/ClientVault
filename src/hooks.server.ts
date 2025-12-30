import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key: string) => event.cookies.get(key),
      set: (key: string, value: string, options) =>
        event.cookies.set(key, value, { ...options, path: '/' }),
      remove: (key: string, options) => event.cookies.delete(key, { ...options, path: '/' })
    }
  });

  event.locals.getSession = async () => {
    const { data } = await event.locals.supabase.auth.getSession();
    return data.session ?? null;
  };

  return resolve(event, {
    filterSerializedResponseHeaders: (name: string) =>
      name === 'content-range' || name === 'x-supabase-api-version'
  });
};
