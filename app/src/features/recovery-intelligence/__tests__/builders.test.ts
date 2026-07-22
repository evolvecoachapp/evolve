import { RecoveryMetricsBuilder } from "../builders/RecoveryMetricsBuilder";
import { RecoverySnapshotBuilder } from "../builders/RecoverySnapshotBuilder";
import { RecoverySummaryBuilder } from "../builders/RecoverySummaryBuilder";
import {
  createDensityLoadFixture,
  createFatigueScoreFixture,
  createFrequencyLoadFixture,
  createRecoveryContext,
  createRecoveryStatusFixture,
  createRecoveryWindowFixture,
  createTrainingLoadFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-intelligence builders", () => {
  it("RecoveryMetricsBuilder freezes metrics", () => {
    const metrics = new RecoveryMetricsBuilder()
      .withTrainingLoad(createTrainingLoadFixture())
      .withFatigue(createFatigueScoreFixture())
      .withDensityLoad(createDensityLoadFixture())
      .withFrequencyLoad(createFrequencyLoadFixture())
      .withRecoveryWindow(createRecoveryWindowFixture())
      .withStatus(createRecoveryStatusFixture())
      .build();

    expect(Object.isFrozen(metrics)).toBe(true);
    expect(Object.isFrozen(metrics.trainingLoad)).toBe(true);
    expect(metrics.fatigue.score).toBe(45);
  });

  it("RecoveryMetricsBuilder throws when incomplete", () => {
    expect(() => new RecoveryMetricsBuilder().build()).toThrow(
      /missing required fields/,
    );
  });

  it("RecoverySummaryBuilder builds summary text", () => {
    const summary = new RecoverySummaryBuilder()
      .withIds({ snapshotId: "recv-1", athleteId: "ath-1" })
      .withStatus("moderate")
      .withMetrics({
        fatigueScore: 45,
        sessionLoad: 1960,
        workoutsInWindow: 1,
        windowDurationHours: 36,
      })
      .build();

    expect(summary.snapshotId).toBe("recv-1");
    expect(summary.summaryText).toContain("moderate");
    expect(Object.isFrozen(summary)).toBe(true);
  });

  it("RecoverySnapshotBuilder freezes a complete snapshot", () => {
    const metrics = new RecoveryMetricsBuilder()
      .withTrainingLoad(createTrainingLoadFixture())
      .withFatigue(createFatigueScoreFixture())
      .withDensityLoad(createDensityLoadFixture())
      .withFrequencyLoad(createFrequencyLoadFixture())
      .withRecoveryWindow(createRecoveryWindowFixture())
      .withStatus(createRecoveryStatusFixture())
      .build();

    const assessment = Object.freeze({
      status: metrics.status,
      metrics,
      indicators: Object.freeze([]),
      evidence: Object.freeze({
        sourceType: "PerformanceSnapshot",
        sourceId: "perf-1",
        attributes: Object.freeze({}),
      }),
      assessedAt: FIXED_TIMESTAMP,
    });

    const summary = new RecoverySummaryBuilder()
      .withIds({ snapshotId: "recv-snap", athleteId: null })
      .withStatus(metrics.status.level)
      .withMetrics({
        fatigueScore: metrics.fatigue.score,
        sessionLoad: metrics.trainingLoad.sessionLoad,
        workoutsInWindow: metrics.frequencyLoad.workoutsInWindow,
        windowDurationHours: metrics.recoveryWindow.durationHours,
      })
      .build();

    const snapshot = new RecoverySnapshotBuilder()
      .withId("recv-snap")
      .withContext(createRecoveryContext())
      .withMetrics(metrics)
      .withAssessment(assessment)
      .withSummary(summary)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(snapshot.id).toBe("recv-snap");
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.metrics)).toBe(true);
  });
});
