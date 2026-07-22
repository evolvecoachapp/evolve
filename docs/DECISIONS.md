# Architecture Decision Records

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document (append-only)  
**Last Updated:** 2026-07-22  
**Purpose:** Log of significant architectural decisions (ADR-001 through ADR-030). Append only — never renumber.  
**Source of Truth:** Yes — for architecture decisions and rationale.

New decisions append as Decision 031, 032, … Format inspired by lightweight ADRs. **Decision NNN = ADR-NNN.**

---

## Decision 001 — Use FastAPI as the Backend Framework

**Status:** Accepted

**Context:**
EVOLVE needs a Python backend framework capable of serving a versioned REST API, validating input rigorously, generating accurate API documentation, and eventually supporting async workloads (AI orchestration, background jobs).

**Decision:**
Adopt **FastAPI** as the sole web framework for the backend.

**Why:**
- **Native async support** — well-suited for I/O-bound operations (database calls, future AI/LLM calls) without blocking the event loop.
- **Pydantic-native validation** — request/response schemas are enforced automatically and double as living API documentation.
- **Automatic OpenAPI generation** — `/docs` and `/redoc` are available with zero extra tooling, which matters for a fast-moving early-stage project.
- **Dependency injection model** — fits Clean Architecture cleanly (`get_db`, `get_current_user` as composable dependencies) without a heavy DI framework.
- **Strong ecosystem and performance** — built on Starlette/Uvicorn, production-proven, minimal overhead versus Flask/Django for API-only workloads.

**Alternatives considered:**
- **Django REST Framework** — more batteries-included but heavier, and its ORM-centric, synchronous-by-default design conflicts with the async, AI-heavy direction of EVOLVE.
- **Flask** — simpler but requires manually assembling validation, async support, and OpenAPI generation — more integration work for the same result.

**Consequences:**
- The team commits to Pydantic v2 for all schema validation.
- Async endpoints are the default expectation for I/O-bound routes, particularly those touching AI engines.

---

## Decision 002 — Use PostgreSQL as the Primary Database

**Status:** Accepted

**Context:**
EVOLVE's domain includes highly relational data (users, programs, workouts, exercises, goals) as well as semi-structured data (AI memory snapshots, chat metadata, coaching context). The database must support strong consistency for transactional fitness data while remaining flexible enough for evolving AI-related structures.

**Decision:**
Adopt **PostgreSQL** as the sole primary datastore.

**Why:**
- **ACID guarantees** — critical for user accounts, logged workouts, and progress data where consistency matters.
- **Rich relational modeling** — fitness domain data (users → programs → workouts → exercises) is naturally relational with many foreign-key relationships.
- **JSON/JSONB support** — allows flexible storage for AI-related metadata (chat context, engine outputs) without needing a second database technology.
- **Mature ecosystem** — first-class support in SQLAlchemy and Alembic, wide availability as a managed service across cloud providers.
- **Proven scalability path** — read replicas, connection pooling, and partitioning are all well-understood for PostgreSQL when the platform grows.

**Alternatives considered:**
- **MongoDB** — flexible schema is appealing for AI data, but sacrifices relational integrity for core fitness domain entities where it matters most (users, programs, progress).
- **MySQL** — comparable relational capabilities, but weaker native JSON support and a less feature-rich extension ecosystem than PostgreSQL for this use case.

**Consequences:**
- One database technology serves both structured domain data and semi-structured AI context, avoiding polyglot persistence complexity in the early phases.
- JSONB columns may be used for AI metadata, but core entities remain fully relational.

---

## Decision 003 — Use SQLAlchemy 2.x as the ORM

**Status:** Accepted

**Context:**
The backend needs a way to map Python objects to PostgreSQL tables while keeping database logic isolated from business logic (per Clean Architecture) and supporting type-safe, testable code.

**Decision:**
Adopt **SQLAlchemy 2.x** (declarative style) as the exclusive ORM.

**Why:**
- **Mature and PostgreSQL-native** — deep support for PostgreSQL-specific features (JSONB, arrays, constraints) if/when needed.
- **2.x style improves type safety** — `Mapped[]` and `mapped_column()` integrate with type checkers, aligning with the "always use type hints" principle in `evolve.mdc`.
- **Works seamlessly with Alembic** — the same models that define application structure drive migration generation, keeping schema and code in sync.
- **Fits the repository pattern** — SQLAlchemy's `Session` object is easily wrapped behind repository classes, keeping queries out of services and routes.
- **Avoids raw SQL** — as mandated by `evolve.mdc`, SQLAlchemy's query builder covers the vast majority of needs without hand-written SQL.

**Alternatives considered:**
- **Raw SQL / `asyncpg` directly** — faster to write initially but forfeits type safety, migration tooling, and maintainability as the schema grows.
- **Tortoise ORM** — async-native and lighter weight, but a smaller ecosystem and weaker Alembic-equivalent migration tooling compared to SQLAlchemy.

**Consequences:**
- All models live under `models/` using SQLAlchemy 2.x declarative syntax.
- Raw SQL is disallowed unless explicitly required and justified, per project rules.

---

## Decision 004 — Use Alembic for Schema Migrations

**Status:** Accepted

**Context:**
The database schema will evolve continuously across six roadmap phases. Ad-hoc schema creation (e.g., `Base.metadata.create_all()`) is unsafe for production: it provides no history, no rollback path, and no coordination across environments or team members.

**Decision:**
Adopt **Alembic** as the exclusive schema migration tool, replacing any `create_all()`-based schema management.

**Why:**
- **Native SQLAlchemy integration** — Alembic reads the same declarative models used by the application, minimizing drift between code and schema.
- **Versioned, reviewable history** — every schema change is a file in version control, reviewable in pull requests like any other code change.
- **Rollback support** — `downgrade()` paths allow safe recovery from a bad deployment.
- **Environment parity** — the same migration chain runs identically in development, staging, and production, which `create_all()` cannot guarantee.
- **Required by CI/CD** — the planned deployment pipeline (Phase 6) runs migrations automatically before deploying new application code; this requires a real migration tool, not implicit schema creation.

**Alternatives considered:**
- **`Base.metadata.create_all()` only** — sufficient for early prototyping (and used transiently before Alembic was configured) but explicitly disallowed for ongoing development because it cannot alter existing tables or provide rollback.
- **Django-style migrations** — not applicable outside Django; would require adopting Django, contradicting Decision 001.

**Consequences:**
- No schema changes are made via `create_all()` in application startup code.
- Every model change must be accompanied by a corresponding Alembic migration in the same pull request.

---

## Decision 005 — Use Docker and Docker Compose for Local and Deployment Environments

**Status:** Accepted

**Context:**
EVOLVE needs a consistent way to run PostgreSQL and the backend API across developer machines, CI, and eventually production, without "works on my machine" drift.

**Decision:**
Adopt **Docker** for containerization and **Docker Compose** for local multi-service orchestration.

**Why:**
- **Environment parity** — the same container image that runs locally can run in CI and production, minimizing environment-specific bugs.
- **Zero-install onboarding** — new contributors only need Docker installed to get PostgreSQL (and eventually the API) running, rather than manually installing and configuring PostgreSQL locally.
- **Multi-service composition** — Docker Compose cleanly expresses the dependency between the API and PostgreSQL (and later, additional services such as Redis or AI workers) in one declarative file.
- **Smooth path to production** — the same Dockerfile used in development is hardened (multi-stage build) for production deployment, rather than requiring a rewrite.
- **Cloud-agnostic** — containers run on any container-friendly platform (ECS, Cloud Run, Fly.io, Kubernetes), keeping the infrastructure decision in Phase 6 open per `EVOLVE_ARCHITECTURE.md`.

**Alternatives considered:**
- **Bare-metal / manually installed services** — faster to start with no Docker overhead, but reintroduces "works on my machine" problems and complicates onboarding and CI parity.
- **Vagrant / VM-based environments** — heavier resource footprint than containers with no meaningful benefit for this use case.

**Consequences:**
- `docker-compose.yml` is the canonical way to run the local development stack.
- Production deployment (Phase 6) will use a multi-stage Dockerfile and equivalent container orchestration in the cloud.

---

## Decision 006 — Resolve Program Progress via a Stored Cursor, Not Calendar Math

**Status:** Accepted

**Context:**
The Workout Resolution Engine (Sprint 4.1, closing Phase 3 Sprint 3.3's "rule-based Workout Engine" deliverable) must answer "what should this user do right now in their active program?" `ProgramAssignment` previously tracked only `started_at`/`ended_at`/`status` — nothing about *where* the user currently is within the program's `(week_number, day_number)` structure. Two designs were viable: (a) derive the current slot purely from elapsed calendar time since `started_at`, or (b) persist an explicit progress cursor that advances only when the user acts (finishes/skips a session, or explicitly passes a rest day).

**Decision:**
Add a persisted, completion-based progress cursor to `ProgramAssignment` — `current_week_number`, `current_day_number`, `current_program_day_id` (a best-effort convenience FK to the same slot), and `cursor_exhausted` (set once there is no further scheduled day). The cursor only advances via explicit actions in the new `WorkoutResolutionService`, never by comparing `started_at` to the current date.

**Why:**
- **Forgiving of real-world schedule slippage** — a user who misses a day, trains extra days, or takes a longer rest doesn't get "behind" or see a `ProgramDay` that no longer matches what they actually did next; the cursor only moves when they act, matching how fitness apps like this are normally used ("pick up where you left off," not "catch up to today's calendar date").
- **`day_number` was never a calendar concept** — `ProgramDay.day_number` is explicitly scoped within its week and open-ended (not capped to 7), so it cannot be mapped onto real weekdays; calendar-based resolution would need an entirely separate cadence model to make that mapping meaningful.
- **Deterministic and cheap to resolve** — reading the cursor is an O(1) lookup (`ProgramRepository.get_day_at`); a computed/inferred alternative (e.g. counting completed `WorkoutLog` rows) would require scanning history on every resolution and guessing which logs "count" toward progress (ad-hoc sessions logged against the same assignment complicate that count).
- **Rest days and program completion become explicit, not inferred** — `cursor_exhausted` and a `ProgramDay` with `workout_id IS NULL` are both first-class, checkable states, so the API never has to silently skip a rest day or silently auto-complete an assignment to produce an answer.

**Alternatives considered:**
- **Calendar-based resolution** (`current_day = floor((today - started_at) / cadence)`) — simplest to reason about with zero extra schema, but assumes a program's cadence maps predictably onto calendar days, which `ProgramDay`'s open-ended `day_number` design explicitly does not guarantee; also means a missed day permanently desyncs "today's calendar slot" from "what the user actually needs to do next."
- **Fully computed cursor** (derive position by counting `COMPLETED`/`SKIPPED` `WorkoutLog` rows tied to the assignment, no new columns) — avoids a migration, but requires scanning log history on every resolution and is ambiguous about which logged sessions should count as progress once ad-hoc/make-up sessions exist against the same assignment.

**Consequences:**
- `program_assignments` gained four columns via migration `84b668dd4276` (see `docs/CHANGELOG.md`); `WorkoutService.assign_program` now requires the target program to have at least one scheduled `ProgramDay`.
- The cursor is intentionally *not* auto-managed by any background/scheduled process — it moves only in direct response to a user (or, in the future, Coach-driven) action, keeping the engine's read path a pure, side-effect-free function per invocation, consistent with `EVOLVE_ARCHITECTURE.md`'s "Engines are stateless per invocation" rule for AI modules, even though this engine itself is plain deterministic `services/` logic, not `ai/`.
- If the future Progress Analyzer (Phase 4.3) needs exact slot-level attribution on individual `WorkoutLog` rows (beyond what `program_assignment_id` + `status` + `scheduled_date` already provide), that is deferred to a later, additive migration rather than being built now.

---

## Decision 007 — Introduce the `Conversation` Aggregate Ahead of Any Consuming Feature

**Status:** Accepted

**Context:**
Sprint 4.2 (AI Orchestrator Infrastructure) introduces `ChatMessage` persistence for the Coach. The obvious minimal design stores a bare `conversation_id` UUID column on `ChatMessage`, with no backing table, and generates a fresh UUID per conversation on the fly. No conversation-listing, title, or archiving feature exists yet to justify a dedicated entity.

**Decision:**
Introduce a dedicated `Conversation` aggregate root (`id`, `user_id`, `created_at`, `updated_at`, `last_message_at`) in the same migration as `ChatMessage`, with `ChatMessage.conversation_id` as a real foreign key (`ondelete="CASCADE"`), rather than deferring the entity until a feature consumes it.

**Why:**
- **The entity/FK is the one part of this design that is expensive to retrofit later, not any individual column.** Introducing `Conversation` after real chat data exists would require backfilling one row per historical `conversation_id` and then adding a `NOT NULL` foreign key — genuine migration risk against live data. This sprint is the first time `Chat` exists at all in EVOLVE (no data, nothing deployed), making this the cheapest possible point in the project's lifetime to get the relationship right.
- **Ordinary nullable feature columns carry no such asymmetry.** `title`, archive flags, soft-delete, etc. can be added for free (`ADD COLUMN ... NULL`, no backfill) whenever the feature that needs them actually ships — so they are deliberately *not* added now, avoiding unconsumed, speculative scaffolding.
- **This sprint's own `MemoryEngine` already needs "resume my most recent conversation."** With a real `Conversation` row and a `(user_id, last_message_at)` index, that is an O(1) indexed lookup instead of a `MAX()`/`DISTINCT` scan over `chat_messages`.
- **Matches the aggregate-root pattern already used elsewhere** — `Workout`+`WorkoutExercise`, `WorkoutLog`+`WorkoutLogExercise`+`WorkoutSetLog` — one repository per aggregate, one migration per aggregate.

**Alternatives considered:**
- **Bare `conversation_id` UUID column, no `Conversation` table** — simplest for this sprint alone, but defers the expensive part (backfill + FK) to whenever a conversation-management feature is eventually needed, at which point real data makes it materially harder.
- **Introduce `Conversation` now *with* `title`/archiving fields** (as sketched in initial sprint discussion) — rejected as premature: those fields would have zero consumers this sprint, and unlike the entity itself, they are not expensive to add later.

**Consequences:**
- `conversations` and `chat_messages` ship together in migration `bc3eb53f0581`.
- `ChatRepository` owns both tables as one aggregate; `MemoryEngine.start_or_resume_conversation` is the single place a `Conversation` row is minted.
- Conversation title, rename, archiving, soft-delete, and any listing API remain out of scope until a feature actually consumes them.

---

## Decision 008 — Provider-Agnostic `LLMProvider` Abstraction With a Deterministic Mock

**Status:** Accepted

**Context:**
The AI Orchestrator (Sprint 4.2) needs to call out to a large language model to generate Coach replies. No LLM vendor had previously been chosen anywhere in EVOLVE — no ADR, no dependency, no API key.

**Decision:**
Define an abstract `LLMProvider` interface (`complete(messages) -> LLMCompletion`) and ship exactly one implementation this sprint: a deterministic, offline `MockLLMProvider`. Real vendor integration (OpenAI, Anthropic, or otherwise) is explicitly deferred to a later sprint.

**Why:**
- Lets the Orchestrator's control flow, context assembly, intent-routing stub, and persistence logic be built and fully tested now, without first committing to a vendor, a cost model, or an API-key/secrets story.
- Keeps this sprint's tests fully deterministic and offline — no flaky network calls, no test-time API cost, no secrets required in CI.
- The abstraction itself (not the mock) is the durable deliverable: swapping in a real provider later is a new class plus a config change, not an Orchestrator rewrite.

**Alternatives considered:**
- **Integrate a real provider now (e.g., OpenAI)** — would have forced a vendor decision, cost, and secrets-management story onto an "infrastructure" sprint whose actual goal is the Orchestrator's control flow, not model selection.
- **No abstraction — call a concrete SDK directly from the Orchestrator** — would violate the "AI is isolated"/swappable-engines principle in `EVOLVE_ARCHITECTURE.md` §4 and make the Orchestrator's own tests dependent on whichever vendor was chosen.

**Consequences:**
- `settings.ai_provider` defaults to `"mock"`; any other value raises `ValueError` from `get_llm_provider()` until a real provider is implemented.
- No LLM API key exists in `.env.example` yet — that arrives alongside the real provider in a future sprint.

---

## Decision 009 — Async Boundary Scoped Exclusively to the Orchestrator/LLM Call Path

**Status:** Accepted

**Context:**
Decision 001 anticipated FastAPI's async support being used "particularly [for] those [routes] touching AI engines." Every route, service, and repository shipped so far (Phases 1–3) is fully synchronous — `def`, not `async def`, with a synchronous SQLAlchemy `Session`. The AI Orchestrator (Sprint 4.2) is the first code that anticipates a genuinely I/O-bound external call (a future real LLM API).

**Decision:**
Introduce `async def` only for `AIOrchestrator.process_message` and `LLMProvider.complete`. `MemoryEngine`, `ChatRepository`, and every other existing service/repository remain fully synchronous; the async `process_message` calls into synchronous `MemoryEngine`/`ChatRepository` code directly (not via a thread-pool executor).

**Why:**
- Matches Decision 001's original, narrower intent — async specifically for AI/LLM I/O — without forcing a disruptive, all-at-once sync-to-async migration of the entire existing codebase for this sprint.
- The only call in this sprint's request path that will eventually cross a real network boundary is the LLM completion call; local Postgres reads via `MemoryEngine`/`ChatRepository` are fast enough that calling them synchronously from inside `async def process_message` is an acceptable, explicit trade-off rather than a design flaw.
- Keeps the blast radius of "the first async code in the backend" contained to one new module, one new test-tooling dependency (`pytest-asyncio`), and no changes to any existing route, service, or repository.

**Alternatives considered:**
- **Keep the Orchestrator fully synchronous too** (call a synchronous LLM SDK, blocking the request thread) — simpler and consistent with the rest of the codebase today, but pushes the eventual sync-to-async migration to whenever a real, slower LLM vendor is integrated, at which point more code already depends on the synchronous shape.
- **Migrate all routes/services/repositories to async now** — the most "correct" long-term shape per Decision 001, but far too large a change for an infrastructure sprint scoped to the Orchestrator, and not requested.

**Consequences:**
- `backend/pytest.ini` gains `asyncio_mode = auto`; `backend/requirements.txt` gains `pytest-asyncio`.
- Any future service that calls `AIOrchestrator.process_message` (e.g., the `CoachService` planned for Sprint 4.4) must itself expose an async entrypoint, or bridge via `asyncio.run`/FastAPI's async route support — this is the first ripple of the async boundary outward and is expected.

---

## Decision 010 — Rule-Based, Configurable Nutrition Targets (No LLM, No Food Database)

**Status:** Accepted

**Context:**
Sprint 4.3 (Nutrition Engine) needs to turn a user's profile into calorie/macro targets and compare them against logged intake. No real LLM vendor exists yet (Decision 008 — mock provider only), and the sprint's explicit constraints rule out any food/ingredient database, barcode scanning, or external nutrition API.

**Decision:**
Compute calorie/macro targets with a standard, deterministic formula — a swappable BMR calculation (see Decision 013) × an activity-level multiplier × a goal-based adjustment — driven entirely by fields already on `User` (`current_weight_kg`, `height_cm`, `birth_date`, `gender`, `activity_level`, `goal`). No LLM call is involved in computing targets or adherence. Every tunable coefficient (calorie deficit/surplus, fat percentage, minimum calorie floor, adherence tolerance, the BMR formula selector) lives in `Settings` (environment-configurable) or a dedicated `app/ai/nutrition_constants.py` module (structured lookup tables) — never as an inline magic number in `NutritionEngine`.

**Why:**
- **Matches Decision 006/008's precedent** — until a real LLM vendor is integrated, domain "engines" that need to produce reliable, testable output are plain deterministic logic, not LLM calls.
- **No food database means macros are only ever known if a human enters them** (per meal template or ad-hoc log) — the *targets* side of the equation has to come from a formula, not a lookup, since there is no nutrition dataset to lean on.
- **Configurability without a redeploy** — coefficients that operators are likely to want to tune (deficit/surplus size, fat %, safety floor) are environment variables; larger structured tables (per-activity-level multipliers, per-goal protein targets) are named Python constants, not env vars, since they are not simple scalars.
- **A minimum-calorie safety floor keeps this "sports nutrition," not a crash diet** — consistent with the requirement that the Nutrition Engine stay focused on fitness/performance goals and avoid anything resembling unsupervised medical guidance.

**Alternatives considered:**
- **LLM-generated targets** — rejected for this sprint: no real provider exists, and it would make targets non-reproducible and untestable without mocking, unlike the existing `MockLLMProvider` precedent which is explicitly *not* meant to drive real numeric outputs.
- **A persisted, admin-configured targets table** — rejected as over-engineered for this sprint; targets are cheap to recompute from the live profile on every request, and nothing yet needs to override them per-user.

**Consequences:**
- `Settings` gains `nutrition_bmr_formula`, `nutrition_calorie_deficit_kcal`, `nutrition_calorie_surplus_kcal`, `nutrition_fat_pct_of_calories`, `nutrition_min_calories_floor`, `nutrition_adherence_tolerance_pct`.
- If a user's profile is missing a required field (weight, height, birth date, gender, activity level, or goal), `NutritionService.get_daily_nutrition` raises `IncompleteNutritionProfileError` rather than guessing.

---

## Decision 011 — Nutrition Engine Ships Decoupled From `AIOrchestrator`/`AIEngine` This Sprint

**Status:** Accepted

**Context:**
Sprint 4.2 introduced the generic `AIEngine` protocol (`handle(EngineInput) -> EngineOutput`) so future domain engines could register into `AIOrchestrator.engines`. No engine has used this yet. The Nutrition Engine is the first concrete engine built since then, but the Coach endpoint that would actually route chat messages to it (`CoachService`, `/api/v1/coach`) does not exist until Sprint 4.5 — and today's `AIOrchestrator.process_message` uses a registered engine's `reply_text` directly as the final reply, with no step that blends engine output with an LLM call.

**Decision:**
`NutritionEngine` lives in `app/ai/nutrition_engine.py` (its planned location per `EVOLVE_ARCHITECTURE.md`'s folder structure) but defines and consumes its own typed `NutritionInput`/`NutritionOutput` contracts rather than implementing the generic `AIEngine` protocol, and is not added to `AIOrchestrator.engines` this sprint. `NutritionService` calls it directly.

**Why:**
- **There is no consumer to design the chat-integration contract against yet.** Building the `EngineInput`/`EngineOutput` binding now, before `CoachService` exists, would mean guessing how a future chat turn maps onto "get today's nutrition targets" (e.g. what triggers it, what conversational context it needs) rather than deriving it from a real integration.
- **The domain-specific contract is materially richer than the generic one.** `NutritionOutput` carries structured targets, actuals, and per-macro adherence — collapsing that into `EngineOutput.artifacts: dict | None` today would either lose type safety or force a shape decision that the eventual Coach integration might need to revisit anyway.
- **Keeps `NutritionEngine` trivially unit-testable** — pure functions over typed Pydantic models, no dependency on `MemoryContext`/`Intent`/the Orchestrator at all.

**Alternatives considered:**
- **Implement `AIEngine` now and register it in `AIOrchestrator.engines[Intent.NUTRITION]`** — would make the Nutrition Engine reachable via chat immediately, but forces a premature decision about how structured nutrition data becomes a chat reply, and the Orchestrator would need to be extended (it currently never blends engine output with an LLM call) — a larger change than this sprint's scope.

**Consequences:**
- Reaching the Nutrition Engine's logic requires `/api/v1/nutrition/targets` (or direct service/engine calls in tests) — it is not reachable through `/api/v1/coach` because that endpoint does not exist yet.
- Whichever sprint builds `CoachService`/the Coach endpoint must decide how (or whether) to adapt `NutritionInput`/`NutritionOutput` onto `EngineInput`/`EngineOutput`, or introduce a richer per-engine binding mechanism — that decision is explicitly deferred, not made here.

---

## Decision 012 — `Meal` Templates Use a Nullable `created_by_id` + `is_public` Flag From Day One

**Status:** Accepted

**Context:**
Sprint 4.3 introduces the `Meal` template aggregate. The minimal design — a `NOT NULL` `user_id` FK, strictly personal, matching `WorkoutLog`'s "id-only, user-owned" shape — would be the simplest fit for this sprint's actual deliverable (personal meal templates, no catalog, no admin authoring). But EVOLVE's broader direction (per `EVOLVE_ARCHITECTURE.md` and the `Exercise`/`Workout` catalog precedent) anticipates EVOLVE-provided and/or shared meal libraries eventually existing alongside personal ones.

**Decision:**
`Meal.created_by_id` is a nullable FK to `users.id` (`ondelete="SET NULL"`), and `Meal` gains a `NOT NULL` `is_public` boolean (default `False`), mirroring `Exercise.created_by_id`/`Workout.created_by_id`'s catalog-vs-authored shape rather than `WorkoutLog.user_id`'s strictly-personal shape. This sprint's API and service layer only ever create `is_public=False` meals owned by the requesting user — no admin/catalog-authoring flow or seed data ships yet.

**Why:**
- **Matches Decision 007's core reasoning**: the column/relationship shape is the expensive part to retrofit once real per-user meal data exists (would require a backfill plus a nullability change on a live table); an unconsumed boolean flag or a nullable FK costs nothing extra to carry now, before any data exists.
- **`Exercise`/`Workout` already established this exact pattern** for "some rows are system-authored, some are user-authored" — reusing it for `Meal` is consistent rather than inventing a third ownership shape in the same codebase.
- **No permission system needs to be built this sprint** — because the API never exposes a way to set `is_public=True`, the future capability is purely a schema affordance today, with zero authorization-logic risk introduced now.

**Alternatives considered:**
- **Strictly personal `Meal.user_id` (`NOT NULL`, `CASCADE`)**, matching `WorkoutLog` — simpler for this sprint alone, but would require a disruptive migration (nullable conversion + backfill) the moment a shared/public meal library is ever wanted, unlike the near-zero cost of carrying the nullable column now.
- **A separate `MealCatalogEntry` table for public meals, distinct from personal `Meal` rows** — rejected as needless duplication; `Exercise`/`Workout` demonstrate one table with an ownership/visibility flag is sufficient.

**Consequences:**
- `meals.created_by_id` is nullable and indexed; `meals.is_public` is `NOT NULL`, default `False`, indexed.
- `NutritionService.list_meals`/`get_meal` filter on `created_by_id = :user_id OR is_public = true`; `update_meal`/`deactivate_meal` require `created_by_id == user_id`.
- A future sprint that wants EVOLVE-provided or premium shared meals can seed/author `is_public=True` rows (with `created_by_id` either `NULL` or a coach/admin user) without any migration.

---

## Decision 013 — BMR Calculation Is a Swappable Strategy, Not Inlined in `NutritionEngine`

**Status:** Accepted

**Context:**
Nutrition target calculation (Decision 010) starts from a Basal Metabolic Rate (BMR) estimate. Multiple standard BMR formulas exist (Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Cunningham); only Mifflin-St Jeor is implementable this sprint, since the others need profile data (e.g. body-fat percentage for Katch-McArdle/Cunningham) that `User`/`NutritionProfile` does not carry yet.

**Decision:**
Introduce a `BMRStrategy` abstraction (`app/ai/bmr_strategies.py`) — an abstract base class with a single `calculate(profile: NutritionProfile) -> Decimal` method — resolved via `get_bmr_strategy(settings.nutrition_bmr_formula)`, mirroring `LLMProvider`/`get_llm_provider()`'s shape (Decision 008). `NutritionEngine` receives a `BMRStrategy` instance through its constructor and never contains formula-specific arithmetic itself; only `MifflinStJeorBMRStrategy` ships this sprint.

**Why:**
- **Isolates the one part of this calculation most likely to need a second implementation soon** — adding Katch-McArdle later should mean adding one new class plus a config value, not touching `NutritionEngine`'s TDEE/goal-adjustment/adherence logic, exactly as swapping `LLMProvider` implementations doesn't touch `AIOrchestrator`.
- **Keeps today's single formula fully unit-testable in isolation** from the rest of the engine's logic.
- **Avoids stubbing formulas EVOLVE cannot correctly compute yet** — rather than shipping a Katch-McArdle implementation with a fabricated default body-fat percentage, that formula is simply not implemented until `NutritionProfile` (and the underlying `User` profile) actually carries the data it needs.

**Alternatives considered:**
- **A single hardcoded Mifflin-St Jeor calculation inside `NutritionEngine`** — simplest for this sprint alone, but would require editing `NutritionEngine` itself (and re-testing its unrelated TDEE/adherence logic) the moment a second formula is wanted.
- **Implement all four formulas now, defaulting missing inputs (e.g. assuming a body-fat %)** — rejected: fabricating inputs the user never provided would produce silently misleading targets, which conflicts with keeping the engine's fitness/sports-nutrition guidance trustworthy.

**Consequences:**
- `Settings.nutrition_bmr_formula` (default `"mifflin_st_jeor"`) selects the strategy; an unsupported value raises `ValueError` from `get_bmr_strategy`, matching `get_llm_provider`'s behavior.
- Adding Katch-McArdle/Cunningham/Harris-Benedict later requires extending `NutritionProfile` with whatever new fields they need (e.g. body-fat %) before their `BMRStrategy` subclasses can be added.

---

## Decision 014 — Recovery Engine Training Load Is Derived From `WorkoutLog` History, Not Self-Reported

**Status:** Accepted

**Context:**
Sprint 4.4 (Recovery Engine) needs a "training load" signal alongside a
user's subjective sleep/soreness/fatigue check-in to compute a readiness
score. `EVOLVE_ARCHITECTURE.md` lists "training volume and intensity
trends" as a Recovery Engine input. Two designs were viable: (a) add a
manually self-reported "perceived training load" field to the check-in
(simplest, no new query), or (b) derive session count, duration, and
average RPE directly from the user's existing `WorkoutLog`/`WorkoutSetLog`
history over a trailing window.

**Decision:**
`RecoveryService.get_daily_readiness` derives training load by querying a
new `WorkoutLogRepository.get_training_load_summary` aggregation
(`COMPLETED` sessions only, windowed on `completed_at`, RPE averaged
across non-warmup sets) over `settings.recovery_training_load_window_days`
(default 7 days). `RecoveryCheckIn` carries no training-load column at all.

**Why:**
- **The data already exists and is more reliable than a self-report.** By
  the time a check-in happens, `WorkoutLogService` has already recorded
  exactly what was trained, when, for how long, and (optionally) at what
  RPE — asking the user to also estimate their own recent training load
  would be redundant and strictly less accurate.
- **Matches Decision 006's precedent** of deriving real signals from
  logged data rather than inferring/self-reporting when the system already
  has the ground truth.
- **Keeps `RecoveryCheckIn` a pure subjective-input record** (sleep,
  soreness, fatigue) — cleanly separating "what the user reports about
  themselves" from "what the system already knows they did," rather than
  mixing both into one row.

**Alternatives considered:**
- **Manually self-reported training load on the check-in** — no new
  repository query needed, but duplicates data the system already has,
  risks disagreeing with the logged history, and adds a field most users
  would find tedious or ambiguous to estimate (e.g. "rate your training
  load 1-10" has no calibration reference).
- **Both a self-reported field and the derived signal** — rejected as
  needless complexity for this sprint; nothing yet needs to reconcile two
  disagreeing training-load signals, and it can be added later if a real
  need for a subjective override emerges.

**Consequences:**
- `WorkoutLogRepository.get_training_load_summary` is a new read-only
  aggregation method; it introduces no schema change.
- `RecoveryEngine.handle` never queries the database itself — it receives
  a pre-aggregated `TrainingLoadSummary` from `RecoveryService`, matching
  `NutritionEngine`'s "engine never touches the database" shape.
- If a user has trained inconsistently or not used `WorkoutLogService` at
  all, the training-load component naturally trends toward "low recent
  load," which the engine treats as a neutral-to-positive readiness
  signal — this is intentional; a Recovery Engine that requires workout
  logging to function would create a hard dependency the architecture does
  not otherwise impose.

---

## Decision 015 — One `RecoveryCheckIn` Per User Per Calendar Date

**Status:** Accepted

**Context:**
`RecoveryCheckIn` (Sprint 4.4) needs a cadence: either exactly one check-in
per user per calendar date, or an unrestricted number of timestamped
check-ins per day.

**Decision:**
`RecoveryCheckIn` carries a `NOT NULL user_id` (unlike `Meal`'s nullable,
catalog-vs-authored shape — a check-in is never shared) and a unique index
on `(user_id, checkin_date)`. `RecoveryService.create_check_in` raises
`CheckInAlreadyExistsError` if a check-in for that date already exists,
rather than upserting.

**Why:**
- **Matches the "daily journal" cadence already established** by
  `NutritionService.get_daily_nutrition`'s per-date aggregation over
  `MealLog` rows — one readiness reading per day is the natural unit for
  "how ready am I today," consistent with how the rest of the platform
  already treats a calendar date as the unit of daily coaching state.
- **Keeps `RecoveryService.get_daily_readiness`'s lookup trivial** — an
  indexed point lookup on `(user_id, checkin_date)` rather than needing to
  pick "the most recent check-in that day" among several candidates.
- **A conflict (409) on a duplicate is more honest than a silent upsert**
  — the client explicitly decides whether to update the existing entry
  (`PATCH`) or accept the rejection, rather than the service guessing intent.

**Alternatives considered:**
- **Multiple check-ins per day, no uniqueness constraint** — would suit a
  future "morning and evening check-in" feature, but nothing in this
  sprint's scope calls for that, and it would force
  `get_daily_readiness` to pick one among several candidate check-ins
  with no natural tie-breaking rule.

**Consequences:**
- `recovery_check_ins` has a unique index
  `uq_recovery_check_ins_user_checkin_date`.
- A future "multiple check-ins per day" feature would require a schema
  change (dropping the unique constraint, likely adding a
  time-of-day/sequence concept) — deferred until an actual feature needs it.

---

## Decision 016 — Recovery Engine Ships Decoupled From `AIOrchestrator`/`AIEngine` This Sprint

**Status:** Accepted

**Context:**
Same situation as Decision 011 (Nutrition Engine, Sprint 4.3): the generic
`AIEngine` protocol exists, but no `CoachService`/`/api/v1/coach` endpoint
exists yet to route chat messages to a registered engine (still Sprint 4.5).

**Decision:**
`RecoveryEngine` lives in `app/ai/recovery_engine.py` (its planned location
per `EVOLVE_ARCHITECTURE.md`'s folder structure) but defines and consumes
its own typed `RecoveryInput`/`RecoveryOutput` contracts rather than
implementing the generic `AIEngine` protocol, and is not added to
`AIOrchestrator.engines` this sprint. `RecoveryService` calls it directly.

**Why:**
- **Identical rationale to Decision 011** — there is no real chat
  integration to design the `EngineInput`/`EngineOutput` binding against
  yet, and `RecoveryOutput`'s structured score/level/protocols shape is
  materially richer than the generic `EngineOutput.artifacts: dict | None`.
- **Keeps `RecoveryEngine` trivially unit-testable** — pure functions over
  typed Pydantic models, no dependency on `MemoryContext`/`Intent`/the
  Orchestrator at all.

**Alternatives considered:**
- **Implement `AIEngine` now and register it in
  `AIOrchestrator.engines[Intent.RECOVERY]`** — same objections as
  Decision 011: premature given no consumer exists yet to validate the
  binding against.

**Consequences:**
- Reaching the Recovery Engine's logic requires `/api/v1/recovery/readiness`
  (or direct service/engine calls in tests) — it is not reachable through
  `/api/v1/coach` because that endpoint does not exist yet.
- Whichever sprint builds `CoachService`/the Coach endpoint must decide how
  (or whether) to adapt both `NutritionInput`/`NutritionOutput` and
  `RecoveryInput`/`RecoveryOutput` onto `EngineInput`/`EngineOutput`, or
  introduce a richer per-engine binding mechanism — still explicitly
  deferred, not made here.

---

## Decision 017 — Coach-Facing Engine Adapters Resolve the Decision 011/016 Binding Question

**Status:** Accepted

**Context:**
Decisions 011 (Nutrition Engine) and 016 (Recovery Engine) both shipped their
engine decoupled from `AIOrchestrator`/`AIEngine`, explicitly deferring "how
(or whether) to adapt `NutritionInput`/`NutritionOutput` and
`RecoveryInput`/`RecoveryOutput` onto `EngineInput`/`EngineOutput`, or
introduce a richer per-engine binding mechanism" to whichever sprint builds
`CoachService` — this one. The Workout side has no AI engine at all yet: the
"Workout Engine" deliverable was satisfied by the non-AI
`WorkoutResolutionService` (Decision 006), which returns a `ResolutionResult`
dataclass with no natural-language summary.

**Decision:**
Introduce `app/ai/coach_engines.py` containing three new classes —
`WorkoutCoachEngine`, `NutritionCoachEngine`, `RecoveryCoachEngine` — that
implement the existing generic `AIEngine` protocol (`app/ai/engine.py`) and
are registered into `AIOrchestrator.engines`. Each adapter is constructed
with the corresponding domain **Service** (`WorkoutResolutionService`,
`NutritionService`, `RecoveryService`) as a dependency, calls that service's
existing public method (`resolve_current`, `get_daily_nutrition`,
`get_daily_readiness`, defaulting to today), and translates the result into
`EngineOutput` — a templated `reply_text` plus a JSON-safe `artifacts` dict.
`NutritionEngine`, `RecoveryEngine`, and `WorkoutResolutionService` themselves
are not modified.

**Why:**
- **Matches the "Engines → Services" arrow already drawn in
  `EVOLVE_ARCHITECTURE.md` §2's layer diagram** — engines depending on
  services was anticipated by the architecture, just never instantiated
  until a real consumer (the Coach) existed to validate the shape against,
  exactly as Decisions 011/016 predicted.
- **Keeps the pure engines pure.** `NutritionEngine`/`RecoveryEngine` remain
  side-effect-free, DB-free, stateless calculators, fully unit-testable in
  isolation — the adapter is where "fetch the data, call the calculator,
  format a reply" composition happens, mirroring what `NutritionService`/
  `RecoveryService` already do for their own standalone REST APIs. The Coach
  path and the standalone `/api/v1/nutrition`/`/api/v1/recovery` paths now
  share the exact same service-layer logic, differing only in presentation.
- **No change to `EngineInput`/`EngineOutput`/`AIOrchestrator.process_message`
  is required** — the generic contract (Decision 007's sibling infra from
  Sprint 4.2) already supports this; extending it per-engine (the rejected
  alternative below) would have made `AIOrchestrator` aware of domain
  specifics, which it deliberately is not ("the Orchestrator coordinates;
  engines compute" — `EVOLVE_ARCHITECTURE.md` §4).
- **Graceful degradation stays inside the adapter.** Each adapter catches its
  service's documented "missing data" exception
  (`IncompleteNutritionProfileError`, `CheckInNotFoundError`) and returns a
  templated, guiding `reply_text` instead of letting it propagate — a Coach
  message must never surface as an unhandled 500 just because the user
  hasn't completed their profile or logged a check-in yet.

**Alternatives considered:**
- **Extend `EngineInput`/`EngineOutput` with richer typed fields and have
  `AIOrchestrator` special-case each intent directly** — rejected: pulls
  domain-specific knowledge into the Orchestrator, the one thing §4
  explicitly says it must not contain.
- **Bypass `AIOrchestrator.engines` entirely; have `CoachService` branch on
  intent and call the domain services directly, using the Orchestrator only
  for memory/persistence** — rejected: duplicates intent-routing logic that
  already exists in the Orchestrator, and would make `CoachService` (meant to
  stay a thin application-layer wrapper) responsible for orchestration.

**Consequences:**
- `app/ai/coach_engines.py` is a new module; `NutritionEngine`,
  `RecoveryEngine`, `WorkoutResolutionService` are unchanged.
- `AIOrchestrator.engines` now has `Intent.WORKOUT`, `Intent.NUTRITION`, and
  `Intent.RECOVERY` populated; `Intent.GENERAL` and `Intent.PROGRESS` still
  fall through to the `MockLLMProvider` completion (no Progress Analyzer
  exists yet — see Decision 018).
- `EngineOutput.artifacts` is populated for the first time; `AIOrchestrator`
  now persists it onto the assistant `ChatMessage.metadata_` alongside
  `intent`/`engines_invoked` (see the code change in
  `app/ai/orchestrator.py`), so chat history carries structured coaching data
  as well as text.

---

## Decision 018 — Sprint 4.5 Split Into "Coach Service" and a New Sprint 4.6

**Status:** Accepted

**Context:**
`docs/ROADMAP.md`/`docs/TASKS.md` defined Sprint 4.5 as bundling four
largely independent deliverables: `Goal`/`Progress` models and the Progress
Analyzer, `CoachService`/`/api/v1/coach`, wiring the existing engines into
the Orchestrator, and integrating a real LLM vendor (deferred from Decision
008). This sprint's actual goal — a first working conversational Coach over
the three engines that already exist (Workout, Nutrition, Recovery) — does
not require any of the first, third-adjacent, or fourth items: the Progress
Analyzer has no engine to route to yet, and a real LLM vendor is orthogonal
to whether existing engines can be reached through chat.

**Decision:**
Split the original Sprint 4.5 into a narrower **Sprint 4.5 — Coach Service**
(this sprint: `CoachService`, `/api/v1/coach`, the three engine adapters from
Decision 017, still on `MockLLMProvider`) and a new **Sprint 4.6 — Progress &
Real LLM** carrying forward `Goal`/`Progress` models, the Progress Analyzer,
and real LLM vendor integration.

**Why:**
- **Mirrors the precedent already set by the 4.3/4.4 split** (Nutrition
  Engine vs. Recovery Engine) — bundled sprints in this roadmap get split
  once their sub-parts turn out to be independently shippable, rather than
  forcing unrelated deliverables to land in the same change set.
- **The Progress Analyzer has no data to analyze yet without `Goal`/
  `Progress` models, and nothing in this sprint's Coach integration depends
  on it** — building it now would be speculative scope creep against this
  sprint's actual goal.
- **Real LLM vendor selection is an infrastructure/cost/vendor decision
  orthogonal to engine routing** — Decision 008 already deferred it once;
  bundling it into "make the Coach route to real engines" would couple two
  unrelated decisions and block this sprint on a vendor choice that isn't
  otherwise needed to prove the Coach → engines flow works.

**Alternatives considered:**
- **Keep Sprint 4.5 bundled as originally scoped** — rejected per explicit
  scoping direction for this sprint; would also repeat the same "unrelated
  deliverables in one change set" problem the 4.3/4.4 split already
  established as undesirable in this codebase.

**Consequences:**
- `docs/ROADMAP.md` and `docs/TASKS.md` are updated: the Sprint 4.5 row/
  section is narrowed to Coach Service scope; a new Sprint 4.6 row/section
  carries `Goal`/`Progress`/Progress Analyzer/real LLM integration forward.
- `classify_intent()` remains the keyword-based stub from Sprint 4.2 — not
  upgraded this sprint, since doing so credibly would mean an LLM-based
  classifier, which is out of scope until Sprint 4.6's vendor decision lands.

---

## Decision 019 — `CoachService` Enforces Conversation Ownership; Stays a Thin Application-Layer Wrapper

**Status:** Accepted

**Context:**
`MemoryEngine.start_or_resume_conversation`/`get_context` (Sprint 4.2)
explicitly documented that they perform no ownership check on a caller-given
`conversation_id` — "applying that rule is a caller responsibility." Until
this sprint, no caller existed (no `CoachService`, no `/api/v1/coach`), so
the gap was inert. `CoachService` is now that caller, and is the first place
in the Coach's call path where enforcing "does this conversation belong to
this user" actually matters for security (a user must never resume or read
another user's conversation, per the standard ownership pattern already
enforced by `RecoveryService`/`NutritionService`/`WorkoutLogService`).

**Decision:**
`CoachService` is constructed with an `AIOrchestrator` and a
`ChatRepository`. Its `send_message` method performs exactly one ownership
check — when a `conversation_id` is given, look it up via
`ChatRepository.get_conversation` and raise `ConversationAccessDeniedError`
if it does not belong to the calling user — and then does nothing else
besides `return await self.orchestrator.process_message(...)`. Its
`get_conversation_history` method performs the same ownership check before a
direct, read-only `ChatRepository.list_messages` call. `CoachService` never
calls `MemoryEngine`, a coach engine adapter, or a domain service directly;
conversation creation/resumption, intent routing, and turn/artifact
persistence all remain exclusively inside `AIOrchestrator`/`MemoryEngine`.

**Why:**
- **Closes a real, previously-inert security gap** now that a real caller
  exists, without touching `MemoryEngine`'s documented contract — the
  ownership check belongs to the caller, as that module always said it
  would.
- **Keeps `CoachService` a thin application/API-layer seam**, matching the
  Clean Architecture layering already used everywhere else in the codebase:
  it validates, delegates, and returns — it does not orchestrate. This
  avoids duplicating any control flow that already lives correctly inside
  `AIOrchestrator.process_message`.
- **A 404 (not a 200 with someone else's data, and not a 500) is the correct
  response** for an unowned `conversation_id` — consistent with how every
  other owned-resource lookup in this codebase (check-ins, meals, workout
  logs) already responds.

**Alternatives considered:**
- **Push the ownership check into `MemoryEngine` itself** — rejected: would
  require `MemoryEngine` to take on an authorization concern it was
  deliberately scoped away from in Sprint 4.2, and would need a `user_id`
  comparison to thread through `AIOrchestrator.process_message` regardless.
- **No ownership check this sprint (ship the gap as-is)** — rejected: this is
  the first sprint where the gap is reachable via a real, authenticated HTTP
  endpoint, so leaving it unresolved would ship a genuine cross-user data
  leak.

**Consequences:**
- `app/services/coach_service.py` introduces `ConversationAccessDeniedError`;
  `app/api/v1/coach.py` translates it to `404 Not Found` (not `403`), so a
  caller cannot distinguish "doesn't exist" from "not yours," matching every
  other ownership-checked resource in this API.
- A caller-supplied `conversation_id` that does not resolve to any
  conversation is now rejected the same way — this differs from calling
  `AIOrchestrator.process_message` directly (still exercised by
  `test_chat_persistence.py`), which starts a fresh, separate conversation
  under a *new* id when given an unknown one. That distinction is
  intentional: `MemoryEngine`/`ChatRepository.create_conversation` never
  actually reuses a client-supplied id for the new conversation, so there
  is no legitimate reason for an `/api/v1/coach` caller to reference an id
  it hasn't already received back from this API.

---

## Decision 020 — Real LLM Vendor Integration Is a Generic OpenAI-Compatible HTTP Endpoint

**Status:** Accepted

**Context:**
Decision 008 shipped `LLMProvider` as an abstraction with exactly one implementation, `MockLLMProvider`, and explicitly deferred real vendor integration. Sprint 4.6 is the first sprint that needs a real provider — for both the Progress Analyzer's narrative step and (Decision 024) the upgraded intent classifier. No vendor had been chosen anywhere in EVOLVE before now.

**Decision:**
Add `OpenAICompatibleLLMProvider(LLMProvider)` in `app/ai/llm_provider.py`, built on the official `openai` Python SDK's `AsyncOpenAI` client, configured entirely through `Settings` (`ai_llm_base_url`, `ai_llm_api_key: SecretStr`, `ai_llm_model`, `ai_llm_timeout_seconds`, `ai_llm_max_output_tokens`) rather than hardcoded to OpenAI itself. `get_llm_provider()` returns `MockLLMProvider` for `AI_PROVIDER=mock` (unchanged default) or `OpenAICompatibleLLMProvider` for `AI_PROVIDER=openai_compatible`, raising `ValueError` for any other value or a missing API key.

**Why:**
- **The `openai` SDK's client already supports an overridable `base_url`**, so one implementation transparently works against OpenAI itself, Azure OpenAI, OpenRouter, or a self-hosted OpenAI-compatible server — a vendor lock-in decision is avoided for the cost of zero extra code.
- **`ai_llm_api_key` is `SecretStr`**, matching the reviewer checklist's secrets-handling expectations — the key is never accidentally logged via `repr()`/structured logging of `Settings`.
- **Constructor accepts an optional injected `client`**, mirroring the DI-friendly style used everywhere else in this codebase (`RecoveryService`, `NutritionService`, etc.) — unit tests supply a fake client with only `chat.completions.create` mocked, never making a real network call or needing a second HTTP-mocking dependency.
- **`AI_PROVIDER` stays a simple string switch** rather than a plugin registry — there are exactly two implementations, and `get_llm_provider()`'s existing `ValueError`-on-unknown-value shape (Decision 008) needed no restructuring.

**Alternatives considered:**
- **Hardcode the official `openai` vendor's default endpoint only** — rejected: would block self-hosted/alternative-vendor usage for no implementation cost savings, since the SDK already parameterizes `base_url`.
- **A separate `AnthropicLLMProvider` alongside an OpenAI one** — rejected as unnecessary scope for this sprint; nothing in the codebase requires a second real vendor, and the generic-endpoint approach already covers the practical need (self-hosting, proxying, alternate vendors that expose an OpenAI-compatible API).

**Consequences:**
- `backend/requirements.txt` gains `openai`; `.env.example` gains the five new `AI_LLM_*` variables (commented out except `AI_LLM_MODEL`/`AI_LLM_TIMEOUT_SECONDS`/`AI_LLM_MAX_OUTPUT_TOKENS`, which have safe defaults).
- `get_llm_provider()` remains uncached (a fresh instance per call), unchanged from Decision 008 — tests that monkeypatch `settings.ai_provider` between calls (e.g. `test_get_llm_provider_rejects_unsupported_provider_names`) continue to see the change take effect immediately. Caching the real HTTP client across requests was considered but rejected for this sprint to avoid disturbing that existing test contract; revisit if per-request `AsyncOpenAI` construction proves to be a measurable cost.

---

## Decision 021 — Graceful Degradation on Every LLM Call, via One `LLMProviderError` Type

**Status:** Accepted

**Context:**
Decision 020 introduces a real network call into three places: `AIOrchestrator`'s LLM-fallback branch (existing since Decision 009, previously only ever hitting the infallible mock), the upgraded `classify_intent` (Decision 024), and the new `ProgressAnalyzer` (Decision 022). A real HTTP call can time out, hit a rate limit, fail auth, or drop the connection — none of which existed as a real failure mode before this sprint.

**Decision:**
`OpenAICompatibleLLMProvider.complete()` catches every `openai`-SDK exception (`APITimeoutError`, `APIConnectionError`, `APIStatusError`, and the base `OpenAIError` as a catch-all) and re-raises a single `LLMProviderError` — the one exception type every caller needs to know about. Each of the three call sites catches `LLMProviderError` and degrades gracefully instead of propagating a 500: the Orchestrator returns a fixed apology `CoachResponse` with `artifacts={"llm_error": True}`; `classify_intent` falls back to the keyword matcher; `ProgressAnalyzer` falls back to a deterministic templated narrative built from the stats it already computed.

**Why:**
- **A conversational Coach (or a progress summary) that 500s whenever the upstream LLM has a bad moment is a materially worse product experience than one that degrades to "I'm having trouble right now"** — especially since two of the three call sites (intent classification, progress narration) have a fully deterministic fallback readily available and don't need the LLM to produce *a* correct answer, just a *better* one.
- **One error type at the `LLMProvider` boundary** means no caller needs vendor-specific knowledge (`openai.RateLimitError` vs. some future vendor's own exception hierarchy) — the abstraction Decision 008 introduced now also isolates failure modes, not just the happy path.
- **Consistent with the existing graceful-degradation precedent** already established for engine adapters in `app/ai/coach_engines.py` (e.g. "no active program" never surfaces as an error) — this sprint applies the same philosophy to the LLM boundary itself.

**Alternatives considered:**
- **Let `LLMProviderError` propagate to a 502/503 HTTP response** — rejected: every one of the three call sites has a strictly-better fallback already available (keyword matching, templated narrative, fixed apology text), so returning an error to the user throws away information the system already has.
- **Retry with backoff before giving up** — rejected as out of scope for this sprint's resilience maturity (see the plan's explicit non-goal); a single timeout-bounded attempt matches "basic resilience only," consistent with how the rest of the codebase has no other retry policies.

**Consequences:**
- `CoachResponse.artifacts == {"llm_error": True}` is a new, documented signal a client can use to distinguish "the LLM was unreachable" from a normal `Intent.GENERAL`/`Intent.PROGRESS` reply, without changing the response's `200` status code.
- Every LLM-touching code path now has an explicit, tested fallback behavior — see `test_llm_provider.py`, `test_orchestrator.py::test_process_message_degrades_gracefully_when_the_llm_call_fails`, `test_intent.py`, and `test_progress_analyzer.py`'s fallback-narrative tests.

---

## Decision 022 — Hybrid Deterministic + LLM Progress Analyzer; Second Extension of the Async Boundary

**Status:** Accepted

**Context:**
`docs/ROADMAP.md`/`docs/TASKS.md` call for a Progress Analyzer that surfaces trend/plateau insight over a user's logged `Progress` history. Two shapes were possible: a fully deterministic, rule-based engine (matching `NutritionEngine`/`RecoveryEngine`'s precedent from Decisions 010/014) or one that uses the now-real LLM (Decision 020) to add a natural-language narrative. Decision 009 explicitly scoped the async boundary to only `AIOrchestrator.process_message`/`LLMProvider.complete`, anticipating exactly this kind of future ripple.

**Decision:**
`ProgressAnalyzer.handle()` is a hybrid: it always computes `ProgressStats` (trend direction, slope-per-week via simple linear regression, logging consistency, plateau detection, projected-target-date extrapolation) deterministically in pure Python first, then calls the real LLM to narrate 2-3 sentences of insight *from those already-computed stats*, explicitly instructed never to invent numbers of its own. `ProgressAnalyzer.handle` is therefore `async def`, and that rippled outward to `ProgressService.get_progress_summary` and the `GET /api/v1/progress/summary` route, exactly as Decision 009's "Consequences" anticipated.

**Why:**
- **A pure rule-based narrative (string templates keyed off stat thresholds) would read as noticeably more robotic than what an LLM can produce**, and the Progress domain — unlike Nutrition/Recovery's numeric targets — is fundamentally about narrating a trend in plain language, where an LLM adds real value.
- **Computing stats deterministically first, then only asking the LLM to narrate them, keeps the numbers themselves trustworthy** — the LLM is never the source of truth for the slope/consistency/plateau values a user might act on, only for the prose describing them. This also keeps `ProgressStats` fully unit-testable without touching the LLM at all.
- **Graceful degradation (Decision 021) makes the LLM call low-risk**: an LLM failure loses only the narrative's polish, never the underlying stats, since `build_fallback_narrative` renders the same stats as a deterministic template.
- **The async ripple is the smallest one available**: only `ProgressAnalyzer.handle`, `ProgressService.get_progress_summary`, and one route become `async def`; every other repository/service in the Progress/Goal domain (CRUD, listing) stays fully synchronous, matching Decision 009's original "no disruptive migration" reasoning.

**Alternatives considered:**
- **Fully deterministic Progress Analyzer, no LLM call at all** — rejected per explicit scoping for this sprint; would also under-use the real LLM integration this sprint otherwise delivers.
- **LLM-only analysis (ask the LLM to compute the trend itself from raw data points)** — rejected: LLMs are unreliable at exact arithmetic over a data series, and Decision 021's graceful-degradation philosophy is much weaker if the *numbers themselves*, not just the prose, disappear whenever the LLM is unavailable.

**Consequences:**
- New `Settings` fields: `progress_min_data_points_for_trend`, `progress_plateau_window_days`, `progress_plateau_threshold_pct` — tunable coefficients, matching the `nutrition_*`/`recovery_*` scalar-in-`Settings` precedent; `app/ai/progress_constants.py` holds only the one genuinely fixed structured table (fallback-narrative templates), matching `nutrition_constants.py`/`recovery_constants.py`'s split.
- `InsufficientProgressDataError` is the analyzer's one documented precondition failure (too few data points in the window) — the caller's responsibility to have gathered enough, mirroring `IncompleteNutritionProfileError`'s precedent; `ProgressService`/the API route map it to `422`.

---

## Decision 023 — Goal/Progress Domain Ships With a Service + REST API, Decoupled From `AIOrchestrator.engines` This Sprint

**Status:** Accepted

**Context:**
Decisions 011 and 016 established a repeatable pattern: the Nutrition and Recovery Engines each shipped with their own service/API layer one sprint, then were wired into `AIOrchestrator.engines` (via a thin Coach-facing adapter, Decision 017) in a later sprint once a `CoachService` existed to route to them. `Goal`/`Progress` are new this sprint, and the Progress Analyzer (Decision 022) is their AI counterpart — the same shape-of-question Decisions 011/016 already answered once each.

**Decision:**
Ship `GoalService`/`ProgressService` and `/api/v1/goals`/`/api/v1/progress` (including `GET /api/v1/progress/summary`, backed by the Progress Analyzer) this sprint, fully reachable via direct HTTP calls — but do **not** add a `ProgressCoachEngine` or register anything under `AIOrchestrator.engines[Intent.PROGRESS]`. `Intent.PROGRESS` continues falling through to the direct LLM completion branch (now real, per Decision 020, and resilient, per Decision 021), exactly like `Intent.GENERAL` — unchanged from how it already behaved before this sprint.

**Why:**
- **Directly mirrors the 011/016 → 017 precedent** — Nutrition and Recovery both proved out as independently valuable, independently testable service/API layers before their Coach binding was a separate, later decision. Applying the same split to Progress avoids re-deriving a question this codebase has already answered twice.
- **A Coach-facing `ProgressCoachEngine` adapter would need to decide *when* the Coach should proactively surface a progress summary inside a chat reply** — a product/UX question (e.g., should every "how am I doing" message trigger a full trend computation?) that is orthogonal to whether the underlying analysis and REST API work correctly, and is better resolved with its own focused decision once a concrete Coach-integration need exists.
- **Keeps this sprint's scope aligned to what was explicitly asked for**: `Goal`/`Progress` models, a working Progress Analyzer, and a real LLM — not a redesign of `AIOrchestrator`'s engine registry.

**Alternatives considered:**
- **Register a `ProgressCoachEngine` now, mirroring Decision 017 immediately** — rejected: no product decision yet exists for what a Progress-intent Coach reply should actually contain (a full summary? A one-line teaser? Which metric, if the user has several goals?), and inventing one speculatively risks the wrong shape landing in `AIOrchestrator.engines`, which is more disruptive to change later than an unregistered intent.
- **Skip the REST API and only expose Progress via a future Coach integration** — rejected: `docs/ROADMAP.md`/`docs/TASKS.md` call for the service/API layer explicitly, and a direct API has independent value (e.g. a future dashboard UI) beyond whatever the Coach eventually does with it.

**Consequences:**
- `app/core/dependencies.py::get_coach_service` is unchanged by this sprint beyond its docstring — `Intent.PROGRESS` is not present in the `engines` dict it builds.
- A future sprint that wires `Intent.PROGRESS` into the Coach will follow the same adapter shape `app/ai/coach_engines.py` already established, needing a new ADR only for whatever Coach-specific behavior it decides on (e.g. which window/metric to summarize by default).

---

## Decision 024 — Intent Classification Becomes LLM-Primary, With the Existing Keyword Matcher as Fallback

**Status:** Accepted

**Context:**
`classify_intent()` has been a keyword-matching stub since Sprint 4.2 (Decision 018 explicitly deferred upgrading it, pending this sprint's LLM vendor decision). With a real `LLMProvider` now available (Decision 020) and every LLM call already required to degrade gracefully (Decision 021), upgrading intent classification to use it became viable without introducing a new, unguarded failure mode.

**Decision:**
`classify_intent(message, llm_provider)` becomes `async def`: it first asks the LLM to output exactly one of the five `Intent` labels, parses the response case/whitespace-insensitively against the `Intent` enum, and falls back to the original keyword matcher (renamed to the private `_classify_intent_by_keyword`, still directly unit-tested and otherwise unchanged) whenever the LLM call raises `LLMProviderError` or returns something that doesn't parse into a valid label. Under `AI_PROVIDER=mock`, the mock's fixed placeholder reply never parses as a valid `Intent`, so classification deterministically falls back to the keyword matcher every time — existing test behavior written against the mock provider's routing needed no special-casing, just an accounting for the one extra `complete()` call this adds per message.

**Why:**
- **An LLM is meaningfully better at classifying free-form intent than fixed keyword lists** — the keyword matcher was always an explicitly-labeled placeholder (Decision 018/the original `intent.py` docstring), not a considered-final design.
- **The keyword matcher is a strictly safe fallback, not dead code** — it still runs, and is still directly tested, for every LLM failure/unparseable-response case, so this upgrade adds capability without removing a safety net.
- **No special-casing for tests was needed**: because the mock provider's reply is guaranteed not to parse as an `Intent`, every existing keyword-routing test (`test_orchestrator.py`, the Coach API integration tests) continues to exercise the exact same routing decisions as before — the only observable change is `llm_provider.complete()` now being called once more per message, which the affected tests' assertions were updated to reflect.
- **Parsing defensively (case-insensitive, whitespace/punctuation-stripped) rather than requiring an exact-match response** reduces how often a merely-imperfectly-formatted (but semantically correct) LLM response gets needlessly discarded to the fallback.

**Alternatives considered:**
- **Keep the keyword stub permanently, since no Coach engine consumes `Intent.PROGRESS` yet regardless** — rejected: `Intent.WORKOUT`/`NUTRITION`/`RECOVERY` already route to real engines since Decision 017/Sprint 4.5, so intent-classification quality already has real, user-visible consequences today, independent of Progress's status.
- **Structured-output/function-calling for the LLM response instead of parsing a plain-text label** — considered for future robustness, but deferred: the generic OpenAI-compatible endpoint (Decision 020) targets the plain chat-completions API for maximum compatibility across vendors, and a single-word response is simple enough to parse reliably without it.

**Consequences:**
- `app/ai/intent.py` exports both `classify_intent` (async, LLM-primary) and the still-public-for-tests `_classify_intent_by_keyword`.
- `AIOrchestrator.process_message`'s one call site becomes `intent = await classify_intent(message, self.llm_provider)` — every message now costs at least one LLM round trip for classification alone, on top of any engine/fallback completion; acceptable given Decision 021's resilience guarantees, but a future cost/latency optimization (e.g. a cheaper/smaller classification model) is left for a later sprint if it proves material.

---

## Decision 025 — Mobile Client Built with React Native + Expo (Managed Workflow), TypeScript

**Status:** Accepted

**Context:**
`docs/ROADMAP.md`/`docs/TASKS.md` scope Sprint 5.1 as "Mobile scaffold, API client, auth flow," the first sprint of Phase 5. No mobile technology decision had been made anywhere in EVOLVE before now — `EVOLVE_ARCHITECTURE.md`'s folder sketch (`app/ios/`, `app/android/`, `app/shared/`) predates any stack choice and was written to stay neutral across native, cross-platform, or hybrid approaches.

**Decision:**
Build the mobile client as a single React Native + Expo project (managed workflow, not bare/ejected) at top-level `app/`, using TypeScript throughout and Expo Router for file-based navigation. `app/app/` holds thin route files (mount a screen component, nothing else); `app/src/` holds `api/` (typed HTTP client), `auth/` (`AuthContext`/`useAuth`, secure token storage), `components/` (shared UI primitives), `screens/` (actual screen implementations), and `types/` (TypeScript mirrors of backend Pydantic schemas). No global state library (Redux/Zustand), no GraphQL client, and no monorepo tooling (Turborepo/pnpm workspaces) are introduced — a single Expo app has no current need for any of them.

**Why:**
- **One codebase, one language, for both iOS and Android** — avoids the 2x implementation cost of separate Swift/Kotlin apps for a single-developer-velocity early-stage product with no identified need yet for deep native APIs beyond what Expo's SDK already wraps (secure storage, notifications, camera, etc., as later sprints need them).
- **TypeScript keeps the "always use type hints" principle (`evolve.mdc`) consistent across the stack**, even though the language changes from Python to TypeScript at the client boundary.
- **Expo's managed workflow removes an entire class of native build/tooling problems** (Xcode/Android Studio project configuration, CocoaPods, Gradle) for a scaffold-and-early-iteration sprint — `expo prebuild`/EAS Build remain available later, without ever needing hand-maintained native project files in source control now.
- **Expo Router (the current Expo default for new projects) avoids hand-rolled React Navigation boilerplate** — screens map directly to files, matching this codebase's general preference for convention over configuration where a well-supported default exists.
- **React Context (`AuthProvider`/`useAuth`) is sufficient for this sprint's only cross-screen state (the current user/session)** — introducing a global state library now, before any second slice of state exists, would be a speculative abstraction per this plan's explicit constraint.
- **A thin hand-written `fetch`-based API client (no axios)** keeps the dependency footprint minimal; the one non-trivial piece of client logic (401 → refresh → retry-once) is simple enough to implement directly, mirroring the "avoid speculative abstractions" principle already applied throughout the backend (e.g. Decision 010's no-ORM-for-nutrition-formulas reasoning).

**Alternatives considered:**
- **Flutter (Dart)** — comparable cross-platform reach and performance, but introduces a second programming language into the stack with no corresponding benefit over React Native for this product's needs.
- **Separate native apps (Swift/SwiftUI + Kotlin/Jetpack Compose)** — the most native-feeling UX, but doubles every future mobile sprint's implementation and testing cost; rejected as disproportionate to current team size and roadmap velocity.
- **React Native bare workflow (no Expo)** — more native-module flexibility, but that flexibility has no identified use yet, at the cost of manually maintaining native project files and build tooling from day one.
- **Redux/Zustand for state, or a monorepo tool** — rejected as premature; nothing in this sprint's scope needs cross-screen state beyond auth, or a second JS/TS package alongside this one.

**Consequences:**
- `app/` (repository root) is a standalone Expo project with its own `package.json`, not part of any workspace/monorepo tool; `backend/` and `app/` are independently installed and run.
- `EVOLVE_ARCHITECTURE.md` §3's folder sketch is updated to reflect the actual Expo-managed layout (see the corresponding documentation update alongside this sprint) — `app/ios/`/`app/android/` native directories are not hand-maintained in source control; they would only appear if a future sprint runs `expo prebuild` or an EAS Build requires them.
- Every future mobile sprint (5.2/5.3) builds on this same project rather than introducing a second mobile codebase or a competing navigation/state approach.

---

## Decision 026 — Mobile Token Persistence via `expo-secure-store`, Never `AsyncStorage`

**Status:** Accepted

**Context:**
Sprint 5.1's API client needs to persist the access/refresh token pair returned by `/api/v1/auth/login`/`/refresh` across app restarts. React Native offers two common storage mechanisms for this: `AsyncStorage` (a simple, unencrypted key-value store) and `expo-secure-store` (backed by the iOS Keychain / Android Keystore, encrypted at rest).

**Decision:**
All token persistence (`app/src/auth/secureStorage.ts`) uses `expo-secure-store` exclusively. `AsyncStorage` is not added as a dependency at all this sprint.

**Why:**
- **Access and refresh tokens are bearer credentials** — equivalent in sensitivity to the backend's `ai_llm_api_key: SecretStr` (Decision 020) or a session cookie; storing them unencrypted on-device is a materially weaker security posture for no implementation-cost savings, since `expo-secure-store` exposes the same simple `getItemAsync`/`setItemAsync`/`deleteItemAsync` API shape as `AsyncStorage`.
- **Matches the reviewer checklist's secrets-handling expectations**, already applied consistently on the backend side (`SecretStr`, never logging credentials) — this sprint extends the same posture to the client.
- **No trade-off is being accepted for this benefit**: `expo-secure-store` requires no additional native configuration under Expo's managed workflow beyond the config plugin already declared in `app.config.ts`.

**Alternatives considered:**
- **`AsyncStorage`** — simpler mental model (no encryption to reason about), but stores tokens as plain text on-device, which a compromised device or a poorly-sandboxed second app could read; rejected outright given `expo-secure-store` costs nothing extra to use instead.
- **In-memory only (no persistence)** — would force a full re-login on every app restart, failing this sprint's explicit "auth flow" deliverable (a session should survive an app restart, matching normal mobile app UX expectations).

**Consequences:**
- `app/src/auth/secureStorage.ts` is the only module that imports `expo-secure-store` directly; `AuthContext` and the API client both go through it rather than touching the native module themselves.
- Logging out, or an unrecoverable `401` (refresh also fails), clears both tokens via the same module — there is exactly one place tokens are written or erased.

---

## Decision 027 — Mobile UI Foundation: Token-Based Design System, 6-Tab Navigation, Mock-First Screen Shells

**Status:** Accepted

**Context:**
Sprint 5.1 delivered a working Expo scaffold with JWT auth and a single placeholder Home screen. The original Phase 5 roadmap scoped Sprint 5.2 as API-connected Coach chat, workout, and meal plan screens. Before wiring business features, the mobile client needs a cohesive visual foundation — a reusable design system, bottom tab navigation, and production-ready screen layouts — so later sprints can focus on data integration rather than UI structure.

**Decision:**
Sprint 5.2 is reframed as **Mobile UI Foundation & Navigation**:

1. **Design system** — centralized theme tokens under `app/src/theme/` (`colors`, `typography`, `spacing`, `radius`, `shadows`, `theme.ts`), consumed via direct imports (no `ThemeProvider` yet; light mode only).
2. **Styling** — continue React Native `StyleSheet` + theme tokens (consistent with Decision 025; no NativeWind, Tamagui, or third-party UI kit).
3. **Icons** — `@expo/vector-icons` (Ionicons), already available via Expo; no new icon dependency.
4. **Typography** — tokenized scale using system fonts (SF Pro / Roboto); no custom font loading this sprint.
5. **Navigation** — Expo Router `(tabs)` nested inside the authenticated `(app)` group with six tabs: Home (Dashboard), Workout, Nutrition, Coach, Progress, Profile. Auth guard stays in `(app)/_layout.tsx`.
6. **Screen shells** — six screen components under `src/screens/` with mocked data from `src/data/mocks/`; no API calls beyond existing auth.
7. **Shared components** — `AppButton`, `AppCard`, `AppHeader`, `AppInput`, `SectionTitle`, `LoadingSpinner`, `EmptyState`, `StatCard`, plus a `ScreenContainer` layout helper. Replace the Sprint 5.1 `Button`/`TextField` primitives.
8. **Safe area** — `useSafeAreaInsets()` from `react-native-safe-area-context` replaces hardcoded `paddingTop: 96`.
9. **Sprint renumbering** — former Sprint 5.2 (API-connected core screens) becomes Sprint 5.3; former Sprint 5.3 (progress, notifications, offline) becomes Sprint 5.4.

**Why:**
- **Separating UI foundation from API integration** lets the app feel premium and navigable before business logic is wired — reducing rework when real data arrives (screens already have the right layout slots).
- **Token files over a UI kit** keeps the dependency footprint minimal (Decision 025's rationale) while eliminating the duplicated hex values that accumulated across Sprint 5.1 auth screens.
- **Mock-first shells** avoid coupling layout work to backend availability, profile-completion wizard timing, or Coach LLM error handling — all deferred concerns for Sprint 5.3+.
- **Six-tab bottom navigation** matches the product's five coaching domains plus a home dashboard — the standard pattern for daily-use fitness apps and the structure EVOLVE's backend APIs already imply.

**Alternatives considered:**
- **Proceed directly with API-connected screens (original 5.2 scope)** — rejected: without a design system or tab navigation, each screen would invent its own styling and routing, creating inconsistency and rework when the shell matures.
- **NativeWind / Tailwind for React Native** — rejected: adds a build-time dependency and learning curve with no identified benefit over centralized tokens for a light-only, single-theme app.
- **Dark mode from day one** — deferred: doubles token surface area for no current user-facing requirement; `userInterfaceStyle` is set to `"light"` until a later sprint needs dark support.
- **Custom font (Inter) via `expo-font`** — deferred: system fonts are sufficient for a foundation sprint; custom typography can be added without restructuring the token files.

**Consequences:**
- `app/src/theme/`, `app/src/data/mocks/`, and expanded `app/src/components/` are new permanent folders in the mobile client.
- `app/app/(app)/(tabs)/` replaces the single `home.tsx` route; post-login redirects target `/(app)/(tabs)`.
- Sprint 5.3 will wire Coach, workout, and nutrition screens to their existing backend APIs, replacing mock data module by module.
- Sprint 5.4 will add real progress charts, push notifications, and offline workout logging.
- `docs/TASKS.md`, `docs/ROADMAP.md`, and `EVOLVE_ARCHITECTURE.md` are updated to reflect the renumbered sprint scope.

---

## Decision 028 — Exercise Knowledge Is a Dedicated Read-Only Bounded Context

**Status:** Accepted

**Context:**
Sprint 17.1 introduces structured exercise metadata for future selection engines and AI workflows. The backend already has an `Exercise` catalog table/API, and the mobile workout feature has some exercise-related types. Putting selection, programming, or workout assembly into the same module as metadata would couple unrelated concerns and make the knowledge layer harder to reuse.

**Decision:**
Create `app/src/features/exercise-kb` as a dedicated **read-only** bounded context whose aggregate is the immutable `ExerciseDefinition`. Persistence is in-memory only (`ExerciseKnowledgeRepository` / `InMemoryExerciseKnowledgeRepository`). The domain may resolve relationship edges (alternative / progression / regression / variation / related) and search/filter definitions, but it must not select exercises for a session, prescribe sets/reps, generate workouts, call LLMs, or know about workout/session aggregates.

**Why:**
- **Single responsibility** — knowledge is reusable input; selection and programming are separate deterministic engines.
- **Immutability** — frozen definitions prevent accidental mutation when shared across engines.
- **Cheap evolution** — a relationship graph and validators can grow without touching workout UI or HTTP APIs.
- **Matches Clean Architecture** — repository boundary exists even though durable storage is deferred.

**Alternatives considered:**
- **Extend backend `Exercise` ORM / catalog API only** — rejected for this sprint: mobile pipeline needs a typed application-layer knowledge model independent of HTTP, and no new backend API was in scope.
- **Colocate knowledge inside Exercise Selection** — rejected: selection would own metadata it does not author, and other consumers (future progression/assembly) would depend on the selection module incorrectly.

**Consequences:**
- Selection (17.2) and Programming (17.3) depend on Knowledge outward; Knowledge never imports those domains.
- No PostgreSQL migration or REST surface ships with this context.
- Illustrative catalog (~25 exercises) is for tests/local orchestration; production-scale catalog loading remains future work.

---

## Decision 029 — Exercise Selection Is Deterministic and Independent From AI

**Status:** Accepted

**Context:**
Sprint 17.2 must choose exercise candidates for a Workout Blueprint day using the Exercise Knowledge Base. An LLM could propose exercises conversationally, but candidate ranking must be reproducible for tests, explanations, and later programming.

**Decision:**
Implement `app/src/features/exercise-selection` as a **deterministic** engine (`ExerciseSelectionEngine`) driven by pure Strategy + Selector pipelines over a `SelectionContext` derived from the blueprint. No randomness. No LLM calls inside the engine. Output is an immutable `ExerciseSelectionResult` (candidates, role groups, rejections, explanations). Programming (sets/reps/RPE/volume) is explicitly out of scope.

**Why:**
- **Reproducibility** — identical blueprint + catalog ⇒ identical candidates; required for unit tests and coach explanations.
- **Separation from AI** — LLMs may later influence blueprint generation; selection itself stays rule-based and auditable.
- **Clear pipeline stage** — Blueprint decides *what* structure; Selection decides *which* exercises; Programming decides *how*.

**Alternatives considered:**
- **LLM picks exercises directly** — rejected: non-deterministic, hard to validate constraints/equipment, and mixes conversational generation with domain rules.
- **Hard-code exercise lists on blueprint days** — rejected: loses knowledge-graph reuse and alternative/relationship scoring.

**Consequences:**
- Strategies (movement, equipment, difficulty, goal, constraint, relationship) and role selectors (primary/secondary/accessory) are the extension points.
- In-memory `SelectionRepository` caches results only; no durable store.
- ADR-028 Knowledge remains the sole catalog source for this engine.

---

## Decision 030 — Programming Produces Immutable `ExercisePrescription` Objects

**Status:** Accepted

**Context:**
Sprint 17.3 must turn selected candidates into executable prescription data (volume, intensity, rest, tempo, order, priority). Future Progression, Fatigue & Recovery, Workout Assembly, and Program Generation engines must not be implied by this module’s contract.

**Decision:**
Implement `app/src/features/programming` such that `ProgrammingEngine` emits an immutable `ProgrammingResult` of frozen `ExercisePrescription` objects via a Strategy pipeline (Volume, Intensity, Rest, Tempo, ExerciseOrder, Priority). The engine may estimate duration/fatigue/workload for a single programmed session snapshot, but must **not** progress loads across sessions, adapt from recovery state, plan weeks, or assemble a complete workout product for the athlete UI.

**Why:**
- **Immutable prescriptions** are a stable handoff to future Progression/Assembly stages.
- **Narrow scope** prevents the Programming module from becoming an all-in-one workout generator.
- **Determinism** mirrors Selection (ADR-029): same selection + blueprint context ⇒ same prescriptions.

**Alternatives considered:**
- **Emit a full `WorkoutSession` ready for the session UI** — rejected: assembly/session product is Sprint 17.6+; premature coupling to execution UI models.
- **Include progression and deload logic now** — rejected: belongs to Progression / Fatigue engines (17.4–17.5).

**Consequences:**
- Consumers must treat prescriptions as “how to perform each selected exercise,” not as a finished program.
- In-memory `ProgrammingRepository` caches results only.
- Pipeline documentation must label Progression / Recovery / Assembly / Program Generation as planned, not implemented.

---

## Decision 031 — Progression Produces Immutable `ProgressionPlan` Timelines

**Status:** Accepted

**Context:**
Sprint 17.4 must introduce the time dimension of training by transforming immutable `ProgrammingResult` objects into multi-week progression timelines. Fatigue & Recovery, Workout Assembly, and Program Generation must remain out of scope.

**Decision:**
Implement `app/src/features/progression` such that `ProgressionEngine` emits an immutable `ProgressionPlan` of frozen `ExerciseProgression` / `ProgressionStep` objects via a Strategy pipeline (Linear, Volume, Intensity, Frequency, ExerciseRotation). The engine defines how prescription parameters evolve across a `ProgressionWindow`, but must **not** adapt from athlete feedback, calculate absolute loads, autoregulate, manage fatigue, apply deloads, or assemble workouts.

**Why:**
- **Immutable plans** are a stable handoff to future Fatigue / Assembly stages.
- **Narrow scope** keeps Progression from becoming a recovery or program-generation engine.
- **Determinism** mirrors Programming (ADR-030): same programming + blueprint context ⇒ same progression plan.

**Alternatives considered:**
- **Include deload / fatigue adaptation now** — rejected: belongs to Fatigue & Recovery (17.5).
- **Emit absolute loads or %1RM** — rejected: load prediction is out of scope; intensity remains RPE/RIR trends only.
- **Swap exercises mid-block as progression** — rejected: exercise continuity is required; rotation is slot intent only.

**Consequences:**
- Consumers treat progression as “how prescriptions evolve over weeks,” not as finished workouts or adaptive coaching.
- In-memory `ProgressionRepository` caches plans only.
- Pipeline documentation labels Fatigue & Recovery / Assembly / Program Generation as planned.

---

*New decisions are appended as Decision 032, 033, etc. Do not delete or renumber existing entries — mark a decision "Superseded by Decision 0XX" if it is later reversed.*
