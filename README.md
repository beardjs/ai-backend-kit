# ai-backend-kit

Versioned AI kit for layered Node.js/TypeScript backends (Domain → Application → Infraestructure → Configuration).

This repository is **not a microservice**. It is the source of truth for independent Cursor (`.cursor`), Claude Code (`.claude`), and Codex (`.codex` + `.agents/skills`) kits plus the shared contracts that must be **replicated** into every backend service.

**npm:** [`@beardjs/ai-backend-kit`](https://www.npmjs.com/package/@beardjs/ai-backend-kit) (public)

Kit SemVer: [`VERSION`](VERSION) · [`package.json`](package.json) · changes: [`CHANGELOG.md`](CHANGELOG.md). After sync, services get `<kit-dir>/KIT_VERSION`.

## What this repo contains

| Path | Role |
|------|------|
| [`.cursor/`](.cursor/) | Cursor kit — rules, agents, skills, hooks, and indexes (`RULES.md`, `WORKFLOW.md`, …) |
| [`.claude/`](.claude/) | Claude Code kit — `CLAUDE.md`, path-scoped rules, subagents, skills, hooks + `settings.json` ([index](.claude/README.md)) |
| [`.codex/`](.codex/) | Codex kit — project config, nine custom agents, hooks, execpolicy, and index ([README](.codex/README.md)) |
| [`.agents/skills/`](.agents/skills/) | Codex-native repository skills (progressive disclosure) |
| [`AGENTS.md`](AGENTS.md) | Short backend contract (commands, layers, DoD) |
| [`docs/architecture-and-layers.md`](docs/architecture-and-layers.md) | Layer detail and boundaries |
| [`docs/specs/_templates/`](docs/specs/_templates/) | Spec-Driven templates (`requirements`, `design`, `tasks`, `test-plan`, `qa-report`) |
| [`docs/ADOPTION.md`](docs/ADOPTION.md) | How to adopt / sync into a service |
| [`docs/templates/PULL_REQUEST_TEMPLATE.md`](docs/templates/PULL_REQUEST_TEMPLATE.md) | Optional PR template seed for services |
| [`examples/canonical-user/`](examples/canonical-user/) | Illustrative `user` context (not a runnable app) |
| [`bin/ai-backend-kit.js`](bin/ai-backend-kit.js) | npm CLI entry (`npx` / `yarn ai-backend-kit`) |
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
| **B — Feature (SDD)** | New endpoint/context or contract change | **`agt-orchestrator`** (Cursor) / **`/orchestrate`** (Claude Code) / primary Codex agent + `$spec-driven` — PO → human gate → design → QA plan → … |
| **C — Specialist only** | Requirements only, design only, review only, PR only | Call that agent (`agt-product-owner`, `agt-code-review`, `agt-github-workflow`, …) |

Shortcuts detail: [`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md) / [`.claude/WORKFLOW.md`](.claude/WORKFLOW.md).

## Quick adoption

```bash
# First-time (service repo root) — opens interactive panel
npx @beardjs/ai-backend-kit

# Non-interactive (CI / scripts)
npx @beardjs/ai-backend-kit -y --with-pr-template
npx @beardjs/ai-backend-kit --kit cursor --with-pr-template
npx @beardjs/ai-backend-kit --kit claude            # Claude Code kit
npx @beardjs/ai-backend-kit --kit codex             # Codex + repository skills
npx @beardjs/ai-backend-kit --kit cursor,claude,codex

# Pin + updates
yarn add -D @beardjs/ai-backend-kit
yarn ai-backend-kit
```

Bare `npx` opens an interactive panel (↑↓ + Enter): one kit, all kits, or custom multi-select; then PR template and backup. Shared docs (`AGENTS.md`, architecture, specs templates, examples) always sync. What to overwrite vs keep local: [docs/ADOPTION.md](docs/ADOPTION.md).

Maintainer clone of this repo can still use `./scripts/sync-cursor.sh /path/to/service --kit cursor`.

## After sync, in the target service

1. Confirm `AGENTS.md`, `docs/architecture-and-layers.md`, and `<kit-dir>/KIT_VERSION` exist (e.g. `.cursor/KIT_VERSION`).
2. Feature specs live under `docs/specs/<feature-slug>/` **in the service** (not in this template).
3. Open Cursor, Claude Code, or Codex in the service and pick path A, B, or C above.

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

## Claude Code kit (`.claude/`)

Native port of the same pipeline, optimized for Claude Code:

- [`CLAUDE.md`](.claude/CLAUDE.md) — lean project memory importing `AGENTS.md`
- [`README.md`](.claude/README.md) — kit index (rules / agents / skills / quality / ops)
- [`WORKFLOW.md`](.claude/WORKFLOW.md) — idea → release-gate pipeline (`/orchestrate` entry)
- `rules/` — path-scoped rules that load only when Claude touches matching files
- `agents/` — 17 subagents with tiered models (`haiku` / `sonnet` / `inherit`) and per-role tool restrictions
- `skills/` — 19 skills (directory name = `/command`; manual ones use `disable-model-invocation`)
 
## Codex kit (`.codex/` + `.agents/skills/`)

- [`config.toml`](.codex/config.toml) — project-scoped multi-agent configuration with a three-subagent cap and inherited models
- [`agents/`](.codex/agents/) — nine consolidated roles with per-role reasoning and sandbox boundaries
- [`hooks.json`](.codex/hooks.json) + `rules/` — trusted-project guardrails for sensitive files and destructive commands
- [`.agents/skills/`](.agents/skills/) — 18 focused workflows discovered natively and loaded progressively
- [`README.md`](.codex/README.md) — agent map, trust setup, and default delivery flow

## Kit version vs service release

| Concern | Mechanism |
|---------|-----------|
| This kit (npm) | **semantic-release** on push to `main` (see [`.github/workflows/release.yml`](.github/workflows/release.yml)) → updates `VERSION` / `package.json` / `CHANGELOG.md`, publishes, stamps as `<kit-dir>/KIT_VERSION` after sync |
| Service npm package | semantic-release in the **service** ([`rule.release.mdc`](.cursor/rules/rule.release.mdc) / [`release.md`](.claude/rules/release.md)) |

## Maintenance

1. Evolve rules/agents/skills **in this** repository.
2. Open a PR with **Conventional Commits** (no AI attribution). Do **not** bump `VERSION` / `package.json` / `CHANGELOG.md` by hand.
3. Merge to **`main`** — GitHub Actions runs semantic-release: changelog, version bump, npm publish, git tag, GitHub Release (requires secret `NPM_TOKEN`).
4. Services then run `yarn up @beardjs/ai-backend-kit && yarn ai-backend-kit`.

---

Developed by [Filipe Paixão](https://github.com/FilipePaixao).
