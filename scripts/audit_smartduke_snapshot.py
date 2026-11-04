#!/usr/bin/env python3
"""Create a reproducible data-quality audit and exception queue for SmartDuke rows."""
from __future__ import annotations
import collections, csv, datetime as dt, gzip, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
META = json.loads((ROOT / "data/smartduke-snapshot-meta.json").read_text("utf-8"))
SNAPSHOT = json.loads(gzip.open(ROOT / "data/smartduke-snapshot.json.gz", "rt", encoding="utf-8").read())
rows = SNAPSHOT["rows"]
fields = ["category", "ministry", "department", "apply_url", "description", "benefits", "eligibility_text", "application_process", "documents_required"]
def empty(value): return value is None or (isinstance(value, str) and not value.strip())
def norm(value): return re.sub(r"\s+", " ", str(value or "").strip().casefold())
name_counts = collections.Counter(norm(row.get("name")) for row in rows)
missing = {field: sum(empty(row.get(field)) for row in rows) for field in fields}
state_counts = collections.Counter(str(row.get("state") or "Not supplied") for row in rows)
category_counts = collections.Counter(str(row.get("category") or "Not supplied") for row in rows)
slug_counts = collections.Counter(str(row.get("slug") or "") for row in rows)
issues = []
for row in rows:
    flags = []
    for field in fields:
        if empty(row.get(field)): flags.append("missing_" + field)
    if name_counts[norm(row.get("name"))] > 1: flags.append("duplicate_normalized_name")
    if slug_counts[str(row.get("slug") or "")] > 1: flags.append("duplicate_slug")
    if flags:
        issues.append({"slug": row.get("slug"), "name": row.get("name"), "state": row.get("state"), "category": row.get("category"), "official_url": row.get("official_url"), "flags": flags})
report = {
    "auditDate": str(META.get("retrievedAt", ""))[:10],
    "dataset": META["dataset"], "publisher": META["publisher"], "license": META["license"],
    "revision": META["revision"], "collectionDate": META["collectionDate"],
    "repositoryLastModified": META["repositoryLastModified"],
    "rowCount": len(rows), "uniqueSlugs": len(slug_counts),
    "duplicateSlugGroups": sum(count > 1 for count in slug_counts.values()),
    "duplicateNormalizedNameGroups": sum(count > 1 for name, count in name_counts.items() if name),
    "rowsInDuplicateNameGroups": sum(count for name, count in name_counts.items() if name and count > 1),
    "missingFieldCounts": missing,
    "rowsWithAnyQualityFlag": len(issues),
    "stateCounts": dict(sorted(state_counts.items())),
    "topCategoryCounts": dict(category_counts.most_common(25)),
    "eligibilityUse": "prohibited; catalogue discovery only",
    "reviewStatus": "all rows pending independent official-source verification",
    "qualityFlags": ["missing metadata does not mean scheme is invalid", "duplicate titles require human reconciliation, not automatic deletion", "a resolving official_url does not prove current eligibility or scheme status"]
}
(ROOT / "docs/smartduke-catalogue-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
with (ROOT / "docs/smartduke-record-review-queue.csv").open("w", encoding="utf-8", newline="") as handle:
    writer = csv.DictWriter(handle, fieldnames=["slug", "name", "state", "category", "official_url", "quality_flags", "reviewer_1", "reviewer_2", "decision"], lineterminator="\n")
    writer.writeheader()
    for issue in issues:
        writer.writerow({**{key: str(issue.get(key, "") or "").strip() for key in ["slug", "name", "state", "category", "official_url"]}, "quality_flags": ";".join(issue["flags"]), "reviewer_1": "", "reviewer_2": "", "decision": "pending"})
print(json.dumps({key: report[key] for key in ["rowCount", "uniqueSlugs", "duplicateNormalizedNameGroups", "rowsInDuplicateNameGroups", "missingFieldCounts", "rowsWithAnyQualityFlag"]}, ensure_ascii=False, indent=2))
