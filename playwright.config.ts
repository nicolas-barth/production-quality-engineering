import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : 0;

export default defineConfig({
  testDir: './playwright/tests',

  globalSetup: './playwright/global-setup.ts',

  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 4 : undefined,
  timeout: 60_000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
    ...(CI ? [['github'] as [string]] : []),
  ],

  use: {
    baseURL: 'https://demo.opencart.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    launchOptions: {
      slowMo: SLOW_MO,
    },
  },

  projects: CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
        },
      ],

  outputDir: 'test-results/',
});
