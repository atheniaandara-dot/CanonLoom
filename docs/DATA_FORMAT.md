# Data format v1

A project is UTF-8 JSON with `schemaVersion: 1`. The formal [JSON Schema](../schemas/project.schema.json) uses draft 2020-12. The runtime additionally checks cross-references, unique IDs and scene orders, duplicate fact keys, and special field types.

```json
{
  "schemaVersion": 1,
  "title": "A small story",
  "description": "Optional reference text",
  "entities": [{ "id": "mira", "name": "Mira", "type": "character" }],
  "facts": [
    { "id": "f1", "entity": "mira", "field": "emotion", "value": "wary", "source": "Opening" }
  ],
  "rules": [],
  "scenes": [
    {
      "id": "s1",
      "title": "A promise",
      "order": 1,
      "time": 0,
      "status": "canon",
      "events": [
        {
          "id": "e1",
          "kind": "set",
          "entity": "mira",
          "field": "emotion",
          "value": "hopeful",
          "reason": "Her friend returns."
        }
      ]
    }
  ]
}
```

## Records

| Record             | Required                                                         | Optional                         |
| ------------------ | ---------------------------------------------------------------- | -------------------------------- |
| Project            | `schemaVersion`, `title`, `entities`, `facts`, `rules`, `scenes` | `description`                    |
| Entity             | `id`, `name`, `type`                                             | `notes`                          |
| Opening fact       | `id`, `entity`, `field`, `value`                                 | `source`, `locked`               |
| Rule               | `id`, `entity`, `field`, `operator`, `value`, `description`      | none                             |
| Scene              | `id`, `title`, `order`, `status`, `events`                       | `time`, `summary`                |
| Assert / set event | `id`, `kind`, `entity`, `field`, `value`                         | `reason`                         |
| Unset event        | `id`, `kind`, `entity`, `field`                                  | `reason`; `value` must be absent |

Entity types: `character`, `location`, `item`, `world`. Scene statuses: `draft`, `canon`. Rule operators: `equals`, `notEquals`. Values are a string, finite number, boolean, or null. Arrays and objects are not fact values. Split compound records into named fields.

IDs contain ASCII letters, numbers, `_`, and `-`, start with a letter or number, and have at most 80 characters. IDs are unique within each top-level collection; event IDs are unique within their scene. Field names start with a lowercase ASCII letter and contain letters, digits, `_`, `.`, `:`, or `-`, up to 120 characters.

## Reserved field conventions

| Field                       | Expected value                                                  |
| --------------------------- | --------------------------------------------------------------- |
| `location`                  | Existing location entity ID or null                             |
| `holder`                    | Existing character/location ID or null; subject must be an item |
| `alive`                     | Boolean                                                         |
| `knows:topic-key`           | Boolean; use false for explicitly absent knowledge              |
| `relationship:character-id` | Primitive value; subject and target must be characters          |
| `address:character-id`      | Primitive value; subject and target must be characters          |
| `injury:body-part`          | Primitive value describing recorded condition                   |
| `clothing`, `emotion`       | Usually text; exact primitive comparisons                       |

All other valid fields are custom scalar facts. `unset` changes a record to unknown; null is a known explicit absence. Unknown fields are not inferred from notes or scene summaries.

## Limits and evolution

Imports are capped at 5 MiB. The schema permits up to 1,000 entities, 20,000 opening facts, 1,000 rules, 2,000 scenes, and 500 events per scene. These are validation guardrails, **not performance guarantees**. The preview UI is designed for modest projects; benchmark your own larger workload and retain backups.

Unknown object properties are rejected to catch spelling mistakes and prevent silent data loss. Future extensions require an explicit schema change; migrations must never overwrite the only source file. Export/import retains all recognized project data. Diagnostic reports are separate outputs, not input project files.
