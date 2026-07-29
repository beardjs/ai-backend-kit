---
name: skill-product-refinement
description: >-
  Reusable product refinement procedure for converting requests into versioned,
  traceable, and testable requirements. Includes ambiguity handling, slicing,
  business-rule extraction, acceptance-criteria design, Definition of Ready,
  and specification update rules.
---

# Product Refinement Skill

Use this skill when creating or reviewing a specification under `docs/specs/`.

## Goal

Produce a specification that:

- Describes product behavior independently from implementation
- Distinguishes facts from assumptions
- Enables QA to derive test cases directly
- Enables architecture and engineering to design without guessing business behavior
- Preserves decisions over time through versioning and stable identifiers

## Inputs

Possible inputs:

- User request
- Jira card
- Incident report
- Existing specification
- Current API contract
- Current code behavior
- Product decision or meeting note

## Output

Primary:

```text
docs/specs/<feature-slug>/requirements.md
```

Optional:

```text
docs/specs/<feature-slug>/design.md
docs/specs/<feature-slug>/tasks.md
```

## Procedure

### Step 1 — Normalize the request

Extract:

- Request type
- Actor
- Trigger
- Desired outcome
- Business impact
- Current behavior
- Expected behavior
- Constraints
- Explicit exclusions
- Unknowns

Separate product behavior from proposed implementation.

Example:

```text
Raw request:
"Add scheduledBy to appointment when backoffice changes the status."

Product behavior:
"The system must retain who performed the transition to SCHEDULED for audit
and productivity analysis."

Technical suggestion:
"Add a field to MongoDB."
```

Only the first statement belongs in product requirements.

### Step 2 — Classify every material statement

Use:

- `Confirmed`
- `Assumption`
- `Open question — blocking`
- `Open question — non-blocking`
- `Approved decision`

Never hide an assumption inside an acceptance criterion.

### Step 3 — Slice by value

For large features, prefer the smallest end-to-end slice that creates business value.

A valid slice includes:

- One primary actor outcome
- Required business rules
- Observable result
- Error or invalid-state behavior
- Minimum operational visibility

Do not slice only by technical layer.

Bad slicing:

```text
Task 1: schema
Task 2: repository
Task 3: controller
```

Better product slicing:

```text
Slice 1: retain and expose the scheduling operator for newly scheduled appointments
Slice 2: historical backfill
Slice 3: productivity dashboard
```

### Step 4 — Extract business rules

A business rule:

- Applies independently from a UI or endpoint
- Constrains eligibility, state, value, timing, authorization, or side effects
- Can be referenced by multiple acceptance criteria

Rule checklist:

- Eligibility
- Permissions
- State transitions
- Uniqueness
- Limits and thresholds
- Time windows
- Idempotency
- Audit data
- Notifications and events
- Failure behavior
- Data retention

### Step 5 — Model flows

At minimum, consider:

- Happy path
- Invalid input
- Unauthorized actor
- Invalid state transition
- Resource not found
- Duplicate/repeated request
- Partial dependency failure
- Retry behavior
- Existing-data compatibility
- Operational/audit visibility

Only include cases relevant to the feature.

### Step 6 — Write acceptance criteria

Use one observable behavior per criterion.

Recommended structure:

```md
### AC-01 — <title>

Traceability:
- US-01
- BR-01

Given <precondition>
And <additional context>
When <actor action or event>
Then <observable result>
And <required side effect>
```

Quality test:

1. Can QA produce at least one positive or negative test from it?
2. Can the result be objectively observed?
3. Could the criterion fail?
4. Does it avoid framework, class, database, and method details?
5. Does it define the relevant actor, state, or permission?
6. Is the expected error or side effect explicit?

### Step 7 — Add NFRs only when meaningful

Possible categories:

- Performance
- Reliability
- Availability
- Auditability
- Security expectation
- Privacy
- Accessibility
- Compatibility
- Data retention
- Volume
- Observability
- Idempotent user-visible behavior

State the expectation, not the technical solution.

Bad:

```text
Use Redis to respond in under 100 ms.
```

Better:

```text
NFR-01: The operation must complete within the existing API latency budget at
the expected peak volume.
```

### Step 8 — Define out-of-scope

Each exclusion should state why it is excluded:

- Deferred
- Separate feature
- Unsupported by design
- Requires a future decision

This protects delivery from implicit scope growth.

### Step 9 — Define metrics

Useful metrics connect the feature to product or operational value.

Include:

- Metric definition
- Baseline, if known
- Target or expected direction
- Measurement window
- Data source, if known

Do not invent baselines.

### Step 10 — Run Definition of Ready

Block approval when:

- Desired behavior is contradictory
- A financial or compliance rule is unknown
- Actor authorization is undefined and materially affects behavior
- State transition rules are unknown
- Destructive behavior is ambiguous
- Required external dependency ownership is unknown

Do not block approval only because a detailed implementation choice is pending.

## Review rubric

Score each dimension as `PASS`, `PARTIAL`, or `FAIL`:

- Problem clarity
- Business value
- Actor clarity
- Rule completeness
- Flow completeness
- Acceptance testability
- Error behavior
- Permission behavior
- Scope boundaries
- Assumption visibility
- Traceability
- Metrics
- Versioning

A specification is ready for review only when there is no `FAIL` in a behavior-critical
dimension.

## Anti-patterns

- Jira-title-as-requirement
- Technical task presented as user value
- Hidden assumptions
- Acceptance criteria that say “works correctly”
- Only happy-path criteria
- Missing authorization behavior
- Missing invalid-state behavior
- Out-of-scope omitted
- Existing approved behavior overwritten
- Metrics invented without a source
- Requirements depending on the original conversation