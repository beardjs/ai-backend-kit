# Architecture discovery toolkit (agnostic)

Agents and skill for **mapping any repository as-is**, mining recurring patterns,
and stewarding kit rules — without assuming Clean Architecture, Hexagonal,
MVC, or fixed folder names.

They **coexist** with this kit’s layered Spec-Driven agents. They do **not**
replace them.

## Quick start

**When:** repo **diverges** from kit layered / [`examples/canonical-user/`](../examples/canonical-user/), or you pass an **explicit override**. Aligned services skip discovery (`SKIPPED_LAYERED_KIT`).

**Entry by tool:**

| Surface | Invoke |
|---------|--------|
| Claude Code | **[`/architecture-discovery`](skills/architecture-discovery/SKILL.md)** (preferred entry) |
| Cursor | [`agt-orchestrator`](../.cursor/agents/agt-orchestrator.md) / [`agt-architecture-probe`](../.cursor/agents/agt-architecture-probe.md) |
| Codex | `architecture_discovery` / [`$architecture-discovery`](../.agents/skills/ai-backend-kit-architecture-discovery/SKILL.md) |

**Copy-paste prompts:**

```text
Map this repository architecture as-is (Path D). Profile boundaries and mine recurring patterns.

Run architecture discovery anyway (explicit override), even if the repo looks kit-layered.
```

Recognized override phrases: `run the probe anyway`, `run architecture discovery anyway`, `explicit override`.

Pipeline: `agt-architecture-probe` → `agt-pattern-miner` → `agt-architecture-analyst` → `agt-pattern-steward` + human gate.

Artifacts: `profile.md` + `patterns.md` → **`analysis.md`**. CLI first-install may write `alignment-scan.md`.

Root guide: [Architecture discovery workflow](../README.md#architecture-discovery-workflow).

## Skip when layered kit (canonical-user)

If the target repo **aligns** with the layered architecture illustrated by
[`examples/canonical-user/`](../examples/canonical-user/) (and this kit’s
`AGENTS.md` / `docs/architecture-and-layers.md`), **do not** run discovery
(`agt-architecture-probe`, `agt-pattern-miner`, `agt-pattern-steward`).

Use instead:

- [`agt-architecture`](agents/sdd/agt-architecture.md) — Spec-Driven `design.md`
- [`agt-architecture-review`](agents/review/agt-architecture-review.md) — layer / coupling audit
- Existing kit rules (`.claude/rules/`, `.cursor/rules/`)

Discovery runs only when the project **diverges** from that layered shape
(different folders, style, or hybrid without the kit layers) — or when the
user **explicitly** overrides (“run the probe anyway”).

### Alignment heuristic

Automatic, evidence-based (no ask on every turn):

| Confidence | When |
|------------|------|
| `high` | **All** signals below present |
| `medium` | Majority of signals |
| below medium | Treat as **diverge** → run discovery |

Signals of “same architecture as canonical-user / kit layered”:

1. Folders: `src/domain`, `src/application`, `src/infraestructure` (spelling with “e”), `src/configuration`
2. Documented canon: `AGENTS.md` and/or `docs/architecture-and-layers.md` describing Domain / Application / Infraestructure / Configuration
3. Conventions mirrored in the example: `I*RepositoryRead|Write`, factories under `src/configuration/factory/`, controllers under `src/application/controllers/` (≥1 context sample)
4. `examples/canonical-user/` **or** kit rules in the adopting service (`.claude/rules/business-rules-layers.md` / `.cursor/rules/rule.project-core.mdc`)

Byte-for-byte copy of the example is **not** required — the **same layered architecture** is.

## When to use what

| Need | Use |
|------|-----|
| Repo **aligned** to kit layered / canonical-user | **Skip discovery** → `agt-architecture` / `agt-architecture-review` |
| Technical design from approved `requirements.md` (this layered kit) | [`agt-architecture`](agents/sdd/agt-architecture.md) |
| Audit Domain ↔ Infra / layer coupling (this layered kit) | [`agt-architecture-review`](agents/review/agt-architecture-review.md) |
| **Divergent** repo: what architecture does it use? | **`agt-architecture-probe`** |
| **Divergent** repo: which patterns do we already use? | **`agt-pattern-miner`** |
| **Divergent** repo: one consolidated analysis `.md` | **`agt-architecture-analyst`** |
| **Divergent** repo: propose standards / kit rules (human gate) | **`agt-pattern-steward`** |
| Feature / SDD pipeline | [`/orchestrate`](skills/orchestrate/SKILL.md) |

```text
# Only when diverged (or explicit override):
agt-architecture-probe    →  docs/architecture/profile.md
agt-pattern-miner         →  docs/architecture/patterns.md
agt-architecture-analyst  →  docs/architecture/analysis.md
agt-pattern-steward       →  docs/architecture/proposals.md
                          →  docs/architecture/rule-drafts/*.md
                          →  .claude/rules/* (and .cursor/rules/* when present)   (only after APPROVED)
```

## Agents

| Agent | Writes | Focus |
|-------|--------|--------|
| [agt-architecture-probe](agents/discovery/agt-architecture-probe.md) | `docs/architecture/profile.md` | Style, boundaries, dependencies as-is |
| [agt-pattern-miner](agents/discovery/agt-pattern-miner.md) | `docs/architecture/patterns.md` | Recurring practices + evidence |
| [agt-architecture-analyst](agents/discovery/agt-architecture-analyst.md) | `docs/architecture/analysis.md` | Consolidated narrative report |
| [agt-pattern-steward](agents/discovery/agt-pattern-steward.md) | proposals, drafts, rules (gated) | Adopt / keep / deprecate → kit rules |

## Skill

| Skill | Purpose |
|-------|---------|
| [architecture-discovery](skills/architecture-discovery/SKILL.md) | Alignment check + as-is profile, mining, gated stewardship |

## Artifacts

```text
docs/architecture/
  profile.md
  patterns.md
  proposals.md
  rule-drafts/
```

In **this** kit (and layered adopters), those files are **not** required and do
**not** replace [docs/architecture-and-layers.md](../docs/architecture-and-layers.md).
If discovery is forced via override, the probe stays short and referential.

## Human gate (rules)

Steward gate values: `APPROVED` | `CHANGES_REQUESTED` | `REJECTED` |
`AWAITING_APPROVAL`.

Without `APPROVED`, only `proposals.md` and `rule-drafts/` may change — never
`.claude/rules/` or `.cursor/rules/`.

## Orchestrator routing

1. **Classify alignment** (heuristic above).
2. Then dispatch:

| User intent | Aligned (kit layered) | Diverged |
|-------------|----------------------|----------|
| Analyze architecture / map style | Skip discovery → explain + point to `agt-architecture-review` / canon | `agt-architecture-probe` |
| List patterns already in use | Skip → kit rules / `agt-code-quality` / naming agents | `agt-pattern-miner` |
| Propose patterns / generate rules | Skip → existing kit rules + `meta-self-improve` | probe ∥ miner (if needed), then `agt-pattern-steward` |
| Layered SDD design / layer audit | `agt-architecture` / `agt-architecture-review` | N/A (use discovery first if shape unknown) |

Explicit user override always wins for discovery.

## Related indexes

| Doc | Focus |
|-----|--------|
| [README.md](README.md) | Kit index — rules, agents, skills |
| [WORKFLOW.md](WORKFLOW.md) | Full pipeline |
| [AGENTS.md](../AGENTS.md) | Layered backend contract |
| [examples/canonical-user/](../examples/canonical-user/) | Canonical layered shape |
