import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

test(
  'local server delivers the app and rejects filesystem paths and writes',
  { timeout: 15000 },
  async () => {
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL('../scripts/serve.mjs', import.meta.url))],
      {
        env: { ...process.env, PORT: '0', HOST: '127.0.0.1' },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let output = '';
    try {
      const address = await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error(`Server did not start: ${output}`)),
          10000,
        );
        child.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.on('exit', (code) => {
          clearTimeout(timeout);
          reject(new Error(`Server exited: ${code}. ${output}`));
        });
        child.stdout.on('data', (bytes) => {
          output += bytes.toString();
          const match = output.match(/CanonLoom is ready: (http:\/\/[^\s]+)/);
          if (match) {
            clearTimeout(timeout);
            resolve(match[1]);
          }
        });
        child.stderr.on('data', (bytes) => {
          output += bytes.toString();
        });
      });
      const response = await fetch(address);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), /CanonLoom/);
      assert.equal((await fetch(`${address}/src/index.mjs`)).status, 404);
      assert.equal((await fetch(address, { method: 'POST' })).status, 405);
      const head = await fetch(address, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
    } finally {
      if (child.exitCode === null) {
        const closed = once(child, 'exit');
        child.kill();
        await closed;
      }
    }
  },
);
