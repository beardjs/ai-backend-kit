# GitHub toolkit — org defaults (Claude Code)

Atomic commits, Conventional Commits, and PR creation aligned with the service repository template.

## When to use what

| Need | Use |
|------|-----|
| Commit (1 file/commit) + push + open PR | **`agt-github-workflow`** |
| Conventions, order, and template reference | **`/github-workflow`** |
| Versioning / semantic-release | [release.md](../../rules/release.md) |

## Default settings

| Setting | Value |
|---------|-------|
| PR base branch | `staging` |
| Commits | 1 file = 1 commit |
| Commit format | Conventional Commits (`feat:`, `fix:`, `docs:`, …) |
| Tests with methods | **Always** commit matching `src/__tests__/**` in the same plan run, paired after each method (same branch / PR) |
| Test naming | `describe('when …')` / `it('should …')` — [tests.md](../../rules/tests.md) |
| Boundary tests | Exact + just below + just above when inputs have edges |
| Never commit | Spec/plan outputs (`requirements.md`, `design.md`, `tasks.md`, …), `.cursor/plans/**`, secrets — unless user explicitly asks |
| PR body | [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md) (per service; seed from [`docs/templates/PULL_REQUEST_TEMPLATE.md`](../../../docs/templates/PULL_REQUEST_TEMPLATE.md) via sync `--with-pr-template`) |
| Attribution | **Never** AI footers in commits/PRs — [git-no-ai-attribution.md](../../rules/git-no-ai-attribution.md) |

Product injection is disabled natively: the kit's `.claude/settings.json` sets
`"includeCoAuthoredBy": false`, which stops Claude Code from appending
`Co-Authored-By: Claude` trailers to commits and PRs. Keep that setting; also
strip any attribution another tool appends before `git commit` / `gh pr create`.

## Agent

| Agent | Read-only | Focus |
|-------|-----------|--------|
| [agt-github-workflow](../../agents/ops/agt-github-workflow.md) | no | Inspect → plan → atomic commits → push → `gh pr create` |

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

Full details: [SKILL.md](SKILL.md).

## Related docs

- [.claude/README.md](../../README.md) — kit index
- [AGENTS.md](../../../AGENTS.md) — project architecture
