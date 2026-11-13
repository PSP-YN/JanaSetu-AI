import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

test("on-device Whisper worker returns a transcript for English and all five supported Indian-language fixtures", async ({ page }) => {
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
    await page.evaluate((encoded) => { (window as any).__voiceAudioBase64 = encoded; }, fixtures[language]);
    await page.locator("textarea.intake-text").fill("");
    await page.locator(".intake-actions .button-secondary").click();
    await expect(page.locator(".intake-actions .button-secondary")).toHaveAttribute("aria-pressed", "true");
    await page.locator(".intake-actions .button-secondary").click();
    await page.waitForFunction(() => {
      const input = document.querySelector("textarea.intake-text") as HTMLTextAreaElement | null;
      const notice = document.querySelector(".toast")?.textContent || "";
      return Boolean(input?.value.trim()) || /failed|no speech|could not|not supported/i.test(notice);
    }, { timeout: 90_000 });
    const transcript = await page.locator("textarea.intake-text").inputValue();
    console.log(language + " transcript: " + transcript);
    expect(transcript.trim().length, language + " transcription should not be empty").toBeGreaterThan(0);
  }

  // A fresh worker must be able to reuse the cached model after the first download.
  await page.reload();
  await page.locator(".language-control select").selectOption("en");
  await page.context().setOffline(true);
  await page.evaluate((encoded) => { (window as any).__voiceAudioBase64 = encoded; }, fixtures.en);
  await page.locator("textarea.intake-text").fill("");
  await page.locator(".intake-actions .button-secondary").click();
  await page.locator(".intake-actions .button-secondary").click();
  await page.waitForFunction(() => {
    const input = document.querySelector("textarea.intake-text") as HTMLTextAreaElement | null;
    const notice = document.querySelector(".toast")?.textContent || "";
    return Boolean(input?.value.trim()) || /failed|no speech|could not|not supported/i.test(notice);
  }, { timeout: 90_000 });
  expect((await page.locator("textarea.intake-text").inputValue()).trim().length).toBeGreaterThan(0);
});
