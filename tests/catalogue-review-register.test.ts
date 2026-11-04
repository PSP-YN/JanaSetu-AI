import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCHEMES } from "../lib/catalog";

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

test("96 Karnataka budget records are explicitly typed as budget line-item leads", () => {
  const leads = SCHEMES.filter((scheme) => scheme.recordKind === "budget-line-item-lead");
  assert.equal(leads.length, 96);
  assert.ok(leads.every((scheme) => scheme.catalogueStatus === "catalogue-only"));
  assert.ok(leads.every((scheme) => scheme.category === "Karnataka budget reference"));
  assert.ok(leads.every((scheme) => scheme.ruleNotes.some((note) => /budget line|budget-derived/i.test(note))));
});

test("the 138-record review register covers every catalogue-only built-in record exactly once", () => {
  const lines = readFileSync("docs/catalogue-review-register.csv", "utf8").trim().split(/\r?\n/);
  assert.equal(lines.length, 139, "header plus 138 unique records");
  const header = parseCsvRow(lines[0]);
  const idIndex = header.indexOf("scheme_id");
  const reviewStatusIndex = header.indexOf("review_status");
  assert.notEqual(idIndex, -1, "scheme_id column must exist");
  assert.notEqual(reviewStatusIndex, -1, "review_status column must exist");
  const rows = lines.slice(1).map(parseCsvRow);
  const ids = rows.map((row) => row[idIndex]);
  const expected = SCHEMES.filter((scheme) => scheme.catalogueStatus === "catalogue-only").map((scheme) => scheme.id).sort();
  assert.deepEqual(ids.sort(), expected);
  assert.ok(rows.every((row) => row[reviewStatusIndex] === "pending"));
});

test("NSP catalogue records do not carry a universal AY 2026-27 deadline", () => {
  const nsp = SCHEMES.filter((scheme) => scheme.sourceName === "National Scholarship Portal — AY 2026–27 listing");
  assert.equal(nsp.length, 30);
  assert.ok(nsp.every((scheme) => scheme.sourcePeriod.includes("scheme-specific status and deadlines vary")));
  assert.ok(nsp.every((scheme) => !scheme.sourcePeriod.includes("30 November 2026")));
});
