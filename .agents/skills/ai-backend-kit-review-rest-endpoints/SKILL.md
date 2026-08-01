---
name: review-rest-endpoints
description: Audit Express routes and OpenAPI for REST semantics, status codes, filters, schemas, and controller-service parity. Use for API review or endpoint redesign.
---

# REST endpoint review

- Use plural kebab-case resources and collection/item paths.
- Use GET/POST/PUT/PATCH/DELETE by HTTP semantics; avoid action verbs in paths.
- Prefer query parameters for filters over `/by-*` routes unless explicitly required.
- Verify controller registration and `service.yaml` match in both directions.
- Check request/response schemas, status codes, authorization, and translated errors.
- Confirm controllers remain thin and services own product rules.

Return an endpoint inventory, passed checks, severity-ranked issues, suggested
design only where needed, and a verdict. Do not edit in review mode.
