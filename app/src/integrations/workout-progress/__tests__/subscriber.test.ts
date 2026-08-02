import {
  getIngestedWorkoutProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { ProgressAnalyticsSubscriber } from "../subscribers";
import { createTestWorkoutProgressEvent } from "../testSupport/fixtures";

describe("ProgressAnalyticsSubscriber", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("forwards mapped events through ProgressAnalyticsService contract", async () => {
    const subscriber = new ProgressAnalyticsSubscriber(mockProgressAnalyticsService);
    const event = createTestWorkoutProgressEvent({
      type: "WorkoutCompleted",
      payload: Object.freeze({
        ...createTestWorkoutProgressEvent().payload,
        volumeKg: 5000,
        durationMinutes: 55,
        completedAt: "2026-08-02T19:02:00.000Z",
      }),
    });

    const result = await subscriber.onEvent(event);

    expect(result.accepted).toBe(true);
    expect(getIngestedWorkoutProgressEvents()).toHaveLength(1);
    expect(getIngestedWorkoutProgressEvents()[0]?.eventType).toBe("WorkoutCompleted");
  });
});
