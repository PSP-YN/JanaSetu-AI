import { test, expect } from "@playwright/test";
import { fillWithCitizenApproval } from "./extension-approval";

test("extension leaves account-holder names and file inputs untouched", async ({ page }) => {
  await page.setContent(`
    <label for="applicant">Applicant name</label>
    <input id="applicant" name="applicantName" type="text">
    <label for="accountHolder">Bank account holder name</label>
    <input id="accountHolder" name="accountHolderName" type="text">
    <label for="upload">State supporting document</label>
    <input id="upload" name="state" type="file">
  `);
  await page.addScriptTag({ path: "extension/fill.js" });

  const result = await fillWithCitizenApproval(page, {
    fullName: "Synthetic Citizen", age: "", state: "Karnataka", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null,
    poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
    regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  });

  expect(result.filled).toBe(1);
  await expect(page.locator("#applicant")).toHaveValue("Synthetic Citizen");
  await expect(page.locator("#accountHolder")).toHaveValue("");
  await expect(page.locator("#upload")).toHaveValue("");
});
