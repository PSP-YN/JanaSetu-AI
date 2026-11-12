import { test, expect } from "@playwright/test";

test("workspace hydrates without server/client date mismatch in India timezone", async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: "Asia/Kolkata", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/app", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".date-chip")).not.toBeEmpty();
  expect(errors).toEqual([]);
  await context.close();
});
