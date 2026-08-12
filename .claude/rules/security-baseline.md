# Security baseline

Minimum secure-coding contract for every change. Each item names the layer that **owns** it.
Deep checklist (OWASP mapping): [review-security](../skills/review-security/SKILL.md) · Audit agent: [agt-security-review](../agents/review/agt-security-review.md).

- **Secrets never live in code or logs** — *Configuration*
  - Read env through named constants in `src/configuration/env-constants/`; never scatter `process.env`, never in Domain.
  - Never log tokens, passwords, authorization headers, full documents, or PII.

- **Every route carries an explicit authorization decision** — *Application*
  - Guard routes in `initRoutes()` with `authorizeByGroup([...])`.
  - A deliberately public route must be documented as such in `src/contracts/service.yaml`.

- **Ownership and tenancy are Service rules** — *Domain*
  - Middleware proves *who the caller is*; the Service proves *this actor may touch this record*.
  - An id arriving in `req` is never proof of ownership (BOLA / IDOR).

- **No mass assignment** — *Application → Domain*
  - Never spread `req.body` into an entity or a `*Model`; build the payload field by field from the OpenAPI schema.

- **No query injection** — *Infraestructure*
  - Never pass raw `req.query` / `req.body` values into Mongoose filters; validate and cast types first.
  - No `$where`, no `$function`, no regex built from user input (ReDoS).

- **Errors never leak internals** — *Application*
  - Respond through `handleTranslatedError` + `EErrorCode` only.
  - No stack trace, Mongo error, or raw `error.message` in the HTTP body.

- **Responses and payloads are bounded** — *Domain + Application*
  - Paginate list queries with an enforced maximum; never return internal fields.

- **Outbound calls are not user-steered** — *Infraestructure*
  - No user-controlled URL (SSRF); always set timeouts; never disable TLS verification.

## Examples

```ts
// ❌ DON'T: request value straight into the filter, body spread into the entity
const users = await UserModel.find({ email: req.query.email });
const user = new UserServiceEntity({ ...req.body });

// ✅ DO: cast at the boundary, build the payload explicitly
const email = String(req.query.email ?? '');
const users = await this.userRepositoryRead.findUsersByEmail(email);
const user = new UserServiceEntity({ name: req.body.name, email: req.body.email });
```

```ts
// ❌ DON'T: leak internals to the client
res.status(500).json({ message: error.message, stack: error.stack });

// ✅ DO: translated catalog error
handleTranslatedError(error, ErrorCatalog, res);
```

Related: [application.md](application.md) · [business-rules-layers.md](business-rules-layers.md) · [configuration.md](configuration.md) · [infraestructure.md](infraestructure.md)
