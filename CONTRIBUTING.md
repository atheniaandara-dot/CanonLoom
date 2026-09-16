# Contributing to CanonLoom

Useful bug reports, documentation improvements, accessibility feedback, and focused code changes are welcome. You do not need to be a programmer to help.

## For writers

Open an issue describing what you recorded, what you expected, and what happened. Attach a **small fictional reproduction**, not a private manuscript. The issue form asks for the app version and browser. Explain your writing workflow when suggesting a feature.

## For developers

1. Fork the repository and create a branch for one coherent change.
2. Use Node.js 22 or later. Run `npm ci --ignore-scripts`.
3. Run `npm start` and reproduce the behavior before editing.
4. Add a meaningful test for a bug fix or new checker behavior.
5. Run `npm run format`, `npm test`, `npm run check`, and, for UI changes, `npm run test:browser` after installing Chromium with `npx playwright install chromium`.
6. Describe the behavior change and test evidence in a pull request. Call out data-format changes and privacy effects.

Keep the core independent of the DOM, network, filesystem, and model providers. Build the standalone app after source changes; `dist/` is generated and is not committed. `schemas/project.schema.json` is generated from `src/schema.mjs` and **is** committed. Never edit generated schema independently.

Prefer small, named functions and explicit data transformations. New dependencies need a reason; the app and core should retain zero runtime dependencies. Do not add telemetry or remote services silently. Use English for documentation and code identifiers. Add Indonesian UI translations where applicable; technical diagnostics currently remain English.

## Compatibility and review

The JSON format is versioned separately from the package version. A breaking data-format change requires a new schema version, migration design, fixtures, and round-trip tests. Changes to unknown-fact handling, draft isolation, or scene atomicity need explicit reviewer attention. Avoid changing story data to hide a failing test.

AI-assisted contributions are allowed. Contributors are responsible for reviewing and understanding their changes, checking licensing, and reporting the tests they actually ran. Do not invent test results, usage numbers, or performance claims.

Contributions are provided under the repository's MIT license. No contributor license agreement is required. Be respectful; critique the work, protect private writing, and avoid harassment. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
