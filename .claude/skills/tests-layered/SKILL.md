---
name: tests-layered
description: >-
  Creates or extends Jest tests in this repository mirroring layers: integration
  controller/service/repository (read/write), service unit tests, fixtures and
  coverage ≥80%. Mandatory describe=when / it=should naming and strict mock
  policy. Use via agt-test-author, after changing src/, or when asking for
  integration, unit tests or coverage.
disable-model-invocation: true
---

# Skill: layered tests (`src/__tests__`)

Read [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§8) and [AGENTS.md](../../../AGENTS.md) (§4).

Primary agent: [`agt-test-author`](../../agents/sdd/agt-test-author.md).
Stabilize failures with [`agt-test-runner`](../../agents/sdd/agt-test-runner.md).
QA PLAN/VERIFY: [`agt-quality-assurance`](../../agents/sdd/agt-quality-assurance.md).

## Folder structure (mirror `user`)

```text
src/__tests__/
  __mocks__/<context>.mock.ts
  integration/<context>/
    controller/*.int.test.ts
    service/*.int.test.ts
    repository/read/*.int.test.ts
    repository/write/*.int.test.ts
  unit/<context>/service/*.unit.test.ts   # when repo has the pattern
```

## Naming (mandatory)

```ts
describe('when <context>', () => {
  it('should <expected behavior>', async () => {
    // arrange
    // act
    // assert
  });
});
```

Do not use SUT-name-only describes for new tests.

## Scenario checklist

For each operation under test, cover applicable cases:

- Happy path (result + relevant side effects)
- Invalid input / entity validation
- Not found (`404` / `RESOURCE_NOT_FOUND`) — assert in **Service**, not Repository
- Conflict / uniqueness (`409`) — **Service**
- Auth / permission when the route uses `authorizeByGroup`
- Invalid state transition when a state machine exists
- Idempotency / retry when design or Kafka requires it
- Event emitted on success; event **not** emitted when persistence fails
- Repository: `null` vs found; adapter mapping; DB error → `DATABASE_ERROR`
- Controller: HTTP status + body; error translation; do not retest every service branch

## Mock policy

### Do not

- Mock the system under test
- Mock Repository Read/Write in a **Service** test — use `*ServiceFactory.create()` + test Mongo (or an in-memory fake only if the service already uses that pattern)
- Use indiscriminate `jest.mock` on internal modules of the layer under test
- Put Repository doubles in `__mocks__/` — that folder is for **data fixtures** (`validUserMock`)

### Do — prefer `jest.spyOn`

- External services (HTTP client, SDK, email, third-party APIs)
- Kafka producers / handlers (injected interface): spy on `produce` / handler
- Clock / UUID only when the assertion needs a fixed value

## By layer

### Controller (HTTP)

- `supertest` against `app` from integration setup.
- Assert `statusCode` and JSON body.
- Optional: verify persistence with `*Model` after POST/PUT/DELETE.
- Reference: [`create-user.int.test.ts`](../../../examples/canonical-user/src/__tests__/integration/user/controller/create-user.int.test.ts).

### Service (business)

- Instantiate via `*ServiceFactory.create()` — **no** HTTP.
- **Do not** mock the Repository.
- Data fixture with `validUserMock` or `UserModel.create` for conflict scenarios.
- Assert errors with `errorCode` + `ErrorCatalog`.
- Spy external / Kafka dependencies with `jest.spyOn` when present.
- Reference: [`create-user.int.test.ts`](../../../examples/canonical-user/src/__tests__/integration/user/service/create-user.int.test.ts) (service).

### Repository (persistence)

- Test concrete Read/Write implementation separately.
- Folders `repository/read/` and `repository/write/` (light CQRS).
- Return `null` when missing — never product 404/409.
- Reference: [`find-user-by-id.int.test.ts`](../../../examples/canonical-user/src/__tests__/integration/user/repository/read/find-user-by-id.int.test.ts).

## Conventions

- Suffix `*.int.test.ts` for integration; `*.unit.test.ts` for unit.
- Shared fixtures in [`__mocks__/user.mock.ts`](../../../examples/canonical-user/src/__tests__/__mocks__/user.mock.ts) (`validUserMock`).
- English `when` / `should` descriptions.

## Commands

| Command | Use |
|---------|-----|
| `yarn test` | Full suite |
| `yarn test:coverage` | Coverage target ≥ 80% |
| `yarn lint` | ESLint after changes |

## Checklist

- [ ] New behavior has a test in the layer where the logic lives
- [ ] `describe('when …')` / `it('should …')` on every new suite
- [ ] Controller: happy path + at least one relevant HTTP error
- [ ] Service: conflict / not found when applicable; Repository **not** mocked
- [ ] External / Kafka interactions use `jest.spyOn` when applicable
- [ ] Repository: read and write in correct files/folders
- [ ] `yarn test` and `yarn test:coverage` pass

## Related skills

- New endpoint: [add-http-endpoint](../add-http-endpoint/SKILL.md)
- Errors: [domain-errors](../domain-errors/SKILL.md)
- Kafka: [kafka-messaging](../kafka-messaging/SKILL.md)
- QA plan/report: [quality-assurance](../quality-assurance/SKILL.md)
