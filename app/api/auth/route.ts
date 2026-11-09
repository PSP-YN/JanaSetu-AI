import { NextRequest, NextResponse } from "next/server";
import { clearSupabaseSession, setSupabaseSession, getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    return json({ user: session?.user ?? null });
  } catch { return json({ error: "Authentication service is not configured." }, 503); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = body.action;
    if (action === "signout") {
      const session = await getVerifiedSupabaseSession();
      if (session) await fetch(session.url + "/auth/v1/logout", { method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken }, cache: "no-store" });
      await clearSupabaseSession();
      return json({ signedOut: true });
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
    const endpoint = action === "signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
    const upstream = await fetch(url.replace(/\/$/, "") + endpoint, {
      method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), cache: "no-store"
    });
    const result = await upstream.json();
    if (!upstream.ok) return json({ error: typeof result.msg === "string" ? result.msg : typeof result.message === "string" ? result.message : "Authentication failed." }, upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502);
    if (result.access_token && result.refresh_token) {
      await setSupabaseSession(result);
      return json({ user: { id: result.user?.id, email: result.user?.email }, authenticated: true });
    }
    return json({ authenticated: false, confirmationRequired: true, message: "Account request received. Follow the confirmation instructions sent by email before signing in." });
  } catch { return json({ error: "Authentication service is temporarily unavailable." }, 503); }
}
