---
name: skill-technical-design
description: >-
  Procedure to turn an approved requirements.md into a technical design.md for
  this layered Node.js/TypeScript repo: end-to-end analysis, layer placement,
  contracts, persistence, compatibility, idempotency, observability, rollout
  and rollback, with an explicit exit gate. Used by agt-architecture.
---

# Technical Design (this repo)

Converts an **approved** `docs/specs/<slug>/requirements.md` into
`docs/specs/<slug>/design.md` using
[`docs/specs/_templates/design.md`](../../../docs/specs/_templates/design.md).

The design answers **how**; it never redefines **what** (product behavior).

## Inputs

- Approved `requirements.md` (mandatory — stop if missing or unapproved)
- [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md)
- [AGENTS.md](../../../AGENTS.md)
- `src/contracts/service.yaml`
- Current code of the affected contexts (read-only evidence)
- Operational constraints known to the team

## Procedure

### 1. Trace requirements

1. List every `AC-*`, `BR-*`, `NFR-*` from the approved requirements.
2. For each one, decide how the design supports it.
3. Anything unsupported becomes an explicit open question or a blocker
   returned to the PO — never a silent reinterpretation.

### 2. Analyze end to end

Walk the full flow of the request or event and answer:

- Which contexts and services are affected?
- Which layers change (Domain / Application / Infraestructure /
  Configuration / Contracts)?
- Who owns the data?
- Which internal contracts change (`I*`, repository contracts, messaging
  contracts)?
- Which external contracts change (OpenAPI, Kafka events)?
- What persists and where (`IM*`, schema, adapter)?
- What happens on error, retry, and concurrent execution?
- What must be observable (logs, metrics) — without sensitive data?

### 3. Place responsibilities by layer

| Concern | Layer |
|---------|-------|
| Business rules, entities, `I*`, services, repo/messaging contracts, domain errors | Domain |
| Controller, `req`/`res`, middleware, HTTP error translation | Application |
| Schema/model `IM*`, concrete repository, adapter, concrete Kafka, clients | Infraestructure |
| Factories / composition | Configuration |
| OpenAPI `service.yaml` | Contracts |
| Tests | `src/__tests__` |

Forbidden designs: Domain importing Infraestructure; business rules in
controller/repository/adapter/factory; repository throwing product 404/409;
renaming `infraestructure` / `configuration`.

### 4. Answer compatibility explicitly (any data change)

- New field required or optional?
- Old records stay valid?
- Default value?
- Backfill needed?
- API may return absence?
- Old consumers tolerate the new payload?
- Index needed?
- Two-phase rollout?
- Safe rollback?

Write the answers in the design — never leave them implicit.

### 5. Fill `design.md`

Copy the template and complete: AC coverage map, flow, layer-by-layer plan,
contracts, persistence and compatibility, idempotency/concurrency,
observability, rollout/rollback, technical risks, open decisions, approval
block.

### 6. Exit gate (checklist)

- [ ] Every `AC-*` has technical support (or explicit blocker)
- [ ] No product rule redefined
- [ ] Data ownership clear
- [ ] Compatibility and migration answered
- [ ] Events and contracts defined
- [ ] Technical risks registered
- [ ] Test strategy viable (QA PLAN can start)
- [ ] Rollout / rollback covered when needed
- [ ] Approval requested (explicit `APPROVED`)

## Anti-patterns

- Designing before requirements approval
- Changing an `AC-*` "because it's easier to implement"
- Leaving compatibility of old records implicit
- Designing business rules into repository, controller, or factory
- Mixing design (this skill) with post-code audit (`agt-architecture-review`)

## References

- [agt-architecture](../../agents/agt-architecture.md)
- [design.md template](../../../docs/specs/_templates/design.md)
- [skill-spec-driven](../skill-spec-driven/SKILL.md)
- [rule.business-rules-layers.mdc](../../rules/rule.business-rules-layers.mdc)
