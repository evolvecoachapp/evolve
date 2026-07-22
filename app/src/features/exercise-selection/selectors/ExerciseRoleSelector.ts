import type { CandidateExercise } from "../models/CandidateExercise";
import type { CandidateRole } from "../models/CandidateRole";
import type { SelectionContext } from "../models/SelectionContext";
import type { RankableCandidate } from "../utils/rankCandidates";

/**
 * Role-focused selector. Consumes already-scored candidates and returns
 * a ranked subset for a single category.
 */
export interface ExerciseRoleSelector {
  readonly role: CandidateRole;
  select(
    scored: readonly RankableCandidate[],
    context: SelectionContext,
  ): readonly CandidateExercise[];
}
