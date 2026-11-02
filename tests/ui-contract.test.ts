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
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \\{([\\s\\S]*?)^  \\},?$/gm));
  assert.equal(localeBlocks.length, 6);
  for (const [, locale, block] of localeBlocks) {
    for (const key of required) assert.match(block, new RegExp("\\\\b" + key + "\\\\s*:"), locale + " missing " + key);
  }
});

test("locale dictionaries do not define duplicate keys", () => {
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  for (const [, locale, block] of localeBlocks) {
    const keys = Array.from(block.matchAll(/^\s+([A-Za-z0-9_]+):/gm), match => match[1]);
    assert.equal(new Set(keys).size, keys.length, locale + " contains duplicate translation keys");
  }
});


test("all six locale dictionaries have exact translation-key parity", () => {
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  const keysByLocale = localeBlocks.map(([, locale, block]) => {
    const keys = Array.from(block.matchAll(/^\s+([A-Za-z0-9_]+):/gm), match => match[1]);
    return { locale, keys: [...new Set(keys)].sort() };
  });
  assert.equal(keysByLocale.length, 6);
  const baseline = JSON.stringify(keysByLocale.find(x => x.locale === "en")?.keys);
  for (const entry of keysByLocale) assert.equal(JSON.stringify(entry.keys), baseline, entry.locale + " translation keys differ from English");
});
