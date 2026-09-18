import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
test('home is rendered and accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((v) => ['critical', 'serious'].includes(v.impact || ''))).toEqual(
    [],
  );
});
