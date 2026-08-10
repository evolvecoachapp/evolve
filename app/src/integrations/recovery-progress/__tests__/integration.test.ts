import {
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishRecoveryAssessed,
  publishSleepLogged,
} from "../application";
import { createRecoveryProgressIntegration } from "../composition";
import {
  createTestRecoveryAssessment,
  createTestSleepProfile,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("recovery-progress integration", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("updates progress analytics read models through contracts only", async () => {
    const baseline = await mockProgressAnalyticsService.getRecoveryStatistics();

    const { publisher } = createRecoveryProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    await publishRecoveryAssessed({
      publisher,
      assessment: createTestRecoveryAssessment({ id: "assessment-integration" }),
      dayId: "2026-08-02",
      correlationId: "corr-integration",
      eventId: "evt-integration-assessed",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    await publishSleepLogged({
      publisher,
      sleep: createTestSleepProfile(),
      dayId: "2026-08-02",
      correlationId: "corr-integration",
      eventId: "evt-integration-sleep",
      loggedAt: FIXED_PUBLISHED_AT,
      publishedAt: FIXED_PUBLISHED_AT,
    });

    const stats = await mockProgressAnalyticsService.getRecoveryStatistics();

    expect(stats.entries.length).toBe(baseline.entries.length + 2);
    expect(stats.entries.some((entry) => entry.id === "evt-integration-assessed")).toBe(true);
    expect(stats.entries.some((entry) => entry.id === "evt-integration-sleep")).toBe(true);
  });
});
