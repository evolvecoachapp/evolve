import {
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishGoalCompleted,
  publishGoalProgressUpdated,
} from "../application";
import { createGoalProgressIntegration } from "../composition";
import {
  createTestGoalProgressDomain,
  createTestGoalSnapshot,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("goal-progress integration", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("updates progress analytics read models through contracts only", async () => {
    const baseline = await mockProgressAnalyticsService.getGoalProgress();

    const { publisher } = createGoalProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    await publishGoalProgressUpdated({
      publisher,
      progress: createTestGoalProgressDomain({ id: "goal-progress-integration" }),
      goalId: "goal-integration",
      correlationId: "corr-integration",
      eventId: "evt-integration-updated",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    await publishGoalCompleted({
      publisher,
      snapshot: createTestGoalSnapshot({ id: "snapshot-integration" }),
      goalId: "goal-integration",
      correlationId: "corr-integration",
      eventId: "evt-integration-completed",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    const goals = await mockProgressAnalyticsService.getGoalProgress();

    expect(goals.length).toBe(baseline.length + 2);
    expect(goals.some((entry) => entry.id === "evt-integration-updated")).toBe(true);
    expect(goals.some((entry) => entry.id === "evt-integration-completed")).toBe(true);
  });
});
