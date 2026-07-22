import type { InsightAnalysisInput } from "../models/InsightAnalysisInput";
import type { InsightCollection } from "../models/InsightCollection";
import type { InsightContext } from "../models/InsightContext";
import type { InsightEngineResult } from "../models/InsightEngineResult";
import { InsightEngineError } from "../models/InsightEngineError";
import type { InsightSnapshot } from "../models/InsightSnapshot";
import type { InsightSummary } from "../models/InsightSummary";
import { InsightSnapshotBuilder } from "../builders/InsightSnapshotBuilder";
import { InsightSummaryBuilder } from "../builders/InsightSummaryBuilder";
import {
  AchievementInsightGenerator,
  createAchievementInsightGenerator,
  createHistoryInsightGenerator,
  createPerformanceInsightGenerator,
  createRecoveryInsightGenerator,
  createSummaryInsightGenerator,
  HistoryInsightGenerator,
  PerformanceInsightGenerator,
  RecoveryInsightGenerator,
  SummaryInsightGenerator,
} from "../generators";
import { aggregateInsights } from "../utils/aggregateInsights";
import { freezeEngineResult } from "../utils/freezeSnapshots";
import { buildInsightSummary } from "../utils/summarizeInsights";
import {
  validateAnalysisInput,
  validateSnapshotIntegrity,
} from "../validators";

const DEFAULT_GENERATED_AT = "2026-07-23T00:00:00.000Z";

export interface InsightEngineDeps {
  readonly performanceInsightGenerator?: PerformanceInsightGenerator;
  readonly achievementInsightGenerator?: AchievementInsightGenerator;
  readonly recoveryInsightGenerator?: RecoveryInsightGenerator;
  readonly historyInsightGenerator?: HistoryInsightGenerator;
  readonly summaryInsightGenerator?: SummaryInsightGenerator;
}

/**
 * Insight Engine — aggregates deterministic domain facts into an immutable snapshot.
 *
 * Consumes PerformanceSnapshot + AchievementResult + RecoverySnapshot + AthleteHistory.
 * No AI. No recommendations. No persistence. No networking. No LLM. No conversation.
 * Never modifies upstream engines.
 */
export class InsightEngine {
  private readonly performanceInsightGenerator: PerformanceInsightGenerator;
  private readonly achievementInsightGenerator: AchievementInsightGenerator;
  private readonly recoveryInsightGenerator: RecoveryInsightGenerator;
  private readonly historyInsightGenerator: HistoryInsightGenerator;
  private readonly summaryInsightGenerator: SummaryInsightGenerator;

  constructor(deps: InsightEngineDeps = {}) {
    this.performanceInsightGenerator =
      deps.performanceInsightGenerator ?? createPerformanceInsightGenerator();
    this.achievementInsightGenerator =
      deps.achievementInsightGenerator ?? createAchievementInsightGenerator();
    this.recoveryInsightGenerator =
      deps.recoveryInsightGenerator ?? createRecoveryInsightGenerator();
    this.historyInsightGenerator =
      deps.historyInsightGenerator ?? createHistoryInsightGenerator();
    this.summaryInsightGenerator =
      deps.summaryInsightGenerator ?? createSummaryInsightGenerator();
  }

  /**
   * Generate deterministic insights from upstream domain snapshots.
   */
  generate(input: InsightAnalysisInput): InsightEngineResult {
    if (!input.performanceSnapshot) {
      throw new InsightEngineError(
        "missing_performance_snapshot",
        "PerformanceSnapshot is required",
      );
    }
    if (!input.achievementResult) {
      throw new InsightEngineError(
        "missing_achievement_result",
        "AchievementResult is required",
      );
    }
    if (!input.recoverySnapshot) {
      throw new InsightEngineError(
        "missing_recovery_snapshot",
        "RecoverySnapshot is required",
      );
    }
    if (!input.athleteHistory) {
      throw new InsightEngineError(
        "missing_athlete_history",
        "AthleteHistory is required",
      );
    }

    const softIssues = [
      ...validateAnalysisInput(
        input.performanceSnapshot,
        input.achievementResult,
        input.recoverySnapshot,
        input.athleteHistory,
      ),
    ];

    const generatedAt = input.generatedAt ?? DEFAULT_GENERATED_AT;
    const snapshotId =
      input.snapshotId ??
      `insight:${input.performanceSnapshot.id}:${generatedAt}`;

    const context = this.buildContext(input, generatedAt);

    const domainInsights = [
      ...this.performanceInsightGenerator.generate({
        performanceSnapshot: input.performanceSnapshot,
        generatedAt,
      }),
      ...this.achievementInsightGenerator.generate({
        achievementResult: input.achievementResult,
        generatedAt,
      }),
      ...this.recoveryInsightGenerator.generate({
        recoverySnapshot: input.recoverySnapshot,
        generatedAt,
      }),
      ...this.historyInsightGenerator.generate({
        athleteHistory: input.athleteHistory,
        generatedAt,
      }),
    ];

    const summaryInsights = this.summaryInsightGenerator.generate({
      insights: domainInsights,
      snapshotId,
      generatedAt,
    });

    const collection = aggregateInsights([
      ...domainInsights,
      ...summaryInsights,
    ]);

    const summary = buildInsightSummary({
      snapshotId,
      athleteId: context.athleteId,
      collection,
    });

    const snapshot = new InsightSnapshotBuilder()
      .withId(snapshotId)
      .withContext(context)
      .withCollection(collection)
      .withSummary(summary)
      .withFrozenAt(generatedAt)
      .build();

    softIssues.push(...validateSnapshotIntegrity(snapshot));

    return freezeEngineResult({
      snapshot,
      collection,
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }

  /**
   * Create an InsightSnapshot from an existing collection + context.
   */
  createSnapshot(
    parts: {
      readonly collection: InsightCollection;
      readonly context: InsightContext;
      readonly summary?: InsightSummary;
    },
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
    } = {},
  ): InsightSnapshot {
    const frozenAt = options.frozenAt ?? parts.context.generatedAt;
    const snapshotId =
      options.snapshotId ??
      `insight:${parts.context.performanceSnapshotId ?? "unknown"}:${frozenAt}`;

    const summary =
      parts.summary ??
      buildInsightSummary({
        snapshotId,
        athleteId: parts.context.athleteId,
        collection: parts.collection,
      });

    return new InsightSnapshotBuilder()
      .withId(snapshotId)
      .withContext(parts.context)
      .withCollection(parts.collection)
      .withSummary(
        summary.snapshotId === snapshotId
          ? summary
          : new InsightSummaryBuilder()
              .withIds({
                snapshotId,
                athleteId: parts.context.athleteId,
              })
              .withInsightCount(parts.collection.count)
              .withCountsByType(parts.collection.countsByType)
              .withHighestSeverity(summary.highestSeverity)
              .withTopInsightIds(summary.topInsightIds)
              .withSummaryText(summary.summaryText)
              .build(),
      )
      .withFrozenAt(frozenAt)
      .build();
  }

  /**
   * Summarize an insight snapshot or collection parts.
   */
  summarize(
    snapshotOrParts:
      | InsightSnapshot
      | {
          readonly snapshotId: string;
          readonly athleteId: string | null;
          readonly collection: InsightCollection;
        },
  ): InsightSummary {
    if ("summary" in snapshotOrParts && "id" in snapshotOrParts) {
      return snapshotOrParts.summary;
    }

    const parts = snapshotOrParts as {
      readonly snapshotId: string;
      readonly athleteId: string | null;
      readonly collection: InsightCollection;
    };

    return buildInsightSummary({
      snapshotId: parts.snapshotId,
      athleteId: parts.athleteId,
      collection: parts.collection,
    });
  }

  private buildContext(
    input: InsightAnalysisInput,
    generatedAt: string,
  ): InsightContext {
    const performance = input.performanceSnapshot;
    const achievement = input.achievementResult;
    const recovery = input.recoverySnapshot;
    const history = input.athleteHistory;

    return Object.freeze({
      athleteId:
        history.athleteId ??
        performance.context.athleteId ??
        recovery.context.athleteId ??
        history.context.athleteId ??
        null,
      sessionId:
        achievement.sessionId ??
        performance.session.sessionId ??
        recovery.context.sessionId ??
        history.context.sessionId ??
        null,
      runtimeId:
        achievement.runtimeId ??
        performance.session.runtimeId ??
        recovery.context.runtimeId ??
        history.context.runtimeId ??
        null,
      dayId:
        performance.context.dayId ??
        recovery.context.dayId ??
        history.context.dayId ??
        null,
      weekNumber:
        performance.context.weekNumber ??
        recovery.context.weekNumber ??
        history.context.weekNumber ??
        null,
      performanceSnapshotId: performance.id,
      achievementEvaluationId: achievement.evaluationId,
      recoverySnapshotId: recovery.id,
      historyId: history.id,
      generatedAt,
    });
  }
}

export function createInsightEngine(deps?: InsightEngineDeps): InsightEngine {
  return new InsightEngine(deps);
}
