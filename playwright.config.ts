import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  workers: process.env.CI ? 2 : 4,
  use: { baseURL: "http://127.0.0.1:3003", trace: "retain-on-failure" },
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } }
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3003",
    url: "http://127.0.0.1:3003/api/health",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
