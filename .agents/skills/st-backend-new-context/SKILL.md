---
name: new-context
description: Scaffold a new bounded context end-to-end using the repository's canonical layered pattern. Use for a new resource or module analogous to examples/canonical-user.
---

# New bounded context

Read the canonical example and implement in this order:

1. Domain `I*` entity interface, `*ServiceEntity`, repository read/write contracts,
   and service with local/cross-entity rules.
2. Infraestructure `IM*`, Mongoose schema/model, pure adapters, and concrete read/write repositories.
3. Thin Express controller.
4. Service/controller factories and application registration.
5. `service.yaml` schemas named `New<Context>`, `<Context>`, and `Update<Context>`.
6. Layered Jest fixtures, service tests, repository tests, and controller tests.

Use `infraestructure` and `configuration` exactly. Do not create `*UseCase` classes.
