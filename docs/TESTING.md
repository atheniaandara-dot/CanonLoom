# Testing and verification

## Automated suites

| Suite   | Scope                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine  | Exact comparisons, provenance, temporal ordering, locks, world constraints, knowledge, scene rollback, draft isolation, scoped replay, malicious/malformed data |
| CLI     | Exit codes, JSON reports, scoped context, bad options, missing files, overwrite prevention                                                                      |
| Storage | Round trips, previous-save recovery, corrupt bytes, quota/permission failure, stale tabs                                                                        |
| Schema  | Independent Ajv validation of draft 2020-12 and agreement on structural edge cases                                                                              |
| Bundle  | JavaScript syntax, script CSP hash, absence of remote assets                                                                                                    |
| DOM UI  | End-to-end form flow in jsdom, screen navigation, import rejection, persistence, fixes, text escaping, Indonesian labels                                        |
| Browser | Playwright Chromium on desktop and a mobile viewport, example repair, downloads, reload, console errors, and horizontal overflow                                |

Run Node/DOM suites with `npm ci --ignore-scripts && npm test`. `npm run check` checks JavaScript syntax, example validity, and generated-schema parity. `npm run test:coverage` reports runtime coverage; it is a diagnostic, not proof of correctness. Node's built-in runner supplies execution and coverage ([official documentation](https://nodejs.org/api/test.html)).

The DOM suite executes only the app built from this repository. It does not fetch external pages. jsdom does not render layout or enforce browser CSP; passing it does not prove visual or real-browser correctness ([jsdom documentation](https://github.com/jsdom/jsdom)).

For browser tests, run `npx playwright install chromium`, then `npm run test:browser`. The test configuration starts the development server and isolates each test's storage. CI installs Chromium with system dependencies. The setup uses Playwright's documented [web-server support](https://playwright.dev/docs/test-webserver).

## Manual release checks

- Open the standalone HTML on a desktop browser with the network disconnected; verify all screens.
- Inspect a hosted app at narrow phone width; navigation, tables, dialogs, and buttons should remain usable.
- Use the keyboard to open a dialog, move through its fields, save, and cancel with Escape.
- Create a story, export a backup, replace the workspace, import the backup, and verify the facts.
- Confirm a blocked canon scene's changes are absent from a later context export.
- Test storage denial/private browsing and ensure the app clearly recommends a backup.
- Verify a real downloaded release asset and its checksum, rather than only testing the source server.

Record which checks ran, on what runtime/browser, and any blocked checks. Do not describe configured CI jobs as completed runs.

## Initial preparation environment

The local Node and DOM suites were run during initial development. The available cloud browser rejected local URLs and local HTML files under its URL security policy. No alternate browser surface was used to bypass that restriction. Real-browser and visual checks therefore remained pending at the initial repository handoff. They are configured as release gates in GitHub Actions; their result must be verified after repository access is connected.

See the delivered verification report for the exact final local test count and package hashes. This document intentionally does not claim cross-browser certification or production-scale benchmarking.
