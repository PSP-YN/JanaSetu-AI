"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Authentication failed.");
      if (result.authenticated) { router.replace(search.get("next") || "/app"); router.refresh(); }
      else setMessage(result.message || "Check your email for next steps.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Authentication failed. Please try again."); }
    finally { setBusy(false); }
  }

  return <main className="auth-shell"><section className="auth-card">
    <Link className="auth-brand" href="/">JanaSetu AI</Link>
    <p className="auth-eyebrow">CITIZEN ACCOUNT</p>
    <h1>{mode === "signup" ? "Create your account" : "Sign in to JanaSetu"}</h1>
    <p className="auth-copy">Save your profile, preparation drafts and reminders across devices. You control your account and every consequential action.</p>
    <form onSubmit={submit}>
      <label htmlFor="account-email">Email address</label>
      <input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} />
      <label htmlFor="account-password">Password</label>
      <input id="account-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 12 : 1} value={password} onChange={e=>setPassword(e.target.value)} />
      {mode === "signup" && <small>Use at least 12 characters.</small>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {message && <p className="auth-message" role="status">{message}</p>}
      <button className="button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
    </form>
    <div className="auth-switches"><button onClick={()=>{setMode(mode === "signup" ? "signin" : "signup");setError("");setMessage("");}}>{mode === "signup" ? "Already have an account? Sign in" : "Create an account"}</button></div>
    <Link className="auth-back" href="/app">Continue to workspace</Link>
  </section></main>;
}
