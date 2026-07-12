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
- **Workout Resolution Engine** (Sprint 4.1 — closes out Phase 3 Sprint 3.3's "rule-based Workout Engine (pre-AI, template-driven)" deliverable). Answers "what should this user do right now in their active program?":
  - `ProgramAssignment` gains a persistent progress cursor (migration `84b668dd4276`): `current_week_number`/`current_day_number` (the `ProgramDay` slot resolved as "next up", `CHECK > 0`, initialized to the program's first scheduled day on assignment), `current_program_day_id` (nullable convenience FK to the same slot, `SET NULL` if that `ProgramDay` is later hard-deleted), and `cursor_exhausted` (set once there is no further day to advance to).
  - `ProgramRepository` gains `get_day_at`, `get_first_day`, and `get_next_day_after` for cursor initialization/resolution/advancement.
  - `WorkoutResolutionService` (`app/services/workout_resolution_service.py`) — deterministic, rule-based (not AI) resolution to one of four states (`training_day`, `rest_day`, `program_complete`, `no_active_program`), decorated with same-day `WorkoutLog` status. Resolution reads never mutate; the cursor only advances via `advance_after_action` (an internal side effect, called automatically by `WorkoutLogService.finish_workout`/`skip_workout` when a session is tied to a program assignment) or `advance_past_rest_day` (the explicit action for a rest day, which has no `WorkoutLog` of its own).
  - `WorkoutService.assign_program` now initializes the new cursor and rejects assigning a program with zero scheduled days (`ProgramNotAssignableError`).
  - New schemas (`app/schemas/workout_resolution.py`): `WorkoutResolutionState`, `TodayLogStatus`, `WorkoutPreview`; `ProgramAssignmentRead` gains the three cursor fields.
  - New endpoints: `GET /api/v1/workout-resolution/today` (read-only preview), `POST /api/v1/workout-resolution/advance-rest-day` (rest-day advance action).
  - Unit tests for `WorkoutResolutionService`, `WorkoutService.assign_program`, and the `WorkoutLogService` cursor-advance side effect; an integration test covering the full resolve → start → finish → rest day → advance → resolve → skip → program-complete lifecycle against a real PostgreSQL instance (`backend/tests/integration/test_workout_resolution_api.py`).
- **AI Orchestrator Infrastructure** (Sprint 4.2 — Roadmap Phase 4, picking up the scope originally planned for Sprint 4.1, whose label was consumed by the Workout Resolution Engine above; see `docs/ROADMAP.md`/`docs/TASKS.md` for the renumbering and Decisions 007–009 in `docs/DECISIONS.md` for the underlying rationale):
  - `Conversation` and `ChatMessage` models with migration (`app/models/chat.py`) — a dedicated `Conversation` aggregate root (`id`, `user_id`, `created_at`, `updated_at`, `last_message_at`) introduced ahead of any conversation-listing/title/archiving feature, rather than a bare `conversation_id` column on `ChatMessage`, specifically to avoid a future backfill migration once real chat data exists (Decision 007). `ChatMessage.conversation_id` is a real foreign key (`ON DELETE CASCADE`); `ChatMessage.user_id` is denormalized for join-free ownership checks. `ChatMessage.metadata` is `JSONB`, holding `intent_detected`/`engines_invoked` per turn.
  - `ChatRepository` (`app/repositories/chat_repository.py`) — owns both tables as one aggregate: `create_conversation`, `get_conversation`, `get_latest_conversation` (indexed via `ix_conversations_user_last_message`), `create_message` (also advances the parent conversation's `last_message_at`), `list_messages`.
  - `app/ai/contracts.py` — shared Pydantic types for the AI layer: `Intent`, `ChatTurn`, `MemoryContext`, `EngineInput`, `EngineOutput`.
  - `app/ai/engine.py` — the `AIEngine` protocol future domain engines (Nutrition, Recovery, Progress Analyzer) will implement; no concrete engine exists yet.
  - `app/ai/intent.py` — `classify_intent()`, a keyword-matching stub per the roadmap's original "intent routing stub" wording; replaced by a real classifier once engines exist to route to.
  - `app/ai/llm_provider.py` — provider-agnostic `LLMProvider` abstraction (`complete()`, `async`) and a deterministic, offline `MockLLMProvider`; `get_llm_provider()` resolves the implementation from `settings.ai_provider` (`"mock"` only — real vendor integration is deferred; Decision 008).
  - `app/ai/memory_engine.py` — `MemoryEngine` v1: `start_or_resume_conversation` (the single place a `Conversation` row is minted — resumes an explicit id if found, else the user's latest conversation, else creates a new one), `get_context` (windowed by `settings.ai_memory_max_turns`), `record_turn`. Fully synchronous, matching every other repository/service in the codebase.
  - `app/ai/orchestrator.py` — `AIOrchestrator.process_message`: resolves/creates the conversation, assembles memory context, classifies intent, routes to a registered engine or falls back to a direct LLM completion, persists both the user and assistant turns, and returns a `CoachResponse`. The only `async def` in the backend (Decision 009); no engine is registered yet, so every message currently uses the LLM fallback path.
  - `settings.ai_provider` (default `"mock"`) and `settings.ai_memory_max_turns` (default `20`) in `app/core/config.py`; `.env.example` gains `AI_PROVIDER`/`AI_MEMORY_MAX_TURNS`.
  - `pytest-asyncio` added to `backend/requirements.txt`; `asyncio_mode = auto` added to `backend/pytest.ini` — the first async code in the test suite.
  - Unit tests for `MemoryEngine`, `MockLLMProvider`, and `AIOrchestrator` (all dependencies mocked); an integration test covering conversation creation/resumption and full user+assistant turn persistence against a real PostgreSQL instance (`backend/tests/integration/test_chat_persistence.py`).
  - No `CoachService` and no `/api/v1/coach` endpoint yet — those, along with real LLM provider integration, remain Sprint 4.5 (renumbered from 4.4 when Sprint 4.3 was split — see below).
- **Nutrition Engine** (Sprint 4.3 — Roadmap Phase 4; originally scoped together with the Recovery Engine, split into its own sprint — Recovery Engine moves to a new Sprint 4.4, and the former Sprint 4.4 "Progress & Coach Endpoint" is renumbered to 4.5; see Decisions 010–013 in `docs/DECISIONS.md`):
  - `Meal` and `MealLog` models with migration (`app/models/meal.py`) — a template/log pair mirroring `Workout`/`WorkoutLog`. `Meal` uses a nullable `created_by_id` plus an `is_public` flag (mirrors `Exercise`/`Program`'s catalog-vs-authored shape), future-proofed for a shared/EVOLVE-provided meal library without a later backfill migration (Decision 012); this sprint's API only ever creates private meals. `MealLog` is always strictly personal and snapshots its name/type/macros at log time (from the template, or supplied directly for an ad-hoc entry), so later template edits never rewrite history.
  - `app/ai/bmr_strategies.py` — `BMRStrategy` abstract base class (`calculate(profile) -> Decimal`) plus `MifflinStJeorBMRStrategy`, resolved via `get_bmr_strategy(settings.nutrition_bmr_formula)`, mirroring `LLMProvider`/`get_llm_provider()`'s shape. Isolates the BMR equation so additional formulas (Katch-McArdle, Cunningham, Harris-Benedict) can be added later as new classes without touching `NutritionEngine` (Decision 013). Also defines the shared `NutritionProfile` contract.
  - `app/ai/nutrition_constants.py` — `ACTIVITY_MULTIPLIERS`, `PROTEIN_G_PER_KG_BY_GOAL`, `BMR_SEX_OFFSET` lookup tables.
  - `app/ai/nutrition_engine.py` — `NutritionEngine`, a rule-based, deterministic engine (no LLM call, no food database) that computes BMR (via the injected `BMRStrategy`) × activity multiplier × goal adjustment (clamped to a configurable minimum-calorie floor) for calorie targets, plus protein/fat/carb targets and per-macro adherence classification (`under`/`on_track`/`over`) against logged totals; generates its own templated `summary_text`. Defines and consumes its own typed `NutritionInput`/`NutritionOutput` contracts rather than the generic `AIEngine` protocol, and is **not** registered into `AIOrchestrator.engines` this sprint — there is no consuming chat endpoint yet (Decision 011). Raises `IncompleteNutritionProfileError` as a documented precondition (validated by the service, not the engine).
  - New `Settings` fields: `nutrition_bmr_formula`, `nutrition_calorie_deficit_kcal`, `nutrition_calorie_surplus_kcal`, `nutrition_fat_pct_of_calories`, `nutrition_min_calories_floor`, `nutrition_adherence_tolerance_pct`; corresponding `.env.example` entries.
  - `age_in_years(birth_date, as_of=None)` added to `app/utils/datetime.py`.
  - `MealRepository` (`app/repositories/meal_repository.py`) — owns both `meals` and `meal_logs` as one aggregate pair (mirrors `ChatRepository`'s precedent), including `sum_totals_for_date` for the daily-targets aggregate query.
  - `NutritionService` (`app/services/nutrition_service.py`) — meal template CRUD (create/update/deactivate/get/list, enforcing public-or-owned visibility and owned-only writes), meal logging (template-snapshot or ad-hoc modes), and `get_daily_nutrition` (validates profile completeness, aggregates that date's logged totals, delegates to `NutritionEngine`). Constructs its own `NutritionEngine` internally via `get_bmr_strategy(settings.nutrition_bmr_formula)` — no service-to-service composition.
  - `app/schemas/nutrition.py` — `MealCreate`/`MealUpdate`/`MealRead`/`MealPage`, `MealLogCreate`/`MealLogUpdate`/`MealLogRead`/`MealLogPage` (with a model validator enforcing exactly one of template-mode `meal_id` or ad-hoc name/macros), `DailyNutritionRead`.
  - `app/api/v1/nutrition.py` — `/api/v1/nutrition` routes: `POST`/`GET`/`GET {id}`/`PATCH`/`DELETE` for `/meals`, `POST`/`GET`/`GET {id}`/`PATCH`/`DELETE` for `/logs`, and `GET /targets?for_date=` (422 on an incomplete profile). All routes ownership-checked via `get_current_user`. `get_nutrition_service` FastAPI dependency wiring.
  - Unit tests for `BMRStrategy`/`get_bmr_strategy` (`test_bmr_strategies.py`), `NutritionEngine` (`test_nutrition_engine.py` — BMR/TDEE/target math, calorie-floor clamping, adherence boundaries), and `NutritionService` (`test_nutrition_service.py` — mocked repositories, visibility/ownership rules, incomplete-profile error path); an integration test covering the full meal/log lifecycle and daily targets against a real PostgreSQL instance (`backend/tests/integration/test_nutrition_api.py`).

### Changed
- `app/models/workout.py` no longer defines `WorkoutLog`/`WorkoutLogStatus` — moved to the new `app/models/workout_log.py`, alongside `WorkoutLogExercise`/`WorkoutSetLog`, to separate the workout *template* aggregate from the *execution* aggregate.
- `schemas/workout.py`'s shell-only `WorkoutLogRead` is removed, superseded by `app/schemas/workout_log.py`.
- `WorkoutLogService.__init__` gains a required `workout_resolution_service` parameter (Sprint 4.1) so `finish_workout`/`skip_workout` can trigger the Workout Resolution Engine's cursor-advance side effect; `core/dependencies.get_workout_log_service` wiring updated accordingly.

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
