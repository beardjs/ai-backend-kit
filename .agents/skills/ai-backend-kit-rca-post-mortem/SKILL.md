---
name: rca-post-mortem
description: >-
  Writes RCA / post-mortem incident reports (executive summary, root cause,
  quantified impact, timeline, immediate vs preventive actions, lessons). Use
  when the user asks for RCA, post mortem, postmortem, incident analysis, root
  cause, or an incident document.
---

# RCA / Post Mortem

Write one factual incident document. Fill every section of [template.md](template.md).
Do not invent counts, percentages, timestamps, or causes.

Write in the language of the user request. Default path:
`docs/incidents/<incident-id>-rca.md`. Default timezone: America/Sao_Paulo (BRT).

1. Collect evidence (logs, metrics, deploy, database, gateway) with source and retention.
2. Set the window and severity (P1 critical path down / P2 material degradation / P3 localized).
3. State one immediate technical cause, plus process cause if it shipped unblocked.
4. Quantify impact with unique entities (not retries) and % only with a measured denominator.
5. Timeline: start → effect → mitigation → recovery confirmation.
6. Split actions: what already restored service vs fix + regression guard.
7. Conclusion restates cause, the main number, and what remains.

Never blame people. PII totals in the body; nominative lists only if asked, as an appendix.
If the log window starts at retention, write “first visible occurrence”, not “absolute start”.
