import type { CandidateExercise } from "./CandidateExercise";
import type { CandidateRole } from "./CandidateRole";

/**
 * Candidates grouped by selection role (primary / secondary / accessory).
 */
export interface ExerciseCandidateGroup {
  readonly role: CandidateRole;
  readonly candidates: readonly CandidateExercise[];
}
