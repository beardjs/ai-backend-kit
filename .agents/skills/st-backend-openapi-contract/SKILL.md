---
name: openapi-contract
description: Keep src/contracts/service.yaml aligned with Express routes, inputs, responses, schemas, errors, and authorization. Use whenever the HTTP API changes.
---

# OpenAPI contract

Compare controller route registration and `service.yaml` bidirectionally.

- Match paths, HTTP methods, path/query/header parameters, and authorization.
- Reference request bodies and response schemas with required fields aligned to code.
- Use semantic schemas such as `NewUser`, `User`, and `UpdateUser`, not generic DTO names.
- Document success and material 400/403/404/409/500 responses.
- Keep collection/item paths and status codes consistent with the controller/service behavior.
- Run available OpenAPI validation and controller integration tests.

Every route must exist in both code and YAML in the same change.
