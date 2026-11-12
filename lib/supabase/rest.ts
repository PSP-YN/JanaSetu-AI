import { cookies } from "next/headers";

const ACCESS_COOKIE = "janasetu_access";
const REFRESH_COOKIE = "janasetu_refresh";
const cookieOptions = (maxAge: number) => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge });

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function setSupabaseSession(session: { access_token: string; refresh_token: string; expires_in?: number }) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, session.access_token, cookieOptions(Math.max(60, session.expires_in ?? 3600)));
  jar.set(REFRESH_COOKIE, session.refresh_token, cookieOptions(60 * 60 * 24 * 30));
}

export async function clearSupabaseSession() {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", cookieOptions(0));
  jar.set(REFRESH_COOKIE, "", cookieOptions(0));
}

export async function getVerifiedSupabaseSession() {
  const { url, key } = config();
  const jar = await cookies();
  let access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) return null;

  const verify = async (token: string) => fetch(url + "/auth/v1/user", {
    headers: { apikey: key, Authorization: "Bearer " + token },
    cache: "no-store"
  });

  let response = access ? await verify(access) : null;
  if ((!response || !response.ok) && refresh) {
    const refreshed = await fetch(url + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }), cache: "no-store"
    });
    if (!refreshed.ok) { await clearSupabaseSession(); return null; }
    const session = await refreshed.json();
    if (!session.access_token || !session.refresh_token) { await clearSupabaseSession(); return null; }
    await setSupabaseSession(session);
    const refreshedAccess = String(session.access_token);
    access = refreshedAccess;
    response = await verify(refreshedAccess);
  }
  if (!response?.ok || typeof access !== "string") { await clearSupabaseSession(); return null; }
  const user = await response.json();
  if (!user?.id) { await clearSupabaseSession(); return null; }
  return { user: { id: String(user.id), email: typeof user.email === "string" ? user.email : null }, accessToken: access, url, key };
}
