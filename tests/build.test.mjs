import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import '../scripts/build.mjs';
test('standalone bundle parses and matches its content-security script hash', async () => {
  const html = await readFile(new URL('../dist/CanonLoom.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(() => new Script(script));
  assert.ok(html.includes(`'sha256-${createHash('sha256').update(script).digest('base64')}'`));
  assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)=["']https?:/);
  assert.ok(html.includes("connect-src 'none'"));
});
