import { analyzeWorkoutPerformance } from "../application";
import {
  createCompletedWorkoutResult,
  createPerformanceEventStream,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("performance-engine core analysis", () => {
  it("computes volume, intensity, density, and completion together", () => {
    const result = analyzeWorkoutPerformance(
      createCompletedWorkoutResult(),
      createPerformanceEventStream(),
      { analyzedAt: FIXED_TIMESTAMP, snapshotId: "perf:core" },
    );

    const { metrics, exercises, movements } = result.snapshot;

    expect(metrics.volume.tonnage).toBe(1960);
    expect(metrics.intensity.averageWeight).toBe(80);
    expect(metrics.intensity.averageRpe).toBe(7.5);
    expect(metrics.density.durationMs).toBe(2_700_000);
    expect(metrics.density.tonnagePerMinute).not.toBeNull();
    expect(metrics.completion.workoutCompletionPercent).toBe(100);

    expect(exercises).toHaveLength(2);
    expect(exercises[0]?.exerciseName).toBe("Back Squat");
    expect(exercises[0]?.tonnage).toBe(1000);
    expect(exercises[1]?.tonnage).toBe(960);

    expect(movements).toHaveLength(2);
    expect(result.validationIssues).not.toContain("missing_set_execution_data");
  });

  it("grades cancelled workouts as Incomplete", () => {
    const result = analyzeWorkoutPerformance(
      createCompletedWorkoutResult({
        finalState: "Cancelled",
        cancelledAt: FIXED_TIMESTAMP,
        completedAt: null,
        progress: Object.freeze({
          totalExercises: 2,
          completedExercises: 0,
          skippedExercises: 0,
          remainingExercises: 2,
          totalSets: 4,
          completedSets: 0,
          skippedSets: 0,
          remainingSets: 4,
          completionPercent: 0,
        }),
      }),
      createPerformanceEventStream({ includeSets: false }),
      { analyzedAt: FIXED_TIMESTAMP },
    );

    expect(result.snapshot.grade).toBe("Incomplete");
    expect(result.validationIssues).toContain("workout_not_completed");
  });
});
