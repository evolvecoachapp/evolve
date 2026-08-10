import {
  getIngestedRecoveryProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { RecoveryProgressSubscriber } from "../subscribers";
import { createTestRecoveryProgressEvent } from "../testSupport/fixtures";

describe("RecoveryProgressSubscriber", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("forwards mapped events through ProgressAnalyticsService contract", async () => {
    const subscriber = new RecoveryProgressSubscriber(mockProgressAnalyticsService);
    const event = createTestRecoveryProgressEvent({
      type: "RecoveryAssessed",
      payload: Object.freeze({
        ...createTestRecoveryProgressEvent().payload,
        assessmentId: "assessment-001",
        recoveryScore: 82,
        completedAt: "2026-08-02T08:00:00.000Z",
      }),
    });

    const result = await subscriber.onEvent(event);

    expect(result.accepted).toBe(true);
    expect(getIngestedRecoveryProgressEvents()).toHaveLength(1);
    expect(getIngestedRecoveryProgressEvents()[0]?.eventType).toBe("RecoveryAssessed");
  });
});
