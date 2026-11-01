import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.schemeName || typeof body.schemeName !== "string" || body.schemeName.length > 160) {
      return NextResponse.json({ error: "A valid scheme name is required." }, { status: 400 });
    }
    const due = new Date();
    due.setDate(due.getDate() + 7);
    return NextResponse.json({
      task: {
        id: "TASK-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        title: "Review next step for " + body.schemeName,
        dueAt: due.toISOString(),
        status: "Pending",
        note: "Prototype reminder only. Confirm the current application window with the official department."
      }
    });
  } catch {
    return NextResponse.json({ error: "Could not create the follow-up task." }, { status: 400 });
  }
}
