---
name: code-review
description: >-
  Procedure for spec-aware code review in this repo: compare requirements ↔
  design ↔ tasks ↔ implementation ↔ tests, classify findings with typed
  categories, separate functional defects from architecture findings, and
  produce an explicit verdict. Used by agt-code-review.
---

# Code Review (spec-aware, this repo)

Reviews a change **against its approved spec**, not against personal taste.

## Inputs

- `docs/specs/<slug>/requirements.md` (approved), `design.md`, `tasks.md`,
  `test-plan.md` when present
- The implementation diff (branch changes or uncommitted changes)
- Tests under `src/__tests__`

Stop and report when there is no spec for a feature-scoped change — a review
without approved criteria can only produce `QUESTION`s.

## Procedure

### 1. Load the chain

1. List `AC-*`, `BR-*`, `NFR-*` from requirements.
2. List design decisions (layers, contracts, compatibility).
3. List `TASK-*` and their completion checks.

### 2. Map the diff

For each changed file, note: layer, related task, related AC. Flag files with
no relation to any task as potential scope creep.

### 3. Review per dimension

1. **Correctness** — each AC behaviorally satisfied? Each BR preserved?
2. **Design adherence** — implementation matches approved layer placement,
   contracts, ownership?
3. **Layer boundaries** — run the architecture checklist (below).
4. **Scope** — no new behavior absent from requirements.
5. **Contract** — `src/contracts/service.yaml` in sync with HTTP changes.
6. **Security** — authorization enforced, no sensitive data in logs, no secrets.
7. **Compatibility** — old records/consumers still work as designed.
8. **Tests** — changed behavior covered; asserts meaningful; no weakened tests.

### 4. Architecture checklist

- [ ] Domain does not import Infraestructure (`mongoose`, `IM*`, concrete Kafka)
- [ ] Controller thin — no rules, no `*Model`
- [ ] Repository returns `null` (no product 404/409)
- [ ] Adapters pure
- [ ] Factory composition-only
- [ ] `IM*` confined to Infraestructure
- [ ] Error flow uses `handleTranslatedError` + `ErrorCatalog`
- [ ] Folders `infraestructure` / `configuration` untouched

### 5. Classify findings

One category per finding:

`BLOCKING_FUNCTIONAL` | `BLOCKING_ARCHITECTURE` | `BLOCKING_SECURITY` |
`BLOCKING_CONTRACT` | `NON_BLOCKING_IMPROVEMENT` | `STYLE` | `QUESTION`

Rules:

- Every finding: category, full path, minimal evidence snippet, related
  `AC-*`/rule, concrete fix suggestion.
- Functional defect ≠ architecture finding — report both separately when they
  coexist on the same code.
- Personal preference is `STYLE`, never blocking.

### 6. Verdict

- `APPROVED` — zero blocking findings
- `CHANGES_REQUESTED` — at least one blocking finding (list owners)
- `BLOCKED` — spec missing/ambiguous, or diff cannot be evaluated

Use the handoff format defined in
[agt-code-review](../../agents/review/agt-code-review.md).

## Anti-patterns

- Approving "on trust" without reading the requirements
- Blocking on style
- Fixing the code yourself (read-only role)
- Re-checking every naming/REST detail already covered by
  `agt-code-quality` / `agt-architecture-review` — reference them instead
- Treating comments as approval — only explicit `APPROVED` counts

## References

- [agt-code-review](../../agents/review/agt-code-review.md)
- [business-rules-layers.md](../../rules/business-rules-layers.md)
- [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md)
