import { test, expect } from "@playwright/test";

test("extension does not mistake a login username field for a citizen name field", async ({ page }) => {
  await page.setContent('<label for="username">Username</label><input id="username" name="username" placeholder="Username">');
  await page.addScriptTag({ path: "extension/fill.js" });

  const result = await page.evaluate(() => (window as any).fillProfileInPage({
    fullName: "Synthetic Citizen", age: "", state: "", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null,
    poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
    regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  }));

  expect(result.filled).toBe(0);
  await expect(page.locator("#username")).toHaveValue("");
});
