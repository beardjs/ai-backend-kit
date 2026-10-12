# Template RCA / Post Mortem

```markdown
# RCA: <what broke> — <impact on the flow>

<One line: immediate cause.>

| | |
|---|---|
| Incident | <ID> |
| Date | YYYY-MM-DD |
| Window | HH:MM – HH:MM (N minutes) |
| Severity | P1 — Critical / P2 — High / P3 — Medium — <why> |
| Status | Resolved / Mitigated / In progress |
| Affected environment | Production |
| Affected service | <service> |
| On-call OPS | <name, if any> |

## Executive summary

On YYYY-MM-DD, between HH:MM and HH:MM, <service> presented <failure>. <Affected flows>. The instability was caused by <cause in one sentence>.

The immediate action was <rollback / hotfix / …>, which restored the service at HH:MM.

## Root cause

<What failed at runtime and by which mechanism.>

Process cause: <what failed to block this before production.>

## Business impact

During <duration>:

| | |
|---|---|
| Affected flows | <concrete list> |
| Volume | <requests / orders / unique users> |
| Proportion | <N% of <total in the same window> — or “not measured”> |
| Duration | <start–end> |

## Timeline

| Time | Event |
|---|---|
| HH:MM | Instability started |
| HH:MM – HH:MM | Flows unavailable / degraded |
| HH:MM | Mitigation complete. Service restored |

## Immediate actions

- <What restored the service.>
- <How recovery was confirmed.>

## Medium- and long-term actions

- <Cause fix, validated in dev/staging before returning to prod.>
- <Regression guard (lint, test, alert).>

## Lessons learned

- <Test or validation missing on the critical path.>
- <Automatic control that must not depend only on human review.>

## Conclusion

<Cause, main impact number, what restored service, what prevents recurrence.>

Document generated on YYYY-MM-DD. On-call OPS: <name or “—”>.
```

## Structure reference

Title: what + impact (`RCA: GERAL API instability — order flows`).
Subtitle: cause in one line (`Invalid import in the command routine impacting the order command`).

The summary already states window, flows, cause, and mitigation. Impact carries volume and % in the same interval. Immediate actions = what already restored service; medium term = fix + prevention.
