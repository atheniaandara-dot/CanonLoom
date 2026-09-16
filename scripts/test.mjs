import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = (await readdir(`${root}tests`))
  .filter((file) => file.endsWith('.test.mjs'))
  .sort()
  .map((file) => `${root}tests/${file}`);
const args = [
  '--test',
  ...(process.argv.includes('--coverage') ? ['--experimental-test-coverage'] : []),
  ...files,
];
const result = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: root });
process.exitCode = result.status ?? 1;
