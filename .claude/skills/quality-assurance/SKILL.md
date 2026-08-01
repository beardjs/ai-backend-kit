---
name: quality-assurance
description: >-
  Reusable QA procedure for deriving traceable test plans from approved
  requirements, selecting the correct test level, validating layered
  architecture, routing test authoring to agt-test-author, classifying
  defects, and producing release evidence (VERIFY).
---

# Quality Assurance Skill

Use this skill to create test plans, request automated test authoring, verify
implementations, and produce QA evidence.

Jest **authoring** is owned by [`agt-test-author`](../../agents/sdd/agt-test-author.md)
and [`tests-layered`](../tests-layered/SKILL.md). Do not write
`src/__tests__/**` from this skill.

## Goal

Provide evidence that:

- Approved behavior works
- Invalid and unauthorized behavior is rejected correctly
- Existing behavior is not unintentionally broken
- API and event contracts remain compatible
- Layer boundaries remain respected
- Test results are reproducible

## Input contract

Required when available:

- `requirements.md`
- `design.md`
- `test-plan.md`
- Implementation diff
- API contract
- Existing test conventions
- Repository scripts

Do not treat an unapproved requirement as a final oracle.

## Output contract

Depending on mode:

```text
docs/specs/<feature-slug>/test-plan.md     # PLAN (+ optional traceability updates)
docs/specs/<feature-slug>/qa-report.md     # VERIFY
```

Automated tests under `src/__tests__/**` are produced by **`agt-test-author`**,
not by this skill.
## Requirement-to-test transformation

For every `AC-*`, determine:

1. Preconditions
2. Actor and authorization
3. Trigger
4. Expected result
5. Expected side effects
6. Forbidden side effects
7. Error behavior
8. Relevant boundaries
9. Persistence or event consequences
10. Regression surface

Create one or more `TC-*`.

Example:

```md
### TC-01 — Store operator on a valid scheduling transition

Traceability:
- AC-01
- BR-01

Priority: P0
Level: Domain unit + Infrastructure integration

Given:
- Appointment is eligible for scheduling
- Authenticated operator identifier is available

When:
- Status changes to SCHEDULED

Then:
- Operator identifier is retained
- Existing appointment data remains unchanged
- Persistence receives the expected domain value
```

## Test-level selection

Choose the lowest level that proves the behavior reliably.

Use **unit** when:

- Behavior is deterministic
- Dependencies can be represented by interfaces
- The concern is a business rule or orchestration

Use **integration** when:

- Mongo query behavior matters
- Schema conversion matters
- Adapter mapping matters
- Express/OpenAPI integration matters
- Factory wiring matters

Use **contract** when:

- Request/response/event compatibility matters

Use **end-to-end** only when:

- Multiple boundaries must be proven together
- The repository has a safe environment and an established E2E strategy
- Lower levels cannot provide sufficient evidence

Avoid proving the same rule redundantly at every level.

## Layer-specific checklist

### Domain

Verify:

- No import from `src/infraestructure`
- No Mongoose or concrete Kafka dependency
- Business rules reside in service/entity
- Repository and messaging dependencies are interfaces
- Domain error behavior is explicit
- State transitions are validated
- Persistence/event interaction order matches requirements

### Application

Verify:

- Controller extracts HTTP input
- Controller delegates to service
- Controller returns correct status and body
- Controller uses existing error translation pattern
- No repository/model access
- No duplicated business decision

### Infraestructure

Verify:

- Repository implements domain interface
- Repository returns domain object or `null` according to contract
- Adapter maps `IM*` and `I*` correctly
- Adapter has no side effect
- Mongo details do not leak to Domain/Application output
- Kafka implementation satisfies the domain contract
- No product-level 404/conflict/state rule is decided here

### Configuration

Verify:

- Factories compose the expected graph
- No business branching
- Correct implementations are injected
- Environment access follows existing convention

### Contracts

Verify:

- Route and payload changes are reflected in `service.yaml`
- Required fields, response schemas, and status codes match behavior
- Backward compatibility is explicit
- Runtime OpenAPI validation remains compatible

## Test design heuristics

Consider only relevant dimensions:

- Valid input
- Missing required input
- Invalid type or format
- Boundary values
- Duplicate input
- Existing resource
- Missing resource
- Authorized actor
- Unauthorized actor
- Forbidden actor
- Valid state transition
- Invalid state transition
- First execution
- Repeated execution
- Dependency success
- Dependency failure
- Retry
- Partial failure
- Event emitted
- Event not emitted
- Audit field retained
- Existing records without new field
- Concurrency
- Time/date boundaries
- Localization/error catalog behavior

## Test doubles (for PLAN guidance / VERIFY review)

Authoring policy is defined in the `tests-layered` skill / `.claude/rules/tests.md`. When
reviewing or planning, enforce:

- Do **not** mock Repository in Service tests
- Prefer `jest.spyOn` for external services and Kafka producers/handlers
- `__mocks__/` holds data fixtures, not Repository doubles
- Do not mock the unit under test
- Reset state between tests; avoid global mutable fixtures
- Builders should create valid defaults and allow explicit overrides

## Mongo integration guidance

For repository tests (authored by `agt-test-author`):

- Use the project's isolated test database strategy
- Clear only owned test collections
- Create data through test builders
- Assert both persisted representation and domain output when mapping is relevant
- Include old-document compatibility when a new optional field is introduced
- Test uniqueness/index behavior only when it is part of expected behavior
- Avoid broad database cleanup against shared environments

## Kafka guidance

Prefer validation with injected producer or consumer interfaces and `jest.spyOn`.

Verify:

- Correct message type
- Correct payload
- Publication only after successful persistence when required
- No publication when the operation fails
- Retry/idempotency expectations
- Consumer dispatch to the correct handler
- Unknown message behavior

Use a real broker only through an existing safe integration setup.

## AUTOMATE mode

1. Report to the main conversation that `agt-test-author` should be dispatched with `test-plan.md` and implementation scope.
2. Confirm suites use `describe('when …')` / `it('should …')`.
3. Update TC → file/title traceability in `test-plan.md` only.
4. Report that `agt-test-runner` should be dispatched if the suite is unhealthy for tooling reasons.

## Defect evidence standard

A defect is valid only when it includes:

```md
DEF-01 — <title>
Severity: BLOCKER | CRITICAL | MAJOR | MINOR | TRIVIAL
Traceability: AC-01, BR-01

Preconditions:
- ...

Steps:
1. ...
2. ...

Actual:
- ...

Expected:
- ...

Evidence:
- Test file and test title
- Command output
- Relevant log or response
```

Do not claim root cause unless evidence supports it. Use “suspected layer” when uncertain.

## Architecture finding standard

Use:

```md
ARCH-01 — <title>
Severity: blocking | non-blocking
Rule: <violated architecture invariant>
Evidence: <file/import/behavior>
Impact: <testability, coupling, behavior, or maintainability>
Recommended owner: <agent>
```

QA should report the violation, not refactor production code.

## Execution strategy

Run in this order:

1. Narrow test for the affected behavior
2. Related module suite
3. Contract/integration checks
4. Full test suite
5. Coverage
6. Type check
7. Lint
8. Formatting check
9. Build, when relevant

Discover exact commands from the repository.

Record:

- Command
- Exit result
- Relevant summary
- Blocker, if not executable

## Exit criteria

Release-quality verification requires:

- All P0 tests executed and passing
- All P1 tests executed and passing, or explicitly accepted risk
- Acceptance criteria mapped
- No unresolved blocker/critical defect
- No unaccepted major defect
- Required contracts synchronized
- No blocking architecture finding
- Regression suite executed
- Coverage result recorded
- Blocked checks explicitly listed
- Residual risks explicit

## Anti-patterns

- Writing tests from implementation without reading requirements
- QA writing Jest files directly instead of routing to `agt-test-author`
- Asserting private methods or incidental call counts
- Making a failing expectation match broken code
- Testing every branch through HTTP
- Mocking the unit under test
- Mocking Repository in Service tests
- Using arbitrary timers or sleeps
- Depending on test order
- Calling production systems
- Reporting PASS from static inspection only
- Treating 80% coverage as complete quality
- Hiding skipped tests
- Putting fixtures outside the test boundary without explicit approval
