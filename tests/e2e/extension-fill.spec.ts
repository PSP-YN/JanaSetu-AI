import { test, expect } from "@playwright/test";
import path from "node:path";
import { fillWithCitizenApproval } from "./extension-approval";

const profile = {
  fullName: "Synthetic Citizen", age: 34, gender: "woman", state: "Karnataka",
  district: "Mysuru", residenceType: "urban", annualIncome: 150000,
  occupation: "Farmer", hasCultivableLand: true, pmKisanExcluded: "no",
  ownsPuccaHouse: false, previousHousingBenefit: "no", householdHasLpg: false,
  poorHouseholdDeclaration: true, isStudent: false, top20Percentile: null,
  regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
};

async function loadFill(page: import("@playwright/test").Page, html: string) {
  await page.setContent(html);
  await page.addScriptTag({ path: path.join(process.cwd(), "extension/fill.js") });
  return fillWithCitizenApproval(page,profile);
}

test("synthetic basic labelled text and number fields fill", async ({ page }) => {
  const result = await loadFill(page, `
    <label>Applicant name <input name="applicantName"></label>
    <label>Age <input type="number" name="age"></label>
    <label>District <input name="district"></label>`);
  expect(result.filled).toBe(3);
  await expect(page.locator('[name="applicantName"]')).toHaveValue("Synthetic Citizen");
  await expect(page.locator('[name="age"]')).toHaveValue("34");
  await expect(page.locator('[name="district"]')).toHaveValue("Mysuru");
});

test("select and radio controls only choose exact semantic values", async ({ page }) => {
  const result = await loadFill(page, `
    <label>State <select name="state"><option value="">Choose</option><option value="KA">Karnataka</option></select></label>
    <fieldset><legend>Gender</legend>
      <label><input type="radio" name="gender" value="Female">Female</label>
      <label><input type="radio" name="gender" value="Male">Male</label>
    </fieldset>`);
  expect(result.filled).toBe(2);
  await expect(page.locator('[name="state"]')).toHaveValue("KA");
  await expect(page.locator('[name="gender"][value="Female"]')).toBeChecked();
  await expect(page.locator('[name="gender"][value="Male"]')).not.toBeChecked();
});

test("ambiguous duplicate labels are skipped rather than guessed", async ({ page }) => {
  const result = await loadFill(page, `
    <label>Applicant name <input name="primaryName"></label>
    <label>Applicant name <input name="secondaryName"></label>`);
  expect(result.filled).toBe(0);
  await expect(page.locator('[name="primaryName"]')).toHaveValue("");
  await expect(page.locator('[name="secondaryName"]')).toHaveValue("");
});

test("sensitive fields, hidden fields, disabled fields and consent checkboxes remain untouched", async ({ page }) => {
  const result = await loadFill(page, `
    <label>Aadhaar number <input name="aadhaar" value=""></label>
    <label>OTP <input name="otp" value=""></label>
    <label>Password <input type="password" name="password"></label>
    <label>Consent <input type="checkbox" name="consent"></label>
    <input type="hidden" name="hidden" value="">
    <label>District <input name="district" disabled></label>`);
  expect(result.filled).toBe(0);
  await expect(page.locator('[name="aadhaar"]')).toHaveValue("");
  await expect(page.locator('[name="otp"]')).toHaveValue("");
  await expect(page.locator('[name="password"]')).toHaveValue("");
  await expect(page.locator('[name="consent"]')).not.toBeChecked();
});

test("React-style controlled input receives native input and change events", async ({ page }) => {
  await page.setContent(`<label>Applicant name <input id="name"></label><output id="state"></output>`);
  await page.evaluate(() => {
    const input = document.querySelector("#name") as HTMLInputElement;
    const output = document.querySelector("#state")!;
    const sync = () => { output.textContent = input.value; };
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
  });
  await page.addScriptTag({ path: path.join(process.cwd(), "extension/fill.js") });
  const result = await fillWithCitizenApproval(page,profile);
  expect(result.filled).toBe(1);
  await expect(page.locator("output")).toHaveText("Synthetic Citizen");
});

test("unmatched labels are left unchanged", async ({ page }) => {
  const result = await loadFill(page, `<label>Unique portal reference <input name="reference"></label>`);
  expect(result.filled).toBe(0);
  await expect(page.locator("input")).toHaveValue("");
});
