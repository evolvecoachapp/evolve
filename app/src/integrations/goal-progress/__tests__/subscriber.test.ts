import {
  getIngestedGoalProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { GoalProgressSubscriber } from "../subscribers";
import { createTestGoalProgressEvent } from "../testSupport/fixtures";

describe("GoalProgressSubscriber", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("forwards mapped events through ProgressAnalyticsService contract", async () => {
    const subscriber = new GoalProgressSubscriber(mockProgressAnalyticsService);
    const event = createTestGoalProgressEvent({
      type: "GoalProgressUpdated",
      payload: Object.freeze({
        ...createTestGoalProgressEvent().payload,
        completionPercent: 82,
        status: "on_track",
        evaluatedAt: "2026-08-02T08:00:00.000Z",
      }),
    });

    const result = await subscriber.onEvent(event);

    expect(result.accepted).toBe(true);
    expect(getIngestedGoalProgressEvents()).toHaveLength(1);
    expect(getIngestedGoalProgressEvents()[0]?.eventType).toBe("GoalProgressUpdated");
  });
});
