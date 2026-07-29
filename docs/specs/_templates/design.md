# Design — <Feature title>

feature: <feature-slug>
status: Draft
version: 0.1.0
owner: Architecture
jira: <KEY or N/A>
createdAt: <YYYY-MM-DD>
updatedAt: <YYYY-MM-DD>
approvedBy: N/A
approvedAt: N/A

Requirements: <path> (version <x.y.z>)

## Context

Short pointer to `requirements.md` and current code (e.g. `user` context as reference).

## Requirements coverage

Every approved `AC-*` / `NFR-*` must be technically supported (or explicitly blocked).

| Requirement | Technical support | Notes |
|-------------|-------------------|-------|
| AC-01 | <layer / component / decision> | |
| NFR-01 | <how it is met> | |

## End-to-end flow

1. <request or event enters>
2. <layer-by-layer path>
3. <persistence / event / response>

## Layers impacted

| Layer | Paths / artifacts | Change |
|-------|-------------------|--------|
| Domain | `src/domain/<ctx>/…` | entity / service / repo contracts |
| Application | `src/application/controllers/…` | HTTP handlers |
| Infraestructure | `src/infraestructure/…` | Mongo / adapters / messaging |
| Configuration | `src/configuration/factory/…` | factories |
| Contracts | `src/contracts/service.yaml` | OpenAPI |

## Data ownership

- Owning context/service: <who owns the data>
- Consumers: <who reads it>

## HTTP / event contracts

- Routes, methods, request/response shapes.
- Kafka message types (if any) — interface in Domain, implementation in Infraestructure.

## Persistence, compatibility and migration

Answer explicitly for any data change:

- New field required or optional?
- Old records stay valid?
- Default value?
- Backfill needed?
- API may return absence?
- Old consumers tolerate the new payload?
- Index needed?
- Two-phase rollout?
- Safe rollback?

## Idempotency and concurrency

- Repeated request/event behavior:
- Concurrent execution behavior:

## Observability

- Logs (no sensitive data):
- Metrics / alerts:

## Rollout and rollback

- Rollout strategy: <direct | two-phase | feature flag | N/A>
- Rollback strategy:

## Technical risks

### TRISK-01 — <risk title>

- Impact:
- Mitigation:

## Decisions

| Decision | Chosen | Rejected alternatives |
|----------|--------|------------------------|
| … | … | … |

## Open technical decisions

- none | <decision needed and owner>

## Questions returned to PO

- none | <requirement conflict or infeasibility>

## Must not do without asking

- e.g. public contract break, new env vars, production-only paths.

## Alignment

- Follow [docs/architecture-and-layers.md](../../architecture-and-layers.md) and [AGENTS.md](../../../AGENTS.md).
- Business rules in **Service**; repositories return `null` (no 404/409).
- Domain must not import Infraestructure (no Mongoose, `IM*`, concrete Kafka).

## Approval

- Status: PENDING | APPROVED | CHANGES_REQUESTED | REJECTED | BLOCKED
- Approved by: <name or N/A>
- Date: <YYYY-MM-DD or N/A>
- Approved version: <x.y.z or N/A>
- Conditions: none | <list>

## Changelog

### 0.1.0 — <YYYY-MM-DD>

- Initial design
