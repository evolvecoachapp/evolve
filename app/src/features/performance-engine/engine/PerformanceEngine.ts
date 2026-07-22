import type { PerformanceAnalysisInput } from "../models/PerformanceAnalysisInput";
import type { PerformanceEngineResult } from "../models/PerformanceEngineResult";
import type { PerformanceContext } from "../models/PerformanceContext";
import type { SessionPerformance } from "../models/SessionPerformance";
import { CompletionCalculator } from "../calculators/CompletionCalculator";
import { DensityCalculator } from "../calculators/DensityCalculator";
import { DurationCalculator } from "../calculators/DurationCalculator";
import { IntensityCalculator } from "../calculators/IntensityCalculator";
import { VolumeCalculator } from "../calculators/VolumeCalculator";
import { PerformanceMetricsBuilder } from "../builders/PerformanceMetricsBuilder";
import { PerformanceSnapshotBuilder } from "../builders/PerformanceSnapshotBuilder";
import { PerformanceSummaryBuilder } from "../builders/PerformanceSummaryBuilder";
import {
  validateAnalysisInput,
  validateComputedMetrics,
  validateNoDivisionByZero,
} from "../validators";
import {
  aggregateExercisePerformance,
  aggregateMovements,
  extractCompletedSets,
  extractExerciseLifecycle,
  freezeEngineResult,
  gradeFromMetrics,
  resolveEndedAt,
} from "../utils";

const DEFAULT_ANALYZED_AT = "2026-07-22T00:00:00.000Z";

/**
 * Performance Engine — analyzes a completed workout into an immutable snapshot.
 *
 * Single-session only. No AI. No persistence. No networking. No history.
 * Never modifies workout execution or program generation.
 */
export class PerformanceEngine {
  constructor(
    private readonly volumeCalculator: VolumeCalculator = new VolumeCalculator(),
    private readonly intensityCalculator: IntensityCalculator = new IntensityCalculator(),
    private readonly densityCalculator: DensityCalculator = new DensityCalculator(),
    private readonly completionCalculator: CompletionCalculator = new CompletionCalculator(),
    private readonly durationCalculator: DurationCalculator = new DurationCalculator(),
  ) {}

  /**
   * Analyze a completed workout from WorkoutResult + EventStream.
   */
  analyze(input: PerformanceAnalysisInput): PerformanceEngineResult {
    const { workoutResult, eventStream, decisionReport } = input;
    const softIssues = [
      ...validateAnalysisInput(workoutResult, eventStream),
    ];

    const analyzedAt = input.analyzedAt ?? DEFAULT_ANALYZED_AT;
    const snapshotId =
      input.snapshotId ?? `perf:${workoutResult.runtimeId}:${analyzedAt}`;

    const setSamples = extractCompletedSets(eventStream);
    const exerciseSamples = extractExerciseLifecycle(eventStream);

    const volume = this.volumeCalculator.calculate(setSamples);
    const intensity = this.intensityCalculator.calculate(setSamples);
    const completion = this.completionCalculator.calculate(workoutResult);

    const endedAt = resolveEndedAt(workoutResult);
    const durationMs = this.durationCalculator.calculateMs(
      workoutResult.startedAt,
      endedAt,
    );
    const density = this.densityCalculator.calculate({
      durationMs,
      tonnage: volume.tonnage,
      completedSets: volume.totalCompletedSets,
      completedRepetitions: volume.totalCompletedRepetitions,
    });

    const metrics = new PerformanceMetricsBuilder()
      .withVolume(volume)
      .withIntensity(intensity)
      .withDensity(density)
      .withCompletion(completion)
      .build();

    softIssues.push(...validateComputedMetrics(metrics));
    softIssues.push(...validateNoDivisionByZero(metrics));

    const grade = gradeFromMetrics(metrics, workoutResult.finalState);

    const exercises = aggregateExercisePerformance(
      setSamples,
      exerciseSamples,
      workoutResult.completedExerciseIds,
      workoutResult.skippedExerciseIds,
    );
    const movements = aggregateMovements(exercises);

    const context: PerformanceContext = Object.freeze({
      sessionId: workoutResult.sessionId,
      runtimeId: workoutResult.runtimeId,
      athleteId:
        eventStream.events.find((event) => event.context.athleteId)?.context
          .athleteId ?? null,
      dayId:
        eventStream.events.find((event) => event.context.dayId)?.context
          .dayId ?? null,
      weekNumber:
        eventStream.events.find((event) => event.context.weekNumber !== null)
          ?.context.weekNumber ?? null,
      decisionReportId: decisionReport?.reportId ?? null,
      eventStreamId: eventStream.id,
      eventCount: eventStream.eventCount,
      analyzedAt,
    });

    const session: SessionPerformance = Object.freeze({
      sessionId: workoutResult.sessionId,
      runtimeId: workoutResult.runtimeId,
      finalState: workoutResult.finalState,
      grade,
      metrics,
      startedAt: workoutResult.startedAt,
      completedAt: endedAt,
      durationMs,
    });

    const summary = new PerformanceSummaryBuilder()
      .withIds({
        snapshotId,
        sessionId: workoutResult.sessionId,
        runtimeId: workoutResult.runtimeId,
      })
      .withGrade(grade)
      .withMetrics({
        workoutCompletionPercent: metrics.completion.workoutCompletionPercent,
        tonnage: metrics.volume.tonnage,
        totalCompletedSets: metrics.volume.totalCompletedSets,
        totalCompletedRepetitions: metrics.volume.totalCompletedRepetitions,
        durationMs: metrics.density.durationMs,
      })
      .build();

    const snapshot = new PerformanceSnapshotBuilder()
      .withId(snapshotId)
      .withContext(context)
      .withSession(session)
      .withMetrics(metrics)
      .withExercises(exercises)
      .withMovements(movements)
      .withGrade(grade)
      .withSummary(summary)
      .withFrozenAt(analyzedAt)
      .build();

    return freezeEngineResult({
      snapshot,
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }
}

export function createPerformanceEngine(): PerformanceEngine {
  return new PerformanceEngine();
}
