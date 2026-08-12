# AGENTS.md — layered backend contract

Short contract for **any** Node.js/TypeScript service that adopts this kit. Detail: [docs/architecture-and-layers.md](docs/architecture-and-layers.md). Cursor index: [`.cursor/RULES.md`](.cursor/RULES.md) · Claude Code index: [`.claude/README.md`](.claude/README.md).

> Examples using the `user` context (`UserService`, `IUser`, …) are the kit’s **canonical pattern**. Illustrative files: [`examples/canonical-user/`](examples/canonical-user/). Replace `<context>` with the service’s real bounded context.

## 1. Stack and commands

| Item | Expected value |
|------|----------------|
| Runtime | Node.js + TypeScript |
| HTTP | Express |
| Persistence | MongoDB (Mongoose) |
| Package manager | `yarn` |
| Tests | Jest (`yarn test`, `yarn test:unit`, `yarn test:int`) |
| Coverage | `yarn test:coverage` — target **≥ 80%** lines/branches |
| Lint | `yarn lint` |
| HTTP contract | `src/contracts/service.yaml` (OpenAPI) |

Adjust script names only when the service `package.json` already uses equivalents; do not invent another suite without need.

## 2. Layers (summary)

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| **Domain** | `src/domain/` | Business rules, entities, `I*` contracts |
| **Application** | `src/application/` | Thin Express controllers |
| **Infraestructure** | `src/infraestructure/` | Mongo `IM*`, adapters, concrete repos, clients, concrete Kafka |
| **Configuration** | `src/configuration/` | Env, factories, composition/DI |
| **Contracts** | `src/contracts/` | OpenAPI (`service.yaml`) |
| **Tests** | `src/__tests__/` | Mirror by context (`*.int.test.ts` / `*.unit.test.ts`) |

Fixed spelling: **`infraestructure`** (with “e”), **`configuration`** (singular).

## 3. Non-negotiable rules

1. **Domain ↛ Infraestructure** — no Mongoose, `IM*`, `*Model`, or concrete Kafka in domain.
2. **Business rules in Service** — never in Repository or Controller. Entity = local invariants; Service = uniqueness, 404/409, flows, idempotency.
3. **Repository** — CRUD/query + adapters; return `null` when missing; `try/catch` → `DATABASE_ERROR`. Do not throw product 404/409.
4. **Controller** — extract `req`, call service, status/JSON, `handleTranslatedError`. No product rules and no `*Model`.
5. **Factories** — composition in `src/configuration/factory/`.
6. **OpenAPI** — every route/payload change updates `src/contracts/service.yaml`.
7. **Commits/PRs** — no AI attribution (`Made with Cursor`, `Generated with Claude Code`, etc.). See `.cursor/rules/rule.git-no-ai-attribution.mdc` / `.claude/rules/git-no-ai-attribution.md`.
8. **Security baseline** — every route carries an explicit authorization decision, ownership checks live in the Service, no raw request value reaches a Mongo filter, and no secret or PII reaches code, logs, or error bodies. See `.cursor/rules/rule.security-baseline.mdc` / `.claude/rules/security-baseline.md` and [§13](docs/architecture-and-layers.md).

## 4. Naming conventions

| Prefix / form | Use |
|---------------|-----|
| `I*` | Domain interfaces (`IUser`, `IUserService`, `IUserRepositoryRead`) |
| `IM*` | Mongo model (persisted), infraestructure only |
| `E*` | Enums |
| `*ServiceEntity` | Entity with local validation |
| `kebab-case` + role suffix | Files: `user.service.ts`, `user.repository.read.ts` |
| OpenAPI schemas | `NewUser`, `User`, `UpdateUser` — not generic `*Dto` |

Use case = `*Service` method (e.g. `createUser`), not a separate `*UseCase` class.

## 5. Per-context structure

```text
src/domain/<context>/
  entity/interfaces/<context>.interface.ts
  entity/<context>.entity.ts
  repository/<context>.repository.read.ts
  repository/<context>.repository.write.ts
  service/<context>.service.ts
  service/<context>.service.interface.ts   # if the project already uses it

src/infraestructure/
  db/mongo/interfaces|schema|models/<context>.*
  repository/<context>/adapters/<context>.adapter.ts
  repository/<context>/<context>.repository.read.ts
  repository/<context>/<context>.repository.write.ts

src/application/controllers/<context>.controller.ts
src/configuration/factory/<context>.service.factory.ts
src/configuration/factory/<context>.controller.factory.ts
```

## 6. Spec-Driven (when applicable)

Artifacts under `docs/specs/<feature-slug>/`:

- `requirements.md` → `design.md` → `tasks.md` → `test-plan.md` → code → `qa-report.md`

Explicit human gate: `APPROVED` | `CHANGES_REQUESTED` | `REJECTED` | `BLOCKED`.

Full flow: [`.cursor/WORKFLOW.md`](.cursor/WORKFLOW.md) / [`.claude/WORKFLOW.md`](.claude/WORKFLOW.md). Default entry: **`agt-orchestrator`** (Cursor) / **`/orchestrate`** (Claude Code).

## 7. Definition of Done (dev)

- [ ] Slice matches the approved spec (if any)
- [ ] Domain has no infraestructure import
- [ ] Rules in Service; repo/controller clean
- [ ] Security baseline respected (authz on routes, ownership in Service, no secrets/PII in logs, no raw request values in queries)
- [ ] `service.yaml` updated if HTTP changed
- [ ] New controller registered in `src/app.ts` when needed
- [ ] Relevant unit/int tests green
- [ ] `yarn lint` ok on touched diff
- [ ] Minimal diff — no lateral refactor

## 8. Shared packages (org)

Org backends typically use shared packages for auth (`authorizeByGroup`), translated errors (`handleTranslatedError`), and helper types. If the service does not use those packages, preserve the **pattern** (auth middleware + i18n catalog + `IThrowedError` / `EErrorCode`) with the service’s equivalent libraries.
