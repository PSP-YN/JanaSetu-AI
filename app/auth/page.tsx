"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth/callback?next=/app" });
        if (error) throw error;
        setMessage("If the address is registered, a password reset email will be sent.");
      } else if (mode === "signup") {
        if (password.length < 12) throw new Error("Use a password with at least 12 characters.");
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth/callback?next=/app" } });
        if (error) throw error;
        if (!data.session) setMessage("Account created. Check your email to confirm the address before signing in.");
        else router.replace(search.get("next") || "/app");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(search.get("next") || "/app");
        router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <Link className="auth-brand" href="/">JanaSetu AI</Link>
      <p className="auth-eyebrow">CITIZEN ACCOUNT</p>
      <h1>{mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : "Sign in to JanaSetu"}</h1>
      <p className="auth-copy">Your saved profile, preparation drafts and reminders can follow you across devices. Scheme decisions remain with the responsible government department.</p>
      <form onSubmit={submit}>
        <label htmlFor="account-email">Email address</label>
        <input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} />
        {mode !== "reset" && <><label htmlFor="account-password">Password</label><input id="account-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 12 : 1} value={password} onChange={e=>setPassword(e.target.value)} />{mode === "signup" && <small>Use at least 12 characters.</small>}</>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</button>
      </form>
      <div className="auth-switches">
        {mode !== "signin" && <button onClick={()=>{setMode("signin");setError("");setMessage("");}}>Back to sign in</button>}
        {mode === "signin" && <><button onClick={()=>setMode("signup")}>Create an account</button><button onClick={()=>setMode("reset")}>Forgot password?</button></>}
      </div>
      <Link className="auth-back" href="/app">Continue to workspace</Link>
    </section>
  </main>;
}
