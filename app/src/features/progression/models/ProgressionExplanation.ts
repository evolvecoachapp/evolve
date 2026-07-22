import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ProgressionReason } from "./ProgressionReason";
import type { ProgressionScore } from "./ProgressionScore";

/**
 * Machine-readable explanation for why an exercise was progressed a certain way.
 */
export interface ProgressionExplanation {
  readonly exerciseId: string;
  readonly role: CandidateRole;
  readonly prescriptionOrder: number;
  readonly summaryCode: string;
  readonly reasons: readonly ProgressionReason[];
  readonly score: ProgressionScore;
}
