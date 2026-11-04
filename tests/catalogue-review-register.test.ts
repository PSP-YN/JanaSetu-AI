import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCHEMES } from "../lib/catalog";

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
  const ids = lines.slice(1).map((line) => line.split(",")[0].replace(/^"|"$/g, ""));
  const expected = SCHEMES.filter((scheme) => scheme.catalogueStatus === "catalogue-only").map((scheme) => scheme.id).sort();
  assert.deepEqual(ids.sort(), expected);
  assert.ok(lines.slice(1).every((line) => line.includes('"pending"')));
});
