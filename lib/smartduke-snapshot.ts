import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import snapshotMetadata from "@/data/smartduke-snapshot-meta.json";

type DatasetRow = Record<string, unknown>;
type Snapshot = { dataset: string; revision: string; rows: DatasetRow[]; rowsTotal: number };

const SNAPSHOT_FILE = join(process.cwd(), "data", "smartduke-snapshot.json.gz");
let cachedRows: DatasetRow[] | null = null;

/**
 * Loads the bundled third-party discovery index after verifying its manifest and record identifiers.
 * @returns The validated rows, cached for the lifetime of this server runtime.
 * @throws If the compressed snapshot, checksum, revision, row count, or identifiers are invalid.
 */
export function loadSmartDukeRows(): DatasetRow[] {
  if (cachedRows) return cachedRows;

  const uncompressed = gunzipSync(readFileSync(SNAPSHOT_FILE));
  const digest = createHash("sha256").update(uncompressed).digest("hex");
  if (digest !== snapshotMetadata.sha256UncompressedJson) {
    throw new Error("Bundled scheme dataset failed its SHA-256 integrity check.");
  }

  const snapshot = JSON.parse(uncompressed.toString("utf8")) as Snapshot;
  if (
    snapshot.dataset !== snapshotMetadata.dataset ||
    snapshot.revision !== snapshotMetadata.revision ||
    snapshot.rowsTotal !== snapshotMetadata.rowsTotal ||
    !Array.isArray(snapshot.rows)
  ) {
    throw new Error("Bundled scheme dataset does not match its verified metadata manifest.");
  }
  if (snapshot.rows.length !== snapshotMetadata.rowsTotal) {
    throw new Error("Bundled scheme dataset row count is incomplete.");
  }

  const slugs = new Set<string>();
  for (const row of snapshot.rows) {
    const slug = typeof row.slug === "string" ? row.slug.trim() : "";
    if (!slug || slugs.has(slug)) {
      throw new Error("Bundled scheme dataset contains a missing or duplicate record identifier.");
    }
    slugs.add(slug);
  }

  cachedRows = snapshot.rows;
  return cachedRows;
}
