import { test, expect } from '@playwright/test';
import fs from 'node:fs';
test('full motion: hover response, pinned rail and progress', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('.is-pinned')).toHaveCount(1);
  const image = page.locator('.project-media').first();
  await image.scrollIntoViewIfNeeded();
  await image.hover({ position: { x: 400, y: 70 } });
  await expect(page.locator('.media-open').first()).toHaveCSS('opacity', '1');
  const rail = page.locator('.method-rail');
  await rail.getByRole('link', { name: '05 operate' }).click();
  await expect(page.locator('#phase-operate')).toHaveClass(/active/, { timeout: 10000 });
  const progress = await page.locator('.scroll-hud>span').first().textContent();
  expect(parseInt(progress || '0')).toBeGreaterThan(0);
  await expect(page.locator('#phase-operate')).toHaveCSS('opacity', '1');
  await page.mouse.move(1400, 950);
  await page.screenshot({ path: 'reports/method-desktop.png' });
});
test('page curtain clears and focuses the new page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.desktop-nav').getByRole('link', { name: 'about', exact: true }).click();
  await expect(page).toHaveURL(/about/);
  await expect(page.locator('.page-wipe')).toHaveClass(/idle/);
  await expect(page.locator('main')).toBeFocused();
  await page.locator('.desktop-nav').getByRole('link', { name: 'work', exact: true }).click();
  await expect(page).toHaveURL(/work/);
  await expect(page.locator('.page-wipe')).toHaveClass(/idle/);
});
test('offscreen marquees pause and five navigations clean up scroll effects', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chrome exposes the listener metrics used by this check.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.is-pinned')).toHaveCount(1);
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  const counts = [];
  for (let i = 0; i < 6; i++) {
    await page.locator('.desktop-nav').getByRole('link', { name: 'about', exact: true }).click();
    await expect(page).toHaveURL(/about/);
    await expect(page.locator('html')).toHaveAttribute('data-method-triggers', '0');
    await page.getByRole('link', { name: 'Joehan Antony Fernando J home', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.is-pinned')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-lenis', '1');
    await expect(page.locator('.page-wipe')).toHaveClass(/idle/);
    await session.send('HeapProfiler.collectGarbage');
    const { metrics } = await session.send('Performance.getMetrics');
    counts.push(
      Object.fromEntries(
        metrics
          .filter((m: { name: string }) =>
            ['JSEventListeners', 'Nodes', 'JSHeapUsedSize'].includes(m.name),
          )
          .map((m: { name: string; value: number }) => [m.name, m.value]),
      ),
    );
  }
  fs.writeFileSync('reports/navigation-metrics.json', JSON.stringify(counts, null, 2));
  expect(counts.at(-1)!.JSEventListeners - counts[1].JSEventListeners).toBeLessThanOrEqual(2);
  const manifesto = page.locator('.marquee.editorial');
  await expect(manifesto).toHaveClass(/paused/);
  await session.detach();
});
