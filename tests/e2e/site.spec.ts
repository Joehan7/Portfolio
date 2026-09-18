import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
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
for (const route of routes) {
  test('accessible production route ' + route, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter((v) => ['serious', 'critical'].includes(v.impact || '')),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}
for (const width of [360, 768, 1024, 1440, 1920, 2560]) {
  test('responsive layout ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
    await page.evaluate(() => document.fonts.ready);
    const sizes = await page.evaluate(() => ({
      viewport: innerWidth,
      page: document.documentElement.scrollWidth,
      headline: Array.from(document.querySelectorAll('.hero-line')).map((el) => ({
        scroll: el.scrollWidth,
        client: el.clientWidth,
      })),
    }));
    expect(sizes.page).toBeLessThanOrEqual(width + 1);
    for (const line of sizes.headline) expect(line.scroll).toBeLessThanOrEqual(line.client + 1);
    await page.screenshot({ path: 'reports/home-' + width + '.png', fullPage: false });
  });
}
test('keyboard mega menu, command palette, and route transitions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'skip to content' })).toBeFocused();
  const menu = page.getByRole('button', { name: 'Featured projects' });
  await menu.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#mega-menu')).toBeVisible();
  await expect(page.locator('#mega-menu a').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#mega-menu a').nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Find your signal.' })).toBeVisible();
  const input = page.getByRole('combobox');
  await input.fill('AdPilot');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/work\/adpilot/);
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').fill('motion');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('mobile navigation traps and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  const button = page.getByRole('button', { name: 'open navigation' });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'main navigation' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() =>
      document.querySelector('dialog[open]')?.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await button.click();
  await dialog.getByRole('link', { name: 'about', exact: true }).click();
  await expect(page).toHaveURL(/about/);
  await expect(dialog).not.toBeVisible();
});
test('live search and no results', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  const search = page.getByRole('textbox', { name: 'search work and skills' });
  await search.fill('Python');
  await expect(page.locator('.search-projects a')).toHaveCount(2);
  await search.fill('zzzzzzzz');
  await expect(
    page.getByText('Nothing yet. Explore these related capabilities and projects.'),
  ).toBeVisible();
  await expect(page.locator('.match-count > .sr-only')).toHaveText('0 matches');
  await page.getByRole('button', { name: 'clear search' }).click();
  await expect(search).toHaveValue('');
});
test('contact form validates and never fakes delivery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  await page.getByRole('button', { name: 'send message' }).click();
  await expect(page.getByText('Enter at least 2 characters.')).toBeVisible();
  await page.getByLabel('name', { exact: true }).fill('Local Test');
  await page.getByLabel('email address', { exact: true }).fill('local@example.com');
  await page
    .getByLabel('message', { exact: true })
    .fill('This verifies the unconfigured local delivery state.');
  await page.getByRole('button', { name: 'send message' }).click();
  await expect(page.locator('.form-status')).toHaveText(
    'Message delivery is not configured yet. Please use the email link.',
  );
});
test('motion toggle persists and disables moving features', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.getByRole('button', { name: 'motion off', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await page.getByRole('button', { name: 'motion on', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  expect(
    await page
      .locator('.marquee-track')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await expect(page.locator('.preloader')).toHaveCount(0);
  await expect(page.locator('.is-pinned')).toHaveCount(0);
});
test('command palette passes accessibility', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('combobox')).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((v) => ['critical', 'serious'].includes(v.impact || ''))).toEqual(
    [],
  );
});
test('terminal responds and navigates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/missing-signal');
  await expect(page.locator('html')).toHaveAttribute('data-motion', /reduced|full/);
  await page.locator('#terminal-input').fill('whoami');
  await page.getByRole('button', { name: 'run command' }).click();
  await expect(page.getByRole('log')).toContainText('Joehan Antony Fernando J');
  await page.locator('#terminal-input').fill('work');
  await page.getByRole('button', { name: 'run command' }).click();
  await expect(page).toHaveURL(/work/);
});
test('public artefacts resolve', async ({ request }) => {
  for (const route of [
    '/resume.pdf',
    '/llms.txt',
    '/robots.txt',
    '/sitemap.xml',
    '/opengraph-image',
    '/work/opengraph-image',
    '/about/opengraph-image',
    '/contact/opengraph-image',
    '/resume/opengraph-image',
    '/work/intelligent-soc-triage/opengraph-image',
    '/work/adpilot/opengraph-image',
    '/work/password-strength-analyzer/opengraph-image',
    '/work/subscription-management/opengraph-image',
  ]) {
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    expect((await response.body()).length).toBeGreaterThan(50);
  }
});
