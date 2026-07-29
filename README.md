# st-cursor-backend

Versioned Cursor kit for layered Node.js/TypeScript backends (Domain → Application → Infraestructure → Configuration).

This repository is **not a microservice**. It is the source of truth for `.cursor` (rules, agents, skills, hooks) and the short contracts (`AGENTS.md`, `docs/architecture-and-layers.md`, spec templates) that must be **replicated** into every backend service.

## What this repo contains

| Path | Role |
|------|------|
| [`.cursor/`](.cursor/) | Rules, agents, skills, hooks, and indexes (`RULES.md`, `WORKFLOW.md`, …) |
| [`AGENTS.md`](AGENTS.md) | Short backend contract (commands, layers, DoD) |
| [`docs/architecture-and-layers.md`](docs/architecture-and-layers.md) | Layer detail and boundaries |
| [`docs/specs/_templates/`](docs/specs/_templates/) | Spec-Driven templates (`requirements`, `design`, `tasks`, `test-plan`, `qa-report`) |
| [`docs/ADOPTION.md`](docs/ADOPTION.md) | How to adopt / sync into a service |
| [`scripts/sync-cursor.sh`](scripts/sync-cursor.sh) | Copy/sync the kit into a target service |

## Principles

- **Generic and replicable** — the same kit applies to any service that follows the layered architecture.
- **Do not strip detail** — rules, agents, and skills stay complete; what changes per service is only `src/` code and that service’s feature specs.
- **Canonical examples** — snippets using the `user` context (`UserService`, `IUser`, …) are the **pedagogical pattern** of the kit, not a coupling to one service. In real code, use the service’s `<context>`.
- **Fixed spelling** — folders `infraestructure` (with “e”) and `configuration` (singular).
- **English only** — all kit docs, rules, agents, and skills are written in English.

## Quick adoption

```bash
# From this repo, sync the kit into an existing service
./scripts/sync-cursor.sh /path/to/st-some-service
```

What to overwrite vs keep local: [docs/ADOPTION.md](docs/ADOPTION.md).

## After sync, in the target service

1. Confirm `AGENTS.md` and `docs/architecture-and-layers.md` exist at the service root.
2. Feature specs live under `docs/specs/<feature-slug>/` **in the service** (not in this template).
3. Open Cursor in the service and use `agt-orchestrator` for end-to-end features.

## Cursor kit indexes

| Doc | Purpose |
|-----|---------|
| [`.cursor/RULES.md`](.cursor/RULES.md) | Rules index |
| [`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md) | Idea → release-gate pipeline |
| [`.cursor/SPECS.md`](.cursor/SPECS.md) | Spec-Driven toolkit |
| [`.cursor/QUALITY.md`](.cursor/QUALITY.md) | Naming / REST / audits |
| [`.cursor/GITHUB.md`](.cursor/GITHUB.md) | Commits and PRs |
| [`.cursor/JIRA.md`](.cursor/JIRA.md) | Jira issues (org defaults) |

## Maintenance

1. Evolve rules/agents/skills **in this** repository.
2. Open a PR here with Conventional Commits (no AI attribution).
3. After merge, run `scripts/sync-cursor.sh` on services (or refresh the submodule/copy your team uses).
