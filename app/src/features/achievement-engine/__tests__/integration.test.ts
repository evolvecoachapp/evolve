import { analyzeWorkoutPerformance } from "../../performance-engine/application";
import {
  createCompletedWorkoutResult,
  createPerformanceEventStream,
  FIXED_TIMESTAMP as PERF_TS,
} from "../../performance-engine/testSupport/fixtures";
import { evaluateAchievements } from "../application";
import {
  createLowBaselineProvider,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("achievement-engine integration", () => {
  it("consumes PerformanceSnapshot + WorkoutResult without mutating them", () => {
    const workoutResult = createCompletedWorkoutResult();
    const eventStream = createPerformanceEventStream();
    const performance = analyzeWorkoutPerformance(workoutResult, eventStream, {
      analyzedAt: PERF_TS,
    });

    const frozenSnapshotBefore = Object.isFrozen(performance.snapshot);
    const engineResult = evaluateAchievements(
      performance.snapshot,
      workoutResult,
      createLowBaselineProvider(),
      { evaluatedAt: FIXED_TIMESTAMP },
    );

    expect(frozenSnapshotBefore).toBe(true);
    expect(Object.isFrozen(performance.snapshot)).toBe(true);
    expect(engineResult.result.performanceSnapshotId).toBe(
      performance.snapshot.id,
    );
    expect(engineResult.result.sessionId).toBe(workoutResult.sessionId);
    expect(engineResult.result.personalRecords.length).toBeGreaterThan(0);
  });

  it("does not require DomainEventStream at runtime (reference only)", () => {
    const workoutResult = createCompletedWorkoutResult();
    const performance = analyzeWorkoutPerformance(
      workoutResult,
      createPerformanceEventStream(),
      { analyzedAt: PERF_TS },
    );

    const result = evaluateAchievements(
      performance.snapshot,
      workoutResult,
      createLowBaselineProvider(),
    );

    expect(result.result.events.every((e) => e.sessionId === "session-1")).toBe(
      true,
    );
  });
});
