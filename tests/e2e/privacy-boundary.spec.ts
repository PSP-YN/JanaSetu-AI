import { test, expect } from "@playwright/test";

test("citizen workspace clearly discloses browser-local prototype boundaries", async ({ page }) => {
  const unexpectedPosts: string[] = [];
  const privateRoutes = new Set(["/api/agent/run", "/api/intake/parse", "/api/applications/draft"]);
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (request.method() === "POST" && privateRoutes.has(pathname)) unexpectedPosts.push(request.method() + " " + pathname);
  });
  await page.goto("/app");
  await expect(page.locator(".main-area")).toBeVisible();
  await expect(page.locator("body")).toContainText(/browser|local|prototype/i);
  expect(unexpectedPosts).toEqual([]);
});
