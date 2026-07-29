# Changelog

All notable changes to the **st-cursor-backend** Cursor kit are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Kit version lives in [`VERSION`](VERSION). After sync, the applied version is stamped at `.cursor/KIT_VERSION` in the target service.

> **Note:** Service package releases (`yarn release` / semantic-release) are separate from this kit version. See [`.cursor/rules/rule.release.mdc`](.cursor/rules/rule.release.mdc).

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

- Public npm package `@sauvvitech/st-cursor-backend` with CLI (`npx` / `yarn st-cursor-backend`)
- Node sync implementation [`lib/sync-kit.js`](lib/sync-kit.js) / [`bin/st-cursor-backend.js`](bin/st-cursor-backend.js) (no rsync required for consumers)
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
