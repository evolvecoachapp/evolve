# Infrastructure Adapter Contracts

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Infrastructure Adapter Contracts — the immutable abstraction layer between the EVOLVE domain and every external infrastructure.  
**Source of Truth:** Yes — for Sprint 29.4 Infrastructure Adapter Contracts on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-098), [PERSISTENCE_CONTRACTS.md](./PERSISTENCE_CONTRACTS.md), [RUNTIME_ENVIRONMENT.md](./RUNTIME_ENVIRONMENT.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

Infrastructure Adapter Contracts define the immutable seams between the domain and future external infrastructure.

They are:

- A contracts-only foundation layer
- Immutable adapter interfaces for storage, auth, notifications, analytics, sync, logging, flags, health, media, export/import, clock, identifiers, and configuration
- Registries and validation for adapter integrity
- The reference every future SQLite / PostgreSQL / Supabase / Firebase / Apple Health / Google Fit / Push / Analytics / Logging / Feature Flag adapter must implement

They are **not**:

- Adapter implementations
- SQLite / PostgreSQL / Firebase / Supabase / HTTP / REST / GraphQL
- SDKs / Expo / React Native / network / filesystem / persistence
- Business logic

---

## Architecture

```
Domain
      │
      ▼
Infrastructure Adapter Contracts
      │
      ▼
Future Adapter Implementations
      │
      ▼
External Services
```

The domain depends only on Infrastructure Adapter Contracts. Future implementations fulfill those contracts against concrete external services. The domain never depends on any infrastructure technology.

---

## Structure

```
app/src/core/infrastructure/
  contracts/
  adapters/
  registry/
  application/
  errors/
  index.ts
```

---

## Adapter Contracts

Immutable interfaces:

- `StorageAdapter`
- `AuthenticationAdapter`
- `NotificationAdapter`
- `AnalyticsAdapter`
- `SynchronizationAdapter`
- `LoggingAdapter`
- `FeatureFlagAdapter`
- `HealthPlatformAdapter`
- `MediaAdapter`
- `ExportAdapter`
- `ImportAdapter`
- `ClockAdapter`
- `IdentifierGenerator`
- `ConfigurationProvider`

Each adapter contract returns opaque `AdapterResult` envelopes. Concrete I/O belongs to future implementations.

---

## Registry

Immutable registry models:

- `AdapterRegistry`
- `AdapterMetadata`
- `AdapterCapabilities`
- `AdapterRegistration`
- `AdapterResult`

---

## Capabilities

Supported capability descriptors only:

- `supportsTransactions`
- `supportsOffline`
- `supportsEncryption`
- `supportsScheduling`
- `supportsBiometrics`
- `supportsMedia`
- `supportsHealthData`
- `supportsPush`
- `supportsExport`
- `supportsImport`

No implementation logic. No runtime probing.

---

## Application APIs

- `getAdapterRegistry()`
- `getRegisteredAdapters()`
- `validateAdapters()`
- `getAdapterCapabilities()`

Presentation/composition getters only. No networking, filesystem, or persistence.

---

## Validation

Validation checks:

- Duplicate adapters
- Missing adapters
- Unsupported capabilities
- Invalid metadata
- Invalid registrations

---

## Composition Root

Registers:

- `InfrastructureAdapterRegistry`

via `InfrastructureAdapterFactory`. No adapter implementations. No SDKs. No cloud. No database.

---

## Errors

Immutable error models:

- `AdapterNotFoundError`
- `AdapterCapabilityError`
- `AdapterRegistrationError`
- `AdapterValidationError`
- `UnsupportedAdapterError`

---

## Constraints

**Does not:** use SQLite, PostgreSQL, Firebase, Supabase, HTTP, REST, GraphQL, SDK imports, Expo, React Native, network, filesystem, persistence, or business logic.

Interfaces, registries, validation, and immutable errors only.
