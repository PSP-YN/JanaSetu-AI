import { NextRequest, NextResponse } from "next/server";
import { SCHEMES } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const category = (request.nextUrl.searchParams.get("category") || "").trim().toLowerCase();
  const results = SCHEMES.filter((scheme) => {
    const haystack = [scheme.name, scheme.category, scheme.ministry, scheme.summary, ...scheme.tags].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (!category || scheme.category.toLowerCase() === category);
  });
  return NextResponse.json({
    total: results.length,
    catalogueScope: "Curated central-scheme prototype catalogue; not a complete list of Indian government schemes.",
    schemes: results
  }, { headers: { "Cache-Control": "no-store" } });
}
