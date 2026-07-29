# QA Report — <Feature title>

feature: <feature-slug>
status: QA_VALIDATION
version: 0.1.0
owner: Quality Assurance
jira: <key or N/A>
createdAt: <YYYY-MM-DD>
updatedAt: <YYYY-MM-DD>
approvedBy: N/A
approvedAt: N/A

Requirements version validated: <version>
Design version validated: <version or N/A>
Test plan: <path>
Mode: AUTOMATE | VERIFY | AUTOMATE_AND_VERIFY

## Result

`PASS` | `PASS_WITH_RISKS` | `FAIL` | `BLOCKED`

## Summary

<Short summary of validation outcome.>

## Acceptance criteria results

| AC | Result | Evidence |
|----|--------|----------|
| AC-01 | PASS \| FAIL \| BLOCKED \| N/A | <test file / command> |

## Test cases executed

| TC | Priority | Level | Result | Test file |
|----|----------|-------|--------|-----------|
| TC-01 | P0 | Unit | PASS \| FAIL \| BLOCKED \| Not run | <path or N/A> |

## Commands executed

| Purpose | Command | Result |
|---------|---------|--------|
| Targeted test | <command> | PASS \| FAIL \| BLOCKED |
| Full suite | <command> | PASS \| FAIL \| BLOCKED |
| Coverage | `yarn test:coverage` or equivalent | PASS \| FAIL \| BLOCKED |
| Lint | <command> | PASS \| FAIL \| BLOCKED |
| Type check | <command> | PASS \| FAIL \| BLOCKED \| N/A |
| Contract | <command> | PASS \| FAIL \| BLOCKED \| N/A |

## Defects

### DEF-01 — <title>

Severity: BLOCKER | CRITICAL | MAJOR | MINOR | TRIVIAL
Traceability:
- AC-01
- BR-01

Preconditions:
- ...

Reproduction:
1. ...
2. ...

Actual result:
- ...

Expected result:
- ...

Evidence:
- ...

Suspected layer (optional):
- Domain | Application | Infraestructure | Configuration | Contracts

Regression risk:
- ...

Recommended owner:
- agt-dev-backend | agt-product-owner | agt-architecture

## Architecture findings

### ARCH-01 — <title>

Severity: Blocking | Non-blocking
Rule:
- ...

Evidence:
- ...

Impact:
- ...

Recommended owner:
- ...

## Blocked validations

- <validation and reason>

## Residual risks

- <risk>

## Recommendation

- Release approved | Release approved with accepted risks | Changes required | Validation blocked

## Changelog

### 0.1.0 — <YYYY-MM-DD>

- Initial QA report
