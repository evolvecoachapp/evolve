import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimeline } from "../models/CoachTimeline";
import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { CoachTimelineSnapshot } from "../models/CoachTimelineSnapshot";
import type { CoachTimelineSummaryKind } from "../models/CoachTimelineSummary";
import type { TimelineQuery } from "../models/TimelineQuery";
import type { TimelineResult } from "../models/TimelineResult";
import {
  createCoachTimelineStore,
  CoachTimelineStore,
} from "../store/CoachTimelineStore";
import { appendTimelineEntry } from "./appendTimelineEntry";
import { buildTimelineSummary } from "./buildTimelineSummary";
import { filterTimeline } from "./filterTimeline";
import { groupTimelineEvents } from "./groupTimelineEvents";
import { queryTimeline } from "./queryTimeline";
import {
  assertEntryImmutable,
  validateTimeline,
  type TimelineValidation,
} from "./validateTimeline";

export interface CoachTimelineServiceDeps {
  readonly store?: CoachTimelineStore;
  readonly clock?: () => string;
}

/**
 * Coach Timeline service — append-only decision journal.
 * Presentation / domain only. No persistence. No event bus.
 */
export class CoachTimelineService {
  private readonly store: CoachTimelineStore;
  private readonly clock: () => string;

  constructor(deps: CoachTimelineServiceDeps = {}) {
    this.store = deps.store ?? createCoachTimelineStore();
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  getStore(): CoachTimelineStore {
    return this.store;
  }

  appendEntry(request: AppendTimelineEntryRequest): CoachTimelineEntry {
    return appendTimelineEntry({ store: this.store, request });
  }

  getTimeline(athleteId: string): CoachTimeline | null {
    return this.store.getTimeline(athleteId);
  }

  restorePersisted(timeline: CoachTimeline): void {
    this.store.restoreTimeline(timeline);
  }

  query(query: TimelineQuery): TimelineResult {
    return queryTimeline({
      store: this.store,
      query,
      generatedAt: this.clock(),
    });
  }

  buildSummary(
    athleteId: string,
    kind: CoachTimelineSummaryKind,
  ) {
    const timeline = this.store.getTimeline(athleteId);
    return buildTimelineSummary({
      entries: timeline?.entries ?? Object.freeze([]),
      kind,
      generatedAt: this.clock(),
    });
  }

  filter(athleteId: string, filter: Parameters<typeof filterTimeline>[1]) {
    const timeline = this.store.getTimeline(athleteId);
    return filterTimeline(timeline?.entries ?? Object.freeze([]), filter);
  }

  group(athleteId: string) {
    const timeline = this.store.getTimeline(athleteId);
    return groupTimelineEvents(timeline?.entries ?? Object.freeze([]));
  }

  validate(athleteId: string): TimelineValidation {
    return validateTimeline(this.store.getTimeline(athleteId));
  }

  createSnapshot(
    athleteId: string,
    summaryKind: CoachTimelineSummaryKind | null = null,
  ): CoachTimelineSnapshot | null {
    const timeline = this.store.getTimeline(athleteId);
    if (!timeline) return null;
    const at = this.clock();
    const summary = summaryKind
      ? buildTimelineSummary({
          entries: timeline.entries,
          kind: summaryKind,
          generatedAt: at,
        })
      : null;
    return Object.freeze({
      id: `timeline-snap:${athleteId}:${at}`,
      athleteId,
      timeline,
      summary,
      capturedAt: at,
    });
  }

  isImmutable(entry: CoachTimelineEntry): boolean {
    return assertEntryImmutable(entry);
  }

  now(): string {
    return this.clock();
  }
}

export function createCoachTimelineService(
  deps: CoachTimelineServiceDeps = {},
): CoachTimelineService {
  return new CoachTimelineService(deps);
}
