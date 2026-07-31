---
name: add-http-endpoint
description: Add an Express endpoint to an existing bounded context while preserving layered ownership and OpenAPI parity. Use for new routes, methods, request bodies, query parameters, or responses.
---

# Add HTTP endpoint

1. Confirm behavior and status codes in approved requirements.
2. Add/update the domain service method and repository contracts when needed.
3. Implement persistence only in Infraestructure and wire it through factories.
4. Add a thin controller route: extract request data, call the service, return
   status/JSON, and delegate failures to translated error handling.
5. Register a new controller in `src/app.ts` when applicable.
6. Update `src/contracts/service.yaml` in the same change.
7. Add unit/integration coverage for success, validation, authorization, missing
   resources, conflicts, and database errors as relevant.

Use plural kebab-case resource paths and HTTP verbs, not action names in URLs.
