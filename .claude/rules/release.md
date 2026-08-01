---
paths:
  - "release.config.js"
---
# Release (service package)

Applies to **backend services** that adopt this kit and ship an npm package via semantic-release (`release.config.js` present).

- Versioning and changelog for the **service** are automated by **semantic-release** (`yarn release` → `semantic-release`).
- Config lives in the service’s `release.config.js`; plugins are declared in the service’s `package.json` (`@semantic-release/commit-analyzer`, `release-notes-generator`, `changelog`, `git`, `exec`).
- Version bumps are derived from **Conventional Commits** (`feat:`, `fix:`, `BREAKING CHANGE:`); do not bump the service version by hand.
- **Do not** use Changesets in service repos — there is no `.changeset/` and no `changeset` script.
- Do not edit the service `CHANGELOG.md` or the `version` field in `package.json` manually; let the release pipeline manage them.

## Kit version (separate)

The kit package `@sauvvitech/st-cursor-backend` uses SemVer in [`VERSION`](../../VERSION) + [`package.json`](../../package.json) + [`CHANGELOG.md`](../../CHANGELOG.md), published on tag `v*` (see `.github/workflows/publish.yml`), and stamped into services as `<kit-dir>/KIT_VERSION` (`.claude/KIT_VERSION`, `.cursor/KIT_VERSION`) by the CLI / sync script. That is **not** the same as a service package version.
