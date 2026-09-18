import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import fs from 'node:fs';
import path from 'node:path';
const output = path.resolve('reports');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--remote-debugging-port=9223'],
});
try {
  const response = await fetch('http://127.0.0.1:9223/json/version');
  console.log('Chrome debug endpoint:', response.status);
  const result = await lighthouse(process.env.AUDIT_URL || 'http://127.0.0.1:3001/', {
    port: 9223,
    hostname: '127.0.0.1',
    output: ['json', 'html'],
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  fs.writeFileSync(path.join(output, 'lighthouse-mobile.json'), result.report[0]);
  fs.writeFileSync(path.join(output, 'lighthouse-mobile.html'), result.report[1]);
  console.log(
    JSON.stringify(
      {
        categories: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([k, v]) => [k, v.score * 100]),
        ),
        metrics: Object.fromEntries(
          [
            'first-contentful-paint',
            'largest-contentful-paint',
            'cumulative-layout-shift',
            'total-blocking-time',
            'total-byte-weight',
          ].map((k) => [k, result.lhr.audits[k]?.numericValue]),
        ),
        failed: Object.values(result.lhr.audits)
          .filter((a) => a.score !== null && a.score < 1)
          .map((a) => ({ id: a.id, title: a.title, value: a.displayValue })),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
