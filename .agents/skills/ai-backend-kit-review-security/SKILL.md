---
name: review-security
description: Audit a diff for security defects in layered TypeScript backends, including authorization, ownership, injection, mass assignment, secrets, data exposure, resource limits, and contract security.
---

# Security review

Trace untrusted input from the HTTP boundary to persistence and back. Check the
changed scope against `AGENTS.md` and the security baseline:

- Every route in `initRoutes()` guarded by `authorizeByGroup`, or publicly documented.
- Service verifies the actor may act on **this** record, not merely that they are
  authenticated (BOLA / IDOR); ownership rules never live in repository or controller.
- No `...req.body` spread into an entity or `*Model`; payload fields listed explicitly.
- No raw `req.query` / `req.params` value inside a Mongoose filter; no `$where`,
  `$function`, or regex built from user input.
- Errors returned through `handleTranslatedError` + `EErrorCode` — no stack trace,
  driver message, or raw `error.message` in the body.
- No token, credential, authorization header, PII, or full document in logs.
- List endpoints paginated with an enforced maximum; payload size bounded.
- Outbound URLs fixed by configuration, with timeouts, TLS verification enabled.
- Secrets read through named env constants; no `process.env` in the domain.
- `service.yaml` declares `securitySchemes` and `security`, and documents 401/403
  on guarded routes.

Report each finding with path, evidence snippet, OWASP reference, severity
(`blocker` | `major` | `minor` | `info`), and a concrete fix, ranked most severe
first. End with a verdict: `APPROVED` | `CHANGES_REQUESTED` | `BLOCKED`. Describe
attack paths in prose; never write or run exploits. Stay read-only.
