---
name: github-workflow
description: Commit intentional local changes, push a feature branch, and open a pull request when the user explicitly requests GitHub publication.
---

# GitHub workflow

Act only on explicit authorization.

1. Inspect status, diff, branch, remote, and repository PR template without modifying state.
2. Confirm the exact files belonging to the requested change; preserve unrelated work.
3. Run relevant validation before committing.
4. Create small conventional commits in dependency order with English imperative subjects.
5. Never add AI/IDE attribution, generated-by footers, or unsolicited co-author trailers.
6. Push without force and create a draft PR against the repository's configured/default base.
7. Fill every applicable PR template section with actual changes and test evidence.
8. Return commit hashes, branch, PR link, validation, and remaining risks.

Never amend unrelated commits, bypass hooks, or publish secrets.
