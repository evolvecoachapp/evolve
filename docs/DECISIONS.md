# Architecture Decision Records

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document (append-only)  
**Last Updated:** 2026-07-24  
**Purpose:** Log of significant architectural decisions (ADR-001 through ADR-067). Append only — never renumber.  
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

## Decision 032 — Training Adaptation Produces Immutable Readiness + Recommendations

**Status:** Accepted

**Context:**
Sprint 17.5 must evaluate whether an existing `ProgressionPlan` should be adapted before execution. It must not generate workouts, replace Programming or Progression, or integrate wearables / athlete physiological signals. Workout Assembly and Program Generation remain out of scope.

**Decision:**
Implement `app/src/features/training-adaptation` such that `TrainingAdaptationEngine` emits an immutable `TrainingAdaptationResult` containing frozen `ReadinessAssessment`, `AdaptationRecommendation`, and `AdaptedProgression` objects. Independent Assessment strategies (Recovery, Fatigue, Constraint, ExecutionReadiness) and Adaptation strategies (Volume, Intensity, ExerciseSwap, RecoveryDay, ScheduleAdjustment) produce domain recommendations only. The engine must **not** modify workouts, call wearable APIs, use athlete history, compute HRV/heart-rate/sleep recovery algorithms, or assemble executable sessions.

**Why:**
- **Clear pipeline stage** — Progression defines multi-week evolution; Adaptation decides whether that plan should be adjusted before execution.
- **Recommendations-only contract** keeps adaptation from becoming workout assembly or autoregulation.
- **Determinism** mirrors Progression (ADR-031): same blueprint + progression context ⇒ same adaptation result.

**Alternatives considered:**
- **Wire Garmin / Apple Health / WHOOP / HRV now** — rejected: no networking, no wearables, no physiological calculations in this foundation.
- **Mutate ProgressionPlan targets in place** — rejected: adaptations are recommendations; source plan remains immutable.
- **Replace Fatigue & Recovery naming with opaque load autoregulation** — rejected: this sprint delivers structural readiness + recommendation domain, not load calculation.

**Consequences:**
- Consumers treat adaptation as “should we adjust before execution?” not as finished workouts.
- In-memory `TrainingAdaptationRepository` caches results only.
- Pipeline documentation labels Program Generation as planned; Workout Assembly is implemented in ADR-033.

---

## Decision 033 — Workout Assembly Produces Immutable Executable Sessions

**Status:** Accepted

**Context:**
Sprint 17.6 must assemble the final executable `WorkoutSession` from prior pipeline outputs (`WorkoutBlueprint`, `ExerciseSelectionResult`, `ProgrammingResult`, `ProgressionPlan`, `TrainingAdaptationResult`). It must not generate strategy, perform programming/progression, evaluate readiness, track execution, or persist history. Program Generation remains out of scope.

**Decision:**
Implement `app/src/features/workout-assembly` such that `WorkoutAssemblyEngine` emits an immutable `WorkoutAssemblyResult` containing a frozen `WorkoutSession` with ordered `WorkoutExercise` entries, `WorkoutBlock` groups, `WorkoutSummary`, and `WorkoutExecutionOrder`. The engine resolves adaptation recommendations into assembled prescriptions for a selected progression week, then freezes the session. The engine must **not** invent training strategy, replace Programming/Progression/Adaptation, introduce timers/execution state/analytics, call network APIs, or persist durable history.

**Why:**
- **Clear pipeline stage** — Adaptation decides whether to adjust; Assembly materializes the executable session.
- **Immutable session contract** keeps assembly separate from live execution and future Execution Engine concerns.
- **Determinism** mirrors prior engines: same upstream inputs + week ⇒ same assembled session.

**Alternatives considered:**
- **Reuse `workout/models/WorkoutSession` runtime types** — rejected: those carry execution/status concerns; assembly must stay prescription-only and namespaced under `workout-assembly`.
- **Mutate programming prescriptions in place** — rejected: assembly produces a new session view; upstream results remain immutable.
- **Include live timers / completion tracking now** — rejected: no execution state in this foundation.

**Consequences:**
- Consumers treat assembly as “the session to execute,” not as strategy or readiness evaluation.
- In-memory `WorkoutAssemblyRepository` caches results only.
- Pipeline documentation labels Program Generation as planned (17.7).

---

## Decision 034 — Program Generation Orchestrator Coordinates the Pipeline

**Status:** Accepted

**Context:**
Sprint 17.7 must provide a single public entry point for workout generation that coordinates existing engines (`WorkoutBlueprint`, `ExerciseSelection`, `Programming`, `Progression`, `TrainingAdaptation`, `WorkoutAssembly`). It must not duplicate engine business logic, invoke AI, persist state, cache results, or introduce execution/analytics concerns.

**Decision:**
Implement `app/src/features/program-generation` such that `ProgramGenerationOrchestrator` validates a `WorkoutGenerationRequest`, builds `PipelineExecutionContext`, invokes each engine in fixed order, aggregates `PipelineExecutionSummary` / `PipelineExecutionTrace`, and returns an immutable `WorkoutGenerationResult` containing the assembled `WorkoutSession` plus all upstream engine outputs. Engines never call each other — only the orchestrator coordinates. The domain has no repository, no networking, and no AI prompts (`blueprintSource` is pre-supplied).

**Why:**
- **Single entry point** keeps Conversation/Workflow callers from wiring six engines ad hoc.
- **Orchestration-only** preserves Clean Architecture boundaries established in 17.0–17.6.
- **Immutable result + structural metrics** mirrors prior deterministic pipeline contracts without timers or side effects.

**Alternatives considered:**
- **Embed chaining inside Workout Assembly** — rejected: assembly must remain a pure finalization stage.
- **Replace engines with a monolithic generator** — rejected: contradicts the engine separation ADRs.
- **Add persistence/cache now** — rejected: sprint scope forbids history, caching, and durable storage.

**Consequences:**
- Consumers call `generateWorkoutProgram` / `previewWorkoutProgram` / `explainWorkoutGeneration` only.
- Pipeline documentation marks Program Generation Orchestrator as implemented (17.7).
- Future multi-week program construction can extend this foundation without rewriting engine coordination.

---

## Decision 035 — Integration Testing Framework Is Isolated Test Infrastructure

**Status:** Accepted

**Context:**
Sprint 17.8 must provide a reusable Integration Testing Framework for the complete workout generation pipeline so future Training Intelligence evolutions can be regression-tested. Production engines and orchestration behavior must remain unchanged.

**Decision:**
Introduce `app/tests/integration/` as dedicated testing infrastructure with immutable fixtures, fluent builders, domain assertions, scenario tests, and normalized golden snapshots. The framework invokes the existing Program Generation Orchestrator through testSupport wiring only. No production modules, engines, or application use-cases are modified. Goldens store deterministic structural snapshots (ids/timestamps normalized) under `golden/`.

**Why:**
- **Isolation** keeps test harness concerns out of `features/*` production packages.
- **Fixtures + builders** make expressive, reusable athlete/request construction without copy-paste.
- **Assertions + goldens** detect pipeline regressions without re-implementing engine logic.
- **Determinism** (fixed timestamps, frozen fixtures, normalized snapshots) keeps CI stable.

**Alternatives considered:**
- **Colocate only under `program-generation/__tests__`** — rejected: framework must serve the whole pipeline and future engines, not one feature folder.
- **Move existing unit tests into `tests/integration/`** — rejected: unit tests remain feature-local; this sprint adds infrastructure only.
- **Change orchestrator for test hooks** — rejected: no production behavior changes.

**Consequences:**
- Pipeline documentation references [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md).
- Scenario/golden suites become the primary complete-pipeline regression surface.
- ADR-034 orchestration contracts remain the production source of truth.

---

## Decision 036 — Composition Root Owns Mobile Pipeline DI

**Status:** Accepted

**Context:**
Sprint 17.9 must introduce a centralized Composition Root and Dependency Injection foundation so application code no longer manually instantiates Training Intelligence services. Production engine behavior, orchestrator logic, and persistence/networking must remain unchanged.

**Decision:**
Implement `app/src/core/composition/` with `CompositionRoot`, `ApplicationContainer`, typed `ServiceRegistry` / `ServiceMap`, creation-only factories, and in-memory providers (configuration, repositories, strategies). Application use-cases resolve defaults via `resolveService(token)`. The container supports singleton and transient lifecycles, prevents duplicate/late registrations, and validates missing/circular/invalid resolutions before freeze. Feature-level `create*Service()` helpers remain available for tests and explicit injection.

**Why:**
- **Single composition site** prevents ad-hoc `new` / factory calls from drifting across use-cases.
- **Typed registry** makes future services registerable without rewriting application consumers.
- **Wiring-only scope** preserves ADR-028–035 engine and orchestration contracts.
- **Lightweight custom DI** avoids a heavy framework while matching Clean Architecture boundaries.

**Alternatives considered:**
- **Keep per-feature `create*Service()` as the only API** — rejected: application defaults would continue to own composition.
- **Adopt Inversify / tsyringe** — rejected: sprint scope is a minimal foundation without new framework dependencies.
- **Move creation into engines** — rejected: engines must stay free of composition concerns.

**Consequences:**
- Pipeline documentation references [COMPOSITION_ROOT.md](./COMPOSITION_ROOT.md).
- Application defaults go through Composition Root; tests may still inject services.
- Future external providers extend `providers/` without changing use-case signatures.

---

## Decision 037 — Decision Intelligence Is a Structured Domain Explanation Layer

**Status:** Accepted

**Context:**
Sprint 17.10 must introduce a Decision Intelligence foundation so every important workout-generation decision can be recorded and explained for future Coach AI, analytics, debugging, and recommendations. Production engine behavior must remain unchanged. The layer must not become a logging, telemetry, analytics, networking, or persistence system, and must not call AI.

**Decision:**
Implement `app/src/core/decision-intelligence/` with immutable decision models (`DecisionNode`, `DecisionEdge`, `DecisionGraph`, `DecisionTimeline`, `DecisionReport`, `ExecutionReport`, `DecisionExplanation`), a `DecisionRecorder`, template-based `ExplanationBuilder`, validators, utilities, and a narrow application API (`createDecisionReport`, `createExecutionReport`, `explainWorkoutDecision`, `summarizeDecisionGraph`). Pipeline integration extracts structured domain decisions from existing engine explanations/reasons and `PipelineExecutionTrace` / `PipelineExecutionSummary` without modifying engine logic. `ProgramGenerationOrchestrator.buildDecisionIntelligence` exposes execution reports from in-hand generation results.

**Why:**
- **Domain explanations** give Coach AI and future dashboards a stable substrate without coupling to engine internals.
- **Immutability + validation** keep reports deterministic and debuggable.
- **Template-based explainability** avoids premature AI while still producing human and developer narratives.
- **Additive integration** preserves ADR-028–036 engine, orchestration, and DI contracts.

**Alternatives considered:**
- **Emit ad-hoc logs/telemetry from engines** — rejected: not a structured domain graph, and out of sprint scope.
- **Call an LLM to narrate decisions now** — rejected: sprint forbids AI; templates are sufficient.
- **Persist decision graphs** — rejected: no persistence in this foundation.
- **Change engine scoring APIs to return DecisionNodes** — rejected: would modify production business contracts; extraction from existing structured explanations is enough.

**Consequences:**
- Documentation references [DECISION_INTELLIGENCE.md](./DECISION_INTELLIGENCE.md).
- Decision Intelligence remains explanation-only until a later Coach/analytics consumer sprint.
- Engine modules stay free of Decision Intelligence dependencies.

---

## Decision 038 — Workout Runtime Is a Dedicated Execution-State Domain

**Status:** Accepted

**Context:**
Sprint 18.0 must introduce a Workout Runtime foundation so an assembled `WorkoutSession` can be performed with validated lifecycle, exercise, and set progression. Program Generation and upstream training-intelligence engines must remain unchanged. The domain must not add UI, persistence, networking, timers, analytics, history, or AI.

**Decision:**
Implement `app/src/features/workout-runtime/` with runtime models (`WorkoutRuntime`, `ExerciseRuntime`, `SetRuntime`, `WorkoutState`/`SessionState`, progress/summary/result/event/metrics/configuration), `WorkoutRuntimeEngine` (start/pause/resume/finish, current exercise/set, advance, completion percent), builders, validators (state transitions + progression + completion), utilities, and a narrow application API (`startWorkout`, `pauseWorkout`, `resumeWorkout`, `completeWorkout`, `skipExercise`, `completeSet`) that returns opaque `ActiveWorkout` handles and public summaries/results only. Runtime consumes an immutable `WorkoutSession` and never mutates Program Generation outputs.

**Why:**
- **Separation of concerns** — generation produces immutable sessions; runtime owns live performance state.
- **Validated state machine** keeps lifecycle operations safe and testable.
- **Opaque public API** prevents UI/application layers from depending on engine internals.
- **No timers/persistence** keeps the foundation focused and additive.

**Alternatives considered:**
- **Extend Workout Assembly with execution fields** — rejected: would couple immutable assembly to mutable performance state.
- **Reuse existing `features/workout` local UI session helpers as the domain** — rejected: those are screen-oriented; Sprint 18.0 requires a dedicated domain foundation.
- **Persist runtime or add rest timers now** — rejected: explicitly out of scope.

**Consequences:**
- Documentation references [WORKOUT_RUNTIME.md](./WORKOUT_RUNTIME.md).
- Future UI/timer/persistence sprints consume this domain without changing Program Generation.
- Program Generation and Decision Intelligence remain independent of Workout Runtime.

---

## Decision 039 — Rest Runtime Is a Dedicated Deterministic Timing Domain

**Status:** Accepted

**Context:**
Sprint 18.1 must introduce a Rest Runtime foundation so workout rest periods have validated lifecycle and timing metrics independent of UI. The engine must remain deterministic and testable without platform timers. Workout Runtime may own Rest Runtime; circular dependencies are forbidden. The domain must not add UI, persistence, networking, AI, notifications, analytics, or `setTimeout`/`setInterval`.

**Decision:**
Implement `app/src/features/rest-runtime/` with runtime models (`RestRuntime`, `RestSession`, `RestState`/`RestStatus`, progress/summary/result/event/metrics/configuration, reason/target/duration), `RestRuntimeEngine` (start/pause/resume/cancel/complete, injected elapsed, remaining/overtime/completion %), builders, validators (state transitions + duration + completion/expiration), utilities, and a narrow application API (`startRest`, `pauseRest`, `resumeRest`, `cancelRest`, `completeRest`, `updateElapsedTime`) that returns opaque `ActiveRest` handles and public summaries/results only. Elapsed time is always injected from outside. `WorkoutRuntime` may hold an optional `restRuntime` reference; Rest Runtime never imports Workout Runtime.

**Why:**
- **Separation of concerns** — rest timing is independent of set/exercise progression and of UI countdowns.
- **Deterministic time model** keeps the domain fully unit-testable without flaky timers.
- **Ownership direction** Workout → Rest avoids circular modules and matches the product architecture.
- **Opaque public API** prevents consumers from depending on engine internals.

**Alternatives considered:**
- **Embed rest countdown inside WorkoutRuntimeEngine** — rejected: couples progression with timing; harder to test and evolve.
- **Use platform `setInterval` inside the domain** — rejected: non-deterministic and out of scope.
- **Reuse Sprint 12.6 UI `useSessionTiming` as the domain** — rejected: screen-oriented; Sprint 18.1 requires a dedicated foundation.

**Consequences:**
- Documentation references [REST_RUNTIME.md](./REST_RUNTIME.md).
- Future timer/notification/Live Activity/Coach AI sprints adapt external clocks to `updateElapsedTime`.
- Workout Runtime progression logic remains unchanged aside from optional ownership wiring.

---

## Decision 040 — Domain Events Are a Dedicated Immutable Execution-Event Substrate

**Status:** Accepted

**Context:**
Sprint 18.2 must introduce a Domain Event System so every meaningful workout-execution action produces strongly typed immutable events for future consumers (Performance Engine, Timeline, Coach AI, Recovery, Achievements, Analytics). The system must not be an event bus, message broker, async queue, or networking layer. No UI, persistence, analytics implementations, or subscriber implementations.

**Decision:**
Implement `app/src/core/domain-events/` with immutable event models (`DomainEvent` + lifecycle variants, `EventMetadata`, `EventContext`, `EventCategory`, `EventSeverity`, `EventSource`, `EventSequence`, `EventStream`), an append-only `EventStreamStore`, a synchronous `DomainEventDispatcher`, subscriber **interfaces only**, builders/validators/utilities, and a narrow application API (`publishEvent`, `subscribe`, `unsubscribe`, `getEventStream`, `summarizeEvents`) that does not expose the dispatcher. Workout Runtime and Rest Runtime emit domain events on lifecycle actions without changing business logic.

**Why:**
- **Typed substrate** gives future modules a stable event contract without coupling to engine internals.
- **Synchronous in-memory dispatch** keeps the foundation deterministic and free of messaging infrastructure.
- **Subscriber interfaces only** reserve consumer slots without premature analytics/AI implementations.
- **Additive emission** preserves ADR-038/039 runtime behavior.

**Alternatives considered:**
- **Adopt an event bus / broker (Kafka, RabbitMQ, in-process bus)** — rejected: sprint explicitly forbids messaging infrastructure.
- **Async queues for subscribers** — rejected: ordering and testability require synchronous dispatch.
- **Persist events now** — rejected: no persistence in this foundation.
- **Implement analytics/Coach subscribers now** — rejected: interfaces only; consumers are future sprints.

**Consequences:**
- Documentation references [DOMAIN_EVENTS.md](./DOMAIN_EVENTS.md).
- Future consumer modules subscribe to the Event Stream without modifying runtime business logic.
- Domain Events remain an in-memory execution substrate until a later persistence/consumer sprint.

---

## Decision 041: Performance Engine Foundation (Sprint 18.3)

**Date:** 2026-07-22

**Status:** Accepted

**Context:**
Sprint 18.3 must introduce a Performance Engine that analyzes completed workout execution into immutable Performance Snapshots. It must consume Domain Events / Workout Results (and may reference DecisionReport ids only). It must not modify workout execution or program generation, and must not add AI, persistence, networking, multi-session history, personal records, recovery, or recommendations.

**Decision:**
Implement `app/src/features/performance-engine/` with immutable models (`PerformanceSnapshot`, metric groups, exercise/session/movement performance, grade/summary/context/result, single-session `PerformanceTrend` placeholder), isolated calculators (`Volume` / `Intensity` / `Density` / `Completion` / `Duration`), validators, builders, utilities, `PerformanceEngine`, a service facade, and a narrow application API (`analyzeWorkoutPerformance`, `summarizePerformance`, `gradePerformance`). Analysis is single-session only.

**Why:**
- **Dedicated analytics boundary** keeps execution runtimes free of performance math.
- **EventStream + WorkoutResult inputs** reuse Sprint 18.0–18.2 substrates without coupling to Coach AI or Timeline.
- **Modular calculators** keep metric responsibilities isolated and testable.
- **Frozen snapshots** give future consumers a stable, immutable contract.

**Alternatives considered:**
- **Fold analytics into Workout Runtime** — rejected: runtime must stay execution-state only (ADR-038).
- **Multi-session trends / PRs now** — rejected: sprint explicitly limits scope to single-session.
- **AI grading / recommendations** — rejected: no AI in this foundation.

**Consequences:**
- Documentation references [PERFORMANCE_ENGINE.md](./PERFORMANCE_ENGINE.md).
- Future trend analysis can extend `PerformanceTrend` without changing runtime engines.
- Performance Engine remains in-memory and non-persistent until a later consumer/persistence sprint.

---

## Decision 042: Achievement Engine Foundation — Personal Records (Sprint 18.4)

**Date:** 2026-07-22

**Status:** Accepted

**Context:**
Sprint 18.4 must introduce an Achievement Engine that detects immutable achievements from Performance Snapshots and Workout Results. The first supported category is Personal Records. The architecture must remain extensible for milestones, badges, goals, challenges, and streaks without redesigning core models. History storage, gamification implementations, AI, persistence, and networking are out of scope.

**Decision:**
Implement `app/src/features/achievement-engine/` with immutable achievement models (open type/category strings + Personal Record specialization), isolated PR detectors, validators, builders, utilities, engine-emitted achievement events (no subscribers), a service facade, and a narrow application API (`evaluateAchievements`, `detectPersonalRecords`, `summarizeAchievements`). Personal Record comparison uses an injected `PersonalRecordBaselineProvider` only — no history implementation inside the engine.

**Why:**
- **Dedicated achievement boundary** keeps analytics (Performance Engine) free of PR/gamification concerns.
- **Open type/category identifiers** allow future categories without modifying core Achievement fields.
- **Injected baselines** enable deterministic PR detection without owning persistence.
- **Frozen results + events** give future consumers a stable contract.

**Alternatives considered:**
- **Fold PRs into Performance Engine** — rejected: Performance Engine is single-session analytics only (ADR-041).
- **Implement history/badges/streaks now** — rejected: sprint explicitly limits scope to Personal Records + architecture support.
- **Require DomainEventStream at runtime** — rejected: stream remains an architecture reference; snapshot + workout result are sufficient inputs.

**Consequences:**
- Documentation references [ACHIEVEMENT_ENGINE.md](./ACHIEVEMENT_ENGINE.md).
- Future milestone/gamification detectors can register beside PR detectors without redesign.
- Achievement Engine remains in-memory and non-persistent until a later consumer/persistence sprint.

---

## Decision 043: Athlete History Foundation (Sprint 18.5)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 18.5 must introduce an Athlete History domain that organizes an athlete's journey as an immutable chronological record of domain facts. It must consume Workout Results, Performance Snapshots, and Achievement Results (Domain Event Stream as architecture reference only). It must not implement persistence, AI, networking, history storage, querying/filtering, timeline UI, or calendar features, and must not modify upstream engines.

**Decision:**
Implement `app/src/features/athlete-history/` with immutable history models (`AthleteHistory`, `HistorySnapshot`, `HistoryEntry` + workout/performance/achievement specializations, open type/category strings for future nutrition/recovery/sleep/bodyweight/coach/goals/milestones/challenges entries), isolated aggregators, validators, builders, utilities, `AthleteHistoryEngine`, a service facade, and a narrow application API (`buildAthleteHistory`, `createHistorySnapshot`, `summarizeHistory`).

**Why:**
- **Dedicated history boundary** keeps runtime, analytics, and achievements free of chronological aggregation concerns.
- **Open type/category identifiers** allow future entry kinds without redesigning core `HistoryEntry` fields.
- **Isolated aggregators** keep each domain-fact mapping testable and single-responsibility.
- **Frozen history + snapshots** give future offline sync and Timeline UI consumers a stable contract without owning storage or rendering here.

**Alternatives considered:**
- **Fold history into Achievement or Performance Engine** — rejected: those engines own detection/analytics only (ADR-041/042).
- **Implement persistence / Timeline UI now** — rejected: sprint explicitly limits scope to immutable domain modeling.
- **Require DomainEventStream at runtime** — rejected: stream remains an architecture reference; workout/performance/achievement facts are sufficient inputs.

**Consequences:**
- Documentation references [ATHLETE_HISTORY.md](./ATHLETE_HISTORY.md).
- Future entry aggregators can register beside workout/performance/achievement aggregators without redesign.
- Athlete History remains in-memory and non-persistent until a later sync/consumer sprint.

---

## Decision 044: Recovery Intelligence Foundation (Sprint 18.6)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 18.6 must introduce a Recovery Intelligence domain that analyzes completed training using Athlete History, Performance Snapshot, and optional Workout context into immutable Recovery Snapshots. It must not add AI, recommendations, persistence, networking, history storage, predictive models, sleep analysis, or wearable integration, and must not modify upstream engines.

**Decision:**
Implement `app/src/features/recovery-intelligence/` with immutable recovery models (`RecoverySnapshot`, `RecoveryMetrics`, `RecoveryStatus`, `RecoveryContext`, `RecoverySummary`, `RecoveryWindow`, `RecoveryIndicator`, `TrainingLoad`, `FatigueScore`, `DensityLoad`, `FrequencyLoad`, `RecoveryAssessment`, `RecoveryEvidence`, `RecoveryEngineResult`), isolated calculators, validators, builders, utilities, `RecoveryIntelligenceEngine`, a service facade, and a narrow application API (`analyzeRecovery`, `createRecoverySnapshot`, `summarizeRecovery`). Future Readiness Model remains an architecture placeholder only.

**Why:**
- **Dedicated recovery boundary** keeps history, performance, and achievements free of recovery aggregation concerns.
- **Isolated calculators** keep each load/fatigue/frequency/window/status rule testable and single-responsibility.
- **Frozen snapshots** give future readiness / Coach consumers a stable contract without owning predictions or recommendations here.

**Alternatives considered:**
- **Fold recovery into Athlete History or Performance Engine** — rejected: those engines own chronology/analytics only (ADR-041/043).
- **Ship readiness scoring / recommendations now** — rejected: sprint explicitly limits scope to deterministic recovery metrics.
- **Require wearables or sleep inputs** — rejected: out of scope; foundation uses completed training domain facts only.

**Consequences:**
- Documentation references [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md) (Recovery Metrics + Future Readiness Model).
- Future readiness consumers can read `RecoverySnapshot` without redesigning this foundation.
- Recovery Intelligence remains in-memory, non-persistent, and non-predictive until a later consumer sprint.

---

## Decision 045: Insight Engine Foundation (Sprint 18.7)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 18.7 must introduce an Insight Engine that aggregates domain knowledge from Performance, Achievement, Recovery, and Athlete History into immutable Insight Snapshots. Insights must be deterministic domain facts — not AI-generated, not recommendations, and not conversational responses. The engine must not add persistence, networking, prompt generation, or LLM usage, and must not modify upstream engines.

**Decision:**
Implement `app/src/features/insight-engine/` with immutable insight models (`InsightSnapshot`, `Insight`, `InsightType`, `InsightCategory`, `InsightSeverity`, `InsightPriority`, `InsightStatus`, `InsightContext`, `InsightEvidence`, `InsightReason`, `InsightMetadata`, `InsightCollection`, `InsightSummary`, `InsightEngineResult`), isolated generators (Performance/Achievement/Recovery/History/Summary), validators, builders, utilities, `InsightEngine`, a service facade, and a narrow application API (`generateInsights`, `createInsightSnapshot`, `summarizeInsights`). Future Coach Integration remains an architecture placeholder only. Reserved insight types (`nutrition`, `sleep`, `bodyweight`, `goal`, `coach`) are modeled for extensibility without redesign.

**Why:**
- **Dedicated insight boundary** keeps upstream engines free of cross-domain aggregation concerns.
- **Isolated generators** keep each source domain’s facts testable and single-responsibility.
- **Frozen snapshots** give future Coach / Timeline consumers a stable contract without owning language or recommendations here.

**Alternatives considered:**
- **Fold insights into Coach Intelligence** — rejected: Coach owns conversation/language; this sprint requires deterministic domain facts only.
- **Emit recommendations or LLM narratives now** — rejected: sprint explicitly forbids AI, recommendations, and conversation logic.
- **Persist insights** — rejected: out of scope; foundation remains in-memory.

**Consequences:**
- Documentation references [INSIGHT_ENGINE.md](./INSIGHT_ENGINE.md) (Insight Model + Future Coach Integration).
- Future Coach consumers can read `InsightSnapshot` without redesigning this foundation.
- Insight Engine remains in-memory, non-AI, and non-recommendational until a later consumer sprint.

---

## Decision 046: Coach Intelligence Foundation (Sprint 18.8)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 18.8 must introduce Coach Intelligence that transforms deterministic domain knowledge (primarily `InsightSnapshot`) into an immutable Coaching Context for future Prompt Builder / AI Provider layers. This domain must not be an AI provider, must not generate prompts, must not call LLMs, and must not create conversational responses.

**Decision:**
Extend `app/src/features/coach-intelligence/` with immutable Coaching Context preparation models (`CoachingContext`, `CoachSession`, `CoachObjective`, `CoachIntent`, `CoachPriority`, `CoachConstraint`, `CoachInstruction`, `CoachFocus`, `CoachEvidence`, `CoachMetadata`, `CoachingContextSummary`, `CoachContextSnapshot`, `CoachEngineResult`, `CoachPreparation`, `CoachAudience`, `CoachCommunicationStyle`, `CoachKnowledge`, `CoachReason`), isolated selectors (Insight/Priority/Evidence/Recovery/History/Objective), validators, builders, utilities, `CoachIntelligenceEngine`, a service facade, and a narrow application API (`prepareCoachingContext`, `createCoachSnapshot`, `summarizeCoachingContext`), while preserving the existing history-backed insights API (`CoachSummary`, repository, hooks). Future Prompt Builder and Future AI Provider remain architecture placeholders only.

**Why:**
- **Dedicated coaching-context boundary** keeps Insight Engine free of prompt/AI preparation concerns.
- **Isolated selectors** keep each knowledge source testable and single-responsibility.
- **Frozen Coaching Context** gives future Prompt Builder / AI Provider consumers a stable contract without owning language or provider calls here.

**Alternatives considered:**
- **Fold coaching context into Insight Engine** — rejected: Insight Engine owns deterministic facts; Coach Intelligence owns preparation for future language layers.
- **Generate prompts or call LLMs now** — rejected: sprint explicitly forbids AI, prompts, providers, and conversation generation.
- **Persist coaching context** — rejected: out of scope; foundation remains in-memory.

**Consequences:**
- Documentation references [COACH_INTELLIGENCE.md](./COACH_INTELLIGENCE.md) (Coaching Context + Future Prompt Builder + Future AI Provider).
- Future Prompt Builder / AI Provider layers can read `CoachingContext` without redesigning this foundation.
- Coach Intelligence remains in-memory, non-AI, and non-prompting until a later consumer sprint.

---

## Decision 047: Conversation Orchestrator Foundation (Sprint 19.0)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.0 must introduce Conversation Orchestrator that coordinates flow between Coach Intelligence and future AI components by preparing an immutable Conversation Context. This domain must not generate prompts, must not call AI providers, and must not create conversational responses.

**Decision:**
Create `app/src/features/conversation-orchestrator/` with immutable Conversation Context preparation models (`ConversationContext`, `ConversationSession`, `ConversationMessage`, `ConversationTurn`, `ConversationIntent`, `ConversationGoal`, `ConversationAudience`, `ConversationPriority`, `ConversationConstraint`, `ConversationMetadata`, `ConversationKnowledge`, `ConversationEvidence`, `ConversationSummary`, `ConversationSnapshot`, `ConversationEngineResult`, `ConversationPreparation`, `ConversationState`, `ConversationStage`, `ConversationRequest`, `ConversationResponsePlaceholder`), isolated selectors (Knowledge/Priority/Goal/Evidence/Constraint/Session), validators, builders, utilities, `ConversationOrchestratorEngine`, a service facade, and a narrow application API (`prepareConversation`, `createConversationSnapshot`, `summarizeConversation`). Future Prompt Builder and Future AI Provider remain architecture placeholders only. Existing Coach Intelligence and upstream domains are consumed by reference only and must not be modified.

**Why:**
- **Dedicated orchestration boundary** keeps Coach Intelligence free of conversation handoff concerns.
- **Isolated selectors** keep each knowledge mapping testable and single-responsibility.
- **Frozen Conversation Context** gives Future Prompt Builder / AI Provider consumers a stable contract without owning language or provider calls here.

**Alternatives considered:**
- **Fold conversation orchestration into Coach Intelligence** — rejected: Coach Intelligence owns coaching preparation; Conversation Orchestrator owns handoff preparation for future language layers.
- **Generate prompts or call LLMs now** — rejected: sprint explicitly forbids AI, prompts, providers, and conversation generation.
- **Persist conversation context** — rejected: out of scope; foundation remains in-memory.

**Consequences:**
- Documentation references [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md) (Conversation Context + Future Prompt Builder).
- Future Prompt Builder / AI Provider layers can read `ConversationContext` without redesigning this foundation.
- Conversation Orchestrator remains in-memory, non-AI, and non-prompting until a later consumer sprint.

---

## Decision 048: Prompt Composition Engine Foundation (Sprint 19.1)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.1 must introduce Prompt Composition Engine that transforms immutable Conversation Context into an immutable Prompt Package of structured blocks. This domain must not generate provider-specific prompt strings, must not call AI providers, and must not perform networking.

**Decision:**
Create `app/src/features/prompt-composition/` with immutable Prompt Package composition models (`PromptPackage`, `PromptBlock`, `PromptBlockType`, `PromptSection`, `PromptPriority`, `PromptMetadata`, `PromptContext`, `PromptConstraints`, `PromptInstruction`, `PromptKnowledge`, `PromptConversation`, `PromptMemory`, `PromptSafety`, `PromptIdentity`, `PromptUserInput`, `PromptSummary`, `PromptSnapshot`, `PromptEngineResult`, `PromptCompositionInput`, `PromptEngineError`), isolated composers (System/Identity/Knowledge/Conversation/Memory/Constraint/Safety/UserInput/Summary), validators, builders, utilities, `PromptCompositionEngine`, a service facade, and a narrow application API (`composePromptPackage`, `createPromptSnapshot`, `summarizePromptPackage`). Future Provider Abstraction and Future AI Providers remain architecture placeholders only. Existing Conversation Orchestrator and upstream domains are consumed by reference only and must not be modified.

**Why:**
- **Dedicated composition boundary** keeps Conversation Orchestrator free of prompt-block concerns.
- **Isolated composers** keep each block mapping testable and single-responsibility.
- **Frozen Prompt Package** gives Future Provider Abstraction a stable structured contract without owning provider strings or SDKs here.
- **Extensible block types** allow Tools/Images/Files/Vision/Audio/Reasoning without redesign.

**Alternatives considered:**
- **Fold prompt composition into Conversation Orchestrator** — rejected: Conversation Orchestrator owns handoff context; Prompt Composition owns structured prompt blocks.
- **Generate provider prompt strings or call LLMs now** — rejected: sprint explicitly forbids AI, networking, and provider-specific string prompt generation.
- **Reuse legacy `prompt-orchestrator` as the Sprint 19.1 foundation** — rejected: Prompt Composition Engine is the Conversation Context → Prompt Package path for the Coach Intelligence pipeline; legacy prompt-orchestrator remains a separate earlier foundation.

**Consequences:**
- Documentation references [PROMPT_COMPOSITION.md](./PROMPT_COMPOSITION.md) (Prompt Package + Future Provider Mapping).
- Future Provider Abstraction / AI Provider layers can read `PromptPackage` without redesigning this foundation.
- Prompt Composition Engine remains in-memory, non-AI, and non-networking until a later provider sprint.

---

## Decision 049: AI Provider Abstraction Foundation (Sprint 19.2)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.2 must introduce AI Provider Abstraction that defines a common contract for all future AI providers over immutable Prompt Packages. This domain must not implement OpenAI / Anthropic / Gemini / Ollama, must not perform HTTP or networking, and must not execute providers.

**Decision:**
Create `app/src/features/ai-provider/` with immutable request/response/provider models (`AIRequest`, `AIResponse`, `AIProvider`, `AIProviderId`, `AIProviderCapabilities`, `AIProviderConfiguration`, `AIProviderMetadata`, `AIProviderStatus`, `AIProviderHealth`, `AIProviderLimits`, `AIProviderError`, `AIProviderResult`, `AIExecutionContext`, `AIExecutionOptions`, `AITokenUsage`, `AIFinishReason`, `AIResponseChunk`, `AIModel`, `AIModelInfo`), provider contracts (`IAIProvider`, `IAIStreamingProvider`, `IAIHealthProvider`, `IAIModelProvider`, `IAIProviderRegistry`), `AIProviderRegistry`, validators, builders, utilities, `AIProviderEngine`, a service facade, and a narrow application API (`prepareAIRequest`, `resolveProvider`, `createExecutionContext`). Future OpenAI / Anthropic / Gemini / Ollama adapters remain architecture placeholders only. Existing Prompt Composition is consumed by reference only and must not be modified.

**Why:**
- **Dedicated provider boundary** keeps Prompt Composition free of vendor contracts and SDKs.
- **Registry + contracts** allow multi-provider registration without coupling consumers to vendors.
- **Frozen AIRequest / AIExecutionContext** give future adapters a stable orchestration surface without executing now.
- **Standardized AIResponse** keeps downstream consumers vendor-neutral.

**Alternatives considered:**
- **Fold provider contracts into Prompt Composition** — rejected: Prompt Composition owns structured blocks; Provider Abstraction owns provider contracts.
- **Implement OpenAI (or another vendor) now** — rejected: sprint explicitly forbids provider implementations, HTTP, networking, and SDKs.
- **Reuse legacy `features/ai` providers as the Sprint 19.2 foundation** — rejected: AI Provider Abstraction is the Prompt Package → provider-contract path for the Coach Intelligence pipeline; legacy AI providers remain a separate earlier foundation.

**Consequences:**
- Documentation references [AI_PROVIDER_ABSTRACTION.md](./AI_PROVIDER_ABSTRACTION.md) (Provider Registry + Future OpenAI Integration + Future Multi-provider Support).
- Future provider adapters can implement `IAIProvider` and register without redesigning this foundation.
- AI Provider Abstraction remains non-executing and non-networking until a later adapter sprint.

---

## Decision 050: OpenAI Provider Foundation (Sprint 19.3)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.3 must implement the first concrete AI provider using the AI Provider Abstraction. The adapter must translate `PromptPackage` into OpenAI requests and OpenAI responses into standardized `AIResponse` without leaking provider-specific concepts into the domain, and without modifying previous domains.

**Decision:**
Create `app/src/features/openai-provider/` with immutable OpenAI models (`OpenAIRequest`, `OpenAIResponse`, `OpenAIMessage`, `OpenAIChoice`, `OpenAIUsage`, `OpenAIError`, `OpenAIStreamChunk`, `OpenAIRetryPolicy`, `OpenAIModelConfiguration`, `OpenAIExecutionResult`, `OpenAIProviderConfiguration`, `OpenAIClientOptions`), `OpenAIProvider` (implements `IAIProvider` / `IAIHealthProvider` / `IAIModelProvider` / `IAIStreamingProvider` plus `execute()` / `executeStreaming()` / `health()`), `OpenAIClient` (OpenAI SDK; SDK types never leave the client), mappers (`OpenAIRequestBuilder` / `PromptPackageMapper`, `OpenAIResponseMapper`, `OpenAIUsageMapper`, `OpenAIErrorMapper`), dedicated error hierarchy → `AIError`, streaming abstraction (no UI), validators, utilities (tokens / retry / backoff / statistics), a service facade, registry registration helper, and a narrow application API (`execute`, `executeStreaming`, `healthCheck`, `validateConfiguration`). Configuration is immutable and environment-based (API key, organization, project, base URL, model, temperature, topP, max tokens, timeout, retry policy, streaming). Memory, tool calling, conversation history, domain logic, prompt generation, and UI remain out of scope.

**Why:**
- **Dedicated provider module** keeps AI Provider Abstraction vendor-neutral while enabling real execution.
- **Mapper boundary** isolates PromptPackage → OpenAI and OpenAI → AIResponse translation.
- **SDK confinement** prevents OpenAI types from leaking into domain / application consumers.
- **Env configuration** avoids hardcoded secrets.
- **Streaming abstraction** supports incremental chunks without UI coupling; config-gated so non-streaming remains default.

**Alternatives considered:**
- **Extend legacy `features/ai` OpenAI provider** — rejected: Sprint 19.x path is PromptPackage → AI Provider Abstraction → concrete adapters.
- **Call OpenAI HTTP without an SDK wrapper** — rejected: sprint requires an OpenAI Client over the official SDK with mocked transport in tests.
- **Defer all streaming** — superseded for Sprint 19.3 acceptance: provider-local streaming abstraction is required; cross-cutting Streaming Foundation remains Sprint 20.0.

**Consequences:**
- Documentation references [OPENAI_PROVIDER.md](./OPENAI_PROVIDER.md) (Configuration + Streaming + Error Mapping).
- AI Provider Abstraction remains free of vendor SDKs; OpenAI-specific logic lives only in `openai-provider`.
- Future Anthropic / Gemini / Ollama adapters can follow the same pattern.

---

## Decision 051: AI Execution Pipeline Foundation (Sprint 19.4)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.4 must introduce an AI Execution Pipeline that orchestrates AI execution independently of any provider. The pipeline must coordinate validation, execution context, provider resolution, and execution lifecycle without implementing business logic, provider logic, streaming, retry algorithms, tool calling, memory, or HTTP. Previous domains must not be modified.

**Decision:**
Create `app/src/features/ai-execution/` with immutable execution models (`AIExecutionRequest`, `AIExecutionResult`, `AIExecutionContext`, `AIExecutionStage`, `AIExecutionState`, `AIExecutionStatus`, `AIExecutionLifecycle`, `AIExecutionTrace`, `AIExecutionMetrics`, `AIExecutionMetadata`, `AIExecutionError`, `AIExecutionEvent`, `AIExecutionCancellation`, `AIExecutionTimeout`, `AIExecutionPolicy`, `AIExecutionSummary`), modular stages (`ValidationStage`, `ContextStage`, `ProviderResolutionStage`, `ExecutionStage`, `ResultStage`, `LifecycleStage`), policy interfaces only (`RetryPolicy`, `TimeoutPolicy`, `CancellationPolicy`, `ExecutionPolicy`), provider-agnostic `IAIProviderExecutor` boundary, `AIExecutionPipeline`, validators, builders, utilities, a service facade, and a narrow application API (`executeAI`, `createExecutionContext`, `summarizeExecution`). Concrete providers (including OpenAI) are consumed via external executor wrappers. Streaming, retry algorithms, and tool calling remain architecture placeholders only.

**Why:**
- **Dedicated execution boundary** keeps providers free of orchestration lifecycle concerns.
- **Modular stages** keep validation / context / resolution / execution / result / lifecycle single-responsibility and testable.
- **Provider-agnostic executor** allows OpenAI (and future vendors) without pipeline provider-specific code or modifying prior domains.
- **Policy interfaces first** reserve retry / timeout / cancellation / streaming / tools without shipping algorithms prematurely.

**Alternatives considered:**
- **Fold execution into OpenAI Provider** — rejected: execution lifecycle is provider-agnostic and must work across future vendors.
- **Add `execute()` to `IAIProvider` now** — rejected: would modify AI Provider Abstraction; sprint forbids changing previous domains.
- **Implement streaming / retry / tools now** — rejected: explicitly deferred to Future Streaming / Retry / Tool Calling.

**Consequences:**
- Documentation references [AI_EXECUTION_PIPELINE.md](./AI_EXECUTION_PIPELINE.md) (Execution Lifecycle + Future Streaming / Retry / Tool Calling).
- Consumers call `executeAI` instead of talking to pipeline stages directly.
- AI Execution Pipeline remains free of HTTP and provider SDKs; adapters stay outside stages.

---

## Decision 052: Streaming Foundation (Sprint 20.0)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 20.0 must introduce a Streaming Foundation that coordinates provider streaming independently of any AI provider. It must receive streaming events, manage stream lifecycle, and produce immutable stream state without implementing provider-specific streaming, memory, tool calling, or conversation history. Previous domains must not be modified.

**Decision:**
Create `app/src/features/streaming/` with immutable stream models (`StreamRequest`, `StreamResponse`, `StreamChunk`, `StreamToken`, `StreamEvent`, `StreamEventType`, `StreamState`, `StreamStatus`, `StreamLifecycle`, `StreamMetadata`, `StreamMetrics`, `StreamTrace`, `StreamCancellation`, `StreamCompletion`, `StreamSummary`, `StreamSnapshot`, `StreamError`), event-driven handlers (`LifecycleHandler`, `ChunkHandler`, `TokenHandler`, `CompletionHandler`, `CancellationHandler`, `ErrorHandler`), aggregators (`ChunkAggregator`, `TokenAggregator`, `SummaryAggregator`), validators, builders, utilities, provider-agnostic `IStreamSource` boundary, `StreamingEngine`, a service facade, and a narrow application API (`startStream`, `cancelStream`, `summarizeStream`). Concrete providers are consumed via external stream-source wrappers. Tool calling remains an architecture placeholder only.

**Why:**
- **Dedicated streaming boundary** keeps the AI Execution Pipeline free of chunk/token aggregation concerns.
- **Event-driven handlers** keep lifecycle / chunk / token / completion / cancellation / error single-responsibility and testable.
- **Provider-agnostic stream source** allows OpenAI (and future vendors) without Streaming Foundation provider-specific code or modifying prior domains.
- **Immutable stream state** preserves auditability and safe snapshot sharing across UI / coach layers later.

**Alternatives considered:**
- **Fold streaming into AI Execution Pipeline stages** — rejected: streaming lifecycle is a distinct coordination surface (chunks, heartbeats, cancellation) and would overload the non-streaming path.
- **Implement OpenAI streaming in this sprint** — rejected: explicitly deferred; foundation must remain provider-agnostic.
- **Implement tool calling now** — rejected: explicitly deferred to Future Tool Calling Integration.

**Consequences:**
- Documentation references [STREAMING_FOUNDATION.md](./STREAMING_FOUNDATION.md) (Stream Lifecycle + Future Tool Calling Integration).
- Consumers call `startStream` / `cancelStream` / `summarizeStream` instead of talking to the engine directly.
- Streaming Foundation remains free of HTTP and provider SDKs; adapters stay outside the engine.

---

## Decision 053: Tool Calling Foundation (Sprint 20.1)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 20.1 must introduce a Tool Calling Foundation that lets AI providers invoke domain capabilities through a provider-independent tool execution layer. The LLM must only request tool execution; the domain remains the source of truth. The foundation must not implement Workout / Recovery / Nutrition / Coach tools, business logic, or provider-specific logic.

**Decision:**
Evolve `app/src/features/tool-calling/` into a dedicated Tool Calling Foundation with immutable models (`ToolDefinition`, `ToolDescriptor`, `ToolCategory`, `ToolCapability`, `ToolCall`, `ToolCallRequest`, `ToolCallResponse`, `ToolExecution`, `ToolExecutionContext`, `ToolExecutionStatus`, `ToolExecutionResult`, `ToolExecutionMetadata`, `ToolExecutionError`, `ToolInput`, `ToolOutput`, `ToolParameter`, `ToolSchema`, `ToolRegistrySnapshot`, `ToolEngineResult`), contracts (`ITool`, `IToolExecutor`, `IToolRegistry`, `IToolValidator`, `IToolProvider`), `ToolCallingEngine`, `FoundationToolExecutor`, `FoundationToolRegistry`, validators, builders, utilities, a service facade, and a narrow application API (`executeTool`, `listTools`, `describeTool`). Legacy Conversation/Workflow `AITool` / `ToolExecutor` / `ToolRequest` / `ToolResult` surfaces remain for compatibility. Domain tool implementations stay outside this foundation.

**Why:**
- **Dedicated tool boundary** keeps Streaming / AI Execution / providers free of domain execution.
- **Provider-independent contracts** allow OpenAI (and future vendors) to map function-calls externally without foundation vendor code.
- **Registry + executor split** keeps catalog concerns separate from orchestration.
- **Immutable results** preserve auditability for coach / conversation layers.

**Alternatives considered:**
- **Execute tools inside Streaming Foundation** — rejected: streaming owns chunks/tokens; tool execution is a distinct domain boundary.
- **Implement Workout/Coach tools in this sprint** — rejected: explicitly deferred to Future Domain Tool Integration.
- **Vendor-specific tool schemas in the foundation** — rejected: provider mapping must stay outside.

**Consequences:**
- Documentation references [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md) (Tool Registry + Execution Flow + Future Domain Tool Integration).
- Consumers call `executeTool` / `listTools` / `describeTool` instead of talking to the engine directly.
- Tool Calling Foundation remains free of domain business logic and provider SDKs; adapters and domain tools stay outside.

---

## Decision 054: Domain Tool Adapters (Sprint 20.2)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 20.2 must create Domain Tool Adapters that expose existing domain capabilities to the Tool Calling Foundation. Adapters must contain no business logic — only translate between Tool Calling models and existing domain models. The domain remains the source of truth. Future domains (nutrition, mobility, sleep, goal) must be easy to add.

**Decision:**
Add `app/src/features/domain-tools/` with dedicated adapters (`WorkoutToolAdapter`, `RecoveryToolAdapter`, `CoachToolAdapter`, `AthleteToolAdapter`), isolated request/result mappers, builders (`FoundationToolResultBuilder`, `AdapterContextBuilder`), validators, `DomainToolService` (resolve → execute → immutable `FoundationToolResult`), and a narrow application API (`executeDomainTool`, `listDomainTools`, `describeDomainTool`). Adapters invoke existing domain application APIs only. Future adapters register via `DomainToolService.registerAdapter`. Existing domain modules are not modified.

**Why:**
- **Adapter-per-domain** keeps Tool Calling Foundation free of domain implementations.
- **Mapper isolation** keeps request/result translation single-responsibility and immutable.
- **Service orchestration** resolves adapters without embedding business logic.
- **Extensible registration** supports Nutrition/Mobility/Sleep/Goal without redesign.

**Alternatives considered:**
- **Implement domain tools inside `features/tool-calling`** — rejected: foundation must remain domain-free (ADR-053).
- **Put adapter logic inside each domain module** — rejected: would couple domains to tool-calling models and complicate future provider wiring.
- **Add business logic in adapters** — rejected: domain remains the source of truth.

**Consequences:**
- Documentation references [DOMAIN_TOOL_ADAPTERS.md](./DOMAIN_TOOL_ADAPTERS.md) (Adapter Flow + Tool Integration + Future Adapter Extensions).
- Consumers call `executeDomainTool` / `listDomainTools` / `describeDomainTool` instead of talking to adapters directly.
- Domain Tool Adapters remain free of algorithms, provider SDKs, and OpenAI code.

---

## Decision 055: Prompt Builder Foundation (Sprint 19.1)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.1 must introduce Prompt Builder that transforms immutable Conversation Context into an immutable Prompt Package. This domain must prepare every block required by future AI providers without calling providers, networking, persisting, or generating responses. A legacy coach-backed PromptContext path already exists in `features/prompt-builder/` and must remain intact. Prompt Composition Engine (ADR-048) remains a parallel composition path for AI Provider Abstraction.

**Decision:**
Extend `app/src/features/prompt-builder/` with immutable Prompt Package models (`PromptPackage`, `PromptBlock`, `SystemPrompt`, `UserPrompt`, `AssistantPrompt`, `PromptTemplate`, `PromptPersona`, `PromptCapability`, `PromptKnowledge`, `PromptFormatting`, `PromptToolDefinition`, `PromptSafety`, `PromptConstraint`, `PromptInstruction`, `PromptComposition`, `PromptStatistics`, `PromptSummary`, `PromptSnapshot`, `PromptBuildResult`), independent block builders (System/Persona/Capabilities/Knowledge/Conversation/Athlete/Recovery/Insight/Constraint/Formatting/Tool/Safety/Summary), domain templates, selectors, validators, utilities, `PromptComposer`, and a narrow application API (`buildPromptPackage`, `buildSystemPrompt`, `buildUserPrompt`, `validatePromptPackage`). Legacy coach-backed models move under `models/coach/` and keep existing hooks/repository/`getCoachPrompt`. No provider SDKs, networking, persistence, or response generation.

**Why:**
- **Dedicated Prompt Builder boundary** turns Conversation Context into provider-ready structured packages without executing AI.
- **Independent block builders** keep each composition unit testable and reusable.
- **Domain templates** stay provider-agnostic.
- **Legacy coexistence** avoids breaking Coach UI / conversation / AIService consumers.

**Alternatives considered:**
- **Replace Prompt Composition Engine with Prompt Builder** — rejected: ADR-048 path remains for AI Provider Abstraction; Prompt Builder is the Conversation Context → Prompt Package foundation with expanded blocks/templates/role prompts.
- **Call OpenAI/Anthropic/Gemini now** — rejected: sprint forbids providers, networking, and execution.
- **Overwrite legacy coach PromptContext** — rejected: existing consumers still require the coach-backed path.

**Consequences:**
- Documentation references [PROMPT_BUILDER.md](./PROMPT_BUILDER.md) (Prompt Package + Prompt Composition relationship).
- Future AI providers can read `PromptPackage` without redesigning this foundation.
- Prompt Builder remains in-memory composition only until a later provider sprint.

---

## Decision 056: Response Formatter Foundation (Sprint 19.4)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 19.4 must introduce a Response Formatter that transforms an immutable `AIResponse` into an immutable `CoachResponse`. The module must remain completely provider-independent — no networking, no provider SDKs, no prompt generation, no conversation orchestration, no business logic, and no persistence. Only deterministic response transformation is allowed. Previous domains must not be modified.

**Decision:**
Add `app/src/features/response-formatter/` with immutable Coach Response models, isolated parsers / extractors / classifiers / normalizers / validators / formatters, builders (`CoachResponseBuilder`, `CoachSummaryBuilder`, `CoachResponsePackageBuilder`), `ResponseFormatterService`, and a narrow application API (`formatResponse`, `buildCoachResponse`, `summarizeResponse`, `validateResponse`). Consume only standardized `AIResponse` from AI Provider Abstraction so OpenAI and future Anthropic / Gemini / Ollama adapters remain interchangeable. Formatters emit text payloads only (no UI rendering).

**Why:**
- **Dedicated Response Formatter boundary** turns provider output into structured application responses without coupling UI or Action Engine to vendors.
- **Independent parsers / extractors / classifiers** keep transformation units deterministic and testable.
- **AIResponse-only integration** preserves multi-provider compatibility.
- **Immutability** matches EVOLVE foundation patterns used by Prompt Builder / AI Provider / Streaming.

**Alternatives considered:**
- **Parse inside each provider adapter** — rejected: would duplicate formatting logic and leak provider concerns into CoachResponse.
- **Render UI directly from AIResponse.content** — rejected: UI and Action Engine need structured CoachResponse.
- **Add business logic / persistence in the formatter** — rejected: sprint forbids domain decisions and storage.

**Consequences:**
- Documentation references [RESPONSE_FORMATTER.md](./RESPONSE_FORMATTER.md) (Coach Response + Formatting Pipeline).
- Consumers call `formatResponse` / `buildCoachResponse` instead of parsing provider text ad hoc.
- Response Formatter remains free of provider SDKs, networking, and orchestration logic.

---

## Decision 057: AI Action Engine Foundation (Sprint 20.3 / Sprint 20.0 scope)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 20.0 must introduce an Action Engine that transforms an immutable `CoachResponse` into an immutable `ActionPlan`. The module bridges AI reasoning and executable application behavior but must not execute domain logic, modify application state, call tools, network, persist, use provider SDKs, or invoke AI. Only immutable action planning is allowed.

**Decision:**
Add `app/src/features/action-engine/` with immutable Action Plan models, action definitions (metadata only), deterministic planners (Workout/Nutrition/Recovery/Goal/Reminder/Composite), builders, validators, selectors, structural policies, execution abstractions (contracts only), `ActionEngineService`, and a narrow application API (`buildActionPlan`, `validateActionPlan`, `summarizeActionPlan`, `estimateExecution`, `describeActions`). Consume only `CoachResponse` from Response Formatter. Produce `ActionPlan` / `ActionPackage` for Future Tool Runtime.

**Why:**
- **Dedicated Action Engine boundary** keeps planning separate from tool execution and domain adapters.
- **Immutable ActionPlan** matches EVOLVE foundation patterns used by Response Formatter / Prompt Builder.
- **Planner architecture** keeps mapping units deterministic and testable.
- **Execution contracts only** defer real runtime to Future Tool Runtime without leaking domain logic.

**Alternatives considered:**
- **Execute tools inside Action Engine** — rejected: sprint forbids domain execution and tool calls.
- **Embed planning inside Response Formatter** — rejected: Formatter owns CoachResponse structure; Action Engine owns executable plan preparation.
- **Call providers / AI for planning** — rejected: sprint forbids networking, SDKs, and AI calls.

**Consequences:**
- Documentation references [ACTION_ENGINE.md](./ACTION_ENGINE.md) and [ACTION_PLANNING.md](./ACTION_PLANNING.md).
- Consumers call `buildActionPlan` instead of deriving ad hoc steps from CoachResponse.
- Action Engine remains free of domain execution, networking, persistence, and provider SDKs.

---

## Decision 058: Tool Runtime Engine Foundation (Sprint 20.1)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 20.1 must introduce a Tool Runtime that receives an immutable `ActionPlan` and coordinates `ActionStep` execution through existing Domain Tool Adapters. The runtime must never contain business logic, never execute domain logic directly, and must only orchestrate. Networking, persistence, provider SDKs, OpenAI, Prompt Builder, and Conversation logic are forbidden.

**Decision:**
Add `app/src/features/tool-runtime/` with immutable execution models, runtime orchestration (`ToolRuntimeEngine`, `ExecutionPipeline`, coordinator / scheduler / context manager), resolver architecture (Action / Adapter / Capability / Tool), dispatcher (routing only), builders, validators, executor contracts, structural policies, selectors, `ToolRuntimeService`, and a narrow application API (`executeActionPlan`, `buildExecutionPlan`, `validateExecution`, `estimateExecution`, `describeRuntime`). Consume `ActionPlan` from Action Engine. Use Domain Tool Adapters. Produce `ToolExecutionResult` / `ToolRuntimePackage`.

**Why:**
- **Dedicated Tool Runtime boundary** keeps orchestration separate from Action Engine planning and domain adapters.
- **Resolver + Dispatcher split** ensures ActionSteps are bound to adapters without embedding domain logic.
- **Execution Pipeline** provides a deterministic, testable path from plan to immutable results.
- **Mockable adapters** keep tests free of real domain services.

**Alternatives considered:**
- **Execute inside Action Engine** — rejected: Action Engine owns planning only.
- **Call domain services directly from runtime** — rejected: Domain Tool Adapters own translation; domain remains source of truth.
- **Embed provider / OpenAI / networking** — rejected: sprint forbids provider SDKs and networking.

**Consequences:**
- Documentation references [TOOL_RUNTIME.md](./TOOL_RUNTIME.md).
- Consumers call `executeActionPlan` instead of invoking adapters ad hoc from ActionPlans.
- Tool Runtime remains free of domain business logic, networking, persistence, and provider SDKs.

---

## Decision 059: Workout Agent Foundation (Sprint 21.0)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 21.0 must introduce the Workout Agent as the first intelligent domain agent of EVOLVE. It specializes in workout planning, programming, progression, exercise selection, and training conversations. It consumes the AI Runtime but must own no infrastructure, must not generate prompts, must not call providers, and must not execute tools. It orchestrates existing components and must not replace the Workout Domain.

**Decision:**
Add `app/src/features/workout-agent/` with immutable Workout Agent models (including `WorkoutAgentResult`), agent orchestration (`WorkoutAgentEngine`, `WorkoutAgentCoordinator`, session/state), deterministic reasoning and planning layers, strategy / policy / selector architecture, builders, validators, `WorkoutAgentService`, and a narrow application API (`processWorkoutRequest`, `buildWorkoutPlan`, `evaluateWorkout`, `describeWorkoutCapabilities`, `validateWorkoutPlan`). Consume Conversation Context / Memory, optional `CoachResponse` / `ActionPlan` / `ToolExecutionResult`. Produce immutable `WorkoutAgentResult`. Document Agent Runtime and Workout Intelligence boundaries.

**Why:**
- **Dedicated domain agent boundary** keeps conversational workout orchestration separate from Prompt Builder, providers, and Tool Runtime.
- **Deterministic reasoning / planning** organizes domain knowledge before AI interaction without embedding provider logic.
- **Immutable WorkoutAgentResult** matches EVOLVE foundation patterns.
- **Orchestrator-only design** prevents duplicating Workout Domain business logic.

**Alternatives considered:**
- **Generate prompts / call providers inside the agent** — rejected: Prompt Builder and AI Provider own that path.
- **Execute tools inside the agent** — rejected: Tool Runtime + Domain Tool Adapters own execution.
- **Replace Workout Domain engines** — rejected: domain remains source of truth; agent only orchestrates.

**Consequences:**
- Documentation references [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), and [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md).
- Consumers call `processWorkoutRequest` instead of ad hoc workout conversation planning.
- Workout Agent remains free of provider SDKs, networking, persistence, and UI.

---

## Decision 060: Agent Framework Foundation (Sprint 21.1)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 21.1 must introduce a shared Agent Framework so every future intelligent agent (Workout, Nutrition, Recovery, Goal, Coach Supervisor) extends the same contracts, lifecycle, and orchestration model. The framework must contain no domain-specific logic, prompts, providers, networking, or persistence. Workout Agent must migrate onto the framework without behavioral changes.

**Decision:**
Add `app/src/features/agent-framework/` with immutable contracts (`IAgent`, `IAgentFactory`, `IAgentRegistry`, lifecycle / capability / result contracts), models (`Agent`, `AgentDescriptor`, `AgentContext`, `AgentSnapshot`, …), lifecycle (`AgentLifecycle`, `AgentStateMachine`, initializer / health / shutdown), registries (Agent / Capability / Role / Metadata), `AgentFactory`, capability definitions, builders, validators, selectors, policies, `AgentFrameworkService`, and a narrow application API (`registerAgent`, `resolveAgent`, `listAgents`, `describeAgent`, `validateAgent`). Migrate Workout Agent via `WorkoutFrameworkAgent` (`IAgent` adapter) + optional `registerWithFramework`. Document Agent Framework / Lifecycle / Registry.

**Why:**
- **Shared agent infrastructure** prevents each domain agent from inventing incompatible contracts.
- **Immutable framework-only design** keeps domain logic out of the foundation.
- **Registry + factory** enable resolve-by-id / role / capability for future multi-agent routing.
- **Workout migration without behavior change** preserves Sprint 21.0 processing while adopting the framework.

**Alternatives considered:**
- **Keep per-agent isolated stacks** — rejected: future Nutrition / Recovery / Goal agents would diverge.
- **Put domain execution inside the framework** — rejected: sprint forbids business logic.
- **Embed providers / Prompt Builder / Tool Runtime** — rejected: those layers already own that path.

**Consequences:**
- Documentation references [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_LIFECYCLE.md](./AGENT_LIFECYCLE.md), and [AGENT_REGISTRY.md](./AGENT_REGISTRY.md).
- Domain agents implement `IAgent` and register via `registerAgent`.
- Agent Framework remains free of domain logic, prompts, providers, networking, and persistence.

---

## Decision 061: Nutrition Agent Foundation (Sprint 21.2)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 21.2 must introduce the Nutrition Agent as the intelligent nutrition specialist of EVOLVE. It specializes in nutritional reasoning, meal planning, macro distribution, dietary strategy, supplementation guidance, body composition support, and nutritional education. It must extend the Agent Framework, own no infrastructure, must not generate prompts, must not call providers, must not execute tools, and must not duplicate Nutrition Domain business logic.

**Decision:**
Add `app/src/features/nutrition-agent/` with immutable Nutrition Agent models (including `NutritionAgentResult`), agent orchestration (`NutritionAgentEngine`, `NutritionAgentCoordinator`, session/state), deterministic reasoning and planning layers, strategy / policy / selector architecture, builders, validators, `NutritionAgentService`, `NutritionFrameworkAgent` (`IAgent` adapter), and a narrow application API (`processNutritionRequest`, `buildNutritionPlan`, `evaluateNutrition`, `describeNutritionCapabilities`, `validateNutritionPlan`). Consume Conversation Context / Memory, optional `CoachResponse` / `ActionPlan` / `ToolExecutionResult`. Produce immutable `NutritionAgentResult`. Document Nutrition Agent, Agent Runtime, and Nutrition Intelligence boundaries.

**Why:**
- **Specialized nutrition orchestration** keeps conversational / planning logic out of the Nutrition Domain and out of Coach / Prompt / Provider layers.
- **Agent Framework reuse** avoids a second incompatible agent stack.
- **Deterministic reasoning + planning** organizes knowledge before AI without embedding prompts or provider SDKs.
- **Narrow public API** prevents leaking internals while enabling tests with mocked downstream dependencies.

**Alternatives considered:**
- **Fold nutrition planning into Workout Agent** — rejected: different domain specialist with distinct strategies / policies.
- **Put calorie/macro math only in Coach / Prompt Builder** — rejected: agent must own deterministic nutrition reasoning surface.
- **Duplicate Nutrition Engine business logic in the agent** — rejected: sprint forbids domain duplication; agent orchestrates only.

**Consequences:**
- Documentation references [NUTRITION_AGENT.md](./NUTRITION_AGENT.md), [NUTRITION_INTELLIGENCE.md](./NUTRITION_INTELLIGENCE.md), and updated [AGENT_RUNTIME.md](./AGENT_RUNTIME.md).
- Nutrition Agent remains free of provider SDKs, networking, persistence, and UI.
- Nutrition Domain remains source of truth for executable nutrition artifacts.

---

## Decision 062: Recovery Agent Foundation (Sprint 21.3)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 21.3 must introduce the Recovery Agent as the intelligent recovery specialist of EVOLVE. It evaluates recovery status, fatigue, readiness, sleep, stress, soreness, workload tolerance, and recovery recommendations. It must extend the Agent Framework, own no infrastructure, must not generate prompts, must not call providers, must not execute tools, and must not duplicate Recovery Domain business logic.

**Decision:**
Add `app/src/features/recovery-agent/` with immutable Recovery Agent models (including `RecoveryAgentResult`), agent orchestration (`RecoveryAgentEngine`, `RecoveryAgentCoordinator`, session/state), deterministic reasoning and planning layers, strategy / policy / selector architecture, builders, validators, `RecoveryAgentService`, `RecoveryFrameworkAgent` (`IAgent` adapter), and a narrow application API (`processRecoveryRequest`, `buildRecoveryPlan`, `evaluateRecovery`, `describeRecoveryCapabilities`, `validateRecoveryPlan`). Consume Conversation Context / Memory, optional `CoachResponse` / `ActionPlan` / `ToolExecutionResult`, and shared context contracts from Workout / Nutrition Agents. Produce immutable `RecoveryAgentResult`. Document Recovery Agent, Agent Runtime, and Recovery Intelligence boundaries.

**Why:**
- **Specialized recovery orchestration** keeps conversational / planning logic out of the Recovery Domain and out of Coach / Prompt / Provider layers.
- **Agent Framework reuse** avoids a second incompatible agent stack.
- **Deterministic reasoning + planning** organizes knowledge before AI without embedding prompts or provider SDKs.
- **Narrow public API** prevents leaking internals while enabling tests with mocked downstream dependencies.

**Alternatives considered:**
- **Fold recovery planning into Workout Agent** — rejected: different domain specialist with distinct strategies / policies.
- **Put fatigue/readiness math only in Coach / Prompt Builder** — rejected: agent must own deterministic recovery reasoning surface.
- **Duplicate Recovery Intelligence business logic in the agent** — rejected: sprint forbids domain duplication; agent orchestrates only.

**Consequences:**
- Documentation references [RECOVERY_AGENT.md](./RECOVERY_AGENT.md), [RECOVERY_INTELLIGENCE.md](./RECOVERY_INTELLIGENCE.md), and updated [AGENT_RUNTIME.md](./AGENT_RUNTIME.md).
- Recovery Agent remains free of provider SDKs, networking, persistence, and UI.
- Recovery Domain remains source of truth for executable recovery artifacts.

---

## Decision 063: Agent Runtime Foundation (Sprint 21.4)

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
Sprint 21.4 must introduce the Agent Runtime as the single execution entry point that coordinates specialized agents through common contracts. Domain agents (Workout, Nutrition, Recovery) already implement `IAgent`, but there was no dedicated runtime orchestration layer free of business logic for request → registry → selection → execution → result.

**Decision:**
Add `app/src/features/agent-runtime/` with immutable runtime models (`AgentRuntimeRequest`, `AgentRuntimeResponse`, `AgentRuntimeContext`, `AgentRuntimeState`, `AgentExecutionPlan`, `AgentExecutionResult`, `AgentRuntimeMetadata`, `AgentRuntimeSummary`, `AgentRuntimeSnapshot`, `AgentRuntimeError`, `AgentRuntimeEvent`), immutable `AgentRegistry`, deterministic `AgentSelector`, coordinators (`ExecutionCoordinator`, `LifecycleCoordinator`, `ResponseCoordinator`, `EventCoordinator`), builders, validators, `AgentRuntime`, `AgentRuntimeService`, and a narrow application API (`executeAgent`, `listAgents`, `describeAgent`, `registerAgent`, `unregisterAgent`). Consume existing `IAgent` / `RecoveryFrameworkAgent` without modifying them. Document runtime lifecycle, registry, selection flow, and future multi-agent collaboration placeholders.

**Why:**
- **Single execution entry point** keeps agent orchestration out of Conversation / Coach / Prompt / Provider layers.
- **Immutable registry + deterministic selection** enable predictable routing without AI.
- **No business logic** preserves Agent Framework / domain agent boundaries.
- **Injectable executors** allow domain agents to supply handlers without the runtime embedding domain code.

**Alternatives considered:**
- **Fold execution into Agent Framework** — rejected: framework owns contracts/lifecycle; runtime owns request execution orchestration.
- **Call domain agent APIs directly from Conversation Runtime** — rejected: duplicates selection / registry / lifecycle across consumers.
- **Multi-agent collaboration in this sprint** — deferred: foundation executes one selected agent per request; collaboration is a future extension.

**Consequences:**
- Documentation references [AGENT_RUNTIME.md](./AGENT_RUNTIME.md) and updated [ARCHITECTURE.md](./ARCHITECTURE.md).
- Agent Runtime remains free of providers, networking, persistence, prompts, and memory.
- Existing domain agents are unchanged; they register as `IAgent` (+ optional executor).

---

## Decision 064: Workout Agent Domain Orchestration

**Date:** 2026-07-23

**Status:** Accepted

**Context:**
The Workout Agent existed as a planning / conversational orchestrator on the Agent Framework, but needed an explicit specialized path through Agent Runtime that consumes existing workout domain engines (Program Generation, Programming, Progression, Training Adaptation, Workout Assembly, Exercise Knowledge Base, Decision Intelligence) without embedding business logic, prompts, providers, networking, or persistence. An `adaptWorkout` public API was required for Training Adaptation orchestration.

**Decision:**
Extend `app/src/features/workout-agent/` with `WorkoutDomainGateway` + `DomainCapabilitySelector`, immutable `WorkoutDomainInvocation` / `WorkoutDomainCapability` models, `adaptWorkout()` application API, Agent Runtime registration (`registerWithRuntime` + domain executor), and document the execution flow Agent Runtime → Workout Framework Agent → Planning → Workout Domain → Workout Result. Domain engines are invoked only when callers supply payloads / ports; missing payloads are recorded as skipped. Existing domain modules are not modified.

**Why:**
- **Specialized framework agent** keeps workout orchestration behind `IAgent` + Agent Runtime.
- **Domain gateway** centralizes consumption of existing engines without duplicating math.
- **No fabrication** of domain inputs preserves domain ownership of business rules.
- **adaptWorkout** provides an explicit adaptation entry without AI / networking.

**Alternatives considered:**
- **Invoke domains only via Tool Runtime** — rejected for agent-direct adaptation / planning orchestration needs.
- **Embed domain calculations in the agent** — rejected: violates no-business-logic rule.
- **Rewrite Workout Agent from scratch** — rejected: preserve Sprint 21.0/21.1 planning surface and migrate behavior.

**Consequences:**
- Documentation updates: [WORKOUT_AGENT.md](./WORKOUT_AGENT.md), [WORKOUT_INTELLIGENCE.md](./WORKOUT_INTELLIGENCE.md), [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md).
- Workout Agent remains free of providers, prompts, networking, persistence, and domain business logic.

---

## Decision 065: Conversation Memory Foundation (Sprint 21.4)

**Date:** 2026-07-23  
**Status:** Accepted  

**Context:**
The Coach Agent needs deterministic access to structured coaching knowledge (profile facts, session context, prior decisions). Chat history is not an appropriate memory model. A dedicated Conversation Memory foundation was required before durable persistence, with clear contracts for Profile / Context / Decision lanes, snapshots, timelines, and a public API — without AI, prompts, networking, or a persistence implementation.

**Decision:**
Introduce `app/src/features/conversation-memory/` with immutable memory models, `ConversationMemory` orchestration, deterministic query + policy layers, `MemoryTimelineTracker`, store **interfaces only** (`MemoryStore`, `ProfileStore`, `ContextStore`, `DecisionStore`), and application API (`saveMemory`, `loadMemory`, `queryMemory`, `updateMemory`, `buildMemorySnapshot`, `summarizeMemory`). Working memory is in-process orchestration state. Existing agents are not modified.

**Why:**
- **Structured knowledge ≠ chat history** keeps Coach Agent memory deterministic and coachable.
- **Lane projection** (Profile / Context / Decision) matches how coaching knowledge is consumed.
- **Store contracts without implementations** unlock future persistence without blocking orchestration.
- **No AI / prompts / networking** preserves Clean Architecture boundaries for agent foundations.

**Alternatives considered:**
- **Reuse chat transcript as memory** — rejected: not structured coaching knowledge.
- **Implement SQLite / remote persistence now** — rejected: out of sprint scope; contracts first.
- **Embed memory inside Coach Agent** — rejected: memory is a shared foundation for Coach Agent / Agent Runtime / future persistence.

**Consequences:**
- Documentation updates: [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Conversation Memory remains free of AI, prompts, providers, networking, and persistence implementations.

---

## Decision 066: Agent Collaboration Foundation (Sprint 21.5)

**Date:** 2026-07-24  
**Status:** Accepted  

**Context:**
Sprint 21.5 must introduce a deterministic orchestration layer between the Coach Agent and specialist agents (Workout / Nutrition / Recovery). Agent Runtime executes one selected agent per request. Coach Agent needs ordered multi-specialist collaboration without embedding AI, prompts, networking, persistence, conversation memory, or domain business logic.

**Decision:**
Introduce `app/src/features/agent-collaboration/` with immutable collaboration models (`CollaborationRequest`, `CollaborationPlan`, `CollaborationParticipant`, `CollaborationTask`, `ExecutionBatch`, `ExecutionResult`, `AggregationContext`, `AggregationResult`, `CollaborationMetadata`, `CollaborationSnapshot`, `CollaborationResult`, …), planning (`CollaborationPlanner`, `ParticipantSelector`, `ExecutionPlanner`), deterministic sequential `CollaborationDispatcher`, `CollaborationEngine` lifecycle, `ResultAggregator`, builders, validators, policies (execution ordering / duplicate handling / participant eligibility / aggregation rules), `AgentCollaborationService`, and a narrow application API (`createCollaborationPlan`, `dispatchCollaboration`, `executeCollaboration`, `aggregateResults`, `buildCollaborationSnapshot`). Specialist work is invoked only through injectable participant handlers (default shell returns orchestration metadata). Document boundaries and ADR-066.

**Why:**
- **Orchestration ≠ business logic** keeps specialist domain ownership intact.
- **Deterministic plan → dispatch → aggregate** gives Coach Agent predictable multi-agent coordination without AI.
- **Sequential dispatch only** avoids retries, queues, and concurrency frameworks out of sprint scope.
- **Aggregation preserves order + provenance** without scoring, ranking, or inference.

**Alternatives considered:**
- **Fold multi-agent collaboration into Agent Runtime** — rejected: Runtime owns single-agent execution; Collaboration owns Coach multi-specialist orchestration.
- **Embed fan-out inside Coach Agent** — rejected: duplicates planning / dispatch / aggregation; harder to test and extend.
- **Async / parallel orchestration frameworks** — rejected: sprint forbids concurrency abstractions; sequential deterministic dispatch is required.
- **AI-based aggregation / ranking** — rejected: sprint forbids AI, scoring, heuristics, and inference.

**Consequences:**
- Documentation updates: [AGENT_COLLABORATION.md](./AGENT_COLLABORATION.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md).
- Agent Collaboration remains free of AI, prompts, providers, networking, persistence, conversation memory, and domain business logic.
- Existing specialist agents are unchanged; handlers may be registered later.

---

## Decision 067: Agent Capability Registry Foundation (Sprint 21.6)

**Date:** 2026-07-24  
**Status:** Accepted  

**Context:**
Sprint 21.6 must decouple the Coach Agent and orchestration layer from concrete specialist agents (Workout / Nutrition / Recovery) by introducing a deterministic capability registry. Coach must reason in capabilities (`GenerateWorkout`, `AnalyzeNutrition`, `EvaluateRecovery`) rather than named specialists. Future agents should register capabilities without modifying Coach Agent or Agent Collaboration. The registry must not execute agents, call AI, persist state, or embed business logic.

**Decision:**
Introduce `app/src/features/agent-capability/` with immutable capability models (`AgentCapability`, `CapabilityId`, `CapabilityDescriptor`, `CapabilityMetadata`, `CapabilityRegistration`, `CapabilityRegistry`, `CapabilityMatch`, `CapabilityResolution`, `CapabilitySnapshot`, `CapabilityQuery`, `CapabilityResult`, `CapabilityCollection`, …), `CapabilityRegistryStore`, deterministic `CapabilityResolver` (exact match only — no scoring/ranking/heuristics), `CapabilityRegistrar`, `CapabilityQueryEngine`, builders, validators, policies (duplicate handling / ownership / uniqueness / consistency), `AgentCapabilityService`, and a narrow application API (`registerCapability`, `resolveCapability`, `findCapability`, `findCapabilities`, `buildCapabilitySnapshot`, `validateRegistry`). Coach Agent and Agent Collaboration are **not** modified in this sprint — foundation module only. Document boundaries and ADR-067.

**Why:**
- **Capabilities ≠ concrete agents** lets Coach orchestrate without hard-coding specialist identities.
- **Single source of truth** for what agents can do enables future specialist registration without Coach/Collaboration edits.
- **Deterministic exact resolution** preserves Clean Architecture and testability (no AI, scoring, or heuristics).
- **Foundation-first** avoids premature coupling while preparing the future Coach → Resolver → Registry → Collaboration path.

**Alternatives considered:**
- **Reuse Agent Framework CapabilityRegistry only** — rejected: framework registry serves agent contract metadata; Coach needs a dedicated capability→owner resolution foundation above Collaboration.
- **Embed capability maps inside Coach Agent** — rejected: couples Coach to specialists; harder to extend and test.
- **Capability scoring / ranking / ML matching** — rejected: sprint forbids scoring, ranking, heuristics, and AI.
- **Wire Coach + Collaboration in the same sprint** — rejected: sprint explicitly requires foundation-only introduction.

**Consequences:**
- Documentation updates: [AGENT_CAPABILITY.md](./AGENT_CAPABILITY.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Agent Capability remains free of AI, prompts, providers, networking, persistence, memory, agent execution, and domain business logic.
- Existing Coach Agent / Agent Collaboration / specialist agents are unchanged; future sprints migrate Coach to resolve via this registry.

---

## Decision 068: Supervisor Routing Engine Foundation (Sprint 21.7)

**Date:** 2026-07-24  
**Status:** Accepted  

**Context:**
Sprint 21.7 must introduce a Supervisor Routing Engine that transforms a user/coach request into a deterministic multi-agent routing plan. Coach Supervisor needs capability-aware routing (via Capability Registry) with dependency graphs and execution order, without embedding AI, prompts, provider calls, networking, persistence, business logic, or collaboration execution.

**Decision:**
Introduce `app/src/features/supervisor-routing/` with immutable routing models (`RoutingRequest`, `RoutingContext`, `RoutingPlan`, `RoutingDecision`, `RoutingTarget`, `RoutingCapability`, `RoutingDependency`, `RoutingPriority`, `RoutingPhase`, `RoutingExecutionOrder`, `RoutingGraph`, `RoutingNode`, `RoutingEdge`, `RoutingStep`, `RoutingSnapshot`, `RoutingResult`, …), `RoutingEngine` / `RoutingCoordinator`, deterministic planners / selectors / policies / validators / builders, `RoutingResolver` integrated with Capability Registry via `CapabilityRegistryPort` (exact match only — no ranking/heuristics/AI), `SupervisorRoutingService`, and a narrow application API (`buildRoutingPlan`, `resolveRouting`, `validateRoutingPlan`, `describeRouting`, `buildRoutingSnapshot`). Coach Supervisor and Agent Collaboration are **not** modified in this sprint — foundation module only. Document boundaries and ADR-068.

**Why:**
- **Routing ≠ execution** keeps plan construction free of collaboration / agent side effects.
- **Capability Registry integration** lets Supervisor reason in capabilities, not hard-coded specialist names.
- **Deterministic dependency order** (topological + declared priority) preserves testability without AI ranking.
- **Foundation-first** prepares Coach Supervisor → Routing → Collaboration without premature coupling.

**Alternatives considered:**
- **Embed routing inside Coach Agent** — rejected: couples Supervisor to specialists and mixes planning with orchestration.
- **Reuse CollaborationPlanner as routing** — rejected: collaboration owns dispatch/aggregation; routing must remain plan-only.
- **AI / heuristic agent ranking** — rejected: sprint forbids ranking algorithms and AI reasoning.
- **Wire Supervisor + Collaboration in the same sprint** — rejected: sprint explicitly requires routing foundation only.

**Consequences:**
- Documentation updates: [SUPERVISOR_ROUTING.md](./SUPERVISOR_ROUTING.md), [MULTI_AGENT_ROUTING.md](./MULTI_AGENT_ROUTING.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Supervisor Routing remains free of AI, prompts, providers, networking, persistence, agent execution, collaboration execution, and domain business logic.
- Existing Coach Agent / Agent Collaboration / specialist agents are unchanged; future sprints consume `RoutingPlan` from Supervisor Runtime.

---

## Decision 069: Coach Supervisor Foundation (Sprint 21.8)

**Date:** 2026-07-24  
**Status:** Accepted  

**Context:**
Sprint 21.8 must introduce the Coach Supervisor as the central orchestrator of EVOLVE’s multi-agent workflow. It must coordinate Routing → Capability Registry → Agent Collaboration → Specialists → Aggregation into a `UnifiedCoachResponse`, without performing workout / nutrition / recovery / goal / business logic, AI, prompts, networking, persistence, or UI. It must integrate with the Agent Framework as `IAgent` with role `coach_supervisor`.

**Decision:**
Introduce `app/src/features/coach-supervisor/` with immutable models (`CoachSupervisorRequest`, `CoachSupervisorContext`, `CoachSupervisorPlan`, `CoordinationPlan`, `AggregationResult`, `UnifiedCoachResponse`, `CoachSupervisorResult`, …), `CoachSupervisorEngine` / `CoachCoordinator`, deterministic planners / coordination / aggregation / selectors / policies / validators / builders, `RoutingPort` + `CollaborationPort` (with mocks), `CoachSupervisorFrameworkAgent` (`IAgent`, role `coach_supervisor`), `CoachSupervisorService`, and a narrow application API (`processCoachRequest`, `buildCoordinationPlan`, `aggregateResults`, `describeSupervisorCapabilities`, `validateSupervisorPlan`). Document boundaries and ADR-069.

**Why:**
- **Orchestration ≠ domain logic** keeps specialist ownership intact.
- **Ports for Routing / Collaboration** enable deterministic tests without hard-wiring specialists.
- **Framework role reuse** (`coach_supervisor`) avoids a custom agent framework.
- **Immutable UnifiedCoachResponse** gives a single coach-facing output for runtime / UI consumers later.

**Alternatives considered:**
- **Extend coach-agent only** — rejected: Supervisor Runtime needs a dedicated orchestration module above Routing + Collaboration.
- **Embed domain calculations in Supervisor** — rejected: sprint forbids business logic.
- **AI-based aggregation** — rejected: sprint forbids AI / prompts / scoring.
- **Custom supervisor framework** — rejected: must reuse Agent Framework `IAgent` lifecycle.

**Consequences:**
- Documentation updates: [COACH_SUPERVISOR.md](./COACH_SUPERVISOR.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [MULTI_AGENT_RUNTIME.md](./MULTI_AGENT_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Coach Supervisor remains free of AI, prompts, providers, networking, persistence, and domain business logic.
- Existing specialist agents are unchanged; consumed through collaboration/routing ports.

---

## Decision 070: Coaching Session Runtime (Sprint 22.0)

**Date:** 2026-07-25  
**Status:** Accepted  

**Context:**
Sprint 22.0 must introduce a Coaching Session Runtime that represents a complete coaching interaction. It must own session lifecycle, maintain immutable session context, and coordinate Coach Supervisor during a session — without performing business/domain logic, replacing Conversation Runtime, calling AI providers, networking, persistence, or UI.

**Decision:**
Introduce `app/src/features/coaching-session/` with immutable models (`CoachingSession`, `SessionContext`, `SessionState`, `SessionRequest`, `SessionResponse`, `SessionHistory`, `SessionSnapshot`, `SessionResult`, …), `CoachingSessionEngine` / `SessionCoordinator` / `SessionManager` / `SessionStateMachine` / `SessionLifecycleManager`, deterministic planners / builders / validators / policies, `CoachSupervisorPort` + `ConversationRuntimePort` (mocks), `CoachingSessionService`, and a narrow application API (`startSession`, `continueSession`, `endSession`, `describeSession`, `validateSession`). Document boundaries and ADR-070.

**Why:**
- **Session orchestration ≠ Conversation Runtime** keeps chat lifecycle separate from coaching-session lifecycle.
- **Session orchestration ≠ Coach Supervisor** keeps multi-agent coordination behind a port.
- **Immutable context / history / checkpoints** give a stable session record for later consumers.
- **Ports for Conversation + Supervisor** enable deterministic tests without provider SDKs.

**Alternatives considered:**
- **Fold session lifecycle into Coach Supervisor** — rejected: Supervisor owns multi-agent orchestration, not conversation-facing session lifecycle.
- **Extend Conversation Runtime with supervisor calls** — rejected: blurs boundaries; session runtime is the dedicated orchestration layer.
- **Embed domain / AI logic in session runtime** — rejected: sprint forbids business logic, prompts, providers, Tool Runtime.

**Consequences:**
- Documentation updates: [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [SESSION_LIFECYCLE.md](./SESSION_LIFECYCLE.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md), [SUPERVISOR_RUNTIME.md](./SUPERVISOR_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md).
- Coaching Session Runtime remains free of AI, prompts, providers, networking, persistence, Tool Runtime, and domain business logic.
- Conversation Runtime and Coach Supervisor modules are unchanged; consumed via ports.

---

## Decision 071: Athlete State Engine Foundation (Sprint 22.1)

**Date:** 2026-07-25  
**Status:** Accepted  

**Context:**
Sprint 22.1 must introduce an Athlete State Engine as the single immutable source of truth describing the current state of an athlete. It must aggregate physical, physiological, nutritional, recovery, and coaching information into a unified athlete model — without business calculations, AI reasoning, persistence, networking, or UI.

**Decision:**
Introduce `app/src/features/athlete-state/` with immutable models (`AthleteState`, `AthleteSnapshot`, `AthleteHistory`, `AthleteTimeline`, `StateSummary`, `CoachSupervisorContext`, …), `AthleteStateEngine` / `AthleteStateCoordinator` / `AthleteStateManager`, deterministic aggregation / evolution / builders / validators / policies / selectors, specialist + coaching-session ports (with mocks), `AthleteStateService`, and a narrow application API (`buildAthleteState`, `updateAthleteState`, `createSnapshot`, `describeAthleteState`, `validateAthleteState`). Document boundaries and ADR-071.

**Why:**
- **State representation ≠ domain calculation** keeps readiness / load / nutrition math in specialist engines.
- **Ports for specialists + session** enable deterministic tests without provider SDKs or hard-wiring agents.
- **Immutable versioned evolution** gives a stable athlete truth for Coach Supervisor and later consumers.
- **Narrow public API** prevents leaking internal aggregation / evolution modules.

**Alternatives considered:**
- **Extend athlete-context / athlete-history only** — rejected: those modules own profile inputs and chronological journey facts, not unified current-state aggregation.
- **Embed athlete aggregate inside Coach Supervisor** — rejected: Supervisor owns multi-agent orchestration, not athlete state truth.
- **AI-based state inference** — rejected: sprint forbids AI reasoning / prompts / calculations.

**Consequences:**
- Documentation updates: [ATHLETE_STATE_ENGINE.md](./ATHLETE_STATE_ENGINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Athlete State Engine remains free of AI, prompts, providers, networking, persistence, UI, and business calculations.
- Specialist agents and Coaching Session Runtime are unchanged; consumed via ports.

---

## Decision 072: Context Fusion Engine Foundation (Sprint 22.2)

**Date:** 2026-07-25  
**Status:** Accepted  

**Context:**
Sprint 22.2 must introduce a Context Fusion Engine that creates a unified coaching context from all available runtime sources (conversation, coaching session, athlete state, specialist agents, supervisor context). It must be the single fusion boundary before the Decision Engine — without AI reasoning, business calculations, persistence, networking, or UI.

**Decision:**
Introduce `app/src/features/context-fusion/` with immutable models (`UnifiedCoachingContext`, `ContextSnapshot`, `ContextSummary`, `ContextPackage`, `DecisionEngineContext`, …), `ContextFusionEngine` / `ContextFusionCoordinator` / `ContextFusionSession`, deterministic aggregation / resolution / builders / validators / policies / selectors, upstream ports (with mocks), `ContextFusionService`, and a narrow application API (`buildUnifiedContext`, `mergeContexts`, `validateUnifiedContext`, `describeContext`, `createContextSnapshot`). Document boundaries and ADR-072.

**Why:**
- **Fusion ≠ decisioning** keeps Decision Engine free of multi-source merge concerns.
- **Ports for upstream runtimes/agents** enable deterministic tests without provider SDKs.
- **Deterministic conflict resolution by fixed priority** avoids AI ranking.
- **Narrow public API** prevents leaking internal aggregation / resolution modules.

**Alternatives considered:**
- **Fuse inside Decision Engine** — rejected: Decision Engine should consume one unified context, not own multi-source merge.
- **Fuse inside Coach Supervisor** — rejected: Supervisor owns multi-agent orchestration, not coaching-context fusion.
- **AI-based context ranking** — rejected: sprint forbids AI reasoning / prompts / calculations.

**Consequences:**
- Documentation updates: [CONTEXT_FUSION_ENGINE.md](./CONTEXT_FUSION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Context Fusion Engine remains free of AI, prompts, providers, networking, persistence, UI, Tool Runtime, and business calculations.
- Upstream modules are unchanged; consumed via ports.

---

## Decision 073: Decision Engine Foundation (Sprint 22.3)

**Date:** 2026-07-25  
**Status:** Accepted  

**Context:**
Sprint 22.3 must introduce a Decision Engine that transforms `UnifiedCoachingContext` into immutable `CoachingDecision`s. It is the deterministic reasoning/orchestration core before Recommendation Engine and Coach Supervisor — without AI reasoning, natural language generation, domain calculations, action execution, persistence, networking, or UI.

**Decision:**
Introduce `app/src/features/decision-engine/` with immutable models (`CoachingDecision`, `DecisionCandidate`, `DecisionPackage`, `DecisionGraph`, `DecisionPlan`, `RecommendationEngineInput`, …), `DecisionEngine` / `DecisionCoordinator` / `DecisionSession`, deterministic analysis / evaluation / planning / resolution / builders / validators / policies / selectors, upstream ports (Context Fusion / Athlete State / Coach Supervisor with mocks), `DecisionEngineService`, and a narrow application API (`buildDecision`, `evaluateDecision`, `resolveDecision`, `describeDecision`, `validateDecision`). Document boundaries and ADR-073.

**Why:**
- **Decisioning ≠ fusion** keeps Context Fusion free of decision concerns.
- **Decisioning ≠ recommendations / actions** keeps Recommendation Engine and Action Engine free of orchestration scoring.
- **Ports for upstream fusion / athlete / supervisor** enable deterministic tests without provider SDKs.
- **Fixed-table analysis / evaluation / resolution** avoids AI ranking and domain math.
- **Narrow public API** prevents leaking internal analysis / resolution modules.

**Alternatives considered:**
- **Decide inside Context Fusion** — rejected: fusion must remain merge-only.
- **Decide inside Coach Supervisor** — rejected: Supervisor owns multi-agent orchestration, not coaching-decision production.
- **Reuse legacy `features/decisionEngine` rule calculator** — rejected: that path performs domain recommendation rules; Sprint 22.3 requires orchestration-only decisions over fused context.
- **AI-based decision ranking** — rejected: sprint forbids AI reasoning / prompts / NL / calculations.

**Consequences:**
- Documentation updates: [DECISION_ENGINE.md](./DECISION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [AGENT_PLATFORM.md](./AGENT_PLATFORM.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Decision Engine remains free of AI, NL, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, and domain calculations.
- Upstream Context Fusion / Athlete State / Coach Supervisor are unchanged; consumed via ports.
- Legacy `features/decisionEngine` remains untouched for this sprint.

---

## Decision 074: Recommendation Engine Foundation (Sprint 22.4)

**Date:** 2026-07-25  
**Status:** Accepted  

**Context:**
Sprint 22.4 must introduce a Recommendation Engine that transforms immutable `CoachingDecision`s into structured `CoachingRecommendation`s. It sits between Decision Engine and Explainability / Coach Supervisor — without AI reasoning, natural language generation, action execution, athlete-state mutation, domain calculations, persistence, networking, or UI.

**Decision:**
Introduce `app/src/features/recommendation-engine/` with immutable models (`CoachingRecommendation`, `RecommendationPackage`, `RecommendationPlan`, `RecommendationView`, `ExplainabilityInput`, …), `RecommendationEngine` / `RecommendationCoordinator` / `RecommendationSession`, deterministic planning / prioritization / packaging / builders / validators / policies / selectors, upstream ports (Decision Engine / Context Fusion / Athlete State / Coach Supervisor with mocks), `RecommendationEngineService`, and a narrow application API (`buildRecommendations`, `prioritizeRecommendations`, `packageRecommendations`, `describeRecommendations`, `validateRecommendations`). Document boundaries and ADR-074.

**Why:**
- **Recommendations ≠ decisions** keeps Decision Engine free of recommendation packaging concerns.
- **Recommendations ≠ NL / actions** keeps Explainability and Action Engine free of orchestration packaging.
- **Ports for upstream decision / fusion / athlete / supervisor** enable deterministic tests without provider SDKs.
- **Fixed-table planning / prioritization / packaging** avoids AI ranking and domain math.
- **Narrow public API** prevents leaking internal planners / resolvers / packagers.

**Alternatives considered:**
- **Recommend inside Decision Engine** — rejected: Decision Engine must remain decision-orchestration only.
- **Recommend inside Coach Supervisor** — rejected: Supervisor owns multi-agent orchestration, not recommendation packaging.
- **Reuse legacy `features/recommendations` UI widgets** — rejected: that path is presentation-oriented; Sprint 22.4 requires orchestration-only structured recommendations.
- **AI / NL recommendation generation** — rejected: sprint forbids AI reasoning / prompts / NL / calculations / action execution.

**Consequences:**
- Documentation updates: [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Recommendation Engine remains free of AI, NL, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, and domain calculations.
- Upstream Decision Engine / Context Fusion / Athlete State / Coach Supervisor are unchanged; consumed via ports.
- Legacy `features/recommendations` remains untouched for this sprint.

---

## Decision 075: Explainability Engine Foundation (Sprint 22.5)

**Date:** 2026-07-25  
**Status:** Accepted  

**Context:**
Sprint 22.5 must introduce an Explainability Engine that transforms immutable `CoachingDecision`s and `CoachingRecommendation`s into structured `CoachingExplanation`s. It sits between Recommendation Engine and Coach Supervisor / LLM Response Formatter — without AI reasoning, natural language generation, decision mutation, action execution, domain calculations, persistence, networking, or UI.

**Decision:**
Introduce `app/src/features/explainability-engine/` with immutable models (`CoachingExplanation`, `ExplanationPackage`, `ExplanationGraph`, `ExplanationTrace`, `ExplanationEvidence`, `LLMFormatterInput`, …), `ExplainabilityEngine` / `ExplainabilityCoordinator` / `ExplainabilitySession`, deterministic evidence / reasoning / trace / builders / validators / policies / selectors, upstream ports (Decision Engine / Recommendation Engine / Context Fusion / Athlete State / Coach Supervisor with mocks), `ExplainabilityEngineService`, and a narrow application API (`buildExplanation`, `validateExplanation`, `describeExplanation`, `createExplanationSnapshot`, `packageExplanation`). Document boundaries and ADR-075.

**Why:**
- **Explanations ≠ decisions / recommendations** keeps Decision / Recommendation Engines free of explanation packaging.
- **Explanations ≠ NL** keeps LLM Response Formatter / Prompt Builder free of structured why-traces.
- **Ports for upstream decision / recommendation / fusion / athlete / supervisor** enable deterministic tests without provider SDKs.
- **Evidence + reasoning-trace + graph layers** provide structured why without AI inference.
- **Narrow public API** prevents leaking internal reasoners / evidence / trace builders.

**Alternatives considered:**
- **Explain inside Recommendation Engine** — rejected: Recommendation Engine must remain recommendation-orchestration only.
- **Explain inside Coach Supervisor** — rejected: Supervisor owns multi-agent orchestration, not explanation packaging.
- **Reuse Decision Intelligence templates** — rejected: that path is domain-pipeline explainability; Sprint 22.5 requires coaching orchestration explanations.
- **AI / NL explanation generation** — rejected: sprint forbids AI reasoning / prompts / NL / calculations / decision mutation.

**Consequences:**
- Documentation updates: [EXPLAINABILITY_ENGINE.md](./EXPLAINABILITY_ENGINE.md), [REASONING_PIPELINE.md](./REASONING_PIPELINE.md), [DECISION_PIPELINE.md](./DECISION_PIPELINE.md), [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [AI_RUNTIME.md](./AI_RUNTIME.md), [COACHING_SESSION_RUNTIME.md](./COACHING_SESSION_RUNTIME.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [architecture/README.md](./architecture/README.md).
- Explainability Engine remains free of AI, NL, prompts, providers, networking, persistence, UI, Tool Runtime, Action Engine, and domain calculations.
- Upstream Decision Engine / Recommendation Engine / Context Fusion / Athlete State / Coach Supervisor are unchanged; consumed via ports.

---

*New decisions are appended as Decision 076, 077, etc. Do not delete or renumber existing entries — mark a decision "Superseded by Decision 0XX" if it is later reversed.*
