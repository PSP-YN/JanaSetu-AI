import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const extension = readFileSync(new URL("../extension/popup.js", import.meta.url), "utf8");
const popupHtml = readFileSync(new URL("../extension/popup.html", import.meta.url), "utf8");
const extensionReadme = readFileSync(new URL("../extension/README.md", import.meta.url), "utf8");

test("form assistant requires per-session citizen verification of an HTTPS government portal address", () => {
  assert.ok(extension.includes("getCitizenConfirmedPortalTab"));
  assert.ok(extension.includes('host.endsWith(".gov.in")'));
  assert.ok(extension.includes('host.endsWith(".nic.in")'));
  assert.ok(extension.includes('portalUrl.protocol!=="https:"'));
  assert.ok(extension.includes("verifyPortalCheckbox.checked"));
  assert.ok(extension.includes("tab.url!==pendingUrl"));
  assert.doesNotMatch(extension, /PORTAL_ROUTE_POLICIES/);
  assert.match(popupHtml, /id="verify-portal"/);
  assert.match(popupHtml, /id="active-site"/);
  assert.match(extensionReadme, /per-session address-confirmation checkbox/);
  assert.match(extensionReadme, /not a department-authorized or certified scheme integration/i);
  assert.doesNotMatch(extensionReadme, /blocks live portal filling until an exact route/i);
});

test("form assistant has no automatic submission or document upload code", () => {
  assert.doesNotMatch(extension, /\.requestSubmit\s*\(|\.submit\s*\(/);
  assert.doesNotMatch(extension, /type=["']file["'].*\.files/);
  assert.doesNotMatch(extension, /fetch\s*\(|XMLHttpRequest/);
});

test("form assistant requires an explicit user click before filling", () => {
  assert.match(extension, /getElementById\("fill"\)\.addEventListener\("click"/);
  assert.match(popupHtml, /Portal scripts may react to field changes/);
});

test("extension popup translations have six-locale key parity and cover every HTML label", () => {
  const localeBlocks = Array.from(extension.matchAll(/^  (en|hi|kn|ta|te|ml): \{([\s\S]*?)^  \},?$/gm));
  assert.equal(localeBlocks.length, 6, "expected six extension locale dictionaries");
  const keysByLocale = localeBlocks.map(([, locale, block]) => ({
    locale,
    keys: new Set(Array.from(block.matchAll(/(?:^|,)\s*([A-Za-z][A-Za-z0-9_]*)\s*:/gm), match => match[1]))
  }));
  const baseline = JSON.stringify(Array.from(keysByLocale.find(entry => entry.locale === "en")!.keys).sort());
  for (const entry of keysByLocale) assert.equal(JSON.stringify(Array.from(entry.keys).sort()), baseline, `${entry.locale} popup translation keys differ from English`);
  const htmlKeys = Array.from(popupHtml.matchAll(/data-i18n="([^"]+)"/g), match => match[1]);
  for (const entry of keysByLocale) for (const key of htmlKeys) assert.ok(entry.keys.has(key), `${entry.locale} is missing popup label ${key}`);
  const portalCaveats: Record<string, string> = {
    en: "Portal scripts may react to field changes", hi: "पोर्टल की स्क्रिप्ट", kn: "ಪೋರ್ಟಲ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು",
    ta: "போர்டல் ஸ்கிரிப்டுகள்", te: "పోర్టల్ స్క్రిప్ట్‌లు", ml: "പോർട്ടൽ സ്ക്രിപ്റ്റുകൾ"
  };
  for (const [, locale, block] of localeBlocks) assert.ok(block.includes(portalCaveats[locale]), `${locale} warning must explain that portal scripts may react to field changes`);
});

test("extension imports the expanded citizen profile but rejects identity and bank identifiers", () => {
  assert.match(extension, /"mobileNumber","emailAddress","addressLine1","addressLine2","villageOrTown","pincode"/);
  assert.match(extension, /"fatherOrGuardianName","motherName","socialCategory","landholdingAcres","institutionName","courseName","courseYear","rationCardCategory"/);
  assert.match(extension, /profile\.mobileNumber/);
  assert.match(extension, /profile\.pincode/);
  assert.doesNotMatch(extension, /"aadhaarNumber"|"bankAccountNumber"|"ifscCode"/);
});
