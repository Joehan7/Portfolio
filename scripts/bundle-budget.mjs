import fs from 'node:fs';
import zlib from 'node:zlib';
const html = fs.readFileSync('.next/server/app/index.html', 'utf8');
const sources = [
  ...new Set([...html.matchAll(/<script(?![^>]*noModule)[^>]*src="([^"]+)"/g)].map((m) => m[1])),
];
const sizes = sources.map((p) => ({
  path: p,
  gzip: zlib.gzipSync(fs.readFileSync('.next' + p.replace('/_next', ''))).length,
}));
const result = { initial: sizes, total: sizes.reduce((n, f) => n + f.gzip, 0), budget: 180000 };
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/bundle-budget.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
