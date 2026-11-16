import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run api",
      url: "http://localhost:4020/v1/health",
      reuseExistingServer: true,
    },
    {
      command: "npm run ui-only",
      url: "http://localhost:5173",
      reuseExistingServer: true,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" } }],
});
