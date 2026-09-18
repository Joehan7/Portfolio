import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const routes = [
  '/',
  '/work',
  '/about',
  '/contact',
  '/resume',
  '/work/intelligent-soc-triage',
  '/work/subscription-management',
  '/work/adpilot',
  '/work/password-strength-analyzer',
  '/missing-signal',
];
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
for (const width of [360, 1440]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto((process.env.VISUAL_URL || 'http://127.0.0.1:3003') + route);
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator('.hero-poster, .case-figure img, .project-media img')
      .evaluateAll(async (imgs) => {
        imgs.forEach((img) => {
          img.loading = 'eager';
        });
        await Promise.all(imgs.map((img) => img.decode?.().catch(() => {})));
      });
    await page.waitForLoadState('networkidle');
    const name =
      (process.env.VISUAL_LABEL || 'before') +
      '-' +
      width +
      '-' +
      (route === '/' ? 'home' : route.slice(1).replaceAll('/', '-'));
    await page.screenshot({ path: 'reports/' + name + '.png' });
    results.push({
      width,
      route,
      geometry: await page.locator('h1').evaluate((el) => {
        const s = getComputedStyle(el),
          r = el.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
          size: s.fontSize,
          font: s.fontFamily,
          color: s.color,
          spacing: s.letterSpacing,
        };
      }),
    });
  }
  await context.close();
}
await fs.writeFile(
  'reports/visual-' + (process.env.VISUAL_LABEL || 'before') + '.json',
  JSON.stringify(results, null, 2),
);
await browser.close();
