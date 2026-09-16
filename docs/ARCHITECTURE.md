# Architecture

CanonLoom separates a deterministic data engine from its browser and command-line interfaces. The distribution is deliberately small enough to maintain without a backend or a framework upgrade cycle.

| Path              | Responsibility                                                            |
| ----------------- | ------------------------------------------------------------------------- |
| `src/schema.mjs`  | Schema source and runtime structural validation                           |
| `src/index.mjs`   | Semantic validation, chronological replay, diagnostics, context export    |
| `src/storage.mjs` | Browser persistence contract, backup, stale-save protection               |
| `web/`            | Responsive UI, accessible native forms/dialogs, English/Indonesian labels |
| `bin/`            | Filesystem-facing CLI and exit codes                                      |
| `scripts/`        | Deterministic standalone build, local server, checks, packaging           |
| `schemas/`        | Generated standard JSON Schema for integrations                           |
| `examples/`       | Original broken and corrected story fixtures                              |
| `tests/`          | Node, DOM, independent schema, and browser test suites                    |
| `.github/`        | Workflows and contribution templates                                      |

## Why this design

Plain ESM JavaScript allows the same engine to run in Node and a browser. The core has no I/O and no model provider. The web app uses DOM forms and browser storage, with import/export as the interoperability boundary. Facts use Maps keyed by serialized `(entity, field)` pairs to avoid accidental collisions and prototype-key mutation.

Replay is event-based but intentionally not a general distributed event store. Opening facts are editable, scene changes are ordered, and a fresh replay computes truth. A temporary map per scene provides atomic commit behavior. Drafts share no speculative state. Replaying after an earlier edit naturally exposes downstream contradictions.

The build script combines only a fixed list of this repository's modules. It removes their known import/export syntax, inserts the original demonstration data, and hashes the resulting inline script for CSP. It is not a general bundler. A syntax test and hash test detect a broken bundle. Generated artifacts include no remote assets, fonts, analytics, or network endpoints.

## Storage and failure behavior

The active workspace is one JSON document in `localStorage`, with the previous save under a separate key. Parsing happens before import mutation. Compare-before-save detects ordinary cross-tab edits; it is not a transactional database and cannot guarantee multi-writer coordination. Working changes remain in memory if storage fails, and the UI prompts for export. Browser storage is finite and can be cleared independently of the app.

## Extension points

Add checker rules in the pure core with source-backed diagnostics and tests. A future AI extractor should propose structured events for writer approval; it must not silently promote guessed facts into canon. Provider integrations, if added, should be optional adapters with explicit consent to transmit text. Branching needs an explicit timeline model and schema version, not an array-order workaround.

Development-only dependencies are jsdom, Ajv, Playwright, and Prettier. Browser and CLI users do not install them. Their licenses remain with those packages; they are not bundled into the standalone app.
