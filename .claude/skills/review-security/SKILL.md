---
name: review-security
description: >-
  Reviews security in layered TypeScript backends — authorization and ownership,
  injection, mass assignment, secrets, sensitive data in logs, resource limits,
  SSRF, and contract security. Use when reviewing a diff for vulnerabilities, an
  OWASP audit, or changes touching auth, user input, queries, or external calls.
disable-model-invocation: true
context: fork
agent: agt-security-review
argument-hint: "[paths or diff scope]"
---

# Skill: review security

Review scope: $ARGUMENTS (when empty, review the current uncommitted diff / branch changes).

## Objective

Trace **untrusted input** from the HTTP boundary to persistence and back, and report what an attacker could abuse.

Sources: [security-baseline.md](../../rules/security-baseline.md), [AGENTS.md](../../../AGENTS.md) (§3, §8), [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§4, §5, §13). OWASP mapping and grep hints: [reference-owasp.md](reference-owasp.md).

**Truth source:** the code, not the documentation. If `AGENTS.md` promises `authorizeByGroup` but a controller ships an unguarded route, the unguarded route is the finding.

## Validation criteria

### Authorization and ownership

- [ ] **Every route guarded:** each entry in `initRoutes()` has `authorizeByGroup([...])` or a documented public exception
- [ ] **Ownership in Service:** operations by `:id` verify the actor may touch *that* record, not merely that they are authenticated (BOLA / IDOR)
- [ ] **Group choice justified:** a widened group (`admin` → any authenticated) is a finding unless the spec asked for it
- [ ] **No auth logic in Repository or Controller:** the decision belongs to the Service ([business-rules-layers.md](../../rules/business-rules-layers.md))

### Input handling

- [ ] **No mass assignment:** no `...req.body` into an entity or `*Model`; fields listed explicitly
- [ ] **Types cast at the boundary:** `req.query` / `req.params` values coerced before reaching a query
- [ ] **No operator injection:** no raw object from the request inside a Mongoose filter; no `$where`, `$function`, or user-built regex
- [ ] **Entity invariants validated:** required fields and formats enforced before persistence

### Output and exposure

- [ ] **Errors translated:** `handleTranslatedError` + `EErrorCode`; no stack trace, driver message, or raw `error.message` in the body
- [ ] **Logs clean:** no token, credential, authorization header, PII, or full document
- [ ] **Response allow-listed:** only fields documented in `service.yaml`; no internal or persistence-only fields

### Resources and outbound

- [ ] **Lists paginated:** enforced maximum page size; no unbounded `find({})`
- [ ] **Payloads bounded:** body size limit in place
- [ ] **Outbound URLs fixed:** base URL from configuration, never from user input (SSRF); timeout set; TLS verification never disabled

### Configuration and contract

- [ ] **Secrets via named env constants:** no hardcoded credential, no `process.env` in Domain
- [ ] **Contract parity:** `service.yaml` declares `securitySchemes` + `security`, and documents `401` / `403` on guarded routes
- [ ] **Dependencies justified:** new packages explained; lockfile consistent

## Bad / good examples

```ts
// ❌ Controller — unguarded route and mass assignment
this.router.post('/users', this.createUser);
const user = await this.userService.createUser({ ...req.body });

// ✅ Guarded route, explicit payload
this.router.post('/users', authorizeByGroup(['admin']), this.createUser);
const user = await this.userService.createUser({ name: req.body.name, email: req.body.email });
```

```ts
// ❌ Repository — request object straight into the filter (NoSQL injection)
// a JSON body of { "email": { "$ne": null } } matches every document
const doc = await UserModel.findOne({ email: params.email });

// ✅ Service casts and validates before the repository is called
const email = String(params.email ?? '').trim().toLowerCase();
if (!email) throw { status: 400, errorCode: EErrorCode.VALIDATION_ERROR } as IThrowedError;
const user = await this.userRepositoryRead.findUserByEmail(email);
```

```ts
// ❌ Service — authenticated is not the same as authorized
async getUserById(id: string): Promise<IUser> {
  const user = await this.userRepositoryRead.findUserById(id);
  if (!user) throw { status: 404, errorCode: EErrorCode.RESOURCE_NOT_FOUND } as IThrowedError;
  return user;
}

// ✅ Ownership verified in the Service
async getUserById(id: string, requesterId: string): Promise<IUser> {
  const user = await this.userRepositoryRead.findUserById(id);
  if (!user) throw { status: 404, errorCode: EErrorCode.RESOURCE_NOT_FOUND } as IThrowedError;
  if (user.id !== requesterId) {
    throw { status: 403, errorCode: EErrorCode.FORBIDDEN } as IThrowedError;
  }
  return user;
}
```

```ts
// ❌ Leaking internals and secrets
logger.info('login', { email, password, token });
res.status(500).json({ message: error.message, stack: error.stack });

// ✅
logger.info('login', { userId });
handleTranslatedError(error, ErrorCatalog, res);
```

## Workflow

1. **Scope the diff** — changed files plus the controllers, services, and repositories they touch.
2. **Inventory routes** — list every route in `initRoutes()` with its guard; flag any without one.
3. **Trace the data flow** — for each new or changed endpoint, follow `req` → controller → service → repository → response, noting where a value is validated, cast, or used to build a query.
4. **Grep the exposure surface** — secrets, logging calls, `process.env`, `$where`, spread of `req.body`, outbound clients (patterns in [reference-owasp.md](reference-owasp.md)).
5. **Check contract parity** — `service.yaml` auth scheme and `401` / `403` responses for guarded routes.
6. **Classify and rank** — one category and one severity per finding, `blocker` first, each with path, evidence, and fix.

## Expected output format

```markdown
## Summary
[1–2 sentences on the risk posture of this change]

## Scope reviewed
[files/paths]

## Passed
- [dimension] — `path` — note

## Findings
| # | Dimension | Location | Evidence | OWASP | Severity | Fix |
|---|-----------|----------|----------|-------|----------|-----|
| 1 | Broken object-level authz | `src/...:42` | `findUserById(req.params.id)` with no ownership check | API1 | blocker | Compare `user.id` with the authenticated actor in the Service |

## Next owner
- agt-dev-backend (exploitable defect)
- agt-product-owner (missing product authorization rule)
- agt-architecture (systemic or design-level gap)
- agt-test-author (missing negative / authorization test)

## Verdict
APPROVED | CHANGES_REQUESTED | BLOCKED
```

Severity: `blocker` | `major` | `minor` | `info`. `APPROVED` requires zero blocking findings.

Agent playbook: [agt-security-review](../../agents/review/agt-security-review.md).
