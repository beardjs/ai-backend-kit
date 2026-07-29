---
name: skill-mongo-persistence
description: >-
  Extends Mongo persistence in this repository: IM*, schema, model, adapter dbToInternal/
  internalToDb, Read/Write repositories (CQRS). Use for new field, repo method or schema
  without creating a full context.
disable-model-invocation: true
---

# Skill: Mongo persistence (light CQRS)

Read [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§5) and [AGENTS.md](../../../AGENTS.md) (`IM*` pattern).

**Do not use** for a brand-new context from scratch — see [skill-new-context](../skill-new-context/SKILL.md).

## Order (contract first)

1. **Domain**
   - Update `I*` in `entity/interfaces/`.
   - New methods on `I*RepositoryRead` and/or `I*RepositoryWrite` (read vs write separated).

2. **Infraestructure — model**
   - `IM*` extends `I*` + `_id`, `updatedAt` (in `db/mongo/interfaces/` or in `models/<context>.model.ts`, as in [`user.model.ts`](../../../src/infraestructure/db/mongo/models/user.model.ts)).
   - `schema/<context>.schema.ts` with `Schema<IM*>`.
   - `models/<context>.model.ts` with `model<IM*>`.

3. **Adapter** (pure functions, no side effects)
   - `dbToInternal(im): I*`
   - `internalToDb(i): Omit<IM*, '_id' | 'createdAt' | 'updatedAt'>`
   - Reference: [`user.adapter.ts`](../../../src/infraestructure/repository/user/adapters/user.adapter.ts).

4. **Repositories**
   - **Read:** `findOne` / `find` → `doc ? dbToInternal(doc) : null`.
   - **Write:** `create` / `update` / `delete` with `internalToDb` on payload.
   - Reference: [`user.repository.read.ts`](../../../src/infraestructure/repository/user/user.repository.read.ts), [`user.repository.write.ts`](../../../src/infraestructure/repository/user/user.repository.write.ts).

5. **DB errors** — see [skill-domain-errors](../skill-domain-errors/SKILL.md) (`DATABASE_ERROR`, `serviceLogErrorHandler`).

## Allowed / not allowed (repository)

| Allowed | Not allowed |
|------|----------|
| CRUD + `dbToInternal` | Rule "not found → 404" (service decides) |
| Return `null` | Expose `IM*` to controller or domain |
| Throw 500 on Mongo failure | Import service or controller |

## Diagram (summary)

```text
I* (domain) ←── dbToInternal ── IMAppointment (Mongo doc)
I* ── internalToDb ──→ persistable payload (without _id/timestamps managed by schema)
```

## Checklist

- [ ] Read/Write contracts in domain updated before infra
- [ ] Adapter maps all new fields
- [ ] Read methods only in Read; write only in Write
- [ ] Tests in `repository/read` and `repository/write`
- [ ] Domain still has no imports from `mongoose` or `infraestructure`
