import http from 'node:http';
import path from 'node:path';
import { stat, readFile } from 'node:fs/promises';
const root = path.resolve('out');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (!url.pathname.startsWith('/Portfolio/')) {
        response.writeHead(404);
        response.end();
        return;
      }
      const file = path.resolve(
        root,
        '.' + decodeURIComponent(url.pathname.slice('/Portfolio'.length)),
      );
      if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Outside artifact');
      let target = file,
        status = 200;
      try {
        if ((await stat(target)).isDirectory()) {
          if (!url.pathname.endsWith('/')) {
            response.writeHead(301, { Location: url.pathname + '/' + url.search });
            response.end();
            return;
          }
          target = path.join(target, 'index.html');
        }
        await stat(target);
      } catch {
        target = path.join(root, '404.html');
        status = 404;
      }
      const body = await readFile(target);
      response.writeHead(status, {
        'Content-Type':
          types[path.extname(target)] ||
          (path.basename(target) === 'opengraph-image' ? 'image/png' : 'application/octet-stream'),
      });
      response.end(body);
    } catch {
      response.writeHead(500);
      response.end();
    }
  })
  .listen(3002, '127.0.0.1', () => console.log('Pages artifact: http://127.0.0.1:3002/Portfolio/'));
