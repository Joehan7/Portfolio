import { test as base } from '@playwright/test';
export { expect } from '@playwright/test';
const url = (path: string) =>
  process.env.TEST_BASE_PATH && path.startsWith('/') ? process.env.TEST_BASE_PATH + path : path;
// Prefix only URLs supplied by tests. Application requests remain untouched.
export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = (path, options) => goto(url(path), options);
    await provide(page);
  },
  request: async ({ request }, provide) => {
    const get = request.get.bind(request);
    request.get = (path, options) => get(url(path), options);
    await provide(request);
  },
});
