# Changelog

Notable user-facing changes are recorded here. Package versions follow semantic versioning. During `0.x`, interfaces may evolve; schema changes remain explicitly versioned.

## [Unreleased]

### Added

- Story bible search across recorded values, attributes, provenance, and referenced entity names, respecting opening/current canon and entity type.
- Scene search across titles, summaries, and events, preserving complete scenes, chronological order, and continuity diagnostics.
- English and Indonesian search labels, result counts, no-match feedback, and clear controls, with keyboard focus and input-method composition support.

### Fixed

- Story bible fact rows now follow the search and type filters instead of showing unrelated facts.
- A filtered list no longer tells writers that their existing entities are missing.

## [0.1.0] - 2026-09-16

### Added

- Deterministic continuity engine with chronological replay and provenance.
- Atomic canon scenes, isolated drafts, locked facts, typed references, knowledge checks, and world constraints.
- Tracking for clothing, injuries, locations, item custody, emotions, directional relationships, and forms of address.
- Offline browser UI with English and Indonesian labels, forms, search, scene event reordering, context export, import/export, and previous-save recovery.
- JavaScript API, command-line interface, versioned JSON Schema, and deliberately broken / corrected demonstration projects.
- Automated engine, CLI, storage, schema, bundle, and DOM interaction tests; Chromium desktop/mobile suite configured for GitHub CI.
- English user, developer, maintainer, and release documentation; MIT license and community templates.
- GitHub workflows for validation, gated releases, and optional manual Pages deployment.

### Known limitations

- Structured facts only; no automatic prose analysis or AI service integration.
- One local workspace at a time; no cloud sync, encrypted storage, or branching timelines.
- Diagnostic messages and exported context are English even when UI labels are Indonesian.
- Real-browser checks require an environment that permits launching a browser; see the verification record for the initial preparation environment.
