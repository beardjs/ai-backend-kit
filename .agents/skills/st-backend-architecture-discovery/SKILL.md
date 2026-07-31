---
name: architecture-discovery
description: Profile an unfamiliar or divergent repository as-is, mine recurring patterns with evidence, and propose durable AGENTS.md conventions behind an explicit gate.
---

# Architecture discovery

First check alignment with the kit: `src/domain`, `src/application`,
`src/infraestructure`, `src/configuration`, repository contracts, factories, and
the shared architecture docs. If alignment is medium/high, skip discovery unless
the user explicitly overrides.

For a divergent repository:

1. Inventory languages, entrypoints, modules, boundaries, persistence, messaging,
   tests, build, and deployment signals.
2. Write `docs/architecture/profile.md` describing observed dependency direction
   and architecture style without prescribing a textbook model.
3. Mine repeated naming, DI, error, HTTP, persistence, testing, and messaging
   practices with at least two file references; write `patterns.md` with confidence.
4. Draft proposals and instruction drafts under `docs/architecture/**`, separating
   evidence from recommendations and avoiding duplicates.
5. Apply an approved durable convention only to the closest appropriate
   `AGENTS.md`, after the exact decision `APPROVED`.

Never edit application source during discovery or use execpolicy rules for
architectural conventions.
