# OWASP reference — risk, layer, evidence

Use with [SKILL.md](SKILL.md). Maps OWASP Top 10 (2021) and OWASP API Security Top 10 (2023) to the layer that owns the control in this kit.

| OWASP | Risk | Owning layer | What it looks like here |
|-------|------|--------------|-------------------------|
| API1 / A01 | Broken object-level authorization | Domain (Service) | `getUserById(req.params.id)` returns any record to any authenticated caller |
| API2 / A07 | Broken authentication | Application | Route without `authorizeByGroup`; token accepted from a query string |
| API3 | Broken object property level authorization | Application → Domain | `...req.body` into an entity; response exposing internal fields |
| API4 | Unrestricted resource consumption | Domain + Application | `find({})` with no pagination; no max page size; no body size limit |
| API5 | Broken function level authorization | Application | Admin-only handler guarded with a broader group |
| A03 | Injection | Infraestructure | `req.query` object inside a Mongoose filter; `$where`; regex from user input |
| A02 | Cryptographic / data exposure | Configuration + Infraestructure | Secrets in code; PII or tokens logged; sensitive field returned unmasked |
| A05 | Security misconfiguration | Configuration | Scattered `process.env`; `.env` committed; permissive CORS |
| A06 | Vulnerable components | Repo root | Unjustified dependency; lockfile drift |
| A09 | Logging failures | Application + Infraestructure | No log for an authorization denial; or the opposite — secrets in logs |
| A10 / API7 | SSRF | Infraestructure (clients) | Outbound URL built from request data; no timeout |

## Grep hints

Run these against the changed scope, then read each hit in context — a hit is a lead, not a finding.

| Looking for | Pattern |
|-------------|---------|
| Unguarded routes | `this.router.(get\|post\|put\|patch\|delete)\(` then check for `authorizeByGroup` on the same line |
| Mass assignment | `\.\.\.req\.(body\|query\|params)` |
| Raw request in a query | `find(One)?\(\{[^}]*req\.` |
| Mongo operator injection | `\$where\|\$function\|\$accumulator` |
| Regex from input | `new RegExp\(` |
| Secrets | `process\.env` outside `src/configuration`, `password\|secret\|token\|apiKey` assigned a literal |
| Sensitive logging | `logger\.\|console\.` on the same statement as `password\|token\|authorization\|cpf\|email` |
| Error leakage | `error\.message\|error\.stack` inside a `res.status(...).json(` |
| Outbound calls | `axios\|fetch\|http.request` — check the URL source and `timeout` |
| TLS disabled | `rejectUnauthorized\s*:\s*false\|NODE_TLS_REJECT_UNAUTHORIZED` |

## Status codes for security outcomes

| Situation | Status | Error code |
|-----------|--------|------------|
| Missing or malformed authorization header | 400 | shared middleware — `AuthMiddlewareError` |
| No or invalid credentials (service-thrown) | 401 | `UNAUTHORIZED` |
| Authenticated but not allowed (group or ownership) | 403 | `FORBIDDEN` |
| Malformed or rejected input | 400 | `VALIDATION_ERROR` |
| Record absent — do not confirm existence to an unauthorized caller | 404 | `RESOURCE_NOT_FOUND` |

The shared `authorizeByGroup` middleware answers `400` and `403` before the controller runs, so a
guarded route documents both plus whatever the service itself throws. Prefer `404` over `403` when
confirming that a record exists would itself leak information.

## Project reference files

- Routes and guards: `src/application/controllers/user.controller.ts`
- Ownership rules: `src/domain/user/service/user.service.ts`
- Query construction: `src/infraestructure/repository/user/user.repository.read.ts`
- Env and secrets: `src/configuration/env-constants/`
- Contract: `src/contracts/service.yaml` — `securitySchemes`, `security`, `401`, `403`
- Canonical shapes: [`examples/canonical-user/`](../../../examples/canonical-user/)
