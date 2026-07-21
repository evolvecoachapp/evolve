import type { CoachInsight } from "../models/CoachInsight";
import type { ProgressStatus } from "../models/ProgressStatus";
import type { RecoveryStatus } from "../models/RecoveryStatus";
import type { RiskFlag } from "../models/RiskFlag";
import type { TrainingTrend } from "../models/TrainingTrend";
import type { CoachSummary } from "../models/CoachSummary";

export interface BuildCoachSummaryInput {
  readonly volumeTrend: TrainingTrend;
  readonly frequencyTrend: TrainingTrend;
  readonly recovery: RecoveryStatus;
  readonly progress: ProgressStatus;
  readonly consistencyScore: number;
  readonly insights: readonly CoachInsight[];
  readonly risks: readonly RiskFlag[];
  readonly recommendationCount: number;
  readonly generatedAt: string;
}

/** Assemble the top-level coach summary from structured signals. */
export function buildCoachSummary(
  input: BuildCoachSummaryInput,
): CoachSummary {
  return Object.freeze({
    volumeTrend: input.volumeTrend,
    frequencyTrend: input.frequencyTrend,
    recovery: input.recovery,
    progress: input.progress,
    consistencyScore: input.consistencyScore,
    insightCount: input.insights.length,
    riskCount: input.risks.length,
    recommendationCount: input.recommendationCount,
    generatedAt: input.generatedAt,
  });
}
