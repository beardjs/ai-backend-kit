# Business rules by layer

## Principle

Every **business rule** (product decisions, conflicts, existence, flows, domain permissions, state transitions) belongs **mandatorily** in `src/domain/<context>/service/*.service.ts`.

**Repository** (`src/infraestructure/repository/`) and **Controller** (`src/application/controllers/`) **must not** implement business rules.

Supplementary source: [docs/architecture-and-layers.md](../../docs/architecture-and-layers.md) (sections 3–5) and [AGENTS.md](../../AGENTS.md) (Architecture / Non-negotiable rules).

---

## What goes where

| Responsibility | Layer | Project reference |
|------------------|--------|------------------------|
| Aggregate invariants (fields, format) | **Entity** (`*ServiceEntity`) | `validateUser` in `src/domain/user/entity/user.entity.ts` |
| Uniqueness, "exists?", 404/409, orchestration, idempotency | **Service** | `createUser`, `getUserById` in `src/domain/user/service/user.service.ts` |
| CRUD, query, adapter `IM*` ↔ `I*`, DB error | **Repository** | `src/infraestructure/repository/user/user.repository.read.ts` |
| HTTP: status, JSON, error translation | **Controller** | `src/application/controllers/user.controller.ts` |

### Entity vs Service

- **Entity**: **local** object invariants (required name, valid email). Does not query repository or decide conflicts between records.
- **Service**: rules that **cross persistence** or multiple steps (unique email, "resource not found", "can delete?", workflows). **Do not** move uniqueness to the Entity.

---

## Repository — forbidden

- Throw `404` / `409` or `EErrorCode.RESOURCE_*` for "not found" or "already exists".
- Validate uniqueness, business state, eligibility, or status transitions.
- Instantiate `*ServiceEntity` or decide whether the product operation is allowed.
- Any `if` whose purpose is **product**, not **data access**.

## Repository — allowed

- `Model.findOne` / `create` / `update` / `delete`.
- `dbToInternal` / `internalToDb` (pure adapters).
- `try/catch` → `DATABASE_ERROR` + log (pattern in `user.repository.*.ts`).
- Return `null` when the document does not exist (let the **service** decide the business error).

---

## Examples (`user` context)

### 404 — not in Repository

```ts
// ❌ src/infraestructure/repository/user/user.repository.read.ts
async findUserById(id: string): Promise<IUser> {
  const doc = await UserModel.findOne({ id });
  if (!doc) throw { status: 404, errorCode: EErrorCode.RESOURCE_NOT_FOUND };
  return dbToInternal(doc);
}
```

```ts
// ✅ Repository: Promise<IUser | null>
const doc = await UserModel.findOne({ id });
return doc ? dbToInternal(doc) : null;

// ✅ Service (src/domain/user/service/user.service.ts)
const user = await this.userRepositoryRead.findUserById(id);
if (!user) {
  throw { status: 404, errorCode: EErrorCode.RESOURCE_NOT_FOUND, message: 'User not found' } as IThrowedError;
}
return user;
```

### Conflict / uniqueness — Service only

```ts
// ❌ Repository
async createUser(data: IUser): Promise<IUser> {
  const exists = await UserModel.findOne({ email: data.email });
  if (exists) throw { status: 409, errorCode: EErrorCode.RESOURCE_CONFLICT };
  return dbToInternal(await UserModel.create(internalToDb(data)));
}
```

```ts
// ✅ Service — createUser
const existingUser = await this.userRepositoryRead.findUserByEmail(params.email);
if (existingUser) {
  throw { status: 409, errorCode: EErrorCode.RESOURCE_CONFLICT, ... } as IThrowedError;
}
const userEntity = new UserServiceEntity(params);
return await this.userRepositoryWrite.createUser(userEntity);
```

### Controller — delegate to Service

```ts
// ❌ src/application/controllers/user.controller.ts
const existing = await UserModel.findOne({ email: req.body.email });
if (existing) return res.status(409).json({ message: 'Conflict' });
```

```ts
// ✅ Controller
const newUser = await this.userService.createUser(req.body);
res.status(201).json(newUser);
// errors: handleTranslatedError(error, ErrorCatalog, res)
```

### Service — do not couple to Mongo

```ts
// ❌ src/domain/user/service/user.service.ts
import { UserModel } from '../../infraestructure/db/mongo/models/user.model';
const doc = await UserModel.findOne({ email });
```

```ts
// ✅ Service uses only I*RepositoryRead / I*RepositoryWrite contracts
const user = await this.userRepositoryRead.findUserByEmail(email);
```

---

## Quick checklist when generating code

- [ ] Conflict, business 404, workflows → **Service**
- [ ] Object format/required fields → **Entity**
- [ ] Query + mapping + `null` + DB error → **Repository**
- [ ] HTTP status and response body → **Controller** (no `UserModel`)
