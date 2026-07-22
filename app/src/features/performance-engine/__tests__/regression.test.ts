import {
  analyzeWorkoutPerformance,
  gradePerformance,
  summarizePerformance,
} from "../application";
import { PerformanceEngine } from "../engine/PerformanceEngine";
import { PerformanceMetricsBuilder } from "../builders/PerformanceMetricsBuilder";
import { PerformanceSummaryBuilder } from "../builders/PerformanceSummaryBuilder";
import { PerformanceSnapshotBuilder } from "../builders/PerformanceSnapshotBuilder";
import {
  createCompletedWorkoutResult,
  createPerformanceEventStream,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("performance-engine regression", () => {
  it("keeps single-session trend placeholder stable", () => {
    const { snapshot } = analyzeWorkoutPerformance(
      createCompletedWorkoutResult(),
      createPerformanceEventStream(),
      { analyzedAt: FIXED_TIMESTAMP },
    );

    expect(snapshot.trend).toEqual({
      available: false,
      sessionCount: 1,
      message: "single_session_only",
    });
  });

  it("produces deterministic snapshots for identical inputs", () => {
    const input = {
      workoutResult: createCompletedWorkoutResult(),
      eventStream: createPerformanceEventStream(),
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "perf:deterministic",
    };

    const a = new PerformanceEngine().analyze(input);
    const b = new PerformanceEngine().analyze(input);

    expect(a.snapshot).toEqual(b.snapshot);
    expect(a.summary).toEqual(b.summary);
  });

  it("builders compose a frozen snapshot", () => {
    const metrics = new PerformanceMetricsBuilder()
      .withVolume({
        tonnage: 100,
        volumeLoad: 100,
        totalCompletedSets: 1,
        totalCompletedRepetitions: 5,
        loadedSetCount: 1,
        unloadedSetCount: 0,
      })
      .withIntensity({
        averageWeight: 100,
        averageRepetitions: 5,
        averageRpe: 8,
        averageRir: 2,
        maxWeight: 100,
        maxRpe: 8,
        weightSampleCount: 1,
        rpeSampleCount: 1,
        rirSampleCount: 1,
      })
      .withDensity({
        durationMs: 60_000,
        durationMinutes: 1,
        tonnagePerMinute: 100,
        setsPerMinute: 1,
        repetitionsPerMinute: 5,
      })
      .withCompletion({
        totalExercises: 1,
        completedExercises: 1,
        skippedExercises: 0,
        totalSets: 1,
        completedSets: 1,
        skippedSets: 0,
        exerciseCompletionPercent: 100,
        setCompletionPercent: 100,
        workoutCompletionPercent: 100,
      })
      .build();

    const summary = new PerformanceSummaryBuilder()
      .withIds({
        snapshotId: "snap-1",
        sessionId: "session-1",
        runtimeId: "runtime-1",
      })
      .withGrade("A")
      .withMetrics({
        workoutCompletionPercent: 100,
        tonnage: 100,
        totalCompletedSets: 1,
        totalCompletedRepetitions: 5,
        durationMs: 60_000,
      })
      .build();

    const snapshot = new PerformanceSnapshotBuilder()
      .withId("snap-1")
      .withContext({
        sessionId: "session-1",
        runtimeId: "runtime-1",
        athleteId: null,
        dayId: null,
        weekNumber: null,
        decisionReportId: null,
        eventStreamId: "stream-1",
        eventCount: 1,
        analyzedAt: FIXED_TIMESTAMP,
      })
      .withSession({
        sessionId: "session-1",
        runtimeId: "runtime-1",
        finalState: "Completed",
        grade: "A",
        metrics,
        startedAt: FIXED_TIMESTAMP,
        completedAt: FIXED_TIMESTAMP,
        durationMs: 60_000,
      })
      .withMetrics(metrics)
      .withExercises([])
      .withMovements([])
      .withGrade("A")
      .withSummary(summary)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(summarizePerformance(snapshot).grade).toBe("A");
    expect(gradePerformance(snapshot)).toBe("A");
  });

  it("never invents multi-session history fields", () => {
    const { snapshot } = analyzeWorkoutPerformance(
      createCompletedWorkoutResult(),
      createPerformanceEventStream(),
    );

    expect(snapshot).not.toHaveProperty("history");
    expect(snapshot).not.toHaveProperty("personalRecords");
    expect(snapshot).not.toHaveProperty("recommendations");
    expect(snapshot.trend.sessionCount).toBe(1);
  });
});
