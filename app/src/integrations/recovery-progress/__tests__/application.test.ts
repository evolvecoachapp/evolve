import {
  getIngestedRecoveryProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishReadinessUpdated,
  publishRecoveryAssessed,
  publishSleepLogged,
} from "../application";
import { createRecoveryProgressIntegration } from "../composition";
import {
  createTestReadinessState,
  createTestRecoveryAssessment,
  createTestSleepProfile,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("recovery-progress application", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("publishes recovery assessed events through integration publisher", async () => {
    const { publisher } = createRecoveryProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishRecoveryAssessed({
      publisher,
      assessment: createTestRecoveryAssessment(),
      dayId: "2026-08-02",
      correlationId: "corr-assessed",
      eventId: "evt-assessed",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedRecoveryProgressEvents()[0]?.eventType).toBe("RecoveryAssessed");
  });

  it("publishes sleep logged events", async () => {
    const { publisher } = createRecoveryProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishSleepLogged({
      publisher,
      sleep: createTestSleepProfile(),
      dayId: "2026-08-02",
      correlationId: "corr-sleep",
      eventId: "evt-sleep",
      loggedAt: FIXED_PUBLISHED_AT,
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedRecoveryProgressEvents()[0]?.eventType).toBe("SleepLogged");
  });

  it("publishes readiness updated events", async () => {
    const { publisher } = createRecoveryProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishReadinessUpdated({
      publisher,
      readiness: createTestReadinessState(),
      dayId: "2026-08-02",
      correlationId: "corr-readiness",
      eventId: "evt-readiness",
      updatedAt: FIXED_PUBLISHED_AT,
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedRecoveryProgressEvents()[0]?.eventType).toBe("ReadinessUpdated");
  });
});
