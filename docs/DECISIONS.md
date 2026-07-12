# Architecture Decision Records

This document records significant technical decisions made for EVOLVE, why they were made, and what alternatives were considered. New decisions should be appended with the next sequential number — existing entries are not renumbered or deleted, even if later superseded (mark superseded decisions explicitly).

Format inspired by lightweight ADRs (Architecture Decision Records).

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

*New decisions are appended as Decision 010, 011, etc. Do not delete or renumber existing entries — mark a decision "Superseded by Decision 0XX" if it is later reversed.*
