import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import { projectSchema, validateProject, createProject } from '../src/index.mjs';
const ajv = new Ajv2020({ strict: false, allowUnionTypes: true });
const validate = ajv.compile(projectSchema);
test('published schema is valid JSON Schema 2020-12', () =>
  assert.equal(ajv.validateSchema(projectSchema), true));
test('external JSON Schema validation and runtime agree on structural edge cases', () => {
  const p = createProject();
  p.entities = [{ id: 'a', name: 'Ari', type: 'character' }];
  const candidates = [
    null,
    {},
    p,
    { ...p, title: 5 },
    { ...p, schemaVersion: 2 },
    {
      ...p,
      scenes: [
        {
          id: 's',
          title: 'S',
          order: 0,
          status: 'draft',
          events: [{ id: 'e', kind: 'set', entity: 'a', field: 'x' }],
        },
      ],
    },
    {
      ...p,
      scenes: [
        {
          id: 's',
          title: 'S',
          order: 0,
          status: 'draft',
          events: [{ id: 'e', kind: 'unset', entity: 'a', field: 'x', value: null }],
        },
      ],
    },
  ];
  for (const candidate of candidates)
    assert.equal(validate(candidate), validateProject(candidate).valid);
});
