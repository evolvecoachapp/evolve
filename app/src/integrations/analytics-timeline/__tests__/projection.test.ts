import { createCoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import { mockProgressAnalyticsService } from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { projectAnalyticsEventToTimeline } from "../application";
import { createAnalyticsTimelineIntegration } from "../composition";
import {
  createTestGoalAnalyticsTimelineEvent,
  createTestGoalProgressIngestDto,
  FIXED_ANALYTICS_PUBLISHED_AT,
  FIXED_ATHLETE_ID,
} from "../testSupport/fixtures";

describe("analytics-timeline projection", () => {
  it("projects analytics events into coach timeline entries", () => {
    const coachTimelineService = createCoachTimelineService();
    const { projector } = createAnalyticsTimelineIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
      coachTimelineService,
    });

    const event = createTestGoalAnalyticsTimelineEvent({
      eventId: "evt-projection-001",
      eventType: "GoalCompleted",
      payload: Object.freeze({
        ...createTestGoalProgressIngestDto().payload,
        status: "completed",
        completionPercent: 100,
      }),
    });

    const result = projectAnalyticsEventToTimeline({ projector, event });

    expect(result.accepted).toBe(true);
    expect(result.timelineEntryId).toBe("tl:analytics:goal:evt-projection-001");

    const timeline = coachTimelineService.getTimeline(FIXED_ATHLETE_ID);
    expect(timeline?.entries.some((entry) => entry.id === result.timelineEntryId)).toBe(
      true,
    );
  });

  it("tracks projected event ids in projector snapshot", () => {
    const coachTimelineService = createCoachTimelineService();
    const { projector } = createAnalyticsTimelineIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
      coachTimelineService,
      clock: () => FIXED_ANALYTICS_PUBLISHED_AT,
    });

    projectAnalyticsEventToTimeline({
      projector,
      event: createTestGoalAnalyticsTimelineEvent({ eventId: "evt-projection-002" }),
    });

    const snapshot = projector.getSnapshot();
    expect(snapshot.projectedEventCount).toBe(1);
    expect(snapshot.lastEventId).toBe("evt-projection-002");
    expect(snapshot.lastEventType).toBe("GoalProgressUpdated");
    expect(snapshot.lastSource).toBe("goal");
  });
});
