import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const syntheticProfile = {
  fullName: "Synthetic Citizen", age: 30, gender: "woman", state: "Karnataka", district: "Mysuru",
  residenceType: "urban", annualIncome: 100000, occupation: "Farmer",
  hasCultivableLand: true, pmKisanExcluded: "no", ownsPuccaHouse: false,
  previousHousingBenefit: "no", householdHasLpg: false, poorHouseholdDeclaration: true,
  isStudent: false, top20Percentile: null, regularUndergraduate: null,
  otherScholarship: null, diplomaOrDistance: null
};

async function openPopup(page: import("@playwright/test").Page, initialUrl = "https://portal.gov.in/app") {
  const html = readFileSync("extension/popup.html", "utf8").replace(/\s*<script src="[^"]+"><\/script>/g, "");
  await page.setContent(html);
  await page.evaluate((url) => {
    const storage: Record<string, unknown> = {};
    Object.defineProperty(window, "__popupStorage", { value: storage, configurable: true });
    Object.defineProperty(window, "__popupTab", { value: { id: 44, url }, configurable: true });
    Object.defineProperty(window, "__lastScriptCall", { value: null, writable: true, configurable: true });
    Object.defineProperty(window, "chrome", { configurable: true, value: {
      storage: { local: {
        get: async (keys: string[] | string) => {
          const list = Array.isArray(keys) ? keys : [keys];
          return Object.fromEntries(list.map((key) => [key, storage[key]]));
        },
        set: async (data: Record<string, unknown>) => Object.assign(storage, data)
      } },
      tabs: { query: async () => [(window as any).__popupTab] },
      runtime: { getURL: (path: string) => path },
      notifications: { create: async (_id: string, options: unknown, callback?: (id: string) => void) => { (window as any).__notification = options; callback?.(_id); } },
      scripting: { executeScript: async (call: unknown) => {
        (window as any).__lastScriptCall = call;
        const scriptCall = call as { args: any[] };
        if (!Array.isArray(scriptCall.args[1])) {
          return [{ result: { preview: [
            { index: 0, key: "fullName", label: "Applicant name", value: "Synthetic Citizen", fingerprint: "name-1", valid: true, reason: "" },
            { index: 1, key: "age", label: "Age", value: "30", fingerprint: "age-1", valid: true, reason: "" }
          ], manualSteps: scriptCall.args[2]?.aadhaarNumber ? ["Review and click portal buttons yourself."] : [] } }];
        }
        return [{ result: { filled: scriptCall.args[1].length, stale: 0, manualSteps: [] } }];
      } }
    } });
  }, initialUrl);
  await page.addScriptTag({ path: "extension/fill.js" });
  await page.addScriptTag({ path: "extension/popup.js" });
}

test("extension imports the reviewed profile and fills only after address and field confirmation", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "janSetu-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: syntheticProfile, language: "kn" }))
  });
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("ಪ್ರೊಫೈಲ್");
  await expect(page.locator("#fill")).toContainText("ಪೂರ್ವವೀಕ್ಷಿಸಿ");

  await page.locator("#fill").click();
  await expect(page.locator("#active-site")).toContainText("https://portal.gov.in/app");
  expect(await page.evaluate(() => (window as any).__lastScriptCall)).toBeNull();
  await page.locator("#verify-portal").check();
  await page.locator("#fill").click();
  await expect(page.locator("#preview .preview-row")).toHaveCount(2);
  await page.locator("#preview .preview-row input").first().check();
  await page.locator("#apply").click();
  await expect(page.locator("#status")).toContainText("1 ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಲಾಗಿದೆ");
  await expect(page.locator("#status")).toContainText("ಇಲ್ಲಿಯೇ ನಿಲ್ಲುತ್ತದೆ");
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call.args[1]).toHaveLength(1);
});

test("SSP popup value is passed only to the active SSP fill session and is not stored", async ({ page }) => {
  await openPopup(page, "https://ssp.postmatric.karnataka.gov.in/CA/");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await expect(page.locator("#ssp-aadhaar-group")).toBeVisible();
  await page.locator("#verify-portal").check();
  await page.locator("#ssp-aadhaar").fill("123456789012");
  await page.locator("#fill").click();
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call.args[2].aadhaarNumber).toBe("123456789012");
  expect(await page.evaluate(() => (window as any).__notification.title)).toBe("JanaSetu: action needed in browser");
  const stored = await page.evaluate(() => (window as any).__popupStorage);
  expect(stored.profile.aadhaarNumber).toBeUndefined();
  expect(stored.aadhaarNumber).toBeUndefined();
});

test("the observed PM-KISAN registration route can preview only after the citizen verifies its address", async ({ page }) => {
  await openPopup(page, "https://pmkisan.gov.in/RegistrationFormupdated.aspx");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await expect(page.locator("#status")).toContainText("verify its exact URL");
  expect(await page.evaluate(() => (window as any).__lastScriptCall)).toBeNull();
  await page.locator("#verify-portal").check();
  await page.locator("#fill").click();
  await expect(page.locator("#preview .preview-row")).toHaveCount(2);
  await page.locator("#preview .preview-row input").first().check();
  await page.locator("#apply").click();
  await expect(page.locator("#status")).toContainText("Filled 1 matching field");
});


test("changing the active portal URL invalidates the per-session confirmation and preview", async ({ page }) => {
  await openPopup(page, "https://portal.gov.in/app");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await page.locator("#verify-portal").check();
  await page.locator("#fill").click();
  await expect(page.locator("#preview .preview-row")).toHaveCount(2);
  await page.locator("#preview .preview-row input").first().check();
  await page.evaluate(() => { (window as any).__popupTab.url = "https://portal.gov.in/another-step"; });
  await page.locator("#apply").click();
  await expect(page.locator("#verify-portal")).not.toBeChecked();
  expect(await page.evaluate(() => (window as any).__lastScriptCall.args.length)).toBe(3);
  expect(await page.evaluate(() => (window as any).__lastScriptCall.args[2].aadhaarNumber)).toBe("");
});

test("extension popup rejects deceptive non-government hostnames", async ({ page }) => {
  await openPopup(page, "https://portal.gov.in.attacker.example/login");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await expect(page.locator("#status")).toContainText("verify its exact URL");
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call).toBeNull();
});

test("extension rejects unsupported occupations during profile import", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "unsupported-occupation.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, language: "en", profile: { ...syntheticProfile, occupation: "Government Employee" } }))
  });
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("Import failed");
  expect(await page.evaluate(() => (window as any).__popupStorage.profile)).toBeUndefined();
});

test("extension normalizes a localized occupation alias during backup import", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "localized-occupation.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, language: "hi", profile: { ...syntheticProfile, occupation: "किसान" } }))
  });
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("प्रोफ़ाइल");
  expect(await page.evaluate(() => (window as any).__popupStorage.profile.occupation)).toBe("Farmer");
});

test("extension rejects malformed profile backups before storing citizen data", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "tampered-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, language: "en", profile: { ...syntheticProfile, aadhaar: "123456789012" } }))
  });
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("Import failed");
  const profile = await page.evaluate(() => (window as any).__popupStorage.profile);
  expect(profile).toBeUndefined();
});
