# Jira toolkit — org defaults (Claude Code)

Read issues via the Jira MCP server (when configured) and create stories/subtasks via REST API (org defaults below).

## When to use what

| Need | Use |
|------|-----|
| Fetch issue, JQL, create story + subtasks | **`agt-jira-workflow`** |
| API, ADF, payloads, and curl reference | **`/jira-workflow`** |
| Commits and PR | [github-workflow](../github-workflow/reference.md) |

## Default settings

| Setting | Value |
|---------|-------|
| Instance | `https://sauvvitech-team.atlassian.net` |
| Project | `SV` |
| Story issuetype id | `10003` |
| Subtask issuetype id | `10005` |
| Read | Jira/Atlassian MCP server when configured; REST/curl fallback |
| Create | REST `POST /rest/api/3/issue` via `curl` |
| Credentials | `JIRA_USER_EMAIL` + `JIRA_API_KEY` (from env or MCP config, **never commit**) |

These are organization defaults. Prefer updating them in this kit when the whole org changes; override in a service copy only when that service uses a different project.

## Agent

| Agent | Read-only | Focus |
|-------|-----------|--------|
| [agt-jira-workflow](../../agents/ops/agt-jira-workflow.md) | no | MCP/REST read → plan → curl create (Story + Subtasks) |

## Workflow overview

```text
Read: issue lookup / JQL search (MCP when configured; REST fallback)
Create:
  → plan (Story + Subtasks, titles feat(scope) ...)
  → user approval
  → export creds from env / MCP config
  → GET /myself (accountId)
  → POST /issue (Story)
  → POST /issue (Subtasks with parent)
```

## Issue types (quick reference)

| Type | issuetype id | Parent |
|------|--------------|--------|
| Story | `10003` | — |
| Subtask | `10005` | story key |

Full details: [SKILL.md](SKILL.md).

## Related docs

- [github-workflow reference](../github-workflow/reference.md) — commits and PRs
- [.claude/README.md](../../README.md) — kit index
