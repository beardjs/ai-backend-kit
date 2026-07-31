---
paths: []
---

# Rule title

> Draft produced by `agt-pattern-steward`. Lives under
> `docs/architecture/rule-drafts/` until gate `APPROVED`, then copy/merge into
> the kit rule directory (`.claude/rules/`, `.cursor/rules/` when present).
>
> Naming for `.claude/rules/`: plain `kebab-case.md` (or `meta-<kebab>.md` for
> meta rules) per `meta-claude-rules.md`. Rules without `paths:` load in every
> session; set `paths:` globs for path-scoped rules (remove the frontmatter
> block entirely for always-on rules). For `.cursor/rules/` targets, convert to
> `rule.<kebab>.mdc` with Cursor frontmatter.

- **Purpose**
  - What invariant or convention this rule protects
  - Link related mined pattern IDs (e.g. P-001) and proposal IDs (PROP-001)

- **When it applies**
  - Paths / layers / modules (align `paths:` in frontmatter when path-scoped)

- **DO**
  - Concrete requirement
  - Example from the real codebase when possible

- **DON'T**
  - Anti-pattern observed or to avoid
  - Example

- **Evidence (mining)**
  - `path/to/example-a`
  - `path/to/example-b`
  - `path/to/example-c`

- **Related**
  - Other rules (relative markdown links)
  - Canonical docs (if any)

- **Deprecation** (only when Action = deprecate)
  - Replacement rule or practice
  - Migration path
  - Remove-after date or condition
