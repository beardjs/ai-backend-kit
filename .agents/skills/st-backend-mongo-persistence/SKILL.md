---
name: mongo-persistence
description: Extend Mongoose persistence in an existing context with IM models, schemas, adapters, and read/write repositories. Use for stored fields, queries, or repository methods.
---

# Mongo persistence

1. Update Domain `I*` and repository read/write contracts first.
2. Add the Infraestructure `IM*` persisted shape, schema, and typed model.
3. Keep `dbToInternal` and `internalToDb` adapters pure.
4. Implement queries/mutations in the matching concrete repository.
5. Return `null` when missing; translate database failures to `DATABASE_ERROR`.
6. Wire new dependencies in Configuration and add repository/service coverage.

Never import Mongoose, `IM*`, schemas, or models into Domain. Repositories do
not own 404/409 or product uniqueness rules.
