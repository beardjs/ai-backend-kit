# Canonical `user` example (illustrative)

Pedagogical snippets for the layered backend pattern. **Not a runnable service** — copy shapes into a real service’s `<context>`.

Synced kit docs and skills link here so references resolve inside **ai-backend-kit**. After adoption, prefer the same relative paths under the service’s `src/`.

| Area | Path |
|------|------|
| Domain service | [`src/domain/user/service/user.service.ts`](src/domain/user/service/user.service.ts) |
| Domain entity | [`src/domain/user/entity/user.entity.ts`](src/domain/user/entity/user.entity.ts) |
| Controller | [`src/application/controllers/user.controller.ts`](src/application/controllers/user.controller.ts) |
| Mongo model / adapter / repos | [`src/infraestructure/`](src/infraestructure/) |
| OpenAPI | [`src/contracts/service.yaml`](src/contracts/service.yaml) |
| Errors | [`src/domain/common/errors/enums/EErrorCode.ts`](src/domain/common/errors/enums/EErrorCode.ts), [`src/infraestructure/i18n/error-catalog.ts`](src/infraestructure/i18n/error-catalog.ts) |

Architecture: [`docs/architecture-and-layers.md`](../../docs/architecture-and-layers.md). Adoption: [`docs/ADOPTION.md`](../../docs/ADOPTION.md).
