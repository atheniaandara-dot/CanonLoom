# CanonLoom

**Keep the thread.** A local-first continuity engine for novelists and AI roleplay writers.

Track who a character is, where they are, what they wear, what they know, and what changed in each scene. CanonLoom compares explicit scene claims with established canon and shows the earlier fact behind every contradiction.

**Status:** 0.1.0, an early working preview. No account, AI subscription, server database, or runtime dependencies. English and Indonesian interfaces. MIT licensed.

## Try it without coding

Download `CanonLoom-0.1.0.html` from [GitHub Releases](https://github.com/atheniaandara-dot/CanonLoom/releases), when published, and open it in a modern desktop browser. It is a self-contained application; it does not need an installation or an internet connection. Some mobile file viewers do not execute HTML apps: use a hosted copy in your normal browser instead. See [the user guide](docs/USER_GUIDE.md).

The included **The Glass Harbor** example deliberately has three errors. Choose **Check report** to inspect them. Choose **New story** to start your own project. Use **Export backup** to download a portable JSON copy of your work.

The application stores one workspace in your current browser. Storage is not an external backup and does not sync between devices. Export before clearing browser data, moving devices, or replacing a workspace.

## What it does

| Story information                  | How to record it                                                   |
| ---------------------------------- | ------------------------------------------------------------------ |
| Characters and places              | Named entities with optional descriptive notes                     |
| Location and item custody          | References to a location, character, or item holder                |
| Clothing, wounds, emotions         | Facts with explicit changes and explanations                       |
| Relationships and forms of address | Directional facts such as `relationship:soren` and `address:soren` |
| Character knowledge                | Boolean facts such as `knows:sealed-route`                         |
| Permanent canon                    | Locked opening facts                                               |
| World constraints                  | Equality or forbidden-value rules                                  |
| Timeline                           | Chronological scene order and optional elapsed story minutes       |
| AI handoff                         | Markdown context for a director or one character                   |

It also includes a JSON Schema, a reusable JavaScript library, a CLI, example projects, automated tests, and GitHub workflows for tests, releases, and optional Pages hosting.

## The important distinction

**A claim checks a fact. A change updates a fact.**

Mira's opening location is `quay`. A scene claiming she is already in `archive` produces a contradiction. Record her journey as a change to `archive`, then a later claim at the archive passes. CanonLoom does not invent the journey for you.

Scenes run in chronological order; events run from top to bottom. A draft is checked against the canon available at that point but never commits its changes. An error in a canon scene rolls back that scene's entire set of changes. Later scenes still use the last successful canon. Warnings are review requests and do not block commits.

## Honest limits

- **No prose understanding or automatic fact extraction.** Scene text and entity notes are reference material. You record the facts to check using forms or JSON.
- Exact, case-sensitive values; no fuzzy matching, synonyms, or inferred emotion.
- Travel time, healing, relationships, and secrets change only when you record them. A reason explains a change; the engine cannot prove it happened.
- No branching timelines, simultaneous occupancy solver, collaboration, authentication, cloud sync, or encryption at rest.
- Character context filters records; it is not a security boundary or a guarantee against every narrative spoiler. Review it before sharing.
- A passing report means the **recorded facts** agree. It does not certify an entire manuscript.

## Run from source

Requires Node.js 22 or newer. Download the source using **Code → Download ZIP** on [the repository](https://github.com/atheniaandara-dot/CanonLoom), or clone it:

```sh
git clone https://github.com/atheniaandara-dot/CanonLoom.git
cd CanonLoom
```

From the project folder:

```sh
npm start
```

Open the local address printed in the terminal. No dependency installation is needed to build or run the app or CLI.

```sh
npm run build            # dist/CanonLoom.html and dist/index.html
node bin/canonloom.mjs check examples/the-glass-harbor.json
node bin/canonloom.mjs check examples/the-glass-harbor-fixed.json
node bin/canonloom.mjs context examples/the-glass-harbor-fixed.json --character mira
```

The intentionally broken example exits with code `1`; the corrected example exits with `0`. The project has not been assumed to exist on npm: use this checkout or the release tarball.

## Use the engine

```js
import { readFile } from 'node:fs/promises';
import { parseProject, checkProject, exportContext } from './src/index.mjs';

const project = parseProject(await readFile('my-story.json', 'utf8'));
const report = checkProject(project);

for (const issue of report.issues) {
  console.log(issue.code, issue.message, issue.source);
}

const context = exportContext(project, { throughScene: 'crossing' });
```

See [API and CLI](docs/API.md), [data format](docs/DATA_FORMAT.md), and [checker semantics](docs/CHECKER.md).

## Test and contribute

```sh
npm ci --ignore-scripts
npm test
npm run check
npm run test:coverage
```

The application has no production dependencies. Development dependencies provide DOM tests, independent schema validation, browser tests, and source formatting. For the real-browser suite:

```sh
npx playwright install chromium
npm run test:browser
```

See [CONTRIBUTING.md](CONTRIBUTING.md), [architecture](docs/ARCHITECTURE.md), [test coverage and limitations](docs/TESTING.md), [maintainer guide](docs/MAINTAINER_GUIDE.md), and [CHANGELOG.md](CHANGELOG.md).

## Privacy and ownership

The app makes no external requests, loads no analytics or remote fonts, and never sends your manuscript to an AI service. JSON backups and copied context leave the app only when you explicitly export or share them. A hosting provider can receive ordinary page-request metadata when serving a hosted copy. Your writing remains yours; the software's MIT license does not change ownership of your stories.

The demo is original fiction created for this project. This project's initial implementation was developed with AI assistance. There are no claims of existing adoption, stars, contributors, or production use.
