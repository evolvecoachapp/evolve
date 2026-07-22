import type { CandidateRole } from "./CandidateRole";
import type { SelectionReason } from "./SelectionReason";
import type { SelectionScore } from "./SelectionScore";

/**
 * Structured explanation of why a candidate was selected.
 * Machine-readable codes only.
 */
export interface SelectionExplanation {
  readonly exerciseId: string;
  readonly role: CandidateRole;
  readonly summaryCode: string;
  readonly reasons: readonly SelectionReason[];
  readonly score: SelectionScore;
}
