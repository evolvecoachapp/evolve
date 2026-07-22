import {
  analyzeWorkoutPerformance,
  gradePerformance,
  summarizePerformance,
} from "../application";
import {
  createCompletedWorkoutResult,
  createPerformanceEventStream,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("performance-engine application API", () => {
  it("analyzes a completed workout into an immutable snapshot", () => {
    const result = analyzeWorkoutPerformance(
      createCompletedWorkoutResult(),
      createPerformanceEventStream(),
      { analyzedAt: FIXED_TIMESTAMP },
    );

    expect(result.snapshot.grade).toBe("A");
    expect(result.snapshot.metrics.volume.tonnage).toBe(1960);
    expect(result.snapshot.metrics.volume.totalCompletedSets).toBe(4);
    expect(result.snapshot.metrics.volume.totalCompletedRepetitions).toBe(26);
    expect(result.snapshot.metrics.density.durationMs).toBe(45 * 60_000);
    expect(result.snapshot.trend).toEqual({
      available: false,
      sessionCount: 1,
      message: "single_session_only",
    });
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(Object.isFrozen(result.snapshot.metrics)).toBe(true);
  });

  it("summarizePerformance returns the public summary", () => {
    const { snapshot } = analyzeWorkoutPerformance(
      createCompletedWorkoutResult(),
      createPerformanceEventStream(),
      { analyzedAt: FIXED_TIMESTAMP },
    );
    const summary = summarizePerformance(snapshot);
    expect(summary.snapshotId).toBe(snapshot.id);
    expect(summary.tonnage).toBe(1960);
    expect(summary.summaryText).toContain("Grade A");
  });

  it("gradePerformance returns single-session grade", () => {
    const { snapshot } = analyzeWorkoutPerformance(
      createCompletedWorkoutResult({
        progress: Object.freeze({
          totalExercises: 2,
          completedExercises: 1,
          skippedExercises: 1,
          remainingExercises: 0,
          totalSets: 4,
          completedSets: 2,
          skippedSets: 2,
          remainingSets: 0,
          completionPercent: 50,
        }),
      }),
      createPerformanceEventStream({
        events: createPerformanceEventStream().events.slice(0, 3),
        eventCount: 3,
      }),
      { analyzedAt: FIXED_TIMESTAMP },
    );

    expect(gradePerformance(snapshot)).toBe("C");
  });

  it("does not expose engine internals on the public result", () => {
    const result = analyzeWorkoutPerformance(
      createCompletedWorkoutResult(),
      createPerformanceEventStream(),
    );
    expect(result).toHaveProperty("snapshot");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("validationIssues");
    expect(result).not.toHaveProperty("engine");
    expect(result).not.toHaveProperty("calculators");
  });
});
