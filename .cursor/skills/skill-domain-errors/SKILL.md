---
name: skill-domain-errors
description: >-
  Standardizes translated HTTP errors in this repository: EErrorCode, IThrowedError in service,
  ErrorCatalog i18n, handleTranslatedError in controller, DATABASE_ERROR in repository.
  Use when adding error code, 404/409/500 or pt-BR/en/es API messages.
disable-model-invocation: true
---

# Skill: domain errors and translated HTTP response

Read [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§3.3, §4.2).

## Golden rule

| Layer | Does | Does not |
|--------|-----|---------|
| **Repository** | Returns `null` if not found; on DB failure throws `DATABASE_ERROR` (500) | Throw product 404 |
| **Service** | Interprets `null`, validates rules; throws 404/409 with `EErrorCode` | Access `AppointmentModel` / Mongo |
| **Controller** | `handleTranslatedError(error, ErrorCatalog, res)` | Translate messages manually |

## Flow for a new error code

1. **Enum** — add value in [`EErrorCode.ts`](../../../src/domain/common/errors/enums/EErrorCode.ts).

2. **i18n catalog** — entry in [`error-catalog.ts`](../../../src/infraestructure/i18n/error-catalog.ts) with `pt-BR`, `en`, `es`.

3. **Service** — throw object typed as `IThrowedError`:

```ts
throw {
  status: 404,
  errorCode: EErrorCode.RESOURCE_NOT_FOUND,
  message: 'User not found',
  details: { id },
} as IThrowedError;
```

Reference: [`user.service.ts`](../../../src/domain/user/service/user.service.ts) (409 conflict, 404 not found).

4. **Repository** — in Mongo operation `catch`:

```ts
serviceLogErrorHandler(error, { eventName: '...', eventData: { ... } });
throw { status: 500, errorCode: EErrorCode.DATABASE_ERROR } as IThrowedError;
```

Reference: [`user.repository.read.ts`](../../../src/infraestructure/repository/user/user.repository.read.ts).

5. **Controller** — import `ErrorCatalog` and use in all handlers:

```ts
} catch (error) {
  handleTranslatedError(error, ErrorCatalog, res);
}
```

Reference: [`user.controller.ts`](../../../src/application/controllers/user.controller.ts).

## Tests

- Service: `rejects.toMatchObject({ status, errorCode, details })` and `expect(ErrorCatalog[EErrorCode.*]).toBeDefined()`.
- Controller: assert body with `code` / translated message when applicable.
- Reference: [`create-user.int.test.ts`](../../../src/__tests__/integration/user/service/create-user.int.test.ts).

## Checklist

- [ ] New `EErrorCode` + entry in `ErrorCatalog`
- [ ] 404/409 only in service; repo returns `null`
- [ ] Controller without business logic in errors
- [ ] OpenAPI updated if exposing new code (see [skill-openapi-contract](../skill-openapi-contract/SKILL.md))
