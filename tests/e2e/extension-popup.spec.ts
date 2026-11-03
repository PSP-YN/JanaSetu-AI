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
      scripting: { executeScript: async (call: unknown) => {
        (window as any).__lastScriptCall = call;
        return [{ result: { filled: 2 } }];
      } }
    } });
  }, initialUrl);
  await page.addScriptTag({ path: "extension/fill.js" });
  await page.addScriptTag({ path: "extension/popup.js" });
}

test("extension popup imports the reviewed backup language and click-fills only on a government domain", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "janSetu-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: syntheticProfile, language: "kn" }))
  });
  await page.locator("#save").click();
  await expect(page.locator("#status")).toContainText("ಪ್ರೊಫೈಲ್");
  await expect(page.locator("#fill")).toContainText("ಸಕ್ರಿಯ ಟ್ಯಾಬ್");

  await page.locator("#fill").click();
  await expect(page.locator("#status")).toContainText("2 ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರ");
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call.target.tabId).toBe(44);
  expect(call.args[0].fullName).toBe("Synthetic Citizen");
});

test("extension popup rejects deceptive non-government hostnames", async ({ page }) => {
  await openPopup(page, "https://portal.gov.in.attacker.example/login");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await expect(page.locator("#status")).toContainText("limited to HTTPS .gov.in and .nic.in");
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call).toBeNull();
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
