import { test, expect } from "@playwright/test";

test("voice input explains browser speech-service failures instead of showing an opaque error", async ({ page }) => {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        window.setTimeout(() => {
          this.onerror?.({ error: "network" });
          this.onend?.();
        }, 0);
      }
      stop() { this.onend?.(); }
    }
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Speak" }).click();
  await expect(page.locator(".toast")).toContainText("[network]");
  await expect(page.locator(".toast")).toContainText("internet connection");
});

test("voice transcription appends a recognized phrase to the citizen intake field", async ({ page }) => {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        window.setTimeout(() => {
          this.onresult?.({ results: [{ 0: { transcript: "I am a student" }, isFinal: true }] });
          this.onend?.();
        }, 0);
      }
      stop() { this.onend?.(); }
    }
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Speak" }).click();
  await expect(page.locator("textarea.intake-text")).toHaveValue("I am a student");
});
