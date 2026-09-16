import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import './build.mjs';

const page = await readFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const server = createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  if (!['/', '/index.html', '/CanonLoom.html'].includes(req.url?.split('?')[0])) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(req.method === 'HEAD' ? undefined : page);
});
server.listen(port, host, () =>
  console.log(`CanonLoom is ready: http://${host}:${server.address().port}`),
);
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
