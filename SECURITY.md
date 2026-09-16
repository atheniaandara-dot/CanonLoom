# Security and privacy

CanonLoom processes story files locally. It has no authentication, backend, telemetry, or AI API keys. A built app's Content Security Policy disables network connections and permits only its hashed script. Imported text is HTML-escaped; the core never evaluates story content as code. Import size is limited to 5 MiB.

Local browser storage and exports are **not encrypted**. Anyone with access to your device, browser profile, or backup can potentially read the story. Character-scoped context is a convenience filter, not an access-control system. Review exports before sharing them.

Only the latest published release is intended to receive security fixes; there is no promised response-time SLA. Use GitHub's private vulnerability reporting feature if enabled on the repository. If it is unavailable, open an issue requesting a private contact without disclosing exploit details or private files. Maintainers should enable private vulnerability reporting when the repository is created.

Relevant reports include script injection through imported files, unexpected data transmission, unsafe deserialization, and data loss. Include the version and a small non-sensitive reproduction. Do not attach real credentials or unpublished manuscripts.

See [the maintainer guide](docs/MAINTAINER_GUIDE.md) for release permissions and dependency maintenance.
