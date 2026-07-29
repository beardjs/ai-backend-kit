# Tasks — <Feature title>

feature: <feature-slug>
status: Draft
version: 0.1.0
owner: Tech
jira: <KEY or N/A>
createdAt: <YYYY-MM-DD>
updatedAt: <YYYY-MM-DD>
approvedBy: N/A
approvedAt: N/A

Requirements: <path> (version <x.y.z>)
Design: <path or N/A>
Test plan: <path or N/A>

Ordered slices. Each task must be small, have an observable result, and trace
back to approved criteria. Do not use "implement feature" as a generic task.

## Overview

| ID | Task | Owner | Depends on | Status |
|----|------|-------|------------|--------|
| TASK-01 | … | backend | — | Pending |
| TASK-02 | … | backend | TASK-01 | Pending |

## Tasks

### TASK-01 — <observable result>

Traceability:
- AC-01
- BR-01
- TC-01

Owner:
- backend

Dependencies:
- none

Expected files/layers:
- Domain (`src/domain/<ctx>/…`)
- Infraestructure (`src/infraestructure/…`)

Completion check:
- <observable evidence, e.g. targeted test passing, contract updated>

### TASK-02 — <observable result>

Traceability:
- AC-01

Owner:
- backend

Dependencies:
- TASK-01

Expected files/layers:
- Application (`src/application/controllers/…`)
- Contracts (`src/contracts/service.yaml`)

Completion check:
- <observable evidence>

## Notes

- Prefer vertical slices (contract → entity/service → persistence → HTTP → tests).
- Include contract updates (OpenAPI), tests, and observability as explicit tasks when needed.
- Do not create behavior absent from the approved requirements; if blocked, stop and ask.

## Changelog

### 0.1.0 — <YYYY-MM-DD>

- Initial tasks
