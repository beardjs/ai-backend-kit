---
name: domain-errors
description: Add translated backend errors using EErrorCode, IThrowedError, catalogs, and controller translation. Use for 404, 409, 500, localization, or new error codes.
---

# Domain errors

1. Add an `EErrorCode` value in the shared/domain error enum.
2. Add catalog entries in every supported language with stable interpolation keys.
3. Throw typed product errors from the service for not-found, conflict, and business rules.
4. Return `null` from repositories when missing; catch database failures and throw `DATABASE_ERROR`.
5. Let controllers call `handleTranslatedError`; never translate manually.
6. Cover service error selection, repository database mapping, language headers,
   status codes, and response payloads.

Do not leak database messages or move product errors into repositories.
