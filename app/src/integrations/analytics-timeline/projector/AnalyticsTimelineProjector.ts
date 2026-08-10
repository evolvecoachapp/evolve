import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import { mapAnalyticsEventToTimelineRequest } from "../mappers";
import {
  createAnalyticsTimelineProjectionResult,
  createAnalyticsTimelineProjectionSnapshot,
  getAnalyticsTimelineEventId,
  getAnalyticsTimelineEventType,
  type AnalyticsTimelineEvent,
  type AnalyticsTimelineProjectionResult,
  type AnalyticsTimelineProjectionSnapshot,
} from "../models";
import { validateAnalyticsTimelineEvent } from "../validation";

export interface AnalyticsTimelineProjectorDeps {
  readonly progressAnalyticsService: ProgressAnalyticsService;
  readonly coachTimelineService: CoachTimelineService;
  readonly clock?: () => string;
}

/** Projects immutable Progress Analytics events into Coach Timeline entries. */
export class AnalyticsTimelineProjector {
  readonly id = "analytics-timeline-projector";

  private readonly projectedEventIds = new Set<string>();
  private lastEvent: AnalyticsTimelineEvent | null = null;

  constructor(private readonly deps: AnalyticsTimelineProjectorDeps) {}

  get progressAnalyticsService(): ProgressAnalyticsService {
    return this.deps.progressAnalyticsService;
  }

  get coachTimelineService(): CoachTimelineService {
    return this.deps.coachTimelineService;
  }

  project(event: AnalyticsTimelineEvent): AnalyticsTimelineProjectionResult {
    validateAnalyticsTimelineEvent({
      event,
      projectedEventIds: [...this.projectedEventIds],
    });

    const request = mapAnalyticsEventToTimelineRequest(event);
    const entry = this.deps.coachTimelineService.appendEntry(request);
    const eventId = getAnalyticsTimelineEventId(event);

    this.projectedEventIds.add(eventId);
    this.lastEvent = event;

    return createAnalyticsTimelineProjectionResult({
      eventId,
      accepted: true,
      projectedAt: this.now(),
      timelineEntryId: entry.id,
      entry,
    });
  }

  getProjectedEventIds(): readonly string[] {
    return Object.freeze([...this.projectedEventIds]);
  }

  getSnapshot(): AnalyticsTimelineProjectionSnapshot {
    return createAnalyticsTimelineProjectionSnapshot({
      projectedEventCount: this.projectedEventIds.size,
      lastEventId: this.lastEvent
        ? getAnalyticsTimelineEventId(this.lastEvent)
        : null,
      lastEventType: this.lastEvent
        ? getAnalyticsTimelineEventType(this.lastEvent)
        : null,
      lastSource: this.lastEvent?.source ?? null,
      capturedAt: this.lastEvent?.event.metadata.publishedAt ?? this.now(),
    });
  }

  private now(): string {
    return this.deps.clock?.() ?? new Date().toISOString();
  }
}

export function createAnalyticsTimelineProjector(
  deps: AnalyticsTimelineProjectorDeps,
): AnalyticsTimelineProjector {
  return new AnalyticsTimelineProjector(deps);
}
