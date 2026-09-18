import { test, expect } from './fixtures';
test.beforeEach(() => {
  test.skip(!process.env.TEST_BASE_PATH, 'These checks target the repository-path export.');
});
test('Pages query links keep existing project filtering', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/?q=Python');
  await expect(page.locator('#work-search')).toHaveValue('Python');
  await expect(page.locator('.project-band')).toHaveCount(2);
  await page.goto('/work/?domain=AI%20%26%20agents');
  await expect(page.getByRole('button', { name: 'AI & agents', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.project-band')).toHaveCount(2);
});
test('Pages assets, metadata, and direct refresh stay inside the repository path', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const leaks: string[] = [],
    failed: string[] = [],
    errors: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.origin === 'http://127.0.0.1:3002' && !u.pathname.startsWith('/Portfolio/'))
      leaks.push(u.pathname);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  for (const route of [
    '/',
    '/work/',
    '/about/',
    '/contact/',
    '/resume/',
    '/work/intelligent-soc-triage/',
    '/work/subscription-management/',
    '/work/adpilot/',
    '/work/password-strength-analyzer/',
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://joehan7.github.io/Portfolio' + route,
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/Portfolio/icon.svg');
    const images = await page.locator('img').evaluateAll(async (elements) => {
      const imgs = elements as HTMLImageElement[];
      imgs.forEach((i) => {
        i.loading = 'eager';
      });
      await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
      return imgs.map((i) => ({ width: i.naturalWidth, src: i.currentSrc }));
    });
    for (const image of images) {
      expect(image.width, image.src).toBeGreaterThan(0);
      expect(new URL(image.src).pathname).toMatch(/^\/Portfolio\//);
    }
    await page.waitForLoadState('networkidle');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForLoadState('networkidle');
  }
  const pdf = await request.get('/resume.pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const sitemap = await request.get('/sitemap.xml');
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  expect(urls).toHaveLength(9);
  for (const url of urls) expect(url).toMatch(/^https:\/\/joehan7.github.io\/Portfolio\//);
  expect(await (await request.get('/robots.txt')).text()).toContain(
    'Sitemap: https://joehan7.github.io/Portfolio/sitemap.xml',
  );
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).not.toMatch(/\]\(\/(?!Portfolio\/)/);
  expect(leaks).toEqual([]);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});
test('supported WebGL keeps the existing animated field', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  const supported = await page.evaluate(() => {
    if (!matchMedia('(pointer: fine)').matches) return false;
    const context = document
      .createElement('canvas')
      .getContext('webgl2', { antialias: false, alpha: true, powerPreference: 'high-performance' });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  });
  if (supported) await expect(page.locator('.hero-stage canvas')).toBeVisible();
  else await expect(page.locator('.field-top')).toContainText('static study');
});
