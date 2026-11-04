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
    schemeReferenceTotal: SCHEMES.filter((scheme) => scheme.recordKind !== "budget-line-item-lead").length,
    budgetLineItemLeadTotal: SCHEMES.filter((scheme) => scheme.recordKind === "budget-line-item-lead").length,
    officialSourceCatalogueOnlyTotal: SCHEMES.filter((scheme) => scheme.catalogueStatus === "catalogue-only" && scheme.recordKind !== "budget-line-item-lead").length,
    catalogueScope: "142 built-in references: 4 Central deterministic rule prototypes pending two independent human approvals, 42 catalogue-only official-source scheme references, and 96 Karnataka FY 2026–27 budget line-item leads. Budget leads are not confirmed citizen-facing schemes. Not a complete India-wide Central + State/UT directory.",
    schemes: results
  }, { headers: { "Cache-Control": "no-store" } });
}
