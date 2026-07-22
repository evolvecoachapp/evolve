import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { PrescriptionIntensityMetric } from "../../programming/models/PrescriptionIntensity";
import type { ProgressionReason } from "./ProgressionReason";
import type { ProgressionScore } from "./ProgressionScore";
import type { ProgressionStep } from "./ProgressionStep";

/**
 * Multi-week progression timeline for one programmed exercise.
 */
export interface ExerciseProgression {
  readonly exerciseId: string;
  readonly prescriptionOrder: number;
  readonly role: CandidateRole;
  readonly baselineSets: number;
  readonly baselineRepMin: number;
  readonly baselineRepMax: number;
  readonly baselineIntensityMetric: PrescriptionIntensityMetric;
  readonly baselineIntensityValue: number | null;
  readonly steps: readonly ProgressionStep[];
  readonly score: ProgressionScore;
  readonly reasons: readonly ProgressionReason[];
}
