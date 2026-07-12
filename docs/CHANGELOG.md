# Changelog

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
- `Program`, `ProgramDay`, and `ProgramAssignment` models with migration (Sprint 3.2 — Roadmap Phase 3). `ProgramDay` schedules an optional `Workout` template onto a `(week_number, day_number)` slot, with `day_number` intentionally open-ended (not capped to a 7-day week) so any training-day cadence is representable.
- `Workout` and `WorkoutExercise` models with migration — a reusable, standalone workout template (ordered target exercises), independent of any program. `WorkoutLog` model added as a session-level schema shell only (per-exercise/per-set logging arrives in Sprint 3.3 alongside the logging API).
- `ProgramRepository` and `WorkoutRepository`.
- `WorkoutService` covering program authoring (create/update/publish/archive), workout-template authoring (create/update/deactivate), and the program-assignment flow (`assign_program` with auto-abandon of any existing active assignment, `complete_assignment`, `abandon_assignment`).
- Pydantic schemas: `app/schemas/program.py`, `app/schemas/workout.py`.
- `get_workout_service` FastAPI dependency wiring.
- `WorkoutLogExercise` and `WorkoutSetLog` models with migration (Sprint 3.3 — Roadmap Phase 3, Workout Execution). `WorkoutLogExercise` snapshots the prescribed target (`exercise_name_snapshot`, `target_sets`, `target_reps_min/max`, `rest_seconds`) at add-time so history stays accurate even if the source `Exercise`/`Workout` template is later renamed or edited; `WorkoutSetLog` carries per-set performance (`weight_kg`, `reps`, `rpe`, `duration_seconds`, `is_warmup`). `WorkoutLog` gains `started_at`, an `IN_PROGRESS` status, and a partial unique index (`uq_workout_logs_one_in_progress_per_user`) enforcing at most one active session per user; `performed_at` is renamed to `completed_at`.
- `WorkoutLogRepository` — owns the `workout_logs`/`workout_log_exercises`/`workout_set_logs` tables, moved out of `WorkoutRepository` (which keeps `Workout`/`WorkoutExercise` templates only).
- `WorkoutLogService` covering the full execution lifecycle: `start_workout` (always directly `IN_PROGRESS`; auto-seeds exercises from a template when `workout_id` is given), `finish_workout`, `skip_workout`, `add_exercise`, `log_set`/`update_set`/`delete_set` (server-assigned `order_index`/`set_number`; edits gated by a configurable post-completion edit window, default 24h via `Settings.workout_log_edit_window_hours`), and `list_history`.
- `app/schemas/workout_log.py` — request/response contracts for the execution API (`WorkoutLogStart`, `WorkoutLogFinish`, `WorkoutLogExerciseCreate`, `WorkoutSetLogCreate`/`Update`, `WorkoutLogDetail`, `WorkoutLogSummary`, `WorkoutLogPage`).
- `app/api/v1/workout_logs.py` — `/api/v1/workout-logs` routes for start/active/history/detail/finish/skip/add-exercise/log-set/update-set/delete-set, all ownership-checked via `get_current_user`. `get_workout_log_service` FastAPI dependency wiring.
- Test infrastructure: `pytest`, `pytest-mock`, `httpx` added to `backend/requirements.txt`; `backend/pytest.ini`; `backend/tests/conftest.py` (transaction-rollback-isolated DB session, test-user, and auth-header fixtures); unit tests for `WorkoutLogService` (`backend/tests/unit/test_workout_log_service.py`) and an integration test covering the full start → log → edit → finish → history lifecycle against a real PostgreSQL instance (`backend/tests/integration/test_workout_logs_api.py`).

### Changed
- `app/models/workout.py` no longer defines `WorkoutLog`/`WorkoutLogStatus` — moved to the new `app/models/workout_log.py`, alongside `WorkoutLogExercise`/`WorkoutSetLog`, to separate the workout *template* aggregate from the *execution* aggregate.
- `schemas/workout.py`'s shell-only `WorkoutLogRead` is removed, superseded by `app/schemas/workout_log.py`.

### Fixed
- Nothing yet.

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

*Future releases: `0.2.0` (Authentication), `0.3.0` (Workout Engine), `0.4.0` (AI Coach), `0.5.0` (Mobile App), `1.0.0` (Production).*
