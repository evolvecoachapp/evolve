# Runtime Environment Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Runtime Environment — the immutable execution-environment layer that every future production feature will rely on.  
**Source of Truth:** Yes — for Sprint 29.2 Runtime Environment Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-096), [ATHLETE_IDENTITY.md](./ATHLETE_IDENTITY.md), [ATHLETE_SNAPSHOT.md](./ATHLETE_SNAPSHOT.md), [UNIFIED_WORKSPACE.md](./UNIFIED_WORKSPACE.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

Runtime Environment is the immutable representation of the execution environment used by the domain.

It is:

- A deterministic composition layer
- An immutable domain model for stable runtime descriptors
- The reference every future Authentication / Cloud Sync / Push Notifications / Offline Cache / Feature Flags / Analytics / Telemetry / Device Sync / Coach Portal system must use instead of directly inspecting platform APIs

It is **not**:

- Infrastructure
- React Native / Expo
- Platform APIs / Device APIs
- Networking / persistence / cache / cloud
- Event bus / scheduler / LLM
- Business logic

---

## Architecture

```
Runtime Environment
        │
        ▼
Athlete Identity
        │
        ▼
Athlete State
        │
        ▼
Snapshot
        │
        ▼
Unified Workspace
```

Future production consumers reference Runtime Environment instead of inspecting platform APIs.

---

## Models

`RuntimeEnvironment`, `DeviceInfo`, `PlatformInfo`, `ApplicationInfo`, `Capabilities`, `FeatureSupport`, `LocaleInfo`, `ConnectivityInfo`, `EnvironmentMetadata`, `RuntimeEnvironmentResult`

All models are immutable.

---

## Services

| Service | Responsibility |
|---------|----------------|
| `buildDeviceInfo` | Compose device descriptors |
| `buildPlatformInfo` | Compose platform descriptors |
| `buildApplicationInfo` | Compose application descriptors |
| `buildCapabilities` | Compose capability descriptors |
| `buildFeatureSupport` | Compose feature-support keys |
| `buildLocaleInfo` | Compose BCP-47 locale |
| `buildConnectivityInfo` | Compose connectivity model |
| `validateRuntimeEnvironment` | Validate runtime integrity |
| `buildRuntimeEnvironment` | Compose complete runtime |
| `RuntimeEnvironmentService` | In-memory composition facade |

Each service has exactly one responsibility.

---

## Application APIs

- `getRuntimeEnvironment()`
- `getCapabilities()`
- `getPlatformInfo()`
- `getApplicationInfo()`
- `getConnectivityInfo()`

These are presentation-facing getters only. They do not introduce networking, persistence, or platform API calls.

---

## Validation

Validation checks:

- Missing runtime
- Invalid platform
- Invalid locale
- Duplicate capabilities
- Invalid app version
- Missing immutable fields / freeze integrity

---

## Capabilities

Represent capabilities only. Do **not** query hardware.

Examples: `supportsNotifications`, `supportsOffline`, `supportsBiometrics`, `supportsBackgroundSync`, `supportsHealthIntegration`, `supportsCamera`, `supportsMicrophone`.

These are immutable descriptors.

---

## Connectivity

Represent current connectivity model only.

Examples: `online`, `offline`, `metered`, `unknown`.

No network requests.

---

## Composition Root

Registers `RuntimeEnvironmentService` via `RuntimeEnvironmentFactory` (no upstream service dependencies — runtime is the foundation layer above Athlete Identity).

---

## Constraints

**Does not:** import React Native, use Expo, call Device APIs, network, persist, cache, sync to cloud, emit events, schedule jobs, call an LLM, or contain business logic.
