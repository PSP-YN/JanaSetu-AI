import { NextRequest, NextResponse } from "next/server";
import snapshotMetadata from "@/data/smartduke-snapshot-meta.json";
import { loadSmartDukeRows } from "@/lib/smartduke-snapshot";

type DatasetRow = Record<string, unknown>;
const DATASET = snapshotMetadata.dataset;

// The bundled, attributed snapshot makes search complete across all 4,693 rows even
// while the upstream Dataset Viewer /search endpoint is failing. It remains stale
// until the publisher releases a new revision; the source monitor reports that state.
export const revalidate = 0;

let cachedHaystacks: string[] | null = null;

function loadSearchHaystacks(rows: DatasetRow[]): string[] {
  if (cachedHaystacks) return cachedHaystacks;
  cachedHaystacks = rows.map((row) => searchText([
    row.slug, row.name, row.description, row.ministry, row.department, row.state,
    row.category, row.beneficiary_type, row.benefits, row.eligibility_text,
    row.application_process, row.documents_required
  ].join(" ")));
  return cachedHaystacks;
}

function parseJsonList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  }
}

function cleanText(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|div|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
}

function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function searchText(value: unknown): string {
  return String(value ?? "").normalize("NFKD").toLocaleLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\p{M}]+/gu, " ").trim();
}

function normalize(row: DatasetRow) {
  const slug = String(row.slug || "");
  const state = String(row.state || "India");
  const central = /^(central|india|all)$/i.test(state);
  const sourceUrl = safeUrl(row.official_url) || "https://huggingface.co/datasets/" + DATASET;
  const applyUrl = safeUrl(row.apply_url);
  const categories = String(row.category || "Government support").split(",").map((item) => item.trim()).filter(Boolean);
  const beneficiary = parseJsonList(row.eligibility_state);
  const documents = cleanText(row.documents_required, "").split(/[\n.;]+/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const rawTags = parseJsonList(row.beneficiary_type);
  const collectionDate = snapshotMetadata.collectionDate;
  return {
    id: "open-" + slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    name: cleanText(row.name, "Unnamed scheme"),
    category: categories[0] || "Government support",
    ministry: cleanText(row.ministry || row.department, "Department not provided"),
    summary: cleanText(row.description, "Summary unavailable in the dataset."),
    benefit: cleanText(row.benefits, "Benefit details not independently verified; consult the linked source."),
    sourceUrl,
    sourceName: "SmartDuke Technologies third-party dataset / unverified linked scheme page",
    sourcePeriod: "Publisher collection snapshot " + collectionDate + "; dataset repository last modified " + snapshotMetadata.repositoryLastModified.slice(0, 10) + ". JanaSetu has not independently verified this record.",
    sourceChecked: collectionDate,
    geography: central ? "Central scheme — India" : "State/UT: " + state,
    documents,
    ruleNotes: [
      "Third-party catalogue entry only. JanaSetu has not verified this record against the current scheme notification.",
      "Eligibility fields and summaries were machine-parsed by the dataset publisher and are not used by JanaSetu's eligibility engine.",
      "The source monitor reports dataset freshness separately; a recent publisher update does not establish that the linked official scheme record is current.",
      "Check the current official scheme page, eligibility, application window and required documents before acting."
    ],
    tags: [...categories, ...rawTags, state],
    catalogueStatus: "catalogue-only" as const,
    recordKind: "external-dataset-record" as const,
    jurisdiction: central ? "central" as const : /andaman|chandigarh|dadra|delhi|jammu|ladakh|lakshadweep|puducherry/i.test(state) ? "ut" as const : "state" as const,
    applicationUrl: applyUrl || undefined,
    datasetSource: "SmartDuke Technologies · CC BY 4.0",
    datasetVerification: "third_party_unverified" as const
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const query = (params.get("q") || "").trim().slice(0, 120);
    const category = (params.get("category") || "").trim();
    const offset = Math.max(0, Math.min(100000, Number(params.get("offset") || 0) || 0));
    const limit = Math.max(1, Math.min(100, Number(params.get("limit") || 50) || 50));
    const terms = searchText(query).split(/\s+/).filter(Boolean);
    const normalizedCategory = searchText(category);
    const rows = loadSmartDukeRows();
    const unsearchableQuery = Boolean(query) && terms.length === 0;
    const unsearchableCategory = Boolean(category) && !normalizedCategory;
    const haystacks = terms.length && !unsearchableQuery && !unsearchableCategory ? loadSearchHaystacks(rows) : [];
    const matches = unsearchableQuery || unsearchableCategory ? [] : rows.filter((row, index) => {
      if (normalizedCategory) {
        const categories = String(row.category || "").split(",").map(searchText);
        const categoryMatches = categories.some((item) => item === normalizedCategory || item.split(/\s+/).includes(normalizedCategory));
        if (!categoryMatches) return false;
      }
      if (!terms.length) return true;
      return terms.every((term) => haystacks[index].includes(term));
    });
    const page = matches.slice(offset, offset + limit);
    const records = page.map(normalize);
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(snapshotMetadata.collectionDate + "T00:00:00.000Z").getTime()) / 86_400_000));
    const hasMore = offset + records.length < matches.length;
    return NextResponse.json({
      source: "SmartDuke Technologies, Indian Government Schemes Dataset 2026 (CC BY 4.0), Hugging Face",
      sourceUrl: "https://huggingface.co/datasets/" + DATASET,
      license: "CC BY 4.0",
      snapshot: snapshotMetadata.collectionDate,
      repositoryLastModified: snapshotMetadata.repositoryLastModified,
      revision: snapshotMetadata.revision,
      snapshotAgeDays: ageDays,
      freshness: ageDays > 90 ? "stale" : "within_policy",
      total: matches.length,
      catalogueTotal: rows.length,
      offset,
      limit,
      nextOffset: hasMore ? offset + records.length : null,
      records,
      searchMode: query ? "local-full-index" : "local-browse",
      searchFallbackWarning: true,
      searchFallbackReason: "publisher_search_endpoint_unavailable",
      warning: "Full-text search covers the complete bundled dataset. The source snapshot is stale and third-party machine-parsed records are discovery-only; verify each record against its current official source."
    }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } });
  } catch (error) {
    return NextResponse.json({ error: "The bundled open-data index is unavailable or failed its integrity check.", detail: error instanceof Error ? error.message : "Unknown index error" }, { status: 503 });
  }
}
