import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/privacy", "/terms"];

for (const route of routes) {
  test(`axe accessibility scan: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    const blocking = results.violations.filter((item) =>
      item.impact === "critical" || item.impact === "serious"
    );
    expect(
      blocking.map((item) => ({
        id: item.id,
        impact: item.impact,
        description: item.description,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary
        }))
      }))
    ).toEqual([]);
  });
}

test("language selector updates the document language", async ({ page }) => {
  await page.goto("/");
  const language = page.locator(".language-control select");
  await expect(language).toBeVisible();
  await language.selectOption("kn");
  await expect(page.locator("html")).toHaveAttribute("lang", "kn-IN");
  await expect(page.locator(".main-area")).toHaveAttribute("data-language", "kn");
  await language.selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-IN");
});

test("skip link is keyboard reachable and targets main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator("a.skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main-content");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeVisible();
});
