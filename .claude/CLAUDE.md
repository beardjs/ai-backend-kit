# AI backend kit — Claude Code kit

@../AGENTS.md

## Project core

- Architecture sources of truth: `AGENTS.md` (imported above) and `docs/architecture-and-layers.md`. Read them before any structural change.
- Fixed folder spelling: **`infraestructure`** (with "e") and **`configuration`** (singular) — never rename them.
- Business rules live **only** in domain Services (`src/domain/<context>/service/`) — never in Repository or Controller. Detail: `.claude/rules/business-rules-layers.md` (always loaded).
- All kit content, specs, code identifiers, and commit messages are written in **English**.

## Workflow entry points

- Features, bugfixes, and multi-step delivery: use the `/orchestrate` skill — it runs the Spec-Driven pipeline and dispatches the `agt-*` subagents.
- Single-specialist requests go straight to the matching subagent under `.claude/agents/` (e.g. `agt-code-review` for a spec ↔ code review).
- Full pipeline reference: `.claude/WORKFLOW.md`. Kit index: `.claude/README.md`.

## Approval gates

- Gate vocabulary is closed: `APPROVED` | `CHANGES_REQUESTED` | `REJECTED` | `BLOCKED`. Praise, comments, or "revise this" never change state.
- Always require explicit user confirmation for: approving new `requirements.md`, creating Jira issues, git commit/push/PR, expanding scope beyond the request, and applying `.claude/rules/` changes from pattern stewardship.

## Spec artifacts

- Specs live under `docs/specs/<feature-slug>/`: `requirements.md` → `design.md` → `tasks.md` → `test-plan.md` → code → `qa-report.md`.
- Every spec file starts with a YAML metadata block (`feature`, `status`, `version`, `owner`, …) — read it and preserve it; never drop metadata when editing a spec.
