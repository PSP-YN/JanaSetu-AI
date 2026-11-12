import { NextRequest, NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { clearSupabaseSession, setSupabaseSession, getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const setFlowState = (response: NextResponse, state: string, secure: boolean) => response.cookies.set("janasetu_auth_state", state, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 600 });
const clearFlowState = (response: NextResponse, secure: boolean) => response.cookies.set("janasetu_auth_state", "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    return json({ user: session?.user ?? null });
  } catch { return json({ error: "Authentication service is not configured." }, 503); }
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return json({ error: "Authentication request is too large." }, 413);
    const body = JSON.parse(raw) as Record<string, unknown>;
    const action = body.action;
    if (action === "signout") {
      let upstreamRevoked = true;
      try {
        const session = await getVerifiedSupabaseSession();
        if (session) {
          const response = await fetch(session.url + "/auth/v1/logout", { method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken }, cache: "no-store" });
          upstreamRevoked = response.ok;
        }
      } catch { upstreamRevoked = false; }
      finally { await clearSupabaseSession(); }
      return json({ signedOut: true, upstreamRevoked });
    }
    if (action === "recover") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (email.length > 254 || !email.includes("@") || !email.split("@")[1]?.includes(".")) return json({ error: "Enter a valid email address." }, 400);
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return json({ error: "Authentication service is not configured." }, 503);
      const state = randomBytes(32).toString("base64url");
      const callback = new URL("/auth/callback", request.nextUrl.origin);
      callback.searchParams.set("next", "/auth/update-password"); callback.searchParams.set("state", state);
      const upstream = await fetch((url.endsWith("/") ? url.slice(0, -1) : url) + "/auth/v1/recover?redirect_to=" + encodeURIComponent(callback.toString()), { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email }), cache: "no-store" });
      if (!upstream.ok) return json({ error: "Password reset could not be requested. Try again later." }, 502);
      const response = json({ requested: true, message: "If this address is registered, a password reset link will be sent." });
      setFlowState(response, state, request.nextUrl.protocol === "https:");
      return response;
    }
    if (action === "updatePassword") {
      const password = typeof body.password === "string" ? body.password : "";
      if (password.length < 12 || password.length > 128) return json({ error: "Use a password between 12 and 128 characters." }, 400);
      const session = await getVerifiedSupabaseSession();
      if (!session) return json({ error: "Your password reset session has expired. Request a new link." }, 401);
      const upstream = await fetch(session.url + "/auth/v1/user", { method: "PUT", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" }, body: JSON.stringify({ password }), cache: "no-store" });
      if (!upstream.ok) return json({ error: "Password could not be updated. Request a new reset link." }, 400);
      return json({ updated: true });
    }
    if (action === "establish") {
      const access_token = typeof body.access_token === "string" ? body.access_token : "";
      const refresh_token = typeof body.refresh_token === "string" ? body.refresh_token : "";
      const suppliedState = typeof body.state === "string" ? body.state : "";
      const expectedState = request.cookies.get("janasetu_auth_state")?.value || "";
      if (!expectedState || !suppliedState || expectedState.length !== suppliedState.length || !timingSafeEqual(Buffer.from(expectedState), Buffer.from(suppliedState))) return json({ error: "This authentication link was not initiated by this browser. Request a new link." }, 403);
      if (!access_token || !refresh_token || access_token.length > 8192 || refresh_token.length > 8192) return json({ error: "Invalid authentication callback." }, 400);
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return json({ error: "Authentication service is not configured." }, 503);
      const verified = await fetch((url.endsWith("/") ? url.slice(0, -1) : url) + "/auth/v1/user", { headers: { apikey: key, Authorization: "Bearer " + access_token }, cache: "no-store" });
      if (!verified.ok) return json({ error: "The email confirmation link is invalid or expired." }, 401);
      const user = await verified.json();
      await setSupabaseSession({ access_token, refresh_token, expires_in: 3600 });
      const response = json({ user: { id: user.id, email: user.email }, authenticated: true });
      clearFlowState(response, request.nextUrl.protocol === "https:");
      return response;
    }
    if (action !== "signin" && action !== "signup") return json({ error: "Unsupported authentication action." }, 400);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json({ error: "Enter a valid email address." }, 400);
    if (action === "signup" && password.length < 12) return json({ error: "Use a password with at least 12 characters." }, 400);
    if (action === "signin" && (password.length < 1 || password.length > 128)) return json({ error: "Enter your password." }, 400);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return json({ error: "JanaSetu cloud accounts are not configured on this deployment yet." }, 503);
    const state = action === "signup" ? randomBytes(32).toString("base64url") : "";
    const callback = new URL("/auth/callback", request.nextUrl.origin);
    if (action === "signup") { callback.searchParams.set("next", "/app"); callback.searchParams.set("state", state); }
    const endpoint = action === "signup" ? "/auth/v1/signup?redirect_to=" + encodeURIComponent(callback.toString()) : "/auth/v1/token?grant_type=password";
    const upstream = await fetch(url.replace(/\/$/, "") + endpoint, {
      method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), cache: "no-store"
    });
    const result = await upstream.json();
    if (!upstream.ok) {
      const upstreamMessage = typeof result.msg === "string" ? result.msg : typeof result.message === "string" ? result.message : "Authentication failed.";
      if (action === "signup" && /user already registered|already exists|email.*registered/i.test(upstreamMessage)) return json({ authenticated: false, confirmationRequired: true, message: "If this address can be registered, confirmation instructions will be sent." });
      return json({ error: upstreamMessage }, upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502);
    }
    if (result.access_token && result.refresh_token) {
      await setSupabaseSession(result);
      return json({ user: { id: result.user?.id, email: result.user?.email }, authenticated: true });
    }
    const response = json({ authenticated: false, confirmationRequired: true, message: "If this address can be registered, confirmation instructions will be sent." });
    if (action === "signup") setFlowState(response, state, request.nextUrl.protocol === "https:");
    return response;
  } catch { return json({ error: "Authentication service is temporarily unavailable." }, 503); }
}
