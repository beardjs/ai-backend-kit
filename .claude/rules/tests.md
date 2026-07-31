---
paths:
  - "src/__tests__/**/*"
  - "jest/**/*"
---
# Tests (`src/__tests__`)

Follows [AGENTS.md](../../AGENTS.md) and **patterns already used** in the repo; new tests should **look like** existing ones (e.g. `integration/user/...`).

Primary author: [agt-test-author](../agents/sdd/agt-test-author.md). Skill: [tests-layered](../skills/tests-layered/SKILL.md).

## Organization (mirror by context)

- **Integration:** `integration/<context>/controller|service|repository/` — one file per flow or operation, aligned with the production folder you test.
- **Unit:** `unit/<context>/service/` (and other `unit/` folders only if the project already has precedent).
- **Shared fixtures:** `__mocks__/` (e.g. `user.mock.ts` with factories like `validUserMock(...)`) — **data only**, not Repository doubles.

## File naming

- Integration: `*.int.test.ts` (e.g. `create-user.int.test.ts`).
- Unit: `*.unit.test.ts`.

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

## Mock policy

- **Do not** mock the system under test.
- **Do not** mock Repository Read/Write in a **Service** test — use factory + test Mongo (or an existing in-memory fake pattern).
- **Do** use `jest.spyOn` for external services and Kafka producers/handlers.
- Avoid indiscriminate `jest.mock` of internal modules in the layer under test.

## Writing patterns

- **HTTP integration:** use `supertest` with the app from integration setup (e.g. import `jest/setup-integration-tests` as in current controller tests); do not duplicate bootstrap by hand unless necessary.
- **Mongo integration:** when the test validates persistence, confirm state with **model**/`UserModel` only in the test layer (acceptable in integration tests), keeping production aligned with layered architecture.
- **Assertions:** HTTP status, body (`toMatchObject`), and date/contract fields when relevant; avoid weak tests that do not assert main behavior.
- **Scenarios:** happy path, validation, not-found/conflict in Service, auth when applicable, messaging emit/non-emit, repository null vs found.

## Quality and commands

- `yarn test` runs unit + integration; coverage via `yarn test:coverage`, target **≥ 80%** lines/branches.
- Jest configs (in the **service**): `jest/jest.config.ts` (`yarn test:unit`), `jest/jest.int-config.ts` (`yarn test:int`, `--runInBand`).
- Integration setup (in the **service**): `jest/setup-integration-tests.ts` (+ `setup-db.ts`, `start-integration.ts`); reuse it instead of bootstrapping the app or DB by hand.
- New endpoints or services: add tests in the right folder and reuse existing `__mocks__` / utilities (`testUtils.ts`, `configApp.ts`) instead of reinventing setup.
- Illustrative layout: [examples/canonical-user/src/\_\_tests\_\_/](../../examples/canonical-user/src/__tests__/).
