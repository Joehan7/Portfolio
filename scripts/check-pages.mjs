import path from 'node:path';
import { readdir, readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = path.resolve('out');
async function walk(folder) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    assert(!entry.isSymbolicLink(), 'Pages artifact must not contain symlinks: ' + file);
    files.push(...(entry.isDirectory() ? await walk(file) : [file]));
  }
  return files;
}
const files = await walk(root);
const slugs = [
  'intelligent-soc-triage',
  'subscription-management',
  'adpilot',
  'password-strength-analyzer',
];
for (const route of ['', 'work', 'about', 'contact', 'resume', ...slugs.map((s) => 'work/' + s)]) {
  assert((await stat(path.join(root, route, 'index.html'))).isFile(), route + ' missing');
  const og = await readFile(path.join(root, route, 'opengraph-image.png'));
  assert.equal(og.subarray(1, 4).toString(), 'PNG', route + ' OG missing');
}
assert((await stat(path.join(root, '404.html'))).isFile());
assert.deepEqual(
  await readFile(path.join(root, 'resume.pdf')),
  await readFile('public/resume.pdf'),
);
let checked = 0;
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    assert(url.startsWith('/Portfolio/'), 'Unprefixed URL in ' + file + ': ' + url);
    const relative = decodeURIComponent(url.slice('/Portfolio/'.length).split(/[?#]/)[0]);
    let target = path.join(root, relative);
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    assert((await stat(target)).isFile(), 'Missing ' + url);
    checked++;
  }
}
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(["']?(\/[^)"']+)/g))
    assert(match[1].startsWith('/Portfolio/'), 'Unprefixed CSS asset: ' + match[1]);
}
const bytes = (await Promise.all(files.map(async (f) => (await stat(f)).size))).reduce(
  (a, b) => a + b,
  0,
);
assert(bytes < 10 * 1024 ** 3, 'Artifact exceeds Pages limit');
console.log(
  'Pages artifact verified: ' +
    files.length +
    ' files, ' +
    checked +
    ' HTML URLs, ' +
    (bytes / 1024 / 1024).toFixed(2) +
    ' MiB; PDF unchanged, 9 pages, 9 PNG sharing images, custom 404.',
);
