# Adopting the Cursor backend kit

How to replicate this kit into a layered Node.js/TypeScript backend service.

## What gets synced

| From this repo | Into the target service |
|----------------|-------------------------|
| `.cursor/` (entire tree) | `.cursor/` |
| `AGENTS.md` | `AGENTS.md` (service root) |
| `docs/architecture-and-layers.md` | `docs/architecture-and-layers.md` |
| `docs/specs/_templates/` | `docs/specs/_templates/` |
| `docs/specs/README.md` | `docs/specs/README.md` (only if missing or intentionally refreshed) |

## What stays local to the service

- All of `src/`
- Feature specs: `docs/specs/<feature-slug>/` (requirements, design, tasks, …)
- `.github/` (PR template, workflows) — create/keep per service
- Service-specific env, CI, and package scripts
- Optional overrides documented below

## Sync command

```bash
# Dry-run (prints actions)
./scripts/sync-cursor.sh /path/to/st-some-service --dry-run

# Apply
./scripts/sync-cursor.sh /path/to/st-some-service
```

The script:

1. Requires the target path to exist and look like a git repo (or at least a directory).
2. Copies `.cursor/` with `rsync` (deletes removed kit files under `.cursor/` by default).
3. Overwrites `AGENTS.md` and `docs/architecture-and-layers.md`.
4. Ensures `docs/specs/_templates/` exists and is up to date.
5. Does **not** delete or overwrite `docs/specs/<feature-slug>/` feature folders.

## First-time checklist

1. Run the sync script.
2. Confirm the service has (or add) `.github/PULL_REQUEST_TEMPLATE.md` if you use `agt-github-workflow`.
3. Confirm Jest scripts match [AGENTS.md](../AGENTS.md) (`yarn test`, `yarn lint`, `yarn test:coverage`).
4. Keep org Jira defaults in `.cursor/JIRA.md`, or edit that file **in the service** only if the project key/ids differ — prefer changing defaults in this kit repo when the whole org changes.
5. Open Cursor on the **service** repo (not this template) to develop features.

## Updating services after kit changes

1. Land the kit change in `st-cursor-backend`.
2. Re-run `./scripts/sync-cursor.sh /path/to/service`.
3. Review the service diff: expect only `.cursor/`, `AGENTS.md`, and shared docs — not feature specs.
4. Open a PR on the service if the sync must be reviewed there.

## Canonical examples (`user`)

Rules and skills use `user` as the pedagogical context (`UserService`, `IUser`, …). That does **not** mean every service owns a user module. Map examples to the local `<context>`.

## Language

All kit content is **English**. Do not translate rules/agents/skills into another language in service copies; keep the synced English source of truth.
