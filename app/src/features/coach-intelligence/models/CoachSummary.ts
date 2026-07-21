import type { ProgressStatus } from "./ProgressStatus";
import type { RecoveryStatus } from "./RecoveryStatus";
import type { TrainingTrend } from "./TrainingTrend";

/**
 * Top-level structured coach intelligence summary.
 *
 * Aggregates trend, recovery, and progress signals for the presentation hook.
 */
export interface CoachSummary {
  readonly volumeTrend: TrainingTrend;
  readonly frequencyTrend: TrainingTrend;
  readonly recovery: RecoveryStatus;
  readonly progress: ProgressStatus;
  /** Training consistency score in `[0, 1]`. */
  readonly consistencyScore: number;
  readonly insightCount: number;
  readonly riskCount: number;
  readonly recommendationCount: number;
  /** ISO-8601 timestamp when this summary was generated. */
  readonly generatedAt: string;
}
