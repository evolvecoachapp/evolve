import { createCoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import {
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishGoalProgressUpdated,
} from "../../goal-progress/application";
import { createGoalProgressIntegration } from "../../goal-progress/composition";
import {
  createTestGoalProgressDomain,
  FIXED_PUBLISHED_AT,
} from "../../goal-progress/testSupport/fixtures";
import { projectAnalyticsEventToTimeline } from "../application";
import { createAnalyticsTimelineIntegration } from "../composition";
import {
  createTestGoalAnalyticsTimelineEvent,
  createTestGoalProgressIngestDto,
  FIXED_ATHLETE_ID,
} from "../testSupport/fixtures";

describe("analytics-timeline integration", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("projects progress analytics events into coach timeline without circular dependencies", async () => {
    const coachTimelineService = createCoachTimelineService();
    const { projector } = createAnalyticsTimelineIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
      coachTimelineService,
    });

    const { publisher } = createGoalProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    await publishGoalProgressUpdated({
      publisher,
      progress: createTestGoalProgressDomain({ athleteId: FIXED_ATHLETE_ID }),
      goalId: "goal-integration",
      correlationId: "corr-integration",
      eventId: "evt-integration-analytics",
      publishedAt: FIXED_PUBLISHED_AT,
      athleteId: FIXED_ATHLETE_ID,
    });

    const analyticsEvent = createTestGoalAnalyticsTimelineEvent({
      eventId: "evt-integration-analytics",
      metadata: Object.freeze({
        source: "goal",
        correlationId: "corr-integration",
        goalId: "goal-integration",
        snapshotId: null,
        athleteId: FIXED_ATHLETE_ID,
        publishedAt: FIXED_PUBLISHED_AT,
      }),
      payload: Object.freeze({
        ...createTestGoalProgressIngestDto().payload,
        goalId: "goal-integration",
      }),
    });

    const result = projectAnalyticsEventToTimeline({ projector, event: analyticsEvent });

    expect(result.accepted).toBe(true);

    const goals = await mockProgressAnalyticsService.getGoalProgress();
    expect(goals.some((entry) => entry.id === "evt-integration-analytics")).toBe(true);

    const timeline = coachTimelineService.getTimeline(FIXED_ATHLETE_ID);
    expect(
      timeline?.entries.some(
        (entry) => entry.id === "tl:analytics:goal:evt-integration-analytics",
      ),
    ).toBe(true);
  });
});
