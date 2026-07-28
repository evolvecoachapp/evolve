# Repository Adapter Integration

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the Repository Adapter Layer that binds Persistence Contracts to SQLite repositories.  
**Source of Truth:** Yes — for Sprint 30.2 Repository Adapter Integration on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-100), [PERSISTENCE_CONTRACTS.md](./PERSISTENCE_CONTRACTS.md), [SQLITE_ADAPTER.md](./SQLITE_ADAPTER.md), [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

The Repository Adapter Layer is the first production integration between Persistence Contracts and the SQLite Infrastructure Adapter.

It is:

- An Infrastructure integration layer only
- Bound to Persistence Contracts (repository interfaces)
- Delegating exclusively to SQLite repositories
- Registered in the Composition Root

It is **not**:

- Part of the Domain
- Business logic
- AI logic
- Networking / cloud / authentication / cache / synchronization
- A change to domain models

---

## Architecture

```
Domain
      │
      ▼
Persistence Contracts
      │
      ▼
Repository Adapter Layer
      │
      ▼
SQLite Repositories
      │
      ▼
SQLite Engine
```

The Domain depends only on Persistence Contracts. Repository Adapters implement those contracts and delegate to SQLite repositories. The Domain never imports SQLite.

---

## Structure

```
app/src/infrastructure/repositories/
  adapters/
  registry/
  application/
  validation/
  index.ts
```

---

## Repository Adapters

Each adapter implements only its Persistence Contract and delegates only to the corresponding SQLite repository:

- `AthleteRepositoryAdapter`
- `IdentityRepositoryAdapter`
- `WorkspaceRepositoryAdapter`
- `SnapshotRepositoryAdapter`
- `TimelineRepositoryAdapter`
- `WorkoutRepositoryAdapter`
- `NutritionRepositoryAdapter`
- `RecoveryRepositoryAdapter`
- `SettingsRepositoryAdapter`
- `RuntimeRepositoryAdapter`

No business logic. No mapping beyond contract delegation.

---

## Registry

- `RepositoryAdapterRegistry`
- `RepositoryAdapterMetadata`
- `RepositoryAdapterResult`
- `RepositoryAdapterRegistration`

---

## Application APIs

- `getRepositoryAdapters()`
- `getRepositoryAdapter()`
- `validateRepositoryAdapters()`

---

## Validation

Checks:

- Missing repository
- Duplicate registrations
- Contract compliance
- Adapter registration
- Repository compatibility

---

## Composition Root

Registers:

- `RepositoryAdapterRegistry`
- `RepositoryAdapters`

via `RepositoryAdapterFactory`, bound to existing `SQLiteRepositories` and Persistence Contracts.

---

## Constraints

**Does not:** change Domain models, embed SQLite knowledge in Domain, embed business logic, embed AI, network, use cloud, authenticate, cache, or synchronize.

Adapters depend on Persistence Contracts + SQLite repositories. Domain never depends on adapters or SQLite.
