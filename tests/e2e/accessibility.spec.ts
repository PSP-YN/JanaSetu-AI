import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const route of ["/", "/privacy", "/terms"]) {
  test(`axe WCAG 2.1 AA critical/serious scan: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();
    const blocking = result.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(blocking.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  });
}

test("all six language options update document language and selected locale", async ({ page }) => {
  await page.goto("/");
  const selector = page.locator(".language-control select");
  await expect(selector).toBeVisible();
  for (const [code, tag] of [["en","en-IN"],["hi","hi-IN"],["kn","kn-IN"],["ta","ta-IN"],["te","te-IN"],["ml","ml-IN"]]) {
    await selector.selectOption(code);
    await expect(page.locator("html")).toHaveAttribute("lang", tag);
    await expect(page.locator(".main-area")).toHaveAttribute("data-language", code);
  }
});

test("security headers are served by the active Next.js configuration", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy-report-only"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("skip navigation is keyboard reachable and moves to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator("a.skip-link");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeVisible();
});


test("extension synthetic form fills unique safe fields and skips sensitive or ambiguous controls", async ({ page }) => {
  await page.setContent(`
    <form>
      <label for="applicant">Applicant name</label><input id="applicant" name="applicantName">
      
      
      <label for="aadhaar">Aadhaar number</label><input id="aadhaar" name="aadhaar">
      <label for="password">Password</label><input id="password" type="password">
      <label for="consent">I agree to the declaration</label><input id="consent" type="checkbox">
      <label for="duplicate1">Applicant name</label><input id="duplicate1">
      <label for="duplicate2">Applicant name</label><input id="duplicate2">
      <input id="hidden" type="hidden" name="age">
    </form>`);
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await page.evaluate(() => (window as any).fillProfileInPage({
    fullName: "Synthetic Citizen", age: 34, state: "Karnataka", district: "Mysuru", gender: "woman",
    annualIncome: 150000, occupation: "Farmer", residenceType: "urban",
    hasCultivableLand: true, pmKisanExcluded: "no", ownsPuccaHouse: false,
    previousHousingBenefit: "no", householdHasLpg: false, poorHouseholdDeclaration: true,
    isStudent: false, top20Percentile: null, regularUndergraduate: null,
    otherScholarship: null, diplomaOrDistance: null
  }));
  expect(result.filled).toBe(1);
  await expect(page.locator("#applicant")).toHaveValue("Synthetic Citizen");
  await expect(page.locator("#aadhaar")).toHaveValue("");
  await expect(page.locator("#password")).toHaveValue("");
  await expect(page.locator("#consent")).not.toBeChecked();
  await expect(page.locator("#duplicate1")).toHaveValue("");
  await expect(page.locator("#duplicate2")).toHaveValue("");
});


test("mobile navigation opens, changes sections and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/sidebar-open/);
  await page.getByRole("button", { name: "Find benefits" }).click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);
  await expect(page.locator(".main-area")).toBeVisible();
});


test("extension synthetic select mapping only chooses an exact matching option", async ({ page }) => {
  await page.setContent('<label for="state">State</label><select id="state" name="state"><option value="">Choose</option><option value="Karnataka">Karnataka</option><option value="Kerala">Kerala</option></select>');
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await page.evaluate(() => (window as any).fillProfileInPage({
    state: "Karnataka", fullName: "", age: "", gender: "", district: "",
    residenceType: "", annualIncome: "", occupation: "", hasCultivableLand: null,
    pmKisanExcluded: "unknown", ownsPuccaHouse: null, previousHousingBenefit: "unknown",
    householdHasLpg: null, poorHouseholdDeclaration: null, isStudent: false,
    top20Percentile: null, regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  }));
  expect(result.filled).toBe(1);
  await expect(page.locator("#state")).toHaveValue("Karnataka");
});


test("mobile viewport homepage has no serious or critical axe violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = result.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  expect(blocking.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
});
