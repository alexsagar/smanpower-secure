import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    }
  ],
  webServer: {
    command: process.env.QA_MODE === 'true' ? 'dotenv -e .env.test -- npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    // In QA mode, always start a fresh server connected to smanpower_qa.
    // Never reuse an existing dev server that may be connected to a different database.
    reuseExistingServer: process.env.QA_MODE === 'true' ? false : !process.env.CI,
    timeout: 120000,
  },
});
