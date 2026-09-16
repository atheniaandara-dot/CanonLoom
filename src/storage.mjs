import { parseProject } from './index.mjs';

export const STORAGE_KEY = 'canonloom.project.v1';
export const BACKUP_KEY = 'canonloom.backup.v1';

export function loadWorkspace(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return { project: raw ? parseProject(raw) : null, raw, error: null };
  } catch (error) {
    return { project: null, raw: undefined, error: error.message };
  }
}

/** Preserve the last readable bytes before replacement; never claim a failed write saved. */
export function saveWorkspace(storage, project, expectedRaw) {
  const raw = JSON.stringify(project);
  parseProject(raw);
  const current = storage.getItem(STORAGE_KEY);
  if (expectedRaw !== undefined && current !== expectedRaw)
    throw new Error(
      'This story changed in another tab. Export your work, then reload before editing.',
    );
  if (current && current !== raw) storage.setItem(BACKUP_KEY, current);
  storage.setItem(STORAGE_KEY, raw);
  return raw;
}

export function restoreWorkspace(storage) {
  const raw = storage.getItem(BACKUP_KEY);
  if (!raw) throw new Error('No previous save is available.');
  return parseProject(raw);
}
