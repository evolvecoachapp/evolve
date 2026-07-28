# Athlete Identity Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document Athlete Identity — the immutable identity layer that every future production feature will rely on.  
**Source of Truth:** Yes — for Sprint 29.1 Athlete Identity Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-095), [ATHLETE_SNAPSHOT.md](./ATHLETE_SNAPSHOT.md), [UNIFIED_WORKSPACE.md](./UNIFIED_WORKSPACE.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

Athlete Identity is the immutable identity foundation of the athlete.

It is:

- A deterministic composition layer
- An immutable domain model for stable athlete identity
- The reference every future Auth / Cloud Sync / Device Sync / Offline Cache / Notifications / Analytics / Coach Portal / Sharing / Export system must use instead of transient Athlete State

It is **not**:

- Authentication
- OAuth / JWT / Firebase / Supabase
- Persistence / database / cache / cloud
- Networking / event bus / scheduler
- Business logic / LLM behavior
- Athlete State

---

## Architecture

```
Runtime Environment
        │
        ▼
Identity
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

Future production consumers reference Athlete Identity, not transient Athlete State.

Runtime Environment sits above Athlete Identity as the execution-environment foundation (see [RUNTIME_ENVIRONMENT.md](./RUNTIME_ENVIRONMENT.md)).

---

## Models

`AthleteIdentity`, `AthleteProfile`, `AthletePreferences`, `AthleteSettings`, `AthleteLocale`, `AthleteUnits`, `AthleteTimeZone`, `AthleteMetadata`, `AthleteIdentityResult`

All models are immutable.

---

## Services

| Service | Responsibility |
|---------|----------------|
| `buildProfile` | Compose profile fields |
| `buildPreferences` | Compose preference collections |
| `buildSettings` | Compose presentation settings |
| `buildLocale` | Compose BCP-47 locale |
| `buildUnits` | Compose metric / imperial units |
| `buildTimeZone` | Compose IANA timezone |
| `validateIdentity` | Validate identity integrity |
| `buildAthleteIdentity` | Compose complete identity |
| `AthleteIdentityService` | In-memory composition facade |

Each service has exactly one responsibility.

---

## Application APIs

- `getAthleteIdentity()`
- `getAthleteProfile()`
- `getPreferences()`
- `getSettings()`

These are presentation-facing getters only. They do not introduce authentication or persistence.

---

## Validation

Validation checks:

- Missing identity
- Duplicate identity (identity id / athlete id)
- Invalid locale
- Invalid units
- Invalid timezone
- Missing immutable fields / freeze integrity

---

## Composition Root

Registers `AthleteIdentityService` via `AthleteIdentityFactory` (no upstream service dependencies — identity is the foundation layer).

---

## Constraints

**Does not:** authenticate, issue tokens, call OAuth providers, persist to DB, cache, sync to cloud, network, emit events, schedule jobs, call an LLM, or mutate Athlete State.
