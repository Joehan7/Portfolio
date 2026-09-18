import { webkit } from '@playwright/test';
const browser = await webkit.launch({ headless: true });
try {
 const page = await browser.newPage();
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.goto('http://127.0.0.1:3001/');
 await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
 await page.keyboard.press('Tab');
 console.log('After Tab:', await page.evaluate(() => ({ active: document.activeElement?.outerHTML, focused: document.hasFocus() })));
 await page.setViewportSize({ width: 360, height: 800 });
 await page.getByRole('button', { name: 'open navigation' }).click();
 console.log('Opening menu:', await page.evaluate(() => document.activeElement?.outerHTML));
 await page.keyboard.press('Escape');
 console.log('After escape:', await page.evaluate(() => document.activeElement?.outerHTML));
 await page.goto('http://127.0.0.1:3001/missing-signal');
 await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduced');
 await page.locator('#terminal-input').fill('whoami');
 await page.getByRole('button', { name: 'run command' }).click();
 console.log('Terminal:', await page.getByRole('log').textContent());
} finally { await browser.close(); }

