#!/usr/bin/env python3
"""Fetch the licensed SmartDuke dataset revision and build a validated local search index.

This script reads only the publisher's Hugging Face dataset API. It does not scrape myScheme.
A new revision is staged for human review through a pull request; it is never auto-approved.
"""
from __future__ import annotations

import concurrent.futures
import datetime as dt
import gzip
import hashlib
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
META_PATH = DATA_DIR / "smartduke-snapshot-meta.json"
SNAPSHOT_PATH = DATA_DIR / "smartduke-snapshot.json.gz"
DATASET = "smartduketech/indian-government-schemes-2025"
BASE = "https://datasets-server.huggingface.co"
USER_AGENT = "JanaSetu-AI-dataset-refresh/1.0 (CC-BY-4.0 source mirror)"
PAGE_SIZE = 100


def get_json(url: str, timeout: int = 30) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status} for {url}")
        return json.loads(response.read().decode("utf-8"))


def page_url(offset: int, length: int) -> str:
    params = urllib.parse.urlencode({
        "dataset": DATASET, "config": "default", "split": "train",
        "offset": offset, "length": length,
    })
    return f"{BASE}/rows?{params}"


def fetch_page(offset: int, length: int) -> tuple[int, dict]:
    for attempt in range(4):
        try:
            return offset, get_json(page_url(offset, length))
        except Exception:
            if attempt == 3:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise AssertionError("unreachable")


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    old_meta = json.loads(META_PATH.read_text("utf-8")) if META_PATH.exists() else {}
    hub = get_json(f"https://huggingface.co/api/datasets/{DATASET}")
    revision = hub.get("sha")
    last_modified = hub.get("lastModified")
    if not revision or not last_modified:
        raise RuntimeError("Hugging Face metadata is missing revision or lastModified.")

    size = get_json(f"{BASE}/size?{urllib.parse.urlencode({'dataset': DATASET})}")
    split = next((item for item in size.get("size", {}).get("splits", []) if item.get("split") == "train"), None)
    total = int((split or {}).get("num_rows") or 0)
    if total < 1 or total > 20000:
        raise RuntimeError(f"Unexpected dataset row count: {total}")

    if old_meta.get("revision") == revision and old_meta.get("rowsTotal") == total:
        print(f"No publisher revision change ({revision}); snapshot is unchanged.")
        return 0

    offsets = list(range(0, total, PAGE_SIZE))
    pages: dict[int, dict] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(fetch_page, offset, min(PAGE_SIZE, total - offset)) for offset in offsets]
        for future in concurrent.futures.as_completed(futures):
            offset, payload = future.result()
            pages[offset] = payload
            print(f"Fetched page {offset}: {len(payload.get('rows', []))} rows", flush=True)

    rows: list[dict] = []
    features = None
    for offset in offsets:
        payload = pages[offset]
        features = features or payload.get("features")
        page_rows = payload.get("rows")
        if not isinstance(page_rows, list):
            raise RuntimeError(f"Missing rows array at offset {offset}")
        rows.extend(item.get("row", {}) for item in page_rows)

    if len(rows) != total:
        raise RuntimeError(f"Incomplete snapshot: received {len(rows)} of {total} rows")
    slugs = [str(row.get("slug") or "").strip() for row in rows]
    if any(not slug for slug in slugs) or len(set(slugs)) != len(slugs):
        raise RuntimeError("Dataset contains missing or duplicate slugs; refusing to replace the known-good snapshot.")
    bad_urls = [row.get("official_url") for row in rows if not str(row.get("official_url") or "").startswith("https://")]
    if bad_urls:
        raise RuntimeError(f"Dataset contains {len(bad_urls)} missing or non-HTTPS official URLs; manual review required.")

    collection_dates = [str(row.get("scraped_at") or "")[:10] for row in rows if row.get("scraped_at")]
    collection_date = max(collection_dates) if collection_dates else None
    if not collection_date:
        raise RuntimeError("No per-record collection dates were supplied by the publisher.")

    snapshot = {
        "dataset": DATASET,
        "publisher": "SmartDuke Technologies",
        "license": "CC BY 4.0",
        "collectionDate": collection_date,
        "repositoryLastModified": last_modified,
        "revision": revision,
        "rowsTotal": total,
        "features": features,
        "rows": rows,
    }
    raw = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    compressed = gzip.compress(raw, compresslevel=9, mtime=0)
    raw_sha = hashlib.sha256(raw).hexdigest()
    metadata = {
        "dataset": DATASET,
        "publisher": "SmartDuke Technologies",
        "license": "CC BY 4.0",
        "collectionDate": collection_date,
        "repositoryLastModified": last_modified,
        "revision": revision,
        "rowsTotal": total,
        "columnsTotal": len(features or []),
        "sha256UncompressedJson": raw_sha,
        "snapshotPurpose": "Full-text discovery index only; third-party machine-parsed records are not eligibility evidence.",
        "retrievedAt": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    snapshot_tmp = SNAPSHOT_PATH.with_suffix(SNAPSHOT_PATH.suffix + ".tmp")
    metadata_tmp = META_PATH.with_suffix(META_PATH.suffix + ".tmp")
    snapshot_tmp.write_bytes(compressed)
    metadata_tmp.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", "utf-8")
    snapshot_tmp.replace(SNAPSHOT_PATH)
    metadata_tmp.replace(META_PATH)
    print(f"Validated {total} unique rows, {len(features or [])} columns; compressed={len(compressed)} bytes; sha256={raw_sha}")
    print(f"Publisher revision {revision}; collection date {collection_date}; last modified {last_modified}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise
