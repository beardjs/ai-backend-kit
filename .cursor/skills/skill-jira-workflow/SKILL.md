---
name: skill-jira-workflow
description: >-
  Jira Cloud workflow — read via MCP, create via REST/curl with ADF, stories
  and subtasks using org project defaults (SV).
disable-model-invocation: true
---

# Jira workflow (read + create)

Reference skill for `agt-jira-workflow`. Use when reading or creating issues in Jira Cloud for the organization.

## Sources of truth

- [JIRA.md](../../JIRA.md) — toolkit index and defaults
- [agt-jira-workflow](../../agents/agt-jira-workflow.md) — orchestrator agent
- `~/.cursor/mcp.json` — credentials (`JIRA_INSTANCE_URL`, `JIRA_USER_EMAIL`, `JIRA_API_KEY`)

## Default configuration

| Setting | Value |
|---------|-------|
| Instance | `https://sauvvitech-team.atlassian.net` |
| Project key | `SV` |
| Story issuetype id | `10003` |
| Subtask issuetype id | `10005` |
| Read tool | MCP server `user-jira-mcp` |
| Create tool | `curl` + REST API v3 |

**Never** commit credentials or API tokens to the repository.

---

## Authentication

Jira Cloud uses Basic Auth with email + API token:

```bash
curl -u "$JIRA_USER_EMAIL:$JIRA_API_KEY" \
  "$JIRA_INSTANCE_URL/rest/api/3/myself"
```

Load credentials from `~/.cursor/mcp.json` (server `jira-mcp` env block):

| Env var | Purpose |
|---------|---------|
| `JIRA_INSTANCE_URL` | Base URL (`https://sauvvitech-team.atlassian.net`) |
| `JIRA_USER_EMAIL` | Account email |
| `JIRA_API_KEY` | API token |

**Never** print or log `JIRA_API_KEY` in agent output.

---

## Reading issues (MCP)

The configured MCP server `user-jira-mcp` exposes read-only tools. Call `GetMcpTools` then `CallMcpTool`.

| Tool | When to use | Example args |
|------|-------------|--------------|
| `get_issue` | Single issue by key or id | `{ "issueIdOrKey": "SV-1487" }` |
| `jql_search` | List/search issues | `{ "jql": "parent = SV-1487", "maxResults": 50 }` |

### Useful JQL

| Goal | JQL |
|------|-----|
| Subtasks of a story | `parent = SV-1487` |
| Recent stories | `project = SV AND issuetype = Story ORDER BY created DESC` |
| My open issues | `assignee = currentUser() AND status != Done` |
| Issues in sprint | `project = SV AND sprint in openSprints()` |

---

## Creating issues (REST API)

The MCP does **not** expose `create_issue`. Use REST API v3 via `curl`.

### Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Verify user / get accountId | GET | `/rest/api/3/myself` |
| Create issue | POST | `/rest/api/3/issue` |

### Resolve assignee accountId

```bash
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_KEY" \
  "$JIRA_INSTANCE_URL/rest/api/3/myself" | jq -r '.accountId'
```

### Story payload

```json
{
  "fields": {
    "project": { "key": "SV" },
    "summary": "feat(scope) Story title",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Story description." }]
        }
      ]
    },
    "issuetype": { "id": "10003" },
    "assignee": { "id": "<accountId>" }
  }
}
```

### Subtask payload

```json
{
  "fields": {
    "project": { "key": "SV" },
    "summary": "feat(scope) Subtask title",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Subtask description." }]
        }
      ]
    },
    "issuetype": { "id": "10005" },
    "parent": { "key": "SV-XXXX" },
    "assignee": { "id": "<accountId>" }
  }
}
```

Create the **Story first**, then subtasks with `parent` set to the story key.

---

## ADF (Atlassian Document Format)

API v3 does **not** accept Markdown in `description`. Use ADF.

### Simple paragraph

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Description text here." }]
    }
  ]
}
```

### Multiple paragraphs

One `paragraph` block per text block:

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "First paragraph." }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Second paragraph." }]
    }
  ]
}
```

### Bold text

```json
{
  "type": "text",
  "text": "bold",
  "marks": [{ "type": "strong" }]
}
```

### Bullet list

```json
{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Item 1" }]
        }
      ]
    },
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Item 2" }]
        }
      ]
    }
  ]
}
```

### ADF rules

- One `paragraph` per plain text block
- Lists use `bulletList` or `orderedList` with `listItem` → `paragraph`
- Bold uses `marks: [{ "type": "strong" }]`
- Never send raw Markdown in `description`

---

## curl commands

Use temp files for large payloads (avoids shell escaping issues):

```bash
# Create story
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST "$JIRA_INSTANCE_URL/rest/api/3/issue" \
  -d @/tmp/jira-story.json

# Create subtask
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST "$JIRA_INSTANCE_URL/rest/api/3/issue" \
  -d @/tmp/jira-subtask.json
```

Extract the created key:

```bash
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST "$JIRA_INSTANCE_URL/rest/api/3/issue" \
  -d @/tmp/jira-story.json | jq -r '.key'
```

Issue URL pattern: `https://sauvvitech-team.atlassian.net/browse/<KEY>`

---

## Title convention

Follow the project pattern for summaries:

```text
feat(<scope>) <short description>
```

Examples:

```text
feat(st-packages) CSV and PDF export module for tabular reports
feat(st-packages) CSV generator with RFC 4180 escaping and UTF-8 BOM
```

---

## Planning output format

Before creating issues, present a table:

| Order | Type | Summary | Parent |
|-------|------|---------|--------|
| 1 | Story | `feat(st-packages) CSV and PDF export module...` | — |
| 2 | Subtask | `feat(st-packages) CSV generator...` | (story key) |
| 3 | Subtask | `feat(st-packages) PDF generator...` | (story key) |

Ask for user approval unless they explicitly requested creation.

---

## Real reference example

Story **SV-1487** with subtasks **SV-1488** through **SV-1493** — export module in `st-packages`, titles `feat(st-packages) ...`.

Creation flow used:

1. `GET /myself` → accountId
2. `POST /issue` → SV-1487 (Story)
3. `POST /issue` × 6 → SV-1488…SV-1493 (Subtasks with `parent: { "key": "SV-1487" }`)

---

## Safety rules

- **Never** create issues without explicit user request
- **Never** commit tokens or credentials
- **Never** log `JIRA_API_KEY` in output
- Convert descriptions to ADF before POST
- Create Story before Subtasks (parent required)
