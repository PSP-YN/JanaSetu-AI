import { NextResponse } from "next/server";

const DATASET = "smartduketech/indian-government-schemes-2025";
const SNAPSHOT_DATE = "2026-07-05";
const MAX_AGE_DAYS = 90;

export const revalidate = 900;

export async function GET() {
  const checkedAt = new Date();
  const snapshotAt = new Date(SNAPSHOT_DATE + "T00:00:00.000Z");
  const ageDays = Math.max(0, Math.floor((checkedAt.getTime() - snapshotAt.getTime()) / 86_400_000));
  let upstream: "available" | "unavailable" = "unavailable";
  let upstreamStatus: number | null = null;
  let searchAvailability: "available" | "unavailable" = "unavailable";
  let searchStatus: number | null = null;

  try {
    const response = await fetch(
      "https://huggingface.co/api/datasets/" + DATASET,
      { method: "GET", signal: AbortSignal.timeout(5000), headers: { "User-Agent": "JanaSetu-AI-source-monitor/1.0" }, cache: "no-store" }
    );
    upstreamStatus = response.status;
    upstream = response.ok ? "available" : "unavailable";
  } catch {
    upstream = "unavailable";
  }

  try {
    const searchUrl = new URL("https://datasets-server.huggingface.co/search");
    searchUrl.searchParams.set("dataset", DATASET);
    searchUrl.searchParams.set("config", "default");
    searchUrl.searchParams.set("split", "train");
    searchUrl.searchParams.set("offset", "0");
    searchUrl.searchParams.set("length", "1");
    searchUrl.searchParams.set("query", "scheme");
    const response = await fetch(searchUrl, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "JanaSetu-AI-source-monitor/1.0" },
      cache: "no-store"
    });
    searchStatus = response.status;
    if (response.ok) {
      const payload = await response.json() as { rows?: unknown };
      searchAvailability = Array.isArray(payload?.rows) ? "available" : "unavailable";
    } else {
      searchAvailability = "unavailable";
    }
  } catch {
    searchAvailability = "unavailable";
  }

  const freshness = ageDays > MAX_AGE_DAYS ? "stale" : "within_policy";
  return NextResponse.json({
    checkedAt: checkedAt.toISOString(),
    overall: upstream === "available" && searchAvailability === "available" && freshness === "within_policy" ? "healthy" : "attention_required",
    sources: [{
      id: "smartduke-scheme-catalogue",
      publisher: "SmartDuke Technologies",
      url: "https://huggingface.co/datasets/" + DATASET,
      license: "CC BY 4.0",
      snapshotDate: SNAPSHOT_DATE,
      snapshotAgeDays: ageDays,
      freshness,
      freshnessThresholdDays: MAX_AGE_DAYS,
      availability: upstream,
      upstreamStatus,
      searchAvailability,
      searchStatus,
      searchFallback: "page-filter",
      verification: "third_party_unverified",
      usePolicy: "Discovery only. Imported eligibility fields must not drive eligibility decisions."
    }, {
      id: "official-myscheme",
      publisher: "National e-Governance Division / Government of India",
      url: "https://www.myscheme.gov.in/",
      verification: "manual_official_source_review_required",
      availability: "not_automatically_checked",
      usePolicy: "Do not scrape or automate access without written authorization. Review official scheme pages manually or use an approved API."
    }]
  }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
