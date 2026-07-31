# No AI attribution in Git history

- **Never** include Cursor, Copilot, ChatGPT, Claude, or other AI branding in commits, PR titles, PR bodies, release notes, or changelogs.
- **Forbidden phrases** (case-insensitive), including variants and links:
  - `Made with Cursor`
  - `Generated with Claude Code`
  - `Co-authored-by: Claude` / `Co-authored-by: *cursor*`
  - `🤖 Generated with …` / similar emoji trailers
  - Any footer that advertises the IDE or AI tool used
- Commit messages and PR bodies must contain **only** Conventional Commits content and the project PR template — nothing else after the message.
- If a tool or UI would append such a trailer, **strip it** before `git commit` / `gh pr create`.
- See [agt-github-workflow](../agents/ops/agt-github-workflow.md) and the [github-workflow skill reference](../skills/github-workflow/reference.md).
