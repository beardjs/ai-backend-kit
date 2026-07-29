---
name: skill-github-workflow
description: >-
  GitHub workflow for this repo — conventional commits (one file per commit),
  push, and PR creation using .github/PULL_REQUEST_TEMPLATE.md with staging as
  base branch.
disable-model-invocation: true
---

# GitHub workflow (commits + PR)

Reference skill for `agt-github-workflow`. Use when committing changes or opening a pull request in this repository.

## Sources of truth

- [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md) — PR body structure
- [rule.release.mdc](../../rules/rule.release.mdc) — Conventional Commits for semantic-release
- [agt-github-workflow](../../agents/agt-github-workflow.md) — orchestrator agent

## Default configuration

| Setting | Value |
|---------|-------|
| PR base branch | `staging` |
| Commits per file | **1** (atomic) |
| Commit language | English, imperative mood |
| PR tool | `gh pr create` |

If `staging` does not exist locally or on remote, stop and ask the user to create it or confirm another base before opening the PR.

---

## Commit conventions

### Format

```text
<type>(<scope>): <short description in imperative mood>
```

- **type** — required; drives semantic-release version bumps
- **scope** — optional; domain context (`user`) or layer (`domain`, `contracts`, `cursor`)
- **description** — lowercase start, no trailing period, English

### Types

| Type | When to use | semantic-release |
|------|-------------|------------------|
| `feat` | New feature or capability | minor |
| `fix` | Bug fix | patch |
| `docs` | Documentation only | patch |
| `test` | Tests only | patch |
| `refactor` | Code change without behavior change | patch |
| `chore` | Maintenance, deps, config, removals | patch |
| `ci` | GitHub Actions / CI config | patch |

Breaking changes: add `BREAKING CHANGE:` in commit body or use `feat!:` / `fix!:` prefix.

### Examples from this repo

```text
feat: add integration test for user creation
feat(user): add createUser method in user service
fix(user): return 404 when user not found
refactor(user): update user adapter import to reference user model
docs: add architecture documentation outlining layered structure
test(user): add unit test for email uniqueness validation
chore(cursor): add github workflow agent
ci: add GitHub Actions workflow for linting
```

### Inferring type from file path

| Path pattern | Suggested type |
|--------------|----------------|
| `src/domain/**` (new behavior) | `feat` |
| `src/domain/**` (restructure) | `refactor` |
| `src/infraestructure/**` (new persistence) | `feat` |
| `src/application/**` (new endpoint) | `feat` |
| `src/contracts/service.yaml` | `feat` (or `fix` if correcting spec) |
| `src/__tests__/**` | `test` |
| `docs/**`, `*.md` | `docs` |
| `.github/**` | `ci` |
| `.cursor/**` | `chore` or `docs` |
| Deleted file | `chore` or `refactor` |

---

## Commit order (layer-first)

When multiple files change, commit in this order (foundations before consumers):

1. `src/domain/**`
2. `src/infraestructure/**`
3. `src/application/**`
4. `src/configuration/**`
5. `src/contracts/**`
6. `src/__tests__/**`
7. `.cursor/**`, `docs/**`, `.github/**`, root config files

---

## Atomic commit rules

### Required

```bash
git add <exact-file-path>
git commit -m "$(cat <<'EOF'
feat(user): add createUser method in user service

EOF
)"
```

### Forbidden

- `git add .` or `git add -A`
- Multi-file commits
- `git config` changes
- Force push to `main` / `staging`
- `git reset --hard`, `git clean -fdx` without explicit user approval
- Committing secrets (`.env`, credentials, tokens)
- AI/IDE attribution in commits or PRs: `Made with Cursor`, `Generated with Cursor`, `Co-authored-by: Cursor`, “Generated with …” emoji trailers, or any similar footer — strip before commit/PR create ([rule.git-no-ai-attribution.mdc](../../rules/rule.git-no-ai-attribution.mdc))

### Special cases

| Case | Action |
|------|--------|
| Deleted file | `git add <path>` then `chore(scope): remove ...` |
| Rename | `git mv old new` as single operation = one commit |
| Pre-commit hook auto-modifies files | New commit for hook changes; never amend after failed hook |
| Amend | Only when all user-rule conditions are met |

---

## Inspection commands

Run in parallel before planning:

```bash
git status
git diff
git log --oneline -10
git diff staging...HEAD
```

If `staging` is missing, try `origin/staging` or report the absence.

---

## PR template mapping

Fill [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md) sections as follows.

### Description

- Brief motivation and context for the PR
- Dependencies or prerequisites if any
- `Fixes #<issue>` when an issue number is known; otherwise `Fixes # (issue)` with a note

### What has changed?

Mark relevant checkboxes; remove or leave unchecked irrelevant ones:

| Signal in commits/diff | Checkbox |
|------------------------|----------|
| Any `feat:` commit | New feature |
| Any `fix:` commit | Bug fix |
| `BREAKING CHANGE` or `!` suffix | Breaking change |
| Changes in `src/contracts/service.yaml` | This change alters the contract |

### How should this be tested?

- Numbered manual steps when the feature has HTTP or integration flows
- Checklist of commands actually run, e.g.:
  - `[x] yarn test`
  - `[x] yarn lint`
  - `[x] yarn test:coverage` (when applicable)

### Checklist

Mark only what was verified:

- `[x]` Architecture/guidelines — when changes follow AGENTS.md layers
- `[x]` Self-review — always when agent completed review
- `[ ]` Code comments — only if comments were added
- `[x]` No warnings — when lint passed
- `[x]` Automated tests — when tests were added or updated
- `[x]` Unit tests pass — when `yarn test` passed

---

## PR creation command

```bash
git push -u origin HEAD

gh pr create \
  --base staging \
  --title "<concise feature title>" \
  --body "$(cat <<'EOF'
# Description

<Brief description of what this PR does, context, and motivation.>
Fixes #<issue>

## What has changed?

- [ ] Bug fix (fixes a bug but is a non-breaking change)
- [x] New feature (adds a new feature and is a non-breaking change)
- [ ] Breaking change (fix or feature that breaks an existing feature)
- [ ] This change alters the contract

# How should this be tested?

1. <step>
2. <step>

- [x] yarn test
- [x] yarn lint

# Checklist:

- [x] Does my code follow the project's guidelines (architecture/defined standards/clean code/SOLID)?
- [x] Did I perform a self-review of this PR?
- [ ] Did I comment on the code, especially in complex parts?
- [x] Does this PR generate any warnings?
- [x] Did I create automated tests?
- [x] Did the unit tests pass?
EOF
)"
```

Return the PR URL to the user when creation succeeds.

---

## Planning output format

Before executing commits, present a table:

| Order | File | Type | Proposed message |
|-------|------|------|------------------|
| 1 | `src/domain/user/service/user.service.ts` | feat | `feat(user): add createUser method in user service` |
| 2 | `src/__tests__/unit/user/create-user.unit.test.ts` | test | `test(user): add unit test for createUser` |

Ask for user approval unless they explicitly requested "commit and open PR".
