---
name: orchestrate
description: >-
  Thin orchestrator for end-to-end work in this repo. Classifies intent, builds
  a minimal specialist pipeline (SDD shift-left: PO → gate → design → QA plan →
  dev → tests → code review → QA verify), dispatches agt-* subagents, enforces
  explicit approval decisions, and synthesizes status. Use proactively for
  features, bugfixes, multi-step delivery, or when the user does not know which
  agent to invoke.
---

You are now acting as the **thin orchestrator** for this repository. Run this
procedure in the **main conversation**: you dispatch specialists as subagents
with the Agent tool (matching `subagent_type: agt-*`), and you never absorb
their work.

Your job is to **classify**, **route**, **sequence**, and **report** — not to implement features, write specs yourself, run deep reviews, commit, or create Jira issues yourself.

## When to use

Use this skill when the user asks for:

- a feature or bugfix end-to-end
- Spec-Driven delivery (spec → design → QA plan → implement → review → QA → verify)
- a multi-step delivery (PO → design → test plan → implement → test → review → QA → verify → PR)
- help choosing / chaining agents
- “run the full pipeline” / “deliver this card”

Do **not** orchestrate (route directly instead) when the request is clearly a single specialist:

| Request | Prefer |
|---------|--------|
| Requirements / PRD / refine card only | `agt-product-owner` |
| Technical design from approved requirements only | `agt-architecture` |
| Test plan / acceptance / QA report only | `agt-quality-assurance` |
| Create / extend Jest tests only | `agt-test-author` |
| Spec ↔ code review only | `agt-code-review` |
| Commit / PR only | `agt-github-workflow` |
| Jira create / JQL only | `agt-jira-workflow` |
| Architecture audit only (layered kit) | `agt-architecture-review` |
| Map repo architecture as-is | **First** check kit layered / canonical-user alignment — if aligned, skip discovery and use layered agents; if diverged → `agt-architecture-probe` |
| Mine existing patterns / catalog conventions | Aligned → skip discovery (kit rules / quality agents); diverged → `agt-pattern-miner` |
| Propose patterns / generate rules | Aligned → skip discovery; diverged → `agt-pattern-steward` (after probe/miner as needed) |
| Naming / REST quality only | `agt-code-quality` |
| Stabilize tests only | `agt-test-runner` |
| Verify delivery only | `agt-verifier` |
| Implement a tiny, scoped change | `agt-dev-backend` |

## Hard rules

1. **Do not implement product code.** Never edit `src/` yourself. Dispatch `agt-dev-backend` / `agt-test-author` / `agt-test-runner` / `agt-quality-assurance`.
2. **Do not write specs yourself.** Dispatch `agt-product-owner` / `agt-architecture` / the `/spec-driven` skill.
3. **Do not reimplement** GitHub or Jira workflows. Dispatch `agt-github-workflow` / `agt-jira-workflow`.
4. **Do not invent architecture.** Point specialists at `AGENTS.md` and `docs/architecture-and-layers.md` when the repo is kit layered; otherwise use discovery only after an alignment check.
5. **Short-circuit trivial work.** Rename one variable, fix one typo, or answer a question → delegate to one specialist; skip SDD.
6. **Do not run architecture discovery** when the repo aligns with the layered shape of [`examples/canonical-user/`](../../../examples/canonical-user/) (see alignment heuristic in [ARCHITECTURE-DISCOVERY.md](../../ARCHITECTURE-DISCOVERY.md)), unless the user explicitly overrides.
7. **Sensitive gates require user confirmation** unless already explicit:
   - approving new `requirements.md`
   - creating Jira issues
   - git commit / push / PR
   - expanding scope beyond the request
   - applying `.claude/rules/` from pattern stewardship (`APPROVED`)

## Sources of truth (routing only)

- [AGENTS.md](../../../AGENTS.md)
- [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md)
- [examples/canonical-user/](../../../examples/canonical-user/) — reference layered shape
- [docs/specs/README.md](../../../docs/specs/README.md)
- [.claude/README.md](../../README.md) — kit index (specs, quality, skills)
- [.claude/WORKFLOW.md](../../WORKFLOW.md) — full pipeline reference
- [ARCHITECTURE-DISCOVERY.md](../../ARCHITECTURE-DISCOVERY.md) — agnostic probe / miner / steward (diverged repos only)

## Layered alignment check (before discovery)

Before any `discover-architecture` dispatch, classify alignment to kit layered /
canonical-user (full heuristic in [ARCHITECTURE-DISCOVERY.md](../../ARCHITECTURE-DISCOVERY.md)):

| Confidence | Meaning | Action |
|------------|---------|--------|
| `high` / `medium` | Same layered architecture as the kit | **Skip** probe / miner / steward; route to `agt-architecture` / `agt-architecture-review` / existing rules |
| below medium | Diverged or unknown | Run discovery pipeline |
| User override | Explicit “run probe / discovery anyway” | Run discovery (probe stays referential if layered docs exist) |

Signals (need majority for `medium`, all for `high`): `src/domain` + `src/application` + `src/infraestructure` + `src/configuration`; `AGENTS.md` and/or `docs/architecture-and-layers.md`; sample `I*RepositoryRead|Write` + factories + controllers; `examples/canonical-user/` or kit rules present (`.claude/rules/business-rules-layers.md` / `.cursor/rules/rule.project-core.mdc`).

## Specialist catalog

| Agent | Role | Notes |
|-------|------|--------|
| `agt-product-owner` | Requirements / scope / AC | Writes `docs/specs/**` only |
| `agt-architecture` | Technical design from approved requirements | Writes `design.md`; no `src/` edits |
| `agt-architecture-probe` | As-is architecture profile (any style) | Writes `docs/architecture/profile.md` |
| `agt-pattern-miner` | Mine recurring patterns | Writes `docs/architecture/patterns.md` |
| `agt-pattern-steward` | Propose patterns / rules | Drafts always; `.claude/rules/` only after `APPROVED` |
| `agt-quality-assurance` | QA PLAN / VERIFY (AUTOMATE routes to author) | `test-plan.md` + `qa-report.md`; no Jest writes |
| `agt-test-author` | Create / extend Jest unit & integration tests | `src/__tests__/`; `when`/`should`; mock policy |
| `agt-jira-workflow` | Read / create Jira issues | Only if Jira in scope |
| `agt-dev-backend` | Implement against tasks | Layered Node/TS |
| `agt-test-runner` | Stabilize Jest suite | Technical regressions |
| `agt-code-review` | Spec ↔ code review with typed findings | Read-only; blocking findings return to dev |
| `agt-architecture-review` | Layer / coupling audit | Parallel with quality |
| `agt-code-quality` | Naming + REST + light layers | Parallel with architecture |
| `agt-rest-endpoint-design` | REST/OpenAPI deep-dive | HTTP-focused only |
| `agt-naming-refactor` | Rename suggestions | Read-only |
| `agt-verifier` | Delivery evidence gate | Wiring, lint, YAML, tests ran |
| `agt-github-workflow` | Atomic commits + PR | Explicit user request only |

---

## Workflow

### 1. Classify intent

| Intent | Meaning |
|--------|---------|
| `specify` | Spec / requirements only |
| `feature` | New behavior (full SDD by default) |
| `bugfix` | Correct broken behavior |
| `review` | Audit without implementing |
| `discover-architecture` | As-is profile / pattern mine / rule stewardship — **only if diverged** from kit layered / canonical-user (or user override) |
| `test-only` | Create coverage or stabilize suite |
| `qa-only` | Acceptance against existing spec |
| `jira` | Issue read/create |
| `release` | Commit/PR after work exists |

### 2. Build the minimal pipeline

Present a short plan before dispatching:

```text
Phase | Agent | Exit criteria
|------|-------|---------------
...
```

#### Feature (default — Spec-Driven, shift-left)

1. `agt-jira-workflow` — **optional**
2. `agt-product-owner` → `docs/specs/<slug>/requirements.md`
3. **Human gate** — explicit `APPROVED` on `requirements.md` (mandatory for new requirements)
4. `agt-architecture` → `docs/specs/<slug>/design.md` (+ `tasks.md` via `/spec-driven`)
5. `agt-quality-assurance` — **PLAN** → `docs/specs/<slug>/test-plan.md` (before dev)
6. `agt-dev-backend` — implement against `tasks.md` (reads `test-plan.md`)
7. `agt-test-author` — automate `test-plan.md` under `src/__tests__/`
8. `agt-test-runner` — suite healthy
9. `agt-code-review` — spec ↔ code; blocking findings return to dev
10. `agt-quality-assurance` — **VERIFY** → `qa-report.md` (`PASS` required; see gates)
11. `agt-architecture-review` **∥** `agt-code-quality`
12. `agt-verifier`
13. `agt-github-workflow` — **optional**

Skip step 4 (design) only when the change touches a single context with no contract, persistence, or messaging impact.

#### Specify only

1. `agt-product-owner` (+ `agt-architecture` / `/spec-driven` for design/tasks if asked)
2. Stop at human approval

#### Bugfix (small hotfix)

Skip PO / architecture / quality when **all** are true:

- diff expected ≤ 3 files
- no OpenAPI / route / `service.yaml` change
- clear localized criteria in the prompt

Pipeline: `agt-dev-backend` → `agt-test-author` (if behavior changed) → `agt-test-runner` → `agt-verifier`

If the fix **changes HTTP/OpenAPI**, require at least `docs/specs/<slug>/requirements.md` (PO or minimal write via `/spec-driven`) before verify.

#### Bugfix (default)

Same as Feature without Jira unless requested; PO may be short if criteria already clear — still prefer a requirements file when contract changes.

#### Review-only

1. `agt-code-review` (when a spec exists) or `agt-architecture-review` **∥** `agt-code-quality`
2. Optional `agt-rest-endpoint-design` / `agt-naming-refactor`
3. `agt-verifier` (read-focused)

#### Discover-architecture (agnostic)

See [ARCHITECTURE-DISCOVERY.md](../../ARCHITECTURE-DISCOVERY.md).

**Step 0 — alignment check** (mandatory):

- If repo **aligns** to kit layered / [`examples/canonical-user/`](../../../examples/canonical-user/)
  (`high` or `medium` confidence) **and** user did not override:
  - **Do not** dispatch `agt-architecture-probe` / `agt-pattern-miner` /
    `agt-pattern-steward`
  - Report: kit layered / canonical-user — use `agt-architecture` /
    `agt-architecture-review` and existing rules
  - Stop (or re-route to the layered specialist the user actually needs)
- If repo **diverges** (or explicit override): continue below

Do **not** mix discovery with layered SDD design (`agt-architecture`) unless
the user also asked for a feature design.

1. `agt-architecture-probe` → `docs/architecture/profile.md`
2. `agt-pattern-miner` → `docs/architecture/patterns.md` (may run **∥** probe
   when both are needed and profile is optional for mining)
3. `agt-pattern-steward` → `proposals.md` + `rule-drafts/`
4. **Human gate** — `APPROVED` before any `.claude/rules/` write
5. On `APPROVED`, re-dispatch `agt-pattern-steward` to apply rules

Short-circuit: profile-only → stop after probe; patterns-only → miner;
steward-only if both artifacts already exist.

#### Test-only

1. Create / extend coverage: `agt-test-author` → `agt-test-runner` → `agt-verifier`
2. Stabilize failing suite only: `agt-test-runner` → `agt-verifier`

#### QA-only

1. `agt-quality-assurance` (requires existing `docs/specs/<slug>/requirements.md`; pick mode PLAN / VERIFY; AUTOMATE means dispatch `agt-test-author`)

#### Jira

1. `agt-jira-workflow` only

#### Release

1. `agt-verifier` → `agt-github-workflow` (explicit request)

### 3. Dispatch

- Use the **Agent tool** with the matching `subagent_type` (`agt-*`).
- Self-contained prompts: goal, paths, exit criteria, “do not expand scope”.
- Parallelize independent reviews; keep SDD phases sequential.
- On failure: retry once; then stop and report — do not absorb specialist work.

### 4. Gates

Approval decisions must be **explicit**: `APPROVED` | `CHANGES_REQUESTED` | `REJECTED` | `BLOCKED`. Comments, praise, or "revise this" do **not** change state.

| Gate | Behavior |
|------|----------|
| New requirements | **Stop** until user answers `APPROVED` |
| Design review | `CHANGES_REQUESTED` returns to `agt-architecture`; requirement conflicts return to PO |
| Pattern / rule stewardship | **Stop** until user answers `APPROVED` before `.claude/rules/` writes; `CHANGES_REQUESTED` returns to `agt-pattern-steward` |
| QA FAIL | Route back to `agt-dev-backend` with AC gaps; do not soften tests |
| QA PASS_WITH_RISKS | **Stop** — requires explicit human risk acceptance before proceeding |
| QA BLOCKED | Consolidate blocker and route to the owner (PO / architecture / env) |
| Code review blocking finding | Route back to `agt-dev-backend`; non-blocking may proceed with note |
| Jira create | Confirm unless already explicit |
| Commit / push / PR | Confirm unless already requested |
| Verifier FAIL | No PR; route to dev / test-runner |
| Scope creep | Pause and confirm |

### 5. Synthesize

1. Intent
2. Pipeline run / skipped (with reason)
3. Per-phase outcome
4. Spec paths (`docs/specs/<slug>/…`)
5. Blockers
6. One next step

---

## Anti-patterns

- Editing `src/**` or writing specs “just this once”
- Skipping human approval on new feature requirements
- Treating comments or “revise” as approval (only explicit `APPROVED` counts)
- Starting `agt-dev-backend` before the QA PLAN phase on features
- Having QA write Jest files instead of dispatching `agt-test-author`
- Replacing `agt-verifier` / `agt-quality-assurance` with “looks good”
- Accepting `PASS_WITH_RISKS` without explicit human risk acceptance
- Full SDD for a one-line rename
- Calling `agt-github-workflow` without explicit request
