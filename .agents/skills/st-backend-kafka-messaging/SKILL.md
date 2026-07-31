---
name: kafka-messaging
description: Add or change Kafka producers and consumers while keeping contracts in Domain and concrete messaging in Infraestructure. Use for events, async messages, retries, or consumers.
---

# Kafka messaging

1. Define event payloads and producer/consumer interfaces in Domain.
2. Implement concrete Kafka clients in Infraestructure.
3. Inject interfaces through Configuration factories.
4. Publish only after the relevant persistence operation succeeds, unless the
   approved design specifies an outbox or transaction strategy.
5. Define topic, key, versioning, idempotency, retry, poison-message, and
   observability behavior in design/contract artifacts.
6. Test service calls with `jest.spyOn` on the injected interface and test
   serialization/integration at the appropriate boundary.

Domain must never import concrete Kafka libraries or clients.
