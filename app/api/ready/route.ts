import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });

export async function GET() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!configuredUrl || !publishableKey) {
    return json({
      ready: false,
      status: "misconfigured",
      checks: { supabaseConfiguration: false, databaseReachable: false },
      capabilities: {
        publishedSchemes: 0,
        applicationPreparation: false,
        governmentPortalAutomation: "disabled_pending_department_authorization"
      },
      timestamp: new Date().toISOString()
    }, 503);
  }

  let base: URL;
  try {
    base = new URL(configuredUrl);
    if (
      (base.protocol !== "https:" && process.env.NODE_ENV === "production") ||
      base.username ||
      base.password ||
      !base.hostname
    ) throw new Error("Invalid Supabase URL");
  } catch {
    return json({
      ready: false,
      status: "misconfigured",
      checks: { supabaseConfiguration: false, databaseReachable: false },
      capabilities: {
        publishedSchemes: 0,
        applicationPreparation: false,
        governmentPortalAutomation: "disabled_pending_department_authorization"
      },
      timestamp: new Date().toISOString()
    }, 503);
  }

  try {
    const endpoint = new URL("/rest/v1/schemes", base);
    endpoint.search = new URLSearchParams({
      select: "id",
      publication_status: "eq.published",
      limit: "1"
    }).toString();

    const response = await fetch(endpoint, {
      headers: {
        apikey: publishableKey,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4000)
    });

    if (!response.ok) {
      return json({
        ready: false,
        status: "dependency_unavailable",
        checks: { supabaseConfiguration: true, databaseReachable: false },
        capabilities: {
          publishedSchemes: 0,
          applicationPreparation: false,
          governmentPortalAutomation: "disabled_pending_department_authorization"
        },
        timestamp: new Date().toISOString()
      }, 503);
    }

    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error("Unexpected scheme catalogue response");

    const publishedSchemeAvailable = rows.length > 0;
    return json({
      ready: true,
      status: "ready",
      checks: { supabaseConfiguration: true, databaseReachable: true },
      capabilities: {
        publishedSchemes: publishedSchemeAvailable ? "at_least_one" : 0,
        applicationPreparation: publishedSchemeAvailable,
        governmentPortalAutomation: "disabled_pending_department_authorization"
      },
      timestamp: new Date().toISOString()
    });
  } catch {
    return json({
      ready: false,
      status: "dependency_unavailable",
      checks: { supabaseConfiguration: true, databaseReachable: false },
      capabilities: {
        publishedSchemes: 0,
        applicationPreparation: false,
        governmentPortalAutomation: "disabled_pending_department_authorization"
      },
      timestamp: new Date().toISOString()
    }, 503);
  }
}
