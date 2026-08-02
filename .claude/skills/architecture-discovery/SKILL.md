---
name: architecture-discovery
description: >-
  Path D entry for architecture discovery. Thin pipeline: alignment check,
  then dispatch agt-architecture-probe → agt-pattern-miner →
  agt-architecture-analyst → agt-pattern-steward (gated). Also the shared as-is
  procedure those specialists follow. Use for divergent repos or explicit
  override; skip when kit-layered / canonical-user.
---

# Architecture discovery (agnostic)

Discover **what the repository already does**, not what a textbook architecture
prescribes. Do not assume Clean Architecture, Hexagonal, MVC, or any fixed
folder names (`domain/`, `application/`, etc.). Infer only from evidence.

This skill does **not** replace layered Spec-Driven design in this kit
([`technical-design`](../technical-design/SKILL.md) /
[`agt-architecture`](../../agents/sdd/agt-architecture.md)). Use discovery when the
repo **diverges** from the layered shape of
[`examples/canonical-user/`](../../../examples/canonical-user/), or when the
user explicitly overrides. Do **not** use discovery on kit-aligned layered
services — use the existing layered agents and kit rules instead.

## Slash entry (`/architecture-discovery`)

When the user invokes **`/architecture-discovery`** (or asks to run Path D /
map the repo as-is), act as a **thin pipeline** in the main conversation — same
spirit as [`/orchestrate`](../orchestrate/SKILL.md):

1. **Classify override** — phrases such as `run the probe anyway`,
   `run architecture discovery anyway`, or `explicit override` force discovery
   even on a layered-looking repo.
2. **Alignment check** (procedure step 0) — if `high` / `medium` and no
   override, return `SKIPPED_LAYERED_KIT` and point to
   `agt-architecture` / `agt-architecture-review`; **do not** write discovery
   artifacts.
3. **Dispatch specialists** via the Agent tool (`subagent_type` matching
   `agt-*`). Do **not** absorb their work or edit production `src/` yourself:
   - `agt-architecture-probe` → `docs/architecture/profile.md`
   - `agt-pattern-miner` → `docs/architecture/patterns.md`
   - `agt-architecture-analyst` → `docs/architecture/analysis.md` (consolidated)
   - `agt-pattern-steward` → `proposals.md` + `rule-drafts/` **only if** the
     user asked to propose/apply standards; otherwise stop after `analysis.md`
4. **Human gate** — never write `.claude/rules/` / `.cursor/rules/` without
   explicit `APPROVED`.
5. **Synthesize** — short status: alignment result, artifacts written, next step.

Short-circuit: profile-only → stop after probe; patterns-only → miner;
analysis-only if both sources exist → analyst; steward-only if asked.

Specialists preloaded with this skill still follow the **Procedure** below when
they execute a phase.

## Agents that use this skill

| Agent | Phase | Writes |
|-------|-------|--------|
| [`agt-architecture-probe`](../../agents/discovery/agt-architecture-probe.md) | Profile | `docs/architecture/profile.md` |
| [`agt-pattern-miner`](../../agents/discovery/agt-pattern-miner.md) | Patterns | `docs/architecture/patterns.md` |
| [`agt-architecture-analyst`](../../agents/discovery/agt-architecture-analyst.md) | Consolidate | `docs/architecture/analysis.md` |
| [`agt-pattern-steward`](../../agents/discovery/agt-pattern-steward.md) | Stewardship | `docs/architecture/proposals.md`, `docs/architecture/rule-drafts/`, then kit rules (`.claude/rules/`, `.cursor/rules/` when present) only after `APPROVED` |

## Templates

| Template | Output |
|----------|--------|
| [`templates/profile.md`](templates/profile.md) | `docs/architecture/profile.md` |
| [`templates/patterns.md`](templates/patterns.md) | `docs/architecture/patterns.md` |
| [`templates/analysis.md`](templates/analysis.md) | `docs/architecture/analysis.md` |
| [`templates/proposals.md`](templates/proposals.md) | `docs/architecture/proposals.md` |
| [`templates/rule-draft.md`](templates/rule-draft.md) | `docs/architecture/rule-drafts/<name>.md` |

## Hard rules

1. **Evidence over labels.** Every claim cites paths (and ideally frequency).
2. **No dogma.** Style labels are hypotheses with confidence, not mandates.
3. **Violations are relative to as-is** (or to explicitly documented canon), not
   to an external architecture model the repo never adopted.
4. **Do not edit production source** (`src/`, app code, tests) from this skill.
5. **Do not apply kit rules** (`.claude/rules/`, `.cursor/rules/`) without an
   explicit human gate `APPROVED`.
6. **Do not duplicate** an existing documented canon when one is already the
   source of truth (e.g. this kit’s `docs/architecture-and-layers.md` +
   kit rules).
7. **Skip discovery when kit-aligned** unless the user explicitly overrides
   (see step 0).

## Procedure

### 0. Alignment check (mandatory first)

Compare the repo to the kit layered architecture illustrated by
[`examples/canonical-user/`](../../../examples/canonical-user/).

| Confidence | When |
|------------|------|
| `high` | **All** signals present |
| `medium` | Majority of signals |
| below medium | Treat as **diverged** — continue discovery |

Signals:

1. Folders: `src/domain`, `src/application`, `src/infraestructure` (with “e”), `src/configuration`
2. Canon: `AGENTS.md` and/or `docs/architecture-and-layers.md` (Domain / Application / Infraestructure / Configuration)
3. Sample conventions: `I*RepositoryRead|Write`, `src/configuration/factory/`, `src/application/controllers/` (≥1 context)
4. `examples/canonical-user/` **or** kit rules present (`.claude/rules/business-rules-layers.md` / `.cursor/rules/rule.project-core.mdc`)

**If `high` or `medium` and no user override:**

1. Do **not** write `docs/architecture/profile.md` / `patterns.md` / proposals / rules.
2. Exit immediately with:

```md
## Summary
Result: SKIPPED_LAYERED_KIT
Repo aligns with kit layered / canonical-user architecture. Discovery is not needed.

## Evidence
- <paths that matched the signals>

## Confidence
high | medium — kit layered alignment

## Gaps
- none for discovery

## Next
- agt-architecture (SDD design) or agt-architecture-review (layer audit)
- Use existing kit rules / AGENTS.md / docs/architecture-and-layers.md
```

**If diverged** (or explicit override): continue from step 1. On override in a
layered repo, keep outputs short and referential — do not compete with
`docs/architecture-and-layers.md`.

### 1. Inventory

Collect:

- Top-level layout and main packages/modules
- Entrypoints (HTTP server, CLI, workers, jobs, front apps)
- Existing docs: `README*`, `AGENTS.md`, ADRs, architecture docs, kit rules
  (`.claude/rules/`, `.cursor/rules/`)
- Stack signals: language(s), frameworks, package managers, CI

Record what is **documented** vs what is **only visible in code**.

### 2. Classify style (no dogma)

Assign one or more labels with confidence (`high` | `medium` | `low`):

| Label | Typical signals (examples only) |
|-------|----------------------------------|
| `layered` | Explicit layer folders; dependency rule toward a core |
| `hexagonal` | Ports/adapters, inward dependencies, driven/driving sides |
| `mvc` | Controllers + models + views/templates as primary split |
| `modular-monolith` | Module/bounded-context packages with internal APIs |
| `feature-folders` | Vertical slices by feature more than by technical layer |
| `pipeline` | Stage/step processors, ETL-like or middleware chains |
| `unknown-hybrid` | Mixed styles; no single dominant shape |

Allow **hybrid**. Prefer `unknown-hybrid` over forcing a single name.

**Special case — this kit (`ai-backend-kit`):** if
`docs/architecture-and-layers.md` and layered kit rules exist, record
documented style = layered and point to that canon. Do not rewrite it into a
competing `profile.md` narrative; keep the profile short and referential.

### 3. Observed boundaries

Describe what the code **already** treats as:

- Core / domain-ish vs edge / I/O
- Module or package boundaries
- Public APIs between parts (interfaces, facades, packages)

Do not invent boundaries the codebase does not enforce.

### 4. Dependencies

Map who imports whom (samples across modules). Flag:

- Cycles
- Edge → core leaks (if the repo claims a core)
- Inconsistencies between sibling modules

Severity (`blocker` | `major` | `minor` | `info`) applies only to **as-is
inconsistencies** or documented-canon violations — not to “isn’t Clean”.

### 5. Mine patterns

For each recurring practice, record:

- Name and short description
- Category (naming, errors, DI/composition, persistence, HTTP, tests,
  messaging, other)
- Evidence paths
- Frequency (file/count) — treat **≥3 files** or a **documented canonical**
  example as catalog-worthy
- Status: `dominant` | `common` | `emerging` | `legacy` | `conflicting`

Do **not** propose new standards in this step (that is stewardship).

### 6. Gaps

List:

- Modules that diverge from the dominant pattern
- Undocumented conventions that appear in code only
- Candidates for standardization (facts only; no rule text yet)

### 7. Stewardship (steward agent only)

1. Cross `profile.md` + `patterns.md`.
2. Write `docs/architecture/proposals.md` (adopt / keep / deprecate / resolve
   conflict).
3. Draft rules under `docs/architecture/rule-drafts/` using
   [`templates/rule-draft.md`](templates/rule-draft.md).
4. Ask for gate: `APPROVED` | `CHANGES_REQUESTED` | `REJECTED`.
5. **Only if `APPROVED`:** copy/merge drafts into the kit rule directory.

#### Rule writing conventions

- For `.claude/rules/` (this kit): follow
  [`meta-claude-rules.md`](../../rules/meta-claude-rules.md) — plain
  `kebab-case.md` names, `meta-` prefix for meta rules, `paths:` frontmatter
  for path-scoped rules, relative markdown links, DO/DON'T examples.
- For `.cursor/rules/` (when that kit is present): `rule.<kebab>.mdc` /
  `meta.<kebab>.mdc`, Cursor frontmatter, `mdc:` links.
- Else if the target repo has its own rule convention: follow it.

#### Create / change / deprecate criteria

| Action | When |
|--------|------|
| **Create** rule | Pattern in ≥3 files **or** documented canon + user request |
| **Change** rule | Evidence of drift + entry in `proposals.md` |
| **Deprecate** | Never delete silently; mark deprecated + migration path (see [`meta-self-improve.md`](../../rules/meta-self-improve.md)) |

Avoid creating rules that duplicate existing kit rule content.

## Unified report format

Every agent returns:

```md
## Summary
<2–5 lines>

## Evidence
- path/to/file — <what it shows>

## Confidence
high | medium | low — <why>

## Gaps
- <gap or none>

## Next
- <next owner / agent / gate>
```

Steward adds:

```md
## Proposals
- ...

## Rule drafts
- docs/architecture/rule-drafts/<name>.md

## Gate status
APPROVED | CHANGES_REQUESTED | REJECTED | AWAITING_APPROVAL
```

## Exit criteria

| Phase | Done when |
|-------|-----------|
| Alignment (all agents) | `SKIPPED_LAYERED_KIT` reported when kit-aligned (no discovery artifacts), **or** proceed because diverged / override |
| Probe | `docs/architecture/profile.md` filled from template; style + boundaries + deps evidenced |
| Miner | `docs/architecture/patterns.md` filled; each pattern has evidence + frequency/status |
| Steward | `proposals.md` + drafts written; rules applied **only** after `APPROVED` |
