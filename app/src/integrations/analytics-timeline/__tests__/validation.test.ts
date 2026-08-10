import { validateAnalyticsTimelineEvent } from "../validation";
import { AnalyticsTimelineValidationError } from "../validation/AnalyticsTimelineValidationError";
import {
  createTestGoalAnalyticsTimelineEvent,
  createTestGoalProgressIngestDto,
} from "../testSupport/fixtures";

describe("analytics-timeline validation", () => {
  it("accepts valid analytics timeline events", () => {
    expect(() =>
      validateAnalyticsTimelineEvent({
        event: createTestGoalAnalyticsTimelineEvent(),
      }),
    ).not.toThrow();
  });

  it("rejects missing event", () => {
    expect(() =>
      validateAnalyticsTimelineEvent({ event: null }),
    ).toThrow(AnalyticsTimelineValidationError);

    try {
      validateAnalyticsTimelineEvent({ event: null });
    } catch (error) {
      expect(error).toBeInstanceOf(AnalyticsTimelineValidationError);
      expect((error as AnalyticsTimelineValidationError).code).toBe("missing_event");
    }
  });

  it("rejects duplicate event ids", () => {
    expect(() =>
      validateAnalyticsTimelineEvent({
        event: createTestGoalAnalyticsTimelineEvent({ eventId: "evt-dup" }),
        projectedEventIds: ["evt-dup"],
      }),
    ).toThrow(AnalyticsTimelineValidationError);
  });

  it("rejects unsupported event types", () => {
    expect(() =>
      validateAnalyticsTimelineEvent({
        event: createTestGoalAnalyticsTimelineEvent({
          eventType: "UnsupportedGoalEvent" as "GoalProgressUpdated",
        }),
      }),
    ).toThrow(AnalyticsTimelineValidationError);
  });

  it("rejects missing athlete id", () => {
    expect(() =>
      validateAnalyticsTimelineEvent({
        event: createTestGoalAnalyticsTimelineEvent({
          metadata: Object.freeze({
            ...createTestGoalProgressIngestDto().metadata,
            athleteId: null,
          }),
        }),
      }),
    ).toThrow(AnalyticsTimelineValidationError);
  });
});
