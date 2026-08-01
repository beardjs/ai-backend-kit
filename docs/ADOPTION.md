# Adopting the backend agent kits

How to replicate the Cursor, Claude Code, and Codex kits into a layered Node.js/TypeScript backend service.

**Canonical install:** public npm package [`@beardjs/ai-backend-kit`](https://www.npmjs.com/package/@beardjs/ai-backend-kit).

Kit SemVer: see [`VERSION`](../VERSION) / `package.json` and [`CHANGELOG.md`](../CHANGELOG.md). After sync, the applied version is stamped at `<kit-dir>/KIT_VERSION` in the target (e.g. `.cursor/KIT_VERSION`).

## Quick start (recommended)

```bash
# First-time — from the service repository root (opens interactive panel)
npx @beardjs/ai-backend-kit

# Non-interactive (CI / scripts)
npx @beardjs/ai-backend-kit -y --with-pr-template
npx @beardjs/ai-backend-kit --kit cursor --with-pr-template

# Pin for updates (devDependency)
yarn add -D @beardjs/ai-backend-kit
yarn ai-backend-kit                 # interactive panel in a TTY
yarn ai-backend-kit -y              # sync cwd with default kit (cursor)
yarn ai-backend-kit --dry-run --kit cursor
yarn ai-backend-kit --backup --no-delete --kit cursor
```

Bare `npx` / `yarn ai-backend-kit` in a terminal opens an interactive panel (↑↓ + Enter): pick one kit, **All available kits**, or a custom multi-select; then PR template and backup. Default target is the **current working directory**. Pass an explicit path if needed: `npx @beardjs/ai-backend-kit /path/to/service`.

There is **no** `postinstall` hook — sync only runs when you invoke the CLI (avoids overwriting kit folders on every `yarn install`).

## Tool kits

Bare `npx` in a terminal opens the interactive panel. Shared documentation always syncs.

| Kit | Directory | Status in this package |
|-----|-----------|------------------------|
| `cursor` | `.cursor/` | Present (default) |
| `claude` | `.claude/` | **Present** — Claude Code kit (`--kit claude`) |
| `codex` | `.codex/` + `.agents/skills/` | **Present** — native Codex kit (`--kit codex`) |

If every selected kit is missing from the package, sync fails. `local/` under any synced kit directory is preserved.

### Claude Code specifics (`--kit claude`)

- Project memory lives at `.claude/CLAUDE.md` (valid Claude Code location) and imports the shared `AGENTS.md` — no root `CLAUDE.md` is created, so an existing one in the service is untouched.
- Kit index: `.claude/README.md`. Pipeline: `.claude/WORKFLOW.md`. Default entry for features/bugfixes: the `/orchestrate` skill.
- Rules in `.claude/rules/` are path-scoped (`paths:` frontmatter) — they only load when Claude works with matching files; only `business-rules-layers.md` and `git-no-ai-attribution.md` are always-on.
- `.claude/settings.json` ships PreToolUse hooks (require `python3` in PATH), a `permissions.deny` safety list, and `includeCoAuthoredBy: false` (no AI attribution trailers). Claude Code asks for workspace trust before running project hooks — accept it in the service repo.
- Sync **preserves** consumer-owned Claude files: `.claude/settings.local.json`, `.claude/CLAUDE.local.md`, `.claude/agent-memory*/`, and `.claude/local/`.

### Codex specifics (`--kit codex`)

- Project configuration, custom agents, hooks, and execpolicy live in `.codex/`; repository skills live in the Codex-native `.agents/skills/` discovery path.
- The primary Codex thread orchestrates; nine custom agents cover product, architecture, discovery, implementation, tests, review, QA, GitHub, and Jira.
- Models inherit from the active session. Role files set only reasoning effort and sandbox boundaries, and configuration caps spawned threads at three.
- After first sync or a hook update, trust the repository and review the hook with `/hooks`.
- The sync manifest owns only `ai-backend-kit-*` skill directories. Unrelated service/team skills under `.agents/skills/` are never deleted.

## What gets synced

| From the kit package | Into the target service |
|----------------------|-------------------------|
| Selected kit dirs (`.cursor/`, `.claude/`, `.codex/` when present) | Same path; stamps `<kit-dir>/KIT_VERSION` |
| Codex managed skills (`.agents/skills/ai-backend-kit-*`) | Same path when `codex` is selected; unrelated skills are preserved |
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
- Overrides under `<kit-dir>/local/` (never deleted by sync)
- Claude Code consumer files: `.claude/settings.local.json`, `.claude/CLAUDE.local.md`, `.claude/agent-memory*/`
- Service/team Codex skills whose directory is not listed in `.codex/skills-manifest.json`

## CLI flags

| Flag | Effect |
|------|--------|
| `-i` / `--interactive` | Force the interactive panel |
| `--kit <names>` | Kits to sync (comma-separated or repeatable), e.g. `--kit cursor,claude` |
| `--all` | Sync every kit directory **present** in the package |
| `-y` / `--yes` | Skip interactive panel; use default kit (`cursor`) |
| `--dry-run` | No writes; print planned actions |
| `--no-delete` | Do not remove target files absent from the kit |
| `--backup` | Backup overwritten paths under `.cursor-kit-backup-<timestamp>/` |
| `--force-specs-readme` | Always overwrite `docs/specs/README.md` |
| `--with-pr-template` | Seed `.github/PULL_REQUEST_TEMPLATE.md` from `docs/templates/` if missing |
| `-h` / `--help` | Usage |

The CLI:

1. Requires the target to exist and look like a service repo (`.git/` **or** `package.json`).
2. Resolves kits (prompt / `--kit` / `--all` / default `cursor`).
3. Syncs each available selected kit dir (deletes removed kit files by default; always excludes `local/`).
4. Writes `<kit-dir>/KIT_VERSION` from the package `VERSION`.
5. When Codex is selected, syncs only manifest-owned `ai-backend-kit-*` skills and preserves every unrelated skill.
6. Always syncs shared payload: `AGENTS.md`, architecture doc, specs templates, examples.
7. Copies `docs/specs/README.md` only when missing (unless `--force-specs-readme`).
8. Optionally seeds the PR template with `--with-pr-template`.

## Maintainer alternative (this git repo)

If you have cloned **ai-backend-kit** locally:

```bash
./scripts/sync-cursor.sh /path/to/some-service --dry-run --kit cursor
./scripts/sync-cursor.sh /path/to/some-service --backup --with-pr-template --kit cursor
./scripts/sync-cursor.sh /path/to/some-service --all
```

The bash script requires `rsync`. Prefer the npm CLI for day-to-day adoption; keep the script for kit maintainers. Behavior should stay aligned with `lib/sync-kit.js`.

## First-time checklist

1. Run `npx @beardjs/ai-backend-kit` (interactive panel) or `yarn ai-backend-kit -y` after pinning.
2. Confirm `<kit-dir>/KIT_VERSION` matches the kit version you intended.
3. Confirm the service has `.github/PULL_REQUEST_TEMPLATE.md` if you use `agt-github-workflow`.
4. Confirm Jest scripts match [AGENTS.md](../AGENTS.md) (`yarn test`, `yarn lint`, `yarn test:coverage`).
5. Keep org Jira defaults in `.cursor/JIRA.md` / `.claude/skills/jira-workflow/reference.md`, or edit those files **in the service** only if the project key/ids differ — prefer changing defaults in this kit repo when the whole org changes.
6. Open Cursor, Claude Code, or Codex on the **service** repo. For Claude Code, run `/context`; for Codex, trust the repo, inspect `/hooks`, and confirm the custom agents/skills are listed.

## Updating services after kit changes

1. Publish a new `@beardjs/ai-backend-kit` version (bump `VERSION` + `package.json` + `CHANGELOG.md`, tag `v*`).
2. In the service: `yarn up @beardjs/ai-backend-kit` (or bump the pin) then `yarn ai-backend-kit -y` (use `--backup` if unsure).
3. Review the service diff: expect kit dirs (incl. `KIT_VERSION`), `AGENTS.md`, and shared docs — not feature specs.
4. Open a PR on the service if the sync must be reviewed there.

## Local overrides

Put service-only Cursor files under `.cursor/local/`, Claude Code files under `.claude/local/`, and service-owned Codex notes/assets under `.codex/local/`. Add service-owned Codex skills with names outside the managed `ai-backend-kit-*` namespace. Sync preserves those paths and unrelated skills; personal Codex runtime overrides belong in the user's global configuration.

## Canonical examples (`user`)

Rules and skills use `user` as the pedagogical context (`UserService`, `IUser`, …). Illustrative snippets live in [`examples/canonical-user/`](../examples/canonical-user/). That does **not** mean every service owns a user module. Map examples to the local `<context>`.

## Language

All kit content is **English**. Do not translate rules/agents/skills into another language in service copies; keep the synced English source of truth.

## Kit version vs service release

| Concern | Where |
|---------|--------|
| Kit SemVer (npm) | This package: `VERSION` / `package.json` / `CHANGELOG.md` → stamped as `<kit-dir>/KIT_VERSION` |
| Service npm package release | Target service: semantic-release via [rule.release.mdc](../.cursor/rules/rule.release.mdc) / [release.md](../.claude/rules/release.md) |
