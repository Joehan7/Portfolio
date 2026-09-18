import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile, writeFile, readdir, copyFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const build = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GITHUB_PAGES: 'true',
    NEXT_PUBLIC_SITE_URL: 'https://joehan7.github.io/Portfolio',
  },
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);
// Preserve the source document for ordinary hosting; prefix only the exported links.
await writeFile(
  'out/llms.txt',
  (await readFile('public/llms.txt', 'utf8')).replace(/\]\(\//g, '](/Portfolio/'),
);
await writeFile('out/.nojekyll', '');

// PNG aliases give static hosts an explicit image MIME type; retain original endpoints too.
async function copyOG(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = folder + '/' + entry.name;
    if (entry.isDirectory()) await copyOG(file);
    else if (entry.name === 'opengraph-image') await copyFile(file, file + '.png');
  }
}
await copyOG('out');
// Next 16.3.5 normalizes forward slashes only when exporting segment filenames.
// Windows therefore emits nested directories. Add the flat names its router requests.
async function flattenSegments(folder, destination, segments) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const parts = [...segments, entry.name];
    const file = folder + '/' + entry.name;
    if (entry.isDirectory()) await flattenSegments(file, destination, parts);
    else if (entry.name.endsWith('.txt')) await copyFile(file, destination + '/' + parts.join('.'));
  }
}
async function normalizeSegments(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = folder + '/' + entry.name;
    if (entry.name.startsWith('__next.')) await flattenSegments(file, folder, [entry.name]);
    else await normalizeSegments(file);
  }
}
await normalizeSegments('out');
await import('./check-pages.mjs');
