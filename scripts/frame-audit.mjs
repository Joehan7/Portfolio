import { chromium } from '@playwright/test';
import fs from 'node:fs';
const label = process.argv[2] || 'current';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const consoleIssues = [];
  page.on('pageerror', (e) => consoleIssues.push(e.message));
  page.on('console', (e) => {
    if (['error', 'warning'].includes(e.type())) consoleIssues.push(e.text());
  });
  await page.addInitScript(() => sessionStorage.setItem('signal-loaded', '1'));
  await page.goto('http://127.0.0.1:3001/');
  await page.locator('.is-pinned').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  const metrics = async () =>
    Object.fromEntries(
      (await session.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]),
    );
  await page.evaluate(() => {
    window.__auditCanvas = document.querySelector('canvas');
  });
  const segments = [];
  for (const [name, top] of [
    ['hero', 0],
    ['work', 1600],
    [
      'method',
      await page.locator('#method').evaluate((el) => el.getBoundingClientRect().top + scrollY),
    ],
  ]) {
    await page.evaluate(
      (top) =>
        dispatchEvent(
          new CustomEvent('signal:scroll', {
            detail: { target: top, immediate: true },
            cancelable: true,
          }),
        ),
      top,
    );
    await page.waitForTimeout(350);
    const before = await metrics();
    const samples = page.evaluate(
      () =>
        new Promise((resolve) => {
          const intervals = [];
          let last = performance.now();
          const start = last;
          function tick(now) {
            intervals.push(now - last);
            last = now;
            if (now - start < 5000) requestAnimationFrame(tick);
            else resolve(intervals.slice(1));
          }
          requestAnimationFrame(tick);
        }),
    );
    await session.send('Input.synthesizeScrollGesture', {
      x: 1120,
      y: 760,
      yDistance: -2200,
      speed: 500,
      gestureSourceType: 'mouse',
    });
    const intervals = await samples;
    const after = await metrics();
    const sorted = [...intervals].sort((a, b) => a - b);
    segments.push({
      name,
      frames: intervals.length,
      meanFps: +(1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length)).toFixed(1),
      p95FrameMs: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
      over25ms: intervals.filter((v) => v > 25).length,
      layoutCount: after.LayoutCount - before.LayoutCount,
      styleRecalculations: after.RecalcStyleCount - before.RecalcStyleCount,
      layoutMs: +((after.LayoutDuration - before.LayoutDuration) * 1000).toFixed(1),
      styleMs: +((after.RecalcStyleDuration - before.RecalcStyleDuration) * 1000).toFixed(1),
      scriptMs: +((after.ScriptDuration - before.ScriptDuration) * 1000).toFixed(1),
      taskMs: +((after.TaskDuration - before.TaskDuration) * 1000).toFixed(1),
    });
  }
  fs.mkdirSync('reports', { recursive: true });
  const report = {
    label,
    viewport: '1440x1000',
    mode: 'headless Chrome; local production; main-thread RAF pacing, not physical display FPS',
    canvasRetained: await page.evaluate(() =>
      window.__auditCanvas ? window.__auditCanvas === document.querySelector('canvas') : null,
    ),
    segments,
    consoleIssues,
  };
  fs.writeFileSync('reports/frames-' + label + '.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
