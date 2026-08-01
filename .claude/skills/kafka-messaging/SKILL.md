---
name: kafka-messaging
description: >-
  Checklist to add Kafka producer/consumer in this repository: contract in domain,
  implementation in infraestructure, factory injection and service call after persistence.
  Use when the user asks for Kafka event, async message or messaging integration.
disable-model-invocation: true
---

# Skill: Kafka (messaging)

Follow **§10 Messaging (optional)** in [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (Kafka contracts in domain; concrete producers/consumers in infraestructure).

## Steps

1. **Domain** — `src/domain/<context>/messaging/<event>/`
   - Producer interface, e.g. `producer.interface.kafka.ts` (`I*` appropriate to the event)

2. **Infraestructure** — `src/infraestructure/messaging/<event>/`
   - `producer.kafka.ts` and/or `consumer.kafka.ts` implementing the contract

3. **Service** — inject producer interface; call **after** successful repository operation (when it makes business sense)

4. **Configuration** — register producer (and consumer/worker if any) in the corresponding factory, e.g. `src/configuration/factory/messaging/`

5. **Tests** — use `jest.spyOn` on the injected producer interface in service tests when applicable (do not mock the Repository). See [`agt-test-author`](../../agents/sdd/agt-test-author.md) / [`tests-layered`](../tests-layered/SKILL.md).

## Rules

- Contract **always** in domain; implementation **always** in infraestructure.
- Do not import concrete Kafka in the domain.
