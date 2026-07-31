---
name: product-refinement
description: Convert a vague feature, incident, or behavior change into versioned, traceable, testable requirements under docs/specs. Use before design or implementation when product intent is incomplete.
---

# Product refinement

Read `AGENTS.md`, existing feature specs, and the requirements template.

1. Normalize the problem, actor, desired outcome, constraints, and current behavior.
2. Separate facts, assumptions, open questions, risks, and out-of-scope items.
3. Slice the smallest independently valuable behavior; do not design implementation.
4. Use stable identifiers: `OBJ-*`, `ACT-*`, `US-*`, `BR-*`, `FLOW-*`,
   `AC-*`, `NFR-*`, `ASM-*`, `RQ-*`, `RISK-*`, and `METRIC-*`.
5. Write observable Given/When/Then acceptance criteria, including negative and
   authorization cases where relevant.
6. Preserve metadata and version history when updating a spec.
7. Finish with Definition of Ready and request `APPROVED`, `CHANGES_REQUESTED`,
   `REJECTED`, or `BLOCKED`.

Never infer a material product rule from code or choose libraries, schemas, or
layer placement on behalf of architecture.
