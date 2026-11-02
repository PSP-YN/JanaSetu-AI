import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("hero title and description are translated in every supported locale", () => {
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  assert.equal(localeBlocks.length, 6, "expected six explicit locale dictionaries");
  for (const [, locale, block] of localeBlocks) {
    for (const key of ["heroTitle1", "heroTitle2", "heroDescription"]) {
      assert.match(block, new RegExp("\\b" + key + "\\s*:"), `${locale} is missing ${key}`);
    }
  }
});

test("document language follows the selected locale and keyboard skip navigation exists", () => {
  assert.match(page, /document\.documentElement\.lang\s*=\s*locale\[language\]/);
  assert.match(page, /className="skip-link" href="#main-content"/);
  assert.match(page, /id="main-content" data-language=\{language\}/);
});

test("the visible hero renders translated dictionary values, not raw translation keys", () => {
  assert.match(page, /\{t\("heroTitle1"\)\}/);
  assert.match(page, /\{t\("heroTitle2"\)\}/);
  assert.doesNotMatch(page, />\s*heroTitle1\s*</);
  assert.doesNotMatch(page, />\s*heroTitle2\s*</);
});

test("six locales define the primary workspace shell translations", () => {
  const required = ["skip", "workspace", "independent", "localFirst", "backup", "restore", "ecosystem", "prepLayer", "ecosystemText", "startSituation", "intakeNote", "speak", "gettingStarted", "createStep", "assessmentStep", "prepareStep", "profileCompleteness", "trustTitle", "unknown", "sourceRules", "humanApproval", "curated", "passport", "privacyBoundary", "intelligence", "execution", "agentActions"];
  for (const locale of ["en", "hi", "kn", "ta", "te", "ml"]) {
    const block = page.match(new RegExp("^  " + locale + ": \\{([\\s\\S]*?)^  \\},?", "m"))?.[1] || "";
    for (const key of required) assert.match(block, new RegExp("\\b" + key + "\\s*:"), locale + " missing " + key);
  }
});
