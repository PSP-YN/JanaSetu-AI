import { NextRequest, NextResponse } from "next/server";

const DATASET = "smartduketech/indian-government-schemes-2025";
const SNAPSHOT = "2026-07-05";
const DATASET_ATTRIBUTION = "SmartDuke Technologies, Indian Government Schemes Dataset 2026 (CC BY 4.0), Hugging Face. Source snapshot 5 July 2026.";
// Keep the route response dynamic so fallback and full-search responses can set different CDN TTLs.
// Upstream dataset fetches remain independently cached for one hour below.
export const revalidate = 0;

function parseJsonList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
  }
}

function cleanText(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value.replace(/<br\s*\/?>/gi, "\n").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').trim();
}

function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalize(row: Record<string, unknown>) {
  const slug = String(row.slug || "");
  const state = String(row.state || "India");
  const central = /^(central|india|all)$/i.test(state);
  const sourceUrl = safeUrl(row.official_url) || "https://www.myscheme.gov.in/";
  const applyUrl = safeUrl(row.apply_url);
  const sourceDate = typeof row.scraped_at === "string" ? row.scraped_at.slice(0, 10) : SNAPSHOT;
  const categories = String(row.category || "Government support").split(",").map((x) => x.trim()).filter(Boolean);
  const beneficiary = parseJsonList(row.eligibility_state);
  const documents = cleanText(row.documents_required, "").split(/[\n.;]+/).map((x) => x.trim()).filter(Boolean).slice(0, 12);
  const rawTags = parseJsonList(row.beneficiary_type);
  return {
    id: "open-" + slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    name: cleanText(row.name, "Unnamed scheme"),
    category: categories[0] || "Government support",
    ministry: cleanText(row.ministry || row.department, "Department not provided"),
    summary: cleanText(row.description, "Summary unavailable in the dataset."),
    benefit: cleanText(row.benefits, "Benefit details not independently verified; consult the linked source."),
    sourceUrl,
    sourceName: "SmartDuke Technologies dataset / linked scheme page",
    sourcePeriod: DATASET_ATTRIBUTION + " Data snapshot date: " + sourceDate,
    sourceChecked: sourceDate,
    geography: central ? "Central scheme — India" : "State/UT: " + state,
    documents,
    ruleNotes: [
      "Imported catalogue entry only. JanaSetu has not verified this record against the current scheme notification.",
      "Dataset eligibility fields were machine-parsed by the dataset publisher and are not used by JanaSetu's eligibility engine.",
      "Check the current official scheme page, eligibility, application window and required documents before acting."
    ],
    tags: [...categories, ...rawTags, state],
    catalogueStatus: "catalogue-only" as const,
    jurisdiction: central ? "central" as const : /andaman|chandigarh|dadra|delhi|jammu|ladakh|lakshadweep|puducherry/i.test(state) ? "ut" as const : "state" as const,
    applicationUrl: applyUrl || undefined,
    datasetSource: "SmartDuke Technologies · CC BY 4.0",
    datasetEligibility: {
      ageMin: typeof row.eligibility_age_min === "number" ? row.eligibility_age_min : null,
      ageMax: typeof row.eligibility_age_max === "number" ? row.eligibility_age_max : null,
      gender: String(row.eligibility_gender || "unknown"),
      incomeMax: typeof row.eligibility_income_max === "number" ? row.eligibility_income_max : null,
      residence: String(row.eligibility_residence || "unknown"),
      state: beneficiary,
      caste: parseJsonList(row.eligibility_caste),
      disability: typeof row.eligibility_disability === "boolean" ? row.eligibility_disability : null,
      bpl: typeof row.eligibility_bpl === "boolean" ? row.eligibility_bpl : null
    }
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") || "").trim().slice(0, 120);
  const offset = Math.max(0, Math.min(100000, Number(params.get("offset") || 0) || 0));
  const length = Math.max(1, Math.min(100, Number(params.get("limit") || 50) || 50));
  const endpointFor = (path: "search" | "rows") => {
    const endpoint = new URL("https://datasets-server.huggingface.co/" + path);
    endpoint.searchParams.set("dataset", DATASET);
    endpoint.searchParams.set("config", "default");
    endpoint.searchParams.set("split", "train");
    endpoint.searchParams.set("offset", String(offset));
    endpoint.searchParams.set("length", String(length));
    if (path === "search" && q) endpoint.searchParams.set("query", q);
    return endpoint;
  };

  const headers = { "User-Agent": "JanaSetu-AI/0.2 (open-data scheme catalogue)" };
  let data: { rows?: Array<{ row?: Record<string, unknown> }>; num_rows_total?: number } | null = null;
  let searchMode: "server-search" | "page-filter" | "browse" = q ? "server-search" : "browse";

  try {
    if (q) {
      // HF's /search endpoint has occasionally stalled while its Hub auth check runs.
      // Keep it bounded and fall back to a page from /rows so the catalogue remains usable.
      try {
        const searchResponse = await fetch(endpointFor("search"), {
          headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(3500)
        });
        if (searchResponse.ok) data = await searchResponse.json();
      } catch {
        data = null;
      }
    }

    if (!data) {
      const rowsResponse = await fetch(endpointFor("rows"), {
        headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000)
      });
      if (!rowsResponse.ok) {
        return NextResponse.json({ error: "Open-data source is temporarily unavailable.", source: "Hugging Face Dataset Viewer", status: rowsResponse.status }, { status: 502 });
      }
      data = await rowsResponse.json();
      if (q) searchMode = "page-filter";
    }

    if (!data) return NextResponse.json({ error: "Unable to reach the open-data catalogue right now." }, { status: 502 });
    const sourceRows = Array.isArray(data.rows) ? data.rows : [];
    const queryTerms = q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const selectedRows = searchMode === "page-filter" ? sourceRows.filter((entry) => {
      const row = entry.row || {};
      const haystack = [row.slug, row.name, row.description, row.ministry, row.department, row.state, row.category, row.beneficiary_type]
        .map((value) => typeof value === "string" ? value : value == null ? "" : JSON.stringify(value))
        .join(" ").toLocaleLowerCase();
      return queryTerms.every((term) => haystack.includes(term));
    }) : sourceRows;
    const records = selectedRows.map((entry) => normalize(entry.row || {}));
    const pageHasMore = sourceRows.length === length;

    const cacheControl = searchMode === "page-filter"
      ? "public, s-maxage=60, stale-while-revalidate=300"
      : "public, s-maxage=3600, stale-while-revalidate=86400";

    return NextResponse.json({
      source: DATASET_ATTRIBUTION,
      sourceUrl: "https://huggingface.co/datasets/" + DATASET,
      license: "CC BY 4.0",
      snapshot: SNAPSHOT,
      total: Number(data.num_rows_total || 4693),
      offset,
      limit: length,
      nextOffset: pageHasMore ? offset + sourceRows.length : null,
      records,
      searchMode,
      warning: "Catalogue discovery only. Source content and machine-parsed eligibility may be stale or inaccurate. Do not use this dataset alone for official eligibility decisions.",
      searchFallbackWarning: searchMode === "page-filter" ? "Hugging Face search is temporarily unavailable. Search is filtering this page only; load further pages to continue." : undefined
    }, { headers: { "Cache-Control": cacheControl } });
  } catch {
    return NextResponse.json({ error: "Unable to reach the open-data catalogue right now." }, { status: 502 });
  }
}
