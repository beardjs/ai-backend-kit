---
paths:
  - "src/infraestructure/**/*"
---
# Infraestructure (`src/infraestructure`)

- Mongo models: interface **`IM*`** extends domain `I*` + `_id`, `updatedAt`, etc. (see AGENTS.md).
- Schema in `db/mongo/schema/`, model in `db/mongo/models/`, `IM*` interface in `db/mongo/interfaces/`.
- Concrete repositories: **thin persistence layer** — implement domain contracts; use pure **adapters**:
  - `dbToInternal(IM*) → I*`
  - `internalToDb(I*)` with no side effects
- **Forbidden in repository:** business rules (404/409, uniqueness, state transitions, instantiate `*ServiceEntity`). Return `null` if not found; **service** throws `RESOURCE_NOT_FOUND` / `RESOURCE_CONFLICT`.
- **Allowed:** CRUD/query, mapping, `try/catch` → `DATABASE_ERROR` + log.
- ❌ example: `if (!doc) throw { errorCode: EErrorCode.RESOURCE_NOT_FOUND }` in repo — see [business-rules-layers.md](business-rules-layers.md).
- Kafka (optional): when added, put implementations in `messaging/<event>/`; contracts stay in **domain**.
