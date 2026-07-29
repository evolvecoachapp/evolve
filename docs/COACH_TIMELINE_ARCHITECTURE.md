# Coach Timeline Architecture

**Project:** EVOLVE  
**Sprint:** 31.9 — Coach Timeline Framework Foundation  
**Status:** Accepted  
**ADR:** [ADR-114](./DECISIONS.md)  
**Module:** `app/src/features/coach-timeline`

---

## Purpose

Establish the deterministic timeline domain that aggregates chronological athlete events coming from every future EVOLVE module. This sprint creates the framework foundation — no event sourcing, realtime, networking, persistence, search engine, or analytics calculations.

Future sources (Workout Engine, Nutrition Engine, Recovery Engine, Coach Intelligence, Notification Center, Progress Analytics, Athlete Profile, Synchronization Engine, Backend) must contribute events through the Timeline Service without changing the Domain.

This framework coexists with the Sprint 25.4 Decision Journal (ADR-086) inside the same feature module. The journal remains the append-only coach reasoning history; the framework is the athlete-event presentation domain.

---

## Dependency Flow

```
React UI (screens / components)
        ↓
CoachTimelineViewModel
        ↓
Application Use Cases
  (loadTimeline / refreshTimeline / loadMoreTimeline /
   filterTimeline / searchTimeline /
   loadTimelineStatistics / loadTimelineSnapshot)
        ↓
Mappers (DTO → immutable presentation read models)
        ↓
CoachTimelineFrameworkService (provider contract)
        ↓
Mock / Backend / Local providers
        ↓
(future) Workout / Nutrition / Recovery / Coach /
Notifications / Analytics / Profile / Sync / Backend
```

UI never imports providers, mocks, repositories, or infrastructure adapters directly.

---

## Module Structure

```
features/coach-timeline/
  application/     — journal APIs + framework use cases
  hooks/           — ViewModel bindings
  viewmodels/      — CoachTimelineViewModel
  components/      — presentation-only timeline UI
  models/          — journal + immutable framework presentation models
  mappers/         — provider DTO → experience models
  providers/       — Mock / Backend / Local experience providers
  services/        — Decision Journal service + Framework provider contract + factory
  screens/         — CoachTimelineScreen composition
  store/           — Decision Journal store (ADR-086)
  builders/        — Decision Journal builders (ADR-086)
  __tests__/       — journal + framework suites
  index.ts
```

---

## Models (Framework)

| Model | Responsibility |
|-------|----------------|
| `TimelineEvent` | Single chronological athlete event |
| `TimelineEventType` | Supported event kinds (represent only) |
| `TimelineCategory` | Event category (represent only) |
| `TimelinePriority` | Event priority (represent only) |
| `TimelineSection` | Section header projection |
| `TimelineFilter` / `TimelineEventFilter` | Period + categories + types + search |
| `TimelinePeriod` | today / yesterday / week / month / quarter / year / custom |
| `TimelineMetadata` | Source module / correlation / tags |
| `TimelineStatistics` | Headline counts (represent only) |
| `TimelineSnapshot` | Point-in-time timeline snapshot |
| `TimelineLoadingState` | idle / loading / refreshing / loading_more |
| `TimelineErrorState` | message / code / retryable |
| `TimelinePagination` | Cursor-based pagination (represent only) |
| `TimelineCursor` | Pagination cursor |
| `TimelineGroup` | today / yesterday / earlier_this_week / last_week / this_month / earlier |
| `TimelineAction` | Prepared destination action |
| `TimelineBadge` | Visual badge projection |
| `TimelineAttachment` | Attachment projection |
| `AthleteTimeline` | Aggregate timeline read model |

All models are immutable (`Object.freeze`).

---

## Supported Event Types

workout_completed · workout_skipped · personal_record · goal_reached · goal_updated · weight_updated · measurement_updated · recovery_completed · recovery_missed · nutrition_completed · nutrition_missed · coach_insight · coach_recommendation · reminder_created · reminder_completed · notification_dismissed · profile_updated · achievement_unlocked · synchronization_completed · custom

Represent only.

---

## Timeline Categories

workout · nutrition · recovery · coach · profile · notifications · analytics · achievements · synchronization · custom

Represent only.

---

## Timeline Periods

today · yesterday · week · month · quarter · year · custom

Represent only — no date-range engines.

---

## Timeline Groups

today · yesterday · earlier_this_week · last_week · this_month · earlier

Represent only.

---

## Service Contract

`CoachTimelineFrameworkService` defines the provider abstraction (Phase 31 Timeline Service seam):

- `getTimeline(filter?, cursor?)` → timeline aggregate
- `loadMore(cursor)` → next page
- `filterTimeline(filter)` → filtered aggregate
- `searchTimeline(query, filter?)` → search projection (represent only)
- `getStatistics(period?)` → statistics
- `getSnapshot(period?)` → snapshot

Provider is selected via `EXPO_PUBLIC_COACH_TIMELINE_PROVIDER` (mock | backend | local).

The ADR-086 Decision Journal retains the `CoachTimelineService` class for append-only journal operations.

---

## Providers

| Provider | Status |
|----------|--------|
| `MockCoachTimelineService` | Operational — realistic mock athlete events |
| `BackendCoachTimelineService` | Stub — throws `CoachTimelineFrameworkError` |
| `LocalCoachTimelineService` | Stub — throws `CoachTimelineFrameworkError` |

---

## ViewModel

`CoachTimelineViewModel` owns:
- Timeline events / groups / sections / statistics / pagination / snapshot
- Loading / error / empty state
- Filter / search / load-more operations
- Subscriber notification pattern

---

## Hooks

| Hook | Projection |
|------|-----------|
| `useTimeline()` | Full timeline with load/refresh/loadMore/filter/search |
| `useTimelineFilters()` | Filter / period |
| `useTimelineStatistics()` | Statistics |
| `useTimelineSnapshot()` | Snapshot |
| `useTimelineSearch()` | Search query / matching events |

---

## Components

| Component | Role |
|-----------|------|
| `TimelineHeader` | Hero section with headline stats |
| `TimelineEventCard` | Single event card |
| `TimelineGroupHeader` | Group label |
| `TimelineStatisticsCard` | Statistics surface |
| `TimelineFilterCard` | Filter / period display |
| `TimelineSearchBar` | Search query display (represent only) |
| `TimelineEmpty` | Empty state |
| `TimelineError` | Error state with retry |
| `TimelineSkeleton` | Loading placeholder |
| `TimelineLoadMoreButton` | Cursor pagination control |
| `TimelineSectionHeader` | Section label |

---

## Screen

`CoachTimelineScreen` composes all components. Presentation only.

Navigation destinations are prepared on models (`destination` fields) — no route wiring in this sprint.

---

## Constraints

- NO event sourcing
- NO realtime / WebSocket / SignalR
- NO Firebase / Supabase
- NO networking / persistence / backend
- NO search engine / indexing
- NO analytics calculations
- Presentation and domain modeling only
- Strict TypeScript

---

## Future Integration Points

1. **Workout Engine** — workout completed / skipped / PR events
2. **Nutrition Engine** — meal completed / missed events
3. **Recovery Engine** — recovery completed / missed events
4. **Coach Intelligence** — insight / recommendation events
5. **Notification Center** — reminder / notification events
6. **Progress Analytics** — goal / measurement events
7. **Athlete Profile** — profile / weight updates
8. **Synchronization Engine** — sync completed events
9. **Backend** — remote timeline aggregation

---

## Test Coverage

- Application use case tests
- ViewModel tests
- Hook tests
- Mapper tests
- Provider tests
- Service factory tests
- Immutability tests
- Pagination tests
- Filtering tests
- Grouping tests
