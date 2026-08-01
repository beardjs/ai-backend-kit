---
paths:
  - "src/configuration/**/*"
---
# Configuration (`src/configuration`)

- **Factories** in `factory/`: `*.controller.factory.ts`, `*.service.factory.ts`, messaging in `factory/messaging/` when present.
- Responsibility: **assemble** the graph (controllers ← services ← concrete repos / producers); do not put business rules here (nor rule workarounds in the factory).
- Product rules live in **service** — see [business-rules-layers.md](business-rules-layers.md).
- Env: `dotenv.ts`, `env-constants/` — named constants, do not scatter `process.env` in the domain.
