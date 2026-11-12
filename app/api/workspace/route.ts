import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function retired() {
  return NextResponse.json(
    { error: "Plaintext workspace sync has been retired. Use the client-encrypted /api/workspace/sync endpoint after its approved consent policy is active." },
    { status: 410, headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function GET() { return retired(); }
export async function PUT(_request: NextRequest) { return retired(); }
