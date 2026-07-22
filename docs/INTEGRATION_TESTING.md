# Integration Testing Framework

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-22  
**Purpose:** Document the reusable integration testing infrastructure for the workout generation pipeline (Sprint 17.8).  
**Source of Truth:** Yes — for integration framework layout and testing philosophy.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-035).

---

## Testing Philosophy

The Integration Testing Framework validates the **complete Training Intelligence pipeline** as a black box:

```
WorkoutGenerationRequest
  → Program Generation Orchestrator
  → WorkoutGenerationResult
  → Integration Assertions
  → Golden Validation
```

Rules:

- **Testing infrastructure only** — no production business logic changes.
- **No AI, networking, persistence, analytics, caching, or UI.**
- **Deterministic** — fixed timestamps, frozen fixtures, normalized snapshots.
- **Existing unit tests stay in feature modules** — this framework does not relocate them.
- Future engine evolutions should add or update scenarios/goldens here rather than duplicating pipeline wiring.

---

## Layout

```
app/tests/integration/
  fixtures/      # Immutable athlete fixtures
  builders/      # Fluent builders (athlete, request, conversation, workflow)
  assertions/    # Domain assertions (expectWorkout)
  scenarios/     # End-to-end scenario definitions + tests
  snapshots/     # Snapshot normalization utilities
  golden/        # Canonical golden JSON + matcher
  utils/         # Pipeline execution, fixture loading, comparison
  shared/        # Shared types and constants
  __tests__/     # Framework self-tests + regression validation
```

---

## Fixture Strategy

Named athlete fixtures under `fixtures/` are **immutable** (`Object.freeze` all the way down). Builders may clone/reuse them; fixtures themselves are never mutated.

Canonical fixtures:

| Fixture | Intent |
|---------|--------|
| `BeginnerBodybuildingAthlete` | Beginner hypertrophy / bodybuilding |
| `AdvancedPowerliftingAthlete` | Advanced powerlifting |
| `IntermediatePowerbuildingAthlete` | Strength + hypertrophy |
| `HomeGymAthlete` | Limited home equipment |
| `StrengthFocusedAthlete` | Strength primary |
| `HypertrophyFocusedAthlete` | Hypertrophy primary |
| `CuttingAthlete` | Fat-loss phase |
| `BulkingAthlete` | Surplus / hypertrophy phase |
| `FemaleStrengthAthlete` | Female strength athlete |
| `GeneralFitnessAthlete` | General fitness |

Load via `loadAthleteFixture("AdvancedPowerliftingAthlete")` or import the named constant.

---

## Builder Pattern

Fluent builders produce frozen domain objects:

```ts
buildAthlete()
  .advanced()
  .powerlifting()
  .gym()
  .fourTrainingDays()
  .strengthFocus()
  .build();

buildWorkoutRequest()
  .withAthlete(AdvancedPowerliftingAthlete)
  .alignedContexts()
  .withDefaultUpperBodyBlueprint()
  .withExplanations(true)
  .build();
```

Builders:

- `AthleteBuilder` / `buildAthlete()`
- `WorkoutRequestBuilder` / `buildWorkoutRequest()`
- `ConversationBuilder` / `buildConversation()`
- `WorkflowBuilder` / `buildWorkflow()`

---

## Domain Assertions

Reusable assertions avoid duplicated `expect()` blocks:

```ts
expectWorkout(result)
  .toBeValid()
  .toContainProgramming()
  .toContainProgression()
  .toContainAdaptation()
  .toContainWorkoutSession()
  .toHaveExerciseOrder()
  .toHaveNoDuplicateExercises()
  .toHaveExecutionTrace()
  .toHaveExecutionSummary()
  .toBeImmutable();

// or
expectWorkout(result).toPassPipelineValidation();
```

Pipeline validators from `features/program-generation/validators` are reused — assertions do not reimplement business rules.

---

## Scenario Tests

Scenarios under `scenarios/` execute the **complete** pipeline for realistic athlete profiles:

- Advanced Powerlifting
- Beginner Bodybuilding
- Powerbuilding
- Cutting
- Bulking
- General Fitness

Each scenario builds a `WorkoutGenerationRequest`, calls `executePipeline`, and runs domain assertions.

---

## Golden Tests

Golden scenarios store **normalized structural snapshots** in `golden/*.golden.json`.

Normalization ignores / stabilizes:

- Absolute timestamps
- Generation / conversation / athlete id strings (via `normalizeVolatileValues`)
- Snapshot shape focuses on step order, engine presence, exercise ids/order, counts, and summary metrics

Update goldens intentionally:

```bash
# from app/
UPDATE_GOLDEN=1 npm test -- --testPathPattern=tests/integration/golden
```

Regressions fail when normalized output diverges from the committed golden file.

---

## Snapshot Utilities

`snapshots/normalizeSnapshot.ts`:

- `normalizeWorkoutSnapshot(result, { scenarioId })` — structural golden view
- `normalizeVolatileValues(value)` — recursive id/timestamp scrubbing
- `serializeSnapshot` / `parseSnapshot` — stable JSON I/O

---

## Integration Utilities

| Helper | Role |
|--------|------|
| `executePipeline` | Run full orchestrator path |
| `createIntegrationPipelineService` | In-memory engine wiring (testSupport) |
| `loadAthleteFixture` | Fixture registry access |
| `compareSnapshots` / `assertSnapshotsEqual` | Deterministic structural compare |
| `matchGolden` | Golden read + assert (+ optional update) |

---

## Pipeline Validation Coverage

Integration regression tests verify:

1. Execution order  
2. Required outputs  
3. Pipeline integrity  
4. Immutable results  
5. Summary consistency  
6. Trace consistency  

No production engines are modified by this framework.
