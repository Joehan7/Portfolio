import { defineConfig, devices } from '@playwright/test';
process.env.TEST_BASE_PATH = '/Portfolio';
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results-pages',
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:3002', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'pages-chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' },
    },
    {
      name: 'pages-android',
      testMatch: ['site.spec.ts', 'pages.spec.ts'],
      use: { ...devices['Pixel 7'], channel: process.env.CI ? undefined : 'chrome' },
    },
    {
      name: 'pages-firefox',
      testMatch: ['site.spec.ts', 'webgl.spec.ts', 'pages.spec.ts'],
      use: { ...devices['Desktop Firefox'], launchOptions: { timeout: 20000 } },
    },
    {
      name: 'pages-webkit',
      testMatch: ['site.spec.ts', 'webgl.spec.ts', 'pages.spec.ts'],
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'pages-iphone',
      testMatch: ['site.spec.ts', 'pages.spec.ts'],
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'node scripts/serve-pages.mjs',
    url: 'http://127.0.0.1:3002/Portfolio/',
    reuseExistingServer: true,
    timeout: 60000,
  },
  reporter: [['list'], ['json', { outputFile: 'reports/pages-playwright.json' }]],
});
