---
name: skill-add-http-endpoint
description: >-
  Adds an HTTP endpoint in an existing context: service method,
  thin controller route, factory if needed. Use when requesting a new route, new REST method,
  or HTTP operation without creating a new context/module (e.g. GET /users/by-email).
disable-model-invocation: true
---

# Skill: new HTTP endpoint (existing context)

Read [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§4 Application, §10) and use the `user` context as reference.

**Do not use** for a new context — see [skill-new-context](../skill-new-context/SKILL.md).

## Implementation order

1. **Domain — service**
   - Declare method in `src/domain/<context>/interfaces/<context>.service.interface.ts`.
   - Implement in `src/domain/<context>/service/<context>.service.ts`: business rules, `*ServiceEntity`, `IThrowedError` + `EErrorCode` (see [skill-domain-errors](../skill-domain-errors/SKILL.md)).
   - Reference: [`user.service.ts`](../../../src/domain/user/service/user.service.ts).

2. **Repository (if new data is needed)**
   - Extend `I*RepositoryRead` / `I*RepositoryWrite` in the domain.
   - Implement in infra — see [skill-mongo-persistence](../skill-mongo-persistence/SKILL.md).

3. **Application — controller**
   - Register route in `initRoutes()` of `src/application/controllers/<context>.controller.ts`.
   - Thin handler: extract `params` / `body` / `query` → call service → `res.status(...).json(...)`.
   - `try/catch` with `handleTranslatedError(error, ErrorCatalog, res)`.
   - Reference: [`user.controller.ts`](../../../src/application/controllers/user.controller.ts).

4. **Configuration — factory**
   - Change `src/configuration/factory/<context>.service.factory.ts` **only** if the service gains new constructor dependencies.

5. **Contract and tests**
   - OpenAPI: [skill-openapi-contract](../skill-openapi-contract/SKILL.md).
   - Tests: [skill-tests-layered](../skill-tests-layered/SKILL.md).

## HTTP status (guidance)

| Situation | Status |
|----------|--------|
| Successful read | 200 |
| Creation | 201 |
| Business conflict (e.g. duplicate email) | 409 (service) |
| Resource not found | 404 (service) |
| Database error | 500 (repository) |

## Anti-patterns

- Uniqueness logic, business validation, or Mongo queries in the controller.
- Instantiating `*RepositoryRead` / `*RepositoryWrite` in the controller (use factory).
- Manually translating errors in the controller (use `handleTranslatedError`).

## Checklist

- [ ] Service contains rules; controller only orchestrates HTTP
- [ ] `service.yaml` updated
- [ ] Controller and service tests (at least happy path + main error)
- [ ] `yarn test` and `yarn lint` pass
