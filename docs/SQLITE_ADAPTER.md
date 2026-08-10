# SQLite Infrastructure Adapter

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-08-10  
**Purpose:** Document the first production infrastructure adapter — SQLite storage behind Persistence Contracts.  
**Source of Truth:** Yes — for Sprint 30.1 SQLite Storage Adapter on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-099), [PERSISTENCE_CONTRACTS.md](./PERSISTENCE_CONTRACTS.md), [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

The SQLite Infrastructure Adapter is the first real persistence adapter. It implements Persistence Contracts and the Infrastructure `StorageAdapter` contract against a SQLite-compatible engine.

It is:

- An Infrastructure Adapter only
- Bound to Persistence Contracts (repositories + storage ports)
- Registered in the Composition Root
- Free of domain / AI / networking / auth / cloud-sync logic

It is **not**:

- Part of the Domain
- A React Native or Expo API surface
- Cloud sync, authentication, or networking
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
SQLite Adapter
      │
      ▼
Expo SQLite (native driver)
      │
      ▼
SQLite Database File
```

The Domain depends only on Persistence Contracts. The SQLite Adapter depends on those contracts. The Domain never imports SQLite.

---

## Structure

```
app/src/infrastructure/sqlite/
  connection/
  repositories/
  mappers/
  transactions/
  health/
  application/
  index.ts
```

---

## Connection

- `SQLiteConnection`
- `SQLiteConnectionFactory`
- `SQLiteSession`
- `SQLiteTransaction`
- `ConnectionHealth`
- `SQLiteSchema` — automatic idempotent schema initialization on first open

Native persistent SQLite via **Expo SQLite** (`expo-sqlite`). The database file survives application restart. Transactions support `begin` / `commit` / `rollback` only — no retry logic. No migration system yet.

---

## Repositories

Each repository implements only its Persistence Contract:

- `SQLiteAthleteRepository`
- `SQLiteIdentityRepository`
- `SQLiteWorkspaceRepository`
- `SQLiteSnapshotRepository`
- `SQLiteTimelineRepository`
- `SQLiteWorkoutRepository`
- `SQLiteNutritionRepository`
- `SQLiteRecoveryRepository`
- `SQLiteSettingsRepository`
- `SQLiteRuntimeRepository`

---

## Mapping

Pure deterministic mappers:

- `AthleteMapper` / `IdentityMapper` / `WorkspaceMapper` / `SnapshotMapper` / `TimelineMapper`
- `WorkoutMapper` / `NutritionMapper` / `RecoveryMapper` / `SettingsMapper` / `RuntimeMapper`

`PersistenceRecord` ↔ `SQLiteRow`. Domain-aware mappers serialize immutable domain JSON into `SQLiteRow.payload` via `infrastructure/repositories/serialization`. Workout, Nutrition, and Recovery mappers activated in Sprint 35.4 for runtime overlay persistence.

Runtime write-through attaches opaque immutable domain payloads to records; mappers JSON-encode on save and JSON-decode on read. Hydration receives restored domain payloads through unchanged repository contract surfaces.

---

## Domain Serialization (Sprint 34.3 / 35.4)

```
Runtime (opaque payload on PersistenceRecord)
      │
      ▼
Repository Adapters
      │
      ▼
Domain Serializers (JSON)
      │
      ▼
SQLite Mappers
      │
      ▼
SQLiteRow { id, payload }
```

Serializers:

- `AthleteIdentitySerializer`
- `RuntimeEnvironmentSerializer`
- `WorkspaceSerializer` (includes optional `goalRuntimeOverlay` since Sprint 35.4)
- `WorkspaceSnapshotSerializer` (`AthleteSnapshot`)
- `CoachTimelineSerializer`
- `WorkoutRuntimePersistenceSerializer` (Sprint 35.4)
- `NutritionRuntimePersistenceSerializer` (Sprint 35.4)
- `RecoveryRuntimePersistenceSerializer` (Sprint 35.4)
- `GoalRuntimePersistenceSerializer` (embedded in Workspace payload validation)

Serialization and deserialization remain **Infrastructure-only**. Domain modules never import serializers. Repository contracts remain `{ id }` at the type boundary.

---

## Health

- `isConnected()`
- `databaseVersion()`
- `storageUsage()`
- `adapterVersion()`

---

## Application APIs

- `getSQLiteHealth()`
- `getSQLiteRepositories()`
- `getSQLiteConnection()`
- `validateSQLite()`

---

## Composition Root

Registers:

- `SQLiteConnection`
- `SQLiteAdapter`
- `SQLiteRepositories`
- `RepositoryAdapters`

via `PersistenceRepositoryProvider` → `SQLiteAdapterFactory` → `RepositoryAdapterFactory`.

Runtime hydration and write-through resolve `RepositoryAdapters` from the Composition Root. No direct SQLite imports in runtime modules.

---

## Validation

Checks:

- Missing connection
- Invalid transaction
- Invalid mappings
- Repository registration
- Contract compliance

---

## Constraints

**Does not:** import into Domain, use React Native APIs, use Expo APIs, perform cloud sync, authenticate, network, embed business logic, or embed AI logic.

Adapter depends on Domain contracts. Domain never depends on the adapter.
