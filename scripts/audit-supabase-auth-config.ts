import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { evaluateHostedAuthConfig } from "../lib/security/hosted-auth-audit";

const projectRef = process.env.SUPABASE_PROJECT_REF || "qjiuclkhvxbnojdysmmp";
const siteUrl = process.env.JANASETU_SITE_URL || "https://jana-setu-ai.vercel.app";
let token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
if (!token) {
  try { token = (await readFile(`${homedir()}/.supabase/access-token`, "utf8")).trim(); }
  catch { /* The caller may use a scoped token through the environment instead. */ }
}
if (!token) {
  console.error("Hosted Auth audit not run: no Supabase Management API token found. Run `supabase login` or set SUPABASE_ACCESS_TOKEN in the shell; the token is never printed.");
  process.exit(2);
}

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  cache: "no-store"
});
token = undefined;
if (!response.ok) {
  console.error(`Hosted Auth audit failed: Management API returned HTTP ${response.status}. Check token scope (auth_config_read) and project access.`);
  process.exit(2);
}
const config = await response.json() as Record<string, unknown>;
const checks = evaluateHostedAuthConfig(config, siteUrl);
for (const check of checks) console.log(`${check.passed ? "PASS" : "FAIL"} ${check.id}: ${check.detail}`);
const failed = checks.filter((check) => !check.passed);
console.log(`\n${checks.length - failed.length}/${checks.length} hosted Auth checks passed.`);
if (failed.length) process.exitCode = 1;
