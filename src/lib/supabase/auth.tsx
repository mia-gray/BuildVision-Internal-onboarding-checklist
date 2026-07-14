"use client";

/**
 * Team authentication for the internal dashboard.
 *
 * When Supabase is configured, the internal app requires an email/password
 * login (so the anon key can't be used to read the private customer table).
 * When it isn't, auth is a no-op passthrough and the app behaves as the
 * single-browser localStorage tool it was before.
 */
import * as React from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase, isSupabaseConfigured } from "./client";

interface AuthState {
  /** Initial session check finished. */
  ready: boolean;
  /** Whether a login is required at all (i.e. Supabase is configured). */
  required: boolean;
  userEmail: string | null;
  userId: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(!isSupabaseConfigured);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({
      ready,
      required: isSupabaseConfigured,
      userEmail: session?.user?.email ?? null,
      userId: session?.user?.id ?? null,
      signIn: async (email, password) => {
        if (!supabase) return {};
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { error: error.message } : {};
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      },
    }),
    [ready, session],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
