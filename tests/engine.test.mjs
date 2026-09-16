import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  checkProject,
  createProject,
  parseProject,
  validateProject,
  exportContext,
  ProjectValidationError,
} from '../src/index.mjs';

const demo = () =>
  readFile(new URL('../examples/the-glass-harbor.json', import.meta.url), 'utf8').then(
    parseProject,
  );
const clone = (value) => structuredClone(value);
function fixture() {
  return {
    ...createProject('Test story'),
    entities: [
      { id: 'a', name: 'Ari', type: 'character' },
      { id: 'b', name: 'Bea', type: 'character' },
      { id: 'port', name: 'Port', type: 'location' },
      { id: 'hill', name: 'Hill', type: 'location' },
      { id: 'key', name: 'Key', type: 'item' },
    ],
    facts: [
      { id: 'f1', entity: 'a', field: 'clothing', value: 'blue coat', source: 'Chapter zero' },
      { id: 'f2', entity: 'a', field: 'location', value: 'port' },
    ],
  };
}
const event = (kind, field, value, extra = {}) => ({
  id: 'e1',
  kind,
  entity: 'a',
  field,
  ...(kind === 'unset' ? {} : { value }),
  ...extra,
});
const scene = (events, extra = {}) => ({
  id: 's1',
  title: 'Scene one',
  order: 1,
  status: 'canon',
  events,
  ...extra,
});
const factValue = (result, entity, field) =>
  result.facts.find((f) => f.entity === entity && f.field === field)?.value;

test('example finds exactly the three documented errors with evidence', async () => {
  const result = checkProject(await demo());
  assert.deepEqual(
    result.issues.map((i) => i.code),
    ['CONTRADICTION', 'CONTRADICTION', 'KNOWLEDGE_LEAK'],
  );
  assert.equal(result.stats.committedScenes, 1);
  assert.equal(factValue(result, 'lantern', 'holder'), 'mira');
  assert.equal(result.issues[0].source, 'Opening: Mira waits on the quay.');
});
test('empty project is valid and produces no invented facts', () =>
  assert.deepEqual(checkProject(createProject()).facts, []));
test('engine is deterministic and does not mutate input', async () => {
  const project = await demo();
  const before = clone(project);
  assert.deepEqual(checkProject(project), checkProject(project));
  assert.deepEqual(project, before);
});
test('claims disagree with opening facts but never overwrite them', () => {
  const p = fixture();
  p.scenes = [scene([event('assert', 'clothing', 'red coat')])];
  const r = checkProject(p);
  assert.equal(r.valid, false);
  assert.equal(factValue(r, 'a', 'clothing'), 'blue coat');
  assert.equal(r.scenes[0].committed, false);
});
test('explicit explained change allows later claims and preserves provenance', () => {
  const p = fixture();
  p.scenes = [
    scene([event('set', 'clothing', 'red coat', { reason: 'Changed after the rain.' })]),
    scene([event('assert', 'clothing', 'red coat')], { id: 's2', order: 2 }),
  ];
  const r = checkProject(p);
  assert.equal(r.valid, true);
  assert.equal(r.issues.length, 0);
  assert.equal(r.stats.committedScenes, 2);
  assert.equal(r.facts.find((f) => f.field === 'clothing').sceneId, 's1');
});
test('one error rolls back every change in a canon scene', () => {
  const p = fixture();
  p.scenes = [
    scene([
      event('set', 'emotion', 'angry'),
      event('assert', 'clothing', 'red coat', { id: 'e2' }),
    ]),
  ];
  const r = checkProject(p);
  assert.equal(factValue(r, 'a', 'emotion'), undefined);
  assert.equal(r.scenes[0].changes.length, 1);
  assert.equal(r.scenes[0].blocked, true);
});
test('draft changes never leak to other drafts or canon scenes', () => {
  const p = fixture();
  p.scenes = [
    scene([event('set', 'clothing', 'red coat', { reason: 'Changed.' })], { status: 'draft' }),
    scene([event('assert', 'clothing', 'red coat')], { id: 's2', order: 2, status: 'draft' }),
  ];
  const r = checkProject(p);
  assert.equal(r.issues[0].code, 'CONTRADICTION');
  assert.equal(factValue(r, 'a', 'clothing'), 'blue coat');
});
test('events use in-scene order and can assert a change made earlier in that scene', () => {
  const p = fixture();
  p.scenes = [
    scene([event('set', 'emotion', 'happy'), event('assert', 'emotion', 'happy', { id: 'e2' })]),
  ];
  assert.equal(checkProject(p).valid, true);
  p.scenes[0].events.reverse();
  assert.equal(checkProject(p).issues[0].code, 'UNKNOWN_FACT');
});
test('unknown assertions warn and do not establish facts', () => {
  const p = fixture();
  p.scenes = [scene([event('assert', 'emotion', 'happy')])];
  const r = checkProject(p);
  assert.equal(r.valid, true);
  assert.equal(r.stats.warnings, 1);
  assert.equal(factValue(r, 'a', 'emotion'), undefined);
});
test('unknown knowledge is distinct from explicitly false knowledge', () => {
  const p = fixture();
  p.scenes = [scene([event('assert', 'knows:secret', true)])];
  assert.equal(checkProject(p).issues[0].code, 'UNESTABLISHED_KNOWLEDGE');
  p.facts.push({ id: 'f3', entity: 'a', field: 'knows:secret', value: false });
  assert.equal(checkProject(p).issues[0].code, 'KNOWLEDGE_LEAK');
});
test('learning is an explicit event and cannot be inferred from another character', () => {
  const p = fixture();
  p.facts.push({ id: 'f3', entity: 'b', field: 'knows:secret', value: true });
  p.scenes = [
    scene([
      event('set', 'knows:secret', true, { reason: 'Bea tells Ari.' }),
      event('assert', 'knows:secret', true, { id: 'e2' }),
    ]),
  ];
  assert.equal(checkProject(p).issues.length, 0);
});
test('item ownership has one scalar holder and transfers explicitly', () => {
  const p = fixture();
  p.facts.push({ id: 'f3', entity: 'key', field: 'holder', value: 'a' });
  p.scenes = [
    scene([
      event('set', 'holder', 'b', { entity: 'key', reason: 'Ari hands it to Bea.' }),
      event('assert', 'holder', 'a', { id: 'e2', entity: 'key' }),
    ]),
  ];
  assert.equal(checkProject(p).issues[0].code, 'CONTRADICTION');
});
test('locked facts reject both changes and removal but allow the same value', () => {
  const p = fixture();
  p.facts[0].locked = true;
  for (const e of [event('set', 'clothing', 'red coat'), event('unset', 'clothing')]) {
    p.scenes = [scene([e])];
    assert.equal(checkProject(p).issues[0].code, 'LOCKED_FACT');
  }
  p.scenes = [scene([event('set', 'clothing', 'blue coat')])];
  assert.equal(checkProject(p).issues.length, 0);
});
test('unexplained changes warn; explanations consisting of whitespace do not count', () => {
  const p = fixture();
  p.scenes = [scene([event('set', 'clothing', 'red coat', { reason: '  ' })])];
  const r = checkProject(p);
  assert.equal(r.issues[0].code, 'UNEXPLAINED_CHANGE');
  assert.equal(r.scenes[0].committed, true);
});
test('removal makes a fact unknown, not false or null', () => {
  const p = fixture();
  p.scenes = [
    scene([
      event('unset', 'clothing', undefined, { reason: 'The record was lost.' }),
      event('assert', 'clothing', null, { id: 'e2' }),
    ]),
  ];
  const r = checkProject(p);
  assert.equal(r.issues[0].code, 'UNKNOWN_FACT');
  assert.equal(factValue(r, 'a', 'clothing'), undefined);
});
test('removing an unknown fact warns', () => {
  const p = fixture();
  p.scenes = [scene([event('unset', 'emotion')])];
  assert.equal(checkProject(p).issues[0].code, 'UNKNOWN_REMOVAL');
});
test('null, false, zero and empty string remain distinct values', () => {
  for (const [before, after] of [
    [null, false],
    [false, 0],
    [0, ''],
    ['', null],
    [1, '1'],
  ]) {
    const p = fixture();
    p.facts[0].value = before;
    p.scenes = [scene([event('assert', 'clothing', after)])];
    assert.equal(checkProject(p).issues[0].code, 'CONTRADICTION');
  }
});
test('world equality rule checks opening canon, writes and removal', () => {
  const p = fixture();
  p.rules = [
    {
      id: 'r1',
      entity: 'a',
      field: 'clothing',
      operator: 'equals',
      value: 'blue coat',
      description: 'Always wears blue.',
    },
  ];
  p.scenes = [scene([event('set', 'clothing', 'red coat')])];
  assert.equal(checkProject(p).issues[0].code, 'WORLD_RULE');
  p.scenes = [scene([event('unset', 'clothing')])];
  assert.equal(checkProject(p).issues[0].code, 'WORLD_RULE');
  p.facts[0].value = 'red coat';
  assert.equal(checkProject(p).issues[0].source, 'Opening canon');
  assert.equal(checkProject(p).scenes[0].committed, false);
});
test('world inequality forbids only the matching known value', () => {
  const p = fixture();
  p.rules = [
    {
      id: 'r1',
      entity: 'a',
      field: 'emotion',
      operator: 'notEquals',
      value: 'dead',
      description: 'Not dead.',
    },
  ];
  assert.equal(checkProject(p).valid, true);
  p.scenes = [scene([event('set', 'emotion', 'dead')])];
  assert.equal(checkProject(p).valid, false);
});
test('scenes sort chronologically independent of array / manuscript order', () => {
  const p = fixture();
  p.scenes = [
    scene([event('assert', 'clothing', 'red coat')], { id: 's2', order: 2, time: 20 }),
    scene([event('set', 'clothing', 'red coat', { reason: 'Changed.' })], { order: 1, time: 0 }),
  ];
  assert.equal(checkProject(p).valid, true);
  assert.deepEqual(
    checkProject(p).scenes.map((s) => s.id),
    ['s1', 's2'],
  );
});
test('time cannot go backwards across committed scenes', () => {
  const p = fixture();
  p.scenes = [scene([], { time: 20 }), scene([], { id: 's2', order: 2, time: 10 })];
  assert.equal(checkProject(p).issues[0].code, 'TIMELINE_REVERSED');
  assert.equal(checkProject(p).scenes[1].committed, false);
});
test('draft time and blocked time do not advance committed clock', () => {
  const p = fixture();
  p.scenes = [
    scene([], { time: 100, status: 'draft' }),
    scene([], { id: 's2', order: 2, time: 20 }),
  ];
  assert.equal(checkProject(p).valid, true);
});
test('missing timestamps preserve the last established time', () => {
  const p = fixture();
  p.scenes = [
    scene([], { time: 50 }),
    scene([], { id: 's2', order: 2 }),
    scene([], { id: 's3', order: 3, time: 10 }),
  ];
  assert.equal(checkProject(p).issues[0].code, 'TIMELINE_REVERSED');
});
test('throughScene stops before future scenes and rejects unknown ids', async () => {
  const p = await demo();
  assert.equal(checkProject(p, { throughScene: 'crossing' }).stats.errors, 0);
  assert.throws(() => checkProject(p, { throughScene: 'missing' }), RangeError);
});
test('editing an earlier event invalidates later dependent claims', () => {
  const p = fixture();
  p.scenes = [
    scene([event('set', 'clothing', 'red coat', { reason: 'Changed.' })]),
    scene([event('assert', 'clothing', 'red coat')], { id: 's2', order: 2 }),
  ];
  p.scenes[0].events[0].value = 'green coat';
  assert.equal(checkProject(p).issues[0].sceneId, 's2');
});
test('context excludes drafts and warns when there are errors', async () => {
  const text = exportContext(await demo());
  assert.match(text, /Review required: 3 error/);
  assert.match(text, /bandaged/);
  assert.doesNotMatch(text, /injury:left-wrist: "healed"/);
});
test('character context excludes other entities, notes and provenance', async () => {
  const p = await demo();
  p.entities[0].notes = 'PRIVATE NOTE';
  p.facts[0].source = 'SECRET SOURCE';
  const text = exportContext(p, { character: 'mira' });
  assert.doesNotMatch(text, /PRIVATE NOTE|SECRET SOURCE|## Soren|## Harbor|World rules/);
  assert.match(text, /knows:sealed-route: false/);
  assert.throws(() => exportContext(p, { character: 'world' }), RangeError);
});
test('context escapes markup and collapses embedded newlines', () => {
  const p = fixture();
  p.title = '<script>\n# injected';
  const text = exportContext(p);
  assert.ok(text.includes('\\<script\\> \\# injected'));
  assert.equal(text.includes('\n# injected'), false);
});

test('malformed inputs produce validation errors instead of crashes', () => {
  for (const bad of [
    null,
    [],
    {},
    'x',
    42,
    { ...fixture(), schemaVersion: 2 },
    { ...fixture(), title: '' },
    { ...fixture(), entities: [{ id: 'a', name: 'A', type: ['bad'] }] },
    { ...fixture(), scenes: [scene([event('nonsense', 'x', true)])] },
  ])
    assert.equal(validateProject(bad).valid, false);
});
test('JSON imports reject syntax, unsupported versions and oversized input', () => {
  assert.throws(() => parseProject('{'), ProjectValidationError);
  assert.throws(
    () => parseProject(JSON.stringify({ ...fixture(), schemaVersion: 99 })),
    ProjectValidationError,
  );
  assert.throws(() => parseProject(' '.repeat(5 * 1024 * 1024 + 1)), /exceeds/);
  assert.throws(() => parseProject(3), TypeError);
});
test('IDs are unique within collection and scene events; orders are unique', () => {
  const p = fixture();
  p.entities.push(clone(p.entities[0]));
  assert.equal(validateProject(p).valid, false);
  p.entities.pop();
  p.scenes = [
    scene([event('assert', 'clothing', 'blue coat'), event('assert', 'clothing', 'blue coat')]),
  ];
  assert.equal(validateProject(p).valid, false);
  p.scenes = [scene([]), scene([], { id: 's2' })];
  assert.equal(validateProject(p).valid, false);
});
test('ambiguous duplicate opening facts are rejected', () => {
  const p = fixture();
  p.facts.push({ ...p.facts[0], id: 'duplicate' });
  assert.equal(validateProject(p).valid, false);
});
test('entity references and known field types are checked', () => {
  for (const row of [
    { entity: 'missing', field: 'x', value: true },
    { entity: 'a', field: 'location', value: 'b' },
    { entity: 'a', field: 'holder', value: 'a' },
    { entity: 'key', field: 'holder', value: 'missing' },
    { entity: 'a', field: 'knows:secret', value: 'true' },
    { entity: 'a', field: 'alive', value: 0 },
    { entity: 'a', field: 'relationship:port', value: 'friend' },
    { entity: 'port', field: 'address:a', value: 'Sir' },
  ]) {
    const p = fixture();
    p.facts.push({ id: 'bad', ...row });
    assert.equal(validateProject(p).valid, false);
  }
});
test('unset forbids a value; set and assert require values', () => {
  const p = fixture();
  p.scenes = [scene([{ id: 'e', kind: 'set', entity: 'a', field: 'emotion' }])];
  assert.equal(validateProject(p).valid, false);
  p.scenes[0].events[0] = { id: 'e', kind: 'unset', entity: 'a', field: 'emotion', value: null };
  assert.equal(validateProject(p).valid, false);
});
test('unsafe IDs and unknown properties are rejected', () => {
  const p = fixture();
  p.entities[0].id = '../x';
  assert.equal(validateProject(p).valid, false);
  assert.throws(() => parseProject('{"__proto__":{"polluted":true}}'), ProjectValidationError);
  assert.equal({}.polluted, undefined);
});
test('nonfinite numbers, negative order, object values and empty names are rejected', () => {
  for (const value of [Infinity, NaN, {}, []]) {
    const p = fixture();
    p.facts[0].value = value;
    assert.equal(validateProject(p).valid, false);
  }
  const p = fixture();
  p.scenes = [scene([], { order: -1 })];
  assert.equal(validateProject(p).valid, false);
  p.scenes = [];
  p.entities[0].name = '';
  assert.equal(validateProject(p).valid, false);
});
test('Unicode story text survives JSON round-trip', () => {
  const p = fixture();
  p.title = '바다의 기억 — Ingatan Laut';
  p.facts[0].value = '검은 코트';
  assert.deepEqual(parseProject(JSON.stringify(p)), p);
});
test('corrected demonstration commits both scenes without warnings', async () => {
  const p = parseProject(
    await readFile(new URL('../examples/the-glass-harbor-fixed.json', import.meta.url), 'utf8'),
  );
  const r = checkProject(p);
  assert.deepEqual(r.stats, { errors: 0, warnings: 0, committedScenes: 2 });
  assert.equal(factValue(r, 'mira', 'location'), 'archive');
  assert.equal(factValue(r, 'mira', 'injury:left-wrist'), 'bandaged');
});
test('knowledge requires a character and a nonempty key; removal also validates targets', () => {
  for (const row of [
    event('set', 'knows:secret', true, { entity: 'port' }),
    event('set', 'knows:', true),
    event('unset', 'relationship:missing'),
    event('unset', 'holder', undefined, { entity: 'a' }),
    event('set', 'injury:', 'healed'),
  ]) {
    const p = fixture();
    p.scenes = [scene([row])];
    assert.equal(validateProject(p).valid, false);
  }
});
