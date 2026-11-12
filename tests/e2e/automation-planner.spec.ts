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
