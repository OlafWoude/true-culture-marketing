import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3700);
const TEST_DB = process.env.E2E_DATABASE_URL ?? "postgres://postgres@127.0.0.1:5432/tcm_test";
export const E2E_SETUP_TOKEN = process.env.E2E_SETUP_TOKEN ?? "e2e-setup-token-for-local-tests-only-0123456789";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: `node tests/e2e/reset-db.mjs && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/admin/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: TEST_DB,
      ADMIN_SETUP_TOKEN: E2E_SETUP_TOKEN,
      SITE_URL: `http://localhost:${PORT}`,
      RESEND_API_KEY: "",
      BLOB_READ_WRITE_TOKEN: "",
    },
  },
});
