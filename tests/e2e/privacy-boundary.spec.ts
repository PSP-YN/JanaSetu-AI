import { test, expect } from "@playwright/test";

test("main citizen workflow keeps profile, screening, intake and draft payloads in the browser", async ({ page }) => {
  const unexpectedPosts: string[] = [];
  const privateRoutes = new Set([
    "/api/agent/run",
    "/api/intake/parse",
    "/api/applications/draft"
  ]);

  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (request.method() === "POST" && privateRoutes.has(pathname)) {
      unexpectedPosts.push(request.method() + " " + pathname);
    }
  });

  await page.goto("/");

  // Load the synthetic profile, run screening, and prepare a local draft.
  await page.locator(".hero-buttons .button-ghost").click();
  await expect(page.locator(".main-area")).toHaveAttribute("data-language", "en");
  await page.locator(".form-footer .button-primary").click();
  await expect(page.locator(".scheme-grid .scheme-card").first()).toBeVisible();
  await page.locator(".scheme-card .scheme-actions .button-small.button-primary").first().click();
  await expect(page.locator(".application-card").first()).toBeVisible();

  // Return to the overview and run deterministic text intake.
  await page.locator(".nav-item").first().click();
  await page.locator(".intake-text").fill(
    "I am a 34-year-old woman farmer in Karnataka. My annual household income is 1.5 lakh."
  );
  await page.locator(".intake-actions .button-primary").click();
  await expect(page.locator(".intake-recognized")).toBeVisible();

  expect(unexpectedPosts).toEqual([]);
});
