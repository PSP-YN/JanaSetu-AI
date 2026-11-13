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

test("Karnataka SSP create-account Aadhaar field is filled only after citizen approval and the proceed button is never clicked", async ({ page }) => {
  await page.setContent(`
    <form id="form1">
      <div class="form-group">
        <label class="control-label" for="ddlPerDistrict">Enter Student Aadhaar number</label>
        <input name="ctl00$ContentPlaceHolder1$txtAadhaarNo" type="text" maxlength="12" id="ContentPlaceHolder1_txtAadhaarNo" class="form-control custom-textbox">
      </div>
      <input type="submit" name="ctl00$ContentPlaceHolder1$btnAadhaar_authentication" value="Click to proceed" id="ContentPlaceHolder1_btnAadhaar_authentication">
    </form>
  `);
  await page.addScriptTag({ path: path.join(process.cwd(), "extension/fill.js") });
  await page.evaluate(() => {
    (window as any).__clicked = false;
    (window as any).__submitted = false;
    document.querySelector("#form1")!.addEventListener("submit", event => { event.preventDefault(); (window as any).__submitted = true; });
    document.querySelector("#ContentPlaceHolder1_btnAadhaar_authentication")!.addEventListener("click", () => { (window as any).__clicked = true; });
  });
  const result = await fillWithCitizenApproval(page, profile, { aadhaarNumber: "123456789012" });
  expect(result.filled).toBe(1);
  expect(result.manualSteps).toContain("Review the page and click portal buttons yourself. JanaSetu will not click Proceed, Verify, Apply or Submit.");
  await expect(page.locator("#ContentPlaceHolder1_txtAadhaarNo")).toHaveValue("123456789012");
  expect(await page.evaluate(() => (window as any).__clicked)).toBe(false);
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
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

test("extension field assistance never triggers the portal form submit action", async ({ page }) => {
  await page.setContent(`
    <form id="official-form">
      <label>Applicant name <input name="applicantName"></label>
      <button type="submit">Submit application</button>
    </form>
    <output id="submit-count">0</output>
  `);
  await page.evaluate(() => {
    const form = document.querySelector("#official-form")!;
    const output = document.querySelector("#submit-count")!;
    form.addEventListener("submit", event => {
      event.preventDefault();
      output.textContent = String(Number(output.textContent) + 1);
    });
  });
  await page.addScriptTag({ path: path.join(process.cwd(), "extension/fill.js") });
  const result = await fillWithCitizenApproval(page, profile);
  expect(result.filled).toBe(1);
  await expect(page.locator("#submit-count")).toHaveText("0");
  await expect(page.getByRole("button", { name: "Submit application" })).toBeVisible();
});
