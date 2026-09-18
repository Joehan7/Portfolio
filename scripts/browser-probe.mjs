import { firefox, webkit } from '@playwright/test';
for (const [name, type] of Object.entries({ firefox, webkit })) {
  console.log('Launching', name);
  let browser;
  try {
    browser = await type.launch({ headless: true, timeout: 15000 });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:3001/', { timeout: 20000 });
    console.log(name, await page.title());
  } catch (e) {
    console.log(name, e.message);
  } finally {
    await browser?.close();
  }
}
