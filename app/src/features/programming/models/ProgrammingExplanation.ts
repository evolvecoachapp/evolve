import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ProgrammingReason } from "./ProgrammingReason";
import type { ProgrammingScore } from "./ProgrammingScore";

/**
 * Machine-readable explanation for why an exercise was programmed a certain way.
 */
export interface ProgrammingExplanation {
  readonly exerciseId: string;
  readonly role: CandidateRole;
  readonly order: number;
  readonly summaryCode: string;
  readonly reasons: readonly ProgrammingReason[];
  readonly score: ProgrammingScore;
}
