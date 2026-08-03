# GitHub toolkit (Cursor)

Atomic commits, Conventional Commits, and PR creation aligned with the service repository template.

## When to use what

| Need | Use |
|------|-----|
| Commit (1 file/commit) + push + open PR | **`agt-github-workflow`** |
| Conventions, order, and template reference | **`@skill-github-workflow`** |
| Versioning / semantic-release | [rule.release.mdc](rules/rule.release.mdc) |

Invoke the agent by name in chat or via the agent picker. Skill: `@skill-github-workflow`.

## Default settings

| Setting | Value |
|---------|-------|
| PR base branch | `staging` |
| Commits | 1 file = 1 commit |
| Commit format | Conventional Commits (`feat:`, `fix:`, `docs:`, …) |
| Tests with methods | **Always** commit matching `src/__tests__/**` in the same plan run, paired after each method (same branch / PR) |
| Test naming | `describe('when …')` / `it('should …')` — [rule.tests.mdc](rules/rule.tests.mdc) |
| Boundary tests | Exact + just below + just above when inputs have edges |
| Never commit | Spec/plan outputs (`requirements.md`, `design.md`, `tasks.md`, …), `.cursor/plans/**`, secrets — unless user explicitly asks |
| PR body | [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) (per service; seed from [`docs/templates/PULL_REQUEST_TEMPLATE.md`](../docs/templates/PULL_REQUEST_TEMPLATE.md) via sync `--with-pr-template`) |
| Attribution | **Never** `Made with Cursor` / AI footers — [rule.git-no-ai-attribution.mdc](rules/rule.git-no-ai-attribution.mdc) |

Also disable product injection: **Cursor Settings → Agent → Attribution** (or **Git & PRs → Attribution**) — turn off Commit Attribution and PR Attribution. For CLI: `~/.cursor/cli-config.json` → `attribution.attributeCommitsToAgent` / `attributePRsToAgent` = `false`.

## Agent

| Agent | Read-only | Focus |
|-------|-----------|--------|
| [agt-github-workflow](agents/agt-github-workflow.md) | no | Inspect → plan → atomic commits → push → `gh pr create` |

## Skill

| Skill | Purpose |
|-------|---------|
| [skill-github-workflow](skills/skill-github-workflow/SKILL.md) | Commit types, layer order, PR template mapping, `gh` commands |

## Workflow overview

```text
git status / diff / log
  → plan (1 commit per file, layer order)
  → user approval
  → git add <file> + git commit (repeat)
  → git push -u origin HEAD
  → gh pr create --base staging
```

## Commit types (quick reference)

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `test` | Tests only |
| `refactor` | Restructure without behavior change |
| `chore` | Maintenance, tooling |
| `ci` | CI/CD pipelines |

Full details: [skill-github-workflow](skills/skill-github-workflow/SKILL.md).

## Related docs

- [QUALITY.md](QUALITY.md) — code quality agents and skills
- [RULES.md](RULES.md) — Cursor rules index
- [AGENTS.md](../AGENTS.md) — project architecture
