"use client";

/* eslint-disable @next/next/no-img-element -- static export logo, intentionally a plain <img> */

import * as React from "react";
import { Loader2, LogIn } from "lucide-react";

import { useAuth } from "@/lib/supabase/auth";
import { asset } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setError(error);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <span className="flex items-center gap-2">
          <img src={asset("/brand/wordmark-on-light.png")} alt="BuildVision" className="h-5 w-auto dark:hidden" />
          <img src={asset("/brand/wordmark-on-dark.png")} alt="BuildVision" className="hidden h-5 w-auto dark:block" />
          <span className="ml-1 text-sm text-muted-foreground">Customer Onboarding</span>
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight">Team sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your BuildVision team account to manage customer onboarding.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@buildvision.io"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={busy || !email || !password}>
              {busy ? <Loader2 className="animate-spin" /> : <LogIn />}
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Trouble signing in? Contact your BuildVision admin to have an account created or reset.
          </p>
        </div>
      </main>
    </div>
  );
}
