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

test("homepage coverage counts and eligibility disclaimers match the current catalogue", async ({ page }) => {
  await page.goto("/");
  const coverage = page.locator(".coverage-summary");
  await expect(coverage).toContainText("46");
  await expect(coverage).toContainText("4");
  await expect(coverage).toContainText("42");
  await expect(coverage).toContainText("96");
  await expect(coverage).toContainText("not confirmed citizen schemes");
  await expect(page.locator(".faq-list")).toContainText("awaiting independent source, rule and legal review");
  await expect(page.locator(".faq-list")).toContainText("does not register grievances");
  await expect(page.locator(".faq-list")).toContainText("does not handle OTP, CAPTCHA or Aadhaar/e-KYC");
});

test("all public navigation anchors resolve to an existing section", async ({ page }) => {
  await page.goto("/");
  const broken = await page.locator('a[href^="#"]').evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href") || "")
      .filter((href) => href.length > 1 && !document.querySelector(href))
  );
  expect(broken).toEqual([]);
  await expect(page.getByRole("link", { name: "Our principles" })).toHaveAttribute("href", "#principles");
  await expect(page.locator("#principles")).toBeVisible();
});

test("footer navigation and language links are grouped and readable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".footer-links")).toHaveAccessibleName("Footer navigation");
  await expect(page.locator(".footer-languages")).toHaveAccessibleName("Choose language");
  for (const href of ["/privacy", "/terms", "/schemes", "/app", "/", "/hi", "/kn", "/te", "/ta", "/ml"]) {
    await expect(page.locator(".site-footer").locator(`a[href="${href}"]`).first()).toBeVisible();
  }
});

test("footer alignment is stable across mobile, tablet and desktop widths", async ({ page }) => {
  for (const width of [320, 360, 390, 430, 600, 760, 768, 900, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const metrics = await page.evaluate(() => {
      const brand = document.querySelector(".footer-brand-block")!.getBoundingClientRect();
      const nav = document.querySelector(".footer-navigation")!.getBoundingClientRect();
      const footer = document.querySelector(".site-footer")!.getBoundingClientRect();
      return {
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        footerRight: footer.right,
        brandTop: brand.top,
        navTop: nav.top,
        brandRight: brand.right,
        navLeft: nav.left,
        links: [...document.querySelectorAll(".footer-links a, .footer-languages a")].map((a) => {
          const rect = a.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        })
      };
    });
    expect(metrics.document, `homepage horizontal overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.footerRight, `footer exceeds viewport at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
    for (const link of metrics.links) {
      expect(link.left, `footer link left overflow at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(link.right, `footer link right overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
    }
    if (width > 760) {
      expect(Math.abs(metrics.brandTop - metrics.navTop), `footer columns misaligned at ${width}px`).toBeLessThan(70);
      expect(metrics.navLeft).toBeGreaterThan(metrics.brandRight - 1);
    } else {
      expect(metrics.navTop).toBeGreaterThan(metrics.brandTop);
    }
  }
});

test("regional-language landing pages fit narrow phone viewports without horizontal scrolling", async ({ page }) => {
  for (const route of ["/hi", "/kn", "/te", "/ta", "/ml"]) {
    for (const width of [320, 360, 390, 430, 600, 768, 850, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        header: document.querySelector(".localized-header")!.getBoundingClientRect().toJSON(),
        brand: document.querySelector(".localized-header .brand")!.getBoundingClientRect().toJSON(),
        logo: document.querySelector(".localized-header .brand img")!.getBoundingClientRect().toJSON(),
        hero: document.querySelector(".localized-hero")!.getBoundingClientRect().toJSON(),
        cta: document.querySelector(".localized-header > .button-primary")!.getBoundingClientRect().toJSON()
      }));
      expect(metrics.document, `${route} document overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.body, `${route} body overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.brand.left, `${route} brand left overflow at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(metrics.brand.right, `${route} brand right overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.logo.width, `${route} logo width at ${width}px`).toBeLessThanOrEqual(48);
      expect(metrics.logo.height, `${route} logo height at ${width}px`).toBeLessThanOrEqual(48);
      expect(metrics.header.height, `${route} header height at ${width}px`).toBeLessThan(180);
      expect(metrics.hero.top, `${route} hero must follow the header at ${width}px`).toBeGreaterThanOrEqual(metrics.header.bottom - 1);
      expect(metrics.cta.right, `${route} CTA right overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
    }
  }
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
