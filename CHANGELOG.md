# Changelog

All notable changes to the **ai-backend-kit** agent kits are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Kit version lives in [`VERSION`](VERSION). After sync, the applied version is stamped at `<kit-dir>/KIT_VERSION` in the target service (e.g. `.cursor/KIT_VERSION`).

> **Note:** Service package releases (`yarn release` / semantic-release) are separate from this kit version. See [`.cursor/rules/rule.release.mdc`](.cursor/rules/rule.release.mdc).

## [Unreleased]

### Added

- [DeepWiki](https://deepwiki.com/beardjs/ai-backend-kit) integration for this public kit repo: Ask DeepWiki badge and wiki link in [`README.md`](README.md), steering via [`.devin/wiki.json`](.devin/wiki.json), and a short note in [`docs/ADOPTION.md`](docs/ADOPTION.md) (kit-repo only; not synced to services)
- Architecture Discovery **entry UX**: [README — Architecture discovery workflow](README.md#architecture-discovery-workflow) (steps, Entry by tool, copy-paste prompts); Quick start blocks in [`.cursor/ARCHITECTURE-DISCOVERY.md`](.cursor/ARCHITECTURE-DISCOVERY.md) and [`.claude/ARCHITECTURE-DISCOVERY.md`](.claude/ARCHITECTURE-DISCOVERY.md); Claude `/architecture-discovery` slash-entry thin pipeline; Codex Path D quick start in [`.codex/README.md`](.codex/README.md)
- CLI **architecture alignment scan** (deterministic, no AI): Yes/No in the install panel right after kit selection (**default Yes on first install**), writes `docs/architecture/alignment-scan.md`, `--analyze-architecture` / `--no-analyze-architecture`, [`lib/analyze-architecture.js`](lib/analyze-architecture.js)
- Discovery consolidator **`agt-architecture-analyst`** → `docs/architecture/analysis.md` (keeps `profile.md` + `patterns.md`); wired into Path D / `/architecture-discovery` / orchestrator

### Changed

- Root [`README.md`](README.md) — onboarding-first guide: what the kit does, numbered Getting started, narrative Feature workflow (steps + example prompt), table of contents; agents and orchestration overview with five Mermaid diagrams (path selection, orchestrator loop, Spec-Driven pipeline with artifacts/gates, architecture discovery, agent role map) plus a catalog of all 18 Cursor `agt-*` agents with links to definitions
- Getting started and Cursor kit indexes now surface Path D / [`ARCHITECTURE-DISCOVERY.md`](.cursor/ARCHITECTURE-DISCOVERY.md); [`.claude/README.md`](.claude/README.md) lists `/architecture-discovery` next to `/orchestrate`; orchestrator and workflow indexes include example discovery prompts

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
