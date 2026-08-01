# REST reference — method, situation, status

Use with [SKILL.md](SKILL.md). Align controller, service throws, and `service.yaml`.

| HTTP method | Situation | Typical status | Service / notes |
|-------------|-----------|----------------|-----------------|
| GET | List collection | 200 | `listUsers()` — array body |
| GET | Read by id | 200 | `getUserById` — 404 if not found |
| POST | Create resource | 201 | `createUser` — 409 on conflict |
| PUT | Full/partial update by id | 200 | `updateUserById` — 404 if missing |
| DELETE | Remove by id | 200 or 204 | `deleteUserById` — 404 if missing |
| GET | Filter collection | 200 | Prefer `GET /users?email=` over `/users/by-email` |
| — | Auth middleware (`authorizeByGroup`) | 400, 403 | Document in YAML when route uses middleware |
| — | Validation (OpenAPI / validator) | 400 | `ValidationError` schema |
| — | Database failure | 500 | Repository → `DATABASE_ERROR` |

## Path patterns

| Pattern | Example | Use |
|---------|---------|-----|
| Collection | `/users` | List, create |
| Item | `/users/{id}` | Read, update, delete one |
| Query filter | `/users?status=ACTIVE` | Filters, not action in path |
| Avoid | `/getUsers`, `/users/all`, `/users/create` | Verb or action in URL |

## Project reference files

- Controller: `src/application/controllers/user.controller.ts`
- Contract: `src/contracts/service.yaml` — `paths` `/users`, `/users/{id}`
