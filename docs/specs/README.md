# Specs (Spec-Driven Development)

Versioned product/tech contracts for features and meaningful bugfixes. Chat is **not** the source of truth — these files are.

## Layout

```text
docs/specs/
  _templates/           # copy from here
  <feature-slug>/
    requirements.md     # PO — what / why / acceptance
    design.md           # architecture — layers, contracts, trade-offs
    tasks.md            # ordered implementable slices
    test-plan.md        # QA (PLAN) — criterion → test case matrix, before dev
    qa-report.md        # QA (VERIFY) — evidence-based result after dev
```

## When to create a spec

| Situation | Spec? |
|-----------|--------|
| New feature / endpoint / context | **Yes** — full set |
| Bugfix that changes HTTP/OpenAPI contract | **Yes** — at least `requirements.md` |
| Localized bug with clear criteria in the prompt | Optional; hotfix may skip PO |
| Rename / typo / one-line change | **No** |

## Workflow

1. **`agt-product-owner`** (or `@skill-spec-driven`) writes `requirements.md`.
2. **Human approves** the requirements (gate — explicit `APPROVED`).
3. **`agt-architecture`** writes `design.md` (+ `tasks.md` via skill / tech review).
4. **`agt-quality-assurance`** (PLAN mode) derives `test-plan.md` **before** development.
5. **`agt-dev-backend`** implements against `tasks.md`.
6. **`agt-test-runner`** stabilizes the suite.
7. **`agt-code-review`** compares spec ↔ code (blocking findings return to dev).
8. **`agt-quality-assurance`** (AUTOMATE + VERIFY) fills `qa-report.md`; does not weaken asserts.
9. Reviews + **`agt-verifier`**.

Index: [`.cursor/SPECS.md`](../../.cursor/SPECS.md). Templates: [`_templates/`](_templates/).

> In **st-cursor-backend** (this kit), only `_templates/` and this README live under `docs/specs/`. Feature folders (`docs/specs/<slug>/`) are created **inside each service** after adoption.

