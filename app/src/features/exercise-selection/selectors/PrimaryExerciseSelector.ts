import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionContext } from "../models/SelectionContext";
import { rankCandidates, type RankableCandidate } from "../utils/rankCandidates";
import type { ExerciseRoleSelector } from "./ExerciseRoleSelector";

/**
 * Selects primary (compound, pattern-matched) exercise candidates.
 */
export class PrimaryExerciseSelector implements ExerciseRoleSelector {
  readonly role = "primary" as const;

  select(
    scored: readonly RankableCandidate[],
    context: SelectionContext,
  ): readonly CandidateExercise[] {
    const required = new Set(context.requiredMovementPatterns);
    const pool = scored.filter((candidate) => {
      const { exercise } = candidate;
      if (!exercise.category.isCompound) {
        return false;
      }
      if (required.size === 0) {
        return true;
      }
      return required.has(exercise.movementPattern.code);
    });

    return rankCandidates(pool, this.role, context.maxCandidatesPerRole);
  }
}
