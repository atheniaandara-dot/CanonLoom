// JSON Schema is shared by the runtime validator and the published data format.
const id = { type: 'string', pattern: '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$' };
const field = { type: 'string', pattern: '^[a-z][a-zA-Z0-9_.:-]{0,119}$' };
const text = { type: 'string', maxLength: 20000 };
const shortText = { type: 'string', minLength: 1, maxLength: 200 };
const value = { type: ['string', 'number', 'boolean', 'null'], maxLength: 4000 };
const object = (required, properties) => ({
  type: 'object',
  additionalProperties: false,
  required,
  properties,
});

export const projectSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'CanonLoom project v1',
  description: 'Portable, explicit canon and chronological scene events. UTF-8 JSON.',
  ...object(['schemaVersion', 'title', 'entities', 'facts', 'rules', 'scenes'], {
    schemaVersion: { const: 1 },
    title: shortText,
    description: text,
    entities: {
      type: 'array',
      maxItems: 1000,
      items: object(['id', 'name', 'type'], {
        id,
        name: shortText,
        type: { enum: ['character', 'location', 'item', 'world'] },
        notes: text,
      }),
    },
    facts: {
      type: 'array',
      maxItems: 20000,
      items: object(['id', 'entity', 'field', 'value'], {
        id,
        entity: id,
        field,
        value,
        source: text,
        locked: { type: 'boolean' },
      }),
    },
    rules: {
      type: 'array',
      maxItems: 1000,
      items: object(['id', 'entity', 'field', 'operator', 'value', 'description'], {
        id,
        entity: id,
        field,
        operator: { enum: ['equals', 'notEquals'] },
        value,
        description: shortText,
      }),
    },
    scenes: {
      type: 'array',
      maxItems: 2000,
      items: object(['id', 'title', 'order', 'status', 'events'], {
        id,
        title: shortText,
        order: { type: 'integer', minimum: 0, maximum: 1000000000 },
        time: { type: 'integer', minimum: 0, maximum: 1000000000 },
        status: { enum: ['draft', 'canon'] },
        summary: text,
        events: {
          type: 'array',
          maxItems: 500,
          items: {
            anyOf: ['assert', 'set', 'unset'].map((kind) =>
              object(['id', 'kind', 'entity', 'field', ...(kind === 'unset' ? [] : ['value'])], {
                id,
                kind: { const: kind },
                entity: id,
                field,
                ...(kind === 'unset' ? {} : { value }),
                reason: text,
              }),
            ),
          },
        },
      }),
    },
  }),
};

/** Validate the deliberately small JSON Schema vocabulary used above. */
export function validateShape(data, schema = projectSchema, path = '$', errors = []) {
  const add = (message) => errors.push({ path, message });
  if (schema.anyOf) {
    if (!schema.anyOf.some((option) => validateShape(data, option, path, []).length === 0))
      add('must match an allowed event: assert/set with a value, or unset without a value');
    return errors;
  }
  if ('const' in schema && data !== schema.const) add(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(data)) add(`must be one of ${schema.enum.join(', ')}`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matches = types.some((type) => {
      if (type === 'null') return data === null;
      if (type === 'array') return Array.isArray(data);
      if (type === 'object')
        return data !== null && typeof data === 'object' && !Array.isArray(data);
      if (type === 'integer') return Number.isSafeInteger(data);
      if (type === 'number') return typeof data === 'number' && Number.isFinite(data);
      return typeof data === type;
    });
    if (!matches) {
      add(`must be ${types.join(' or ')}`);
      return errors;
    }
  }
  if (typeof data === 'string') {
    const length = [...data].length;
    if (schema.minLength !== undefined && length < schema.minLength) add('is too short');
    if (schema.maxLength !== undefined && length > schema.maxLength) add('is too long');
    if (schema.pattern && !new RegExp(schema.pattern).test(data))
      add(`must match ${schema.pattern}`);
  }
  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum)
      add(`must be at least ${schema.minimum}`);
    if (schema.maximum !== undefined && data > schema.maximum)
      add(`must be at most ${schema.maximum}`);
  }
  if (Array.isArray(data)) {
    if (schema.maxItems !== undefined && data.length > schema.maxItems)
      add(`has more than ${schema.maxItems} entries`);
    if (schema.items)
      data.forEach((entry, i) => validateShape(entry, schema.items, `${path}[${i}]`, errors));
  } else if (schema.properties && data !== null && typeof data === 'object') {
    for (const key of schema.required ?? [])
      if (!Object.hasOwn(data, key)) add(`is missing ${key}`);
    for (const key of Object.keys(data)) {
      if (!Object.hasOwn(schema.properties, key)) {
        if (schema.additionalProperties === false) add(`unknown property ${key}`);
      } else validateShape(data[key], schema.properties[key], `${path}.${key}`, errors);
    }
  }
  return errors;
}
