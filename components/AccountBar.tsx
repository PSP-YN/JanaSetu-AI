"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { id: string; email: string | null };
export default function AccountBar() {
  const [user,setUser] = useState<User | null>(null);
  const [ready,setReady] = useState(false);
  const [busy,setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    fetch("/api/auth",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(active)setUser(d.user||null);}).catch(()=>{}).finally(()=>{if(active)setReady(true);});
    return ()=>{active=false;};
  },[]);
  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"signout"})});
      const result = await response.json().catch(()=>({}));
      if (!response.ok || result.signedOut !== true) throw new Error(result.error || "Sign-out could not be completed.");
      setUser(null); router.refresh(); window.location.reload();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Sign-out could not be completed.");
    } finally { setBusy(false); }
  }
  if (!ready) return <div className="account-bar" aria-live="polite">Checking account…</div>;
  return <div className="account-bar">{user ? <><Link href="/app/automation">Applications &amp; automation</Link><span className="account-email">{user.email || "Citizen account"}</span><span className="account-sync">Account · cloud sync gated</span><button onClick={signOut} disabled={busy}>{busy?"Signing out…":"Sign out"}</button></> : <><span className="account-sync">Local workspace · cloud sync awaits privacy approval and explicit consent</span><Link href="/app/automation">Applications &amp; automation</Link><Link href="/auth">Sign in / Create account</Link></>}</div>;
}
