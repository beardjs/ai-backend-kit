---
name: skill-kafka-messaging
description: >-
  Checklist to add Kafka producer/consumer in this repository: contract in domain,
  implementation in infraestructure, factory injection and service call after persistence.
  Use when the user asks for Kafka event, async message or messaging integration.
disable-model-invocation: true
---

# Skill: Kafka (messaging)

Follow the **Messaging (Kafka)** section of [AGENTS.md](../../../AGENTS.md).

## Steps

1. **Domain** — `src/domain/<context>/messaging/<event>/`
   - Producer interface, e.g. `producer.interface.kafka.ts` (`I*` appropriate to the event)

2. **Infraestructure** — `src/infraestructure/messaging/<event>/`
   - `producer.kafka.ts` and/or `consumer.kafka.ts` implementing the contract

3. **Service** — inject producer interface; call **after** successful repository operation (when it makes business sense)

4. **Configuration** — register producer (and consumer/worker if any) in the corresponding factory, e.g. `src/configuration/factory/messaging/`

5. **Tests** — mock producer interface in service tests when applicable

## Rules

- Contract **always** in domain; implementation **always** in infraestructure.
- Do not import concrete Kafka in the domain.
