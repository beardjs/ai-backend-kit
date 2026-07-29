# Description

<!-- Brief description of what this kit PR does and why. -->

Fixes # (issue)

## What has changed?

- [ ] Bug fix (non-breaking)
- [ ] Enhancement to rules / agents / skills / docs
- [ ] Breaking change for consuming services (call out migration in CHANGELOG)
- [ ] Sync script / CI / adoption tooling
- [ ] `VERSION` / `CHANGELOG.md` bump

# How should this be tested?

1. `bash -n scripts/sync-cursor.sh`
2. `./scripts/sync-cursor.sh /tmp/kit-fixture --dry-run` (or CI workflow)
3. Review `CHANGELOG.md` for consumer-facing notes

- [ ] Sync dry-run against a fixture succeeds
- [ ] Internal markdown links checked (CI)
- [ ] ADOPTION.md still matches script flags

# Checklist:

- [ ] Docs and indexes updated (`RULES.md` / `SKILLS.md` / `WORKFLOW.md` / `README.md` as needed)
- [ ] Self-review completed
- [ ] No AI attribution in commits or PR body
- [ ] Kit `VERSION` + `CHANGELOG.md` updated when the change is consumer-visible
