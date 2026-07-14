/**
 * Supabase browser client.
 *
 * Configured via two public, build-time env vars (safe to expose — the anon key
 * is protected by row-level security in the database):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * When they are absent the app runs exactly as before — single-browser
 * localStorage, no login. When present, data moves to Supabase and the internal
 * dashboard requires a team login.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both env vars are set — i.e. the app should use the backend. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** The shared client, or null when the backend isn't configured. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
