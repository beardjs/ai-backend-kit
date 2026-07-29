---
name: skill-openapi-contract
description: >-
  Syncs src/contracts/service.yaml with Express routes and payloads in this repository.
  Use when changing path, HTTP method, request/response, OpenAPI schemas or documenting
  API error codes (404, 409, 500, auth).
disable-model-invocation: true
---

# Skill: OpenAPI contract (`service.yaml`)

Read [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§7) and [AGENTS.md](../../../AGENTS.md) (contribution checklist).

`Server` validates the API with `express-openapi-validator` — paths and schemas must match the code.

## Steps

1. **Mirror routes**
   - Every route in the controller `initRoutes()` must exist under `paths` in the YAML.
   - Compare [`user.controller.ts`](../../../src/application/controllers/user.controller.ts) with `paths` in [`service.yaml`](../../../src/contracts/service.yaml) (`/users`, `/users/{id}`, etc.).

2. **Methods and parameters**
   - `get` / `post` / `put` / `delete` aligned with Express.
   - `parameters`: path (`id`), query, headers (e.g. auth when `authorizeByGroup` is on the route).
   - `requestBody` with `$ref` to schema in `components/schemas` for POST/PUT.

3. **Responses**
   - Success: status + schema (`User`, array of `User`, etc.) aligned with domain `I*`.
   - Business errors documented per service:
     - `404` — `RESOURCE_NOT_FOUND`
     - `409` — `RESOURCE_CONFLICT`
     - `500` — `DATABASE_ERROR` / generic `Error`
   - Routes with `authorizeByGroup`: include `400` and `403` with `AuthMiddlewareError` (see GET `/users` in YAML).

4. **Schemas in `components/schemas`**
   - Reuse `$ref` (`User`, `NewUser`, `Error`, `AuthMiddlewareError`).
   - New domain fields → update corresponding schema (types, `required`, date formats).

5. **Tags and metadata**
   - Group by resource (e.g. tag `Users`) to keep YAML readable.

## Checklist

- [ ] Path and verb in controller = path and verb in YAML
- [ ] Documented body/query match what the controller extracts from `req`
- [ ] Error codes thrown by the service have documented response
- [ ] Controller integration tests pass (`yarn test`)

## Related skills

- New endpoint: [skill-add-http-endpoint](../skill-add-http-endpoint/SKILL.md)
- i18n errors: [skill-domain-errors](../skill-domain-errors/SKILL.md)
