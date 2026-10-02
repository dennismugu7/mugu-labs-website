import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the built static export (`npm run build` first),
 * served the way a static host serves it. `npm run test:e2e`.
 *
 * The "flags" project runs against a second export with the sections that
 * lib/site.ts switches off switched on (out-flags/, built here by
 * scripts/build-flags-fixture.mjs).
 */
const PORT = 4173;
const FLAGS_PORT = 4175;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop",
      testIgnore: /flags\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 800 } },
    },
    {
      name: "flags",
      testMatch: /flags\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 800 },
        baseURL: `http://localhost:${FLAGS_PORT}`,
      },
    },
    {
      name: "mobile",
      testIgnore: /flags\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: [
    {
      command: `npx serve out -l ${PORT} --no-port-switching --no-clipboard`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `node scripts/build-flags-fixture.mjs && npx serve out-flags -l ${FLAGS_PORT} --no-port-switching --no-clipboard`,
      url: `http://localhost:${FLAGS_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
