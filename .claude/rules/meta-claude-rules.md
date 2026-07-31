---
paths:
  - ".claude/rules/**/*"
---
# Maintaining `.claude/rules/` in this kit

- **Required rule structure (Claude Code format):**
  ```markdown
  ---
  paths:
    - "src/domain/**/*"
  ---
  # Rule title

  - **Main Points in Bold**
    - Sub-points with details
    - Examples and explanations
  ```
  - Rules **without** a `paths` frontmatter block are loaded into **every** session (always-on) — reserve that for the few rules that must always apply (`business-rules-layers.md`, `git-no-ai-attribution.md`).
  - Rules **with** `paths` load only when Claude works with files matching the globs. Use a YAML list; brace expansion is supported (e.g. `src/{domain,application}/**/*`).

- **Naming convention (this repo):**
  - Layer/subject rules use plain `kebab-case` names: `domain.md`, `naming-patterns.md`, `business-rules-layers.md` (the `rules/` directory already qualifies them — no `rule.` prefix here, unlike `.cursor/rules/`).
  - Meta rules (rules about maintaining rules) use the prefix `meta-`: `meta-claude-rules.md`, `meta-self-improve.md`.
  - Name aligns with the layer or subject the rule governs (`application.md`, `infraestructure.md`, `tests.md`).
  - Do not import third-party tool rules into this directory.

- **File references:**
  - Use standard relative markdown links; they are validated by `scripts/check-md-links.py` in CI.
  - Example: [naming-patterns.md](naming-patterns.md) for rule references.
  - Example: [user.entity.ts](../../examples/canonical-user/src/domain/user/entity/user.entity.ts) for code references in this kit.
  - Never use the Cursor `mdc:` link scheme inside `.claude/` files.

- **Code examples:**
  - Use language-specific code blocks
  ```typescript
  // ✅ DO: Show good examples
  const goodExample = true;

  // ❌ DON'T: Show anti-patterns
  const badExample = false;
  ```

- **Rule content guidelines:**
  - Start with high-level overview
  - Include specific, actionable requirements
  - Show examples of correct implementation
  - Reference existing code when possible
  - Keep rules DRY by referencing other rules
  - Keep always-on rules short — they consume context in every session

- **Rule maintenance:**
  - Update rules when new patterns emerge
  - Add examples from actual codebase
  - Remove outdated patterns
  - Cross-reference related rules
  - Keep parity with the `.cursor/rules/` twin when the same subject exists in both kits
