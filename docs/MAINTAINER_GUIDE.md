# Maintainer guide

This guide explains routine ownership tasks. GitHub holds the public source and release history. The offline app holds each writer's story on their own device; maintainers do not receive that data.

## Initial repository setup

The public repository is [atheniaandara-dot/CanonLoom](https://github.com/atheniaandara-dot/CanonLoom). Suggested description: **Local-first continuity engine for novelists and AI roleplay writers.** Suggested topics: `continuity`, `creative-writing`, `roleplay`, `story-bible`, `offline-first`, `javascript`.

Push the full source including hidden `.github` files and the lockfile. Do not push `node_modules`, private manuscripts, local credentials, or build directories. Keep the default branch `main`. Enable Issues and private vulnerability reporting if the account permits them. Protect `main` with required CI checks once they have run successfully. Repository/account policies may require the account owner to confirm these settings.

The repository address in package metadata and README links has been verified. Repository creation does not mean the source has been uploaded, the workflows have passed, or a release has been published; verify each separately. Do not insert fake badges or adoption claims.

## A small maintenance rhythm

- Review issues for a reproducible example, affected version, and expected behavior.
- Prioritize data loss, false canon commits, import failures, and accessibility blockers.
- Review dependency update pull requests; wait for tests before merging.
- Keep the changelog tied to implemented behavior. Never promise a release date you cannot maintain.
- Export your own stories before trying a new development build.

## Understand the checks

The **CI** workflow tests Node 22 and 24 on Linux and Windows, validates the generated schema and examples, and runs Chromium desktop/mobile tests on Linux. Test code does not require repository write permissions. A red check should be investigated rather than disabled.

**First release** bootstraps only `v0.1.0` in the original CanonLoom repository after CI succeeds for a push to `main`. It checks the exact tested commit is still current, creates its initial tag, uploads the three release assets to a draft, verifies their SHA-256 digests, and publishes the preview. It preserves existing published releases and refuses conflicting tags or draft assets. It does not publish pull-request code or future versions. Forks do not run this automatic publisher. Subsequent versions use the tag-driven **Release** workflow below.

**Pages** is optional and manual. Enable GitHub Pages with source **GitHub Actions**, then run the Pages workflow. It uploads only `dist`, which contains the app and its fictional example, never a user's saved story. A public Pages app makes it easier to use CanonLoom on a phone; each browser still keeps its own story locally. A hosted address changing can change the browser storage origin; export before switching URLs.

The workflow configuration follows [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). CI and Pages checks have separate jobs and explicit permissions. Do not grant broad tokens to pull-request jobs.

## Prepare a release

1. Update version in `package.json`, `package-lock.json`, `src/index.mjs`, version assertions, and release notes. Schema version changes only for data-format incompatibility.
2. Add a dated changelog entry and `docs/releases/vX.Y.Z.md`.
3. Run tests, source checks, browser checks, and the manual checks in [TESTING.md](TESTING.md).
4. Commit and push the exact reviewed source.
5. Create and push an annotated `vX.Y.Z` tag matching the package version.

The **Release** workflow independently rebuilds and rechecks that tag, runs the browser suite, packages an offline HTML app plus an installable tarball and SHA-256 checksums, then creates a GitHub release. A tag/version mismatch fails before publication. Version 0.x releases are marked prerelease to communicate preview status.

The repository owner must verify the first workflow run and release assets. A local tag or package is not evidence that a public GitHub release exists. If a workflow fails, repair the problem and publish a new version; do not silently move a release tag that other people may have downloaded.

For local packages, `npm run release:pack` creates files under `release/`. The tarball includes the core, CLI, schema, examples, and built app. The source archive attached by GitHub includes tests, documentation, workflows, and the lockfile.

## Roadmap choices

See [ROADMAP.md](ROADMAP.md). Discuss schema-level work before implementing it. Keep fact provenance, explicit changes, recoverable data, and honest limitations ahead of feature count. A future paid service should not be required to use the existing offline engine.
