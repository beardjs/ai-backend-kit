# Spec-Driven toolkit (Cursor)

Versioned specs + product/QA agents for **layered backend services** that adopt this kit. Complements implementation agents without replacing them.

## When to use what

| Need | Use |
|------|-----|
| Feature / bugfix end-to-end | **`agt-orchestrator`** (runs PO → gate → design → QA plan → dev → QA → …) |
| Write / refine requirements only | **`agt-product-owner`** |
| Technical design from approved requirements | **`agt-architecture`** |
| Test plan / acceptance / QA report vs spec | **`agt-quality-assurance`** (PLAN / AUTOMATE / VERIFY) |
| Spec procedure (Specify → Design → Tasks) | **`@skill-spec-driven`** |
| Templates / folder convention | [`docs/specs/`](../docs/specs/README.md) |

## Artifacts

| File | Owner | Purpose |
|------|-------|---------|
| `docs/specs/<slug>/requirements.md` | PO | What / why / acceptance |
| `docs/specs/<slug>/design.md` | Architecture | How (layers, contracts, compatibility) |
| `docs/specs/<slug>/tasks.md` | skill / tech | Implementable slices |
| `docs/specs/<slug>/test-plan.md` | QA (PLAN) | Criterion → test matrix, before dev |
| `docs/specs/<slug>/qa-report.md` | QA (VERIFY) | Evidence-based result (`PASS` / `PASS_WITH_RISKS` / `FAIL` / `BLOCKED`) |

## Agents

| Agent | Writes | Must not |
|-------|--------|----------|
| [agt-product-owner](agents/agt-product-owner.md) | `docs/specs/**` | Edit `src/` |
| [agt-architecture](agents/agt-architecture.md) | `docs/specs/<slug>/design.md` | Edit `src/`; redefine product rules |
| [agt-quality-assurance](agents/agt-quality-assurance.md) | `test-plan.md`, `qa-report.md` + tests under `src/__tests__` | Weaken asserts; “fix” prod to pass |
| [agt-code-review](agents/agt-code-review.md) | nothing (read-only findings) | Edit code; approve product scope |

## Skills

| Skill | Purpose |
|-------|---------|
| [skill-spec-driven](skills/skill-spec-driven/SKILL.md) | Specify → Design → Tasks → consistency checklist |
| [skill-technical-design](skills/skill-technical-design/SKILL.md) | Requirements → `design.md` (layers, contracts, rollout) |
| [skill-quality-assurance](skills/skill-quality-assurance/SKILL.md) | Test plan, automation, QA report |
| [skill-backend-implementation](skills/skill-backend-implementation/SKILL.md) | Scope-safe implementation + dev DoD |
| [skill-code-review](skills/skill-code-review/SKILL.md) | Spec ↔ code review with typed findings |

## Gates

1. **Human approves** `requirements.md` before `agt-dev-backend` on new features.
2. Design and QA test plan come **before** implementation (shift-left); QA verify comes after.
3. QA failures return to **dev**, not to softened tests. `PASS_WITH_RISKS` requires explicit human risk acceptance.
4. Approval decisions are explicit: `APPROVED` / `CHANGES_REQUESTED` / `REJECTED` / `BLOCKED` — comments alone are not approval.
5. Trivial edits (rename/typo) skip the SDD pipeline.

Related: [WORKFLOW.md](WORKFLOW.md) (fluxo completo), [QUALITY.md](QUALITY.md), [RULES.md](RULES.md), [AGENTS.md](../AGENTS.md).
