import { test, expect } from "@playwright/test";

test("automation planner locks scheme selection while a request is pending and labels discovery hints unverified", async ({ page }) => {
  let planCalls = 0;
  await page.addInitScript(() => {
    localStorage.setItem("janSetu.profile.v1", JSON.stringify({
      fullName: "Synthetic Citizen", age: 35, gender: "man", state: "Karnataka", district: "Mysuru",
      residenceType: "rural", annualIncome: 100000, occupation: "Farmer", hasCultivableLand: true,
      pmKisanExcluded: "no", ownsPuccaHouse: false, previousHousingBenefit: "no", householdHasLpg: false,
      poorHouseholdDeclaration: true, isStudent: false, top20Percentile: null, regularUndergraduate: null,
      otherScholarship: null, diplomaOrDistance: null, mobileNumber: "9876543210", emailAddress: "",
      addressLine1: "", addressLine2: "", villageOrTown: "", pincode: "570001", fatherOrGuardianName: "",
      motherName: "", socialCategory: "", landholdingAcres: 2, institutionName: "", courseName: "",
      courseYear: "", rationCardCategory: ""
    }));
  });
  await page.route("**/api/auth", (route) => route.fulfill({ json: { user: { id: "synthetic-user", email: "synthetic@example.test" } } }));
  await page.route("**/api/schemes/approved", (route) => route.fulfill({ json: { schemes: [] } }));
  await page.route("**/api/applications", (route) => route.fulfill({ json: { applications: [] } }));
  await page.route("**/api/automation/runs", (route) => route.fulfill({ json: { runs: [] } }));
  await page.route("**/api/reminders", (route) => route.fulfill({ json: { reminders: [] } }));
  await page.route("**/api/applications/prepare", (route) => route.fulfill({ json: { preparations: [] } }));
  await page.route("**/api/automation/plan", async (route) => {
    planCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 450));
    await route.fulfill({
      json: {
        scheme: { slug: "pm-kisan", name: "PM-KISAN Samman Nidhi" }, officialPortalUrl: null,
        assessment: { state: "needs_verification", headline: "Scheme not independently published", explanation: "No official assessment." },
        plan: { status: "verification_required", steps: [], capabilities: { prepareApplication: false, inspectPortal: false, assistFormFilling: false, uploadDocuments: false, bypassIdentityOrCaptcha: false, submitApplication: false, markSubmittedWithoutReceipt: false }, disclaimer: "No eligibility decision." },
        requirements: { source: "discovery_only_unverified", disclaimer: "Checklist hints are unverified discovery guidance." },
        execution: { mode: "plan_only", portalLogin: false, documentUpload: false, finalSubmission: false, identityChallengeBypass: false },
        dataHandling: "The profile is not persisted."
      }
    });
  });

  await page.goto("/app/automation");
  const scheme = page.getByLabel("Scheme");
  await expect(scheme).toBeVisible();
  await page.getByRole("button", { name: "Generate application plan" }).click();
  await expect(scheme).toBeDisabled();
  await expect(page.getByRole("button", { name: "Building plan…" })).toBeDisabled();
  await expect(page.getByText("Checklist hints are unverified discovery guidance.")).toBeVisible();
  await expect(scheme).toBeEnabled();
  expect(planCalls).toBe(1);
  await expect(page.locator(".automation-plan-result")).toContainText("PM-KISAN Samman Nidhi");
});


test("automation centre exports the local citizen profile directly for the browser helper", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("janSetu.profile.v1", JSON.stringify({
      fullName: "Synthetic Citizen", age: 35, gender: "man", state: "Karnataka", district: "Mysuru",
      residenceType: "rural", annualIncome: 100000, occupation: "Farmer", hasCultivableLand: true,
      pmKisanExcluded: "no", ownsPuccaHouse: false, previousHousingBenefit: "no", householdHasLpg: false,
      poorHouseholdDeclaration: true, isStudent: false, top20Percentile: null, regularUndergraduate: null,
      otherScholarship: null, diplomaOrDistance: null, mobileNumber: "9876543210", emailAddress: "",
      addressLine1: "", addressLine2: "", villageOrTown: "Mysuru", pincode: "570001", fatherOrGuardianName: "",
      motherName: "", socialCategory: "", landholdingAcres: 2, institutionName: "", courseName: "",
      courseYear: "", rationCardCategory: ""
    }));
    localStorage.setItem("janSetu.language.v1", JSON.stringify("en"));
  });
  await page.route("**/api/auth", (route) => route.fulfill({ json: { user: null } }));
  await page.route("**/api/schemes/approved", (route) => route.fulfill({ json: { schemes: [] } }));
  await page.route("**/api/ready", (route) => route.fulfill({ json: { capabilities: {} } }));
  await page.route("**/api/sources/health", (route) => route.fulfill({ json: { sources: [] } }));
  await page.goto("/app/automation");
  await expect(page.getByRole("heading", { name: "Start portal autofill in four steps" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download extension ZIP" }).first()).toHaveAttribute("href", "https://raw.githubusercontent.com/PSP-YN/JanaSetu-AI/main/public/downloads/JanaSetu-Form-Assistant.zip");
  await expect(page.getByRole("link", { name: "PM-KISAN new farmer registration" })).toHaveAttribute("href", "https://pmkisan.gov.in/RegistrationFormupdated.aspx");
  const extensionZip = await page.request.get("https://raw.githubusercontent.com/PSP-YN/JanaSetu-AI/main/public/downloads/JanaSetu-Form-Assistant.zip");
  expect(extensionZip.ok()).toBeTruthy();
  expect(extensionZip.headers()["content-type"]).toContain("application/zip");
  page.once("dialog", (dialog) => dialog.accept());
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download reviewed profile for autofill" }).click();
  expect((await download).suggestedFilename()).toBe("JanaSetu-Form-Assistant-Profile.json");
  await expect(page.getByText(/Profile export created/)).toBeVisible();
});


test("autofill start directs citizens to profile completion when no local profile exists", async ({ page }) => {
  await page.route("**/api/auth", (route) => route.fulfill({ json: { user: null } }));
  await page.route("**/api/schemes/approved", (route) => route.fulfill({ json: { schemes: [] } }));
  await routeIfNeeded(page);
  await page.goto("/app/automation");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Download reviewed profile for autofill" }).click();
  await expect(page).toHaveURL(/\/app\?tab=profile$/);
  await expect(page.locator(".nav-item").nth(2)).toHaveClass(/active/);
});


async function routeIfNeeded(page: import("@playwright/test").Page) {
  await page.route("**/api/ready", (route) => route.fulfill({ json: { capabilities: {} } }));
  await page.route("**/api/sources/health", (route) => route.fulfill({ json: { sources: [] } }));
}


test("workspace navigation opens the autofill automation centre", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("link", { name: "Applications & automation" }).click();
  await expect(page).toHaveURL(/\/app\/automation$/);
  await expect(page.getByRole("heading", { name: "Start portal autofill in four steps" })).toBeVisible();
});
