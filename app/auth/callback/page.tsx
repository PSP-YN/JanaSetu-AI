"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message,setMessage] = useState("Verifying your secure sign-in link…");
  const [error,setError] = useState("");
  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const hash = new URLSearchParams(window.location.hash.replace(/^#/,""));
        const description = hash.get("error_description") || new URLSearchParams(window.location.search).get("error_description");
        if(description) throw new Error(description.replace(/\+/g," "));
        const access_token=hash.get("access_token"), refresh_token=hash.get("refresh_token");
        if(!access_token || !refresh_token) throw new Error("The confirmation link is missing its session details or has expired. Request a new link and try again.");
        const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"establish",access_token,refresh_token})});
        const result=await response.json();
        if(!response.ok || !result.authenticated) throw new Error(result.error || "Could not verify the confirmation link.");
        if(active){setMessage("Email confirmed. Opening your citizen workspace…");window.history.replaceState(null,"",window.location.pathname);router.replace("/app");router.refresh();}
      }catch(cause){if(active)setError(cause instanceof Error?cause.message:"Confirmation failed.");}
    })();
    return ()=>{active=false;};
  },[router]);
  return <main className="auth-shell"><section className="auth-card"><Link className="auth-brand" href="/">JanaSetu AI</Link><h1>Confirming your account</h1>{error?<><p className="auth-error" role="alert">{error}</p><Link className="auth-back" href="/auth">Return to sign in</Link></>:<p className="auth-copy" role="status">{message}</p>}</section></main>;
}
