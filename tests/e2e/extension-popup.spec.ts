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

async function openPopup(page: import("@playwright/test").Page, initialUrl = "https://pmkisan.gov.in/RegistrationFormupdated.aspx") {
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
        if (scriptCall.args[1] === "safe") {
          return [{ result: { filled: 6, stale: 0, mode: "safe", manualSteps: ["Read and enter the CAPTCHA yourself in the portal.", "Request and enter the OTP yourself in the portal."] } }];
        }
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

test("popup shows the active supported portal URL before the citizen confirms it", async ({ page }) => {
  await openPopup(page, "https://ssp.karnataka.gov.in/CA/");
  await expect(page.locator("#active-site")).toContainText("https://ssp.karnataka.gov.in/CA/");
  await expect(page.locator("#ssp-aadhaar-group")).toBeVisible();
  await expect(page.locator("#verify-portal")).not.toBeChecked();
});

test("extension imports the reviewed profile and fills only after address and field confirmation", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "janSetu-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: syntheticProfile, language: "kn" }))
  });
  await expect(page.locator("#status")).toContainText("ಪ್ರೊಫೈಲ್");
  await expect(page.locator("#backup")).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#fill")).toContainText("ಪೂರ್ವವೀಕ್ಷಿಸಿ");

  await page.locator("#fill").click();
  await expect(page.locator("#active-site")).toContainText("https://pmkisan.gov.in/RegistrationFormupdated.aspx");
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

test("redirected Karnataka SSP host is accepted and keeps the one-session Aadhaar input out of storage", async ({ page }) => {
  await openPopup(page, "https://ssp.karnataka.gov.in/CA/");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await expect(page.locator("#active-site")).toContainText("https://ssp.karnataka.gov.in/CA/");
  await expect(page.locator("#ssp-aadhaar-group")).toBeVisible();
  await page.locator("#verify-portal").check();
  await page.locator("#ssp-aadhaar").fill("123456789012");
  await page.locator("#fill").click();
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call.args[2].aadhaarNumber).toBe("123456789012");
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
  await openPopup(page, "https://pmkisan.gov.in/RegistrationFormupdated.aspx");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#fill").click();
  await page.locator("#verify-portal").check();
  await page.locator("#fill").click();
  await expect(page.locator("#preview .preview-row")).toHaveCount(2);
  await page.locator("#preview .preview-row input").first().check();
  await page.evaluate(() => { (window as any).__popupTab.url = "https://pmkisan.gov.in/another-step"; });
  await page.locator("#apply").click();
  await expect(page.locator("#verify-portal")).not.toBeChecked();
  expect(await page.evaluate(() => (window as any).__lastScriptCall.args.length)).toBe(3);
  expect(await page.evaluate(() => (window as any).__lastScriptCall.args[2].aadhaarNumber)).toBe("");
});

test("extension popup rejects deceptive non-government hostnames", async ({ page }) => {
  await openPopup(page, "https://pmkisan.gov.in.attacker.example/login");
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
  await expect(page.locator("#status")).toContainText("Profile incomplete or has unsupported fields");
  await expect(page.locator("#backup")).toHaveAttribute("aria-invalid", "true");
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
  await expect(page.locator("#status")).toContainText("Profile incomplete or has unsupported fields");
  await expect(page.locator("#backup")).toHaveAttribute("aria-invalid", "true");
  const profile = await page.evaluate(() => (window as any).__popupStorage.profile);
  expect(profile).toBeUndefined();
});


test("storage failures do not mark a valid backup file as invalid", async ({ page }) => {
  await openPopup(page);
  await page.evaluate(() => {
    (window as any).chrome.storage.local.set = async () => { throw new Error("storage quota exceeded"); };
  });
  await page.locator("#backup").setInputFiles({
    name: "valid-profile.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: syntheticProfile, language: "en" }))
  });
  await expect(page.locator("#status")).toContainText("Import failed");
  await expect(page.locator("#backup")).not.toHaveAttribute("aria-invalid", "true");
});


test("new backup selection clears the invalid state before importing a valid profile", async ({ page }) => {
  await openPopup(page);
  await expect(page.locator("#backup")).toHaveAttribute("aria-describedby", "status");
  await page.locator("#backup").setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from("{") });
  await expect(page.locator("#backup")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#backup").setInputFiles({
    name: "valid-profile.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: syntheticProfile, language: "en" }))
  });
  await expect(page.locator("#backup")).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#status")).toContainText("Profile imported");
});


test("a superseded import clears an already-open preview after its storage write commits", async ({ page }) => {
  await openPopup(page);
  await page.evaluate(() => {
    let releaseFirst!: () => void;
    let releaseSecond!: () => void;
    let firstStarted!: () => void;
    let secondStarted!: () => void;
    const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const secondGate = new Promise<void>((resolve) => { releaseSecond = resolve; });
    const firstStartedPromise = new Promise<void>((resolve) => { firstStarted = resolve; });
    const secondStartedPromise = new Promise<void>((resolve) => { secondStarted = resolve; });
    (window as any).__importGates = { firstGate: firstStartedPromise, secondGate: secondStartedPromise, releaseFirst, releaseSecond };
    (window as any).chrome.storage.local.set = async (data: Record<string, any>) => {
      if (data.profile.fullName === "First Citizen") { firstStarted(); await firstGate; }
      if (data.profile.fullName === "Second Citizen") { secondStarted(); await secondGate; }
      Object.assign((window as any).__popupStorage, data);
    };
  });

  const backup = (name: string) => ({
    name: `${name.toLowerCase().replaceAll(" ", "-")}.json`, mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: { ...syntheticProfile, fullName: name }, language: "en" }))
  });
  await page.locator("#backup").setInputFiles(backup("First Citizen"));
  await page.evaluate(async () => await (window as any).__importGates.firstGate);
  await page.locator("#preview").evaluate((element) => { element.innerHTML = '<div class="preview-row">Stale preview</div>'; });
  await page.locator("#backup").setInputFiles(backup("Second Citizen"));
  await page.evaluate(() => (window as any).__importGates.releaseFirst());
  await page.evaluate(async () => await (window as any).__importGates.secondGate);
  await expect(page.locator("#preview .preview-row")).toHaveCount(0);
  await expect(page.locator("#apply")).toBeDisabled();
  await expect(page.locator("#status")).not.toContainText("Profile imported");
  await page.evaluate(() => (window as any).__importGates.releaseSecond());
  await expect(page.locator("#status")).toContainText("Profile imported");
  expect(await page.evaluate(() => (window as any).__popupStorage.profile.fullName)).toBe("Second Citizen");
});


test("one-click safe autofill fills mapped non-sensitive fields but leaves CAPTCHA, OTP and protected actions to the citizen", async ({ page }) => {
  await openPopup(page);
  await page.locator("#backup").setInputFiles({
    name: "safe-autofill.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ app: "JanaSetu", schemaVersion: 1, profile: syntheticProfile, language: "en" }))
  });
  await expect(page.locator("#status")).toContainText("Profile imported");
  await page.locator("#verify-portal").check();
  await page.locator("#auto-fill").click();
  await expect(page.locator("#status")).toContainText("Automatically filled 6 safe field(s)");
  await expect(page.locator("#manual-steps")).toContainText("CAPTCHA");
  await expect(page.locator("#manual-steps")).toContainText("OTP");
  const call = await page.evaluate(() => (window as any).__lastScriptCall);
  expect(call.args[1]).toBe("safe");
  expect(call.args[2].aadhaarNumber).toBeUndefined();
});

test("extension rejects an unlisted government-looking hostname", async ({ page }) => {
  await openPopup(page, "https://portal.gov.in/app");
  await page.evaluate((profile) => Object.assign((window as any).__popupStorage, { profile, language: "en" }), syntheticProfile);
  await page.locator("#verify-portal").check();
  await page.locator("#auto-fill").click();
  await expect(page.locator("#status")).toContainText("supported official HTTPS government portal");
  expect(await page.evaluate(() => (window as any).__lastScriptCall)).toBeNull();
});


test("safe autofill function fills only its allowlist and never changes OTP, CAPTCHA, Aadhaar, consent, file or submit controls", async ({ page }) => {
  await page.setContent(`
    <form id="application">
      <label for="applicant">Applicant name</label><input id="applicant" name="applicant_name">
      <label for="district">District</label><input id="district" name="district">
      <label for="mobile">Mobile number</label><input id="mobile" name="mobile">
      <label for="aadhaar">Aadhaar number</label><input id="aadhaar" name="aadhaar_number">
      <label for="captcha">CAPTCHA</label><input id="captcha" name="captcha">
      <label for="otp">OTP</label><input id="otp" name="otp">
      <label for="consent">I agree to the declaration</label><input id="consent" type="checkbox" name="declaration">
      <label for="document">Upload certificate</label><input id="document" type="file" name="certificate">
      <button type="submit">Submit application</button>
    </form>`);
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await page.evaluate(() => (window as any).fillProfileInPage({
    fullName: "Synthetic Citizen", district: "Mysuru", mobileNumber: "9876543210"
  }, "safe", {}));
  expect(result.filled).toBe(2);
  expect(await page.locator("#applicant").inputValue()).toBe("Synthetic Citizen");
  expect(await page.locator("#district").inputValue()).toBe("Mysuru");
  expect(await page.locator("#mobile").inputValue()).toBe("");
  expect(await page.locator("#aadhaar").inputValue()).toBe("");
  expect(await page.locator("#captcha").inputValue()).toBe("");
  expect(await page.locator("#otp").inputValue()).toBe("");
  expect(await page.locator("#consent").isChecked()).toBe(false);
  expect(result.manualSteps.join(" ")).toContain("CAPTCHA");
  expect(result.manualSteps.join(" ")).toContain("OTP");
  expect(result.manualSteps.join(" ")).toContain("upload required documents yourself");
  expect(result.manualSteps.join(" ")).toContain("declaration checkbox yourself");
  expect(await page.locator("form").evaluate(form => (form as HTMLFormElement).dataset.submitted || "")).toBe("");
});
