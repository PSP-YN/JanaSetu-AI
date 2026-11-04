import { NextResponse } from "next/server";
import snapshotMetadata from "@/data/smartduke-snapshot-meta.json";
import { loadSmartDukeRows } from "@/lib/smartduke-snapshot";

const DATASET = snapshotMetadata.dataset;
const MAX_AGE_DAYS = 90;
export const revalidate = 900;

async function fetchJson(url: URL, timeoutMs: number): Promise<{ status: number; body: any | null }> {
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "JanaSetu-AI-source-monitor/1.0" },
      cache: "no-store"
    });
    if (!response.ok) return { status: response.status, body: null };
    try { return { status: response.status, body: await response.json() }; }
    catch { return { status: response.status, body: null }; }
  } catch {
    return { status: 0, body: null };
  }
}

export async function GET() {
  const checkedAt = new Date();
  const collectionAt = new Date(snapshotMetadata.collectionDate + "T00:00:00.000Z");
  const snapshotAgeDays = Math.max(0, Math.floor((checkedAt.getTime() - collectionAt.getTime()) / 86_400_000));
  const metadataUrl = new URL("https://huggingface.co/api/datasets/" + DATASET);
  const searchUrl = new URL("https://datasets-server.huggingface.co/search");
  const rowsUrl = new URL("https://datasets-server.huggingface.co/rows");
  for (const url of [searchUrl, rowsUrl]) {
    url.searchParams.set("dataset", DATASET);
    url.searchParams.set("config", "default");
    url.searchParams.set("split", "train");
    url.searchParams.set("offset", "0");
    url.searchParams.set("length", "1");
  }
  searchUrl.searchParams.set("query", "scheme");
  const [metadata, search, rows] = await Promise.all([
    fetchJson(metadataUrl, 5000), fetchJson(searchUrl, 3000), fetchJson(rowsUrl, 5000)
  ]);
  const currentRevision = typeof metadata.body?.sha === "string" ? metadata.body.sha : null;
  const latestModified = typeof metadata.body?.lastModified === "string" ? metadata.body.lastModified : null;
  const updateAvailable = Boolean(currentRevision && currentRevision !== snapshotMetadata.revision);
  const freshness = snapshotAgeDays > MAX_AGE_DAYS ? "stale" : "within_policy";
  const rowsAvailability = Array.isArray(rows.body?.rows) ? "available" : "unavailable";
  const searchAvailability = Array.isArray(search.body?.rows) ? "available" : "unavailable";
  let localIndexAvailability: "available" | "integrity_error" = "available";
  let indexedRows = 0;
  try {
    indexedRows = loadSmartDukeRows().length;
  } catch {
    localIndexAvailability = "integrity_error";
  }
  const overall = metadata.body && rowsAvailability === "available" && localIndexAvailability === "available" && freshness === "within_policy" && !updateAvailable
    ? "healthy" : "attention_required";

  return NextResponse.json({
    checkedAt: checkedAt.toISOString(),
    overall,
    sources: [{
      id: "smartduke-scheme-catalogue",
      publisher: "SmartDuke Technologies",
      url: "https://huggingface.co/datasets/" + DATASET,
      license: "CC BY 4.0",
      snapshotDate: snapshotMetadata.collectionDate,
      snapshotAgeDays,
      freshness,
      freshnessThresholdDays: MAX_AGE_DAYS,
      repositoryLastModified: snapshotMetadata.repositoryLastModified,
      latestRepositoryLastModified: latestModified,
      indexedRevision: snapshotMetadata.revision,
      latestRevision: currentRevision,
      updateAvailable,
      availability: metadata.body ? "available" : "unavailable",
      metadataStatus: metadata.status,
      rowsAvailability,
      rowsStatus: rows.status,
      searchAvailability,
      searchStatus: search.status,
      searchFallback: "bundled-full-index",
      localIndexAvailability,
      indexedRows,
      verification: "third_party_unverified",
      usePolicy: "Full-text discovery only. Publisher-parsed eligibility fields must not drive eligibility decisions. A new upstream revision must be reviewed before replacing this snapshot."
    }, {
      id: "official-myscheme",
      publisher: "National e-Governance Division / Government of India",
      url: "https://www.myscheme.gov.in/",
      verification: "manual_official_source_review_required",
      availability: "not_automatically_checked",
      authorizationRequired: true,
      publicCatalogueBenchmark: {
        observedAt: "2026-11-04",
        portalLastUpdated: "2026-09-18",
        totalAdvertised: "5150+",
        centralAdvertised: "740+",
        statesAndUTsAdvertised: "4400+",
        languagesAdvertised: 15,
        source: "https://www.myscheme.gov.in/",
        languageSource: "https://www.myscheme.gov.in/faqs",
        note: "Public portal headline counts are approximate and are not an ingested row-level dataset; they must not be arithmetically reconciled with the SmartDuke snapshot."
      },
      usePolicy: "myScheme Terms of Use prohibit bots, scrapers and automatic copying unless expressly authorized in writing. Use an approved API/API Setu feed or manual source review."
    }, {
      id: "karnataka-ceg-find-your-scheme",
      publisher: "Centre for e-Governance, Government of Karnataka",
      url: "https://ceg.karnataka.gov.in/schemes/en",
      verification: "official_portal_discovery_only",
      lastChecked: "2026-11-04",
      observedStatus: "page_available_no_scheme_rows_rendered_in_server_response",
      authorizationRequiredForRepublishing: true,
      usePolicy: "Portal copyright policy requires prior permission from CeG or the owning authority to republish site information. Link to the portal; do not bulk-copy its content without permission."
    }]
  }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
