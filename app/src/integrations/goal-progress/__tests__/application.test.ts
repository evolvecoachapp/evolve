import {
  getIngestedGoalProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishGoalCompleted,
  publishGoalMilestoneReached,
  publishGoalProgressUpdated,
} from "../application";
import { createGoalProgressIntegration } from "../composition";
import {
  createTestGoalMilestone,
  createTestGoalProgressDomain,
  createTestGoalSnapshot,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("goal-progress application", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("publishes goal progress updated events through integration publisher", async () => {
    const { publisher } = createGoalProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishGoalProgressUpdated({
      publisher,
      progress: createTestGoalProgressDomain(),
      goalId: "goal-001",
      correlationId: "corr-updated",
      eventId: "evt-updated",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedGoalProgressEvents()[0]?.eventType).toBe("GoalProgressUpdated");
  });

  it("publishes goal milestone reached events", async () => {
    const { publisher } = createGoalProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishGoalMilestoneReached({
      publisher,
      milestone: createTestGoalMilestone(),
      goalId: "goal-001",
      correlationId: "corr-milestone",
      eventId: "evt-milestone",
      occurredAt: FIXED_PUBLISHED_AT,
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedGoalProgressEvents()[0]?.eventType).toBe("GoalMilestoneReached");
  });

  it("publishes goal completed events", async () => {
    const { publisher } = createGoalProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishGoalCompleted({
      publisher,
      snapshot: createTestGoalSnapshot(),
      goalId: "goal-001",
      correlationId: "corr-completed",
      eventId: "evt-completed",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedGoalProgressEvents()[0]?.eventType).toBe("GoalCompleted");
  });
});
