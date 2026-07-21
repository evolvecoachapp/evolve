import type { CoachInsight } from "../models/CoachInsight";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import type { RiskFlag } from "../models/RiskFlag";
import type { TrainingTrend } from "../models/TrainingTrend";
import type { ProgressStatus } from "../models/ProgressStatus";
import type { RecoveryStatus } from "../models/RecoveryStatus";

export interface BuildRecommendationsInput {
  readonly insights: readonly CoachInsight[];
  readonly risks: readonly RiskFlag[];
  readonly volumeTrend: TrainingTrend;
  readonly frequencyTrend: TrainingTrend;
  readonly recovery: RecoveryStatus;
  readonly progress: ProgressStatus;
  readonly consistencyScore: number;
}

/**
 * Map structured signals to deterministic recommendation codes.
 */
export function buildRecommendations(
  input: BuildRecommendationsInput,
): readonly CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];
  const insightIds = (kind: CoachInsight["kind"]): readonly string[] =>
    input.insights.filter((insight) => insight.kind === kind).map((i) => i.id);

  const hasRisk = (code: RiskFlag["code"]): boolean =>
    input.risks.some((risk) => risk.code === code);

  if (
    hasRisk("long_inactivity") ||
    input.insights.some((insight) => insight.kind === "inactivity")
  ) {
    recommendations.push(
      Object.freeze({
        code: "return_to_training" as const,
        priority: "high" as const,
        relatedInsightIds: insightIds("inactivity"),
      }),
    );
  }

  if (
    hasRisk("elevated_fatigue") ||
    input.recovery.level === "high" ||
    hasRisk("volume_spike")
  ) {
    recommendations.push(
      Object.freeze({
        code: "deload" as const,
        priority: "high" as const,
        relatedInsightIds: [
          ...insightIds("fatigue"),
          ...insightIds("recovery_risk"),
        ],
      }),
    );
  } else if (hasRisk("high_frequency")) {
    recommendations.push(
      Object.freeze({
        code: "reduce_volume" as const,
        priority: "medium" as const,
        relatedInsightIds: insightIds("frequency_trend"),
      }),
    );
  } else if (input.volumeTrend.direction === "decreasing") {
    recommendations.push(
      Object.freeze({
        code: "increase_volume" as const,
        priority: "medium" as const,
        relatedInsightIds: insightIds("volume_trend"),
      }),
    );
  }

  if (input.consistencyScore >= 0.7 && input.frequencyTrend.direction === "stable") {
    recommendations.push(
      Object.freeze({
        code: "maintain_consistency" as const,
        priority: "low" as const,
        relatedInsightIds: insightIds("training_consistency"),
      }),
    );
  }

  if (input.progress.recentPRCount > 0) {
    recommendations.push(
      Object.freeze({
        code: "progress_load" as const,
        priority: "medium" as const,
        relatedInsightIds: insightIds("recent_pr"),
      }),
    );
  }

  if (input.progress.plateauExerciseCount > 0 || hasRisk("exercise_stagnation")) {
    recommendations.push(
      Object.freeze({
        code: "vary_exercises" as const,
        priority: "medium" as const,
        relatedInsightIds: insightIds("exercise_plateau"),
      }),
    );
  }

  return Object.freeze(recommendations);
}
