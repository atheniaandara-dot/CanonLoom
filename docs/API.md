# JavaScript API and CLI

The public module is `src/index.mjs`. A release tarball can be installed locally with `npm install ./canonloom-0.1.0.tgz`; then import from `canonloom`. This does not require publication to the npm registry.

## Exports

| Function / value                   | Contract                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `createProject(title?)`            | Returns an empty v1 project. Default title: Untitled story.                                     |
| `validateProject(project)`         | Returns `{ valid, errors }`; each error has `path` and `message`.                               |
| `parseProject(jsonText)`           | Parses and validates JSON, with a 5 MiB byte limit. Throws `ProjectValidationError`.            |
| `checkProject(project, options?)`  | Returns `{ valid, issues, scenes, facts, stats }`. Throws on invalid input or an unknown scope. |
| `exportContext(project, options?)` | Returns Markdown, never a network call.                                                         |
| `projectSchema`                    | JSON Schema object for file tooling.                                                            |
| `ProjectValidationError`           | Error subclass with an `errors` array.                                                          |
| `VERSION`, `MAX_FILE_BYTES`        | Package version string and import limit.                                                        |

Check options: `{ throughScene?: string }`. Context options: `{ throughScene?: string, character?: string }`. Omitting character selects director scope. A non-character or unknown ID throws `RangeError`.

`stats` contains `errors`, `warnings`, and `committedScenes`. Scene results contain `id`, `title`, `status`, `committed`, `blocked`, `issues`, and `changes`. A final fact has `entity`, `field`, `value`, `source`, and either `factId` for the opening or `sceneId` / `eventId` for a change. See [checker semantics](CHECKER.md) before treating an attempted change as committed.

The module is ESM and uses standard JavaScript APIs available in Node 22+ and modern browsers. It has no runtime dependencies. Filesystem and DOM code live outside the core. Development-only storage utilities are not part of the package's documented public API.

## CLI

```sh
node bin/canonloom.mjs --help
node bin/canonloom.mjs --version
node bin/canonloom.mjs init my-story.json
node bin/canonloom.mjs validate my-story.json
node bin/canonloom.mjs check my-story.json
node bin/canonloom.mjs check my-story.json --json --strict
node bin/canonloom.mjs check my-story.json --through crossing
node bin/canonloom.mjs context my-story.json --character mira --through crossing
```

With the release tarball installed, use `canonloom` instead of `node bin/canonloom.mjs`. `init` copies the demonstration project and refuses to overwrite an existing path. It contains deliberate errors. `validate` checks file validity, not story consistency. `context` writes Markdown to stdout and includes a review notice if the selected scope has issues. It returns success for valid input even when the story needs review; run `check` as a separate gate.

| Exit code | Meaning                                                               |
| --------- | --------------------------------------------------------------------- |
| 0         | Valid input and successful command; check has no errors               |
| 1         | Check found errors, or warnings with `--strict`                       |
| 2         | Invalid input, missing file, bad options, or an unknown command/scope |

Only `check` accepts `--json` and `--strict`. `--through` is accepted by check and context. CLI input files are never modified. All commands work without network access.
