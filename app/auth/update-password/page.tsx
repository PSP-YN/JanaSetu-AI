"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage(){
  const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>){event.preventDefault();setError("");if(password.length<12){setError("Use at least 12 characters.");return;}if(password!==confirm){setError("Passwords do not match.");return;}setBusy(true);try{const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"updatePassword",password})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Password update failed.");router.replace("/app");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Password update failed.");}finally{setBusy(false);}}
  return <main className="auth-shell"><section className="auth-card"><Link className="auth-brand" href="/">JanaSetu AI</Link><p className="auth-eyebrow">ACCOUNT SECURITY</p><h1>Choose a new password</h1><p className="auth-copy">Use at least 12 characters. Do not reuse a password from another service.</p><form onSubmit={submit}><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="button-primary auth-submit" disabled={busy}>{busy?"Updating…":"Update password"}</button></form></section></main>;
}
