import {
  createDensityLoadFixture,
  createFatigueScoreFixture,
  createFrequencyLoadFixture,
  createFullRecoveryInputs,
  createRecoveryMetricsFixture,
  createRecoveryStatusFixture,
  createRecoveryWindowFixture,
  createTrainingLoadFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { RecoveryMetricsBuilder } from "../builders/RecoveryMetricsBuilder";
import {
  validateAnalysisInput,
  validateAssessmentConsistency,
  validateMetricConsistency,
  validateRecoveryWindow,
  validateSnapshotIntegrity,
} from "../validators";
import { analyzeRecovery } from "../application";

describe("recovery-intelligence validators", () => {
  it("flags negative metric values", () => {
    const metrics = new RecoveryMetricsBuilder()
      .withTrainingLoad(createTrainingLoadFixture({ sessionLoad: -1 }))
      .withFatigue(createFatigueScoreFixture())
      .withDensityLoad(createDensityLoadFixture())
      .withFrequencyLoad(createFrequencyLoadFixture())
      .withRecoveryWindow(createRecoveryWindowFixture())
      .withStatus(createRecoveryStatusFixture())
      .build();

    expect(validateMetricConsistency(metrics)).toContain(
      "negative_value:sessionLoad",
    );
  });

  it("flags recovery window end before start", () => {
    const issues = validateRecoveryWindow(
      createRecoveryWindowFixture({
        startAt: "2026-07-23T12:00:00.000Z",
        endAt: "2026-07-23T11:00:00.000Z",
        durationHours: 1,
        durationMs: 3_600_000,
      }),
    );
    expect(issues).toContain("recovery_window_end_before_start");
  });

  it("flags invalid timestamps", () => {
    const issues = validateRecoveryWindow(
      createRecoveryWindowFixture({
        startAt: "not-a-date",
        endAt: "also-bad",
      }),
    );
    expect(issues).toContain("invalid_timestamp:recoveryWindow.startAt");
    expect(issues).toContain("invalid_timestamp:recoveryWindow.endAt");
  });

  it("flags input alignment mismatches", () => {
    const inputs = createFullRecoveryInputs();
    const mismatchedWorkout = {
      ...inputs.workoutResult,
      runtimeId: "other-runtime",
    };
    const issues = validateAnalysisInput(
      inputs.athleteHistory,
      inputs.performanceSnapshot,
      mismatchedWorkout,
      inputs.achievementResult,
    );
    expect(issues).toContain("workout_performance_runtime_mismatch");
  });

  it("flags assessment inconsistency", () => {
    const metrics = createRecoveryMetricsFixture();
    const assessment = Object.freeze({
      status: createRecoveryStatusFixture({ level: "high", score: 90 }),
      metrics,
      indicators: Object.freeze([]),
      evidence: Object.freeze({
        sourceType: "PerformanceSnapshot",
        sourceId: "perf-1",
        attributes: Object.freeze({}),
      }),
      assessedAt: FIXED_TIMESTAMP,
    });
    expect(validateAssessmentConsistency(assessment, metrics)).toContain(
      "assessment_status_mismatch",
    );
  });

  it("validateSnapshotIntegrity passes for engine output", () => {
    const inputs = createFullRecoveryInputs();
    const result = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-valid",
    });
    expect(validateSnapshotIntegrity(result.snapshot)).toEqual([]);
  });
});
