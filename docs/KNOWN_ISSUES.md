# EVOLVE Known Issues

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Resolved and open project issues with workarounds.  
**Source of Truth:** Yes — for issue tracking in documentation (live status summary: [PROJECT_STATE.md](./PROJECT_STATE.md)).
---

## Resolved

### KI-001 — Sprint 4.1 scope conflict with Orchestrator plan

| Field | Detail |
|-------|--------|
| **Description** | Sprint 4.1 was originally scoped for AI Orchestrator but delivered the Workout Resolution Engine instead |
| **Sprint fixed** | 4.1 / 4.2 |
| **Workaround** | Orchestrator scope moved to Sprint 4.2; documented in ROADMAP and ADR-006 |

### KI-002 — Nutrition and Recovery bundled in one sprint

| Field | Detail |
|-------|--------|
| **Description** | Original Sprint 4.3 combined Nutrition and Recovery engines |
| **Sprint fixed** | 4.3 / 4.4 split |
| **Workaround** | Independent sprints per ADR-011/016 precedent |

### KI-003 — Coach endpoint missing conversation ownership check

| Field | Detail |
|-------|--------|
| **Description** | `MemoryEngine` deferred ownership validation; gap became reachable via HTTP |
| **Sprint fixed** | 4.5 |
| **Workaround** | `CoachService` enforces ownership before delegating (ADR-019) |

### KI-004 — LLM failures caused unhandled errors

| Field | Detail |
|-------|--------|
| **Description** | Real LLM integration introduced network failure modes |
| **Sprint fixed** | 4.6 |
| **Workaround** | `LLMProviderError` with graceful degradation at all call sites (ADR-021) |

### KI-005 — Mobile screens lacked cohesive design system

| Field | Detail |
|-------|--------|
| **Description** | Sprint 5.1 auth screens had inconsistent styling; no tab navigation |
| **Sprint fixed** | 5.2 |
| **Workaround** | Token-based design system and 6-tab layout (ADR-027) |

### KI-006 — Program progress derived from calendar math

| Field | Detail |
|-------|--------|
| **Description** | Early design considered calendar-based program slot resolution |
| **Sprint fixed** | 4.1 |
| **Workaround** | Stored cursor on `ProgramAssignment` (ADR-006) |

---

## Open

### KI-007 — Mobile backend providers not implemented

| Field | Detail |
|-------|--------|
| **Description** | All `Backend*Service` classes in `app/src/features/*/providers/` throw `notConfigured()` |
| **Sprint fixed** | — (planned: 5.3) |
| **Workaround** | Use mock providers (default via env); auth API works independently |

### KI-008 — No HTTP API for program/workout authoring

| Field | Detail |
|-------|--------|
| **Description** | `WorkoutService` has full program/workout logic but no public REST routes |
| **Sprint fixed** | — |
| **Workaround** | Assign programs via service layer, seeding, or direct DB |

### KI-009 — User profile update endpoint missing

| Field | Detail |
|-------|--------|
| **Description** | `PATCH /api/v1/users/me` not implemented; blocks nutrition target API for incomplete profiles |
| **Sprint fixed** | — (planned: 2.3 completion or 5.3) |
| **Workaround** | Set profile fields via registration or direct DB update in dev |

### KI-010 — No CI/CD pipeline

| Field | Detail |
|-------|--------|
| **Description** | No `.github/workflows/` or equivalent; tests run manually |
| **Sprint fixed** | — (planned: 6.2) |
| **Workaround** | Run `pytest` and `npm test` locally before merge |

### KI-011 — Backend not containerized in Compose

| Field | Detail |
|-------|--------|
| **Description** | `docker-compose.yml` runs PostgreSQL only; no backend service or Dockerfile |
| **Sprint fixed** | — (planned: 1.2 completion / 6.1) |
| **Workaround** | Run Uvicorn manually: `uvicorn app.main:app --reload` |

### KI-012 — Progress Analyzer not bound to Coach

| Field | Detail |
|-------|--------|
| **Description** | `Intent.PROGRESS` falls through to generic LLM; no `ProgressCoachEngine` |
| **Sprint fixed** | — |
| **Workaround** | Use `GET /api/v1/progress/summary` directly |

### KI-013 — TASKS.md checkboxes out of sync

| Field | Detail |
|-------|--------|
| **Description** | Phase 1–2 items unchecked in TASKS.md despite implementation in code |
| **Sprint fixed** | — |
| **Workaround** | Use [PROJECT_STATE.md](./PROJECT_STATE.md) and [BACKEND_STATUS.md](./BACKEND_STATUS.md) as source of truth |

### KI-014 — No root README.md

| Field | Detail |
|-------|--------|
| **Description** | Repository lacks top-level setup instructions |
| **Sprint fixed** | — (planned: 1.3) |
| **Workaround** | See `app/README.md` and [EVOLVE_ARCHITECTURE.md](../.cursor/rules/EVOLVE_ARCHITECTURE.md) |

### KI-015 — Conversation management API missing

| Field | Detail |
|-------|--------|
| **Description** | No endpoint to list conversations or set titles |
| **Sprint fixed** | — |
| **Workaround** | Client stores `conversation_id` from Coach response; resume via same ID |

### KI-016 — Mobile Coach local LLM / OpenAI / Anthropic stubs

| Field | Detail |
|-------|--------|
| **Description** | Client-side `OpenAIService`, `AnthropicService`, `FutureLocalLLMService` are placeholders |
| **Sprint fixed** | — |
| **Workaround** | Use `MockCoachService` or wire to backend Coach API in Sprint 5.3 |

### KI-017 — Feature flags defined but not wired

| Field | Detail |
|-------|--------|
| **Description** | `FeatureFlags.ts` defines coachStreaming, offlineMode, barcodeScanner, etc. — all unimplemented |
| **Sprint fixed** | — |
| **Workaround** | Flags default to off; no runtime effect |

---

*When resolving an issue, move it from Open to Resolved with sprint ID and date. Never delete entries.*
