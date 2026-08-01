---
name: spec-driven
description: >-
  Spec-Driven workflow for this repo: Specify → Design → Tasks → consistency
  checklist, writing under docs/specs/<slug>/. Use before implementing features
  or when refining ambiguous requirements. Pairs with agt-product-owner,
  agt-architecture, agt-quality-assurance, and agt-test-author.
---

# Spec-Driven Development (this repo)

Lightweight equivalent of Spec Kit phases **without** installing Spec Kit CLI. Artifacts live in `docs/specs/`.

## When to use

- New feature or contract-changing bugfix
- User asks to “spec this”, “write requirements”, or run SDD
- Orchestrator needs design/tasks after PO requirements

## Agents

| Phase | Agent / owner |
|-------|----------------|
| Specify (requirements) | `agt-product-owner` |
| Design | `agt-architecture` (+ `/technical-design`) |
| Tasks | this skill (+ human / light tech input) |
| Test plan (before dev) | `agt-quality-assurance` — PLAN |
| Implement | `agt-dev-backend` |
| Automate tests | `agt-test-author` |
| Code review | `agt-code-review` |
| QA report | `agt-quality-assurance` — VERIFY |
| Route all | `/orchestrate` (main thread) |

## Procedure

### 1. Specify

1. Pick kebab-case `feature-slug`.
2. Copy [`docs/specs/_templates/requirements.md`](../../../docs/specs/_templates/requirements.md) → `docs/specs/<slug>/requirements.md`.
3. Fill objective, actors, stories, **testable** AC, out of scope, risks, links.
4. **Human gate:** do not implement until requirements are approved.

### 2. Design

1. Copy [`design.md` template](../../../docs/specs/_templates/design.md).
2. List layers impacted (`domain` / `application` / `infraestructure` / `configuration` / `contracts`).
3. Document HTTP/event contracts and decisions.
4. Align with [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md): business rules in Service; no Domain→Infra imports.

### 3. Tasks

1. Copy [`tasks.md` template](../../../docs/specs/_templates/tasks.md).
2. Break into ordered slices; each maps to ≥1 AC.
3. Prefer vertical slices ending in a testable state.

### 4. Analyze (consistency checklist)

Before `agt-dev-backend`:

- [ ] Every AC appears in at least one task acceptance check
- [ ] Out of scope does not contradict tasks
- [ ] OpenAPI / events called out if HTTP or messaging changes
- [ ] No task invents requirements absent from `requirements.md`
- [ ] Folder spelling: `infraestructure`, `configuration`

### 5. Implement & QA (handoff)

1. `agt-quality-assurance` (PLAN) derives `test-plan.md` from approved requirements + design.
2. `agt-dev-backend` works task-by-task against `tasks.md` (reads `test-plan.md` as input).
3. `agt-test-author` automates the test plan under `src/__tests__/`.
4. `agt-test-runner` stabilizes the suite.
5. `agt-code-review` compares spec ↔ implementation; blocking findings return to dev.
6. `agt-quality-assurance` (VERIFY) writes `qa-report.md`.
7. `agt-verifier` checks delivery evidence.

## Anti-patterns

- Implementing before approved requirements
- Spec only in chat history
- Installing `specify` / `.specify` unless the team explicitly adopts Spec Kit later
- Use-case **classes** — in this repo a use case is a `*Service` method

## References

- [docs/specs/README.md](../../../docs/specs/README.md)
- [.claude/README.md](../../README.md)
- [agt-product-owner](../../agents/sdd/agt-product-owner.md)
- [agt-architecture](../../agents/sdd/agt-architecture.md)
- [agt-quality-assurance](../../agents/sdd/agt-quality-assurance.md)
- [agt-test-author](../../agents/sdd/agt-test-author.md)
- [orchestrate skill](../orchestrate/SKILL.md)
