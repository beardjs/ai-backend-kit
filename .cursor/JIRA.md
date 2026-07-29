# Jira toolkit (Cursor)

Read issues via MCP and create stories/subtasks via REST API (org defaults below).

## When to use what

| Need | Use |
|------|-----|
| Fetch issue, JQL, create story + subtasks | **`agt-jira-workflow`** |
| API, ADF, payloads, and curl reference | **`@skill-jira-workflow`** |
| Commits and PR | [GITHUB.md](GITHUB.md) |

Invoke the agent by name in chat or via the agent picker. Skill: `@skill-jira-workflow`.

## Default settings

| Setting | Value |
|---------|-------|
| Instance | `https://sauvvitech-team.atlassian.net` |
| Project | `SV` |
| Story issuetype id | `10003` |
| Subtask issuetype id | `10005` |
| Read | MCP `user-jira-mcp` (`get_issue`, `jql_search`) |
| Create | REST `POST /rest/api/3/issue` via `curl` |
| Credentials | `JIRA_USER_EMAIL` + `JIRA_API_KEY` (from `~/.cursor/mcp.json`, **never commit**) |

These are organization defaults. Prefer updating them in this kit when the whole org changes; override in a service copy only when that service uses a different project.

## Agent

| Agent | Read-only | Focus |
|-------|-----------|--------|
| [agt-jira-workflow](agents/agt-jira-workflow.md) | no | MCP read → plan → curl create (Story + Subtasks) |

## Skill

| Skill | Purpose |
|-------|---------|
| [skill-jira-workflow](skills/skill-jira-workflow/SKILL.md) | Auth, ADF, payloads, curl commands, JQL |

## Workflow overview

```text
Read: get_issue / jql_search (MCP user-jira-mcp)
Create:
  → plan (Story + Subtasks, titles feat(scope) ...)
  → user approval
  → export creds from ~/.cursor/mcp.json
  → GET /myself (accountId)
  → POST /issue (Story)
  → POST /issue (Subtasks with parent)
```

## Issue types (quick reference)

| Type | issuetype id | Parent |
|------|--------------|--------|
| Story | `10003` | — |
| Subtask | `10005` | story key |

Full details: [skill-jira-workflow](skills/skill-jira-workflow/SKILL.md).

## Related docs

- [GITHUB.md](GITHUB.md) — commits and PRs
- [RULES.md](RULES.md) — Cursor rules index
- [QUALITY.md](QUALITY.md) — code quality agents and skills
