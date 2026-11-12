import { test, expect } from "@playwright/test";

const profile = {
  fullName: "Test Citizen", age: 34, gender: "woman", state: "Karnataka", district: "Mysuru",
  residenceType: "urban", annualIncome: 150000, occupation: "Farmer", hasCultivableLand: true,
  pmKisanExcluded: "no", ownsPuccaHouse: false, previousHousingBenefit: "no", householdHasLpg: false,
  poorHouseholdDeclaration: true, isStudent: false, top20Percentile: null, regularUndergraduate: null,
  otherScholarship: null, diplomaOrDistance: null, mobileNumber: "", emailAddress: "", addressLine1: "",
  addressLine2: "", villageOrTown: "", pincode: "", fatherOrGuardianName: "", motherName: "",
  socialCategory: "", landholdingAcres: 2, institutionName: "", courseName: "", courseYear: "", rationCardCategory: ""
};

test("citizen journey executes eligibility, checklist and form-prefill tools without submission", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("janSetu.profile.v1", JSON.stringify(value)), profile);
  await page.goto("/app");
  await page.getByRole("button", { name: "Run benefits assessment" }).click();
  await expect(page.getByRole("heading", { name: "Document checklists and form preparation" })).toBeVisible();
  await expect(page.getByText("search_scheme_catalog")).toBeVisible();
  await expect(page.getByText("evaluate_scheme_rules")).toBeVisible();
  await expect(page.getByText("build_document_checklist")).toBeVisible();
  await expect(page.getByText("prepare_form_filling")).toBeVisible();
  await expect(page.getByText("Human confirmation is mandatory.")).toBeVisible();
  await expect(page.getByText("JanaSetu has not submitted anything.")).toBeVisible();
  await expect(page.getByRole("heading", { name: /PM-KISAN Samman Nidhi: pre-fill bundle/ })).toBeVisible();
});

test("voice intake transcribes into the text field using the selected locale", async ({ page }) => {
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      lang = ""; continuous = false; interimResults = false;
      onresult: ((event: any) => void) | null = null;
      onerror: (() => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        this.onresult?.({ results: [{ 0: { transcript: "ನಾನು 34 ವರ್ಷದ ಮಹಿಳಾ ರೈತ, ಕರ್ನಾಟಕ" }, isFinal: true }] });
        this.onend?.();
      }
      stop() { this.onend?.(); }
    }
    Object.defineProperty(window, "SpeechRecognition", { value: FakeSpeechRecognition, configurable: true });
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Speak" }).click();
  await expect(page.locator(".intake-text")).toHaveValue("ನಾನು 34 ವರ್ಷದ ಮಹಿಳಾ ರೈತ, ಕರ್ನಾಟಕ");
});


test("follow-up reminders survive reload in the local-first workspace", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("janSetu.profile.v1", JSON.stringify(value)), profile);
  await page.goto("/app");
  await page.getByRole("button", { name: "Run benefits assessment" }).click();
  await page.getByRole("button", { name: "Prepare local checklist" }).first().click();
  await page.getByRole("button", { name: "Add follow-up" }).click();
  await expect(page.getByText(/Review next step for PM-KISAN Samman Nidhi/)).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("janSetu.tasks.v1") || "[]").length)).toBe(1);
  await page.reload();
  await page.getByRole("button", { name: "Applications" }).click();
  await expect(page.getByText(/Review next step for PM-KISAN Samman Nidhi/)).toBeVisible();
});
