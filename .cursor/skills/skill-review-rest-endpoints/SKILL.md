---
name: skill-review-rest-endpoints
description: >-
  Audits REST endpoint design against service.yaml and Express controllers in
  layered backend services. Use when reviewing routes, OpenAPI paths, HTTP verbs,
  query filters, or REST anti-patterns (/getUsers, action-in-path).
disable-model-invocation: true
---

# Skill: review REST endpoints

## Objective

Ensure endpoints are RESTful and **consistent** across Express controller, domain service methods, and `src/contracts/service.yaml`.

Sources: [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§4 Application, §7), [rule.semantic-quality.mdc](../../rules/rule.semantic-quality.mdc), [rule.contracts-openapi.mdc](../../rules/rule.contracts-openapi.mdc).

**Truth source for paths:** controller `initRoutes()` + `service.yaml`. If `AGENTS.md` mentions `/authorizers/...` but code uses `/users`, report as `info` only.

## Validation criteria

- [ ] **Path:** plural kebab-case resource (`/users`, `/appointments`)
- [ ] **HTTP method:** GET read, POST create, PUT/PATCH update, DELETE remove — verb not duplicated in path
- [ ] **No action in path:** reject `/getUsers`, `/users/create`, `/users/all`, `/fetchUser`
- [ ] **Collection vs item:** `/users` vs `/users/:id` (YAML: `/users/{id}`)
- [ ] **Filters:** query params (`?email=`, `?status=`) instead of `/users/by-email` unless explicitly documented exception
- [ ] **Status codes:** 201 create, 200 read/update/list, 404/409 from service, 400/403 when auth middleware applies
- [ ] **Controller:** thin — extract `params`/`body`/`query`, call service, `handleTranslatedError`
- [ ] **Service:** business rules and `IThrowedError`; no `UserModel` in controller
- [ ] **OpenAPI:** every route in controller exists under `paths`; body/response schemas match handler

## Bad / good examples

```ts
// ❌ Action or verb in path
this.router.get('/getUsers', this.getUsers);
this.router.post('/users/create', this.createUser);
this.router.get('/users/all', this.listAll);

// ✅ Project pattern (user context)
this.router.get('/users', authorizeByGroup([...]), this.getUsers);
this.router.get('/users/:id', this.getUserById);
this.router.post('/users', this.createUser);
this.router.put('/users/:id', this.updateUser);
this.router.delete('/users/:id', this.deleteUser);
```

```yaml
# ❌ Path does not match Express
/users/get-all:
  get: ...

# ✅
/users:
  get: ...
/users/{id}:
  get: ...
```

## Workflow

1. Open `src/application/controllers/<context>.controller.ts` → list `initRoutes()` (method + path + handler).
2. Open `src/contracts/service.yaml` → match each path and HTTP verb.
3. For each handler, note `this.<context>Service.<method>(...)`.
4. Check service for 404/409/status semantics vs documented responses.
5. Flag anti-patterns and YAML gaps.

Status/method table: [reference-rest.md](reference-rest.md).

## Expected output format

```markdown
## Summary
[1–2 sentences]

## Endpoint inventory
| Method | Path | Controller handler | Service method | YAML path | Status |
|--------|------|-------------------|----------------|------------|--------|

## Passed
- [criterion] — `path` — note

## Issues
### [severity: blocker|major|minor|info]
- **Rule:** ...
- **Path:** ...
- **Evidence:** `snippet`
- **Why:** ...
- **Fix:** ...

## Suggested design (if redesign needed)
| Current | Proposed | Rationale |

## Verdict
REST_OK | REST_NEEDS_CHANGES
```

Related: [skill-add-http-endpoint](../skill-add-http-endpoint/SKILL.md) (implement), [skill-openapi-contract](../skill-openapi-contract/SKILL.md) (sync YAML).
