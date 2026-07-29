# Test Plan — <Feature title>

feature: <feature-slug>
status: Draft
version: 0.1.0
owner: Quality Assurance
jira: <key or N/A>
createdAt: <YYYY-MM-DD>
updatedAt: <YYYY-MM-DD>
approvedBy: N/A
approvedAt: N/A

Requirements: <path> (version <x.y.z>)
Design: <path or N/A>

## Scope

### In scope

- ...

### Out of scope

- ...

## Quality risks

| Risk | Impact | Probability | Priority | Coverage |
|---|---:|---:|---:|---|
| <risk> | High | Medium | P0 | TC-01 |

## Test strategy

### Domain unit

- ...

### Application/controller

- ...

### Infrastructure integration

- ...

### Contract/OpenAPI

- ...

### Messaging

- ...

### Configuration/wiring

- ...

### Regression

- ...

## Test matrix

| ID | Traceability | Scenario | Level | Priority | Automation | Status |
|---|---|---|---|---|---|---|
| TC-01 | AC-01, BR-01 | <scenario> | Unit | P0 | Planned | Not run |

## Detailed test cases

### TC-01 — <title>

Traceability:
- AC-01
- BR-01

Priority: P0
Level: <Unit | Integration | Contract | E2E>
Automation: <Planned | Automated | Manual | Not applicable>
Test file: <path or TBD>

Given:
- ...

When:
- ...

Then:
- ...

Forbidden side effects:
- ...

Test data:
- ...

## Architecture validations

- [ ] Domain does not import Infraestructure
- [ ] Controller remains thin
- [ ] Repository contains no product-level decision
- [ ] Adapters remain pure
- [ ] Factories only compose dependencies
- [ ] OpenAPI is synchronized
- [ ] Kafka interface is in Domain and implementation in Infraestructure
- [ ] Tests are under `src/__tests__`

## Environment and data

- Environment:
- Database:
- External dependencies:
- Required fixtures:
- Credentials:
- Cleanup strategy:

## Commands

| Purpose | Command | Required |
|---|---|---|
| Targeted test | <discover from package.json> | Yes |
| Full suite | <discover from package.json> | Yes |
| Coverage | `yarn test:coverage` or repository equivalent | Yes |
| Type check | <command> | When available |
| Lint | <command> | Yes |
| Format check | <command> | Yes |
| Contract validation | <command> | When relevant |

## Entry criteria

- [ ] Requirements are approved or explicitly ready for QA planning
- [ ] Acceptance criteria are identifiable
- [ ] Test environment is known
- [ ] Required dependencies are available or can be mocked safely

## Exit criteria

- [ ] All P0 tests pass
- [ ] All P1 tests pass or risk is accepted
- [ ] No blocker/critical defect remains
- [ ] No unaccepted major defect remains
- [ ] Required contract checks pass
- [ ] Regression suite runs
- [ ] Coverage result is recorded
- [ ] Architecture findings are resolved or accepted
- [ ] Blocked checks are explicit
- [ ] Residual risks are explicit

## Assumptions

- ...

## Blockers

- ...

## Changelog

### 0.1.0 — <YYYY-MM-DD>

- Initial test plan