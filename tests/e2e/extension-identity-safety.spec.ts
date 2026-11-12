import { test, expect } from "@playwright/test";
import { fillWithCitizenApproval } from "./extension-approval";

test("extension does not mistake a login username field for a citizen name field", async ({ page }) => {
  await page.setContent('<label for="username">Username</label><input id="username" name="username" placeholder="Username">');
  await page.addScriptTag({ path: "extension/fill.js" });

  const result = await fillWithCitizenApproval(page, {
    fullName: "Synthetic Citizen", age: "", state: "", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null,
    poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
    regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  });

  expect(result.filled).toBe(0);
  await expect(page.locator("#username")).toHaveValue("");
});

test("extension does not place a full name into first-name or last-name fields", async ({ page }) => {
  await page.setContent(`
    <label for="first">First name</label><input id="first" name="firstName">
    <label for="last">Last name</label><input id="last" name="lastName">
  `);
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await fillWithCitizenApproval(page, {
    fullName: "Synthetic Citizen", age: "", state: "", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null, poorHouseholdDeclaration: null,
    isStudent: false, top20Percentile: null, regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  });
  expect(result.filled).toBe(0);
  await expect(page.locator("#first")).toHaveValue("");
  await expect(page.locator("#last")).toHaveValue("");
});

test("extension does not put the applicant full name into a relative-name field", async ({ page }) => {
  await page.setContent("<label for=\"father\">Name of Applicant's Father</label><input id=\"father\" name=\"fatherName\">");
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await fillWithCitizenApproval(page, {
    fullName: "Synthetic Citizen", age: "", state: "", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null, poorHouseholdDeclaration: null,
    isStudent: false, top20Percentile: null, regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  });
  expect(result.filled).toBe(0);
  await expect(page.locator("#father")).toHaveValue("");
});

test("extension still fills an unambiguous standalone Name field", async ({ page }) => {
  await page.setContent('<label for="name">Name</label><input id="name" name="name">');
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await fillWithCitizenApproval(page, {
    fullName: "Synthetic Citizen", age: "", state: "", district: "", gender: "",
    annualIncome: "", occupation: "", residenceType: "",
    hasCultivableLand: null, pmKisanExcluded: "unknown", ownsPuccaHouse: null,
    previousHousingBenefit: "unknown", householdHasLpg: null, poorHouseholdDeclaration: null,
    isStudent: false, top20Percentile: null, regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  });
  expect(result.filled).toBe(1);
  await expect(page.locator("#name")).toHaveValue("Synthetic Citizen");
});
