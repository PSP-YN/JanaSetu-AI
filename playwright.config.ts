import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  workers: process.env.CI ? 2 : 4,
  use: { baseURL: "http://127.0.0.1:3002", trace: "retain-on-failure", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3002",
    url: "http://127.0.0.1:3002/api/health",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
