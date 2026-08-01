# Code quality toolkit (Cursor)

Semantic naming, REST design, and light quality audits for **layered backend services**. Complements layer/architecture agents without duplicating them.

## When to use what

| Need | Use |
|------|-----|
| Feature / bugfix end-to-end, or “which agents?” | **`agt-orchestrator`** |
| Requirements / acceptance specs | **[`SPECS.md`](SPECS.md)** → `agt-product-owner` / `agt-quality-assurance` |
| Layer violations, Domain ↔ Infra coupling | `agt-architecture-review` |
| Task done? tests, wiring, YAML updated | `agt-verifier` |
| Implement a feature (single specialist) | `agt-dev-backend` |
| **Naming + REST + light layers (PR review)** | **`agt-code-quality`** |
| **REST/OpenAPI design only** | **`agt-rest-endpoint-design`** |
| **Rename suggestions (read-only)** | **`agt-naming-refactor`** |

Invoke agents by name in chat or via the agent picker. Skills: `@skill-review-rest-endpoints`, `@skill-review-naming`, `@skill-spec-driven`. Full skill map (including scaffold skills): [SKILLS.md](SKILLS.md).

Multi-step delivery (PO → gate → design → QA plan → implement → test → code review → QA verify → reviews → verify → optional PR): use [`agt-orchestrator`](agents/agt-orchestrator.md). Specs: [SPECS.md](SPECS.md).

## Rules (always-on context)

| Rule | Focus |
|------|--------|
| [rule.semantic-quality.mdc](rules/rule.semantic-quality.mdc) | Variables, methods, files, REST summary, OpenAPI schemas |
| [rule.naming-patterns.mdc](rules/rule.naming-patterns.mdc) | `I*`, `IM*`, `E*` prefixes |
| [rule.business-rules-layers.mdc](rules/rule.business-rules-layers.mdc) | Service vs repository vs controller |

## Skills (explicit workflows)

| Skill | Purpose |
|-------|---------|
| [skill-review-rest-endpoints](skills/skill-review-rest-endpoints/SKILL.md) | Audit routes, verbs, query, YAML parity |
| [skill-review-naming](skills/skill-review-naming/SKILL.md) | Audit identifiers by layer |
| [skill-add-http-endpoint](skills/skill-add-http-endpoint/SKILL.md) | **Implement** new route (not review) |
| [skill-openapi-contract](skills/skill-openapi-contract/SKILL.md) | Sync `service.yaml` after changes |

REST status reference: [skill-review-rest-endpoints/reference-rest.md](skills/skill-review-rest-endpoints/reference-rest.md).

## Agents (this kit)

| Agent | Read-only | Focus |
|-------|-----------|--------|
| [agt-code-quality](agents/agt-code-quality.md) | yes | Naming + REST smoke + light layers |
| [agt-rest-endpoint-design](agents/agt-rest-endpoint-design.md) | yes | Endpoint inventory, YAML, anti-patterns |
| [agt-naming-refactor](agents/agt-naming-refactor.md) | yes | Rename table by risk |

## Map: rule → skill → agent

```text
rule.semantic-quality
  ├── skill-review-naming ──► agt-naming-refactor
  └── skill-review-rest-endpoints ──► agt-rest-endpoint-design
         └── agt-code-quality (combines both + light layers)
```

## Project conventions (quick)

- **Use case** = `UserService.createUser`, not `CreateUserUseCase` class.
- **DTO** = OpenAPI `components/schemas` (`NewUser`, `User`) + domain `IUser`.
- **REST reference** = resource-style routes such as `GET/POST /users`, `GET/PUT/DELETE /users/:id` in `src/application/controllers/<context>.controller.ts` (canonical example: `user`).
- **Folders** = `infraestructure`, `configuration` (fixed spelling).
- **Rule naming** = `rule.<kebab>.mdc` for layers, `meta.<kebab>.mdc` for meta; see [meta.cursor-rules.mdc](rules/meta.cursor-rules.mdc). Rules index: [RULES.md](RULES.md).

## Unified review output

All quality agents and skills report with:

- `Summary`, `Passed`, `Failed` / `Issues`, `Verdict`
- Per issue: rule, full path, evidence snippet, fix, severity (`blocker` | `major` | `minor` | `info`)

Architecture docs: [docs/architecture-and-layers.md](../docs/architecture-and-layers.md), [AGENTS.md](../AGENTS.md).
