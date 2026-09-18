import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: process.env.BASE_URL || 'http://127.0.0.1:3001', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'android-chrome',
      testMatch: ['site.spec.ts'],
      use: { ...devices['Pixel 7'], channel: process.env.CI ? undefined : 'chrome' },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' },
    },
  ],
  webServer: {
    command: 'pnpm exec next start --hostname 127.0.0.1 -p 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 60000,
  },
  reporter: [['list'], ['json', { outputFile: 'reports/playwright.json' }]],
});
