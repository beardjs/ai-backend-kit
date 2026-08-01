---
name: quality-assurance
description: Create traceable test plans before code and verify delivered behavior afterward. Use for QA PLAN, QA VERIFY, acceptance evidence, regression checks, or qa-report.md.
---

# Quality assurance

## PLAN

Require approved requirements/design, map every acceptance criterion to `TC-*`
with P0-P3 priority, cover positive/negative/authorization/boundary/failure
behavior, and write `test-plan.md` before development.

## VERIFY

Confirm the approved version, run the repository's real test/coverage/lint/contract
commands, inspect architecture and wiring, and write reproducible evidence in
`qa-report.md`. Return `PASS`, `PASS_WITH_RISKS`, `FAIL`, or `BLOCKED`.

Never alter production behavior to satisfy a test, weaken assertions, or treat
coverage percentage alone as product acceptance.
