# Logging & Observability Adapter Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the Logging & Observability Adapter Foundation — deterministic logging infrastructure used by every layer of EVOLVE behind Infrastructure Logging Contracts.  
**Source of Truth:** Yes — for Sprint 30.6 Logging & Observability Adapter Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-104), [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

The Logging & Observability Adapter Foundation is the first logging infrastructure adapter. It fully implements Infrastructure `LoggingAdapter` contracts using an in-memory Mock Logger.

It is:

- An Infrastructure Adapter only
- Bound to Logging Contracts
- Registered in the Composition Root
- Replaceable by future logging providers without Domain changes

It is **not**:

- Part of the Domain
- Console / file / OpenTelemetry / Sentry / Datadog / Azure Monitor / Grafana / Elastic
- Cloud / networking / persistence
- Business logic

---

## Architecture

```
Application
      │
      ▼
Logging Contract
      │
      ▼
Logging Adapter
      │
      ▼
Mock Logger
```

The Domain depends only on Logging Contracts. Future implementations (OpenTelemetry, Sentry, Datadog, Azure Monitor, Grafana, Elastic, Console, File) implement the same logger contract and register via `LoggerRegistry` without changing the Domain.

---

## Structure

```
app/src/infrastructure/logging/
  logger/
  events/
  context/
  levels/
  registry/
  validation/
  application/
  models/
  index.ts
```

---

## Models

All immutable:

- `LogEvent`
- `LogEntry`
- `LogContext`
- `LogScope`
- `LogLevel`
- `LogMetadata`
- `LogCapabilities`
- `LogStatistics`
- `LogResult`

---

## Logger

- `MockLogger` — in-memory; implements `LoggingAdapter`
- `LoggerFactory`
- `LoggerRegistry`
- `LoggerValidator`
- `LogDispatcher`

Supported operations (deterministic orchestration only):

- `trace()`
- `debug()`
- `info()`
- `warn()`
- `error()`
- `fatal()`
- `flush()`
- `clear()`
- `statistics()`

No persistence. No console output. No remote logging.

---

## Levels

Represent only:

- Trace
- Debug
- Information
- Warning
- Error
- Fatal

---

## Context

Support immutable context scopes:

- Workout
- Nutrition
- Recovery
- Coach
- Synchronization
- Authentication
- Backend
- Application

---

## Application APIs

- `getLogger()`
- `log()`
- `getLogStatistics()`
- `clearLogs()`
- `validateLogging()`

---

## Registry

- `LoggerRegistry`
- `LoggerRegistration`
- `LoggerMetadata`
- `LoggerResult`

---

## Validation

Checks:

- Invalid level
- Missing metadata
- Duplicate registrations
- Invalid context
- Invalid event

---

## Composition Root

Registers:

- `MockLogger`
- `LoggerFactory`
- `LoggerRegistry`

via `LoggerFactory`, bound to existing Infrastructure `LoggingAdapter` contracts.

---

## Constraints

**Does not:** use console logging, file logging, OpenTelemetry, Sentry, Datadog, Azure Monitor, Grafana, Elastic, cloud, networking, persistence, or business logic.

Everything is deterministic. Strict TypeScript. Domain never depends on a concrete logging provider.
