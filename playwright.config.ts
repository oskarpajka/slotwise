import { defineConfig, devices } from "@playwright/test";
import { E2E_AUTH_SECRET, E2E_DATABASE } from "./e2e/owner";
import { testDatabaseUrl } from "./src/db/test-database";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  // Creates the e2e database with the owner.
  globalSetup: "./e2e/global-setup.ts",
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // Runs the production build. Run `pnpm build` first.
  webServer: {
    command: "pnpm start",
    url: baseURL,
    env: {
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
      SMS_PROVIDER: "dry-run",
      DATABASE_URL: testDatabaseUrl(E2E_DATABASE),
      BETTER_AUTH_SECRET: E2E_AUTH_SECRET,
      BETTER_AUTH_URL: baseURL,
    },
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
