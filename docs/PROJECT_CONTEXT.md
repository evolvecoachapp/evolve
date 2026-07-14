# EVOLVE Project Context

**Project:** EVOLVE  
**Version:** 0.5.0  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Onboarding document for developers and AI assistants — product context, philosophy, and workflow before touching code.  
**Source of Truth:** Yes — for product vision, philosophy, and team workflow (technical detail lives in linked docs).

---

## What EVOLVE Is

EVOLVE is an **AI-first fitness coaching platform** delivered as a mobile app backed by a Python API. Users interact with a single **Coach** that programs training, guides nutrition, monitors recovery, remembers context, and analyzes progress — instead of juggling separate workout, diet, and chat apps.

**Monorepo layout:**
- `backend/` — FastAPI REST API, domain services, AI orchestration, PostgreSQL
- `app/` — React Native + Expo mobile client
- `docs/` — Official project knowledge base ([README.md](./README.md))

**Start here, then read:**
- [PROJECT_STATE.md](./PROJECT_STATE.md) — what is built today
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the system is structured
- [TECH_STACK.md](./TECH_STACK.md) — languages, frameworks, versions

---

## Product Vision

Replace fragmented fitness tools with **one continuous digital coach** — adaptive, memory-aware, and grounded in structured fitness domain data (programs, logs, macros, readiness scores), not generic chat alone.

**Long-term:** A trusted daily coach that improves with user history; scales from individuals to coaches managing clients; integrates wearables and calendar data without sacrificing simplicity; runs on production-grade infrastructure.

Full narrative: [EVOLVE_MASTER_REPORT.md](./EVOLVE_MASTER_REPORT.md)

---

## Long-Term Goals

1. **Unified coaching** — one persona, multiple specialized engines behind the scenes
2. **Adaptive programming** — workouts, nutrition, and recovery adjust to outcomes and readiness
3. **Persistent memory** — conversations and history inform every recommendation
4. **Mobile-first daily loop** — open app → see today's plan → log → talk to Coach
5. **Production operations** — CI/CD, monitoring, managed database, runbooks
6. **Coach marketplace (future)** — trainers manage multiple clients on shared infrastructure

Roadmap detail: [ROADMAP.md](./ROADMAP.md)

---

## Target Users

| Segment | Need | EVOLVE fit |
|---------|------|------------|
| **Committed lifters** | Structured programs, session logging, progression | Workout resolution + logging API; Coach explains today's session |
| **Body recomposition** | Macro targets, adherence tracking | Rule-based nutrition engine + meal logging |
| **Busy professionals** | One app, minimal context switching | Single Coach interface across domains |
| **Recovery-conscious athletes** | Readiness-aware training | Recovery engine + training load from logs |
| **Future: online coaches** | Client management at scale | Architecture anticipates multi-user/coach roles (not yet implemented) |

**Primary persona (now):** Individual user with a smartphone who wants intelligent, integrated fitness guidance — not a spreadsheet or five separate apps.

---

## Main Competitors

| Product | Strength | Gap EVOLVE addresses |
|---------|----------|----------------------|
| **Strong / Hevy** | Excellent workout logging | No integrated nutrition, recovery, or conversational coaching |
| **MyFitnessPal** | Large food database, habit tracking | No adaptive training or unified Coach |
| **Fitbod / Future** | AI workout suggestions | Limited nutrition/recovery integration; opaque AI |
| **Whoop / Oura** | Recovery and readiness data | Not a full coaching loop for programming and nutrition |
| **ChatGPT / generic AI** | Flexible conversation | No persistent fitness domain model, logging, or program state |
| **Noom** | Behavior-focused nutrition coaching | Weak strength-training domain; not lifter-centric |

EVOLVE does not compete on food-database size or wearable hardware — it competes on **coherent, memory-backed coaching across training, nutrition, and recovery**.

---

## What Differentiates EVOLVE

1. **One Coach, many engines** — workout resolution, nutrition, recovery, and progress analyzers feed a single conversational interface
2. **Backend-first domain model** — programs, logs, meals, check-ins, and chat are durable relational data, not prompt-only state
3. **Hybrid AI** — rule-based engines where determinism matters (macros, readiness); LLM where language adds value (Coach replies, progress narrative, intent)
4. **Clean Architecture** — swappable LLM providers, mobile mock→backend providers, testable services
5. **Incremental honesty** — mock-first mobile shells, graceful LLM degradation, explicit ADRs for every major decision

Decisions log: [DECISIONS.md](./DECISIONS.md)

---

## Project Philosophy

- **Ship foundation before features** — database, migrations, and auth before AI polish
- **One verifiable slice per sprint** — split scope when deliverables are independent (see Sprint 4.3/4.4 split)
- **Documentation is deliverable** — knowledge base updated every sprint ([Documentation Maintenance Policy](./README.md#documentation-maintenance-policy))
- **No speculative abstractions** — add patterns when a second consumer exists
- **Append-only history** — sprints, ADRs, and changelog never rewrite the past

---

## Design Philosophy (Product & UX)

- **Mobile-first** — daily coaching happens on the phone, not a dashboard
- **Premium, calm UI** — token-based design system, light/dark/system themes, purposeful motion (reduce-motion respected)
- **Mock-first shells** — layout and navigation before API wiring (ADR-027)
- **Coach as hero** — conversational AI is a first-class tab, not a settings panel
- **Forgiving fitness UX** — program cursor advances on user action, not calendar guilt (ADR-006)

UI status: [FRONTEND_STATUS.md](./FRONTEND_STATUS.md)

---

## AI Philosophy

- **User sees one Coach** — never pick an "engine" or mode
- **Orchestrator coordinates; engines compute** — no domain algorithms in routes or the orchestrator itself
- **Deterministic when numbers matter** — BMR, readiness scores, trend slopes are code, not LLM guesses
- **LLM for language and classification** — replies, narratives, intent; always with fallbacks (ADR-021)
- **Provider-agnostic** — `mock` for dev/CI; `openai_compatible` for any OpenAI-compatible endpoint (ADR-020)
- **Memory is explicit** — conversation rows in PostgreSQL, windowed context, summarization deferred

AI detail: [AI_SYSTEM.md](./AI_SYSTEM.md)

---

## Backend Philosophy

- **Clean Architecture** — `api → services → repositories → models`; AI in `app/ai/`, invoked by services
- **Thin routes** — validate, delegate, serialize
- **PostgreSQL single store** — relational core + JSONB for AI metadata (ADR-002)
- **Alembic-only schema changes** — every model change ships with a migration (ADR-004)
- **Stateless JWT auth** — horizontal scaling without session store
- **Type safety mandatory** — Pydantic v2 schemas, Python type hints, SQLAlchemy 2.x `Mapped[]`

Backend detail: [BACKEND_STATUS.md](./BACKEND_STATUS.md) · Cursor rules: [`evolve.mdc`](../.cursor/rules/evolve.mdc)

---

## Development Workflow

1. **Read context** — this file, [PROJECT_STATE.md](./PROJECT_STATE.md), relevant ADRs
2. **Branch from `main`** — `feature/`, `fix/`, `docs/` naming ([CONTRIBUTING.md](./CONTRIBUTING.md))
3. **One layer or slice per PR** — keep diffs reviewable
4. **Conventional commits** — `feat(auth):`, `docs(roadmap):`, etc.
5. **Tests with behavior changes** — pytest (backend), Jest (mobile)
6. **Update docs in the same PR** — at minimum PROJECT_STATE, SPRINT_HISTORY when closing a sprint
7. **Record architecture decisions** — append to [DECISIONS.md](./DECISIONS.md)
8. **No direct pushes to `main`** — PR + review

Sprint checklists: [TASKS.md](./TASKS.md)

---

## Coding Principles

| Principle | Rule |
|-----------|------|
| **Minimize scope** | Smallest correct diff; no drive-by refactors |
| **Match conventions** | Read surrounding code before writing |
| **No business logic in routes** | Delegate to services immediately |
| **No SQL outside repositories** | SQLAlchemy queries live in `repositories/` |
| **No raw secrets** | `SecretStr`, secure-store on mobile, `.env.example` only in git |
| **Swappable providers** | LLM, BMR, mobile services via factory + env |
| **Tests prove behavior** | Not existence — integration tests for API lifecycles |
| **Comments explain why** | Not what — code should be self-explanatory |

Deep architecture reference: [`.cursor/rules/EVOLVE_ARCHITECTURE.md`](../.cursor/rules/EVOLVE_ARCHITECTURE.md)

---

## Current Snapshot (Quick Reference)

| Item | Value |
|------|-------|
| **Release version** | 0.5.0 |
| **Overall completion** | ~68% |
| **Last completed sprint** | DOC-1.1 — Documentation Finalization |
| **Next sprint** | 5.3 — Core Screens (API Integration) |
| **API endpoints** | 49 implemented · 7 planned ([API_STATUS.md](./API_STATUS.md)) |
