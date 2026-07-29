# Adopting the Cursor backend kit

How to replicate this kit into a layered Node.js/TypeScript backend service.

**Canonical install:** public npm package [`@sauvvitech/st-cursor-backend`](https://www.npmjs.com/package/@sauvvitech/st-cursor-backend).

Kit SemVer: see [`VERSION`](../VERSION) / `package.json` and [`CHANGELOG.md`](../CHANGELOG.md). After sync, the applied version is stamped at `.cursor/KIT_VERSION` in the target.

## Quick start (recommended)

```bash
# First-time — from the service repository root
npx @sauvvitech/st-cursor-backend --with-pr-template

# Pin for updates (devDependency)
yarn add -D @sauvvitech/st-cursor-backend
yarn st-cursor-backend                 # sync cwd
yarn st-cursor-backend --dry-run
yarn st-cursor-backend --backup --no-delete
```

Default target is the **current working directory**. Pass an explicit path if needed: `npx @sauvvitech/st-cursor-backend /path/to/service`.

There is **no** `postinstall` hook — sync only runs when you invoke the CLI (avoids overwriting `.cursor` on every `yarn install`).

## What gets synced

| From the kit package | Into the target service |
|----------------------|-------------------------|
| `.cursor/` (entire tree, except service `local/`) | `.cursor/` |
| Kit SemVer stamp | `.cursor/KIT_VERSION` |
| `AGENTS.md` | `AGENTS.md` (service root) |
| `docs/architecture-and-layers.md` | `docs/architecture-and-layers.md` |
| `docs/specs/_templates/` | `docs/specs/_templates/` |
| `docs/specs/README.md` | Copied **only if missing** (or with `--force-specs-readme`) |
| `examples/canonical-user/` | `examples/canonical-user/` (illustrative reference; not runnable) |
| `docs/templates/PULL_REQUEST_TEMPLATE.md` | `.github/PULL_REQUEST_TEMPLATE.md` **only with** `--with-pr-template` and only if missing |

## What stays local to the service

- All of `src/`
- Feature specs: `docs/specs/<feature-slug>/` (requirements, design, tasks, …)
- `.github/` workflows and existing PR templates (unless seeded as above)
- Service-specific env, CI, and package scripts
- Cursor overrides under `.cursor/local/` (never deleted by sync)

## CLI flags

| Flag | Effect |
|------|--------|
| `--dry-run` | No writes; print planned actions |
| `--no-delete` | Do not remove target files absent from the kit |
| `--backup` | Backup overwritten paths under `.cursor-kit-backup-<timestamp>/` |
| `--force-specs-readme` | Always overwrite `docs/specs/README.md` |
| `--with-pr-template` | Seed `.github/PULL_REQUEST_TEMPLATE.md` from `docs/templates/` if missing |
| `-h` / `--help` | Usage |

The CLI:

1. Requires the target to exist and look like a service repo (`.git/` **or** `package.json`).
2. Syncs `.cursor/` (deletes removed kit files by default; always excludes `local/`).
3. Writes `.cursor/KIT_VERSION` from the package `VERSION`.
4. Overwrites `AGENTS.md` and `docs/architecture-and-layers.md`.
5. Updates `docs/specs/_templates/`; does **not** touch `docs/specs/<feature-slug>/`.
6. Syncs `examples/canonical-user/` (pedagogical snippets referenced by skills).
7. Copies `docs/specs/README.md` only when missing (unless `--force-specs-readme`).

## Maintainer alternative (this git repo)

If you have cloned **st-cursor-backend** locally:

```bash
./scripts/sync-cursor.sh /path/to/st-some-service --dry-run
./scripts/sync-cursor.sh /path/to/st-some-service --backup --with-pr-template
```

The bash script requires `rsync`. Prefer the npm CLI for day-to-day adoption; keep the script for kit maintainers. Behavior should stay aligned with `lib/sync-kit.js`.

## First-time checklist

1. Run `npx @sauvvitech/st-cursor-backend --with-pr-template` (or install `-D` and run `yarn st-cursor-backend`).
2. Confirm `.cursor/KIT_VERSION` matches the kit version you intended.
3. Confirm the service has `.github/PULL_REQUEST_TEMPLATE.md` if you use `agt-github-workflow`.
4. Confirm Jest scripts match [AGENTS.md](../AGENTS.md) (`yarn test`, `yarn lint`, `yarn test:coverage`).
5. Keep org Jira defaults in `.cursor/JIRA.md`, or edit that file **in the service** only if the project key/ids differ — prefer changing defaults in this kit repo when the whole org changes.
6. Open Cursor on the **service** repo (not this template) to develop features.

## Updating services after kit changes

1. Publish a new `@sauvvitech/st-cursor-backend` version (bump `VERSION` + `package.json` + `CHANGELOG.md`, tag `v*`).
2. In the service: `yarn up @sauvvitech/st-cursor-backend` (or bump the pin) then `yarn st-cursor-backend` (use `--backup` if unsure).
3. Review the service diff: expect `.cursor/` (incl. `KIT_VERSION`), `AGENTS.md`, and shared docs — not feature specs.
4. Open a PR on the service if the sync must be reviewed there.

## Local overrides

Put service-only Cursor files under `.cursor/local/`. Sync never deletes that directory. Prefer kit-wide changes in **this** repository instead of forking rules under `.cursor/rules/` in the service.

## Canonical examples (`user`)

Rules and skills use `user` as the pedagogical context (`UserService`, `IUser`, …). Illustrative snippets live in [`examples/canonical-user/`](../examples/canonical-user/). That does **not** mean every service owns a user module. Map examples to the local `<context>`.

## Language

All kit content is **English**. Do not translate rules/agents/skills into another language in service copies; keep the synced English source of truth.

## Kit version vs service release

| Concern | Where |
|---------|--------|
| Cursor kit SemVer (npm) | This package: `VERSION` / `package.json` / `CHANGELOG.md` → stamped as `.cursor/KIT_VERSION` |
| Service npm package release | Target service: semantic-release via [rule.release.mdc](../.cursor/rules/rule.release.mdc) |
