# st-cursor-backend

Versioned Cursor kit for layered Node.js/TypeScript backends (Domain → Application → Infraestructure → Configuration).

This repository is **not a microservice**. It is the source of truth for `.cursor` (rules, agents, skills, hooks) and the short contracts (`AGENTS.md`, `docs/architecture-and-layers.md`, spec templates) that must be **replicated** into every backend service.

**npm:** [`@sauvvitech/st-cursor-backend`](https://www.npmjs.com/package/@sauvvitech/st-cursor-backend) (public)

Kit SemVer: [`VERSION`](VERSION) · [`package.json`](package.json) · changes: [`CHANGELOG.md`](CHANGELOG.md). After sync, services get `.cursor/KIT_VERSION`.

## What this repo contains

| Path | Role |
|------|------|
| [`.cursor/`](.cursor/) | Rules, agents, skills, hooks, and indexes (`RULES.md`, `WORKFLOW.md`, …) |
| [`AGENTS.md`](AGENTS.md) | Short backend contract (commands, layers, DoD) |
| [`docs/architecture-and-layers.md`](docs/architecture-and-layers.md) | Layer detail and boundaries |
| [`docs/specs/_templates/`](docs/specs/_templates/) | Spec-Driven templates (`requirements`, `design`, `tasks`, `test-plan`, `qa-report`) |
| [`docs/ADOPTION.md`](docs/ADOPTION.md) | How to adopt / sync into a service |
| [`docs/templates/PULL_REQUEST_TEMPLATE.md`](docs/templates/PULL_REQUEST_TEMPLATE.md) | Optional PR template seed for services |
| [`examples/canonical-user/`](examples/canonical-user/) | Illustrative `user` context (not a runnable app) |
| [`bin/st-cursor-backend.js`](bin/st-cursor-backend.js) | npm CLI entry (`npx` / `yarn st-cursor-backend`) |
| [`lib/sync-kit.js`](lib/sync-kit.js) | Sync implementation (Node, no rsync) |
| [`scripts/sync-cursor.sh`](scripts/sync-cursor.sh) | Maintainer alternative (bash + rsync) |

## Principles

- **Generic and replicable** — the same kit applies to any service that follows the layered architecture.
- **Do not strip detail** — rules, agents, and skills stay complete; what changes per service is only `src/` code and that service’s feature specs.
- **Canonical examples** — snippets using the `user` context (`UserService`, `IUser`, …) are the **pedagogical pattern** of the kit, not a coupling to one service. In real code, use the service’s `<context>`. See [`examples/canonical-user/`](examples/canonical-user/).
- **Fixed spelling** — folders `infraestructure` (with “e”) and `configuration` (singular).
- **English only** — all kit docs, rules, agents, and skills are written in English.

## Three ways to work (in a service)

| Path | When | Entry |
|------|------|--------|
| **A — Hotfix / typo** | Rename, 1-liner, or ≤3 files with no OpenAPI/route change | Specialist agent directly (`agt-dev-backend` → `agt-test-runner` → `agt-verifier`) |
| **B — Feature (SDD)** | New endpoint/context or contract change | **`agt-orchestrator`** (PO → human gate → design → QA plan → …) |
| **C — Specialist only** | Requirements only, design only, review only, PR only | Call that agent (`agt-product-owner`, `agt-code-review`, `agt-github-workflow`, …) |

Shortcuts detail: [`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md).

## Quick adoption

```bash
# First-time (service repo root)
npx @sauvvitech/st-cursor-backend --with-pr-template

# Pin + updates
yarn add -D @sauvvitech/st-cursor-backend
yarn st-cursor-backend
```

What to overwrite vs keep local: [docs/ADOPTION.md](docs/ADOPTION.md).

Maintainer clone of this repo can still use `./scripts/sync-cursor.sh /path/to/service`.

## After sync, in the target service

1. Confirm `AGENTS.md`, `docs/architecture-and-layers.md`, and `.cursor/KIT_VERSION` exist.
2. Feature specs live under `docs/specs/<feature-slug>/` **in the service** (not in this template).
3. Open Cursor in the service and pick path A, B, or C above.

## Cursor kit indexes

| Doc | Purpose |
|-----|---------|
| [`.cursor/RULES.md`](.cursor/RULES.md) | Rules index |
| [`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md) | Idea → release-gate pipeline |
| [`.cursor/SPECS.md`](.cursor/SPECS.md) | Spec-Driven toolkit |
| [`.cursor/SKILLS.md`](.cursor/SKILLS.md) | Skills map (scaffold / SDD / review / ops) |
| [`.cursor/QUALITY.md`](.cursor/QUALITY.md) | Naming / REST / audits |
| [`.cursor/GITHUB.md`](.cursor/GITHUB.md) | Commits and PRs |
| [`.cursor/JIRA.md`](.cursor/JIRA.md) | Jira issues (org defaults) |

## Kit version vs service release

| Concern | Mechanism |
|---------|-----------|
| This Cursor kit (npm) | `VERSION` + `package.json` + `CHANGELOG.md` → stamped as `.cursor/KIT_VERSION` |
| Service npm package | semantic-release in the **service** ([`rule.release.mdc`](.cursor/rules/rule.release.mdc)) |

## Maintenance

1. Evolve rules/agents/skills **in this** repository.
2. Bump `VERSION` **and** `package.json` `version` together; update `CHANGELOG.md` for consumer-visible changes.
3. Open a PR here with Conventional Commits (no AI attribution).
4. After merge, tag `vX.Y.Z` to publish to npm (see `.github/workflows/publish.yml`), then services run `yarn up @sauvvitech/st-cursor-backend && yarn st-cursor-backend`.
