import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Server-only Supabase client.
 * Uses the Service Role Key to bypass RLS.
 * CRITICAL: NEVER import this in a client-side component (use 'use server' or check window).
 */
export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Public Supabase client.
 * Safe for client-side and server-side use.
 * Respects Row Level Security (RLS).
 */
export const supabasePublic = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
