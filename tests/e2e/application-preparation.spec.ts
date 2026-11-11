import { test, expect } from "@playwright/test";

test("synthetic citizen journey prepares a local draft but never claims government submission", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "My profile" }).click();

  const fields = page.locator(".form-grid").first().locator(".field");
  await fields.nth(0).locator("input").fill("Synthetic Mobile Citizen");
  await fields.nth(1).locator("input").fill("34");
  await fields.nth(2).locator("select").selectOption("woman");
  await fields.nth(3).locator("select").selectOption({ label: "Karnataka" });
  await fields.nth(4).locator("input").fill("Mysuru");
  await fields.nth(6).locator("input").fill("150000");
  await fields.nth(7).locator("select").selectOption("Farmer");
  await page.locator(".form-footer .button-primary").click();

  await page.locator(".search-box input").fill("PM-KISAN");
  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.locator(".scheme-grid")).toContainText("Scheme source approval pending");
  await expect(page.locator(".scheme-grid")).toContainText("Rule prototype · independent review pending");
  await expect(page.locator(".scheme-grid")).toContainText("Potential benefit · verify with department");
  await expect(page.locator(".scheme-grid")).toContainText("Local preparation only — not an application case.");
  await page.getByRole("button", { name: "Prepare local checklist" }).first().click();

  await expect(page.locator(".application-list")).toContainText("Synthetic Mobile Citizen");
  await expect(page.locator(".application-list")).toContainText("Not submitted");
  await expect(page.locator(".application-list")).toContainText("Scheme source approval pending");
  await expect(page.locator(".application-list")).toContainText("Preparation record only — not an eligibility decision or submitted application.");
  await expect(page.locator(".application-disclaimer")).toContainText("has not been submitted to a government portal");

  await page.goto("/app/automation");
  await expect(page.locator(".automation-stats")).toContainText("0");
  await expect(page.locator(".automation-hold")).toContainText("No independently approved schemes are published yet");
});
