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
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: MockSpeechRecognition });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Use browser speech instead" }).click();
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
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: MockSpeechRecognition });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Use browser speech instead" }).click();
  await page.getByRole("button", { name: "Speak" }).click();
  await expect(page.locator("textarea.intake-text")).toHaveValue("I am a student");
});


test("on-device recording sends decoded audio to the local worker and appends its transcript", async ({ page }) => {
  await page.addInitScript(() => {
    const tracks = [{ stop() {} }];
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => tracks }) }
    });
    class MockRecorder {
      stream: any;
      mimeType = "audio/webm";
      ondataavailable: ((event: any) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(stream: any) { this.stream = stream; }
      start() {}
      stop() {
        this.ondataavailable?.({ data: new Blob([new Uint8Array([1, 2, 3])], { type: this.mimeType }) });
        this.onstop?.();
      }
    }
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: MockRecorder });
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: class {
        decodeAudioData = async () => ({ sampleRate: 16000, getChannelData: () => new Float32Array(16000).fill(0.01) });
        close = async () => {};
      }
    });
    class MockWorker extends EventTarget {
      postMessage(request: any) {
        window.setTimeout(() => this.dispatchEvent(new MessageEvent("message", {
          data: { id: request.id, type: "result", transcript: "ನಾನು ರೈತ", backend: "wasm" }
        })), 0);
      }
      terminate() {}
    }
    Object.defineProperty(window, "Worker", { configurable: true, value: MockWorker });
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Record on device" }).click();
  await expect(page.getByRole("button", { name: "Stop & transcribe" })).toBeVisible();
  await page.getByRole("button", { name: "Stop & transcribe" }).click();
  await expect(page.locator("textarea.intake-text")).toHaveValue("ನಾನು ರೈತ");
  await expect(page.locator(".toast")).toContainText("On-device transcription complete");
});
