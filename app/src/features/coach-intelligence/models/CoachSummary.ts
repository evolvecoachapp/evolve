import type { AthleteGoal } from "../../athlete-context/models/AthleteGoal";
import type { TrainingExperience } from "../../athlete-context/models/TrainingExperience";
import type { ProgressStatus } from "./ProgressStatus";
import type { RecoveryStatus } from "./RecoveryStatus";
import type { TrainingTrend } from "./TrainingTrend";

/**
 * Top-level structured coach intelligence summary.
 *
 * Aggregates trend, recovery, progress, and athlete-context signals for the
 * presentation hook and Prompt Builder.
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
  /** Athlete goal from Athlete Context when available. */
  readonly athleteGoal: AthleteGoal | null;
  /** Training experience from Athlete Context when available. */
  readonly trainingExperience: TrainingExperience | null;
  /** ISO-8601 timestamp when this summary was generated. */
  readonly generatedAt: string;
}
