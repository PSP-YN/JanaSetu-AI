import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "janSetu-web",
    status: "prototype",
    timestamp: new Date().toISOString()
  });
}
