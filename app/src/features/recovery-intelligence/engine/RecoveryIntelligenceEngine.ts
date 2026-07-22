import type { RecoveryAnalysisInput } from "../models/RecoveryAnalysisInput";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryEngineResult } from "../models/RecoveryEngineResult";
import { RecoveryEngineError } from "../models/RecoveryEngineError";
import type { RecoveryIndicator } from "../models/RecoveryIndicator";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoverySummary } from "../models/RecoverySummary";
import { RecoveryMetricsBuilder } from "../builders/RecoveryMetricsBuilder";
import { RecoverySnapshotBuilder } from "../builders/RecoverySnapshotBuilder";
import { RecoverySummaryBuilder } from "../builders/RecoverySummaryBuilder";
import {
  createDensityLoadCalculator,
  createFatigueCalculator,
  createFrequencyCalculator,
  createRecoveryStatusCalculator,
  createRecoveryWindowCalculator,
  createTrainingLoadCalculator,
  DensityLoadCalculator,
  FatigueCalculator,
  FrequencyCalculator,
  RecoveryStatusCalculator,
  RecoveryWindowCalculator,
  TrainingLoadCalculator,
} from "../calculators";
import { freezeEngineResult } from "../utils/freezeSnapshots";
import { buildRecoverySummary } from "../utils/summarizeRecovery";
import {
  validateAnalysisInput,
  validateComputedMetrics,
  validateSnapshotIntegrity,
} from "../validators";

const DEFAULT_ANALYZED_AT = "2026-07-23T00:00:00.000Z";
const DEFAULT_FREQUENCY_WINDOW_DAYS = 7;

export interface RecoveryIntelligenceEngineDeps {
  readonly trainingLoadCalculator?: TrainingLoadCalculator;
  readonly densityLoadCalculator?: DensityLoadCalculator;
  readonly frequencyCalculator?: FrequencyCalculator;
  readonly fatigueCalculator?: FatigueCalculator;
  readonly recoveryWindowCalculator?: RecoveryWindowCalculator;
  readonly recoveryStatusCalculator?: RecoveryStatusCalculator;
}

/**
 * Recovery Intelligence Engine — analyzes completed training into an immutable snapshot.
 *
 * Consumes AthleteHistory + PerformanceSnapshot (+ optional WorkoutResult).
 * AchievementResult is reference metadata only.
 * No AI. No recommendations. No persistence. No networking. No predictions.
 * Never modifies upstream engines.
 */
export class RecoveryIntelligenceEngine {
  private readonly trainingLoadCalculator: TrainingLoadCalculator;
  private readonly densityLoadCalculator: DensityLoadCalculator;
  private readonly frequencyCalculator: FrequencyCalculator;
  private readonly fatigueCalculator: FatigueCalculator;
  private readonly recoveryWindowCalculator: RecoveryWindowCalculator;
  private readonly recoveryStatusCalculator: RecoveryStatusCalculator;

  constructor(deps: RecoveryIntelligenceEngineDeps = {}) {
    this.trainingLoadCalculator =
      deps.trainingLoadCalculator ?? createTrainingLoadCalculator();
    this.densityLoadCalculator =
      deps.densityLoadCalculator ?? createDensityLoadCalculator();
    this.frequencyCalculator =
      deps.frequencyCalculator ?? createFrequencyCalculator();
    this.fatigueCalculator =
      deps.fatigueCalculator ?? createFatigueCalculator();
    this.recoveryWindowCalculator =
      deps.recoveryWindowCalculator ?? createRecoveryWindowCalculator();
    this.recoveryStatusCalculator =
      deps.recoveryStatusCalculator ?? createRecoveryStatusCalculator();
  }

  /**
   * Analyze recovery from Athlete History + Performance Snapshot.
   */
  analyze(input: RecoveryAnalysisInput): RecoveryEngineResult {
    if (!input.athleteHistory) {
      throw new RecoveryEngineError(
        "missing_athlete_history",
        "AthleteHistory is required",
      );
    }
    if (!input.performanceSnapshot) {
      throw new RecoveryEngineError(
        "missing_performance_snapshot",
        "PerformanceSnapshot is required",
      );
    }

    const softIssues = [
      ...validateAnalysisInput(
        input.athleteHistory,
        input.performanceSnapshot,
        input.workoutResult,
        input.achievementResult,
      ),
    ];

    const analyzedAt = input.analyzedAt ?? DEFAULT_ANALYZED_AT;
    const frequencyWindowDays =
      input.frequencyWindowDays ?? DEFAULT_FREQUENCY_WINDOW_DAYS;
    const snapshotId =
      input.snapshotId ??
      `recv:${input.performanceSnapshot.id}:${analyzedAt}`;

    const context = this.buildContext(input, analyzedAt, frequencyWindowDays);

    const trainingLoad = this.trainingLoadCalculator.calculate({
      performanceSnapshot: input.performanceSnapshot,
      athleteHistory: input.athleteHistory,
      analyzedAt,
      frequencyWindowDays,
    });
    const densityLoad = this.densityLoadCalculator.calculate(
      input.performanceSnapshot,
    );
    const frequencyLoad = this.frequencyCalculator.calculate({
      athleteHistory: input.athleteHistory,
      analyzedAt,
      frequencyWindowDays,
    });
    const fatigue = this.fatigueCalculator.calculate({
      trainingLoad,
      densityLoad,
      frequencyLoad,
    });
    const recoveryWindow = this.recoveryWindowCalculator.calculate({
      fatigue,
      analyzedAt,
    });
    const status = this.recoveryStatusCalculator.calculate(fatigue);

    const metrics = new RecoveryMetricsBuilder()
      .withTrainingLoad(trainingLoad)
      .withFatigue(fatigue)
      .withDensityLoad(densityLoad)
      .withFrequencyLoad(frequencyLoad)
      .withRecoveryWindow(recoveryWindow)
      .withStatus(status)
      .build();

    softIssues.push(...validateComputedMetrics(metrics));

    const indicators = this.buildIndicators(metrics);
    const assessment = this.buildAssessment(
      metrics,
      indicators,
      input.performanceSnapshot.id,
      analyzedAt,
    );

    const summary = new RecoverySummaryBuilder()
      .withIds({
        snapshotId,
        athleteId: context.athleteId,
      })
      .withStatus(status.level)
      .withMetrics({
        fatigueScore: fatigue.score,
        sessionLoad: trainingLoad.sessionLoad,
        workoutsInWindow: frequencyLoad.workoutsInWindow,
        windowDurationHours: recoveryWindow.durationHours,
      })
      .build();

    const snapshot = new RecoverySnapshotBuilder()
      .withId(snapshotId)
      .withContext(context)
      .withMetrics(metrics)
      .withAssessment(assessment)
      .withSummary(summary)
      .withFrozenAt(analyzedAt)
      .build();

    softIssues.push(...validateSnapshotIntegrity(snapshot));

    return freezeEngineResult({
      snapshot,
      assessment,
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }

  /**
   * Create a RecoverySnapshot from an existing analysis result parts.
   */
  createSnapshot(
    parts: {
      readonly metrics: RecoveryEngineResult["snapshot"]["metrics"];
      readonly assessment: RecoveryAssessment;
      readonly context: RecoveryContext;
      readonly summary?: RecoverySummary;
    },
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
    } = {},
  ): RecoverySnapshot {
    const frozenAt = options.frozenAt ?? parts.context.analyzedAt;
    const snapshotId =
      options.snapshotId ??
      `recv:${parts.context.performanceSnapshotId ?? "unknown"}:${frozenAt}`;

    const summary =
      parts.summary ??
      buildRecoverySummary({
        snapshotId,
        athleteId: parts.context.athleteId,
        metrics: parts.metrics,
      });

    return new RecoverySnapshotBuilder()
      .withId(snapshotId)
      .withContext(parts.context)
      .withMetrics(parts.metrics)
      .withAssessment(parts.assessment)
      .withSummary(
        summary.snapshotId === snapshotId
          ? summary
          : new RecoverySummaryBuilder()
              .withIds({
                snapshotId,
                athleteId: parts.context.athleteId,
              })
              .withStatus(parts.metrics.status.level)
              .withMetrics({
                fatigueScore: parts.metrics.fatigue.score,
                sessionLoad: parts.metrics.trainingLoad.sessionLoad,
                workoutsInWindow: parts.metrics.frequencyLoad.workoutsInWindow,
                windowDurationHours:
                  parts.metrics.recoveryWindow.durationHours,
              })
              .build(),
      )
      .withFrozenAt(frozenAt)
      .build();
  }

  /**
   * Summarize a recovery snapshot or metrics.
   */
  summarize(
    snapshotOrMetrics:
      | RecoverySnapshot
      | {
          readonly snapshotId: string;
          readonly athleteId: string | null;
          readonly metrics: RecoveryEngineResult["snapshot"]["metrics"];
        },
  ): RecoverySummary {
    if ("summary" in snapshotOrMetrics && "id" in snapshotOrMetrics) {
      return snapshotOrMetrics.summary;
    }

    const parts = snapshotOrMetrics as {
      readonly snapshotId: string;
      readonly athleteId: string | null;
      readonly metrics: RecoveryEngineResult["snapshot"]["metrics"];
    };

    return buildRecoverySummary({
      snapshotId: parts.snapshotId,
      athleteId: parts.athleteId,
      metrics: parts.metrics,
    });
  }

  private buildContext(
    input: RecoveryAnalysisInput,
    analyzedAt: string,
    frequencyWindowDays: number,
  ): RecoveryContext {
    const history = input.athleteHistory;
    const snapshot = input.performanceSnapshot;
    const workout = input.workoutResult;
    const achievement = input.achievementResult;

    return Object.freeze({
      athleteId:
        history.athleteId ??
        snapshot.context.athleteId ??
        history.context.athleteId ??
        null,
      sessionId:
        workout?.sessionId ??
        snapshot.session.sessionId ??
        history.context.sessionId ??
        null,
      runtimeId:
        workout?.runtimeId ??
        snapshot.session.runtimeId ??
        history.context.runtimeId ??
        null,
      dayId: snapshot.context.dayId ?? history.context.dayId ?? null,
      weekNumber:
        snapshot.context.weekNumber ?? history.context.weekNumber ?? null,
      historyId: history.id,
      performanceSnapshotId: snapshot.id,
      achievementEvaluationId: achievement?.evaluationId ?? null,
      analyzedAt,
      frequencyWindowDays,
    });
  }

  private buildIndicators(
    metrics: RecoveryEngineResult["snapshot"]["metrics"],
  ): readonly RecoveryIndicator[] {
    return Object.freeze([
      Object.freeze({
        key: "session_load",
        label: "Session load",
        value: metrics.trainingLoad.sessionLoad,
        unit: "tonnage",
        attributes: Object.freeze({
          volumeLoad: metrics.trainingLoad.volumeLoad,
          loadScore: metrics.trainingLoad.loadScore,
        }),
      }),
      Object.freeze({
        key: "fatigue_score",
        label: "Fatigue score",
        value: metrics.fatigue.score,
        unit: "score",
        attributes: Object.freeze({
          loadComponent: metrics.fatigue.loadComponent,
          densityComponent: metrics.fatigue.densityComponent,
          frequencyComponent: metrics.fatigue.frequencyComponent,
        }),
      }),
      Object.freeze({
        key: "frequency",
        label: "Workouts in window",
        value: metrics.frequencyLoad.workoutsInWindow,
        unit: "count",
        attributes: Object.freeze({
          windowDays: metrics.frequencyLoad.windowDays,
          frequencyScore: metrics.frequencyLoad.frequencyScore,
        }),
      }),
      Object.freeze({
        key: "recovery_window_hours",
        label: "Recovery window",
        value: metrics.recoveryWindow.durationHours,
        unit: "hours",
        attributes: Object.freeze({
          startAt: metrics.recoveryWindow.startAt,
          endAt: metrics.recoveryWindow.endAt,
        }),
      }),
    ]);
  }

  private buildAssessment(
    metrics: RecoveryEngineResult["snapshot"]["metrics"],
    indicators: readonly RecoveryIndicator[],
    performanceSnapshotId: string,
    assessedAt: string,
  ): RecoveryAssessment {
    return Object.freeze({
      status: metrics.status,
      metrics,
      indicators,
      evidence: Object.freeze({
        sourceType: "PerformanceSnapshot",
        sourceId: performanceSnapshotId,
        attributes: Object.freeze({
          fatigueScore: metrics.fatigue.score,
          sessionLoad: metrics.trainingLoad.sessionLoad,
          status: metrics.status.level,
        }),
      }),
      assessedAt,
    });
  }
}

export function createRecoveryIntelligenceEngine(
  deps?: RecoveryIntelligenceEngineDeps,
): RecoveryIntelligenceEngine {
  return new RecoveryIntelligenceEngine(deps);
}
