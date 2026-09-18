import { test, expect } from './fixtures';
for (const unavailable of ['null', 'throws']) {
  test(
    'WebGL unavailable (' + unavailable + ') keeps the poster without runtime errors',
    async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.addInitScript((mode) => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          ...args: Parameters<typeof getContext>
        ) {
          if (String(args[0]).startsWith('webgl')) {
            if (mode === 'throws') throw new Error('WebGL unavailable');
            return null;
          }
          return getContext.apply(this, args);
        } as typeof getContext;
      }, unavailable);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
      const poster = page.locator('.hero-poster');
      await expect(poster).toBeVisible();
      await expect
        .poll(() => poster.evaluate((image) => (image as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
      await expect(page.locator('.field-top')).toContainText('static');
      await expect(page.locator('.hero-stage canvas')).toHaveCount(0);
      expect(errors).toEqual([]);
    },
  );
}
