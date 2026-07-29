---
name: skill-review-naming
description: >-
  Reviews semantic naming in TypeScript layered code — variables, functions, classes,
  files, I/IM interfaces, service methods, OpenAPI schemas. Use when reviewing naming,
  renaming PRs, or generic identifiers (data, result, payload).
disable-model-invocation: true
---

# Skill: review naming

## Objective

Verify identifiers (variables, functions, classes, files, interfaces, schemas) are **semantically clear** and match this repository's layered conventions.

Sources: [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§3–5), [rule.semantic-quality.mdc](../../rules/rule.semantic-quality.mdc), [rule.naming-patterns.mdc](../../rules/rule.naming-patterns.mdc).

## Validation criteria

### By artifact

| Artifact | Expected pattern | Example path |
|----------|------------------|--------------|
| Domain interface | `I` + PascalCase | `entity/interfaces/user.interface.ts` → `IUser` |
| Service interface | `I<Context>Service` | `interfaces/user.service.interface.ts` |
| Repository contract | `I*RepositoryRead` / `Write` | `user.repository.read.ts` |
| Mongo interface | `IM*` | `infraestructure/db/mongo/interfaces/user.interface.ts` |
| Entity class | `<Context>ServiceEntity` | `user.entity.ts` |
| Service class / methods | `<Context>Service`, business verb | `createUser`, `getUserById` |
| Repository impl | `<Context>RepositoryRead` | `user.repository.read.ts` |
| Controller / handler | `<Context>Controller`, `createUser` | `user.controller.ts` |
| Factory | `<Context>ControllerFactory.create()` | `user.controller.factory.ts` |
| File names | `kebab-case` + role suffix | `user.service.ts` |
| OpenAPI schema | PascalCase, role clear | `NewUser`, `UpdateUser`, `User` |
| Params interfaces | `IParamsCreateUser`, etc. | `user.service.interface.ts` |

### Generic names to flag

Search mentally (or grep) for weak names when domain context exists:

`data`, `result`, `item`, `obj`, `payload`, `temp`, `info`, `res2`, `thing`, `stuff`

### Use cases

- **Do not** require `*UseCase` classes — service methods are use cases (`UserService.createUser`).
- Method names: verb + domain concept (`listUsers`, `findUserByEmail`), not `process`, `handle`, `doWork`.

## Bad / good examples

```ts
// ❌ Service — generic locals
async createUser(params: IParamsCreateUser): Promise<IUser> {
  const data = await this.userRepositoryRead.findUserByEmail(params.email);
  if (data) throw { status: 409, ... };
  const result = await this.userRepositoryWrite.createUser(new UserServiceEntity(params));
  return result;
}

// ✅ Project style (user.service.ts)
async createUser(params: IParamsCreateUser): Promise<IUser> {
  const existingUser = await this.userRepositoryRead.findUserByEmail(params.email);
  if (existingUser) throw { status: 409, ... };
  const userEntity = new UserServiceEntity(params);
  return await this.userRepositoryWrite.createUser(userEntity);
}
```

```ts
// ❌ Files / classes
class UserManager { }
// file: UserRepo.ts

// ✅
class UserService { }
// file: user.repository.read.ts
```

```yaml
# ❌ OpenAPI
components:
  schemas:
    InputDto: { ... }

# ✅
    NewUser: { ... }
    UpdateUser: { ... }
    User: { ... }
```

## Workflow

1. Identify scope (file, folder, or PR diff).
2. Check file names vs folder role (`domain`, `application`, `infraestructure`, `configuration`).
3. Check class/interface prefixes (`I`, `IM`, `E`) per [rule.naming-patterns.mdc](../../rules/rule.naming-patterns.mdc).
4. Scan methods and locals for generic names.
5. If HTTP touched, cross-check OpenAPI schema names.
6. Classify findings by rename risk (local < internal < public API).

## Expected output format

```markdown
## Summary
[1–2 sentences]

## Naming scan scope
[files/paths reviewed]

## Passed
- [criterion] — `path` — note

## Findings
| Symbol | Kind | Location | Issue | Suggested name | Risk |
|--------|------|----------|-------|----------------|------|
| existingUser | variable | ... | — | — | — |

## Refactor batches (ordered)
1. **Low risk** — locals, private params
2. **Medium risk** — internal methods, test renames
3. **High risk / breaking** — public interfaces, REST paths, OpenAPI schema names

## Verdict
NO_CHANGES | SUGGESTIONS_ONLY
```

Risk: `low` | `medium` | `high`. Severity on issues: `blocker` | `major` | `minor` | `info`.

Agent playbook: [agt-naming-refactor](../../agents/agt-naming-refactor.md).
