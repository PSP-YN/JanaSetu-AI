"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { id: string; email: string | null };

export default function AccountBar() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch("/api/auth", { cache: "no-store" })
      .then(response => response.json())
      .then(data => { if (active) setUser(data.user || null); })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signout" })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.signedOut !== true) throw new Error(result.error || "Sign-out could not be completed.");
      setUser(null);
      router.refresh();
      window.location.reload();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Sign-out could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="account-bar account-bar-loading" aria-hidden="true" />;
  return <div className="account-bar account-bar-auth">
    {user ? <><span className="account-email">{user.email || "Citizen account"}</span><button onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button></> : <Link href="/auth">Sign in</Link>}
  </div>;
}
