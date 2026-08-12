# Changelog

All notable changes to the **ai-backend-kit** agent kits are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Kit version lives in [`VERSION`](VERSION). After sync, the applied version is stamped at `<kit-dir>/KIT_VERSION` in the target service (e.g. `.cursor/KIT_VERSION`).

> **Note:** Service package releases (`yarn release` / semantic-release) are separate from this kit version. See [`.cursor/rules/rule.release.mdc`](.cursor/rules/rule.release.mdc).

# [1.4.0](https://github.com/beardjs/ai-backend-kit/compare/v1.3.0...v1.4.0) (2026-08-02)


### Features

* **agents:** consolidate discovery report into analysis.md ([839ede4](https://github.com/beardjs/ai-backend-kit/commit/839ede402330e0d33e1ab293ccce775d70260e92))
* **claude:** add architecture analyst agent for analysis.md ([666f2af](https://github.com/beardjs/ai-backend-kit/commit/666f2af3c25987bda822a4b102173888188ff318))
* **claude:** add consolidated architecture analysis template ([ea5cd0e](https://github.com/beardjs/ai-backend-kit/commit/ea5cd0e9122ee58aec45e6204d84bc68587e2e34))
* **claude:** dispatch architecture analyst in discovery pipeline ([7c6389a](https://github.com/beardjs/ai-backend-kit/commit/7c6389a379cd3c250fb69bb54b999dea3d2faa46))
* **claude:** wire analyst into architecture-discovery slash entry ([6758077](https://github.com/beardjs/ai-backend-kit/commit/6758077cb449dc050eb023973fe29daada0785b8))
* **cli:** add analyze-architecture flags to sync CLI ([d5b5f5e](https://github.com/beardjs/ai-backend-kit/commit/d5b5f5e884640d6578fe9af8e765ab4d1affd511))
* **cli:** add deterministic architecture alignment scanner ([39166d6](https://github.com/beardjs/ai-backend-kit/commit/39166d6c866e88d2a13bc0821fa03aaf92360c0d))
* **cli:** prompt architecture scan on install and write baseline ([601d55d](https://github.com/beardjs/ai-backend-kit/commit/601d55d5ebba9e4d9aa295fd130d3fb16d0c1397))
* **codex:** consolidate discovery into analysis.md ([b24804f](https://github.com/beardjs/ai-backend-kit/commit/b24804ff248bc2cd70e9e1aa4a31b04ef7c8a0ba))
* **cursor:** add architecture analyst agent for analysis.md ([6fd7316](https://github.com/beardjs/ai-backend-kit/commit/6fd7316fad248c0dc94fa4b54790b5bb4124e645))
* **cursor:** add consolidated architecture analysis template ([b9c6f27](https://github.com/beardjs/ai-backend-kit/commit/b9c6f273ba226dfd3eea05d0ea4c5328c7b26ae8))
* **cursor:** dispatch architecture analyst in discovery pipeline ([895ae67](https://github.com/beardjs/ai-backend-kit/commit/895ae675540cdfedee996d83b020abbcd9441c96))
* **cursor:** wire analyst into architecture-discovery skill ([50afd90](https://github.com/beardjs/ai-backend-kit/commit/50afd90a95c6b079d68fb2909642d5d796e353c2))

## [Unreleased]

### Added

- **Cybersecurity suite** across the three kits: always-on rule [`rule.security-baseline.mdc`](.cursor/rules/rule.security-baseline.mdc) / [`security-baseline.md`](.claude/rules/security-baseline.md) (authorization, injection, secrets, and data exposure by layer); read-only audit agent `agt-security-review` ([Cursor](.cursor/agents/agt-security-review.md), [Claude](.claude/agents/review/agt-security-review.md)) and Codex [`security-reviewer`](.codex/agents/security-reviewer.toml); skill `review-security` with an OWASP Top 10 / API Top 10 reference ([Cursor](.cursor/skills/skill-review-security/SKILL.md), [Claude](.claude/skills/review-security/SKILL.md), [Codex](.agents/skills/ai-backend-kit-review-security/SKILL.md))
- Security review is now a **mandatory review phase**, running in parallel with `agt-code-review`; `BLOCKING_SECURITY` blocks the gate ([`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md), [`.claude/WORKFLOW.md`](.claude/WORKFLOW.md), orchestrator and `/orchestrate`)
- Security in the Spec-Driven artifacts: `NFR-SEC-01` and `ABUSE-*` in [`requirements.md`](docs/specs/_templates/requirements.md), a `## Security` section (authorization matrix, data classification, attack surface) in [`design.md`](docs/specs/_templates/design.md), security and authorization cases in [`test-plan.md`](docs/specs/_templates/test-plan.md), and a security evidence block in [`qa-report.md`](docs/specs/_templates/qa-report.md)
- Non-negotiable rule 8 (security baseline) and a security item in the Definition of Done in [`AGENTS.md`](AGENTS.md); new cross-layer section 13 in [`docs/architecture-and-layers.md`](docs/architecture-and-layers.md)
- [DeepWiki](https://deepwiki.com/beardjs/ai-backend-kit) integration for this public kit repo: Ask DeepWiki badge and wiki link in [`README.md`](README.md), steering via [`.devin/wiki.json`](.devin/wiki.json), and a short note in [`docs/ADOPTION.md`](docs/ADOPTION.md) (kit-repo only; not synced to services)
- Architecture Discovery **entry UX**: [README — Architecture discovery workflow](README.md#architecture-discovery-workflow) (steps, Entry by tool, copy-paste prompts); Quick start blocks in [`.cursor/ARCHITECTURE-DISCOVERY.md`](.cursor/ARCHITECTURE-DISCOVERY.md) and [`.claude/ARCHITECTURE-DISCOVERY.md`](.claude/ARCHITECTURE-DISCOVERY.md); Claude `/architecture-discovery` slash-entry thin pipeline; Codex Path D quick start in [`.codex/README.md`](.codex/README.md)
- CLI **architecture alignment scan** (deterministic, no AI): Yes/No in the install panel right after kit selection (**default Yes on first install**), writes `docs/architecture/alignment-scan.md`, `--analyze-architecture` / `--no-analyze-architecture`, [`lib/analyze-architecture.js`](lib/analyze-architecture.js)
- Discovery consolidator **`agt-architecture-analyst`** → `docs/architecture/analysis.md` (keeps `profile.md` + `patterns.md`); wired into Path D / `/architecture-discovery` / orchestrator

### Changed

- Root [`README.md`](README.md) — onboarding-first guide: what the kit does, numbered Getting started, narrative Feature workflow (steps + example prompt), table of contents; agents and orchestration overview with five Mermaid diagrams (path selection, orchestrator loop, Spec-Driven pipeline with artifacts/gates, architecture discovery, agent role map) plus a catalog of all 18 Cursor `agt-*` agents with links to definitions
- Getting started and Cursor kit indexes now surface Path D / [`ARCHITECTURE-DISCOVERY.md`](.cursor/ARCHITECTURE-DISCOVERY.md); [`.claude/README.md`](.claude/README.md) lists `/architecture-discovery` next to `/orchestrate`; orchestrator and workflow indexes include example discovery prompts
- `agt-code-review` keeps a thin security pass and routes deep or systemic findings to `agt-security-review`; the Codex `reviewer` agent delegates the same way

### Fixed

- Canonical example contract drift: [`service.yaml`](examples/canonical-user/src/contracts/service.yaml) now defines the `bearerAuth` security scheme, a global `security` block, `401` / `403` responses, and the `Error` / `AuthMiddlewareError` schemas that the `openapi-contract` skill already told agents to reuse
- [`EErrorCode`](examples/canonical-user/src/domain/common/errors/enums/EErrorCode.ts) and the [i18n catalog](examples/canonical-user/src/infraestructure/i18n/error-catalog.ts) gained `UNAUTHORIZED` and `FORBIDDEN`, the codes the documented authorization pattern needs

## [1.3.0] — 2026-07-31

### Added

- **Codex kit (`.codex/` + `.agents/skills/`)** — native, independent, and optimized port (`--kit codex`):
  - project `config.toml` with inherited models, role-specific reasoning, and a three-subagent cap
  - nine consolidated custom agents for product, architecture, discovery, implementation, tests, review, QA, GitHub, and Jira
  - 18 progressively loaded repository skills with no runtime dependency on another assistant kit
  - Node.js PreToolUse safety hook plus execpolicy rules for sensitive files and destructive commands
  - manifest-owned skill sync that preserves unrelated `.agents/skills/` content
- **Claude Code kit (`.claude/`)** — native, optimized port of the full SDD pipeline (`--kit claude`):
  - `.claude/CLAUDE.md` project memory importing the shared `AGENTS.md`
  - 13 rules in `.claude/rules/` (2 always-on; 11 path-scoped via `paths:` frontmatter)
  - 17 subagents in `.claude/agents/{sdd,review,ops,discovery}/` with tiered models (`haiku` / `sonnet` / `inherit`), per-role `tools` restrictions, and skill preloading
  - 19 skills in `.claude/skills/` (directory name = `/command`); `agt-orchestrator` ported as the `/orchestrate` main-thread skill; `/review-naming` and `/review-rest-endpoints` run in forked readonly subagents
  - `.claude/settings.json` with PreToolUse hooks (sensitive-file + destructive-shell), declarative `permissions.deny`, and `includeCoAuthoredBy: false`
  - Kit docs: `.claude/README.md` (index), `.claude/WORKFLOW.md`, `.claude/ARCHITECTURE-DISCOVERY.md`
- Architecture discovery toolkit (agnostic probe / miner / steward) in both kits: `.cursor/ARCHITECTURE-DISCOVERY.md`, `agt-architecture-probe`, `agt-pattern-miner`, `agt-pattern-steward`, `skill-architecture-discovery`
- CI validates the Claude kit: hook `py_compile`, `settings.json` JSON check, real `--kit cursor,claude` sync with `KIT_VERSION` and preservation asserts

### Changed

- `--kit codex` now installs `.codex/`, stamps its version, and synchronizes the native `.agents/skills/` companion payload
- Sync preserves consumer-owned Claude Code files in `.claude/`: `settings.local.json`, `CLAUDE.local.md`, `agent-memory/`, `agent-memory-local/` (Node CLI and bash script)
- Shared docs (`AGENTS.md`, `docs/architecture-and-layers.md`, `docs/specs/README.md`) now reference both kits (Cursor `agt-orchestrator` / Claude Code `/orchestrate`)
- `docs/ADOPTION.md` documents Claude Code specifics; `claude` is no longer listed as reserved

## [1.2.0] — 2026-07-31

### Added

- Interactive panel on bare `npx` / TTY (`@clack/prompts`): arrow-key `select` (Claude CLI style) with per-kit, **All available kits**, and custom multi-select; also PR template and backup prompts
- Non-interactive flags `--kit`, `--all`, `-y` / `--yes`, plus `-i` / `--interactive` to force the panel
- Shared docs always sync regardless of which tool kits are selected
- `package.json` `files` already includes `.claude` and `.codex` for future kit payloads

### Changed

- CLI syncs only the selected tool kit directories; missing kit folders warn and skip
- `scripts/sync-cursor.sh` accepts `--kit` / `--all` with the same semantics
- Stamp `KIT_VERSION` inside each synced kit directory

## [1.1.0] — 2026-07-29

### Added

- Dedicated test author agent [`agt-test-author`](.cursor/agents/agt-test-author.md): creates/extends Jest unit and integration tests with mandatory `describe('when …')` / `it('should …')` naming, scenario checklist, and mock policy (no Repository mocks in service tests; `jest.spyOn` for external services and Kafka)

### Changed

- QA AUTOMATE no longer writes `src/__tests__/**` — dispatches `agt-test-author`; PLAN and VERIFY remain on `agt-quality-assurance`
- [`rule.tests.mdc`](.cursor/rules/rule.tests.mdc) and [`skill-tests-layered`](.cursor/skills/skill-tests-layered/SKILL.md) enforce `when`/`should` and the mock policy
- Orchestrator, WORKFLOW, SPECS, and related skills/docs wire test-author into the SDD pipeline
- Canonical example tests renamed to the `when`/`should` pattern

## [1.0.0] — 2026-07-29

### Added

- Public npm package `@beardjs/ai-backend-kit` with CLI (`npx` / `yarn ai-backend-kit`)
- Node sync implementation [`lib/sync-kit.js`](lib/sync-kit.js) / [`bin/ai-backend-kit.js`](bin/ai-backend-kit.js) (no rsync required for consumers)
- Kit SemVer (`VERSION`) and this changelog
- Sync stamps `.cursor/KIT_VERSION` on the target service
- Hardened `scripts/sync-cursor.sh`: `--dry-run`, `--no-delete`, `--backup`, `--force-specs-readme`, `--with-pr-template`, flexible arg order, target validation
- Local overrides under `.cursor/local/` are preserved across sync
- Sync also copies `examples/canonical-user/` into the target service
- CI workflow for kit validation (version check, CLI fixture, bash smoke, links, `npm pack`)
- Publish workflow on tag `v*` (npm public)
- Seed PR template at `docs/templates/PULL_REQUEST_TEMPLATE.md` and kit `.github/PULL_REQUEST_TEMPLATE.md`
- Skills index [`.cursor/SKILLS.md`](.cursor/SKILLS.md)
- Canonical illustrative example under [`examples/canonical-user/`](examples/canonical-user/)

### Fixed

- ADOPTION.md aligned with sync behavior for `docs/specs/README.md`
- Kafka skill points to architecture docs (not a missing AGENTS.md section)
- Service interface path unified with AGENTS.md (`service/<context>.service.interface.ts`)
- `agt-architecture-review` frontmatter `readonly: true`
- Residual non-English phrase in SPECS.md
