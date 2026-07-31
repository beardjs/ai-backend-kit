---
name: technical-design
description: Turn approved requirements into a decision-complete layered backend design and traceable tasks. Use for design.md after the product gate, before coding.
---

# Technical design

Require approved requirements. Read `AGENTS.md`, architecture docs, affected
code, and the design/tasks templates.

1. Trace every `AC-*`, `BR-*`, and meaningful `NFR-*` into the design.
2. Describe entrypoints and end-to-end data flow.
3. Place responsibilities in Domain, Application, Infraestructure, and Configuration.
4. Define interfaces, payload changes, validation ownership, errors, idempotency,
   and transaction boundaries.
5. State compatibility, migration, rollout, rollback, and observability decisions
   when persistence or contracts change.
6. Produce `design.md` and ordered `tasks.md`, mapped to acceptance/test IDs.
7. Stop at the technical approval gate.

Never edit `src/**`, broaden scope, or replace a product decision with an assumption.
