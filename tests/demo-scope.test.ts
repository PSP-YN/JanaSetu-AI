import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCHEMES } from "../lib/catalog";

test("demo UI distinguishes four pending rule prototypes from catalogue-only references", () => {
  const page = readFileSync("app/app/page.tsx", "utf8");
  const landing = readFileSync("app/page.tsx", "utf8");
  assert.equal(SCHEMES.filter((item) => item.catalogueStatus === "rule-screened").length, 4);
  assert.equal(SCHEMES.filter((item) => item.catalogueStatus === "catalogue-only").length, 42);
  assert.equal(SCHEMES.filter((item) => item.recordKind === "budget-line-item-lead").length, 96);
  assert.match(page, /catalogueStatus === "catalogue-only"\)\.length/);
  assert.match(page, /remainderRequireVerification:"source-indexed records"/);
  assert.match(page, /recordKind === "budget-line-item-lead"/);
  assert.match(page, /budgetLeadStatus:/);
  assert.match(page, /budgetLineItemLeads:/);
  assert.match(page, /preliminaryDisclaimer:/);
  assert.match(page, /t\("preliminaryDisclaimer"\)/);
  assert.match(landing, /Published scheme guides/);
  assert.doesNotMatch(landing, /Verified scheme guides/);
  assert.match(landing, /Review preliminary screening/);
});
