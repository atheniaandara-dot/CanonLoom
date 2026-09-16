import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProject } from '../src/index.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const run = (...args) =>
  spawnSync(process.execPath, [`${root}bin/canonloom.mjs`, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
test('CLI version and help run without dependencies', () => {
  assert.equal(run('--version').stdout.trim(), '0.1.0');
  assert.match(run('--help').stdout, /Usage/);
});
test('CLI returns 1 for continuity errors and machine-readable JSON', () => {
  const r = run('check', 'examples/the-glass-harbor.json', '--json');
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).stats.errors, 3);
});
test('validation verifies structure without treating deliberate contradictions as invalid input', () => {
  assert.equal(run('validate', 'examples/the-glass-harbor.json').status, 0);
});
test('CLI produces scoped context', () => {
  const r = run(
    'context',
    'examples/the-glass-harbor.json',
    '--character',
    'mira',
    '--through',
    'crossing',
  );
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Mira Vale only/);
  assert.doesNotMatch(r.stdout, /## Soren/);
});
test('CLI rejects bad options, absent files and unknown commands', () => {
  for (const args of [
    ['wrong'],
    ['check', 'missing.json'],
    ['check', 'examples/the-glass-harbor.json', '--through'],
    ['context', 'examples/the-glass-harbor.json', '--strict'],
  ])
    assert.equal(run(...args).status, 2);
});
test('init never overwrites an existing file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'canonloom-'));
  try {
    const file = join(dir, 'example.json');
    assert.equal(run('init', file).status, 0);
    assert.equal(run('init', file).status, 2);
  } finally {
    await rm(dir, { recursive: true });
  }
});
test('strict mode distinguishes warnings from errors', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'canonloom-'));
  try {
    const p = createProject();
    p.entities = [{ id: 'a', name: 'A', type: 'character' }];
    p.scenes = [
      {
        id: 's',
        title: 'S',
        order: 1,
        status: 'draft',
        events: [{ id: 'e', kind: 'assert', entity: 'a', field: 'emotion', value: 'calm' }],
      },
    ];
    const file = join(dir, 'warning.json');
    await writeFile(file, JSON.stringify(p));
    assert.equal(run('check', file).status, 0);
    assert.equal(run('check', file, '--strict').status, 1);
  } finally {
    await rm(dir, { recursive: true });
  }
});
