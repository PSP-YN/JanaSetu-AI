import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCHEMES } from "../lib/catalog";

test("demo UI distinguishes four pending rule prototypes from catalogue-only references", () => {
  const page = readFileSync("app/app/page.tsx", "utf8");
  const landing = readFileSync("app/page.tsx", "utf8");
  assert.equal(SCHEMES.filter((item) => item.catalogueStatus === "rule-screened").length, 4);
  assert.equal(SCHEMES.filter((item) => item.catalogueStatus === "catalogue-only").length, 138);
  assert.match(page, /catalogueStatus === "catalogue-only"\)\.length/);
  assert.match(page, /remainderRequireVerification:"catalogue-only records"/);
  assert.match(landing, /Published scheme guides/);
  assert.doesNotMatch(landing, /Verified scheme guides/);
  assert.match(landing, /Review preliminary screening/);
});
