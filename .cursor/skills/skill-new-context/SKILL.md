---
name: skill-new-context
description: >-
  Step-by-step guide to add a new context (bounded context) to this repository:
  domain entity/repos/service, infra Mongo+adapter+repos, controller, factories and OpenAPI.
  Use when the user asks for a new resource, new module or scaffold similar to `user`.
disable-model-invocation: true
---

# Skill: new context

Read [AGENTS.md](../../../AGENTS.md) (sections 1–3 and 5–6) and [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) before generating files.

## Suggested order

1. **Domain** — `src/domain/<context>/`
   - `entity/interfaces/<context>.interface.ts` (`I*`)
   - `entity/<context>.entity.ts` (`*ServiceEntity` class with validation)
   - `repository/<context>.repository.read.ts` and `.write.ts` (`I*RepositoryRead` / `I*RepositoryWrite`)
   - `service/<context>.service.ts` (repo interfaces + entity only)

2. **Infraestructure** — `src/infraestructure/`
   - `db/mongo/interfaces/<context>.interface.ts` (`IM*` extends `I*`)
   - `db/mongo/schema/<context>.schema.ts`, `models/<context>.model.ts`
   - `repository/<context>/adapters/<context>.adapter.ts` (`dbToInternal`, `internalToDb`)
   - `repository/<context>/<context>.repository.read.ts` and `.write.ts` (implementations)

3. **Application** — `src/application/controllers/<context>.controller.ts` (thin, calls service)

4. **Configuration** — `src/configuration/factory/<context>.service.factory.ts`, `<context>.controller.factory.ts`; register controller in [src/app.ts](../../../src/app.ts) if needed

5. **Contracts** — update [src/contracts/service.yaml](../../../src/contracts/service.yaml) with paths and schemas

6. **Tests** — `src/__tests__/integration/` and `unit/` mirroring `user` as reference

## Related skills

Deepen partial flows without repeating this guide:

| Skill | When to use |
|-------|-------------|
| [skill-add-http-endpoint](../skill-add-http-endpoint/SKILL.md) | New HTTP route in an existing context |
| [skill-openapi-contract](../skill-openapi-contract/SKILL.md) | Sync `service.yaml` with routes and schemas |
| [skill-domain-errors](../skill-domain-errors/SKILL.md) | `EErrorCode`, `IThrowedError`, `ErrorCatalog`, `handleTranslatedError` |
| [skill-tests-layered](../skill-tests-layered/SKILL.md) | Integration/unit tests per layer |
| [skill-mongo-persistence](../skill-mongo-persistence/SKILL.md) | `IM*`, adapter, Read/Write repositories |
| [skill-kafka-messaging](../skill-kafka-messaging/SKILL.md) | Kafka producer/consumer |

## Final checklist

- [ ] Domain without imports from `infraestructure` or `mongoose`
- [ ] `IM*` only in infra; pure adapters
- [ ] Factories inject concrete implementations
- [ ] `yarn test` and `yarn lint` pass
