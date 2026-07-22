import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ProgressionReason } from "./ProgressionReason";
import type { ProgressionScore } from "./ProgressionScore";
import type { ProgressionTarget } from "./ProgressionTarget";
import type { ProgressionTrend } from "./ProgressionTrend";

/**
 * One week of planned progression for a single programmed exercise.
 *
 * Contains week number, exercise/prescription references, target, and trends.
 * No real performance. No fatigue. No readiness.
 */
export interface ProgressionStep {
  readonly weekNumber: number;
  readonly exerciseId: string;
  /** Reference to the source prescription order (1-based). */
  readonly prescriptionOrder: number;
  readonly role: CandidateRole;
  readonly target: ProgressionTarget;
  readonly expectedDifficultyTrend: ProgressionTrend;
  readonly expectedVolumeTrend: ProgressionTrend;
  readonly expectedIntensityTrend: ProgressionTrend;
  readonly notes: readonly string[];
  readonly score: ProgressionScore;
  readonly reasons: readonly ProgressionReason[];
}
