---
name: code-review
description: Review changes against requirements, architecture, contracts, and tests. Use for PR review, spec-to-code comparison, security review, or pre-merge findings.
---

# Spec-aware code review

Load specs, the implementation diff, and tests. Check correctness, authorization,
failures, compatibility, security, layer placement, wiring, contract parity, and
missing tests. Trace each finding to a requirement or execution path.

Classify findings as `BLOCKING_FUNCTIONAL`, `BLOCKING_ARCHITECTURE`,
`BLOCKING_SECURITY`, `BLOCKING_CONTRACT`, `NON_BLOCKING_IMPROVEMENT`, `STYLE`,
or `QUESTION`. Lead with severity-ordered findings and file references, then give
the verdict. Remain read-only and avoid subjective refactor requests.
