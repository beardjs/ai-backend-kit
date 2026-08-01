# Cursor rules — layered backend

Index of project rules in [`rules/`](rules/). Architecture source of truth: [AGENTS.md](../AGENTS.md) and [docs/architecture-and-layers.md](../docs/architecture-and-layers.md).

This kit is maintained in **st-cursor-backend** and synced into each backend service. See [docs/ADOPTION.md](../docs/ADOPTION.md).

## Naming convention

- `rule.<kebab>.mdc` — layer and subject rules for this backend.
- `meta.<kebab>.mdc` — rules about creating and maintaining rules.
- No other prefixes; imported tool rules (Task Master, Whitebeard) are not used here.

See [meta.cursor-rules.mdc](rules/meta.cursor-rules.mdc) for the full convention.

## Layer and subject rules (`rule.*`)

| Rule | Focus |
|------|-------|
| [rule.project-core.mdc](rules/rule.project-core.mdc) | Layered backend, folder spelling, AGENTS.md as source of truth |
| [rule.naming-patterns.mdc](rules/rule.naming-patterns.mdc) | `I*` interfaces, Mongo `IM*` models, `E*` enums |
| [rule.business-rules-layers.mdc](rules/rule.business-rules-layers.mdc) | Business rules in Service; forbidden in Repository and Controller |
| [rule.domain.mdc](rules/rule.domain.mdc) | Domain — interfaces, entities, repo/service contracts |
| [rule.application.mdc](rules/rule.application.mdc) | Application — thin Express controllers, error/auth pattern |
| [rule.infraestructure.mdc](rules/rule.infraestructure.mdc) | Infraestructure — Mongo `IM*`, adapters, repositories |
| [rule.configuration.mdc](rules/rule.configuration.mdc) | Configuration — dotenv, env, composition factories |
| [rule.contracts-openapi.mdc](rules/rule.contracts-openapi.mdc) | OpenAPI `service.yaml` aligned with the HTTP API |
| [rule.semantic-quality.mdc](rules/rule.semantic-quality.mdc) | Semantic naming, REST paths, OpenAPI schemas |
| [rule.tests.mdc](rules/rule.tests.mdc) | Jest tests — `when`/`should`, mock policy, `*.int`/`*.unit`, coverage |
| [rule.release.mdc](rules/rule.release.mdc) | Release via semantic-release (not Changesets) |
| [rule.git-no-ai-attribution.mdc](rules/rule.git-no-ai-attribution.mdc) | Never add `Made with Cursor` / AI attribution to commits or PRs (`alwaysApply`) |

## Meta rules (`meta.*`)

| Rule | Focus |
|------|-------|
| [meta.cursor-rules.mdc](rules/meta.cursor-rules.mdc) | How to create and format rules, naming convention |
| [meta.self-improve.mdc](rules/meta.self-improve.mdc) | When and how to evolve rules from emerging patterns |

## Orchestration

Broad request / end-to-end feature or bugfix / chain several agents → **[`agt-orchestrator`](agents/agt-orchestrator.md)** (thin router: classifies, dispatches, synthesizes; does not implement).

Obvious single-specialist request (PR only, Jira only, review only) → call that agent directly.

## Spec-Driven toolkit

Versioned specs, PO, architecture (design), QA (PLAN/VERIFY), test author, and code review: [SPECS.md](SPECS.md) · artifacts under [`docs/specs/`](../docs/specs/README.md) (`requirements`, `design`, `tasks`, `test-plan`, `qa-report`).

Full flow (idea → release gate): [WORKFLOW.md](WORKFLOW.md).

## Architecture discovery (agnostic)

Map any repo as-is, mine patterns, steward Cursor rules (gated) — without
assuming Clean/Hexagonal/MVC. Coexists with layered SDD agents:

[ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md) ·
`agt-architecture-probe` · `agt-pattern-miner` · `agt-pattern-steward` ·
`skill-architecture-discovery`.

## Skills index

Scaffold, Spec-Driven, review, discovery, and ops skills: [SKILLS.md](SKILLS.md).

## Quality toolkit

Agents and skills for naming/REST/quality reviews: [QUALITY.md](QUALITY.md).

## GitHub toolkit

Atomic commits, Conventional Commits, and PR creation: [GITHUB.md](GITHUB.md).

## Jira toolkit

Read and create issues in Jira Cloud: [JIRA.md](JIRA.md).
