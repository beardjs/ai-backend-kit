# Codex backend kit

Native Codex configuration for layered Node.js/TypeScript services. It is
independent from other assistant kits and shares only the repository contract,
architecture documentation, specification templates, and canonical examples.

## Native surfaces

| Surface | Location | Purpose |
|---|---|---|
| Project configuration | `.codex/config.toml` | Multi-agent limits and Codex-only guidance |
| Custom agents | `.codex/agents/*.toml` | Focused subagent roles |
| Lifecycle policy | `.codex/hooks.json` | Sensitive-file and destructive-command guard |
| Exec policy | `.codex/rules/*.rules` | Deterministic command blocks |
| Repository skills | `.agents/skills/*/SKILL.md` | Progressive-disclosure workflows |

Codex loads project configuration, agents, hooks, and rules only after the
repository is trusted. Review the hook with `/hooks` after installing or
updating the kit.

## Agent map

| Agent | Use |
|---|---|
| `product_owner` | Requirements, acceptance criteria, and product gates |
| `architect` | Technical design and traceable tasks |
| `architecture_discovery` | As-is profiling, pattern mining, and gated stewardship |
| `implementer` | Layered backend implementation |
| `test_engineer` | Jest authoring, execution, and stabilization |
| `reviewer` | Spec, architecture, naming, REST, and security review |
| `qa` | Test planning, verification, and delivery evidence |
| `github_operator` | Explicitly requested commits, pushes, and pull requests |
| `jira_operator` | Explicitly requested Jira reads and writes |

The primary Codex agent is the orchestrator. It should not spawn a second
orchestrator: it classifies the request, chooses the smallest useful pipeline,
enforces explicit gates, and delegates only specialist work.

## Default delivery flow

```text
product_owner -> APPROVED -> architect -> qa PLAN -> implementer
              -> test_engineer -> reviewer -> qa VERIFY
```

Small, clear changes should use only the necessary specialists. GitHub and
Jira operations always require an explicit user request.

## Architecture discovery (Path D)

Use when the repo **diverges** from kit layered / `examples/canonical-user/`, or
when the user **explicitly overrides**. Aligned kit-layered services skip
discovery — prefer `architect` / `reviewer` and existing kit docs.

| Surface | Invoke |
|---------|--------|
| Codex agent | `architecture_discovery` |
| Repository skill | [`$architecture-discovery`](../.agents/skills/ai-backend-kit-architecture-discovery/SKILL.md) |

**Copy-paste prompts:**

```text
Map this repository architecture as-is (Path D). Profile boundaries and mine recurring patterns.

Run architecture discovery anyway (explicit override), even if the repo looks kit-layered.
```

Pipeline: profile → patterns → gated stewardship. Detail:
[README — Architecture discovery workflow](../README.md#architecture-discovery-workflow).
