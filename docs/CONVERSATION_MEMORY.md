# Conversation Memory Foundation

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Document the Conversation Memory Foundation — structured coaching knowledge for the Coach Agent.  
**Source of Truth:** Yes — for Conversation Memory layout, lifecycle, categories, timeline, and public API on mobile.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md), [COACH_AGENT.md](./COACH_AGENT.md), [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md).

---

## Architecture Summary

```
Coach Agent
      ↓
Conversation Memory
      ↓
Profile Memory / Context Memory / Decision Memory
      ↓
Memory Snapshot
      ↓
Memory Result
```

Module: `app/src/features/conversation-memory/`.

Conversation Memory stores **structured coaching knowledge**. It is **not** chat history.

It provides deterministic memory services for the Coach Agent.

It contains **no** AI, prompts, networking, or persistence implementation.

It **does**:

- receive memory operations (save / load / query / update)
- resolve memory category → Profile / Context / Decision lanes
- apply deterministic retention / merge / conflict policies
- track ordered memory events on an immutable timeline
- build immutable snapshots and summaries
- return frozen `MemoryResult`

It **does not**:

- store chat transcripts as primary memory
- generate prompts or call AI providers
- implement durable persistence / database / network I/O
- modify existing agents

---

## Conversation Memory

`ConversationMemory` is the orchestration core:

1. Validate inbound entry / query / update
2. Resolve category → memory lane (`profile` | `context` | `decision`)
3. Merge + retain working set (in-process orchestration state only)
4. Append timeline events
5. Build immutable snapshot when requested
6. Return `MemoryResult`

Store interfaces (`MemoryStore`, `ProfileStore`, `ContextStore`, `DecisionStore`) are **contracts only** for a future persistence layer.

---

## Memory Lifecycle

```
saveMemory / updateMemory
  → validate
  → resolve category lane
  → merge + retain (policies)
  → timeline event
  → MemoryResult

loadMemory / queryMemory
  → validate query (when applicable)
  → deterministic query engine
  → timeline event
  → MemoryResult

buildMemorySnapshot
  → project Profile / Context / Decision
  → validate snapshot + timeline integrity
  → MemoryResult (with MemorySnapshot)

summarizeMemory
  → compact MemorySummary
  → MemoryResult
```

Working memory lives in-process for orchestration. Durability is deferred to Future Persistence.

---

## Memory Categories

| Category | Lane | Role |
|----------|------|------|
| `profile` | Profile | Athlete profile facts |
| `preference` | Profile | Stable preferences |
| `goal` | Profile | Coaching goals |
| `constraint` | Profile | Hard constraints |
| `context` | Context | Current session / conversation context |
| `summary` | Context | Compact context summaries |
| `decision` | Decision | Prior coaching decisions |
| `system` | Decision | System / orchestration markers |

Priorities: `LOW` (10) / `NORMAL` (50) / `HIGH` (80) / `CRITICAL` (100).

Scopes: `session` / `conversation` / `athlete` / `global`.

---

## Memory Timeline

`MemoryTimelineTracker` records ordered immutable events:

`saved` · `loaded` · `queried` · `updated` · `merged` · `conflicted` · `retained` · `evicted` · `snapshot_built` · `summarized`

Responsibilities:

- track ordered memory events (`sequence` monotonic)
- produce immutable `MemoryTimeline` snapshots
- support integrity validation (no gaps, consistent `nextSequence`)

---

## Future Persistence

This sprint ships **contracts only**:

| Contract | Role |
|----------|------|
| `MemoryStore` | Generic entry persistence port |
| `ProfileStore` | Profile lane persistence port |
| `ContextStore` | Context lane persistence port |
| `DecisionStore` | Decision lane persistence port |

No database, no provider SDK, no networking, no durable adapter implementations.

Future work may inject store implementations behind `ConversationMemory` without changing the public application API.

---

## Module Layout

| Folder | Role |
|--------|------|
| `models/` | Immutable memory models |
| `memory/` | `ConversationMemory` orchestration |
| `stores/` | Persistence contracts only |
| `queries/` | Deterministic query engine |
| `timeline/` | Ordered event timeline |
| `builders/` | Entry / Context / Query / Snapshot / Result |
| `validators/` | Entry / query / snapshot / update / timeline / category |
| `policies/` | Retention / merge / conflict (deterministic) |
| `services/` | `ConversationMemoryService` |
| `application/` | Public API only |
| `utils/` | Freeze helpers + category/sort helpers |
| `testSupport/` | Fixtures |

---

## Public API

| Function | Role |
|----------|------|
| `saveMemory` | Save structured memory → `MemoryResult` |
| `loadMemory` | Load by id → `MemoryResult` |
| `queryMemory` | Deterministic query → `MemoryResult` |
| `updateMemory` | Update existing entry → `MemoryResult` |
| `buildMemorySnapshot` | Build immutable `MemorySnapshot` |
| `summarizeMemory` | Compact `MemorySummary` |

Internals (policies, query engine, timeline tracker, stores) are not part of the public application surface.

---

## Integration

### Consumes (future / adjacent)

| Consumer | Role |
|----------|------|
| **Coach Agent** | Primary producer/consumer of structured coaching memory |
| **Agent Runtime** | May pass memory snapshots into agent execution context |
| **Future persistence layer** | Implements store contracts |

Existing agents are **not modified** by this foundation.

### Produces

| Output | Role |
|--------|------|
| **MemoryResult** | Immutable primary orchestration output |
| MemorySnapshot | Profile + Context + Decision projection |
| MemorySummary | Compact counts / categories |
| MemoryTimeline | Ordered event history |

---

## Design Rules

- **Not chat history** — structured coaching knowledge only
- **No AI** / prompts / providers / networking
- **No persistence implementation** — contracts + in-process orchestration only
- **Immutable models** — deep-frozen via `FreezeMemoryState`
- **Deterministic** policies and queries
- **Do not modify** existing agents

---

## Related Docs

- [COACH_AGENT.md](./COACH_AGENT.md) — meta-agent that will consume memory
- [AGENT_RUNTIME.md](./AGENT_RUNTIME.md) — runtime entry point
- [CONVERSATION_ORCHESTRATOR.md](./CONVERSATION_ORCHESTRATOR.md) — conversation context preparation (separate concern)
