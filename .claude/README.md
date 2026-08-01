# Claude Code kit — layered backend

Index of the `.claude/` kit for **layered backend services**. Architecture source of truth: [AGENTS.md](../AGENTS.md) and [docs/architecture-and-layers.md](../docs/architecture-and-layers.md).

This kit is maintained in **ai-backend-kit** and synced into each backend service. See [docs/ADOPTION.md](../docs/ADOPTION.md). Full pipeline (idea → release gate): [WORKFLOW.md](WORKFLOW.md).

## How the pieces load (Claude Code)

| Piece | Location | When it loads |
|-------|----------|----------------|
| Project memory | [CLAUDE.md](CLAUDE.md) (imports `AGENTS.md`) | Every session |
| Always-on rules | `rules/*.md` without `paths:` | Every session |
| Path-scoped rules | `rules/*.md` with `paths:` globs | When Claude works with matching files |
| Subagents | `agents/{sdd,review,ops,discovery}/agt-*.md` | Delegated via the Agent tool |
| Skills | `skills/<name>/SKILL.md` → `/<name>` | On invocation (by you or by Claude) |
| Hooks + permissions | [settings.json](settings.json) + `hooks/*.py` | Enforced on every tool call |

## Orchestration

Broad request / end-to-end feature or bugfix / chain several agents → **`/orchestrate`** ([skill](skills/orchestrate/SKILL.md)): the main thread classifies intent, dispatches `agt-*` subagents, and enforces gates.

Obvious single-specialist request (PR only, Jira only, review only) → invoke that subagent directly.

## Rules index (`rules/`)

Naming: plain `kebab-case.md` for layer/subject rules; `meta-<kebab>.md` for meta rules. Convention: [meta-claude-rules.md](rules/meta-claude-rules.md).

| Rule | Loading | Focus |
|------|---------|-------|
| [business-rules-layers.md](rules/business-rules-layers.md) | always | Business rules in Service; forbidden in Repository and Controller |
| [git-no-ai-attribution.md](rules/git-no-ai-attribution.md) | always | Never add AI attribution to commits or PRs |
| [domain.md](rules/domain.md) | `src/domain/**` | Domain — interfaces, entities, repo/service contracts |
| [application.md](rules/application.md) | `src/application/**` | Application — thin Express controllers, error/auth pattern |
| [infraestructure.md](rules/infraestructure.md) | `src/infraestructure/**` | Infraestructure — Mongo `IM*`, adapters, repositories |
| [configuration.md](rules/configuration.md) | `src/configuration/**` | Configuration — dotenv, env, composition factories |
| [contracts-openapi.md](rules/contracts-openapi.md) | `src/contracts/**` | OpenAPI `service.yaml` aligned with the HTTP API |
| [naming-patterns.md](rules/naming-patterns.md) | `src/**/*.ts` | `I*` interfaces, Mongo `IM*` models, `E*` enums |
| [semantic-quality.md](rules/semantic-quality.md) | domain/application/contracts | Semantic naming, REST paths, OpenAPI schemas |
| [tests.md](rules/tests.md) | `src/__tests__/**`, `jest/**` | Jest — `when`/`should`, mock policy, coverage |
| [release.md](rules/release.md) | `release.config.js` | Release via semantic-release (not Changesets) |
| [meta-claude-rules.md](rules/meta-claude-rules.md) | `.claude/rules/**` | How to create and format rules |
| [meta-self-improve.md](rules/meta-self-improve.md) | `.claude/rules/**` | When and how to evolve rules |

Project core (spelling, layer boundaries, gates) lives in [CLAUDE.md](CLAUDE.md).

## Spec-Driven toolkit

| Need | Use |
|------|-----|
| Feature / bugfix end-to-end | **`/orchestrate`** (PO → gate → design → QA plan → dev → test-author → QA verify → …) |
| Write / refine requirements only | **`agt-product-owner`** |
| Technical design from approved requirements | **`agt-architecture`** |
| Test plan / acceptance / QA report vs spec | **`agt-quality-assurance`** (PLAN / VERIFY) |
| Create / extend Jest unit & integration tests | **`agt-test-author`** |
| Spec procedure (Specify → Design → Tasks) | **`/spec-driven`** |
| Templates / folder convention | [`docs/specs/`](../docs/specs/README.md) |

### Artifacts

| File | Owner | Purpose |
|------|-------|---------|
| `docs/specs/<slug>/requirements.md` | PO | What / why / acceptance |
| `docs/specs/<slug>/design.md` | Architecture | How (layers, contracts, compatibility) |
| `docs/specs/<slug>/tasks.md` | skill / tech | Implementable slices |
| `docs/specs/<slug>/test-plan.md` | QA (PLAN) | Criterion → test matrix, before dev |
| `docs/specs/<slug>/qa-report.md` | QA (VERIFY) | Evidence-based result (`PASS` / `PASS_WITH_RISKS` / `FAIL` / `BLOCKED`) |
| `src/__tests__/**` | Test author | Automated unit / integration suites |

### Gates

1. **Human approves** `requirements.md` before `agt-dev-backend` on new features.
2. Design and QA test plan come **before** implementation (shift-left); QA verify comes after.
3. QA failures return to **dev**, not to softened tests. `PASS_WITH_RISKS` requires explicit human risk acceptance.
4. Approval decisions are explicit: `APPROVED` / `CHANGES_REQUESTED` / `REJECTED` / `BLOCKED` — comments alone are not approval.
5. Trivial edits (rename/typo) skip the SDD pipeline.

## Agents index (`agents/`)

| Agent | Group | Read-only | Focus |
|-------|-------|-----------|--------|
| [agt-product-owner](agents/sdd/agt-product-owner.md) | sdd | no | Requirements / scope / AC (`docs/specs/**` only) |
| [agt-architecture](agents/sdd/agt-architecture.md) | sdd | no | `design.md` from approved requirements |
| [agt-quality-assurance](agents/sdd/agt-quality-assurance.md) | sdd | no | PLAN / AUTOMATE / VERIFY |
| [agt-test-author](agents/sdd/agt-test-author.md) | sdd | no | Jest unit + integration authoring |
| [agt-dev-backend](agents/sdd/agt-dev-backend.md) | sdd | no | Implement approved slices (layered Node/TS) |
| [agt-test-runner](agents/sdd/agt-test-runner.md) | sdd | no | Stabilize the Jest suite |
| [agt-verifier](agents/sdd/agt-verifier.md) | sdd | mostly | Delivery evidence gate |
| [agt-code-review](agents/review/agt-code-review.md) | review | yes | Spec ↔ code review, typed findings |
| [agt-architecture-review](agents/review/agt-architecture-review.md) | review | yes | Layer / coupling audit (post-code) |
| [agt-code-quality](agents/review/agt-code-quality.md) | review | yes | Naming + REST smoke + light layers |
| [agt-rest-endpoint-design](agents/review/agt-rest-endpoint-design.md) | review | yes | Endpoint inventory, YAML parity |
| [agt-naming-refactor](agents/review/agt-naming-refactor.md) | review | yes | Rename table by risk |
| [agt-github-workflow](agents/ops/agt-github-workflow.md) | ops | no | Atomic commits + PR (explicit request only) |
| [agt-jira-workflow](agents/ops/agt-jira-workflow.md) | ops | no | Jira read / create (org defaults) |
| [agt-architecture-probe](agents/discovery/agt-architecture-probe.md) | discovery | no | As-is architecture profile |
| [agt-pattern-miner](agents/discovery/agt-pattern-miner.md) | discovery | no | Pattern catalog with evidence |
| [agt-pattern-steward](agents/discovery/agt-pattern-steward.md) | discovery | gated | Proposals + rule drafts; rules after `APPROVED` |

## Skills index (`skills/`)

Directory name = command. Skills marked **manual** have `disable-model-invocation: true` (only you can invoke them).

### Spec-Driven / product

| Skill | Purpose |
|-------|---------|
| [/orchestrate](skills/orchestrate/SKILL.md) | Thin router for end-to-end delivery (main thread) |
| [/product-refinement](skills/product-refinement/SKILL.md) | Ambiguity, slicing, AC, DoR → `requirements.md` |
| [/spec-driven](skills/spec-driven/SKILL.md) | Specify → Design → Tasks checklist |
| [/technical-design](skills/technical-design/SKILL.md) | Approved requirements → `design.md` |
| [/quality-assurance](skills/quality-assurance/SKILL.md) | PLAN / VERIFY; route automation to test author |
| [/backend-implementation](skills/backend-implementation/SKILL.md) | Scope-safe implementation + DoD |
| [/code-review](skills/code-review/SKILL.md) | Spec ↔ code typed findings |

### Scaffold / implement (manual)

| Skill | When to use |
|-------|-------------|
| [/new-context](skills/new-context/SKILL.md) | New bounded context end-to-end |
| [/add-http-endpoint](skills/add-http-endpoint/SKILL.md) | New route in an existing context |
| [/mongo-persistence](skills/mongo-persistence/SKILL.md) | `IM*`, adapter, Read/Write repos |
| [/kafka-messaging](skills/kafka-messaging/SKILL.md) | Kafka producer/consumer (domain contract + infra) |
| [/domain-errors](skills/domain-errors/SKILL.md) | `EErrorCode`, catalog, translated HTTP errors |
| [/openapi-contract](skills/openapi-contract/SKILL.md) | Keep `service.yaml` aligned |
| [/tests-layered](skills/tests-layered/SKILL.md) | Jest unit/int layout; `when`/`should`; mock policy |

### Review / quality (manual, run in forked subagent)

| Skill | Purpose |
|-------|---------|
| [/review-naming](skills/review-naming/SKILL.md) | Identifier audit by layer (`context: fork` → `agt-naming-refactor`) |
| [/review-rest-endpoints](skills/review-rest-endpoints/SKILL.md) | Routes, verbs, YAML parity (fork → `agt-rest-endpoint-design`; + [reference-rest.md](skills/review-rest-endpoints/reference-rest.md)) |

### Discovery

| Skill | Purpose |
|-------|---------|
| [/architecture-discovery](skills/architecture-discovery/SKILL.md) | As-is profile, pattern mining, gated rule stewardship — see [ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md) |

### Ops (manual)

| Skill | Purpose |
|-------|---------|
| [/github-workflow](skills/github-workflow/SKILL.md) | Atomic commits + PR template (+ [reference.md](skills/github-workflow/reference.md) org defaults) |
| [/jira-workflow](skills/jira-workflow/SKILL.md) | Jira read/create (+ [reference.md](skills/jira-workflow/reference.md) org defaults) |

## Quality toolkit

| Need | Use |
|------|-----|
| Layer violations, Domain ↔ Infra coupling | `agt-architecture-review` |
| Task done? tests, wiring, YAML updated | `agt-verifier` |
| **Naming + REST + light layers (PR review)** | **`agt-code-quality`** |
| **REST/OpenAPI design only** | **`agt-rest-endpoint-design`** or `/review-rest-endpoints` |
| **Rename suggestions (read-only)** | **`agt-naming-refactor`** or `/review-naming` |

Map: rule → skill → agent:

```text
semantic-quality (rule)
  ├── review-naming (skill) ──► agt-naming-refactor
  └── review-rest-endpoints (skill) ──► agt-rest-endpoint-design
         └── agt-code-quality (combines both + light layers)
```

### Project conventions (quick)

- **Use case** = `UserService.createUser`, not `CreateUserUseCase` class.
- **DTO** = OpenAPI `components/schemas` (`NewUser`, `User`) + domain `IUser`.
- **REST reference** = resource-style routes such as `GET/POST /users`, `GET/PUT/DELETE /users/:id` in `src/application/controllers/<context>.controller.ts` (canonical example: `user`).
- **Folders** = `infraestructure`, `configuration` (fixed spelling).

### Unified review output

All quality agents and skills report with:

- `Summary`, `Passed`, `Failed` / `Issues`, `Verdict`
- Per issue: rule, full path, evidence snippet, fix, severity (`blocker` | `major` | `minor` | `info`)

## Safety net (settings.json)

- **PreToolUse hooks**: [hooks/block-sensitive-read.py](hooks/block-sensitive-read.py) (denies `.env*`, credentials, key files on Read/Edit/Write) and [hooks/block-destructive-shell.py](hooks/block-destructive-shell.py) (denies `rm -rf`, force push, `reset --hard`, prod kubectl, drop database, …).
- **permissions.deny**: declarative twin of the hooks for the common cases.
- **includeCoAuthoredBy: false**: no AI attribution trailers in commits/PRs.
- Service-local overrides: `.claude/settings.local.json` and `.claude/local/` survive kit syncs.

## Related docs

- [WORKFLOW.md](WORKFLOW.md) — full pipeline, gates, traceability
- [ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md) — agnostic probe / miner / steward
- [AGENTS.md](../AGENTS.md) — layered backend contract
- [docs/architecture-and-layers.md](../docs/architecture-and-layers.md) — architecture detail
- [docs/ADOPTION.md](../docs/ADOPTION.md) — how services adopt this kit
