import {
  createAnalyticsTimelineEvent,
  createAnalyticsTimelineProjectionResult,
  createAnalyticsTimelineProjectionSnapshot,
} from "../models";

describe("analytics-timeline immutability", () => {
  it("freezes analytics timeline events", () => {
    const event = createAnalyticsTimelineEvent({
      source: "goal",
      event: Object.freeze({
        eventId: "evt-immutable",
        eventType: "GoalProgressUpdated",
        occurredAt: "2026-08-02T20:00:00.000Z",
        metadata: Object.freeze({
          source: "goal",
          correlationId: "corr-immutable",
          goalId: "goal-immutable",
          snapshotId: null,
          athleteId: "athlete-immutable",
          publishedAt: "2026-08-02T20:00:00.000Z",
        }),
        payload: Object.freeze({
          goalId: "goal-immutable",
          snapshotId: null,
          title: "Test goal",
          category: "performance",
          currentValue: 50,
          targetValue: 100,
          unit: "percent",
          completionPercent: 50,
          status: "on_track",
          evaluatedAt: null,
          completedAt: null,
          metrics: Object.freeze([]),
        }),
      }),
    });

    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.event)).toBe(true);
    expect(Object.isFrozen(event.event.metadata)).toBe(true);
    expect(Object.isFrozen(event.event.payload)).toBe(true);
    expect(Object.isFrozen(event.event.payload.metrics)).toBe(true);
  });

  it("freezes projection results and snapshots", () => {
    const result = createAnalyticsTimelineProjectionResult({
      eventId: "evt-immutable",
      accepted: true,
      projectedAt: "2026-08-02T20:00:00.000Z",
      timelineEntryId: "tl:analytics:goal:evt-immutable",
      entry: null,
    });

    const snapshot = createAnalyticsTimelineProjectionSnapshot({
      projectedEventCount: 1,
      lastEventId: "evt-immutable",
      lastEventType: "GoalProgressUpdated",
      lastSource: "goal",
      capturedAt: "2026-08-02T20:00:00.000Z",
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});
