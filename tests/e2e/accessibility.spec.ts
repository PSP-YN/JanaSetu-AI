import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fillWithCitizenApproval } from "./extension-approval";

for (const route of ["/", "/app", "/auth", "/app/automation", "/app/review", "/schemes", "/privacy", "/terms"]) {
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
  await page.goto("/app");
  const selector = page.locator(".language-control select");
  await expect(selector).toBeVisible();
  for (const [code, tag] of [["en","en-IN"],["hi","hi-IN"],["kn","kn-IN"],["ta","ta-IN"],["te","te-IN"],["ml","ml-IN"]]) {
    await selector.selectOption(code);
    await expect(page.locator("html")).toHaveAttribute("lang", tag);
    await expect(page.locator(".main-area")).toHaveAttribute("data-language", code);
  }
});

test("main workspace labels and mobile navigation are translated for all six locales", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  const selector = page.locator(".language-control select");
  const labels = [
    ["en", "A CLEARER WAY FORWARD", "Open navigation"],
    ["hi", "आगे बढ़ने का स्पष्ट रास्ता", "नेविगेशन खोलें"],
    ["kn", "ಮುಂದಿನ ದಾರಿ ಸ್ಪಷ್ಟವಾಗಲಿ", "ನ್ಯಾವಿಗೇಶನ್ ತೆರೆಯಿರಿ"],
    ["ta", "அடுத்த படி தெளிவாக", "வழிசெலுத்தலைத் திற"],
    ["te", "తదుపరి దారి స్పష్టంగా", "నావిగేషన్ తెరవండి"],
    ["ml", "അടുത്ത ഘട്ടം വ്യക്തം", "നാവിഗേഷൻ തുറക്കുക"]
  ];
  for (const [locale, hero, menuLabel] of labels) {
    await selector.selectOption(locale);
    await expect(page.locator(".hero-label")).toContainText(hero);
    await expect(page.getByRole("button", { name: menuLabel })).toBeVisible();
  }
});

test("localized scheme search includes translated summary and benefit text", async ({ page }) => {
  await page.goto("/app");
  await page.locator(".language-control select").selectOption("hi");
  await page.locator(".nav-item").nth(1).click();
  await page.locator(".search-box input").fill("किसान परिवारों");
  await expect(page.locator(".scheme-grid")).toContainText("पात्र भूमि-धारक किसान परिवारों");
});

test("security headers are served by the active Next.js configuration", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy-report-only"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy-report-only"]).toContain("https://datasets-server.huggingface.co");
  expect(headers["content-security-policy-report-only"]).not.toContain("connect-src 'self' https:;");
  expect(headers["content-security-policy-report-only"]).not.toMatch(/,\s*default-src/);
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("skip navigation is keyboard reachable and moves to main content", async ({ page }) => {
  await page.goto("/app");
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
      <input id="hidden" type="hidden" name="age">
    </form>`);
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await fillWithCitizenApproval(page, {
    fullName: "Synthetic Citizen", age: 34, state: "Karnataka", district: "Mysuru", gender: "woman",
    annualIncome: 150000, occupation: "Farmer", residenceType: "urban",
    hasCultivableLand: true, pmKisanExcluded: "no", ownsPuccaHouse: false,
    previousHousingBenefit: "no", householdHasLpg: false, poorHouseholdDeclaration: true,
    isStudent: false, top20Percentile: null, regularUndergraduate: null,
    otherScholarship: null, diplomaOrDistance: null
  });
  expect(result.filled).toBe(1);
  await expect(page.locator("#applicant")).toHaveValue("Synthetic Citizen");
  await expect(page.locator("#aadhaar")).toHaveValue("");
  await expect(page.locator("#password")).toHaveValue("");
  await expect(page.locator("#consent")).not.toBeChecked();
});


test("mobile navigation opens, changes sections and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/sidebar-open/);
  await page.getByRole("button", { name: "Find benefits" }).click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);
  await expect(page.locator(".main-area")).toBeVisible();
});


test("extension synthetic select mapping only chooses an exact matching option", async ({ page }) => {
  await page.setContent('<label for="state">State</label><select id="state" name="state"><option value="">Choose</option><option value="Karnataka">Karnataka</option><option value="Kerala">Kerala</option></select>');
  await page.addScriptTag({ path: "extension/fill.js" });
  const result = await fillWithCitizenApproval(page, {
    state: "Karnataka", fullName: "", age: "", gender: "", district: "",
    residenceType: "", annualIncome: "", occupation: "", hasCultivableLand: null,
    pmKisanExcluded: "unknown", ownsPuccaHouse: null, previousHousingBenefit: "unknown",
    householdHasLpg: null, poorHouseholdDeclaration: null, isStudent: false,
    top20Percentile: null, regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  });
  expect(result.filled).toBe(1);
  await expect(page.locator("#state")).toHaveValue("Karnataka");
});


test("landing page and workspace share the same warm brand color and do not overflow common viewports", async ({ page }) => {
  for (const width of [320, 360, 390, 430, 768, 800, 820, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/app"]) {
      await page.goto(route);
      const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        primary: getComputedStyle(document.querySelector(".button-primary")!).backgroundColor
      }));
      expect(metrics.document, `${route} horizontal overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.body, `${route} body overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.primary, `${route} primary brand color at ${width}px`).toBe("rgb(169, 68, 11)");
    }
  }
});

test("mobile citizen journey can save a profile, discover schemes and add a local document", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "My profile" }).click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);

  const fields = page.locator(".form-grid").first().locator(".field");
  await fields.nth(0).locator("input").fill("Synthetic Mobile Citizen");
  await fields.nth(1).locator("input").fill("34");
  await fields.nth(2).locator("select").selectOption("woman");
  await fields.nth(3).locator("select").selectOption({ label: "Karnataka" });
  await fields.nth(4).locator("input").fill("Mysuru");
  await fields.nth(6).locator("input").fill("150000");
  await fields.nth(7).locator("select").selectOption("Farmer");
  await page.locator(".form-footer .button-primary").click();
  await expect(page.locator(".search-box input")).toBeVisible();
  await expect(page.locator(".toast")).toContainText("Assessment completed locally");

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Find benefits" }).click();
  await page.locator(".search-box input").fill("PM-KISAN");
  await expect(page.locator(".scheme-grid")).toBeVisible();

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Documents" }).click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: "synthetic-demo.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n% synthetic test file\n")
  });
  await expect(page.locator(".document-row")).toContainText("synthetic-demo.pdf");
  await expect(page.locator(".toast")).toContainText("saved on this device only");
});

test("mobile viewport homepage has no serious or critical axe violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = result.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  expect(blocking.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
});

test("primary navigation, profile labels and occupation values stay localized/canonical across language changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/app");
  const selector = page.locator(".language-control select");
  const expected = [
    { code: "en", nav: ["Overview", "Find benefits", "My profile", "Documents", "My applications", "How it works"], name: "Full name", occupation: "Occupation" },
    { code: "hi", nav: ["अवलोकन", "लाभ खोजें", "मेरी प्रोफ़ाइल", "दस्तावेज़", "मेरे आवेदन", "यह कैसे काम करता है"], name: "पूरा नाम", occupation: "व्यवसाय" },
    { code: "kn", nav: ["ಅವಲೋಕನ", "ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ", "ನನ್ನ ಪ್ರೊಫೈಲ್", "ದಾಖಲೆಗಳು", "ನನ್ನ ಅರ್ಜಿಗಳು", "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ"], name: "ಪೂರ್ಣ ಹೆಸರು", occupation: "ಉದ್ಯೋಗ" },
    { code: "ta", nav: ["கண்ணோட்டம்", "நலத்திட்டங்களைத் தேடு", "எனது சுயவிவரம்", "ஆவணங்கள்", "எனது விண்ணப்பங்கள்", "இது எவ்வாறு செயல்படுகிறது"], name: "முழுப் பெயர்", occupation: "தொழில்" },
    { code: "te", nav: ["అవలోకనం", "ప్రయోజనాలను కనుగొనండి", "నా ప్రొఫైల్", "పత్రాలు", "నా దరఖాస్తులు", "ఇది ఎలా పనిచేస్తుంది"], name: "పూర్తి పేరు", occupation: "వృత్తి" },
    { code: "ml", nav: ["അവലോകനം", "ആനുകൂല്യങ്ങൾ കണ്ടെത്തുക", "എന്റെ പ്രൊഫൈൽ", "രേഖകൾ", "എന്റെ അപേക്ഷകൾ", "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു"], name: "പൂർണ്ണ പേര് (ഐച്ഛികം)", occupation: "തൊഴിൽ" }
  ];
  for (const locale of expected) {
    await selector.selectOption(locale.code);
    const nav = (await page.locator(".nav-item").allInnerTexts()).map((label) => label.trim());
    expect(nav).toEqual(locale.nav);
    await page.locator(".nav-item").nth(2).click();
    await expect(page.getByLabel(locale.name)).toBeVisible();
    const occupation = page.getByLabel(locale.occupation);
    await occupation.selectOption("Farmer");
    await expect(occupation).toHaveValue("Farmer");
  }
});

test("privacy and terms routes fully switch headings and document language across six locales", async ({ page }) => {
  const locales = [
    ["en", "en-IN", "Privacy notice", "Terms and limitations"],
    ["hi", "hi-IN", "गोपनीयता सूचना", "नियम और सीमाएँ"],
    ["kn", "kn-IN", "ಗೌಪ್ಯತಾ ಸೂಚನೆ", "ನಿಯಮಗಳು ಮತ್ತು ಮಿತಿಗಳು"],
    ["ta", "ta-IN", "தனியுரிமை அறிவிப்பு", "விதிமுறைகள் மற்றும் வரம்புகள்"],
    ["te", "te-IN", "గోప్యతా నోటీసు", "నిబంధనలు మరియు పరిమితులు"],
    ["ml", "ml-IN", "സ്വകാര്യതാ അറിയിപ്പ്", "നിബന്ധനകളും പരിമിതികളും"]
  ];
  await page.goto("/privacy");
  for (const [code, lang, privacyTitle, termsTitle] of locales) {
    await page.locator(".legal-toolbar select").selectOption(code);
    await expect(page.locator("h1")).toHaveText(privacyTitle);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await page.goto("/terms");
    await expect(page.locator("h1")).toHaveText(termsTitle);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await page.goto("/privacy");
  }
});

test("localized privacy and terms pages have no serious or critical axe violations", async ({ page }) => {
  const locales = ["en", "hi", "kn", "ta", "te", "ml"];
  for (const locale of locales) {
    for (const route of ["/privacy", "/terms"]) {
      await page.goto(route);
      await page.locator(".legal-toolbar select").selectOption(locale);
      await expect(page.locator("h1")).toBeVisible();
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
      const blocking = result.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(blocking.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    }
  }
});


test("hero focus outline and primary button text remain high-contrast", async ({ page }) => {
  await page.goto("/app");
  const heroButton = page.locator(".hero-panel button").first();
  await expect(heroButton).toBeVisible();
  await heroButton.focus();
  await expect(heroButton).toBeFocused();
  await page.waitForTimeout(250); // Allow the focus-ring transition to finish before reading computed styles.
  const focusStyle = await heroButton.evaluate((element) => ({ outlineStyle: getComputedStyle(element).outlineStyle, boxShadow: getComputedStyle(element).boxShadow }));
  expect(focusStyle.outlineStyle).toBe("solid");
  expect(focusStyle.boxShadow).toContain("rgb(255, 248, 241)");
  const primaryButton = page.locator(".button-primary").first();
  expect(await primaryButton.evaluate((element) => getComputedStyle(element).color)).toBe("rgb(255, 255, 255)");
});

test("citizen workspace keeps account access compact and removes the secondary automation shortcut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await expect(page.locator(".account-bar")).not.toContainText("Applications & automation");
  await expect(page.locator(".account-bar a")).toHaveCount(1);
});

test("uploaded JanaSetu brand mark loads and citizen avatar uses a safe initials fallback", async ({ page }) => {
  await page.goto("/app");
  const mark = page.locator(".brand-mark img");
  await expect(mark).toHaveAttribute("src", "/janasetu-mark.svg");
  await expect.poll(() => mark.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(".avatar-fallback")).toBeVisible();
});
