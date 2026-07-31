---
name: tests-layered
description: Create or stabilize Jest unit and integration tests for layered services. Use after behavior changes, for regression coverage, test failures, or coverage gaps.
---

# Layered tests

Mirror contexts under `src/__tests__` and use `*.unit.test.ts` / `*.int.test.ts`.

- Every suite uses `describe('when ...')`; every case uses `it('should ...')`.
- Cover success, invalid input, missing resources, conflicts, dependencies, and
  persistence failures appropriate to the layer.
- Service tests use real in-memory/repository implementations when the project
  pattern requires it; do not replace repositories with broad mocks.
- Use `jest.spyOn` for external services, Kafka, auth, clocks, and unstable boundaries.
- Controller tests verify status, payload, validation, auth, and translated errors.
- Repository tests verify adaptation, null-on-missing, queries, and `DATABASE_ERROR`.

Run the narrowest suite first, then broader regression/coverage. Diagnose root
cause before editing and never weaken an assertion to obtain green output.
