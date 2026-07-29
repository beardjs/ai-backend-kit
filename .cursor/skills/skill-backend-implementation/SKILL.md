---
name: skill-backend-implementation
description: >-
  Scope-safe implementation procedure for approved specs in this repo: read
  requirements/design/tasks/test-plan, implement only the approved slice,
  route deviations to the correct owner (PO / architecture / QA), and apply
  the development Definition of Done before handing off to code review. Used
  by agt-dev-backend.
---

# Backend Implementation (spec-driven, this repo)

How `agt-dev-backend` implements an approved feature slice without expanding
scope or silently reinterpreting rules. Complements (does not replace) the
layer and naming rules in [agt-dev-backend](../../agents/agt-dev-backend.md).

## Required inputs

```text
docs/specs/<slug>/requirements.md (approved)
docs/specs/<slug>/design.md (approved, when the feature has one)
docs/specs/<slug>/tasks.md
docs/specs/<slug>/test-plan.md (QA PLAN output — read before coding)
AGENTS.md + docs/architecture-and-layers.md
```

Missing approved requirements on a feature → stop and report; do not invent
behavior.

## Implementation rules

- Implement **only** the approved slice; no new behavior without a decision.
- Respect the task order and each task's completion check.
- Keep traceability: reference `TASK-*` / `AC-*` in your progress notes.
- Controllers thin; business rules in Domain services; repositories return
  `null`; adapters pure; factories composition-only.
- Depend on repository/messaging **contracts** (`I*`), implement in
  Infraestructure.
- Keep `src/contracts/service.yaml` in sync with HTTP changes.
- Publish events only under the approved conditions.
- Deterministic tests; no sensitive data in logs; no secrets in code.
- Explicit compatibility for data changes (as decided in the design).
- No destructive calls to production or shared environments.

## Deviation routing

When you discover a gap during implementation, **do not resolve it by silent
inference**. Route it:

```text
Missing or ambiguous business rule      → agt-product-owner
Technical impossibility or risk         → agt-architecture
Untestable acceptance criterion         → agt-quality-assurance + agt-product-owner
Necessary change outside approved scope → agt-orchestrator + agt-product-owner
External dependency unavailable         → agt-orchestrator
```

Record every deviation in your handoff, even when resolved.

## Definition of Done (before code review)

- [ ] All tasks in scope completed (or explicitly reported as partial)
- [ ] Build runs
- [ ] Targeted tests pass
- [ ] `yarn lint` passes on touched code
- [ ] Type check passes
- [ ] `service.yaml` updated when the HTTP contract changed
- [ ] No unrelated changes in the diff
- [ ] Traceability updated (`TASK-*` status)
- [ ] Known limitations registered
- [ ] Logs/observability included when the design requires them
- [ ] No silent change to approved requirements

## Handoff

```md
Implementation result: COMPLETED | PARTIAL | BLOCKED
Feature slug: <slug>

Tasks:
- TASK-01: completed
- TASK-02: completed

Acceptance criteria implemented:
- AC-01

Files changed:
- <paths>

Commands:
- <command>: PASS | FAIL

Deviations:
- none | <routed to whom>

Risks:
- none | <list>

Next owner:
- agt-code-review
```

## References

- [agt-dev-backend](../../agents/agt-dev-backend.md)
- [skill-spec-driven](../skill-spec-driven/SKILL.md)
- [rule.business-rules-layers.mdc](../../rules/rule.business-rules-layers.mdc)
