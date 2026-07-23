# Domain Tool Adapters

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document Domain Tool Adapters (Sprint 20.2).  
**Source of Truth:** Yes — for Domain Tool Adapters layout, Adapter Flow, Tool Integration, and Future Adapter Extensions on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [TOOL_CALLING_FOUNDATION.md](./TOOL_CALLING_FOUNDATION.md), [AI_SYSTEM.md](./AI_SYSTEM.md), [DECISIONS.md](./DECISIONS.md) (ADR-054).

---

## Architecture Summary

```
Tool Calling Engine
      ↓
Domain Tool Adapters
      ↓
Existing Domain
      ↓
Foundation Tool Result
```

Adapters expose existing domain capabilities to the Tool Calling Foundation.

- Adapters contain **no** business logic.
- Adapters only translate between Tool Calling models and existing domain models.
- The **domain** remains the source of truth.

Module: `app/src/features/domain-tools/`.

---

## Domain Tool Adapters

| Adapter | Domain | Consumes |
|---------|--------|----------|
| **WorkoutToolAdapter** | workout | Program Generation, Performance Engine |
| **RecoveryToolAdapter** | recovery | Recovery Intelligence |
| **CoachToolAdapter** | coach | Coach Intelligence, Insight Engine |
| **AthleteToolAdapter** | athlete | Athlete History, Achievement Engine |

Future adapters (register via `DomainToolService.registerAdapter`):

- `NutritionToolAdapter`
- `MobilityToolAdapter`
- `SleepToolAdapter`
- `GoalToolAdapter`

---

## Adapter Flow

```
ToolCallRequest
  → DomainToolService.resolveAdapter(toolId)
  → validate execution context + tool compatibility
  → RequestMapper (ToolInput → domain request)
  → existing domain application API
  → ResultMapper (domain result → ToolOutput.data)
  → FoundationToolResult (immutable)
```

Responsibilities:

1. Receive `ToolCallRequest`
2. Map input
3. Invoke existing domain service / application API
4. Map output
5. Return immutable `FoundationToolResult`

No calculations. No business logic. No provider logic. No OpenAI code.

---

## Mappers

Each mapper has one responsibility.

| Mapper | Role |
|--------|------|
| **WorkoutRequestMapper** | ToolInput → workout domain request |
| **WorkoutResultMapper** | workout domain result → ToolOutput |
| **RecoveryRequestMapper** | ToolInput → recovery domain request |
| **RecoveryResultMapper** | recovery domain result → ToolOutput |
| **CoachRequestMapper** | ToolInput → coach / insight request |
| **CoachResultMapper** | coach / insight result → ToolOutput |
| **AthleteRequestMapper** | ToolInput → athlete / achievement request |
| **AthleteResultMapper** | athlete / achievement result → ToolOutput |

Mappings are immutable (frozen payloads).

---

## Builders / Validators / Services

| Area | Surface |
|------|---------|
| **Builders** | `FoundationToolResultBuilder`, `AdapterContextBuilder` |
| **Validators** | input mapping, output mapping, adapter integrity, tool compatibility, execution context |
| **Service** | `DomainToolService` — resolve adapter → execute → immutable `FoundationToolResult` |

---

## Public Application API

| Function | Role |
|----------|------|
| `executeDomainTool(options)` | Execute domain tool → `FoundationToolResult` |
| `listDomainTools(options)` | List domain `ToolDescriptor`s |
| `describeDomainTool(options)` | Describe one domain tool |

Adapter internals are not part of the public API surface.

---

## Tool Integration

Consumes (does not modify):

- Tool Calling Foundation (`ToolCallRequest`, `FoundationToolResult`, validators/builders)
- Workout Generation (`generateWorkoutProgram`)
- Performance Engine (`analyzeWorkoutPerformance`)
- Achievement Engine (`evaluateAchievements`)
- Athlete History (`buildAthleteHistory`, `summarizeHistory`)
- Recovery Intelligence (`analyzeRecovery`, `summarizeRecovery`)
- Insight Engine (`generateInsights`)
- Coach Intelligence (`prepareCoachingContext`, `summarizeCoachingContext`)

Stable tool ids use `domain.<family>.<operation>` (e.g. `domain.workout.generate`).

---

## Future Adapter Extensions

1. Implement `IDomainToolAdapter` (or extend `BaseDomainToolAdapter`)
2. Add request/result mappers for the domain
3. Register via `DomainToolService.registerAdapter` before `freeze()`
4. Optionally wire into Composition Root for production defaults

Reserved domains in `DomainToolDomain`: `nutrition`, `mobility`, `sleep`, `goal`.

---

## Explicit Non-Goals

No business logic. No new algorithms. No provider-specific code. No OpenAI code. Only adapters, mappings, and orchestration. Does not modify existing domain modules or Tool Calling Foundation internals.
