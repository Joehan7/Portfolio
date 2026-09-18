import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results-cross',
  testMatch: ['site.spec.ts'],
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
    launchOptions: { timeout: 20000 },
  },
  projects: [
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm exec next start --hostname 127.0.0.1 -p 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 60000,
  },
  reporter: [['list'], ['json', { outputFile: 'reports/cross-browser.json' }]],
});
