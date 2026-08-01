---
name: backend-implementation
description: Implement an approved Node.js/TypeScript backend slice safely within the layered architecture. Use for feature or bug-fix code after reading applicable specs and QA plans.
---

# Backend implementation

Read `AGENTS.md`, architecture docs, affected code, and applicable approved specs.

1. Domain interfaces, entities, repository contracts, and service rules.
2. Infraestructure models, schemas, adapters, repositories, and clients.
3. Thin Application controllers with translated error handling.
4. Configuration factories and bootstrap registration.
5. OpenAPI contract for every HTTP change.
6. Tests from approved scenarios.

Repositories own persistence and `DATABASE_ERROR`, services own 404/409 and
business rules, and controllers own HTTP translation. Make a minimal diff.
Before handoff, run relevant tests/lint and verify wiring and contract parity.
