import { analyzeWorkoutPerformance } from "../../performance-engine/application";
import {
  createCompletedWorkoutResult,
  createPerformanceEventStream,
  FIXED_TIMESTAMP as PERF_TS,
} from "../../performance-engine/testSupport/fixtures";
import { evaluateAchievements } from "../../achievement-engine/application";
import {
  createLowBaselineProvider,
  FIXED_TIMESTAMP as ACH_TS,
} from "../../achievement-engine/testSupport/fixtures";
import { buildAthleteHistory, summarizeHistory } from "../application";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-history integration", () => {
  it("consumes WorkoutResult + PerformanceSnapshot + AchievementResult without mutating them", () => {
    const workoutResult = createCompletedWorkoutResult();
    const eventStream = createPerformanceEventStream();
    const performance = analyzeWorkoutPerformance(workoutResult, eventStream, {
      analyzedAt: PERF_TS,
    });
    const achievements = evaluateAchievements(
      performance.snapshot,
      workoutResult,
      createLowBaselineProvider(),
      { evaluatedAt: ACH_TS },
    );

    const frozenWorkout = Object.isFrozen(workoutResult);
    const frozenSnapshot = Object.isFrozen(performance.snapshot);
    const frozenAchievements = Object.isFrozen(achievements.result);

    const historyResult = buildAthleteHistory({
      workoutResult,
      performanceSnapshot: performance.snapshot,
      achievementResult: achievements.result,
      eventStream,
      builtAt: FIXED_TIMESTAMP,
    });

    expect(frozenWorkout).toBe(true);
    expect(frozenSnapshot).toBe(true);
    expect(frozenAchievements).toBe(true);
    expect(Object.isFrozen(workoutResult)).toBe(true);
    expect(Object.isFrozen(performance.snapshot)).toBe(true);
    expect(Object.isFrozen(achievements.result)).toBe(true);

    expect(historyResult.history.entries.some((e) => e.type === HistoryEntryTypes.WORKOUT)).toBe(
      true,
    );
    expect(
      historyResult.history.entries.some(
        (e) => e.type === HistoryEntryTypes.PERFORMANCE,
      ),
    ).toBe(true);
    expect(
      historyResult.history.entries.some(
        (e) => e.type === HistoryEntryTypes.ACHIEVEMENT,
      ),
    ).toBe(true);
    expect(historyResult.summary.achievementCount).toBeGreaterThan(0);
  });

  it("treats DomainEventStream as optional architecture reference", () => {
    const workoutResult = createCompletedWorkoutResult();
    const performance = analyzeWorkoutPerformance(
      workoutResult,
      createPerformanceEventStream(),
      { analyzedAt: PERF_TS },
    );

    const withoutStream = buildAthleteHistory({
      workoutResult,
      performanceSnapshot: performance.snapshot,
      builtAt: FIXED_TIMESTAMP,
    });
    const withStream = buildAthleteHistory({
      workoutResult,
      performanceSnapshot: performance.snapshot,
      eventStream: createPerformanceEventStream(),
      builtAt: FIXED_TIMESTAMP,
    });

    expect(withoutStream.history.entryCount).toBe(withStream.history.entryCount);
    expect(withStream.history.context.eventStreamId).toBe("stream-1");
  });

  it("summarizeHistory works on integration output", () => {
    const workoutResult = createCompletedWorkoutResult();
    const performance = analyzeWorkoutPerformance(
      workoutResult,
      createPerformanceEventStream(),
      { analyzedAt: PERF_TS },
    );
    const { history } = buildAthleteHistory({
      workoutResult,
      performanceSnapshot: performance.snapshot,
      builtAt: FIXED_TIMESTAMP,
    });
    const summary = summarizeHistory(history);
    expect(summary.entryCount).toBe(history.entryCount);
  });
});
