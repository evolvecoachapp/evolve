import { loadWorkoutHistory } from "../../../features/progress-analytics/application/LoadWorkoutHistory";
import { loadPersonalRecords } from "../../../features/progress-analytics/application/LoadPersonalRecords";
import {
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishPersonalRecord,
  publishWorkoutCompletion,
} from "../application";
import { createWorkoutProgressIntegration } from "../composition";
import {
  createTestPersonalRecord,
  createTestWorkoutSessionSummary,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("workout-progress integration", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("updates progress analytics read models through contracts only", async () => {
    const baselineHistory = await loadWorkoutHistory({
      service: mockProgressAnalyticsService,
    });
    const baselineRecords = await loadPersonalRecords({
      service: mockProgressAnalyticsService,
    });

    const { publisher } = createWorkoutProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    await publishWorkoutCompletion({
      publisher,
      summary: createTestWorkoutSessionSummary(),
      correlationId: "corr-integration",
      eventId: "evt-integration-complete",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    await publishPersonalRecord({
      publisher,
      record: createTestPersonalRecord({ id: "pr-integration" }),
      correlationId: "corr-integration",
      eventId: "evt-integration-pr",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    const history = await loadWorkoutHistory({ service: mockProgressAnalyticsService });
    const records = await loadPersonalRecords({ service: mockProgressAnalyticsService });

    expect(history.totalCount).toBe(baselineHistory.totalCount + 1);
    expect(records.length).toBe(baselineRecords.length + 1);
    expect(history.entries.some((entry) => entry.id === "evt-integration-complete")).toBe(
      true,
    );
    expect(records.some((record) => record.id === "pr-integration")).toBe(true);
  });
});
