# SQLite Infrastructure Adapter

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
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
SQLite Database
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

Pure TypeScript SQLite-compatible engine (no Expo / React Native / native bindings in this sprint). Transactions support `begin` / `commit` / `rollback` only — no retry logic.

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

`PersistenceRecord` ↔ `SQLiteRow` only. No domain entity mapping logic.

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

via `SQLiteAdapterFactory`.

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
