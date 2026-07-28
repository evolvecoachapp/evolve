# Backend API Adapter Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the Backend API Adapter Foundation — a deterministic adapter representing every future backend communication behind Infrastructure Backend Contracts.  
**Source of Truth:** Yes — for Sprint 30.5 Backend API Adapter Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-103), [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

The Backend API Adapter Foundation is the first backend API infrastructure adapter. It fully implements Infrastructure `BackendAdapter` contracts using an in-memory Mock Backend Provider.

It is:

- An Infrastructure Adapter only
- Bound to Backend API Contracts
- Registered in the Composition Root
- Replaceable by future backend implementations without Domain changes

It is **not**:

- Part of the Domain
- A real backend (FastAPI / ASP.NET / NestJS / Go / Rust)
- HTTP / REST / GraphQL / sockets / networking / serialization / JSON parsing / cloud
- Business logic

---

## Architecture

```
Application
      │
      ▼
Backend API Contract
      │
      ▼
Backend API Adapter
      │
      ▼
Mock Backend Provider
```

The Domain depends only on Backend API Contracts. Future implementations (FastAPI, ASP.NET, NestJS, Go, Rust, GraphQL, REST) implement the same provider contract and register via `BackendRegistry` without changing the Domain.

---

## Structure

```
app/src/infrastructure/backend/
  provider/
  requests/
  responses/
  routing/
  registry/
  validation/
  application/
  models/
  index.ts
```

---

## Models

All immutable:

- `BackendRequest`
- `BackendResponse`
- `BackendEndpoint`
- `BackendRoute`
- `BackendMetadata`
- `BackendCapabilities`
- `BackendResult`
- `BackendStatus`
- `BackendHealth`
- `BackendError`

---

## Provider

- `MockBackendProvider` — in-memory; implements `BackendAdapter`
- `BackendProviderFactory`
- `BackendRequestDispatcher`
- `BackendResponseMapper`
- `BackendValidator`

Supported operations (deterministic orchestration only):

- `send()`
- `execute()`
- `dispatch()`
- `health()`
- `capabilities()`
- `listEndpoints()`

No networking. No HTTP. No sockets. No serialization.

---

## Routing

Represent routes only:

- `/auth`
- `/workout`
- `/nutrition`
- `/recovery`
- `/coach`
- `/sync`
- `/profile`
- `/settings`

No URL building. No HTTP verbs.

---

## Responses

Represent only:

- Success
- Failure
- Unavailable
- Unauthorized
- Forbidden
- Conflict
- ValidationError
- NotFound

No transport.

---

## Application APIs

- `getBackend()`
- `getBackendHealth()`
- `getBackendCapabilities()`
- `listBackendEndpoints()`
- `validateBackend()`

---

## Registry

- `BackendRegistry`
- `BackendRegistration`
- `BackendMetadata`
- `BackendResult`

---

## Validation

Checks:

- Duplicate endpoints
- Invalid registrations
- Invalid capabilities
- Missing metadata
- Unsupported operations

---

## Composition Root

Registers:

- `MockBackendProvider`
- `BackendRegistry`
- `BackendFactory`

via `BackendFactory`, bound to existing Infrastructure `BackendAdapter` contracts.

---

## Constraints

**Does not:** use HTTP, REST, GraphQL, sockets, networking, FastAPI, ASP.NET, Express, NestJS, serialization, JSON parsing, cloud, or business logic.

Everything is deterministic. Strict TypeScript. Domain never depends on a concrete backend provider.
