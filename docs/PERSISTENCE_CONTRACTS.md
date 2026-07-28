# Persistence Contract Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Persistence Contracts — the immutable contract layer that every future persistence adapter must implement.  
**Source of Truth:** Yes — for Sprint 29.3 Persistence Contract Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-097), [RUNTIME_ENVIRONMENT.md](./RUNTIME_ENVIRONMENT.md), [ATHLETE_IDENTITY.md](./ATHLETE_IDENTITY.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

Persistence Contracts define the immutable seams between the domain and future storage technologies.

They are:

- A contracts-only foundation layer
- Immutable repository and storage port interfaces
- Registries and validation for contract integrity
- The reference every future SQLite / PostgreSQL / Supabase / IndexedDB / AsyncStorage / Filesystem / Cloud Sync adapter must implement

They are **not**:

- Storage implementations
- SQLite / PostgreSQL / Supabase / AsyncStorage / Realm / IndexedDB / Filesystem
- Networking / serialization / adapters
- A dependency injection framework
- Business logic

---

## Architecture

```
Domain
      │
      ▼
Persistence Contracts
      │
      ▼
Future Adapters
      │
      ▼
Storage Technologies
```

The domain depends only on Persistence Contracts. Future adapters implement those contracts against concrete storage technologies. The domain never depends on any storage technology.

---

## Structure

```
app/src/core/persistence/
  contracts/
  repositories/
  ports/
  errors/
  application/
  index.ts
```

---

## Repository Contracts

Immutable interfaces:

- `AthleteRepository`
- `IdentityRepository`
- `WorkspaceRepository`
- `SnapshotRepository`
- `TimelineRepository`
- `PlanRepository`
- `WorkoutRepository`
- `NutritionRepository`
- `RecoveryRepository`
- `SettingsRepository`
- `RuntimeRepository`

Each repository contract operates on opaque `PersistenceRecord` values (`id` only at the contract boundary). Domain entity mapping belongs to future adapters.

---

## Storage Ports

Immutable contracts:

- `StorageReader`
- `StorageWriter`
- `StorageTransaction`
- `StorageSession`
- `StorageHealth`
- `StorageMetadata`
- `StorageResult`

These ports describe storage capabilities. They do not perform I/O in this sprint.

---

## Application APIs

- `getPersistenceContracts()`
- `getRepositoryRegistry()`
- `validatePersistenceContracts()`

Presentation/composition getters only. No persistence, networking, or serialization.

---

## Validation

Validation checks:

- Duplicate repositories
- Missing contracts
- Invalid registrations
- Invalid metadata
- Unsupported capabilities

---

## Composition Root

Registers:

- `PersistenceContractRegistry`
- `RepositoryRegistry`
- `StorageContractRegistry`

via `PersistenceContractsFactory`. No storage adapters. No implementations beyond in-memory contract registries seeded with canonical descriptors.

---

## Errors

Immutable error models:

- `RepositoryNotFoundError`
- `StorageUnavailableError`
- `ContractViolationError`
- `TransactionFailureError`
- `ValidationError`

---

## Constraints

**Does not:** use SQLite, PostgreSQL, Supabase, AsyncStorage, Realm, IndexedDB, filesystem, network, persistence I/O, serialization, adapters, a DI framework, or business logic.

Interfaces, registries, validation, and immutable errors only.
