import './build.mjs';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { VERSION } from '../src/index.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(`${root}release`, { recursive: true });
await copyFile(`${root}dist/CanonLoom.html`, `${root}release/CanonLoom-${VERSION}.html`);
// npm's built-in pack keeps the library + CLI installable without publishing to npm.
const result = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['pack', '--pack-destination', 'release', '--ignore-scripts'],
  { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' },
);
if (result.status !== 0) throw new Error(result.stderr || 'npm pack failed');
const files = [`CanonLoom-${VERSION}.html`, `canonloom-${VERSION}.tgz`];
const hashes = [];
for (const file of files)
  hashes.push(
    `${createHash('sha256')
      .update(await readFile(`${root}release/${file}`))
      .digest('hex')}  ${file}`,
  );
await writeFile(`${root}release/SHA256SUMS.txt`, hashes.join('\n') + '\n');
console.log(`Release assets ready in release/: ${files.join(', ')}, SHA256SUMS.txt`);
