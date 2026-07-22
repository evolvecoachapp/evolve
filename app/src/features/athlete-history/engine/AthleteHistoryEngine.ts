import type { HistoryBuildInput } from "../models/HistoryBuildInput";
import type { HistoryContext } from "../models/HistoryContext";
import type { HistoryEngineResult } from "../models/HistoryEngineResult";
import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySnapshot } from "../models/HistorySnapshot";
import type { HistorySummary } from "../models/HistorySummary";
import { AthleteHistoryBuilder } from "../builders/AthleteHistoryBuilder";
import { HistorySnapshotBuilder } from "../builders/HistorySnapshotBuilder";
import {
  AchievementAggregator,
  createAchievementAggregator,
  createHistoryStatisticsAggregator,
  createPerformanceAggregator,
  createSummaryAggregator,
  createWorkoutAggregator,
  HistoryStatisticsAggregator,
  PerformanceAggregator,
  SummaryAggregator,
  WorkoutAggregator,
} from "../aggregators";
import { freezeEngineResult } from "../utils/freezeHistory";
import { normalizeHistoryEntries } from "../utils/normalizeHistory";
import {
  validateBuildInput,
  validateHistoryEntries,
  validateSnapshotConsistency,
} from "../validators";

const DEFAULT_BUILT_AT = "2026-07-23T00:00:00.000Z";

export interface AthleteHistoryEngineDeps {
  readonly workoutAggregator?: WorkoutAggregator;
  readonly performanceAggregator?: PerformanceAggregator;
  readonly achievementAggregator?: AchievementAggregator;
  readonly statisticsAggregator?: HistoryStatisticsAggregator;
  readonly summaryAggregator?: SummaryAggregator;
}

/**
 * Athlete History Engine — builds immutable chronological athlete history.
 *
 * Consumes WorkoutResult, PerformanceSnapshot, AchievementResult.
 * DomainEventStream is optional architecture reference only.
 * No persistence. No AI. No networking. No querying/filtering engine. No UI.
 * Never modifies upstream engines.
 */
export class AthleteHistoryEngine {
  private readonly workoutAggregator: WorkoutAggregator;
  private readonly performanceAggregator: PerformanceAggregator;
  private readonly achievementAggregator: AchievementAggregator;
  private readonly statisticsAggregator: HistoryStatisticsAggregator;
  private readonly summaryAggregator: SummaryAggregator;

  constructor(deps: AthleteHistoryEngineDeps = {}) {
    this.workoutAggregator =
      deps.workoutAggregator ?? createWorkoutAggregator();
    this.performanceAggregator =
      deps.performanceAggregator ?? createPerformanceAggregator();
    this.achievementAggregator =
      deps.achievementAggregator ?? createAchievementAggregator();
    this.statisticsAggregator =
      deps.statisticsAggregator ?? createHistoryStatisticsAggregator();
    this.summaryAggregator =
      deps.summaryAggregator ?? createSummaryAggregator();
  }

  /**
   * Build immutable AthleteHistory + HistorySnapshot + summary.
   */
  build(input: HistoryBuildInput): HistoryEngineResult {
    const softIssues = [
      ...validateBuildInput(
        input.workoutResult,
        input.performanceSnapshot,
        input.achievementResult,
      ),
    ];

    const builtAt = input.builtAt ?? DEFAULT_BUILT_AT;
    const athleteId =
      input.athleteId ??
      input.performanceSnapshot?.context.athleteId ??
      null;

    const historyId =
      input.historyId ??
      `hist:${input.workoutResult?.runtimeId ?? input.performanceSnapshot?.session.runtimeId ?? "unknown"}:${builtAt}`;

    const snapshotId = input.snapshotId ?? `hsnap:${historyId}`;

    const context = this.buildContext(input, athleteId, builtAt);
    const entries = this.collectEntries(input, context, builtAt);
    softIssues.push(...validateHistoryEntries(entries));

    const history = new AthleteHistoryBuilder()
      .withId(historyId)
      .withAthleteId(athleteId)
      .withEntries(entries)
      .withContext(context)
      .withBuiltAt(builtAt)
      .withFrozenAt(builtAt)
      .build();

    const summary = this.summaryAggregator.aggregate(
      historyId,
      athleteId,
      history.entries,
    );
    const statistics = this.statisticsAggregator.aggregate(history.entries);

    const snapshot = new HistorySnapshotBuilder()
      .withId(snapshotId)
      .withHistoryId(historyId)
      .withAthleteId(athleteId)
      .withEntries(history.entries)
      .withStatistics(statistics)
      .withSummary(summary)
      .withCreatedAt(builtAt)
      .withFrozenAt(builtAt)
      .build();

    softIssues.push(...validateSnapshotConsistency(history, snapshot));

    return freezeEngineResult({
      history,
      snapshot,
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }

  /**
   * Create a HistorySnapshot from an existing AthleteHistory.
   */
  createSnapshot(
    history: HistoryEngineResult["history"],
    options: {
      readonly snapshotId?: string;
      readonly createdAt?: string;
    } = {},
  ): HistorySnapshot {
    const createdAt = options.createdAt ?? history.frozenAt;
    const snapshotId = options.snapshotId ?? `hsnap:${history.id}:${createdAt}`;
    const summary = this.summaryAggregator.aggregate(
      history.id,
      history.athleteId,
      history.entries,
    );
    const statistics = this.statisticsAggregator.aggregate(history.entries);

    return new HistorySnapshotBuilder()
      .withId(snapshotId)
      .withHistoryId(history.id)
      .withAthleteId(history.athleteId)
      .withEntries(history.entries)
      .withStatistics(statistics)
      .withSummary(summary)
      .withCreatedAt(createdAt)
      .withFrozenAt(createdAt)
      .build();
  }

  /**
   * Summarize an AthleteHistory or entry list.
   */
  summarize(
    historyId: string,
    athleteId: string | null,
    entries: readonly HistoryEntry[],
  ): HistorySummary {
    return this.summaryAggregator.aggregate(historyId, athleteId, entries);
  }

  private buildContext(
    input: HistoryBuildInput,
    athleteId: string | null,
    builtAt: string,
  ): HistoryContext {
    const workout = input.workoutResult;
    const snapshot = input.performanceSnapshot;
    const achievement = input.achievementResult;
    const stream = input.eventStream;

    return Object.freeze({
      athleteId,
      sessionId:
        workout?.sessionId ??
        snapshot?.session.sessionId ??
        achievement?.sessionId ??
        stream?.sessionId ??
        null,
      runtimeId:
        workout?.runtimeId ??
        snapshot?.session.runtimeId ??
        achievement?.runtimeId ??
        null,
      dayId: snapshot?.context.dayId ?? null,
      weekNumber: snapshot?.context.weekNumber ?? null,
      eventStreamId: stream?.id ?? snapshot?.context.eventStreamId ?? null,
      performanceSnapshotId: snapshot?.id ?? achievement?.performanceSnapshotId ?? null,
      achievementEvaluationId: achievement?.evaluationId ?? null,
      builtAt,
    });
  }

  private collectEntries(
    input: HistoryBuildInput,
    context: HistoryContext,
    frozenAt: string,
  ): readonly HistoryEntry[] {
    const collected: HistoryEntry[] = [];

    if (input.workoutResult) {
      collected.push(
        this.workoutAggregator.aggregate(
          input.workoutResult,
          context,
          frozenAt,
        ),
      );
    }

    if (input.performanceSnapshot) {
      collected.push(
        this.performanceAggregator.aggregate(
          input.performanceSnapshot,
          context,
          frozenAt,
        ),
      );
    }

    if (input.achievementResult) {
      collected.push(
        ...this.achievementAggregator.aggregate(
          input.achievementResult,
          context,
          frozenAt,
        ),
      );
    }

    return normalizeHistoryEntries(collected);
  }
}

export function createAthleteHistoryEngine(
  deps?: AthleteHistoryEngineDeps,
): AthleteHistoryEngine {
  return new AthleteHistoryEngine(deps);
}
