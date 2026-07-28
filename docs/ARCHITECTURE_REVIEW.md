# EVOLVE Architecture Review

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-29  
**Sprint:** 30.7 — Architecture Review & Production Readiness  
**Purpose:** Complete architecture audit before Product Development (Phase 31).  
**Source of Truth:** Yes — for architecture consolidation findings and production-readiness assessment.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [PROJECT_STATE.md](./PROJECT_STATE.md), [DECISIONS.md](./DECISIONS.md) (ADR-105), [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md).

---

## Current Architecture Overview

EVOLVE is a Clean Architecture fitness coaching platform with:

| Layer | Location | Role |
|-------|----------|------|
| **Mobile UI** | `app/app/`, feature screens | Thin presentation |
| **Domain / Features** | `app/src/features/*` | Immutable models, engines, orchestration |
| **Application contracts** | `app/src/core/persistence`, `core/infrastructure` | Ports only |
| **Composition Root** | `app/src/core/composition` | Sole DI wiring (55 typed `ServiceMap` tokens) |
| **Infrastructure** | `app/src/infrastructure/*` | Adapter implementations behind contracts |
| **Backend** | `backend/` | FastAPI Clean Architecture (auth, workouts, coach, …) |

### Dependency direction (verified)

```
UI / Application APIs
  → Composition Root (wiring only)
    → Feature Services (domain)
    → Contracts (core/persistence, core/infrastructure)
      → Infrastructure Adapters (sqlite, repositories, auth, sync, backend, logging)
```

- **Domain / features never import infrastructure** (grep-verified).
- **Infrastructure never imports features**.
- **Composition Root is the only bridge** from contracts to implementations.
- **No circular DI** — container validates + freezes; `ServiceRegistry.assertIntegrity()` enforces 55/55 tokens.

### Composition Root surface (Sprint 17.9 → 30.6)

| Category | Tokens |
|----------|--------|
| Training Intelligence | 7 services |
| Coaching / product pipeline | 29 services |
| Persistence + Infrastructure contracts | 4 registries |
| SQLite | Connection / Adapter / Repositories |
| Repository Adapters | Registry + Adapters bundle |
| Auth / Sync / Backend / Logging | Registry + mock/engine + Factory module each |

Default lifecycle: **singleton** (`preferSingletons: true`).

### Infrastructure adapter family (Phase 30)

| Sprint | Module | Contract | Implementation |
|--------|--------|----------|----------------|
| 30.1 | `infrastructure/sqlite` | Persistence + `StorageAdapter` | SQLite engine + repos |
| 30.2 | `infrastructure/repositories` | Persistence repository ports | Delegation adapters |
| 30.3 | `infrastructure/authentication` | `AuthenticationAdapter` | MockAuthenticationProvider |
| 30.4 | `infrastructure/synchronization` | `SynchronizationAdapter` | SynchronizationEngine |
| 30.5 | `infrastructure/backend` | `BackendAdapter` | MockBackendProvider |
| 30.6 | `infrastructure/logging` | `LoggingAdapter` | MockLogger |

All Phase 30 adapters are **deterministic / mock / local orchestration** — replaceable seams, not production cloud backends.

---

## Strengths

1. **Strict inward dependency rule** — features never depend on infrastructure; Composition Root owns wiring.
2. **Typed DI integrity** — `SERVICE_TOKENS` ↔ `ServiceMap` ↔ registrations are consistent (55 tokens); freeze + validate on bootstrap.
3. **Contract-first Phase 29–30** — Persistence and Infrastructure contracts exist before (and separately from) implementations.
4. **Consistent adapter family pattern** (30.3–30.6) — Factory → Registry → Provider/Engine/Logger → Validator → application APIs → CR registration → integration tests.
5. **Immutable domain models** across coaching / intelligence / workspace pipelines.
6. **Per-adapter integration tests** for 29.3–30.6 with Composition Root and contract-compliance checks.
7. **Documented ADRs** through ADR-104; dedicated adapter docs for each Phase 29–30 module.
8. **Backend Clean Architecture** remains intact (routes → services → repositories → models).

---

## Weaknesses

1. **Composition Root does not own every implementation** — many feature modules still construct local services; alternate storage (`core/storage`, AsyncStorage) bypasses CR.
2. **DI tokens are implementation-shaped** — ServiceMap exposes `Mock*` classes and Factory modules rather than contract interfaces for Auth/Backend/Logging.
3. **InfrastructureAdapterRegistry is metadata-only** — Sprint 30 implementations are not bound into the contract registry.
4. **Uneven module structure** — auth/sync/backend/logging form one family; sqlite and repositories are structural outliers.
5. **Broad public barrels** — auth/sync/sqlite root `index.ts` files `export *` internals; risk of consumers binding to rich provider APIs instead of Sprint 29 contracts.
6. **Pass-through repository adapters** — SQLite repos already implement Persistence Contracts; adapters add a registry seam without behavior.
7. **Plan repository gap** — Persistence Contract includes Plan; SQLite/repository adapters intentionally omit it (ADR-100).
8. **Lifetime edge case** — `preferSingletons: false` can desync SQLite connection/adapter/repos; IIFE caches conflict with transient mode.
9. **Documentation drift** — COMPOSITION_ROOT.md / ROADMAP / TASKS / Composition Root ARCHITECTURE section lagged Phase 29–30 (addressed in Sprint 30.7).
10. **Nine infrastructure contracts unimplemented** — notification, analytics, feature-flag, health-platform, media, export, import, clock, identifier-generator (plus infra configuration) remain contract-only.

---

## Potential Refactors

Safe / deferred — **do not redesign in this sprint**:

| Priority | Refactor | Benefit |
|----------|----------|---------|
| P1 | Register active provider/engine tokens as contract types (not Mock class / Factory module) | Cleaner DI surface |
| P1 | Bind Sprint 30 instances into `InfrastructureAdapterRegistry` or document intentional separation | Single source of adapter truth |
| P2 | Curate infrastructure barrels (match backend/logging style) | Prevent implementation leakage |
| P2 | Align Registration naming (`*ProviderRegistration` vs `*Registration`) | Naming consistency |
| P2 | Extend `factories.test.ts` / CompositionRoot getters for Phase 29–30 | Test parity |
| P3 | Cross-adapter smoke test (SQLite + Auth + Sync + Backend + Logging) | Integration confidence |
| P3 | Clarify PlanRepository absence with an explicit negative test | Documented gap enforcement |
| P3 | Collapse pass-through repository adapters when a second storage backend appears | Reduce duplication |
| P4 | Enforce singleton-only for SQLite graph (or share one bundle IIFE) | Lifetime safety |
| P4 | Wire feature use-cases to Persistence/Auth ports via CR | Complete ports & adapters story |

---

## Technical Debt

| Debt | Severity | Notes |
|------|----------|-------|
| ROADMAP.md / TASKS.md stale (pre–Phase 19+) | Medium | PROJECT_STATE is authoritative for sprint status |
| Parallel storage stories (`core/storage` vs Persistence Contracts) | Medium | Confusing for new contributors |
| Feature `export *` (e.g. workout UI at feature root) | Low–Medium | Long-standing leakage |
| Dual Factory names (composition alias vs infrastructure factory) | Low | Documented; import-path discipline required |
| Rich provider APIs extend thin Sprint 29 contracts | Medium | Future features must import contracts, not mocks |
| No CI pipeline / backend Docker in repo | High (ops) | Blocks true production deploy |
| Mobile backend providers incomplete (coach/nutrition) | Medium (product) | Known Issues |
| Phase 6 Production = 0% | High (ops) | Expected; adapters are foundations only |
| `RecommendationEngineBridge` not DI-registered | Low | Test / facade path only |
| Composition factory export lag (fixed 30.7) | Low | Public API consistency |

---

## Production Readiness

### Ready

- Clean Architecture dependency direction on mobile and backend.
- Composition Root integrity for registered pipelines.
- Persistence + Infrastructure **contracts** as replaceable seams.
- SQLite + repository adapter **foundation** (in-memory/deterministic engine path).
- Mock Auth / Sync / Backend / Logging **seams** for future real providers.
- Extensive domain/feature foundations (workout pipeline, coaching, workspaces).
- Architecture documentation aligned through Sprint 30.7.

### Not production-ready (by design or gap)

- Phase 30 adapters are **mocks / local orchestration** — not OpenTelemetry, JWT, HTTP, cloud sync, or real SQLite RN bindings.
- No CI/CD, no production compose, no managed secrets.
- Domain use-cases are **not yet injected** with Persistence/Auth/Sync ports for end-user flows.
- Backend HTTP gaps remain (program authoring, some mobile providers).
- Overall Phase 6 (Production) remains **0%**.

### Verdict

**Architecture is production-readiness–ready as a foundation.**  
**Product is not production-deployable.**  
Phase 31+ may build product features atop these seams without redesigning the architecture.

---

## Architecture Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Features import rich infra types from barrels | Couples Domain to mocks | Enforce contract-only imports in reviews; narrow barrels |
| Contract registry diverges from live adapters | Drift / dead metadata | Bind or document separation (ADR-105) |
| Transient lifecycle + SQLite | Dual connections / data loss in tests | Prefer singletons; document constraint |
| Second persistence backend without Plan adapter | Incomplete repository surface | Add Plan when product needs it |
| ROADMAP/TASKS used as status source | Wrong sprint planning | Use PROJECT_STATE + ARCHITECTURE_REVIEW |
| Premature real provider wiring | Violates Clean Architecture | Keep mocks until Product/Phase 6 explicitly replaces |
| Unowned feature constructions bypass CR | Hidden coupling | Migrate hot paths to `resolveService` over time |

---

## Future Recommendations

1. **Phase 31 — Product Development** may begin; do not redesign Composition Root or adapter contracts unless an ADR supersedes them.
2. Replace mocks **one adapter at a time** (Auth → Backend → Sync → Logging → real SQLite RN) behind existing contracts.
3. Inject Persistence / Auth ports into application use-cases via Composition Root before UI depends on storage.
4. Update ROADMAP/TASKS to Phase 31+ or mark them non-authoritative.
5. Add CI (typecheck + Jest + pytest) before any production deploy.
6. Keep ADR append-only; record each real-provider swap as a new ADR.
7. Prefer curated public APIs on every new infrastructure module (backend/logging pattern).

---

## MVP Readiness

| Capability | MVP status |
|------------|------------|
| Auth (backend JWT + mobile secure store) | **Partial MVP** — live backend path; infra mock separate |
| Workout templates / session / history | **Partial MVP** — backend + on-device history; CR SQLite not yet product UI path |
| AI Coach conversation / workout generation | **Foundation MVP** — orchestration complete; providers mostly mock |
| Nutrition / Recovery HTTP | **Not MVP** — backend domains exist; mobile providers incomplete |
| Home / Daily Brief / Weekly Report UI | **Composition ready** — UI wiring still next |
| Offline sync | **Seam only** — SynchronizationEngine does not execute network sync |
| Observability | **Seam only** — MockLogger |
| Deploy / CI / ops | **Not MVP** |

### MVP verdict

EVOLVE can support a **narrow coaching MVP** (auth + workout + coach conversation with mocks) on the current architecture **without redesign**.  
A **full production MVP** (real sync, real logging, CI, complete mobile providers, Persistence-backed identity/workspace) requires Phase 31+ product work and Phase 6 production work — not architecture rewrites.

---

## Sprint 30.7 Audit Checklist

| Area | Result |
|------|--------|
| Domain ↛ Infrastructure | **Pass** |
| Application → contracts | **Pass** (vacuous for ports; services via CR) |
| Infrastructure → contracts | **Pass** |
| Composition Root owns registered implementations | **Pass** (55 tokens) |
| Composition Root owns *all* app implementations | **Partial** (documented debt) |
| No circular DI | **Pass** |
| No duplicated responsibilities (critical) | **Pass** with noted pass-through adapters |
| No leaking implementations (critical) | **Partial** — broad barrels |
| Factory / Registry consistency | **Pass** with naming variance |
| Adapter registration | **Pass** |
| Dead / duplicate registrations | **None critical** |
| Public API consistency | **Improved 30.7** (composition factory exports) |
| Documentation alignment | **Updated 30.7** |
| Typecheck / tests | **Must pass** (see sprint closeout) |

---

## Review Summary

Sprint 30.7 confirms the architecture is **sound, consolidateable, and ready for years of product development** on the existing contract → adapter → Composition Root pattern. Remaining work is **product wiring, real providers, CI/ops, and documentation hygiene** — not structural redesign.
