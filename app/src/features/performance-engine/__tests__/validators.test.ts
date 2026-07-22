import { PerformanceEngineError } from "../models/PerformanceEngineError";
import {
  validateAnalysisInput,
  validateCompletedWorkout,
  validateComputedMetrics,
  validateExecutionData,
  validateMetricConsistency,
  validateNoDivisionByZero,
} from "../validators";
import {
  createCompletedWorkoutResult,
  createPerformanceEventStream,
} from "../testSupport/fixtures";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";

function baseMetrics(
  overrides: Partial<{
    tonnage: number;
    durationMs: number;
    tonnagePerMinute: number | null;
    setsPerMinute: number | null;
    repetitionsPerMinute: number | null;
  }> = {},
): PerformanceMetrics {
  const durationMs = overrides.durationMs ?? 2_700_000;
  const zeroDuration = durationMs <= 0;

  return Object.freeze({
    volume: Object.freeze({
      tonnage: overrides.tonnage ?? 1000,
      volumeLoad: overrides.tonnage ?? 1000,
      totalCompletedSets: 4,
      totalCompletedRepetitions: 20,
      loadedSetCount: 4,
      unloadedSetCount: 0,
    }),
    intensity: Object.freeze({
      averageWeight: 80,
      averageRepetitions: 5,
      averageRpe: 8,
      averageRir: 2,
      maxWeight: 100,
      maxRpe: 9,
      weightSampleCount: 4,
      rpeSampleCount: 4,
      rirSampleCount: 4,
    }),
    density: Object.freeze({
      durationMs,
      durationMinutes: zeroDuration ? 0 : 45,
      tonnagePerMinute:
        overrides.tonnagePerMinute === undefined
          ? zeroDuration
            ? null
            : 22.22
          : overrides.tonnagePerMinute,
      setsPerMinute:
        overrides.setsPerMinute === undefined
          ? zeroDuration
            ? null
            : 0.088
          : overrides.setsPerMinute,
      repetitionsPerMinute:
        overrides.repetitionsPerMinute === undefined
          ? zeroDuration
            ? null
            : 0.44
          : overrides.repetitionsPerMinute,
    }),
    completion: Object.freeze({
      totalExercises: 2,
      completedExercises: 2,
      skippedExercises: 0,
      totalSets: 4,
      completedSets: 4,
      skippedSets: 0,
      exerciseCompletionPercent: 100,
      setCompletionPercent: 100,
      workoutCompletionPercent: 100,
    }),
  });
}

describe("performance-engine validators", () => {
  it("flags non-completed workouts", () => {
    const result = createCompletedWorkoutResult({ finalState: "Cancelled" });
    expect(validateCompletedWorkout(result)).toContain("workout_not_completed");
  });

  it("flags missing set execution data", () => {
    const result = createCompletedWorkoutResult();
    const stream = createPerformanceEventStream({ includeSets: false });
    expect(validateExecutionData(result, stream)).toContain(
      "missing_set_execution_data",
    );
  });

  it("rejects invalid results hard", () => {
    expect(() =>
      validateAnalysisInput(
        createCompletedWorkoutResult({ runtimeId: "" }),
        createPerformanceEventStream(),
      ),
    ).toThrow(PerformanceEngineError);
  });

  it("detects negative metrics", () => {
    const issues = validateMetricConsistency(
      baseMetrics({ tonnage: -1 }),
    );
    expect(issues).toContain("negative_value:tonnage");
  });

  it("throws on division by zero density rates", () => {
    expect(() =>
      validateNoDivisionByZero(
        baseMetrics({ durationMs: 0, tonnagePerMinute: 10 }),
      ),
    ).toThrow(PerformanceEngineError);
  });

  it("accepts null density rates when duration is zero", () => {
    expect(
      validateNoDivisionByZero(
        baseMetrics({ durationMs: 0, tonnagePerMinute: null }),
      ),
    ).toEqual([]);
  });

  it("validateComputedMetrics passes clean metrics", () => {
    expect(validateComputedMetrics(baseMetrics())).toEqual([]);
  });
});
