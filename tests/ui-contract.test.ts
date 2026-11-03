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
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  assert.equal(localeBlocks.length, 6);
  for (const [, locale, block] of localeBlocks) {
    for (const key of required) assert.match(block, new RegExp("\\b" + key + "\\s*:"), locale + " missing " + key);
  }
});

test("locale dictionaries do not define duplicate keys", () => {
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  for (const [, locale, block] of localeBlocks) {
    const keys = Array.from(block.matchAll(/(?:^|,)\s*["\']?([A-Za-z][A-Za-z0-9_-]*)["\']?\s*:/gm), match => match[1]);
    assert.equal(new Set(keys).size, keys.length, locale + " contains duplicate translation keys");
  }
});


test("all six locale dictionaries have exact translation-key parity", () => {
  const localeBlocks = Array.from(page.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  const keysByLocale = localeBlocks.map(([, locale, block]) => {
    const keys = Array.from(block.matchAll(/(?:^|,)\s*["\']?([A-Za-z][A-Za-z0-9_-]*)["\']?\s*:/gm), match => match[1]);
    return { locale, keys: Array.from(new Set(keys)).sort() };
  });
  assert.equal(keysByLocale.length, 6);
  const baseline = JSON.stringify(keysByLocale.find(x => x.locale === "en")?.keys);
  for (const entry of keysByLocale) assert.equal(JSON.stringify(entry.keys), baseline, entry.locale + " translation keys differ from English");
});

test("every rendered translation key has an English fallback and every locale has localized coverage", () => {
  const baseSource = page.slice(page.indexOf("const COPY:"), page.indexOf("const UI_COPY:"));
  const extraSource = page.slice(page.indexOf("const UI_COPY:"), page.indexOf("\nfunction formatMoney"));
  const locales = ["en", "hi", "kn", "ta", "te", "ml"];
  const keysFor = (source: string, locale: string, supplemental: boolean) => {
    const match = supplemental ? source.match(new RegExp("^  " + locale + ": \\{([^\\n]*)\\}", "m")) : source.match(new RegExp("^  " + locale + ": \\{([\\s\\S]*?)^  \\},?", "m"));
    const block = match?.[1] || "";
    return new Set(Array.from(block.matchAll(/\b([A-Za-z][A-Za-z0-9_]*)\s*:/g), m => m[1]));
  };
  const base = new Map(locales.map(locale => [locale, keysFor(baseSource, locale, false)]));
  const extra = new Map(locales.map(locale => [locale, keysFor(extraSource, locale, true)]));
  const englishKeys = new Set([...Array.from(base.get("en")!), ...Array.from(extra.get("en")!)]);
  const renderedKeys = new Set(Array.from(page.matchAll(/\bt\("([A-Za-z][A-Za-z0-9_]*)"\)/g), m => m[1]));
  for (const key of Array.from(renderedKeys)) assert.ok(englishKeys.has(key), `English fallback missing for ${key}`);
  for (const locale of locales) {
    for (const key of Array.from(extra.get("en")!)) {
      assert.ok(extra.get(locale)!.has(key) || base.get(locale)!.has(key), `${locale} has no translated value for ${key}`);
    }
  }
});
