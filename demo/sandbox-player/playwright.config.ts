import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "pnpm run dev",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.CI ? undefined : "chrome",
      },
    },
  ],
});
