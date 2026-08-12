# Full feature flow (agents)

How a demand moves from idea to validated delivery in a service that adopts this kit.
Complements [SPECS.md](SPECS.md) (artifacts) and [AGENTS.md](../AGENTS.md) (short contract).

**Default entry for new features:** invoke **`agt-orchestrator`**. It classifies intent, builds the minimal pipeline, applies gates, and dispatches specialists — it does not implement, write specs, or commit on its own.

## Choose a path first

| Path | When | What to run |
|------|------|-------------|
| **A — Hotfix / typo** | Rename, 1 line, or ≤3 files; no OpenAPI/route change; criterion clear in the prompt | `agt-dev-backend` → `agt-test-author` (if behavior changed) → `agt-test-runner` → `agt-verifier` (skip full SDD) |
| **B — Feature (SDD)** | New feature, endpoint, context, or contract change | **`agt-orchestrator`** (pipeline below) |
| **C — Specialist only** | Requirements only, design only, QA only, review only, commit/PR only | Call that agent directly |
| **D — Architecture discovery** | Repo **diverges** from kit layered / [`examples/canonical-user/`](../examples/canonical-user/) (or user explicitly overrides). **Skip** if the service already follows that layered shape. | See [ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md) (`agt-architecture-probe` → `agt-pattern-miner` → `agt-pattern-steward` + gate) |

**Path D quick start:** prompts and Entry by tool live in
[README — Architecture discovery workflow](../README.md#architecture-discovery-workflow)
and the Quick start block in [ARCHITECTURE-DISCOVERY.md](ARCHITECTURE-DISCOVERY.md).
Example: *Map this repository architecture as-is (Path D). Profile boundaries and mine recurring patterns.*

Skill map (scaffold vs SDD vs review): [SKILLS.md](SKILLS.md). Canonical shapes: [`examples/canonical-user/`](../examples/canonical-user/).

---

## Overview

```text
Idea / Jira / chat
        ↓
  agt-orchestrator
        ↓
  agt-product-owner  →  docs/specs/<slug>/requirements.md
        ↓
  Human gate (explicit APPROVED)
        ↓
  agt-architecture   →  design.md  (+ tasks.md)
        ↓
  agt-quality-assurance (PLAN)  →  test-plan.md   ← before code
        ↓
  agt-dev-backend    →  implementation (reads tasks + test-plan)
        ↓
  agt-test-author    →  Jest suites under src/__tests__/
        ↓
  agt-test-runner    →  healthy Jest suite
        ↓
  agt-code-review  ∥  agt-security-review  →  typed findings (read-only)
        ↓
  agt-quality-assurance (VERIFY)  →  qa-report.md
        ↓
  agt-architecture-review  ∥  agt-code-quality
        ↓
  agt-verifier
        ↓
  agt-github-workflow  (only if requested: commit / PR)
```

Principle: **shift-left** — requirements, design, and test plan exist *before* code. QA verifies approved requirements; it does not justify what was already implemented.

---

## Artifacts per feature

Folder: `docs/specs/<feature-slug>/`

| File | Producer | When | Content |
|------|----------|------|---------|
| `requirements.md` | `agt-product-owner` | First | Problem, rules, testable ACs |
| `design.md` | `agt-architecture` | After requirements approved | Layers, contracts, compatibility, rollout |
| `tasks.md` | Architecture + `@skill-spec-driven` | With design | Traceable slices (`TASK-*` → `AC-*` / `TC-*`) |
| `test-plan.md` | `agt-quality-assurance` (PLAN) | **Before** dev | AC → TC matrix, priorities P0–P3 |
| `qa-report.md` | `agt-quality-assurance` (VERIFY) | **After** code | Evidence-based result |

Templates: [`docs/specs/_templates/`](../docs/specs/_templates/).

Standard metadata at the top of each document:

```yaml
feature: <slug>
status: Draft | In Review | Approved | …
version: 0.1.0
owner: …
jira: …
createdAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
approvedBy: …
approvedAt: …
```

Agents must **read and preserve** these fields — never drop them.

---

## Agents and roles

| Agent | Does | Does not |
|-------|------|----------|
| [`agt-orchestrator`](agents/agt-orchestrator.md) | Classify, sequence, apply gates, synthesize | Edit `src/` or specs |
| [`agt-product-owner`](agents/agt-product-owner.md) | Requirements, AC, DoR | Code, schema, library choices |
| [`agt-architecture`](agents/agt-architecture.md) | Technical `design.md` | Edit `src/`; redefine product rules |
| [`agt-quality-assurance`](agents/agt-quality-assurance.md) | PLAN / VERIFY (AUTOMATE dispatches author) | Write Jest; change production to “pass” a test |
| [`agt-test-author`](agents/agt-test-author.md) | Create / extend unit & integration tests | Change production; own qa-report |
| [`agt-dev-backend`](agents/agt-dev-backend.md) | Implement the approved slice | Reinterpret an ambiguous rule |
| [`agt-test-runner`](agents/agt-test-runner.md) | Stabilize Jest / technical regression | Redefine product ACs |
| [`agt-code-review`](agents/agt-code-review.md) | Spec ↔ code review (read-only) | Implement fixes |
| [`agt-security-review`](agents/agt-security-review.md) | Adversarial security pass (read-only) | Judge spec conformance — that is code review |
| [`agt-architecture-review`](agents/agt-architecture-review.md) | Post-code layer audit | Write design (that is `agt-architecture`) |
| [`agt-code-quality`](agents/agt-code-quality.md) | Naming + REST | Replace spec-aware code review |
| [`agt-verifier`](agents/agt-verifier.md) | Delivery evidence | Soften asserts |
| [`agt-github-workflow`](agents/agt-github-workflow.md) | Atomic commit / PR | Run without an explicit request |
| [`agt-jira-workflow`](agents/agt-jira-workflow.md) | Read / create Jira | Required on every feature |

Related skills: `@skill-product-refinement`, `@skill-technical-design`, `@skill-quality-assurance`, `@skill-tests-layered`, `@skill-backend-implementation`, `@skill-code-review`, `@skill-spec-driven`.

---

## Feature pipeline (default)

### 1. Idea → requirements

1. Orchestrator classifies intent as `feature` (or `specify` / `bugfix`).
2. Optional: `agt-jira-workflow` brings card context.
3. `agt-product-owner` (+ `@skill-product-refinement`) writes `requirements.md`.
4. **Human gate:** advance only with an explicit decision:

```text
APPROVED | CHANGES_REQUESTED | REJECTED | BLOCKED
```

A comment, praise, or “please revise” does **not** approve.

### 2. Technical design

1. `agt-architecture` (+ `@skill-technical-design`) produces `design.md`.
2. Traceable tasks in `tasks.md` (via skill / tech).
3. If the requirement is infeasible or contradictory → return a question to PO (do not redefine the rule in design).
4. Technical gate: `APPROVED` (or `CHANGES_REQUESTED` returns to architecture).

Skip design only when the change touches a single context **without** impact on contract, persistence, or messaging.

### 3. QA PLAN (before code)

1. `agt-quality-assurance` in **PLAN** mode.
2. Input: `requirements.md` + `design.md`.
3. Output: `test-plan.md` (positive/negative cases, P0/P1, unit/int/contract/messaging levels).
4. Untestable criteria return to PO — development does **not** start with a blind AC.

Operational result: `READY_FOR_DEVELOPMENT`.

### 4. Implementation

1. `agt-dev-backend` (+ `@skill-backend-implementation`) reads **requirements + design + tasks + test-plan**.
2. Implements only the approved slice; business rules in Service; Domain ↛ Infraestructure.
3. Deviations:

```text
Ambiguous / missing rule     → agt-product-owner
Risk / infeasibility         → agt-architecture
Untestable AC                → QA + PO
Out-of-scope change          → orchestrator + PO
```

4. Dev DoD (lint, targeted tests, OpenAPI if HTTP changed) before handoff.

### 5. Technical suite

`agt-test-runner` leaves the Jest suite healthy (tooling regression ≠ product acceptance).

### 6. Code review ∥ Security review

Both reviewers read the same diff and run in parallel — this phase is **mandatory** on features:

1. `agt-code-review` compares requirements ↔ design ↔ tasks ↔ implementation ↔ tests.
2. `agt-security-review` runs the adversarial pass (authorization and ownership, injection, mass assignment, secrets, exposure, resource limits, SSRF, contract security).

Finding categories:

```text
BLOCKING_FUNCTIONAL | BLOCKING_ARCHITECTURE | BLOCKING_SECURITY | BLOCKING_CONTRACT
NON_BLOCKING_IMPROVEMENT | STYLE | QUESTION
```

Blocking → back to `agt-dev-backend`. Style / non-blocking improvements do not stop the flow.
`BLOCKING_SECURITY` blocks the gate like any other blocking finding — it is never accepted as a “known risk” without explicit human risk acceptance.

### 7. Test author + QA VERIFY

1. `agt-test-author` automates what is in the test-plan under `src/__tests__/` (`when`/`should`, mock policy).
2. `agt-quality-assurance` in **VERIFY** runs real `package.json` commands (test, coverage, lint, etc.).
3. Writes `qa-report.md` with result:

| Result | Meaning | Next step |
|--------|---------|-----------|
| `PASS` | P0/P1 ok, no blocking defect | Continue |
| `PASS_WITH_RISKS` | Core ok, minor risks explicit | **Human risk acceptance** |
| `FAIL` | Required AC failed / regression / contract / material arch | Back to dev |
| `BLOCKED` | Environment / data / credential / undecidable rule | Orchestrator consolidates |

Never weaken an assert to go green.

### 8. Parallel reviews + verifier

1. `agt-architecture-review` ∥ `agt-code-quality`.
2. `agt-verifier` — wiring, lint, YAML, evidence that “it was delivered”.
3. Optional, **only if requested:** `agt-github-workflow` (commit / PR). No AI attribution in Git.

---

## Shortcuts (when to skip full SDD)

| Situation | Pipeline |
|-----------|----------|
| Rename / typo / 1 line | One specialist; no SDD |
| Hotfix ≤ 3 files, no OpenAPI/route, clear criterion in the prompt | `dev` → `test-author` (if behavior changed) → `test-runner` → `verifier` |
| Create / extend tests only | `agt-test-author` → `agt-test-runner` |
| Bugfix that changes HTTP/OpenAPI | At least `requirements.md` before verifier |
| Requirements only | `agt-product-owner` → human gate and stop |
| Design only | `agt-architecture` (requirements already approved) |
| QA only | `agt-quality-assurance` PLAN / VERIFY (AUTOMATE → dispatch `agt-test-author`) |
| Review only | `agt-code-review` or `architecture-review` ∥ `code-quality` |
| Security review only | `agt-security-review` (or `@skill-review-security`) |
| Commit / PR | `agt-verifier` → `agt-github-workflow` (explicit request) |

---

## Gates and decisions

Every product/design/risk approval uses one of these words — **nothing implicit**:

```text
APPROVED | CHANGES_REQUESTED | REJECTED | BLOCKED
```

| Gate | Who decides | On failure |
|------|-------------|------------|
| Requirements | Responsible human | Back to PO |
| Design | Human / tech | Back to architecture (product conflict → PO) |
| QA PLAN ok | Flow / orchestrator | Blocked criteria → PO |
| Code review | Reviewer (agent) | Blocking → dev |
| QA VERIFY | Evidence + result | `FAIL` → dev; `PASS_WITH_RISKS` → human acceptance; `BLOCKED` → owner |
| Commit / PR | Explicit user | Do not call github-workflow |

---

## Traceability

```text
OBJ-01
 └── US-01
      ├── BR-01
      ├── FLOW-01
      └── AC-01
           ├── TC-01  (test-plan)
           ├── TASK-01
           ├── src/__tests__/…
           └── evidence in qa-report.md
```

Stable identifiers: `OBJ-*`, `ACT-*`, `US-*`, `BR-*`, `FLOW-*`, `AC-*`, `NFR-*`, `ASM-*`, `RQ-*`, `RISK-*`, `METRIC-*`, `DEC-*`, `TC-*`, `TASK-*`, `DEF-*`, `ARCH-*`.

When an **already approved** requirement changes: PO versions + changelog → architecture does impact analysis → QA updates test-plan → affected tasks → QA report records the validated version. No agent validates a version different from what was implemented.

---

## Day-to-day usage

1. **New feature:** in chat, ask `agt-orchestrator` (or “run the SDD pipeline”) with the problem — not only the technical solution.
2. At the requirements gate, reply with **`APPROVED`** (or `CHANGES_REQUESTED` + what to change).
3. Let the orchestrator drive design → QA PLAN → dev → review → QA VERIFY → verifier.
4. Commit/PR only when you ask explicitly.

An obvious single-role request (PO only, QA only, PR only) → call that agent directly; the orchestrator also redirects.

---

## Not yet part of this flow

Reserved for later process phases (optional; not required for kit adoption):

- Post-production outcome review and a formal state machine outside this document

**Do not confuse:**

| Concern | Where |
|---------|--------|
| Cursor **kit** SemVer | Kit repo `VERSION` / `CHANGELOG.md` → `.cursor/KIT_VERSION` after sync ([ADOPTION.md](../docs/ADOPTION.md)) |
| Service **package** release | [rule.release.mdc](rules/rule.release.mdc) (semantic-release / Conventional Commits in the service) |

A dedicated `agt-release` / feature “release readiness” report is **out of scope** for now — use the service’s existing release pipeline and this kit’s version stamp instead.

---

## Quick references

| Doc | Purpose |
|-----|---------|
| [SPECS.md](SPECS.md) | Spec-Driven kit, artifacts, skills |
| [SKILLS.md](SKILLS.md) | Full skills map (scaffold / SDD / review / ops) |
| [docs/specs/README.md](../docs/specs/README.md) | Folder convention and templates |
| [RULES.md](RULES.md) | Per-layer rules index |
| [QUALITY.md](QUALITY.md) | Naming / REST / audits |
| [GITHUB.md](GITHUB.md) | Commits and PRs |
| [JIRA.md](JIRA.md) | Jira issues |
| [AGENTS.md](../AGENTS.md) | Short service contract |
| [docs/architecture-and-layers.md](../docs/architecture-and-layers.md) | Layers Domain → Configuration |
| [docs/ADOPTION.md](../docs/ADOPTION.md) | How to sync this kit into a service |
| [examples/canonical-user/](../examples/canonical-user/) | Illustrative `user` reference |
