import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import snapshotMetadata from "@/data/smartduke-snapshot-meta.json";

type DatasetRow = Record<string, unknown>;
type Snapshot = { revision: string; rows: DatasetRow[]; rowsTotal: number };

const SNAPSHOT_FILE = join(process.cwd(), "data", "smartduke-snapshot.json.gz");
let cachedRows: DatasetRow[] | null = null;

export function loadSmartDukeRows(): DatasetRow[] {
  if (cachedRows) return cachedRows;
  const snapshot = JSON.parse(gunzipSync(readFileSync(SNAPSHOT_FILE)).toString("utf8")) as Snapshot;
  if (snapshot.revision !== snapshotMetadata.revision || snapshot.rowsTotal !== snapshotMetadata.rowsTotal || !Array.isArray(snapshot.rows)) {
    throw new Error("Bundled scheme dataset does not match its verified metadata manifest.");
  }
  if (snapshot.rows.length !== snapshotMetadata.rowsTotal) throw new Error("Bundled scheme dataset row count is incomplete.");
  cachedRows = snapshot.rows;
  return cachedRows;
}
