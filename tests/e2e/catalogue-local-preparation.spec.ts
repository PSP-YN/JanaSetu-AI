import { expect, test } from "@playwright/test";

test("a public visitor can prepare a local checklist from a source-indexed scheme without an eligibility claim", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("janSetu.profile.v1", JSON.stringify({
      fullName: "Synthetic Citizen",
      age: 34,
      gender: "woman",
      state: "Karnataka",
      district: "Mysuru",
      residenceType: "urban",
      annualIncome: 150000,
      occupation: "Farmer",
      hasCultivableLand: true,
      pmKisanExcluded: "no",
      ownsPuccaHouse: false,
      previousHousingBenefit: "no",
      householdHasLpg: false,
      poorHouseholdDeclaration: true,
      isStudent: false,
      top20Percentile: null,
      regularUndergraduate: null,
      otherScholarship: null,
      diplomaOrDistance: null
    }));
  });

  await page.goto("/app");
  await page.getByRole("button", { name: "Find benefits", exact: true }).click();

  const card = page.locator(".scheme-card").filter({
    hasText: "Prime Minister’s Scholarship Scheme for Wards of States/UTs Police Personnel Martyred During Terror/Naxal Attacks"
  });
  await expect(card).toBeVisible();
  const prepare = card.getByRole("button", { name: /Prepare local checklist/ });
  await expect(prepare).toBeEnabled();
  await prepare.click();

  await expect(page.getByRole("heading", { name: "Application workspace" })).toBeVisible();
  await page.getByRole("button", { name: "Review prepared fields" }).click();
  await expect(page.getByText("Scheme document checklist — verify the current official list")).toBeVisible();
  await expect(page.getByText("Preparation record only — not an eligibility decision or submitted application.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open official source/ })).toBeVisible();
  page.once("dialog", async (dialog) => { await dialog.accept(); });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download checklist" }).click()
  ]);
  expect(download.suggestedFilename()).toMatch(/^JanaSetu-.*-checklist\.txt$/);
});
