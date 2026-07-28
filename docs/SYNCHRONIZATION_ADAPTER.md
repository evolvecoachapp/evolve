# Synchronization Adapter Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the Synchronization Adapter Foundation — a deterministic local synchronization engine implementing Infrastructure Synchronization Contracts.  
**Source of Truth:** Yes — for Sprint 30.4 Synchronization Adapter Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-102), [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

The Synchronization Adapter Foundation is the first synchronization infrastructure adapter. It fully implements Infrastructure `SynchronizationAdapter` contracts using a deterministic local Synchronization Engine.

It is:

- An Infrastructure Adapter only
- Bound to Synchronization Contracts (Phase 29)
- Registered in the Composition Root
- Replaceable by future remote providers without Domain changes

It is **not**:

- Part of the Domain
- Cloud synchronization
- Networking / HTTP / REST / GraphQL / Supabase / Firebase / PostgreSQL / sockets
- Persistence / background services / retries over network
- Business logic / synchronization execution

---

## Architecture

```
Application
      │
      ▼
Synchronization Contract
      │
      ▼
Synchronization Adapter
      │
      ▼
Synchronization Engine
      │
      ▼
Future Remote Provider
```

The Domain depends only on Synchronization Contracts. Future providers (Supabase, PostgreSQL API, Firebase, Custom Backend) plug into this engine via `SynchronizationRegistry` without changing the Domain.

---

## Structure

```
app/src/infrastructure/synchronization/
  engine/
  operations/
  queue/
  policies/
  conflicts/
  state/
  registry/
  validation/
  application/
  models/
  index.ts
```

---

## Models

All immutable:

- `SynchronizationState`
- `SynchronizationOperation`
- `SynchronizationBatch`
- `SynchronizationQueue`
- `SynchronizationConflict`
- `SynchronizationPolicy`
- `SynchronizationMetadata`
- `SynchronizationStatistics`
- `SynchronizationCapabilities`
- `SynchronizationResult`
- `SynchronizationCheckpoint`

---

## Engine

- `SynchronizationEngine` — local orchestration; implements `SynchronizationAdapter`
- `SynchronizationCoordinator`
- `SynchronizationValidator`
- `SynchronizationBatchProcessor`
- `SynchronizationStateManager`

No networking. No HTTP. No backend. Only orchestration.

---

## Operations

Deterministic local operations:

- `enqueue()`
- `dequeue()`
- `peek()`
- `markCompleted()`
- `markFailed()`
- `cancel()`
- `clear()`
- `retry()`

No remote execution.

---

## Queue

Immutable FIFO queue management via `SynchronizationQueueManager`.

- Stable ordering
- No background workers

---

## Policies

Represent only:

- Manual
- Immediate
- OfflineFirst
- WiFiOnly
- Background
- Disabled

No execution logic.

---

## Conflict Models

Represent only:

- LocalNewer
- RemoteNewer
- MergeRequired
- DeletedRemotely
- DeletedLocally
- VersionMismatch

No automatic resolution.

---

## State

Lifecycle representation:

- Idle
- Pending
- Running
- Completed
- Failed
- Paused

---

## Application APIs

- `getSynchronization()`
- `getSynchronizationQueue()`
- `getSynchronizationState()`
- `getSynchronizationStatistics()`
- `validateSynchronization()`

---

## Registry

- `SynchronizationRegistry`
- `SynchronizationProviderRegistration`
- `SynchronizationProviderMetadata`
- `SynchronizationProviderResult`

---

## Validation

Checks:

- Duplicate operations
- Invalid queue
- Invalid state
- Missing metadata
- Invalid transitions

---

## Composition Root

Registers:

- `SynchronizationEngine`
- `SynchronizationRegistry`
- `SynchronizationFactory`

via `SynchronizationFactory`, bound to existing `SynchronizationAdapter` contracts.

---

## Constraints

**Does not:** use networking, HTTP, REST, GraphQL, Supabase, Firebase, PostgreSQL, cloud, sockets, persistence, background services, retries over network, business logic, or synchronization execution.

Everything is deterministic. Strict TypeScript. Domain never depends on a concrete synchronization provider.
