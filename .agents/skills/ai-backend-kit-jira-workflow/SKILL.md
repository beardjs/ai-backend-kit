---
name: jira-workflow
description: Read Jira issues or create/update stories and subtasks through an authorized connector or MCP tool. Mutations require an explicit user request.
---

# Jira workflow

Prefer an authorized Jira connector/MCP capability. Use available environment
variables only as a fallback; never inspect credential files or print tokens.

For reads, resolve the exact key/JQL and return status, assignee, parent, acceptance
criteria, and subtasks relevant to the request. For writes, confirm project, issue
type, parent, title, description, acceptance criteria, and assignee before acting.
Use Atlassian Document Format when the API requires it, create parent before
subtasks, stop on partial failure, and report every created/updated key and URL.

Do not create, transition, assign, or comment without explicit authorization.
