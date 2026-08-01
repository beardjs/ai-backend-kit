# Skills index (Cursor kit)

Map of implementation, Spec-Driven, review, and ops skills. Prefer invoking via the matching agent when one exists; use `@skill-…` for focused checklists.

Canonical code shapes: [`examples/canonical-user/`](../examples/canonical-user/). Full agent pipeline: [WORKFLOW.md](WORKFLOW.md).

## Spec-Driven / product

| Skill | Purpose |
|-------|---------|
| [skill-product-refinement](skills/skill-product-refinement/SKILL.md) | Ambiguity, slicing, AC, DoR → `requirements.md` |
| [skill-spec-driven](skills/skill-spec-driven/SKILL.md) | Specify → Design → Tasks checklist |
| [skill-technical-design](skills/skill-technical-design/SKILL.md) | Approved requirements → `design.md` |
| [skill-quality-assurance](skills/skill-quality-assurance/SKILL.md) | PLAN / VERIFY; dispatch author for automation |
| [skill-backend-implementation](skills/skill-backend-implementation/SKILL.md) | Scope-safe implementation + DoD |
| [skill-code-review](skills/skill-code-review/SKILL.md) | Spec ↔ code typed findings |

## Scaffold / implement (usually `@skill-…` only)

| Skill | When to use |
|-------|-------------|
| [skill-new-context](skills/skill-new-context/SKILL.md) | New bounded context end-to-end |
| [skill-add-http-endpoint](skills/skill-add-http-endpoint/SKILL.md) | New route in an existing context |
| [skill-mongo-persistence](skills/skill-mongo-persistence/SKILL.md) | `IM*`, adapter, Read/Write repos |
| [skill-kafka-messaging](skills/skill-kafka-messaging/SKILL.md) | Kafka producer/consumer (domain contract + infra) |
| [skill-domain-errors](skills/skill-domain-errors/SKILL.md) | `EErrorCode`, catalog, translated HTTP errors |
| [skill-openapi-contract](skills/skill-openapi-contract/SKILL.md) | Keep `service.yaml` aligned |
| [skill-tests-layered](skills/skill-tests-layered/SKILL.md) | Jest unit/int layout; `when`/`should`; mock policy (`agt-test-author`) |

## Review / quality

| Skill | Purpose |
|-------|---------|
| [skill-review-naming](skills/skill-review-naming/SKILL.md) | Identifier audit by layer |
| [skill-review-rest-endpoints](skills/skill-review-rest-endpoints/SKILL.md) | Routes, verbs, YAML parity (+ `reference-rest.md`) |

## Architecture discovery (agnostic)

| Skill | Purpose |
|-------|---------|
| [skill-architecture-discovery](skills/skill-architecture-discovery/SKILL.md) | As-is profile, pattern mining, gated rule stewardship (any style/stack) |

Agents: `agt-architecture-probe`, `agt-pattern-miner`, `agt-pattern-steward` —
see [ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md).

## Ops

| Skill | Purpose |
|-------|---------|
| [skill-github-workflow](skills/skill-github-workflow/SKILL.md) | Atomic commits + PR template |
| [skill-jira-workflow](skills/skill-jira-workflow/SKILL.md) | Jira read/create |

## Related indexes

| Doc | Focus |
|-----|--------|
| [SPECS.md](SPECS.md) | Spec artifacts and PO/architecture/QA agents |
| [ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md) | Agnostic probe / miner / steward |
| [QUALITY.md](QUALITY.md) | Naming / REST agents |
| [RULES.md](RULES.md) | Rules index |
| [GITHUB.md](GITHUB.md) | Commits and PRs |
| [JIRA.md](JIRA.md) | Jira defaults |
