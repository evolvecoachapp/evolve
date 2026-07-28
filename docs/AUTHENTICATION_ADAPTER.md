# Authentication Adapter Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-28  
**Purpose:** Document the first Authentication Adapter — an in-memory Mock provider implementing Infrastructure Authentication Contracts.  
**Source of Truth:** Yes — for Sprint 30.3 Authentication Adapter Foundation on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [DECISIONS.md](./DECISIONS.md) (ADR-101), [INFRASTRUCTURE_ADAPTERS.md](./INFRASTRUCTURE_ADAPTERS.md), [PROJECT_STATE.md](./PROJECT_STATE.md).

---

## Purpose

The Authentication Adapter Foundation is the first authentication infrastructure adapter. It fully implements Infrastructure `AuthenticationAdapter` contracts using an in-memory Mock Authentication Provider.

It is:

- An Infrastructure Adapter only
- Bound to Authentication Contracts (Phase 29)
- Registered in the Composition Root
- Replaceable by future providers without Domain changes

It is **not**:

- Part of the Domain
- A real authentication provider (Supabase / Firebase / Auth0 / Apple / Google / Microsoft)
- OAuth / JWT / OpenID / HTTP / networking / cloud / SDK / encryption / persistence
- Business logic

---

## Architecture

```
Application
      │
      ▼
Authentication Contract
      │
      ▼
Authentication Adapter
      │
      ▼
Mock Authentication Provider
```

The Domain depends only on Authentication Contracts. Future providers (Supabase Auth, Firebase Auth, Auth0, Apple Sign In, Google Sign In, Microsoft Identity) implement the same provider contract and register via `AuthenticationRegistry` without changing the Domain.

---

## Structure

```
app/src/infrastructure/authentication/
  provider/
  models/
  session/
  validation/
  application/
  registry/
  index.ts
```

---

## Models

All immutable:

- `AuthenticatedUser`
- `AuthenticationSession`
- `AuthenticationToken`
- `RefreshToken`
- `AuthenticationMetadata`
- `AuthenticationState`
- `AuthenticationResult`
- `AuthenticationCapabilities`

---

## Provider

- `MockAuthenticationProvider` — in-memory; implements `AuthenticationAdapter`
- `AuthenticationProviderFactory`
- `AuthenticationSessionManager`
- `AuthenticationValidator`

Supported operations (capabilities only):

- `signIn()`
- `signOut()`
- `refreshSession()`
- `getCurrentUser()`
- `getCurrentSession()`
- `isAuthenticated()`
- `validateSession()`

No networking. No OAuth. No JWT parsing. No SDK.

---

## Session

Immutable session management via `AuthenticationSessionManager`.

- No expiration timers
- No background refresh
- Deterministic session state only

---

## Application APIs

- `getAuthentication()`
- `getCurrentUser()`
- `getCurrentSession()`
- `isAuthenticated()`
- `validateAuthentication()`

---

## Registry

- `AuthenticationRegistry`
- `AuthenticationProviderRegistration`
- `AuthenticationProviderMetadata`
- `AuthenticationProviderResult`

---

## Validation

Checks:

- Missing provider
- Duplicate provider
- Invalid session
- Invalid user
- Missing immutable fields

---

## Composition Root

Registers:

- `MockAuthenticationProvider`
- `AuthenticationRegistry`
- `AuthenticationFactory`

via `AuthenticationFactory`, bound to existing `AuthenticationAdapter` contracts.

---

## Constraints

**Does not:** use Supabase, Firebase, Auth0, OAuth, JWT, OpenID, HTTP, networking, cloud, SDK, encryption, persistence, or business logic.

Everything is deterministic. Strict TypeScript. Domain never depends on a concrete authentication provider.
