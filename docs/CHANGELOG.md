# Changelog

**Project:** EVOLVE  
**Version:** 0.5.0 (current release)  
**Status:** Living Document  
**Last Updated:** 2026-07-14  
**Purpose:** Semantic release history; accumulate changes under `[Unreleased]` until tagged.  
**Source of Truth:** Yes — for release versions and shipped changes.
All notable changes to EVOLVE are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Policy

Given a version number `MAJOR.MINOR.PATCH`:

- **MAJOR** — incompatible API changes, or breaking changes to the database schema/contract that require migration by consumers.
- **MINOR** — new functionality added in a backward-compatible manner (e.g., a new roadmap phase delivered).
- **PATCH** — backward-compatible bug fixes and small corrections.

While the project is pre-1.0 (`0.x.y`), the API and schema may still change between minor versions as the Foundation, Authentication, and Workout Engine phases stabilize. Version `1.0.0` will mark the first production-ready release (end of Phase 6).

Each release section groups changes under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

---

## [Unreleased]

### Added
- `UserService` with `update_profile()` — partial profile updates with email/username conflict detection
- `PATCH /api/v1/users/me` route wired through `get_user_service()` dependency
- Mobile user profile provider stack: `BackendUserService`, `MockCurrentUserService`, `useCurrentUser()` hook
- `updateCurrentUser()` API client for profile PATCH
- Unit tests (`test_user_service.py`) and integration tests (`test_users_api.py`)
- Profile edit mode on `ProfileScreen` — `useProfileEdit`, `ProfileEditForm`, validation, save/cancel (Sprint 6.1)
- `CurrentUserService.updateProfile()` and `useCurrentUser().updateProfile()` / `saving` state (Sprint 6.1)
- Profile form utilities (`profileForm`, `profileValidation`, `profileLabels`) and screen/service tests (Sprint 6.1)
- Official project knowledge base under `docs/` (Sprint DOC-1): README index, master report, project state, sprint history, architecture summary, status reports, API inventory, known issues
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) and [TECH_STACK.md](./TECH_STACK.md) (Sprint DOC-1.1)
- Standardized document headers across all `docs/` markdown files
- Documentation Maintenance Policy in [README.md](./README.md)

### Changed
- `ProfileScreen` now supports read/edit modes with backend-backed save via `useCurrentUser()` (Sprint 6.1)
- `ProfileScreen` now consumes `useCurrentUser()` instead of `profileMock` + direct `useAuth()` user fields
- `CurrentUserService` extended with `providerId` and `refresh()` for async backend loading
- API endpoint counts reconciled: **50 implemented**, **6 planned** ([API_STATUS.md](./API_STATUS.md))
- `docs/ROADMAP.md` — phase completion status table
- `docs/DECISIONS.md` — standard document header
- API endpoint counts reconciled: **49 implemented**, **7 planned** ([API_STATUS.md](./API_STATUS.md))

---

## [0.5.0] — Mobile App (Partial)

**Corresponds to:** Roadmap Phase 5 — Mobile App (Sprints 5.1, 5.2, 5.6)

### Added
- React Native + Expo mobile client at `app/` (ADR-025)
- JWT auth flow with expo-secure-store token persistence (ADR-026)
- Design system with light/dark/system theme support
- 6-tab navigation: Home, Workout, Nutrition, Coach, Progress, Profile
- Feature-module architecture with service factory + provider pattern
- Workout domain foundation (types, hooks, mock program data)
- UI polish: animations, hero components, settings screens, haptics
- Mobile test suite (Jest + Testing Library)

### Notes
- All feature data uses mock providers; backend integration is Sprint 5.3
- Dark mode added in Sprint 5.6 (extends ADR-027 light-only scope)

---

## [0.4.0] — AI Coach

**Corresponds to:** Roadmap Phase 4 — AI Coach (Sprints 4.1–4.6)

### Added
- Workout Resolution Engine with stored program cursor (ADR-006)
- AI Orchestrator, Memory Engine, Conversation/ChatMessage persistence (ADRs 007–009)
- Nutrition Engine — rule-based BMR/TDEE/macros (ADRs 010–013)
- Recovery Engine — readiness scoring from check-ins + training load (ADRs 014–016)
- Coach API with Workout/Nutrition/Recovery engine adapters (ADRs 017–019)
- Goal and Progress domains with Progress Analyzer (ADRs 022–023)
- OpenAI-compatible LLM provider with graceful degradation (ADRs 020–021)
- LLM-primary intent classification with keyword fallback (ADR-024)
- Endpoints: `/coach`, `/nutrition`, `/recovery`, `/goals`, `/progress`

---

## [0.3.0] — Workout Engine

**Corresponds to:** Roadmap Phase 3 — Workout Engine (Sprints 3.1–3.3, 4.1)

### Added
- Exercise catalog with read-only API and seed data
- Program, workout template, and program assignment models
- Full workout logging lifecycle (start → log sets → finish/skip → history)
- Workout Resolution Engine (`GET /workout-resolution/today`)
- 8 Alembic migrations covering full fitness domain schema
- Comprehensive unit and integration test suite

### Notes
- Program/workout authoring exists in service layer but has no HTTP API yet

---

## [0.2.0] — Authentication

**Corresponds to:** Roadmap Phase 2 — Authentication (Sprints 2.1–2.2)

### Added
- `User` model with Argon2 password hashing
- JWT access + refresh token flow
- `AuthService`, `UserRepository`, `get_current_user` dependency
- Endpoints: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `GET /users/me`
- First Alembic migration (`users` table)

### Notes
- Profile update endpoint and role field deferred to Sprint 2.3 completion

---

## [0.1.0] — Foundation

**Corresponds to:** Roadmap Phase 1 — Foundation

### Added
- SQLAlchemy 2.x database engine, session factory, and `get_db()` dependency (`backend/app/db/database.py`).
- Environment-based application configuration via Pydantic Settings (`backend/app/core/config.py`).
- `DATABASE_URL` and core application environment variables documented in `.env.example`.
- Alembic fully configured (`alembic.ini`, `env.py`, `script.py.mako`), wired to read the database URL from application settings.
- Model registration hook (`backend/app/db/base.py`) for future Alembic autogeneration.
- Project architecture reference (`EVOLVE_ARCHITECTURE.md`) covering vision, backend architecture, folder structure, AI architecture, database entities, roadmap, coding standards, and deployment strategy.
- Cursor project rules (`evolve.mdc`) defining Clean Architecture conventions for all future contributions.

### Changed
- Consolidated `backend/requirements.txt`, removing duplicate and conflicting dependencies (`psycopg2-binary` in favor of `psycopg[binary]`); added `pydantic-settings`.

### Notes
- No Alembic migrations have been generated yet — the migration chain begins with the `User` model in Phase 2.
- `backend/app/main.py` intentionally remains unchanged from its original minimal health-check form; database wiring at startup is deferred until the foundation is fully verified and migrations exist.
- No authentication, user, or AI functionality is included in this release — strictly database and configuration foundation.

---

*Next release: `1.0.0` (Production — Phase 6).*
