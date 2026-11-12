import { test, expect } from "@playwright/test";

test("partial contact and postal edits survive reload without clearing the saved profile", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "My profile" }).click();

  await page.locator(".form-grid").first().locator(".field").nth(0).locator("input").fill("Synthetic Profile Preservation");
  await page.getByLabel("Mobile number").fill("987");
  await page.getByLabel("Email address").fill("citizen@");
  await page.getByLabel("PIN code").fill("57001");
  await page.reload();

  await page.getByRole("button", { name: "My profile" }).click();
  await expect(page.locator(".form-grid").first().locator(".field").nth(0).locator("input")).toHaveValue("Synthetic Profile Preservation");
  await expect(page.getByLabel("Mobile number")).toHaveValue("987");
  await expect(page.getByLabel("Email address")).toHaveValue("citizen@");
  await expect(page.getByLabel("PIN code")).toHaveValue("57001");
});

test("Kannada profile contact section and plaintext export warning are localized", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("janSetu.language.v1", JSON.stringify("kn")));
  await page.goto("/app");
  await page.getByRole("button", { name: "ನನ್ನ ಪ್ರೊಫೈಲ್" }).click();

  await expect(page.getByText("ಅರ್ಜಿ ಸಂಪರ್ಕ ಮತ್ತು ವಿಳಾಸ")).toBeVisible();
  await expect(page.getByLabel("ಮೊಬೈಲ್ ಸಂಖ್ಯೆ")).toBeVisible();
  await expect(page.getByLabel("ಅಂಚೆ ಪಿನ್ ಕೋಡ್")).toBeVisible();

  let warning = "";
  page.on("dialog", async (dialog) => { warning = dialog.message(); await dialog.dismiss(); });
  await page.getByRole("button", { name: "ಫಾರ್ಮ್ ಸಹಾಯಕಕ್ಕಾಗಿ ರಫ್ತುಮಾಡಿ" }).click();
  await expect.poll(() => warning).toContain("ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿಲ್ಲ");
});
