import {
  getIngestedWorkoutProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishPersonalRecord,
  publishWorkoutCancellation,
  publishWorkoutCompletion,
} from "../application";
import { createWorkoutProgressIntegration } from "../composition";
import {
  createTestPersonalRecord,
  createTestWorkoutSession,
  createTestWorkoutSessionSummary,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("workout-progress application", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("publishes workout completion through integration publisher", async () => {
    const { publisher } = createWorkoutProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishWorkoutCompletion({
      publisher,
      summary: createTestWorkoutSessionSummary(),
      correlationId: "corr-complete",
      eventId: "evt-complete",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedWorkoutProgressEvents()[0]?.eventType).toBe("WorkoutCompleted");
  });

  it("publishes workout cancellation", async () => {
    const { publisher } = createWorkoutProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishWorkoutCancellation({
      publisher,
      session: createTestWorkoutSession({ status: "in_progress" }),
      correlationId: "corr-cancel",
      eventId: "evt-cancel",
      cancelledAt: FIXED_PUBLISHED_AT,
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedWorkoutProgressEvents()[0]?.eventType).toBe("WorkoutCancelled");
  });

  it("publishes personal record events", async () => {
    const { publisher } = createWorkoutProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishPersonalRecord({
      publisher,
      record: createTestPersonalRecord(),
      correlationId: "corr-pr",
      eventId: "evt-pr",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedWorkoutProgressEvents()[0]?.eventType).toBe(
      "PersonalRecordAchieved",
    );
  });
});
