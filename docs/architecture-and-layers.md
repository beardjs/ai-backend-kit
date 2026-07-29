# Architecture and layers

Reference document for **any backend service** that adopts the kit in [st-cursor-backend](../README.md). Complements [AGENTS.md](../AGENTS.md).

> The `user` context appears in examples as the **canonical pattern**. In each service, replace it with the real `<context>` (`order`, `payment`, `catalog`, …).

## 1. Goal

Standardize a Node.js/TypeScript backend with:

- Clear separation of responsibilities
- Testable domain independent of the persistence framework
- Thin HTTP controllers
- Composition via factories
- OpenAPI contract aligned with routes

## 2. Folder overview

```text
src/
  domain/            # rules + contracts
  application/       # HTTP (Express)
  infraestructure/   # Mongo, adapters, concrete repos, clients, concrete Kafka
  configuration/     # env + factories (DI)
  contracts/         # OpenAPI (service.yaml)
  app.ts             # bootstrap
__tests__/           # under src/__tests__/ — mirror by layer/context
```

**Mandatory** spelling: `infraestructure`, `configuration`.

## 3. Domain (`src/domain`)

### Contains

- `I*` interfaces
- `E*` enums
- Entities (`*ServiceEntity`) with **local** validation
- Repository contracts `I*RepositoryRead` / `I*RepositoryWrite`
- Service contracts (`I*Service`) when the project uses them
- Messaging contracts (Kafka interfaces), when events exist

### Must not contain

- Mongoose / schemas / models
- `IM*` interfaces
- Concrete producers/consumers
- Express `Request`/`Response` as business rules
- Imports from `src/infraestructure`

### Entity vs Service

| | Entity | Service |
|---|--------|---------|
| Scope | Object invariants (required field, format) | Rules that cross persistence or multiple steps |
| Examples | valid email, required name | unique email, “not found”, “can delete?”, workflow |
| Persistence | Does not query repo | Uses only `I*Repository*` contracts |

Detail with ❌/✅: [`.cursor/rules/rule.business-rules-layers.mdc`](../.cursor/rules/rule.business-rules-layers.mdc).

## 4. Application (`src/application`)

### Contains

- Express controllers
- Extraction of `params` / `body` / `query`
- Service calls
- HTTP status + JSON
- Boundary error translation (`handleTranslatedError` + catalog)
- Authorization middleware on routes

### Must not contain

- Uniqueness, conflicts, “exists?”
- Access to `*Model` / Mongoose
- Manual repository instantiation
- Domain orchestration beyond “call the service”

Handler pattern:

```ts
try {
  const result = await this.<context>Service.<method>(...);
  res.status(200).json(result);
} catch (error) {
  handleTranslatedError(error, ErrorCatalog, res);
}
```

## 5. Infraestructure (`src/infraestructure`)

### Contains

- `IM*` (persisted shape = `I*` + Mongo metadata)
- Mongoose schemas and models
- Pure adapters `dbToInternal` / `internalToDb`
- Implementations of `I*RepositoryRead` / `I*RepositoryWrite`
- External HTTP clients
- Concrete Kafka producers/consumers
- Error i18n catalog (`ErrorCatalog`)

### Repository — allowed

- `find` / `create` / `update` / `delete`
- Mapping via adapter
- Return `null` when the document does not exist
- `try/catch` → `DATABASE_ERROR` + log

### Repository — forbidden

- Throw product 404/409 (`RESOURCE_NOT_FOUND`, `RESOURCE_CONFLICT`)
- Validate uniqueness / eligibility / state transitions
- Instantiate `*ServiceEntity` to decide whether a product operation is allowed

## 6. Configuration (`src/configuration`)

### Contains

- Env loading (`dotenv` / constants)
- Service, controller, and messaging factories
- Dependency wiring (DI)

### Must not contain

- Business rules
- Direct HTTP request access beyond bootstrap needs

## 7. Contracts (`src/contracts`)

- HTTP contract source: `service.yaml`
- Paths, verbs, schemas, and status codes aligned with the controller
- API change **without** updating the YAML = incomplete delivery

## 8. Bootstrap (`src/app.ts`)

Typical order:

1. Load env  
2. Build `Server`  
3. Register controllers via factories  
4. Connect database  
5. Start HTTP  

## 9. End-to-end flow (canonical `user` example)

```text
HTTP POST /users
  → UserController.createUser
    → UserService.createUser
      → IUserRepositoryRead.findUserByEmail  (uniqueness — rule in service)
      → UserServiceEntity (local invariants)
      → IUserRepositoryWrite.createUser
        → adapter internalToDb
        → UserModel.create
        → adapter dbToInternal
    ← IUser
  ← 201 + JSON
```

Product errors originate in the **service** (`IThrowedError` + `EErrorCode`); the controller only translates.

## 10. Messaging (optional)

When the service has events:

1. Interface in domain: `src/domain/<context>/messaging/<event>/producer.interface.kafka.ts`
2. Implementation in infra: `src/infraestructure/messaging/<event>/producer.kafka.ts`
3. Inject via factory
4. Service calls the **interface** after success
5. Idempotency when applicable

## 11. Tests

- Mirror by context under `src/__tests__/`
- Integration: `*.int.test.ts` — controller / service / repository
- Unit: `*.unit.test.ts` — service/entity rules
- Coverage target ≥ 80% (`yarn test:coverage`)
- Integration may use models in the **test layer**; production stays layered

See [`.cursor/rules/rule.tests.mdc`](../.cursor/rules/rule.tests.mdc).

## 12. Relation to the Cursor kit

| Need | Where |
|------|-------|
| Per-layer rules | `.cursor/rules/rule.*.mdc` |
| Feature pipeline | `.cursor/WORKFLOW.md` + `agt-orchestrator` |
| Specs | `docs/specs/` + `.cursor/SPECS.md` |
| Naming/REST quality | `.cursor/QUALITY.md` |
| Kit adoption | [ADOPTION.md](ADOPTION.md) |
