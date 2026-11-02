import { test, expect } from "@playwright/test";

const emptyProfile = {
  fullName: "", age: "", state: "", district: "", gender: "man",
  annualIncome: "", occupation: "", residenceType: "",
  hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
  previousHousingBenefit: "unknown", householdHasLpg: null,
  poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
  regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
};

test("extension does not confuse Male with Female or count an unmatched select as filled", async ({ page }) => {
  await page.setContent(`
    <label for="gender">Gender</label>
    <select id="gender" name="gender">
      <option value="">Choose</option>
      <option value="female">Female</option>
      <option value="male">Male</option>
    </select>
    <label for="exclusion">PM-KISAN exclusion category</label>
    <select id="exclusion" name="pmKisanExcluded">
      <option value="">Choose</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  `);
  await page.addScriptTag({ path: "extension/fill.js" });

  const result = await page.evaluate((profile) => (window as any).fillProfileInPage(profile), emptyProfile);

  expect(result.filled).toBe(1);
  await expect(page.locator("#gender")).toHaveValue("male");
  await expect(page.locator("#exclusion")).toHaveValue("");
});

test("extension skips a select when multiple options have the same exact label", async ({ page }) => {
  await page.setContent(`
    <label for="state">State</label>
    <select id="state" name="state">
      <option value="">Choose</option>
      <option value="KA">Karnataka</option>
      <option value="KAR">Karnataka</option>
    </select>
  `);
  await page.addScriptTag({ path: "extension/fill.js" });

  const result = await page.evaluate(() => (window as any).fillProfileInPage({
    ...{},
    fullName: "", age: "", state: "Karnataka", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null,
    poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
    regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  }));

  expect(result.filled).toBe(0);
  await expect(page.locator("#state")).toHaveValue("");
});
