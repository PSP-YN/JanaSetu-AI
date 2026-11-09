import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Scheme catalogue is not configured." }, { status: 503 });
  try {
    const params = new URLSearchParams({ select: "id,slug,name,category,current_version_id", publication_status: "eq.published", order: "name.asc", limit: "500" });
    const response = await fetch((url.endsWith("/") ? url.slice(0,-1) : url) + "/rest/v1/schemes?" + params, { headers: { apikey: key }, cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Published scheme catalogue is unavailable." }, { status: 503 });
    return NextResponse.json({ schemes: await response.json() }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Published scheme catalogue is unavailable." }, { status: 503 }); }
}
