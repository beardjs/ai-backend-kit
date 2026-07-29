---
name: skill-tests-layered
description: >-
  Creates or extends Jest tests in this repository mirroring layers: integration
  controller/service/repository (read/write), service unit tests, mocks and coverage ≥80%.
  Use after changing src/, or when asking for integration, unit tests or coverage.
disable-model-invocation: true
---

# Skill: layered tests (`src/__tests__`)

Read [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (§8) and [AGENTS.md](../../../AGENTS.md) (§4).

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

## By layer

### Controller (HTTP)

- `supertest` against `app` from integration setup.
- Assert `statusCode` and JSON body.
- Optional: verify persistence with `*Model` after POST/PUT/DELETE.
- Reference: [`create-user.int.test.ts`](../../../src/__tests__/integration/user/controller/create-user.int.test.ts).

### Service (business)

- Instantiate via `*ServiceFactory.create()` — **no** HTTP.
- Data mock with `validUserMock` or `UserModel.create` for conflict scenarios.
- Assert errors with `errorCode` + `ErrorCatalog`.
- Reference: [`create-user.int.test.ts`](../../../src/__tests__/integration/user/service/create-user.int.test.ts) (service).

### Repository (persistence)

- Test concrete Read/Write implementation separately.
- Folders `repository/read/` and `repository/write/` (light CQRS).
- Reference: [`find-user-by-id.int.test.ts`](../../../src/__tests__/integration/user/repository/read/find-user-by-id.int.test.ts).

## Conventions

- Suffix `*.int.test.ts` for integration.
- Shared mocks in [`__mocks__/user.mock.ts`](../../../src/__tests__/__mocks__/user.mock.ts) (`validUserMock`).
- English descriptions in `describe`/`it` (repo pattern).

## Commands

| Command | Use |
|---------|-----|
| `yarn test` | Full suite |
| `yarn test:coverage` | Coverage target ≥ 80% |
| `yarn lint` | ESLint after changes |

## Checklist

- [ ] New behavior has a test in the layer where the logic lives
- [ ] Controller: happy path + at least one relevant HTTP error
- [ ] Service: conflict / not found when applicable
- [ ] Repository: read and write in correct files/folders
- [ ] `yarn test` and `yarn test:coverage` pass

## Related skills

- New endpoint: [skill-add-http-endpoint](../skill-add-http-endpoint/SKILL.md)
- Errors: [skill-domain-errors](../skill-domain-errors/SKILL.md)
