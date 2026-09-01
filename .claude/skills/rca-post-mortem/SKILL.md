---
name: rca-post-mortem
description: >-
  Writes RCA / post-mortem incident reports (executive summary, root cause,
  quantified impact, timeline, immediate vs preventive actions, lessons). Use
  when the user asks for RCA, post mortem, postmortem, incident analysis, root
  cause, or an incident document.
---

# RCA / Post Mortem

One document: what broke, why, impact, timeline, what was done, and what prevents recurrence.

Write the RCA in the **language of the user request**. This skill is English (kit convention). Tone: factual, role-based (e.g. on-call OPS) — never blame people.

Before writing, read [template.md](template.md) and fill every section. Do not invent counts, percentages, timestamps, or causes.

Default output: `docs/incidents/<incident-id>-rca.md` unless the user names another path. Timestamps use the incident timezone (default **America/Sao_Paulo / BRT** unless specified).

Invoke as **`/rca-post-mortem`**.

## Workflow

1. **Evidence** — logs, metrics, deploy, database, gateway. Note source and retention.
2. **Window and severity** — times in the incident timezone.
3. **Cause in one sentence** — technical and, if present, process.
4. **Impact** — named flows + volume. Percentages only with a measured denominator in the same window.
5. **Timeline** — start → effect → mitigation → recovery confirmation.
6. **Actions** — already done (immediate) vs preventive (medium/long term).
7. **Write** using the template. Conclusion restates cause, the main number, and what remains.

## Severity

| Level | Use |
|---|---|
| **P1 — Critical** | Business path stopped. Primary operation unavailable. |
| **P2 — High** | Material degradation, limited blast radius, or workaround. |
| **P3 — Medium** | Localized failure, critical path still up. |

## Evidence

- State a cause only with a log, metric, payload, deploy, or dashboard that shows it.
- Retries, reprocessing, and queues inflate volume: count **unique** entities (user, order, request id), not attempts.
- If the window starts at the log retention edge, write “first **visible** occurrence”, not “absolute start”.
- PII (document, email, phone): totals in the RCA body. Nominative lists only if asked, as an appendix.
- Do not mix “did not generate the charge/operation” with “customer in arrears” without due-date evidence.

## Root cause

1. **Technical** — what failed at runtime (e.g. invalid import, timeout, 5xx).
2. **Process** — why it shipped (lint, test, staging, alert).

One immediate cause. No list of hypotheses.

## Numbers

Include when available: duration, broken volume, proportion in the same interval, measurement source.

Forbidden: “many”, “almost all”, % without a total.

## Actions

- **Immediate:** what restored the service (rollback, hotfix, restart).
- **Medium/long:** fix + regression guard (test, lint, alert).
- One sentence, one verb. No empty “improve monitoring”.

## Checklist

- [ ] Metadata (ID, date, window, severity, status, environment, service, on-call)
- [ ] Executive summary: what, when, why, what was done
- [ ] Technical and process cause
- [ ] Impact with a number (and % if a denominator exists)
- [ ] Timeline
- [ ] Immediate vs preventive
- [ ] Nothing invented
