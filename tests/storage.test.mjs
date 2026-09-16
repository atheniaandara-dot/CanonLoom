import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '../src/index.mjs';
import {
  loadWorkspace,
  saveWorkspace,
  restoreWorkspace,
  STORAGE_KEY,
  BACKUP_KEY,
} from '../src/storage.mjs';
const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};
test('empty browser storage returns no project', () =>
  assert.equal(loadWorkspace(memory()).project, null));
test('save round-trips and preserves the previous save', () => {
  const s = memory();
  const p = createProject('First');
  const raw = saveWorkspace(s, p, null);
  saveWorkspace(s, createProject('Second'), raw);
  assert.equal(loadWorkspace(s).project.title, 'Second');
  assert.equal(restoreWorkspace(s).title, 'First');
});
test('malformed existing saves are reported without deletion', () => {
  const s = memory();
  s.setItem(STORAGE_KEY, 'broken');
  assert.ok(loadWorkspace(s).error);
  assert.equal(s.getItem(STORAGE_KEY), 'broken');
});
test('invalid imported projects never overwrite stored data', () => {
  const s = memory();
  saveWorkspace(s, createProject('Original'), null);
  assert.throws(() => saveWorkspace(s, {}, undefined));
  assert.equal(loadWorkspace(s).project.title, 'Original');
});
test('storage failures surface errors instead of claiming success', () => {
  const s = {
    getItem() {
      throw new Error('Denied');
    },
    setItem() {
      throw new Error('Quota');
    },
  };
  assert.match(loadWorkspace(s).error, /Denied/);
  assert.throws(() => saveWorkspace(s, createProject()), /Denied/);
});
test('quota failure leaves the existing primary save intact', () => {
  const s = memory();
  const raw = saveWorkspace(s, createProject('First'), null);
  const failing = {
    getItem: s.getItem,
    setItem(key, value) {
      if (key === STORAGE_KEY) throw new Error('Quota');
      s.setItem(key, value);
    },
  };
  assert.throws(() => saveWorkspace(failing, createProject('Second'), raw), /Quota/);
  assert.equal(loadWorkspace(s).project.title, 'First');
});
test('stale tab cannot clobber another tab save', () => {
  const s = memory();
  const raw = saveWorkspace(s, createProject('First'), null);
  saveWorkspace(s, createProject('External'), raw);
  assert.throws(() => saveWorkspace(s, createProject('Stale'), raw), /another tab/);
  assert.equal(loadWorkspace(s).project.title, 'External');
});
test('restoring missing or malformed backups reports an error', () => {
  const s = memory();
  assert.throws(() => restoreWorkspace(s), /No previous/);
  s.setItem(BACKUP_KEY, 'broken');
  assert.throws(() => restoreWorkspace(s), /invalid JSON/);
});
