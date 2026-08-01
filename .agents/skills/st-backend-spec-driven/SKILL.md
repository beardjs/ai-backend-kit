---
name: spec-driven
description: Orchestrate requirements-to-delivery for features, contract changes, and non-trivial bug fixes. Use when work needs product, design, QA, implementation, and verification gates.
---

# Spec-driven delivery

Choose the smallest path:

- Tiny clear fix: implement, targeted test, verify.
- Feature/contract change: requirements -> approval -> design/tasks -> QA PLAN
  -> implementation -> tests -> review -> QA VERIFY.
- Specialist request: invoke only that specialist.
- Architecture discovery: only for a divergent repository or explicit request.

Artifacts live in `docs/specs/<feature-slug>/`. Preserve metadata and traceability
from `AC-*` through `TC-*`, `TASK-*`, tests, and QA evidence.

Never cross an implicit gate. Decisions are `APPROVED`, `CHANGES_REQUESTED`,
`REJECTED`, or `BLOCKED`. GitHub/Jira mutations require explicit requests.
