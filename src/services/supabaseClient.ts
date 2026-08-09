import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Authentication will not work until these are set in .env.local.'
  );
}

// createClient throws synchronously on an invalid/empty URL, which would crash
// the whole app at import time. Fall back to a syntactically valid placeholder
// so the app still renders — auth calls will simply fail gracefully (caught as
// `{ error }`, never thrown) until real credentials are configured.
const resolvedUrl = supabaseUrl || 'https://placeholder.supabase.co';
const resolvedAnonKey = supabaseAnonKey || 'placeholder-anon-key';

// Publishable (anon) key only — never the service-role key — safe to ship to the browser.
export const supabase = createClient(resolvedUrl, resolvedAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Required so supabase-js picks up the session/tokens Supabase appends to
    // the URL after a Google OAuth redirect or a password-recovery email link.
    detectSessionInUrl: true,
  },
});
