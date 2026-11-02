import { NextResponse } from "next/server";

export async function readJsonBody(request: Request, maxBytes = 16 * 1024): Promise<
  | { ok: true; value: unknown }
  | { ok: false; response: NextResponse }
> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, response: NextResponse.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } }) };
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    return { ok: false, response: NextResponse.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } }) };
  }
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
  }
}
