import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import { InsightBuilder } from "../builders/InsightBuilder";
import type { Insight } from "../models/Insight";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";

export interface RecoveryInsightGenerator {
  generate(options: {
    readonly recoverySnapshot: RecoverySnapshot;
    readonly generatedAt: string;
  }): readonly Insight[];
}

function recoverySeverity(
  level: RecoverySnapshot["metrics"]["status"]["level"],
): (typeof InsightSeverities)[keyof typeof InsightSeverities] {
  if (level === "high") {
    return InsightSeverities.CRITICAL;
  }
  if (level === "elevated") {
    return InsightSeverities.ELEVATED;
  }
  if (level === "moderate") {
    return InsightSeverities.NOTABLE;
  }
  return InsightSeverities.INFO;
}

/**
 * Emits deterministic recovery facts from a RecoverySnapshot.
 */
export class DefaultRecoveryInsightGenerator
  implements RecoveryInsightGenerator
{
  generate(options: {
    readonly recoverySnapshot: RecoverySnapshot;
    readonly generatedAt: string;
  }): readonly Insight[] {
    const { recoverySnapshot: snapshot, generatedAt } = options;
    const { metrics } = snapshot;
    const insights: Insight[] = [];

    insights.push(
      new InsightBuilder()
        .withId(`insight:recv:status:${snapshot.id}`)
        .withType(InsightTypes.RECOVERY)
        .withCategory(InsightCategories.RECOVERY_STATUS)
        .withSeverity(recoverySeverity(metrics.status.level))
        .withPriority(85)
        .withTitle("Recovery status")
        .withStatement(
          `Recovery status is ${metrics.status.level} (score ${metrics.status.score ?? "n/a"}).`,
        )
        .withReason({
          code: "recovery_status_observed",
          statement: "Status taken from RecoverySnapshot.metrics.status",
          attributes: Object.freeze({
            level: metrics.status.level,
            score: metrics.status.score,
          }),
        })
        .withEvidence({
          sourceType: "RecoverySnapshot",
          sourceId: snapshot.id,
          attributes: Object.freeze({
            level: metrics.status.level,
            score: metrics.status.score,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["recovery", "status"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    insights.push(
      new InsightBuilder()
        .withId(`insight:recv:fatigue:${snapshot.id}`)
        .withType(InsightTypes.RECOVERY)
        .withCategory(InsightCategories.FATIGUE)
        .withSeverity(
          metrics.fatigue.score >= 75
            ? InsightSeverities.CRITICAL
            : metrics.fatigue.score >= 50
              ? InsightSeverities.ELEVATED
              : InsightSeverities.INFO,
        )
        .withPriority(78)
        .withTitle("Fatigue score")
        .withStatement(`Fatigue score is ${metrics.fatigue.score}.`)
        .withReason({
          code: "fatigue_score_observed",
          statement: "Score taken from RecoverySnapshot.metrics.fatigue",
          attributes: Object.freeze({ fatigueScore: metrics.fatigue.score }),
        })
        .withEvidence({
          sourceType: "RecoverySnapshot",
          sourceId: snapshot.id,
          attributes: Object.freeze({
            fatigueScore: metrics.fatigue.score,
            sessionLoad: metrics.trainingLoad.sessionLoad,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["recovery", "fatigue"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    insights.push(
      new InsightBuilder()
        .withId(`insight:recv:window:${snapshot.id}`)
        .withType(InsightTypes.RECOVERY)
        .withCategory(InsightCategories.RECOVERY_WINDOW)
        .withSeverity(InsightSeverities.INFO)
        .withPriority(50)
        .withTitle("Recovery window duration")
        .withStatement(
          `Recovery window duration is ${metrics.recoveryWindow.durationHours} hours.`,
        )
        .withReason({
          code: "recovery_window_observed",
          statement:
            "Duration taken from RecoverySnapshot.metrics.recoveryWindow",
          attributes: Object.freeze({
            durationHours: metrics.recoveryWindow.durationHours,
          }),
        })
        .withEvidence({
          sourceType: "RecoverySnapshot",
          sourceId: snapshot.id,
          attributes: Object.freeze({
            durationHours: metrics.recoveryWindow.durationHours,
            startAt: metrics.recoveryWindow.startAt,
            endAt: metrics.recoveryWindow.endAt,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["recovery", "window"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    return Object.freeze(insights);
  }
}

export function createRecoveryInsightGenerator(): RecoveryInsightGenerator {
  return new DefaultRecoveryInsightGenerator();
}
