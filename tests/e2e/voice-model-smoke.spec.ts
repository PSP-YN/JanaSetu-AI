import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

test("on-device Whisper worker validates output script and fails safely on bad language decodes", async ({ page }) => {
  test.setTimeout(240_000);
  const languages = ["en", "hi", "kn", "ta", "te", "ml"] as const;
  const fixtures = Object.fromEntries(languages.map((language) => [
    language,
    readFileSync(path.join(process.cwd(), "tests/e2e/fixtures/voice-" + language + ".wav")).toString("base64")
  ]));
  await page.addInitScript(({ encoded }) => {
    const tracks = [{ stop() {} }];
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => tracks }) }
    });
    (window as any).__voiceAudioBase64 = encoded;
    class FixtureRecorder {
      stream: any;
      mimeType = "audio/wav";
      ondataavailable: ((event: any) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(stream: any) { this.stream = stream; }
      start() {}
      stop() {
        const binary = atob((window as any).__voiceAudioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        this.ondataavailable?.({ data: new Blob([bytes], { type: this.mimeType }) });
        this.onstop?.();
      }
    }
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: FixtureRecorder });
  }, { encoded: fixtures.en });

  await page.goto("/app");
  // Synthetic eSpeak fixtures are execution smoke tests, not a transcription-accuracy benchmark.
  for (const language of languages) {
    await page.locator(".language-control select").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language + "-IN");
    await page.evaluate((encoded) => { (window as any).__voiceAudioBase64 = encoded; }, fixtures[language]);
    const dismissNotice = page.locator(".toast button");
    if (await dismissNotice.count()) await dismissNotice.click();
    await page.locator("textarea.intake-text").fill("");
    await page.locator(".intake-actions .button-secondary").click();
    await expect(page.locator(".intake-actions .button-secondary")).toHaveAttribute("aria-pressed", "true");
    await page.locator(".intake-actions .button-secondary").click();
    await page.waitForFunction(() => {
      const input = document.querySelector("textarea.intake-text") as HTMLTextAreaElement | null;
      const notice = document.querySelector(".toast")?.textContent || "";
      const recorder = document.querySelector(".intake-actions .button-secondary") as HTMLButtonElement | null;
      return Boolean(recorder && !recorder.disabled) && (Boolean(input?.value.trim()) || /failed|no speech|could not|not supported|different writing system|repetitive text|too short/i.test(notice));
    }, { timeout: 90_000 });
    const transcript = await page.locator("textarea.intake-text").inputValue();
    console.log(language + " transcript: " + (transcript || "[rejected by transcript quality guard]"));
    if (transcript.trim()) {
      const scripts: Record<(typeof languages)[number], RegExp> = {
        en: /\p{Script=Latin}/u,
        hi: /\p{Script=Devanagari}/u,
        kn: /\p{Script=Kannada}/u,
        ta: /\p{Script=Tamil}/u,
        te: /\p{Script=Telugu}/u,
        ml: /\p{Script=Malayalam}/u
      };
      const letters = Array.from(transcript).filter((character) => /\p{L}/u.test(character));
      const matching = letters.filter((character) => scripts[language].test(character)).length;
      expect(matching / Math.max(1, letters.length), language + " transcript must match the selected writing system").toBeGreaterThanOrEqual(0.65);
      const words = transcript.toLocaleLowerCase().match(/\p{L}+/gu) || [];
      if (words.length >= 10) {
        const frequencies = new Map<string, number>();
        for (const word of words) frequencies.set(word, (frequencies.get(word) || 0) + 1);
        expect(Math.max(...frequencies.values()) / words.length, language + " transcript must not be a repeated-token loop").toBeLessThanOrEqual(0.35);
      }
    } else {
      const notice = await page.locator(".toast").textContent();
      expect(notice || "").toMatch(/different writing system|repetitive text|no speech|too short/i);
    }
    const clearNotice = page.locator(".toast button");
    if (await clearNotice.count()) await clearNotice.click();
  }

  // A fresh worker must be able to reuse the cached model after the first download.
  await page.reload();
  await page.locator(".language-control select").selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-IN");
  await page.context().setOffline(true);
  await page.evaluate((encoded) => { (window as any).__voiceAudioBase64 = encoded; }, fixtures.en);
  await page.locator("textarea.intake-text").fill("");
  await page.locator(".intake-actions .button-secondary").click();
  await page.locator(".intake-actions .button-secondary").click();
  await page.waitForFunction(() => {
    const input = document.querySelector("textarea.intake-text") as HTMLTextAreaElement | null;
    const notice = document.querySelector(".toast")?.textContent || "";
    const recorder = document.querySelector(".intake-actions .button-secondary") as HTMLButtonElement | null;
    return Boolean(recorder && !recorder.disabled) && (Boolean(input?.value.trim()) || /failed|no speech|could not|not supported|different writing system|repetitive text|too short/i.test(notice));
  }, { timeout: 90_000 });
  const offlineTranscript = (await page.locator("textarea.intake-text").inputValue()).trim();
  expect(offlineTranscript.length).toBeGreaterThan(0);
  const offlineLetters = Array.from(offlineTranscript).filter((character) => /\p{L}/u.test(character));
  const latinLetters = offlineLetters.filter((character) => /\p{Script=Latin}/u.test(character)).length;
  expect(latinLetters / Math.max(1, offlineLetters.length)).toBeGreaterThanOrEqual(0.65);
});
