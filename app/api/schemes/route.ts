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
    catalogueTotal: SCHEMES.length,
    ruleScreenedTotal: SCHEMES.filter((scheme) => scheme.catalogueStatus === "rule-screened").length,
    catalogueOnlyTotal: SCHEMES.filter((scheme) => scheme.catalogueStatus === "catalogue-only").length,
    catalogueScope: "Partial source-linked catalogue: Central schemes, National Scholarship Portal AY 2026–27 entries and a Karnataka State starter set. Not a complete India-wide Central + State/UT directory.",
    schemes: results
  }, { headers: { "Cache-Control": "no-store" } });
}
