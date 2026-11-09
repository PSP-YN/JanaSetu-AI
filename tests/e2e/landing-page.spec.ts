import { test, expect } from "@playwright/test";

test("public landing page directs visitors to the citizen workspace and discloses independent status", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Public support should be easier to find");
  await expect(page.getByRole("link", { name: /Explore the workspace/i }).first()).toHaveAttribute("href", "/app");
  await expect(page.locator(".site-footer")).toContainText("not a government website");
  const hero = page.locator(".hero-art");
  await expect(hero).toHaveAttribute("src", "/hero-citizen.svg");
  await expect.poll(() => hero.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://jana-setu-ai.vercel.app");
});

test("robots and sitemap expose public pages but keep the workspace out of search", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain("/app");
  expect(robotsText).toContain("sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("https://jana-setu-ai.vercel.app");
  expect(xml).not.toContain("https://jana-setu-ai.vercel.app/app");
});

test("workspace route is available but explicitly noindex", async ({ page }) => {
  await page.goto("/app");
  await expect(page.locator(".main-area")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
