import { NextResponse } from "next/server";

export async function readJsonBody(request: Request, maxBytes = 16 * 1024): Promise<
  | { ok: true; value: unknown }
  | { ok: false; response: NextResponse }
> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (!Number.isFinite(length) || length < 0) {
      return { ok: false, response: NextResponse.json({ error: "Invalid Content-Length." }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
    }
    if (length > maxBytes) {
      return { ok: false, response: NextResponse.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } }) };
    }
  }

  if (!request.body) {
    return { ok: false, response: NextResponse.json({ error: "Request body is required." }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("Request body exceeds configured limit");
        return { ok: false, response: NextResponse.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } }) };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Unable to read request body." }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Request body must be valid UTF-8 JSON." }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
  }
}
